import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import MlmMember from '@/models/mlm/MlmMember';
import MlmMatrixNode from '@/models/mlm/MlmMatrixNode';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import { generateMlmReward } from '@/lib/mlm/rewardEngine';
import { isLevelComplete } from '@/lib/mlm/matrixEngine';
import { unlockPendingLevelRewards } from '@/lib/mlm/walletEngine';
import mongoose from 'mongoose';

export async function POST(req, context) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
        if (auth instanceof NextResponse)
            return auth;
        const { id } = await context.params;
        const body = await req.json();
        const { action, adminRemarks, rejectionReason, correctionRemarks } = body;
        const application = await MlmFdApplication.findById(id);
        if (!application) {
            return NextResponse.json({ success: false, message: 'FD Application not found' }, { status: 404 });
        }
        const rawAdminId = auth.payload?.id || auth.payload?._id || auth.payload?.userId;
        const adminUserId = (mongoose.Types.ObjectId.isValid(rawAdminId)
            ? new mongoose.Types.ObjectId(rawAdminId)
            : new mongoose.Types.ObjectId());
        const adminName = auth.payload?.fullName || auth.payload?.name || 'Admin';

        if (!application.rewardIdempotencyKey) {
            application.rewardIdempotencyKey = `fd-${application._id}`;
        }

        if (action === 'REJECT') {
            application.status = 'REJECTED';
            application.rejectionReason = rejectionReason || 'Rejected by admin';
            application.reviewedBy = adminUserId;
            application.reviewedAt = new Date();
            await application.save();
            const { ip, userAgent } = getRequestMeta(req);
            try {
                await MlmAuditLog.create({
                    action: 'FD_APPLICATION_REJECTED',
                    performedBy: adminUserId,
                    performedByRole: auth.payload.role,
                    performedByName: adminName,
                    targetId: application._id,
                    targetModel: 'MlmFdApplication',
                    reason: rejectionReason,
                    ip, userAgent,
                });
            } catch (e) {
                console.warn('[MlmAuditLog] Error logging rejection:', e.message);
            }
            return NextResponse.json({ success: true, message: 'FD application rejected', data: application });
        }
        if (action === 'CORRECTION') {
            application.status = 'CORRECTION_REQUIRED';
            application.correctionRemarks = correctionRemarks || 'Correction required';
            application.reviewedBy = adminUserId;
            application.reviewedAt = new Date();
            await application.save();
            const { ip, userAgent } = getRequestMeta(req);
            try {
                await MlmAuditLog.create({
                    action: 'FD_APPLICATION_CORRECTION_REQUESTED',
                    performedBy: adminUserId,
                    performedByRole: auth.payload.role,
                    performedByName: adminName,
                    targetId: application._id,
                    targetModel: 'MlmFdApplication',
                    reason: correctionRemarks,
                    ip, userAgent,
                });
            } catch (e) {
                console.warn('[MlmAuditLog] Error logging correction:', e.message);
            }
            return NextResponse.json({ success: true, message: 'Correction requested', data: application });
        }
        // Action is VERIFY / ELIGIBLE
        application.status = 'ELIGIBLE';
        application.eligibleAt = new Date();
        application.adminRemarks = adminRemarks;
        application.reviewedBy = adminUserId;
        application.reviewedAt = new Date();
        await application.save();
        // Trigger MLM 3x15 Level 1-15 reward engine
        const rewardResult = await generateMlmReward(application._id, adminUserId, adminName);
        // After generating rewards, walk the triggering member's ancestor chain.
        // For each ancestor whose relative level is NOW truly complete
        // (all slots placed AND all members have active FD cards), unlock
        // any previously-pending level reward transactions.
        try {
            const member = await MlmMember.findById(application.memberId).select('matrixNodeId').lean();
            if (member?.matrixNodeId) {
                const memberNode = await MlmMatrixNode.findById(member.matrixNodeId)
                    .select('ancestorIds level')
                    .lean();
                if (memberNode?.ancestorIds?.length) {
                    for (const ancestorId of memberNode.ancestorIds) {
                        const ancNode = await MlmMatrixNode.findById(ancestorId)
                            .select('memberId level')
                            .lean();
                        if (!ancNode?.memberId)
                            continue;
                        const relativeLevel = memberNode.level - ancNode.level;
                        if (relativeLevel < 1 || relativeLevel > 15)
                            continue;
                        // FD-card-aware level completion check
                        const complete = await isLevelComplete(ancNode._id, relativeLevel);
                        if (complete) {
                            await unlockPendingLevelRewards(ancNode.memberId, relativeLevel);
                            console.log(`[FD Verify] Unlocked pending L${relativeLevel} rewards for member ${ancNode.memberId}`);
                        }
                    }
                }
            }
        }
        catch (unlockErr) {
            console.error('[FD Verify] Error unlocking pending level rewards:', unlockErr);
        }
        const { ip, userAgent } = getRequestMeta(req);
        try {
            await MlmAuditLog.create({
                action: 'FD_APPLICATION_VERIFIED_AND_REWARDED',
                performedBy: adminUserId,
                performedByRole: auth.payload.role,
                performedByName: adminName,
                targetId: application._id,
                targetModel: 'MlmFdApplication',
                newValue: { status: 'ELIGIBLE', rewardResult },
                ip, userAgent,
            });
        } catch (e) {
            console.warn('[MlmAuditLog] Error logging verify:', e.message);
        }
        return NextResponse.json({
            success: true,
            message: 'FD application verified as eligible and MLM level rewards generated',
            data: {
                application,
                rewardResult,
            }
        });
    } catch (error) {
        console.error('[FD Verify POST Error]:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
