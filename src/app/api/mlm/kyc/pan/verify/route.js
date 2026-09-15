import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmKyc from "@/models/mlm/MlmKyc.js";
import MlmAuditLog from "@/models/mlm/MlmAuditLog.js";
import MlmNotification from "@/models/mlm/MlmNotification.js";
import { requireModuleAuth, getRequestMeta } from "@/lib/moduleAuth.js";
import { verifyPan } from "@/lib/verification/apitxt.js";
import { maskPan } from "@/lib/verification/masking.js";
import { checkRateLimit } from "@/lib/rateLimit.js";
import { atomicCheckAndApproveKyc } from "@/lib/verification/kycTransition.js";
import { normalizeDob } from "@/lib/verification/dobHelper.js";
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

    // 2. Production-Safe Rate Limiting: 5 attempts per 15 minutes
    const rateCheck = await checkRateLimit({
      key: `mlm_pan_verify:${member._id}`,
      limit: 5,
      windowSeconds: 900,
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
    const rawPan = (body.pan || body.panNumber || "").trim().toUpperCase();
    const rawName = (body.name || body.fullName || member.fullName || "").trim();
    const rawDob = normalizeDob(body.dob || "");

    if (!rawPan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(rawPan)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid 10-character PAN number (e.g. ABCDE1234F)." },
        { status: 400 }
      );
    }

    if (!rawName) {
      return NextResponse.json(
        { success: false, message: "Name as per PAN is required." },
        { status: 400 }
      );
    }

    if (!rawDob || !/^\d{2}\/\d{2}\/\d{4}$/.test(rawDob)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid Date of Birth (DD/MM/YYYY)." },
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
        fullName: rawName,
        panNumber: rawPan,
        dob: rawDob,
        status: "PENDING",
      });
      await MlmMember.findByIdAndUpdate(member._id, { kycId: kyc._id });
    }

    // If PAN is already verified, do not call APITXT unnecessarily
    if (kyc.panVerification?.verified === true && kyc.panNumber === rawPan) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "PAN is already verified.",
        panVerification: {
          status: "VERIFIED",
          verified: true,
          maskedPan: maskPan(kyc.panNumber),
          verifiedAt: kyc.panVerification.verifiedAt,
        },
      });
    }

    // 5. Server-to-server call to APITXT PAN API
    const panResult = await verifyPan({
      pan: rawPan,
      name: rawName,
      dob: rawDob,
    });

    const now = new Date();
    const maskedP = maskPan(rawPan);
    const reqMeta = getRequestMeta(req);

    const panSubdoc = {
      status: panResult.verified ? "VERIFIED" : panResult.isMismatch ? "MISMATCH" : "FAILED",
      verified: !!panResult.verified,
      verificationSource: "AUTOMATIC_APITXT",
      nameMatch: panResult.nameMatch ?? null,
      dobMatch: panResult.dobMatch ?? null,
      category: panResult.category || "",
      aadhaarSeedingStatus: panResult.aadhaarSeedingStatus || "",
      verifiedAt: panResult.verified ? now : null,
      provider: "APITXT",
      requestId: panResult.requestId || "",
      providerMessage: panResult.message || "",
    };

    // Update KYC document
    kyc.panNumber = rawPan;
    kyc.dob = rawDob;
    kyc.panVerification = panSubdoc;

    // Append to immutable verification history
    kyc.verificationHistory.push({
      verificationType: "PAN",
      source: "AUTOMATIC_APITXT",
      status: panSubdoc.status,
      provider: "APITXT",
      requestId: panResult.requestId || "",
      maskedIdentifier: maskedP,
      remarks: panResult.message || (panResult.verified ? "PAN verified successfully" : "PAN verification failed"),
      performedBy: member.mlmCode,
      performedByRole: "mlm_member",
      timestamp: now,
    });

    await kyc.save();

    // Audit log (never log full PAN)
    await MlmAuditLog.create({
      action: panResult.verified ? "KYC_PAN_VERIFIED" : "KYC_PAN_FAILED",
      performedBy: member.userId || member._id,
      performedByRole: "mlm_member",
      performedByName: member.fullName,
      targetId: kyc._id,
      targetModel: "MlmKyc",
      newValue: {
        status: panSubdoc.status,
        nameMatch: panSubdoc.nameMatch,
        dobMatch: panSubdoc.dobMatch,
        maskedPan: maskedP,
      },
      details: {
        provider: "APITXT",
        requestId: panResult.requestId,
        message: panResult.message,
      },
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
    });

    // Send notification on PAN verification
    if (panResult.verified) {
      await MlmNotification.create({
        memberId: member._id,
        type: "KYC_PAN_VERIFIED",
        title: "PAN Verified",
        message: `Your PAN (${maskedP}) has been verified successfully.`,
      });

      // 6. Check if both documents are now verified for atomic KYC approval
      const transition = await atomicCheckAndApproveKyc({
        kycId: kyc._id,
        memberId: member._id,
        source: "AUTOMATIC_APITXT",
        req,
      });

      return NextResponse.json({
        success: true,
        verified: true,
        status: "VERIFIED",
        message: panResult.message || "PAN verified successfully.",
        panVerification: {
          status: "VERIFIED",
          verified: true,
          maskedPan: maskedP,
          nameMatch: panSubdoc.nameMatch,
          dobMatch: panSubdoc.dobMatch,
          verifiedAt: now,
        },
        kycStatus: transition.kyc.status,
      });
    }

    // If mismatch or failed
    return NextResponse.json({
      success: false,
      verified: false,
      isMismatch: !!panResult.isMismatch,
      status: panSubdoc.status,
      message: panResult.message,
      panVerification: {
        status: panSubdoc.status,
        verified: false,
        maskedPan: maskedP,
        nameMatch: panSubdoc.nameMatch,
        dobMatch: panSubdoc.dobMatch,
      },
    });
  } catch (error) {
    console.error("[PAN Verify Route Error]", error);
    if (error.message?.includes("CONFIG_ERROR")) {
      return NextResponse.json(
        {
          success: false,
          code: "PROVIDER_CONFIG_ERROR",
          message: "KYC verification service is temporarily unconfigured. Please ensure APITXT_AUTH_KEY is set.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify PAN." },
      { status: 500 }
    );
  }
}
