import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmWallet from '@/models/mlm/MlmWallet';
import MlmWalletTransaction from '@/models/mlm/MlmWalletTransaction';
import MlmWithdrawal from '@/models/mlm/MlmWithdrawal';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import { getOrCreateMlmWallet, debitMlmWallet } from '@/lib/mlm/walletEngine';
import mongoose from 'mongoose';
import crypto from 'crypto';

const MIN_WITHDRAWAL_AMOUNT = 500;

export async function GET(req) {
  await dbConnect();
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
  const member = await MlmMember.findOne({
    $or: [{ userId: authId }, { _id: authId }]
  });
  if (!member) return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });

  const wallet = await getOrCreateMlmWallet(member.userId || authId, member._id);

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '25'));
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    MlmWalletTransaction.find({ memberId: member._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MlmWalletTransaction.countDocuments({ memberId: member._id }),
  ]);

  const walletPayload = {
    _id: wallet._id,
    balance: wallet.balance || 0,
    currentBalance: wallet.balance || 0,
    pendingBalance: wallet.pendingBalance || 0,
    lockedBalance: wallet.pendingBalance || 0,
    lifetimeEarnings: wallet.lifetimeEarnings || 0,
    totalEarned: wallet.lifetimeEarnings || 0,
    totalWithdrawn: wallet.totalWithdrawn || 0,
    minWithdrawalAmount: MIN_WITHDRAWAL_AMOUNT,
  };

  return NextResponse.json({
    success: true,
    data: {
      wallet: walletPayload,
      transactions: transactions || [],
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
    },
    wallet: walletPayload,
    transactions: transactions || [],
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }
  });
}

export async function POST(req) {
  await dbConnect();
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
  const member = await MlmMember.findOne({
    $or: [{ userId: authId }, { _id: authId }]
  });
  if (!member) return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });

  const body = await req.json();
  const { amount, paymentMethod, bankDetails, upiId } = body;

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0 || isNaN(numAmount)) {
    return NextResponse.json({ success: false, message: 'Invalid withdrawal amount' }, { status: 400 });
  }

  if (numAmount < MIN_WITHDRAWAL_AMOUNT) {
    return NextResponse.json({
      success: false,
      message: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}`
    }, { status: 400 });
  }

  if (!paymentMethod || !['BANK', 'UPI'].includes(paymentMethod)) {
    return NextResponse.json({ success: false, message: 'paymentMethod must be BANK or UPI' }, { status: 400 });
  }

  const ownFdApplication = await MlmFdApplication.findOne({
    memberId: member._id,
    status: { $in: ['ACTIVE', 'ELIGIBLE', 'COMPLETED', 'REWARDED'] },
  }).lean();
  if (!ownFdApplication) {
    return NextResponse.json({
      success: false,
      message: 'Withdrawal not allowed. You must first create and activate your own FD / FD-Card before you can withdraw network rewards.',
    }, { status: 403 });
  }

  const wallet = await getOrCreateMlmWallet(member.userId || authId, member._id);

  if (wallet.balance < numAmount) {
    return NextResponse.json({
      success: false,
      message: `Insufficient withdrawable balance. Available: ₹${wallet.balance} (Locked rewards of ₹${wallet.pendingBalance} cannot be withdrawn until level completion)`
    }, { status: 400 });
  }

  const withdrawalCode = `NEX-WD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const debitResult = await debitMlmWallet(
    member.userId || authId,
    member._id,
    numAmount,
    'WITHDRAWAL',
    `Withdrawal request ${withdrawalCode}`,
    withdrawalCode
  );

  if (!debitResult.success) {
    return NextResponse.json({ success: false, message: debitResult.error || 'Failed to lock balance for withdrawal' }, { status: 400 });
  }

  const withdrawal = await MlmWithdrawal.create({
    withdrawalCode,
    memberId: member._id,
    userId: member.userId || authId,
    walletId: wallet._id,
    amount: numAmount,
    paymentMethod,
    bankDetails: paymentMethod === 'BANK' ? bankDetails : undefined,
    upiId: paymentMethod === 'UPI' ? upiId : undefined,
    status: 'PENDING',
  });

  return NextResponse.json({ success: true, data: withdrawal }, { status: 201 });
}
