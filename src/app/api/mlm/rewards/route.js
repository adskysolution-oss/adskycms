import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmMatrixNode from '@/models/mlm/MlmMatrixNode';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import MlmWalletTransaction from '@/models/mlm/MlmWalletTransaction';
import { getAllLevelsOccupancy } from '@/lib/mlm/matrixEngine';
import { requireModuleAuth } from '@/lib/moduleAuth';
import mongoose from 'mongoose';

/**
 * GET /api/mlm/rewards
 * Returns all level and matrix rewards earned by the authenticated member with locked vs withdrawable segregation.
 */
export async function GET(req) {
  await dbConnect();
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
  const member = await MlmMember.findOne({
    $or: [{ userId: authId }, { _id: authId }]
  });
  if (!member) return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });

  // Get all reward transactions
  const rewardTransactions = await MlmWalletTransaction.find({
    memberId: member._id,
    type: 'credit',
    category: { $in: ['MATRIX_LEVEL_REWARD', 'SPONSOR_REWARD', 'FD_REWARD'] }
  })
    .sort({ createdAt: -1 })
    .lean();

  let totalGeneratedRewards = 0;
  let withdrawableRewards = 0;
  let lockedRewards = 0;

  const levelBreakdown = {};
  for (let l = 1; l <= 15; l++) {
    levelBreakdown[l] = { total: 0, withdrawable: 0, locked: 0 };
  }

  for (const t of rewardTransactions) {
    totalGeneratedRewards += t.amount;
    const isWithdrawable = t.status === 'completed';

    if (isWithdrawable) {
      withdrawableRewards += t.amount;
    } else {
      lockedRewards += t.amount;
    }

    if (t.level && t.level >= 1 && t.level <= 15) {
      levelBreakdown[t.level].total += t.amount;
      if (isWithdrawable) {
        levelBreakdown[t.level].withdrawable += t.amount;
      } else {
        levelBreakdown[t.level].locked += t.amount;
      }
    }
  }

  // Level completion metrics if placed in matrix
  let levelOccupancies = [];
  if (member.matrixNodeId) {
    const occ = await getAllLevelsOccupancy(member.matrixNodeId);
    const rawLevels = occ.levels || [];

    // Fetch current node to get absolute level
    const currentNode = await MlmMatrixNode.findById(member.matrixNodeId).select('level').lean();
    const currentAbsLevel = currentNode?.level ?? 1;

    // Get all downline member IDs
    const downlineNodes = await MlmMatrixNode.find({
      ancestorIds: member.matrixNodeId,
      memberId: { $ne: null },
    }).select('level memberId').lean();

    const allDownlineMemberIds = downlineNodes.map((n) => n.memberId).filter(Boolean);

    // Batch fetch FD applications for all downline members
    const fdApplications = await MlmFdApplication.find({
      memberId: { $in: allDownlineMemberIds },
      status: { $in: ['ELIGIBLE', 'VERIFIED'] },
    }).select('memberId status').lean();

    const fdDoneSet = new Set(fdApplications.map((f) => f.memberId.toString()));

    // Enrich each level entry
    levelOccupancies = rawLevels.map((lvl) => {
      const targetAbsLevel = currentAbsLevel + lvl.level;
      const nodesAtLevel = downlineNodes.filter((n) => n.level === targetAbsLevel);
      const fdDoneAtLevel = nodesAtLevel.filter((n) => fdDoneSet.has(n.memberId?.toString())).length;
      const placedCount = lvl.filledCount;
      const capacity = lvl.capacity;
      const allPlaced = placedCount >= capacity;
      const allFdDone = fdDoneAtLevel >= capacity;

      return {
        ...lvl,
        fdDoneCount: fdDoneAtLevel,
        placedCount,
        isPlacementComplete: allPlaced,
        isComplete: allPlaced && allFdDone,
      };
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      totalGeneratedRewards,
      withdrawableRewards,
      lockedRewards,
      totalRewards: withdrawableRewards,
      totalRewardsEarned: totalGeneratedRewards,
      levelBreakdown,
      levelOccupancies,
      transactions: rewardTransactions,
      rewards: rewardTransactions,
    }
  });
}
