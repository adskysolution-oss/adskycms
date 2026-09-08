import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmProduct from '@/models/mlm/MlmProduct';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import mongoose from 'mongoose';
import crypto from 'crypto';

function generateRewardIdempotencyKey(memberId, productId, ref) {
  return crypto.createHash('sha256').update(`${memberId}-${productId}-${ref}-${Date.now()}`).digest('hex');
}

/**
 * GET /api/mlm/fd/apply
 * Lists member's FD applications.
 */
export async function GET(req) {
  await dbConnect();
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
  const member = await MlmMember.findOne({
    $or: [{ userId: authId }, { _id: authId }]
  });
  if (!member) return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });

  const applications = await MlmFdApplication.find({
    $or: [{ memberId: member._id }, { userId: member.userId }]
  })
    .populate('productId', 'name type providerName logo minAmount creditLimit interestRate')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    success: true,
    data: applications,
    applications
  });
}

/**
 * POST /api/mlm/fd/apply
 * Submits an FD / FD-Credit Card reference for admin verification.
 */
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
  const { productId, applicantName, applicantMobile, applicantEmail, applicationReference, maskedCardNumber, fdAmount, documents } = body;

  if (!productId || !applicantName || !applicantMobile || !applicationReference) {
    return NextResponse.json({
      success: false,
      message: 'productId, applicantName, applicantMobile, and applicationReference are required'
    }, { status: 400 });
  }

  const product = await MlmProduct.findById(productId);
  if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

  // Duplicate reference check
  const existingApp = await MlmFdApplication.findOne({
    productId: product._id,
    applicationReference: applicationReference.trim(),
    status: { $in: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'ELIGIBLE'] }
  });
  if (existingApp) {
    return NextResponse.json({
      success: false,
      message: 'An application with this reference ID has already been submitted'
    }, { status: 409 });
  }

  const idempotencyKey = generateRewardIdempotencyKey(member._id.toString(), product._id.toString(), applicationReference.trim());
  const effectiveFdAmount = fdAmount ? Number(fdAmount) : (product.minAmount || 2000);
  const effectiveCreditLimit = product.creditLimit || 1800;

  const application = await MlmFdApplication.create({
    memberId: member._id,
    userId: member.userId || authId,
    productId: product._id,
    applicantName: applicantName.trim(),
    applicantMobile: applicantMobile.trim(),
    applicantEmail: applicantEmail ? applicantEmail.trim() : undefined,
    applicationReference: applicationReference.trim(),
    maskedCardNumber: maskedCardNumber ? maskedCardNumber.trim() : undefined,
    providerUrl: product.referralUrl || product.applicationUrl,
    applicationDate: new Date(),
    documents: documents || {},
    fdAmount: effectiveFdAmount,
    creditLimit: effectiveCreditLimit,
    status: 'PENDING',
    rewardIdempotencyKey: idempotencyKey,
  });

  const { ip, userAgent } = getRequestMeta(req);
  await MlmAuditLog.create({
    action: 'FD_APPLICATION_SUBMITTED',
    performedBy: member.userId || authId,
    performedByRole: auth.payload.role,
    performedByName: auth.payload.fullName || 'Member',
    targetId: application._id,
    targetModel: 'MlmFdApplication',
    newValue: { productId, applicantName, applicationReference, fdAmount: effectiveFdAmount, creditLimit: effectiveCreditLimit },
    ip,
    userAgent,
  });

  return NextResponse.json({ success: true, data: application, application }, { status: 201 });
}
