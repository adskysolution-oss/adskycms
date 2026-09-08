import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import { requireModuleAuth } from '@/lib/moduleAuth';
/**
 * GET /api/admin/mlm/fd
 * Lists all FD applications across all members for Admin verification.
 */
export async function GET(req) {
    await dbConnect();
    const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin', 'admin']);
    if (auth instanceof NextResponse)
        return auth;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const filter = {};
    if (status && status !== 'ALL') {
        filter.status = status;
    }
    if (search) {
        const q = search.trim();
        filter.$or = [
            { applicantName: { $regex: q, $options: 'i' } },
            { applicantMobile: { $regex: q, $options: 'i' } },
            { applicationReference: { $regex: q, $options: 'i' } },
            { maskedCardNumber: { $regex: q, $options: 'i' } },
        ];
    }
    const applications = await MlmFdApplication.find(filter)
        .populate('productId', 'name type providerName logo minAmount creditLimit interestRate')
        .populate('memberId', 'fullName mlmCode mobile sponsorId')
        .sort({ createdAt: -1 })
        .lean();
    return NextResponse.json({
        success: true,
        data: applications,
        total: applications.length,
    });
}
