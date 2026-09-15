import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmKyc from "@/models/mlm/MlmKyc.js";
import MlmAuditLog from "@/models/mlm/MlmAuditLog.js";
import { requireModuleAuth, getRequestMeta } from "@/lib/moduleAuth.js";
import { sendAadhaarOtp } from "@/lib/verification/apitxt.js";
import { maskAadhaar } from "@/lib/verification/masking.js";
import { checkRateLimit } from "@/lib/rateLimit.js";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    // 1. Resolve authenticated member
    const member = await MlmMember.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(auth.payload.id)
          ? [{ _id: new mongoose.Types.ObjectId(auth.payload.id) }, { userId: new mongoose.Types.ObjectId(auth.payload.id) }]
          : []),
      ],
    });

    if (!member) {
      return NextResponse.json({ success: false, message: "Member profile not found." }, { status: 404 });
    }

    // 2. Production-Safe Rate Limiting: 3 OTP sends per 10 minutes
    const rateCheck = await checkRateLimit({
      key: `mlm_aadhaar_send:${member._id}`,
      limit: 3,
      windowSeconds: 600,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          rateLimited: true,
          message: rateCheck.message,
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    // 3. Parse input
    const body = await req.json().catch(() => ({}));
    const cleanAadhaar = String(body.aadhaarNumber || body.aadhaar || "").trim().replace(/\D/g, "");

    if (cleanAadhaar.length !== 12) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid 12-digit Aadhaar number." },
        { status: 400 }
      );
    }

    // 4. Resolve or create KYC record
    let kyc = await MlmKyc.findOne({ memberId: member._id });
    if (!kyc) {
      kyc = await MlmKyc.create({
        memberId: member._id,
        userId: member.userId,
        mlmCode: member.mlmCode,
        fullName: member.fullName,
        aadhaarNumber: cleanAadhaar,
        status: "PENDING",
      });
      await MlmMember.findByIdAndUpdate(member._id, { kycId: kyc._id });
    }

    // If Aadhaar is already verified, do not send OTP again
    if (kyc.aadhaarVerification?.verified === true && kyc.aadhaarNumber === cleanAadhaar) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Aadhaar is already verified.",
        aadhaarVerification: {
          status: "VERIFIED",
          verified: true,
          maskedAadhaar: maskAadhaar(kyc.aadhaarNumber),
          verifiedAt: kyc.aadhaarVerification.verifiedAt,
        },
      });
    }

    // 5. Invalidate previous session on resend
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // 6. Call APITXT Send OTP (strictly un-guessed)
    const otpResult = await sendAadhaarOtp({ aadhaarNumber: cleanAadhaar });

    if (!otpResult.success) {
      return NextResponse.json(
        {
          success: false,
          status: otpResult.status,
          message: otpResult.message,
        },
        { status: otpResult.status === "ENDPOINT_UNCONFIGURED" ? 503 : 400 }
      );
    }

    // 7. Store new session securely server-side (NEVER return referenceId to client)
    kyc.aadhaarNumber = cleanAadhaar;
    kyc.aadhaarVerification = {
      status: "OTP_SENT",
      verified: false,
      verificationSource: "AUTOMATIC_APITXT",
      referenceId: otpResult.referenceId,
      referenceIdExpiresAt: expiryDate,
      otpSentAt: now,
      otpAttempts: 0,
      provider: "APITXT",
      requestId: otpResult.requestId || "",
      providerMessage: otpResult.message || "",
    };

    const maskedA = maskAadhaar(cleanAadhaar);

    // Append to verification history
    kyc.verificationHistory.push({
      verificationType: "AADHAAR",
      source: "AUTOMATIC_APITXT",
      status: "OTP_SENT",
      provider: "APITXT",
      requestId: otpResult.requestId || "",
      maskedIdentifier: maskedA,
      remarks: "Aadhaar OTP requested",
      performedBy: member.mlmCode,
      performedByRole: "mlm_member",
      timestamp: now,
    });

    await kyc.save();

    // Audit log
    const reqMeta = getRequestMeta(req);
    await MlmAuditLog.create({
      action: "KYC_AADHAAR_OTP_SENT",
      performedBy: member.userId || member._id,
      performedByRole: "mlm_member",
      performedByName: member.fullName,
      targetId: kyc._id,
      targetModel: "MlmKyc",
      newValue: {
        status: "OTP_SENT",
        maskedAadhaar: maskedA,
      },
      details: {
        provider: "APITXT",
        requestId: otpResult.requestId,
      },
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
    });

    return NextResponse.json({
      success: true,
      status: "OTP_SENT",
      message: "OTP has been sent to your Aadhaar-registered mobile number.",
      maskedAadhaar: maskedA,
      expiresInSeconds: 600,
    });
  } catch (error) {
    console.error("[Aadhaar Send OTP Error]", error);
    if (error.message?.includes("CONFIG_ERROR")) {
      return NextResponse.json(
        {
          success: false,
          code: "PROVIDER_CONFIG_ERROR",
          message: "Aadhaar verification service is temporarily unconfigured. Please ensure APITXT credentials are set.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send Aadhaar OTP." },
      { status: 500 }
    );
  }
}
