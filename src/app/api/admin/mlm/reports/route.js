import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import MlmReward from '@/models/mlm/MlmReward';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin');
        if (auth instanceof NextResponse)
            return auth;
        // State-wise member aggregation
        const stateStats = await MlmMember.aggregate([
            {
                $group: {
                    _id: { $ifNull: ['$state', 'Unspecified'] },
                    totalMembers: { $sum: 1 },
                    activeMembers: {
                        $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] },
                    },
                    verifiedKyc: {
                        $sum: { $cond: [{ $eq: ['$kycStatus', 'VERIFIED'] }, 1, 0] },
                    },
                    paidPlatformFee: {
                        $sum: { $cond: [{ $eq: ['$platformFeePaid', true] }, 1, 0] },
                    },
                },
            },
            { $sort: { totalMembers: -1 } },
        ]);
        // District-wise breakdown
        const districtStats = await MlmMember.aggregate([
            {
                $group: {
                    _id: {
                        state: { $ifNull: ['$state', 'Unspecified'] },
                        district: { $ifNull: ['$district', 'Unspecified'] },
                    },
                    totalMembers: { $sum: 1 },
                    activeMembers: {
                        $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] },
                    },
                },
            },
            { $sort: { totalMembers: -1 } },
            { $limit: 50 },
        ]);
        // KYC Status aggregation
        const kycStats = await MlmMember.aggregate([
            {
                $group: {
                    _id: '$kycStatus',
                    count: { $sum: 1 },
                },
            },
        ]);
        // FD application aggregation
        const fdStats = await MlmFdApplication.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]);
        // Reward distribution aggregation
        const rewardStats = await MlmReward.aggregate([
            {
                $group: {
                    _id: '$level',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // Total counts
        const totalMembers = await MlmMember.countDocuments();
        const activeMembers = await MlmMember.countDocuments({ status: 'ACTIVE' });
        const paidFees = await MlmMember.countDocuments({ platformFeePaid: true });
        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    totalMembers,
                    activeMembers,
                    paidFees,
                    platformRevenue: paidFees * 100,
                },
                stateStats,
                districtStats,
                kycStats,
                fdStats,
                rewardStats,
            },
        });
    }
    catch (error) {
        console.error('Error generating MLM reports:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
