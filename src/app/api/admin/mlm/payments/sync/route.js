import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect.js';
import PaymentTransaction from '@/models/PaymentTransaction.js';
import MlmMember from '@/models/mlm/MlmMember.js';
import { requireModuleAuth } from '@/lib/moduleAuth.js';
import { getCashfreeOrderStatus } from '@/lib/cashfree.js';
import { reconcilePayment } from '@/lib/mlm/paymentReconciler.js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const auth = await requireModuleAuth(req, 'admin');
    if (auth instanceof NextResponse) return auth;

    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const { memberId, orderId, transactionId } = body;

    let transaction = null;
    let member = null;

    // 1. Resolve transaction by transactionId
    if (transactionId && mongoose.Types.ObjectId.isValid(transactionId)) {
      transaction = await PaymentTransaction.findById(transactionId);
    }

    // 2. Resolve transaction by orderId (Cashfree Order ID)
    if (!transaction && orderId) {
      transaction = await PaymentTransaction.findOne({ cashfreeOrderId: orderId });
    }

    // 3. Resolve member if provided
    if (memberId && mongoose.Types.ObjectId.isValid(memberId)) {
      member = await MlmMember.findById(memberId);
      if (!member) {
        member = await MlmMember.findOne({ userId: new mongoose.Types.ObjectId(memberId) });
      }
    }

    // 4. Fallback: If no transaction yet but member is resolved, find member's latest platform fee transaction
    if (!transaction && member) {
      transaction = await PaymentTransaction.findOne({
        userId: member.userId || member._id,
        type: 'platform_fee',
        businessModule: 'mlm',
      }).sort({ createdAt: -1 });
    }

    // 5. If transaction found but member not found, resolve member from transaction
    if (transaction && !member) {
      member = await MlmMember.findOne({
        $or: [
          { userId: transaction.userId },
          { _id: transaction.userId },
        ],
      });
    }

    const resolvedOrderId = transaction?.cashfreeOrderId || orderId;

    if (!resolvedOrderId) {
      return NextResponse.json(
        { success: false, result: 'NOT_FOUND', message: 'No Cashfree order ID found to synchronize.' },
        { status: 404 }
      );
    }

    // 6. Query Cashfree server-side (NEVER trust client-provided status)
    let cfStatus;
    try {
      cfStatus = await getCashfreeOrderStatus(resolvedOrderId);
    } catch (cfErr) {
      console.error('[Admin Sync] Cashfree query error:', cfErr);
      return NextResponse.json(
        { success: false, result: 'NOT_FOUND', message: cfErr.message || 'Order not found on Cashfree' },
        { status: 404 }
      );
    }

    const rawStatus = (cfStatus?.order_status || '').toUpperCase();

    // 7. If PAID, invoke the centralized reconciler
    if (rawStatus === 'PAID') {
      const reconcileResult = await reconcilePayment({
        member,
        txnOrOrderId: transaction || resolvedOrderId,
        cfOrderData: cfStatus,
        source: 'admin_sync',
        req,
      });

      return NextResponse.json({
        success: true,
        result: reconcileResult.result || 'PAID',
        message: 'Payment synchronized and state verified.',
        data: {
          result: reconcileResult.result,
          repaired: reconcileResult.repaired,
          memberId: member?._id,
          orderId: resolvedOrderId,
        },
      });
    }

    if (rawStatus === 'ACTIVE') {
      return NextResponse.json({
        success: false,
        result: 'PENDING',
        message: 'Order is still awaiting payment on Cashfree.',
      });
    }

    if (['EXPIRED', 'CANCELLED', 'FAILED', 'TERMINATED'].includes(rawStatus)) {
      if (transaction && transaction.status === 'pending') {
        transaction.status = 'failed';
        transaction.failureReason = rawStatus;
        await transaction.save();
      }
      return NextResponse.json({
        success: false,
        result: 'FAILED',
        message: `Order status on Cashfree is ${rawStatus}.`,
      });
    }

    return NextResponse.json({
      success: false,
      result: 'UNKNOWN',
      message: `Cashfree order status is ${rawStatus || 'UNKNOWN'}.`,
    });
  } catch (error) {
    console.error('[Admin Payment Sync Error]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error during payment sync' },
      { status: 500 }
    );
  }
}
