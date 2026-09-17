import MlmKyc from "@/models/mlm/MlmKyc.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmAuditLog from "@/models/mlm/MlmAuditLog.js";
import MlmNotification from "@/models/mlm/MlmNotification.js";
import { activateEligibleMember } from "@/lib/mlm/memberActivation.js";
import { maskPan, maskAadhaar } from "@/lib/verification/masking.js";
import { getRequestMeta } from "@/lib/moduleAuth.js";

/**
 * Atomic and idempotent KYC verification state transition.
 * 
 * Rules:
 * 1. Requires both PAN and Aadhaar to be successfully verified.
 * 2. Only the single winning request that transitions status from NOT VERIFIED -> VERIFIED
 *    executes downstream side effects (activation check, audit log, notification).
 * 3. Does NOT activate a member directly if platform fee is unpaid (sets PENDING_PAYMENT).
 * 4. If platform fee was already paid, delegates to authoritative `activateEligibleMember`.
 * 
 * @param {Object} params
 * @param {string} params.kycId
 * @param {string} params.memberId
 * @param {string} [params.source='AUTOMATIC_APITXT']
 * @param {Request} [params.req=null]
 * @returns {Promise<{ success: boolean, newlyVerified: boolean, alreadyVerified: boolean, kyc: Object }>}
 */
export async function atomicCheckAndApproveKyc({ kycId, memberId, source = "AUTOMATIC_APITXT", req = null }) {
  const currentKyc = await MlmKyc.findById(kycId);
  if (!currentKyc) {
    return { success: false, newlyVerified: false, alreadyVerified: false, message: "KYC document not found" };
  }

  const hasBankDetails = Boolean(
    (currentKyc.bankAccountNumber?.trim() || currentKyc.bankDetails?.accountNumber?.trim()) &&
    (currentKyc.bankIfscCode?.trim() || currentKyc.bankDetails?.ifscCode?.trim())
  );

  // If already verified AND has valid bank details, return safely without re-triggering side effects
  if (currentKyc.status === "VERIFIED" && hasBankDetails) {
    return { success: true, newlyVerified: false, alreadyVerified: true, kyc: currentKyc };
  }

  const isPanVerified = currentKyc.panVerification?.verified === true;
  const isAadhaarVerified = currentKyc.aadhaarVerification?.verified === true;

  // PAN, Aadhaar, and Bank Details must ALL be complete before KYC can be approved
  if (!isPanVerified || !isAadhaarVerified || !hasBankDetails) {
    return {
      success: true,
      newlyVerified: false,
      alreadyVerified: false,
      kyc: currentKyc,
      pending: !isPanVerified ? "PAN" : !isAadhaarVerified ? "AADHAAR" : "BANK_DETAILS",
    };
  }

  const now = new Date();
  const maskedP = maskPan(currentKyc.panNumber);
  const maskedA = maskAadhaar(currentKyc.aadhaarNumber);

  // Atomic state transition: will ONLY match if status is NOT yet VERIFIED and bank details exist
  const updatedKyc = await MlmKyc.findOneAndUpdate(
    {
      _id: kycId,
      status: { $ne: "VERIFIED" },
      "panVerification.verified": true,
      "aadhaarVerification.verified": true,
      $or: [
        { bankAccountNumber: { $exists: true, $ne: "" } },
        { "bankDetails.accountNumber": { $exists: true, $ne: "" } },
      ],
    },
    {
      $set: {
        status: "VERIFIED",
        verifiedAt: now,
        verifiedBy: source === "AUTOMATIC_APITXT" ? "APITXT_AUTO" : "ADMIN_MANUAL",
        verificationSource: source,
        adminRemarks: source === "AUTOMATIC_APITXT" ? "Auto-verified via APITXT (PAN + Aadhaar + Bank)" : undefined,
      },
      $push: {
        verificationHistory: {
          verificationType: "OVERALL_KYC",
          source,
          status: "VERIFIED",
          provider: "APITXT",
          maskedIdentifier: `${maskedP} | ${maskedA}`,
          remarks: "Automatic KYC verification completed successfully with bank details.",
          performedBy: source === "AUTOMATIC_APITXT" ? "APITXT_SYSTEM" : "ADMIN",
          performedByRole: source === "AUTOMATIC_APITXT" ? "system" : "admin",
          timestamp: now,
        },
      },
    },
    { returnDocument: 'after' }
  );

  // If null, another concurrent request already completed the transition
  if (!updatedKyc) {
    const fresh = await MlmKyc.findById(kycId);
    return { success: true, newlyVerified: false, alreadyVerified: true, kyc: fresh };
  }

  // ── IDEMPOTENT DOWNSTREAM SIDE EFFECTS (Executed strictly once by the transition winner) ──
  const member = await MlmMember.findById(memberId);
  if (member) {
    member.kycStatus = "VERIFIED";
    if (!member.platformFeePaid) {
      // Unpaid platform fee -> PENDING_PAYMENT (NEVER activate directly from KYC)
      member.status = "PENDING_PAYMENT";
    }
    await member.save();

    // If platform fee was already paid, delegate to authoritative activation
    if (member.platformFeePaid) {
      await activateEligibleMember({
        memberId: member._id,
        source: "kyc_auto_verified",
        req,
      });
    }
  }

  const reqMeta = req ? getRequestMeta(req) : { ip: "", userAgent: "" };
  const idempotencyKey = `KYC_AUTO_APPROVED:${kycId}`;

  // Audit event guarded by idempotencyKey
  const existingAudit = await MlmAuditLog.findOne({ "details.idempotencyKey": idempotencyKey }).lean();
  if (!existingAudit) {
    await MlmAuditLog.create({
      action: "KYC_AUTO_APPROVED",
      performedBy: member?.userId || member?._id,
      performedByRole: "system",
      performedByName: "APITXT Verification Engine",
      targetId: updatedKyc._id,
      targetModel: "MlmKyc",
      newValue: {
        status: "VERIFIED",
        panStatus: "VERIFIED",
        aadhaarStatus: "VERIFIED",
        source,
      },
      details: {
        idempotencyKey,
        maskedPan: maskedP,
        maskedAadhaar: maskedA,
        timestamp: now,
      },
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
    });
  }

  // Single member notification
  const existingNotif = await MlmNotification.findOne({ memberId, type: "KYC_AUTO_APPROVED" }).lean();
  if (!existingNotif) {
    await MlmNotification.create({
      memberId,
      type: "KYC_AUTO_APPROVED",
      title: "KYC Verified Successfully",
      message: "Your PAN and Aadhaar have been automatically verified. Please proceed to platform activation.",
      data: { kycId: updatedKyc._id },
    });
  }

  return { success: true, newlyVerified: true, alreadyVerified: false, kyc: updatedKyc };
}
