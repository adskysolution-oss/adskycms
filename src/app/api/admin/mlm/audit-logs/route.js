import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');
        const query = {};
        if (action && action !== 'ALL')
            query.action = action;
        const logs = await MlmAuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(100)
            .lean();
        return NextResponse.json({
            success: true,
            data: logs,
            count: logs.length,
        });
    }
    catch (error) {
        console.error('Error fetching MLM audit logs:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
