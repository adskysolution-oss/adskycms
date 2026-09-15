import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect.js';
import MlmMember from '@/models/mlm/MlmMember.js';
import PaymentTransaction from '@/models/PaymentTransaction.js';
import MlmMatrixNode from '@/models/mlm/MlmMatrixNode.js';
import MlmAuditLog from '@/models/mlm/MlmAuditLog.js';
import { placeInMatrix } from '@/lib/mlm/matrixEngine.js';
import { getCashfreeOrderStatus } from '@/lib/cashfree.js';
import { getRequestMeta } from '@/lib/moduleAuth.js';
import { activateEligibleMember } from '@/lib/mlm/memberActivation.js';

/**
 * Centralized, idempotent, state-repair payment reconciler for NextView/MLM platform fees.
 * 
 * Safe against partial failures:
 * Rather than returning early on member.status === 'ACTIVE', it checks each
 * post-payment requirement independently and repairs any missing state:
 *   1. PaymentTransaction -> completed/paid
 *   2. MlmMember -> ACTIVE + platformFeePaid=true
 *   3. User -> active + onboarding/payment flags
 *   4. MatrixNode -> placed in 3×15 ternary tree
 *   5. AuditLog -> recorded
 * 
 * Does NOT generate FD or wallet rewards (FD rewards only trigger on verified FD card applications).
 *
 * @param {Object} params
 * @param {Object|string} [params.member] - MlmMember document or object
 * @param {string} [params.memberId] - MlmMember ID or userId
 * @param {Object|string} [params.txnOrOrderId] - PaymentTransaction doc, ID, or Cashfree orderId
 * @param {Object} [params.cfOrderData] - Cashfree order payload if already fetched
 * @param {string} [params.source] - 'webhook' | 'verify_payment' | 'check_status' | 'get_auto_sync' | 'admin_sync'
 * @param {Request} [params.req] - Incoming HTTP request for meta logging (ip, user-agent)
 */
