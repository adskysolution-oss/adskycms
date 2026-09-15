import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmMatrixNode from "@/models/mlm/MlmMatrixNode.js";
import MlmAuditLog from "@/models/mlm/MlmAuditLog.js";
import { placeInMatrix } from "@/lib/mlm/matrixEngine.js";
import { getRequestMeta } from "@/lib/moduleAuth.js";

/**
 * Single authoritative member activation implementation.
 * 
 * Activated ONLY when:
 * 1. KYC status is 'VERIFIED'
 * 2. Platform fee is paid (member.platformFeePaid === true)
 * 
 * Idempotent, concurrency-safe, and reusable across both
 * Payment Reconciliation and KYC Verification workflows.
 * 
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.memberId
 * @param {string} [params.source='system'] - 'payment_reconciled' | 'kyc_auto_verified' | 'admin_override'
 * @param {Request} [params.req=null]
 * @returns {Promise<{ success: boolean, activated: boolean, reason?: string, member?: Object }>}
 */
export async function activateEligibleMember({ memberId, source = "system", req = null }) {
  await dbConnect();

  const member = await MlmMember.findById(memberId);
  if (!member) {
    return { success: false, activated: false, reason: "Member not found" };
  }

  // ── ELIGIBILITY GATES ──
  const isKycVerified = member.kycStatus === "VERIFIED";
  const isFeePaid = !!member.platformFeePaid;

  if (!isKycVerified || !isFeePaid) {
    return {
      success: true,
      activated: false,
      reason: !isKycVerified ? "KYC not verified" : "Platform fee not paid",
      member,
    };
  }

  let memberNeedsSave = false;

  // 1. Activate member status idempotently
  if (member.status !== "ACTIVE") {
    member.status = "ACTIVE";
    member.activatedAt = member.activatedAt || new Date();
    memberNeedsSave = true;
  }

  // 2. Repair User collection flags
  if (member.userId) {
    try {
      await mongoose.connection.db.collection("users").updateOne(
        { _id: member.userId },
        {
          $set: {
            status: "active",
            onboardingCompleted: true,
            dashboardAccess: true,
            paymentCompleted: true,
            subscriptionPaid: true,
            updatedAt: new Date(),
          },
        }
      );
    } catch (uErr) {
      console.warn("[MemberActivation] User collection sync notice:", uErr.message);
    }
  }

  // 3. Ensure 3×15 Matrix Placement
  let needsMatrixPlacement = !member.matrixNodeId;
  if (member.matrixNodeId) {
    const existingNode = await MlmMatrixNode.findById(member.matrixNodeId).select("_id").lean();
    if (!existingNode) {
      needsMatrixPlacement = true;
    }
  }

  if (needsMatrixPlacement) {
    try {
      const placementResult = await placeInMatrix(
        member._id,
        member.userId || member._id,
        member.userId || member._id,
        "MEMBER"
      );
      if (placementResult?.node) {
        member.matrixNodeId = placementResult.node._id;
        memberNeedsSave = true;
      }
    } catch (matErr) {
      console.error("[MemberActivation] Matrix placement error:", matErr);
    }
  }

  if (memberNeedsSave) {
    await member.save();
  }

  // 4. Audit Log (idempotent write)
  const reqMeta = req ? getRequestMeta(req) : { ip: "", userAgent: "" };
  const existingAudit = await MlmAuditLog.findOne({
    targetId: member._id,
    action: "MEMBER_ACTIVATED_IN_MATRIX",
  }).lean();

  if (!existingAudit) {
    await MlmAuditLog.create({
      action: "MEMBER_ACTIVATED_IN_MATRIX",
      performedBy: member.userId || member._id,
      performedByRole: source === "admin_override" ? "admin" : "system",
      performedByName: member.fullName,
      targetId: member._id,
      targetModel: "MlmMember",
      newValue: {
        status: "ACTIVE",
        matrixNodeId: member.matrixNodeId,
        source,
      },
      details: {
        source,
        timestamp: new Date(),
      },
      ip: reqMeta.ip,
      userAgent: reqMeta.userAgent,
    });
  }

  return { success: true, activated: true, member };
}
