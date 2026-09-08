import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmWithdrawal from '@/models/mlm/MlmWithdrawal';
import MlmWalletTransaction from '@/models/mlm/MlmWalletTransaction';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import { syncMlmWalletBalance } from '@/lib/mlm/walletEngine';
import mongoose from 'mongoose';
export async function PATCH(req, context) {
    await dbConnect();
    const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
    if (auth instanceof NextResponse)
        return auth;
    const { id } = await context.params;
    const body = await req.json();
    const { status, adminRemarks, rejectionReason, transactionRef } = body;
    const withdrawal = await MlmWithdrawal.findById(id);
    if (!withdrawal) {
        return NextResponse.json({ success: false, message: 'Withdrawal not found' }, { status: 404 });
    }
    const adminUserId = (mongoose.Types.ObjectId.isValid(auth.payload?.id) ? new mongoose.Types.ObjectId(auth.payload.id) : new mongoose.Types.ObjectId());
    if (status === 'PAID') {
        withdrawal.status = 'PAID';
        withdrawal.paidAt = new Date();
        withdrawal.transactionRef = transactionRef;
        withdrawal.adminRemarks = adminRemarks;
        withdrawal.processedBy = adminUserId;
        withdrawal.processedAt = new Date();
        await withdrawal.save();
        // Mark locked debit as completed
        await MlmWalletTransaction.findOneAndUpdate({ referenceId: withdrawal.withdrawalCode, memberId: withdrawal.memberId, type: 'debit', status: 'pending' }, { status: 'completed' });
        await syncMlmWalletBalance(withdrawal.userId, withdrawal.memberId);
    }
    else if (status === 'REJECTED') {
        withdrawal.status = 'REJECTED';
        withdrawal.rejectionReason = rejectionReason || 'Rejected by admin';
        withdrawal.processedBy = adminUserId;
        withdrawal.processedAt = new Date();
        await withdrawal.save();
        // Cancel pending debit
        await MlmWalletTransaction.findOneAndUpdate({ referenceId: withdrawal.withdrawalCode, memberId: withdrawal.memberId, type: 'debit', status: 'pending' }, { status: 'cancelled' });
        await syncMlmWalletBalance(withdrawal.userId, withdrawal.memberId);
    }
    else if (status) {
        withdrawal.status = status;
        withdrawal.adminRemarks = adminRemarks;
        await withdrawal.save();
    }
    const { ip, userAgent } = getRequestMeta(req);
    await MlmAuditLog.create({
        action: 'MLM_WITHDRAWAL_PROCESSED',
        performedBy: adminUserId,
        performedByRole: auth.payload.role,
        performedByName: auth.payload.fullName || 'Admin',
        targetId: withdrawal._id,
        targetModel: 'MlmWithdrawal',
        newValue: { status, transactionRef },
        ip, userAgent,
    });
    return NextResponse.json({ success: true, data: withdrawal });
}
