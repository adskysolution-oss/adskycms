import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmNotification from '@/models/mlm/MlmNotification';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const notifications = await MlmNotification.find().sort({ createdAt: -1 }).limit(100).lean();
        return NextResponse.json({ success: true, data: notifications });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const { payload } = auth;
        const body = await req.json();
        const { title, message, targetType = 'ALL', memberId, priority = 'NORMAL' } = body;
        if (!title || !message) {
            return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
        }
        const notification = await MlmNotification.create({
            title,
            message,
            targetType,
            memberId: memberId || undefined,
            priority,
            status: 'SENT',
            sentAt: new Date(),
        });
        await MlmAuditLog.create({
            action: 'NOTIFICATION_BROADCAST',
            performedBy: payload.id,
            performedByRole: payload.role,
            performedByName: payload.fullName,
            targetId: notification._id,
            targetModel: 'MlmNotification',
            newValue: { title, targetType },
        });
        return NextResponse.json({ success: true, data: notification, message: 'Notification broadcasted successfully' });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
