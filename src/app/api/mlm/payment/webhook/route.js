import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect.js';
import PaymentTransaction from '@/models/PaymentTransaction.js';
import MlmMember from '@/models/mlm/MlmMember.js';
import { verifyCashfreeWebhook } from '@/lib/cashfree.js';
import { reconcilePayment } from '@/lib/mlm/paymentReconciler.js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    // 1. Read raw text body for cryptographic signature verification
    const rawBody = await req.text();
    const timestamp = req.headers.get('x-webhook-timestamp') || '';
    const signature = req.headers.get('x-webhook-signature') || '';

    if (!timestamp || !signature) {
      return NextResponse.json(
        { success: false, message: 'Missing Cashfree webhook security headers.' },
        { status: 401 }
      );
    }

    // 2. Verify signature
    const isValid = verifyCashfreeWebhook(rawBody, timestamp, signature);
    if (!isValid) {
      console.warn('[Cashfree Webhook] Webhook signature verification failed.');
      return NextResponse.json(
        { success: false, message: 'Invalid webhook signature.' },
        { status: 401 }
      );
    }

    // 3. Parse JSON payload only after signature verification
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    // 4. Extract order & payment metadata across standard and legacy Cashfree schemas
    const orderId =
      payload?.data?.order?.order_id ||
      payload?.data?.order_id ||
      payload?.order_id ||
      payload?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { success: true, message: 'Acknowledged: No order_id present in payload.' },
        { status: 200 }
      );
    }

    const eventType = (payload?.type || payload?.event || '').toUpperCase();
    const paymentStatus = (
      payload?.data?.payment?.payment_status ||
      payload?.data?.payment_status ||
      payload?.paymentStatus ||
      payload?.txStatus ||
      ''
    ).toUpperCase();

    // 5. Only activate on genuine successful payment events
    const isSuccess =
      eventType.includes('SUCCESS') ||
      eventType.includes('PAID') ||
      paymentStatus === 'SUCCESS' ||
      paymentStatus === 'PAID';

    if (!isSuccess) {
      // Return 200 so Cashfree doesn't re-attempt webhooks for legitimate non-success events
      return NextResponse.json(
        { success: true, message: `Acknowledged non-success event: ${eventType || paymentStatus}` },
        { status: 200 }
      );
    }

    await dbConnect();

    // 6. Find corresponding PaymentTransaction
    const paymentTxn = await PaymentTransaction.findOne({ cashfreeOrderId: orderId });
    if (!paymentTxn) {
      return NextResponse.json(
        { success: true, message: 'Acknowledged: Order not found in PaymentTransaction registry.' },
        { status: 200 }
      );
    }

    // 7. Ensure this webhook specifically belongs to the NextView/MLM platform fee flow
    if (paymentTxn.businessModule !== 'mlm' && paymentTxn.type !== 'platform_fee') {
      return NextResponse.json(
        { success: true, message: 'Acknowledged: Non-MLM transaction ignored by MLM webhook.' },
        { status: 200 }
      );
    }

    // 8. Resolve MlmMember
    const member = await MlmMember.findOne({
      $or: [
        { userId: paymentTxn.userId },
        { _id: paymentTxn.userId },
      ],
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'MlmMember record not found for transaction.' },
        { status: 404 }
      );
    }

    // 9. Reconcile payment idempotently with state repair
    const paymentRef =
      payload?.data?.payment?.cf_payment_id ||
      payload?.data?.order?.cf_order_id ||
      orderId;

    const cfOrderData = {
      order_id: orderId,
      order_status: 'PAID',
      cf_order_id: paymentRef,
    };

    const reconcileResult = await reconcilePayment({
      member,
      txnOrOrderId: paymentTxn,
      cfOrderData,
      source: 'webhook',
      req,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Payment synchronized via webhook.',
        result: reconcileResult.result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cashfree Webhook Handler Error]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Webhook processing failed.' },
      { status: 500 }
    );
  }
}
