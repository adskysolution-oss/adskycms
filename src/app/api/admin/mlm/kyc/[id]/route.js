import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmKyc from '@/models/mlm/MlmKyc';
import MlmMember from '@/models/mlm/MlmMember';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import { activateEligibleMember } from '@/lib/mlm/memberActivation';
import { maskPan, maskAadhaar } from '@/lib/verification/masking';
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
    const now = new Date();
    const remarks = adminRemarks || rejectionReason || correctionRemarks || `Admin action: ${action}`;

    if (action === 'VERIFY') {
        kyc.status = 'VERIFIED';
        kyc.verifiedAt = now;
        kyc.verifiedBy = adminName;
        kyc.reviewedBy = adminUserId;
        kyc.reviewedAt = now;
        kyc.verificationSource = 'ADMIN_MANUAL';
        kyc.adminRemarks = remarks;

        // If manual override for PAN or Aadhaar, preserve historical and update source
        if (kyc.panVerification) {
            kyc.panVerification.status = 'VERIFIED';
            kyc.panVerification.verified = true;
            kyc.panVerification.verificationSource = 'ADMIN_MANUAL';
        }
        if (kyc.aadhaarVerification) {
            kyc.aadhaarVerification.status = 'VERIFIED';
            kyc.aadhaarVerification.verified = true;
            kyc.aadhaarVerification.verificationSource = 'ADMIN_MANUAL';
        }

        kyc.verificationHistory.push({
            verificationType: 'MANUAL_OVERRIDE',
            source: 'ADMIN_MANUAL',
            status: 'VERIFIED',
            maskedIdentifier: `${maskPan(kyc.panNumber)} | ${maskAadhaar(kyc.aadhaarNumber)}`,
            remarks: remarks,
            performedBy: adminName,
            performedByRole: auth.payload.role,
            timestamp: now,
        });

        await kyc.save();

        const member = await MlmMember.findById(kyc.memberId);
        if (member) {
            member.kycStatus = 'VERIFIED';
            if (member.platformFeePaid) {
                await member.save();
                await activateEligibleMember({
                    memberId: member._id,
                    source: 'admin_override',
                    req,
                });
            } else {
                member.status = 'PENDING_PAYMENT';
                await member.save();
            }
        }
    }
    else if (action === 'REJECT') {
        kyc.status = 'REJECTED';
        kyc.reviewedBy = adminUserId;
        kyc.reviewedAt = now;
        kyc.adminRemarks = remarks;
        kyc.rejectionReason = remarks;

        kyc.verificationHistory.push({
            verificationType: 'MANUAL_OVERRIDE',
            source: 'ADMIN_MANUAL',
            status: 'REJECTED',
            maskedIdentifier: `${maskPan(kyc.panNumber)} | ${maskAadhaar(kyc.aadhaarNumber)}`,
            remarks: remarks,
            performedBy: adminName,
            performedByRole: auth.payload.role,
            timestamp: now,
        });

        await kyc.save();
        await MlmMember.findByIdAndUpdate(kyc.memberId, {
            kycStatus: 'REJECTED',
        });
    }
    else if (action === 'CORRECTION') {
        kyc.status = 'CORRECTION_REQUIRED';
        kyc.correctionRemarks = remarks;
        kyc.reviewedBy = adminUserId;
        kyc.reviewedAt = now;

        kyc.verificationHistory.push({
            verificationType: 'MANUAL_OVERRIDE',
            source: 'ADMIN_MANUAL',
            status: 'CORRECTION_REQUIRED',
            maskedIdentifier: `${maskPan(kyc.panNumber)} | ${maskAadhaar(kyc.aadhaarNumber)}`,
            remarks: remarks,
            performedBy: adminName,
            performedByRole: auth.payload.role,
            timestamp: now,
        });

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
        newValue: {
            status: kyc.status,
            source: 'ADMIN_MANUAL',
            maskedPan: maskPan(kyc.panNumber),
            maskedAadhaar: maskAadhaar(kyc.aadhaarNumber),
        },
        details: { remarks },
        ip,
        userAgent,
    });

    return NextResponse.json({ success: true, message: `KYC marked as ${kyc.status}`, data: kyc });
}
