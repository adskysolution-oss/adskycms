import mongoose from 'mongoose';
import MlmWallet from '@/models/mlm/MlmWallet';
import MlmWalletTransaction from '@/models/mlm/MlmWalletTransaction';

export async function getOrCreateMlmWallet(
  userId,
  memberId
) {
  const mId = new mongoose.Types.ObjectId(memberId.toString());
  const uId = userId && mongoose.Types.ObjectId.isValid(userId.toString())
    ? new mongoose.Types.ObjectId(userId.toString())
    : mId;

  let wallet = await MlmWallet.findOne({
    $or: [{ memberId: mId }, { userId: uId }]
  });

  if (!wallet) {
    wallet = await MlmWallet.create({
      userId: uId,
      memberId: mId,
      balance: 0,
      pendingBalance: 0,
      lockedBalance: 0,
      lifetimeEarnings: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      totalPlatformFee: 0,
    });
  }
  return wallet;
}

export async function syncMlmWalletBalance(
  userId,
  memberId
) {
  const mId = new mongoose.Types.ObjectId(memberId.toString());
  const uId = userId && mongoose.Types.ObjectId.isValid(userId?.toString())
    ? new mongoose.Types.ObjectId(userId.toString())
    : mId;

  const wallet = await getOrCreateMlmWallet(uId, mId);

  const creditAgg = await MlmWalletTransaction.aggregate([
    { $match: { memberId: mId, type: 'credit' } },
    { $group: { _id: '$status', total: { $sum: '$amount' } } },
  ]);
  const debitAgg = await MlmWalletTransaction.aggregate([
    { $match: { memberId: mId, type: 'debit' } },
    {
      $group: {
        _id: '$status',
        total: { $sum: '$amount' },
        withdrawn: {
          $sum: { $cond: [{ $eq: ['$category', 'WITHDRAWAL'] }, '$amount', 0] }
        }
      }
    },
  ]);

  let completedCredits = 0, pendingCredits = 0;
  creditAgg.forEach((g) => {
    if (g._id === 'completed') completedCredits = g.total;
    if (g._id === 'pending') pendingCredits = g.total;
  });

  let completedDebits = 0, pendingDebits = 0, totalWithdrawn = 0;
  debitAgg.forEach((g) => {
    if (g._id === 'completed') {
      completedDebits = g.total;
      totalWithdrawn = g.withdrawn;
    }
    if (g._id === 'pending') pendingDebits = g.total;
  });

  // Balance = Withdrawable Balance strictly
  wallet.balance = Math.max(0, completedCredits - completedDebits - pendingDebits);
  // Pending Balance & Locked Balance = Locked rewards from in-progress levels
  wallet.pendingBalance = pendingCredits;
  wallet.lockedBalance = pendingCredits;
  // Lifetime Earnings = Total rewards generated (locked + withdrawable)
  wallet.lifetimeEarnings = completedCredits + pendingCredits;
  wallet.totalEarned = completedCredits + pendingCredits;
  wallet.totalWithdrawn = totalWithdrawn;
  await wallet.save();
  return wallet;
}

/**
 * Credits the MLM wallet — idempotent via unique (referenceId, memberId, category, type) index.
 * @param status 'completed' (immediately withdrawable) or 'pending' (locked until level completion)
 */
export async function creditMlmWallet(
  userId,
  memberId,
  amount,
  category,
  description,
  referenceId,
  levelConfigSnapshot,
  status = 'completed'
) {
  if (amount <= 0) return false;
  const mId = new mongoose.Types.ObjectId(memberId.toString());
  const uId = userId && mongoose.Types.ObjectId.isValid(userId?.toString())
    ? new mongoose.Types.ObjectId(userId.toString())
    : mId;

  const wallet = await getOrCreateMlmWallet(uId, mId);

  if (referenceId) {
    const exists = await MlmWalletTransaction.findOne({ referenceId, memberId: mId, category, type: 'credit' });
    if (exists) {
      console.log(`[MLM Wallet] Duplicate credit skipped: ${referenceId}`);
      return false;
    }
  }

  await MlmWalletTransaction.create({
    walletId: wallet._id,
    memberId: mId,
    userId: uId,
    type: 'credit',
    category,
    amount,
    status,
    description,
    level: levelConfigSnapshot?.level,
    referenceId,
    referenceModel: 'MlmReward',
    levelConfigSnapshot,
  });

  await syncMlmWalletBalance(uId, mId);
  return true;
}

/**
 * Unlocks all pending reward transactions for a specific level of a member when that level completes.
 */
export async function unlockPendingLevelRewards(
  memberId,
  level
) {
  const mId = new mongoose.Types.ObjectId(memberId.toString());
  const pendingTxns = await MlmWalletTransaction.find({
    memberId: mId,
    level,
    type: 'credit',
    status: 'pending',
  });

  if (!pendingTxns.length) {
    return { unlockedCount: 0, totalUnlockedAmount: 0 };
  }

  let totalUnlockedAmount = 0;
  for (const txn of pendingTxns) {
    txn.status = 'completed';
    if (txn.description && txn.description.includes('Locked pending')) {
      txn.description = txn.description.replace(/Locked pending Level \d+ completion/, 'Withdrawable');
    }
    await txn.save();
    totalUnlockedAmount += txn.amount;

    // Update corresponding MlmReward item status
    if (txn.referenceId) {
      try {
        const { default: MlmReward } = await import('@/models/mlm/MlmReward');
        const rewardDocId = txn.referenceId.split('-L')[0];
        if (mongoose.Types.ObjectId.isValid(rewardDocId)) {
          await MlmReward.updateOne(
            {
              _id: new mongoose.Types.ObjectId(rewardDocId),
              'rewardItems.beneficiaryMemberId': mId,
              'rewardItems.level': level,
            },
            {
              $set: {
                'rewardItems.$.status': 'CREDITED',
                'rewardItems.$.creditedAt': new Date(),
              }
            }
          );
        }
      } catch (e) {
        console.error('[MLM Wallet] Error updating MlmReward item status:', e);
      }
    }
  }

  const { default: MlmMember } = await import('@/models/mlm/MlmMember');
  const member = await MlmMember.findById(mId).select('userId').lean();
  if (member) {
    await syncMlmWalletBalance(member.userId || member._id, mId);
  }

  console.log(`[MLM Wallet] Unlocked ${pendingTxns.length} pending reward transactions for Member ${mId} at Level ${level} (₹${totalUnlockedAmount})`);
  return { unlockedCount: pendingTxns.length, totalUnlockedAmount };
}

export async function debitMlmWallet(
  userId,
  memberId,
  amount,
  category,
  description,
  referenceId
) {
  const mId = new mongoose.Types.ObjectId(memberId.toString());
  const uId = userId && mongoose.Types.ObjectId.isValid(userId?.toString())
    ? new mongoose.Types.ObjectId(userId.toString())
    : mId;

  const wallet = await getOrCreateMlmWallet(uId, mId);

  if (wallet.balance < amount) {
    return { success: false, error: `Insufficient withdrawable balance. Available: ₹${wallet.balance}` };
  }

  await MlmWalletTransaction.create({
    walletId: wallet._id,
    memberId: mId,
    userId: uId,
    type: 'debit',
    category,
    amount,
    status: 'pending',
    description,
    referenceId,
    referenceModel: 'MlmWithdrawal',
  });

  await syncMlmWalletBalance(uId, mId);
  return { success: true };
}

export const debitWithdrawal = debitMlmWallet;
