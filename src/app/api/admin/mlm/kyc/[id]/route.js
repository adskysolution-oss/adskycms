import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmKyc from '@/models/mlm/MlmKyc';
import MlmMember from '@/models/mlm/MlmMember';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import mongoose from 'mongoose';
export async function POST(req, context) {
    await dbConnect();
    const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
    if (auth instanceof NextResponse)
        return auth;
    const { id } = await context.params;
    const body = await req.json();
    const { action, adminRemarks, rejectionReason, correctionRemarks } = body;
    const kyc = await MlmKyc.findById(id);
    if (!kyc)
        return NextResponse.json({ success: false, message: 'KYC record not found' }, { status: 404 });
    const adminUserId = (mongoose.Types.ObjectId.isValid(auth.payload?.id) ? new mongoose.Types.ObjectId(auth.payload.id) : new mongoose.Types.ObjectId());
    const adminName = auth.payload.fullName || 'Admin';
    if (action === 'VERIFY') {
        kyc.status = 'VERIFIED';
        kyc.verifiedAt = new Date();
        kyc.reviewedBy = adminUserId;
        kyc.reviewedAt = new Date();
        kyc.adminRemarks = adminRemarks || 'KYC verified and approved by admin';
        await kyc.save();
        // Set member status to PENDING_PAYMENT (NOT active until ₹100 platform fee is paid)
        await MlmMember.findByIdAndUpdate(kyc.memberId, {
            kycStatus: 'VERIFIED',
            status: 'PENDING_PAYMENT',
        });
    }
    else if (action === 'REJECT') {
        kyc.status = 'REJECTED';
        kyc.reviewedBy = adminUserId;
        kyc.reviewedAt = new Date();
        kyc.adminRemarks = rejectionReason || 'Rejected by admin';
        await kyc.save();
        await MlmMember.findByIdAndUpdate(kyc.memberId, {
            kycStatus: 'REJECTED',
        });
    }
    else if (action === 'CORRECTION') {
        kyc.status = 'CORRECTION_REQUIRED';
        kyc.correctionRemarks = correctionRemarks || 'Correction required';
        kyc.reviewedBy = adminUserId;
        kyc.reviewedAt = new Date();
        await kyc.save();
        await MlmMember.findByIdAndUpdate(kyc.memberId, {
            kycStatus: 'CORRECTION_REQUIRED',
        });
    }
    const { ip, userAgent } = getRequestMeta(req);
    await MlmAuditLog.create({
        action: `KYC_${action}`,
        performedBy: adminUserId,
        performedByRole: auth.payload.role,
        performedByName: adminName,
        targetId: kyc._id,
        targetModel: 'MlmKyc',
        newValue: { status: kyc.status },
        ip, userAgent,
    });
    return NextResponse.json({ success: true, message: `KYC marked as ${kyc.status}`, data: kyc });
}
