import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PaymentTransaction from '@/models/PaymentTransaction';
import MlmMember from '@/models/mlm/MlmMember';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const query = {
            $or: [
                { purpose: 'mlm_platform_fee' },
                { orderId: { $regex: /^MLM_FEE_/ } },
                { cashfreeOrderId: { $regex: /^MLM_FEE_/ } },
                { cashfreeOrderId: { $regex: /^ADMIN_OVERRIDE_MLM_/ } },
                { role: 'mlm_member' },
                { businessModule: 'mlm' },
            ],
        };
        if (status && status !== 'ALL') {
            if (status === 'completed' || status === 'paid') {
                query.status = { $in: ['completed', 'paid', 'success'] };
            }
            else {
                query.status = status;
            }
        }
        const transactions = await PaymentTransaction.find(query)
            .populate('userId', 'fullName mobile email mlmCode')
            .sort({ createdAt: -1 })
            .lean();
        const totalCollected = transactions
            .filter((t) => ['completed', 'paid', 'success'].includes(t.status))
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const paidMembersCount = await MlmMember.countDocuments({ platformFeePaid: true });
        return NextResponse.json({
            success: true,
            data: transactions,
            count: transactions.length,
            summary: {
                totalCollected,
                paidMembersCount,
                totalTransactions: transactions.length,
            },
        });
    }
    catch (error) {
        console.error('Error fetching admin MLM payments:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
