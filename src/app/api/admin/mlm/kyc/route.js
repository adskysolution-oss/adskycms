import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import '@/models/User';
import MlmMember from '@/models/mlm/MlmMember';
import MlmKyc from '@/models/mlm/MlmKyc';
import { requireModuleAuth } from '@/lib/moduleAuth';
import { maskPan, maskAadhaar } from '@/lib/verification/masking';

export const dynamic = 'force-dynamic';

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
        const records = await MlmKyc.find(filter)
            .populate({
                path: 'memberId',
                select: 'fullName mobile mlmCode sponsorCode status platformFeePaid joinedAt'
            })
            .sort({ updatedAt: -1 })
            .lean();

        const formatted = records.map((r) => {
            const b = r.bankDetails || {};
            const acctNum = b.accountNumber || r.bankAccountNumber || '';
            const ifsc = b.ifscCode || r.bankIfscCode || '';
            const bName = b.bankName || r.bankName || '';
            const branch = b.branchName || r.bankBranch || '';
            const holder = b.accountHolderName || r.accountHolderName || r.fullName || r.memberId?.fullName || '';
            const upi = b.upiId || r.upiId || '';

            const safeAadhaarVerification = r.aadhaarVerification ? { ...r.aadhaarVerification } : null;
            if (safeAadhaarVerification) {
                delete safeAadhaarVerification.referenceId;
                delete safeAadhaarVerification.referenceIdExpiresAt;
            }

            const bankDetails = (acctNum || ifsc) ? {
                accountHolderName: holder,
                accountNumber: acctNum,
                ifscCode: ifsc,
                bankName: bName,
                branchName: branch,
                upiId: upi,
            } : null;

            return {
                ...r,
                panNumber: r.panNumber || '',
                aadhaarNumber: r.aadhaarNumber || '',
                aadhaarVerification: safeAadhaarVerification,
                maskedPan: maskPan(r.panNumber),
                maskedAadhaar: maskAadhaar(r.aadhaarNumber),
                bankDetails,
            };
        });

        return NextResponse.json({
            success: true,
            data: formatted,
            count: formatted.length,
        });
    }
    catch (error) {
        console.error('Error fetching admin MLM KYC records:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
