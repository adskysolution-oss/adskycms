import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmKyc from '@/models/mlm/MlmKyc';
import MlmMatrixNode from '@/models/mlm/MlmMatrixNode';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import MlmReward from '@/models/mlm/MlmReward';
import MlmWithdrawal from '@/models/mlm/MlmWithdrawal';
import { requireModuleAuth } from '@/lib/moduleAuth';
export async function GET(req) {
    await dbConnect();
    const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
    if (auth instanceof NextResponse)
        return auth;
    const [totalMembers, activeMembers, pendingKycCount, verifiedKycCount, matrixNodesCount, fdApplicationsPending, fdApplicationsEligible, totalFdApplications, rewardsAgg, pendingWithdrawals,] = await Promise.all([
        MlmMember.countDocuments({}),
        MlmMember.countDocuments({ status: 'ACTIVE' }),
        MlmKyc.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
        MlmKyc.countDocuments({ status: 'VERIFIED' }),
        MlmMatrixNode.countDocuments({ memberId: { $ne: null } }),
        MlmFdApplication.countDocuments({ status: 'PENDING' }),
        MlmFdApplication.countDocuments({ status: 'ELIGIBLE' }),
        MlmFdApplication.countDocuments({}),
        MlmReward.aggregate([
            { $group: { _id: null, totalReward: { $sum: '$totalRewardAmount' }, count: { $sum: 1 } } }
        ]),
        MlmWithdrawal.countDocuments({ status: 'PENDING' }),
    ]);
    const rewardStats = rewardsAgg[0] || { totalReward: 0, count: 0 };
    return NextResponse.json({
        success: true,
        data: {
            totalMembers,
            activeMembers,
            pendingKyc: pendingKycCount,
            verifiedKyc: verifiedKycCount,
            totalRewardsDistributed: rewardStats.totalReward || 0,
            totalFdApplications,
            pendingWithdrawals,
            members: {
                total: totalMembers,
                active: activeMembers,
            },
            kyc: {
                pending: pendingKycCount,
                verified: verifiedKycCount,
            },
            matrix: {
                nodesFilled: matrixNodesCount,
            },
            fdApplications: {
                total: totalFdApplications,
                pending: fdApplicationsPending,
                eligible: fdApplicationsEligible,
            },
            rewards: {
                totalGenerated: rewardStats.totalReward || 0,
                count: rewardStats.count || 0,
            },
            withdrawals: {
                pending: pendingWithdrawals,
            }
        }
    });
}
