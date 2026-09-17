import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmKyc from "@/models/mlm/MlmKyc.js";
import MlmAuditLog from "@/models/mlm/MlmAuditLog.js";
import MlmNotification from "@/models/mlm/MlmNotification.js";
import { requireModuleAuth, getRequestMeta } from "@/lib/moduleAuth.js";
import { verifyAadhaarOtp } from "@/lib/verification/apitxt.js";
import { maskAadhaar } from "@/lib/verification/masking.js";
import { atomicCheckAndApproveKyc } from "@/lib/verification/kycTransition.js";
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

    // 2. Parse input
    const body = await req.json().catch(() => ({}));
    const rawOtp = String(body.otp || "").trim().replace(/\D/g, "");

    if (rawOtp.length !== 6) {
      return NextResponse.json(
        { success: false, message: "Please provide the exact 6-digit OTP." },
        { status: 400 }
      );
    }

    // 3. Resolve KYC record
    const kyc = await MlmKyc.findOne({ memberId: member._id });
    if (!kyc || !kyc.aadhaarVerification?.referenceId) {
      return NextResponse.json(
        { success: false, message: "No active Aadhaar OTP session found. Please click 'Send OTP' first." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiry = kyc.aadhaarVerification.referenceIdExpiresAt ? new Date(kyc.aadhaarVerification.referenceIdExpiresAt) : null;

    // 4. Session Expiry Check: Never call APITXT after local session expires
    if (!expiry || now > expiry) {
      await MlmKyc.findByIdAndUpdate(kyc._id, {
        $unset: { "aadhaarVerification.referenceId": 1, "aadhaarVerification.referenceIdExpiresAt": 1 },
        $set: {
          "aadhaarVerification.status": "FAILED",
          "aadhaarVerification.providerMessage": "OTP session expired. Please request a new OTP.",
        },
      });

      return NextResponse.json(
        {
          success: false,
          sessionExpired: true,
          message: "Aadhaar verification session has expired. Please request a new OTP.",
        },
        { status: 410 }
      );
    }

    // 5. Production-Safe Atomic OTP Attempt Counter (Max 5 attempts)
    const updatedKyc = await MlmKyc.findOneAndUpdate(
      {
        _id: kyc._id,
        "aadhaarVerification.referenceId": { $exists: true, $ne: null },
        "aadhaarVerification.referenceIdExpiresAt": { $gt: now },
        "aadhaarVerification.otpAttempts": { $lt: 5 },
      },
      {
        $inc: { "aadhaarVerification.otpAttempts": 1 },
      },
      { returnDocument: 'after' }
    );

    if (!updatedKyc) {
      // Re-query to check if attempts exceeded
      const freshKyc = await MlmKyc.findById(kyc._id);
      if ((freshKyc?.aadhaarVerification?.otpAttempts || 0) >= 5) {
        await MlmKyc.findByIdAndUpdate(kyc._id, {
          $unset: { "aadhaarVerification.referenceId": 1 },
          $set: {
            "aadhaarVerification.status": "FAILED",
            "aadhaarVerification.providerMessage": "Maximum OTP verification attempts exceeded (5/5).",
          },
        });

        return NextResponse.json(
          {
            success: false,
            attemptsExceeded: true,
            message: "Maximum OTP verification attempts exceeded (5/5). Session invalidated. Please request a new OTP.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Aadhaar verification session is invalid or expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    const currentAttempts = updatedKyc.aadhaarVerification.otpAttempts;
    const sessionRefId = updatedKyc.aadhaarVerification.referenceId;

    // 6. Call APITXT Verify OTP API
    const verifyResult = await verifyAadhaarOtp({
      referenceId: sessionRefId,
      otp: rawOtp,
    });

    const maskedA = maskAadhaar(updatedKyc.aadhaarNumber);
    const reqMeta = getRequestMeta(req);

    if (!verifyResult.verified) {
      // Record failed attempt
      await MlmAuditLog.create({
        action: "KYC_AADHAAR_FAILED",
        performedBy: member.userId || member._id,
        performedByRole: "mlm_member",
        performedByName: member.fullName,
        targetId: updatedKyc._id,
        targetModel: "MlmKyc",
        newValue: {
          status: "FAILED",
          maskedAadhaar: maskedA,
          attempt: currentAttempts,
        },
        details: {
          provider: "APITXT",
          message: verifyResult.message,
        },
        ip: reqMeta.ip,
        userAgent: reqMeta.userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          verified: false,
          status: "FAILED",
          attemptsUsed: currentAttempts,
          attemptsRemaining: Math.max(0, 5 - currentAttempts),
          message: verifyResult.message || "Aadhaar OTP verification failed.",
        },
        { status: 400 }
      );
    }

    // 7. Aadhaar Verification Success: Update subdocument and clear referenceId
    const aadhaarSubdoc = {
      status: "VERIFIED",
      verified: true,
      verificationSource: "AUTOMATIC_APITXT",
      referenceId: null,
      referenceIdExpiresAt: null,
      verifiedAt: now,
      provider: "APITXT",
      requestId: verifyResult.requestId || "",
      providerMessage: verifyResult.message || "Aadhaar verified successfully",
      verifiedName: verifyResult.verifiedName || "",
      otpAttempts: currentAttempts,
    };

    updatedKyc.aadhaarVerification = aadhaarSubdoc;

    // Append to verification history
    updatedKyc.verificationHistory.push({
      verificationType: "AADHAAR",
      source: "AUTOMATIC_APITXT",
      status: "VERIFIED",
      provider: "APITXT",
      requestId: verifyResult.requestId || "",
      maskedIdentifier: maskedA,
      remarks: "Aadhaar verified successfully via OTP",
      performedBy: member.mlmCode,
      performedByRole: "mlm_member",
      timestamp: now,
    });

    await updatedKyc.save();

    // Audit log
    await MlmAuditLog.create({
      action: "KYC_AADHAAR_VERIFIED",
      performedBy: member.userId || member._id,
      performedByRole: "mlm_member",
      performedByName: member.fullName,
      targetId: updatedKyc._id,
      targetModel: "MlmKyc",
      newValue: {
        status: "VERIFIED",
        maskedAadhaar: maskedA,
      },
      details: {
        provider: "APITXT",
        requestId: verifyResult.requestId,
      },
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
    });

    // Send member notification
    await MlmNotification.create({
      memberId: member._id,
      type: "KYC_AADHAAR_VERIFIED",
      title: "Aadhaar Verified",
      message: `Your Aadhaar (${maskedA}) has been verified successfully.`,
    });

    // 8. Atomic KYC Approval Check
    const transition = await atomicCheckAndApproveKyc({
      kycId: updatedKyc._id,
      memberId: member._id,
      source: "AUTOMATIC_APITXT",
      req,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      message: (transition.newlyVerified || transition.alreadyVerified)
        ? "Aadhaar and KYC verified successfully!"
        : "Aadhaar verified successfully! Please enter your bank details below.",
      aadhaarVerification: {
        status: "VERIFIED",
        verified: true,
        maskedAadhaar: maskedA,
        verifiedAt: now,
      },
      kycStatus: transition.kyc.status,
      pending: transition.pending || null,
    });
  } catch (error) {
    console.error("[Aadhaar Verify OTP Error]", error);
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
      { success: false, message: error.message || "Failed to verify Aadhaar OTP." },
      { status: 500 }
    );
  }
}
