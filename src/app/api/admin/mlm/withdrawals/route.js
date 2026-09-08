import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmWithdrawal from '@/models/mlm/MlmWithdrawal';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
        if (auth instanceof NextResponse)
            return auth;
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const filter = {};
        if (status)
            filter.status = status;
        const withdrawals = await MlmWithdrawal.find(filter)
            .populate({
            path: 'memberId',
            select: 'fullName mobile mlmCode sponsorCode status'
        })
            .populate('userId', 'email mobile')
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({
            success: true,
            data: withdrawals,
            count: withdrawals.length,
        });
    }
    catch (error) {
        console.error('Error fetching admin MLM withdrawals:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
