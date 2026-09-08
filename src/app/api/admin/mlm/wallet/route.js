import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmWallet from '@/models/mlm/MlmWallet';
import MlmWalletTransaction from '@/models/mlm/MlmWalletTransaction';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const txQuery = {};
        if (type && type !== 'ALL')
            txQuery.type = type;
        const [wallets, transactions] = await Promise.all([
            MlmWallet.find()
                .populate('memberId', 'fullName mobile mlmCode')
                .sort({ balance: -1 })
                .lean(),
            MlmWalletTransaction.find(txQuery)
                .populate('memberId', 'fullName mobile mlmCode')
                .sort({ createdAt: -1 })
                .limit(200)
                .lean(),
        ]);
        const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
        const totalEarned = wallets.reduce((sum, w) => sum + (w.totalEarned || 0), 0);
        const totalWithdrawn = wallets.reduce((sum, w) => sum + (w.totalWithdrawn || 0), 0);
        return NextResponse.json({
            success: true,
            data: {
                wallets,
                transactions,
                summary: {
                    totalBalance,
                    totalEarned,
                    totalWithdrawn,
                    activeWallets: wallets.length,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching admin MLM wallet ledger:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
