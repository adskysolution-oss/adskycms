import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentPartner from "@/models/recruitment/RecruitmentPartner.js";
import RecruitmentWallet from "@/models/recruitment/RecruitmentWallet.js";
import MlmPendingRegistration from "@/models/mlm/MlmPendingRegistration.js";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "adsky-nextview-secret-key-2026");

function generatePartnerCode() {
  return `RP${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(req) {
  try {
    await dbConnect();
    const { mobile, otp, companyName, gstNumber, state, district, address, pincode } = await req.json();

    const pending = await MlmPendingRegistration.findOne({ mobile, type: "recruitment_registration" });
    if (!pending) return NextResponse.json({ success: false, message: "No pending registration found." }, { status: 400 });
    if (new Date() > pending.otpExpires) return NextResponse.json({ success: false, message: "OTP expired. Please re-register." }, { status: 400 });
    if (pending.otp !== otp?.trim()) {
      pending.otpAttempts = (pending.otpAttempts || 0) + 1;
      await pending.save();
      return NextResponse.json({ success: false, message: "Invalid OTP." }, { status: 400 });
    }

    const existing = await RecruitmentPartner.findOne({ $or: [{ email: pending.email }, { mobile: pending.mobile }] }).lean();
    if (existing) { await pending.deleteOne(); return NextResponse.json({ success: false, message: "Already registered." }, { status: 400 }); }

    let partnerCode;
    let unique = false;
    while (!unique) {
      partnerCode = generatePartnerCode();
      const ex = await RecruitmentPartner.findOne({ partnerCode }).lean();
      if (!ex) unique = true;
    }

    const partner = await RecruitmentPartner.create({
      partnerCode,
      companyName: companyName || pending.fullName,
      contactPerson: pending.fullName,
      email: pending.email,
      mobile: pending.mobile,
      password: pending.password,
      gstNumber: gstNumber || null,
      state: state || pending.state,
      district: district || pending.district,
      address: address || pending.address,
      pincode: pincode || pending.pincode,
      status: "pending_approval",
    });

    await RecruitmentWallet.create({ partnerId: partner._id, partnerCode: partner.partnerCode });
    await pending.deleteOne();

    const tokenPayload = { id: partner._id.toString(), partnerCode: partner.partnerCode, role: "recruitment_partner", email: partner.email };

    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });

    return NextResponse.json({ success: true, message: "Registration successful! Your account is pending admin approval.", partner: { id: partner._id, partnerCode: partner.partnerCode, companyName: partner.companyName, status: partner.status } });
  } catch (error) {
    console.error("[Recruitment Verify OTP]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
