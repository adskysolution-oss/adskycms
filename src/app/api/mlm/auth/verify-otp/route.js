import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmPendingRegistration from "@/models/mlm/MlmPendingRegistration.js";
import MlmSponsorHistory from "@/models/mlm/MlmSponsorHistory.js";
import MlmWallet from "@/models/mlm/MlmWallet.js";
import MlmPlatformFeeConfig from "@/models/mlm/MlmPlatformFeeConfig.js";
import { placeInMatrix } from "@/lib/mlm/matrixEngine.js";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "adsky-nextview-secret-key-2026");

function generateMLMCode() {
  const prefix = "NEX";
  const numPart = Date.now().toString().slice(-6);
  const randomPart = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${prefix}-${numPart}-${randomPart}`;
}

function generateReferralToken() {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { mobile, email, otp } = body;

    if ((!mobile && !email) || !otp) {
      return NextResponse.json({ success: false, message: "Mobile/Email and OTP are required." }, { status: 400 });
    }

    const pending = await MlmPendingRegistration.findOne({
      $or: [
        ...(mobile ? [{ mobile: mobile.trim() }] : []),
        ...(email ? [{ email: email.trim().toLowerCase() }] : []),
      ]
    });

    if (!pending) {
      return NextResponse.json({ success: false, message: "No pending registration found." }, { status: 400 });
    }

    if (new Date() > pending.otpExpires) {
      return NextResponse.json({ success: false, message: "OTP has expired. Please request a new OTP." }, { status: 400 });
    }

    if (pending.otp !== otp.trim()) {
      pending.otpAttempts = (pending.otpAttempts || 0) + 1;
      await pending.save();
      if (pending.otpAttempts >= 5) {
        await pending.deleteOne();
        return NextResponse.json({ success: false, message: "Too many failed attempts. Please re-register." }, { status: 400 });
      }
      return NextResponse.json({ success: false, message: "Invalid OTP. Please check and try again." }, { status: 400 });
    }

    // Final duplicate check
    const existingMember = await MlmMember.findOne({
      $or: [
        { mobile: pending.mobile },
        ...(pending.email ? [{ email: pending.email }] : [])
      ]
    }).lean();

    if (existingMember) {
      await pending.deleteOne();
      return NextResponse.json({ success: false, message: "Mobile or Email already registered." }, { status: 400 });
    }

    // Find sponsor (match by code or referral token)
    let sponsorMember = null;
    if (pending.sponsorCode) {
      sponsorMember = await MlmMember.findOne({
        $or: [
          { mlmCode: pending.sponsorCode.trim().toUpperCase() },
          { referralToken: pending.sponsorCode.trim() }
        ]
      });
    }

    // Generate unique MLM code and referral token
    let mlmCode, referralToken;
    let codeUnique = false;
    while (!codeUnique) {
      mlmCode = generateMLMCode();
      const exists = await MlmMember.findOne({ mlmCode }).lean();
      if (!exists) codeUnique = true;
    }
    referralToken = generateReferralToken();

    // Get active platform fee config
    let feeConfig = null;
    try {
      feeConfig = await MlmPlatformFeeConfig.findOne({ isActive: true }).sort({ version: -1 }).lean();
    } catch (e) {
      console.warn("Could not load fee config:", e.message);
    }

    const memberUserId = new mongoose.Types.ObjectId();

    // 1. Also sync to users collection (compatible with SakhiHub architecture)
    try {
      await mongoose.connection.db.collection('users').insertOne({
        _id: memberUserId,
        fullName: pending.fullName,
        name: pending.fullName,
        mobile: pending.mobile,
        email: pending.email || `${pending.mobile}@nextview.network`,
        password: pending.password,
        role: 'mlm_member',
        mlmCode,
        mlmSponsorCode: sponsorMember?.mlmCode || null,
        pincode: pending.pincode,
        state: pending.state,
        district: pending.district,
        block: pending.block,
        address: pending.address,
        status: 'pending',
        accessStatus: 'unlocked',
        onboardingCompleted: false,
        dashboardAccess: false,
        paymentCompleted: false,
        membershipType: 'free',
        isVerified: true,
        verificationMethod: pending.verificationMethod || 'MOBILE',
        mobileVerified: pending.verificationMethod === 'MOBILE',
        emailVerified: pending.verificationMethod === 'EMAIL',
        permissions: [
          'mlm.view',
          'mlm.matrix.view',
          'mlm.fd.view',
          'mlm.rewards.view',
          'mlm.wallet.view',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (userErr) {
      console.warn("Could not insert user into users collection:", userErr.message);
    }

    // 2. Create MlmMember
    const newMember = await MlmMember.create({
      userId: memberUserId,
      mlmCode,
      fullName: pending.fullName,
      mobile: pending.mobile,
      email: pending.email,
      password: pending.password, // hashed password
      pincode: pending.pincode,
      state: pending.state,
      district: pending.district,
      city: pending.city,
      block: pending.block,
      address: pending.address,
      sponsorId: sponsorMember?._id || null,
      sponsorCode: sponsorMember?.mlmCode || null,
      kycStatus: "PENDING",
      platformFeePaid: false,
      platformFeeAmount: feeConfig?.totalAmount ?? 0,
      platformFeeConfigVersion: feeConfig?.version,
      status: "PENDING_KYC",
      referralToken,
    });

    // 3. Create wallet with both userId and memberId
    await MlmWallet.create({
      userId: memberUserId,
      memberId: newMember._id,
      balance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
      totalWithdrawn: 0,
    });

    // 4. Record sponsor history
    if (sponsorMember) {
      try {
        await MlmSponsorHistory.create({
          sponsorId: sponsorMember._id,
          memberId: newMember._id,
        });
      } catch (shErr) {
        console.warn("Sponsor history warning:", shErr.message);
      }
    }

    // 5. Place in matrix
    try {
      await placeInMatrix(newMember._id, memberUserId, memberUserId, "MEMBER");
    } catch (matrixError) {
      console.error("[MLM Matrix Placement Error]", matrixError);
    }

    // 6. Delete pending registration
    await pending.deleteOne();

    // 7. Issue JWT token
    const tokenPayload = {
      id: newMember._id.toString(),
      userId: memberUserId.toString(),
      mlmCode: newMember.mlmCode,
      role: "mlm_member",
      fullName: newMember.fullName,
      mobile: newMember.mobile,
      email: newMember.email,
    };

    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    cookieStore.set("mlm_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful! Welcome to NextView Network.",
      token,
      member: {
        id: newMember._id,
        userId: memberUserId,
        mlmCode: newMember.mlmCode,
        fullName: newMember.fullName,
        mobile: newMember.mobile,
        email: newMember.email,
        status: newMember.status,
        kycStatus: newMember.kycStatus,
        platformFeePaid: newMember.platformFeePaid,
        referralToken: newMember.referralToken,
      },
      redirectUrl: "/nextview/onboarding",
    });
  } catch (error) {
    console.error("[MLM Verify OTP]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
