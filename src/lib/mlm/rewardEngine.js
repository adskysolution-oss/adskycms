import mongoose from 'mongoose';
import MlmLevelConfig from '@/models/mlm/MlmLevelConfig';
import MlmReward from '@/models/mlm/MlmReward';
import MlmFdApplication from '@/models/mlm/MlmFdApplication';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import MlmMember from '@/models/mlm/MlmMember';
import { getMatrixUplineChain, isLevelComplete } from './matrixEngine';
import { creditMlmWallet, syncMlmWalletBalance } from './walletEngine';

/**
 * Finds the currently active, effective-dated level configuration strictly from database.
 * Dynamic — reads the exact configuration set and saved by Admin in MlmLevelConfig.
 */
export async function findEffectiveLevelConfig(date = new Date()) {
  let config = await MlmLevelConfig.findOne({
    status: 'active',
    effectiveFrom: { $lte: date },
    $or: [{ effectiveTo: null }, { effectiveTo: { $exists: false } }, { effectiveTo: { $gte: date } }],
  }).sort({ version: -1, effectiveFrom: -1 }).lean();

  if (!config) {
    // If no date-bounded config found, retrieve latest active admin configuration
    config = await MlmLevelConfig.findOne({ status: 'active' }).sort({ version: -1 }).lean();
  }

  return config;
}

/**
 * Generates MLM rewards for an eligible FD application.
 *
 * ISOLATION GUARANTEE:
 * - Called ONLY on verified MLM FD eligibility.
 * - Distributes rewards strictly across the qualifying member's matrix ancestor chain.
 * - Locked vs Withdrawable:
 *     - If ancestor's relative level is COMPLETE (3^L filled), reward is credited as 'completed' (withdrawable).
 *     - If ancestor's relative level is INCOMPLETE, reward is credited as 'pending' (locked until level completion).
 *
 * IDEMPOTENCY:
 * - Unique index on MlmReward.fdApplicationId prevents duplicate reward documents.
 * - Unique index on MlmWalletTransaction prevents duplicate wallet credits.
 */