export async function reconcilePayment(args, p2, p3, p4, p5) {
  // Support both object arguments { member, txnOrOrderId, ... } and positional (member, txnOrOrderId, cfOrderData, source, req)
  let memberInput, memberIdInput, txnOrOrderId, cfOrderData, source, req;

  if (args && (args.member || args.memberId || args.txnOrOrderId || args.cfOrderData || args.source)) {
    ({ member: memberInput, memberId: memberIdInput, txnOrOrderId, cfOrderData, source = 'unknown', req } = args);
  } else {
    memberInput = args;
    txnOrOrderId = p2;
    cfOrderData = p3;
    source = p4 || 'unknown';
    req = p5 || null;
  }

  await dbConnect();

  // ── 1. RESOLVE MEMBER ─────────────────────────────────────────────────────
  let member = null;
  const targetMemberId = memberIdInput || memberInput?._id || (typeof memberInput === 'string' ? memberInput : null);

  if (targetMemberId && mongoose.Types.ObjectId.isValid(targetMemberId)) {
    member = await MlmMember.findById(targetMemberId);
    if (!member) {
      // Check if ID was a userId
      member = await MlmMember.findOne({ userId: new mongoose.Types.ObjectId(targetMemberId) });
    }
  } else if (memberInput?.userId) {
    member = await MlmMember.findOne({ userId: memberInput.userId });
  }

  // ── 2. RESOLVE PAYMENT TRANSACTION ────────────────────────────────────────
  let paymentTxn = null;
  let orderId = null;

  if (typeof txnOrOrderId === 'string') {
    if (mongoose.Types.ObjectId.isValid(txnOrOrderId)) {
      paymentTxn = await PaymentTransaction.findById(txnOrOrderId);
    }
    if (!paymentTxn) {
      paymentTxn = await PaymentTransaction.findOne({ cashfreeOrderId: txnOrOrderId });
      orderId = txnOrOrderId;
    } else {
      orderId = paymentTxn.cashfreeOrderId;
    }
  } else if (txnOrOrderId && typeof txnOrOrderId === 'object') {
    if (txnOrOrderId._id) {
      paymentTxn = await PaymentTransaction.findById(txnOrOrderId._id);
    }
    orderId = txnOrOrderId.cashfreeOrderId || orderId;
  }

  // If member wasn't resolved yet but transaction exists, resolve member from transaction.userId
  if (!member && paymentTxn?.userId) {
    member = await MlmMember.findOne({
      $or: [
        { userId: paymentTxn.userId },
        { _id: paymentTxn.userId },
      ],
    });
  }

  // If transaction wasn't found by ID/orderId, fallback to member's latest platform fee transaction
  if (!paymentTxn && member) {
    paymentTxn = await PaymentTransaction.findOne({
      userId: member.userId || member._id,
      type: 'platform_fee',
      businessModule: 'mlm',
    }).sort({ createdAt: -1 });

    if (paymentTxn) {
      orderId = paymentTxn.cashfreeOrderId;
    }
  }

  if (!member) {
    return {
      success: false,
      result: 'NOT_FOUND',
      message: 'MlmMember could not be resolved.',
    };
  }

  if (!orderId && !paymentTxn?.cashfreeOrderId) {
    return {
      success: false,
      result: 'NOT_FOUND',
      message: 'No Cashfree orderId or transaction found to reconcile.',
    };
  }

  const resolvedOrderId = orderId || paymentTxn.cashfreeOrderId;

  // ── 3. VERIFY CASHFREE SERVER-SIDE STATUS ──────────────────────────────────
  let cfStatus = cfOrderData || null;

  // Fetch from Cashfree if not provided or lacks order_status
  if (!cfStatus || !cfStatus.order_status) {
    try {
      cfStatus = await getCashfreeOrderStatus(resolvedOrderId);
    } catch (cfErr) {
      console.error(`[Reconciler] Cashfree query failed for ${resolvedOrderId}:`, cfErr.message);
      return {
        success: false,
        result: 'CASHFREE_ERROR',
        message: cfErr.message || 'Failed to query Cashfree server-side.',
      };
    }
  }

  const rawStatus = (cfStatus?.order_status || '').toUpperCase();
  const isPaid = rawStatus === 'PAID';

  if (!isPaid) {
    // Non-paid statuses
    if (rawStatus === 'ACTIVE') {
      // In Cashfree API, ACTIVE means order is created/open, awaiting user payment
      return {
        success: false,
        result: 'PENDING',
        message: 'Payment is pending with Cashfree.',
      };
    }

    if (['EXPIRED', 'CANCELLED', 'FAILED', 'TERMINATED'].includes(rawStatus)) {
      if (paymentTxn && paymentTxn.status === 'pending') {
        paymentTxn.status = 'failed';
        paymentTxn.failureReason = rawStatus;
        await paymentTxn.save();
      }
      return {
        success: false,
        result: 'FAILED',
        message: `Cashfree order status is ${rawStatus}.`,
      };
    }

    return {
      success: false,
      result: 'PENDING',
      message: `Cashfree order status is ${rawStatus || 'UNKNOWN'}.`,
    };
  }

  // ── 4. STATE-REPAIR IDEMPOTENT ACTIVATION ──────────────────────────────────
  // Check baseline initial state before making changes
  const wasAlreadyPaid = !!member.platformFeePaid;
  const wasAlreadyActive = member.status === 'ACTIVE';
  const hadMatrixNode = !!member.matrixNodeId;
  const wasTxnCompleted = paymentTxn && (paymentTxn.status === 'completed' || paymentTxn.status === 'paid');

  let stateRepaired = false;
  const payableAmount = member.platformFeeAmount || paymentTxn?.amount || 100;
  const paymentRef = cfStatus?.cf_order_id || cfStatus?.order_id || resolvedOrderId;

  // Step A: Repair PaymentTransaction
  if (paymentTxn) {
    let txnNeedsUpdate = false;
    if (paymentTxn.status !== 'completed' && paymentTxn.status !== 'paid') {
      paymentTxn.status = 'completed';
      paymentTxn.paidAt = paymentTxn.paidAt || new Date();
      txnNeedsUpdate = true;
    }
    if (!paymentTxn.cashfreePaymentId) {
      paymentTxn.cashfreePaymentId = paymentRef;
      txnNeedsUpdate = true;
    }
    if (!paymentTxn.verifiedAt) {
      paymentTxn.verifiedAt = new Date();
      txnNeedsUpdate = true;
    }
    if (source === 'webhook' && !paymentTxn.webhookReceived) {
      paymentTxn.webhookReceived = true;
      txnNeedsUpdate = true;
    }
    if (txnNeedsUpdate) {
      await paymentTxn.save();
      stateRepaired = true;
    }
  }

  // Step B: Update MlmMember fee payment details
  let memberNeedsUpdate = false;
  if (!member.platformFeePaid) {
    member.platformFeePaid = true;
    memberNeedsUpdate = true;
  }
  if (!member.platformFeePaymentId && paymentTxn?._id) {
    member.platformFeePaymentId = paymentTxn._id;
    memberNeedsUpdate = true;
  }
  if (!member.platformFeeAmount) {
    member.platformFeeAmount = payableAmount;
    memberNeedsUpdate = true;
  }
  if (memberNeedsUpdate) {
    await member.save();
    stateRepaired = true;
  }

  // Step C & D: Reusable Authoritative Activation & 3×15 Matrix Placement
  const activationRes = await activateEligibleMember({
    memberId: member._id,
    source: source === 'webhook' ? 'payment_webhook' : 'payment_reconciliation',
    req,
  });
  if (activationRes.activated) {
    stateRepaired = true;
    const refreshed = await MlmMember.findById(member._id);
    if (refreshed) {
      member = refreshed;
      matrixPlacementNode = refreshed.matrixNodeId ? { _id: refreshed.matrixNodeId } : null;
    }
  }

  // Step E: Audit Logging (write once or log repairs without spam)
  const reqMeta = req ? getRequestMeta(req) : { ip: '', userAgent: '' };
  try {
    const existingAudit = await MlmAuditLog.findOne({
      targetId: member._id,
      action: 'PLATFORM_FEE_VERIFIED_AND_MEMBER_ACTIVATED',
    }).lean();

    if (!existingAudit) {
      await MlmAuditLog.create({
        action: 'PLATFORM_FEE_VERIFIED_AND_MEMBER_ACTIVATED',
        performedBy: member.userId || member._id,
        performedByRole: source === 'admin_sync' ? 'admin' : (source === 'webhook' ? 'system' : 'mlm_member'),
        performedByName: member.fullName,
        targetId: member._id,
        targetModel: 'MlmMember',
        newValue: {
          feeAmount: payableAmount,
          orderId: resolvedOrderId,
          status: 'ACTIVE',
          source,
        },
        details: {
          source,
          stateRepaired,
          timestamp: new Date(),
        },
        ip: reqMeta.ip,
        userAgent: reqMeta.userAgent,
      });
    } else if (stateRepaired && !wasTxnCompleted && !wasAlreadyActive) {
      await MlmAuditLog.create({
        action: 'PLATFORM_FEE_STATE_REPAIRED',
        performedBy: member.userId || member._id,
        performedByRole: source === 'admin_sync' ? 'admin' : (source === 'webhook' ? 'system' : 'mlm_member'),
        performedByName: member.fullName,
        targetId: member._id,
        targetModel: 'MlmMember',
        newValue: {
          orderId: resolvedOrderId,
          status: 'ACTIVE',
          source,
        },
        details: {
          source,
          repaired: true,
          timestamp: new Date(),
        },
        ip: reqMeta.ip,
        userAgent: reqMeta.userAgent,
      });
    }
  } catch (auditErr) {
    console.warn('[Reconciler] Audit logging notice:', auditErr.message);
  }

  const isAlreadySynced = wasAlreadyPaid && wasAlreadyActive && hadMatrixNode && wasTxnCompleted && !stateRepaired;

  return {
    success: true,
    result: isAlreadySynced ? 'ALREADY_SYNCED' : 'PAID',
    isAlreadyActive: isAlreadySynced,
    repaired: stateRepaired,
    member,
    transaction: paymentTxn,
    matrixNode: matrixPlacementNode,
    redirectUrl: '/nextview/dashboard',
  };
}
