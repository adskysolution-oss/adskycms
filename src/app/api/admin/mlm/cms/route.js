import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmCms from '@/models/mlm/MlmCms';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        const items = await MlmCms.find().sort({ updatedAt: -1 }).lean();
        return NextResponse.json({ success: true, data: items });
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
        const { key, title, content, section, isActive } = body;
        if (!key || !title) {
            return NextResponse.json({ success: false, message: 'Key and title are required' }, { status: 400 });
        }
        const updated = await MlmCms.findOneAndUpdate({ key }, { key, title, content, section: section || 'GENERAL', isActive: isActive !== false, updatedAt: new Date() }, { upsert: true, new: true });
        await MlmAuditLog.create({
            action: 'CMS_UPDATED',
            performedBy: payload.id,
            performedByRole: payload.role,
            performedByName: payload.fullName,
            targetId: updated._id,
            targetModel: 'MlmCms',
            newValue: { key, title },
        });
        return NextResponse.json({ success: true, data: updated, message: 'Content updated successfully' });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