export async function generateMlmReward(
  fdApplicationId,
  adminUserId,
  adminName = 'Admin'
) {
  // 1. Load application
  const application = await MlmFdApplication.findById(fdApplicationId).lean();
  if (!application) return { success: false, error: 'FD application not found' };
  if (application.status !== 'ELIGIBLE' && application.status !== 'VERIFIED') {
    return { success: false, error: 'Application is not in ELIGIBLE or VERIFIED status' };
  }

  // 2. Duplicate prevention — unique index on fdApplicationId
  let existing = await MlmReward.findOne({ fdApplicationId }).lean();
  if (existing && existing.status === 'COMPLETED') {
    console.log(`[MLM Reward] Already generated and completed for fdApplicationId: ${fdApplicationId}`);
    return { success: true, rewardId: existing._id };
  }

  // 3. Load effective level configuration strictly from Database
  const config = await findEffectiveLevelConfig(application.eligibleAt || new Date());
  if (!config || !config.levels || !config.levels.length) {
    return {
      success: false,
      error: 'No active MLM level configuration found in database. Please configure Level 1-15 rewards in Admin Panel.'
    };
  }

  // 4. Get upline chain from matrix
  const uplineChain = await getMatrixUplineChain(application.memberId);
  if (!uplineChain.length) {
    console.log(`[MLM Reward] Member has no matrix ancestors — no level rewards to distribute`);
  }

  // 4b. Fetch triggering member name + mlmCode for readable descriptions
  const triggeringMember = await MlmMember.findById(application.memberId).select('fullName mlmCode').lean();
  const triggerName = triggeringMember?.fullName || 'Unknown';
  const triggerCode = triggeringMember?.mlmCode || application.memberId.toString();

  // 5. Build reward items from upline + admin database config + level completion check
  const rewardItems = [];
  let totalAmount = 0;

  for (const ancestor of uplineChain) {
    const levelEntry = config.levels.find((l) => l.level === ancestor.level && l.active);
    if (!levelEntry) continue;

    // Get beneficiary userId
    const beneficiaryMember = await MlmMember.findById(ancestor.memberId).select('userId').lean();
    if (!beneficiaryMember) continue;

    const bonusAmount = levelEntry.bonusType === 'FIXED'
      ? Number(levelEntry.bonusAmount)
      : 0;

    // Check if ancestor's level is complete (3^level filled)
    const isComplete = await isLevelComplete(ancestor.matrixNodeId, ancestor.level);

    rewardItems.push({
      beneficiaryMemberId: ancestor.memberId,
      beneficiaryUserId: beneficiaryMember.userId || ancestor.memberId,
      level: ancestor.level,
      bonusAmount,
      bonusType: levelEntry.bonusType,
      status: isComplete ? 'CREDITED' : 'PENDING',
      matrixNodeId: ancestor.matrixNodeId,
      isLevelComplete: isComplete,
    });
    totalAmount += bonusAmount;
  }

  // 6. Create or update MlmReward document
  let rewardDoc = existing;
  if (!rewardDoc) {
    try {
      rewardDoc = await MlmReward.create({
        fdApplicationId,
        triggeringMemberId: application.memberId,
        productId: application.productId,
        levelConfigId: config._id,
        levelConfigVersion: config.version,
        rewardItems: rewardItems.map((item) => ({
          beneficiaryMemberId: item.beneficiaryMemberId,
          beneficiaryUserId: item.beneficiaryUserId,
          level: item.level,
          bonusAmount: item.bonusAmount,
          bonusType: item.bonusType,
          status: item.status,
        })),
        totalRewardAmount: totalAmount,
        status: 'PENDING',
      });
    } catch (err) {
      if (err.code === 11000) {
        rewardDoc = await MlmReward.findOne({ fdApplicationId });
      } else {
        return { success: false, error: err.message };
      }
    }
  }

  // 7. Link reward to application
  await MlmFdApplication.findByIdAndUpdate(fdApplicationId, {
    rewardId: rewardDoc._id,
    rewardGeneratedAt: new Date(),
  });

  // 8. Credit each beneficiary's MLM wallet
  let allCredited = true;
  for (let i = 0; i < rewardItems.length; i++) {
    const item = rewardItems[i];
    if (item.bonusAmount <= 0) continue;

    const txnStatus = item.isLevelComplete ? 'completed' : 'pending';

    const walletResult = await creditMlmWallet(
      item.beneficiaryUserId,
      item.beneficiaryMemberId,
      item.bonusAmount,
      'MATRIX_LEVEL_REWARD',
      `Level ${item.level} reward — from ${triggerName} (${triggerCode}) — ${item.isLevelComplete ? 'Withdrawable' : 'Locked pending Level ' + item.level + ' completion'}`,
      `${rewardDoc._id.toString()}-L${item.level}`,
      {
        configId: config._id,
        configVersion: config.version,
        level: item.level,
        appliedAmount: item.bonusAmount,
      },
      txnStatus
    );

    if (!walletResult) {
      // Could be already credited due to idempotency — check if txn exists
      const { default: MlmWalletTransaction } = await import('@/models/mlm/MlmWalletTransaction');
      const exists = await MlmWalletTransaction.findOne({
        referenceId: `${rewardDoc._id.toString()}-L${item.level}`,
        memberId: item.beneficiaryMemberId,
      });
      if (!exists) {
        allCredited = false;
        await MlmReward.findByIdAndUpdate(rewardDoc._id, {
          [`rewardItems.${i}.status`]: 'FAILED',
          [`rewardItems.${i}.failureReason`]: 'Wallet transaction failed or skipped',
        });
      }
    } else {
      await MlmReward.findByIdAndUpdate(rewardDoc._id, {
        [`rewardItems.${i}.creditedAt`]: item.isLevelComplete ? new Date() : undefined,
      });
    }
  }

  // 9. Update overall reward status
  const finalStatus = allCredited ? 'COMPLETED' : 'PARTIAL';
  await MlmReward.findByIdAndUpdate(rewardDoc._id, { status: finalStatus, processedAt: new Date() });

  // 10. Audit log
  if (adminUserId) {
    try {
      await MlmAuditLog.create({
        action: 'REWARD_GENERATED',
        performedBy: adminUserId,
        performedByRole: 'super_admin',
        performedByName: adminName,
        targetId: rewardDoc._id,
        targetModel: 'MlmReward',
        newValue: { fdApplicationId: fdApplicationId.toString(), totalAmount, status: finalStatus },
      });
    } catch (e) {
      console.warn('[MLM AuditLog] Warning:', e.message);
    }
  }

  console.log(`[MLM Reward] Generated reward ${rewardDoc._id} for FD application ${fdApplicationId} — ₹${totalAmount} across ${rewardItems.length} levels from Admin Config v${config.version}`);
  return { success: true, rewardId: rewardDoc._id };
}

/**
 * Safe, idempotent reconciliation of all verified/eligible FD applications.
 * Ensures rewards and wallet ledger entries exist exactly once for all qualified applications.
 */
export async function reconcileMlmRewards() {
  const verifiedApps = await MlmFdApplication.find({
    status: { $in: ['ELIGIBLE', 'VERIFIED'] },
  }).lean();

  console.log(`[MLM Reconcile] Checking ${verifiedApps.length} verified FD applications...`);
  const results = [];

  for (const app of verifiedApps) {
    const res = await generateMlmReward(app._id, app.reviewedBy, 'Reconciler');
    results.push({ appId: app._id, result: res });
  }

  return results;
}
