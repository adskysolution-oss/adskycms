import { NextResponse } from 'next/server';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    const auth = await requireModuleAuth(req, 'admin');
    if (auth instanceof NextResponse)
        return auth;
    return NextResponse.json({ success: true, message: 'Admin MLM Diagnostic Active' });
}
