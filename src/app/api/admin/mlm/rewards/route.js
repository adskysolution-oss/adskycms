import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmReward from '@/models/mlm/MlmReward';
import MlmMember from '@/models/mlm/MlmMember';
import { requireModuleAuth } from '@/lib/moduleAuth';

export async function GET(req) {
  try {
    await dbConnect();
    const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'ALL') query.status = status;

    const rewards = await MlmReward.find(query)
      .populate('triggeringMemberId', 'fullName mobile mlmCode')
      .populate('rewardItems.beneficiaryMemberId', 'fullName mobile mlmCode')
      .populate('productId', 'name type')
      .sort({ createdAt: -1 })
      .lean();

    let totalDistributed = 0;
    let totalPending = 0;

    rewards.forEach(r => {
      if (r.rewardItems && Array.isArray(r.rewardItems)) {
        r.rewardItems.forEach(item => {
          if (item.status === 'CREDITED') {
            totalDistributed += (item.bonusAmount || 0);
          } else if (item.status === 'PENDING') {
            totalPending += (item.bonusAmount || 0);
          }
        });
      } else if (r.totalRewardAmount) {
        if (r.status === 'COMPLETED') totalDistributed += r.totalRewardAmount;
        else if (r.status === 'PENDING') totalPending += r.totalRewardAmount;
      }
    });

    return NextResponse.json({
      success: true,
      data: rewards,
      count: rewards.length,
      summary: {
        totalDistributed,
        totalPending,
        totalRewards: rewards.length,
      },
    });
  } catch (error) {
    console.error('Error fetching admin MLM rewards:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
