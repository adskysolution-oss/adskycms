import mongoose, { Schema } from 'mongoose';

/**
 * MLM Reward — generated only after FD application reaches ELIGIBLE status.
 * One reward document per eligible FD application — duplicates prevented by unique constraint.
 * 
 * Each reward distributes level bonuses (L1–L15) across the member's matrix ancestors.
 */
const RewardItemSchema = new Schema(
  {
    beneficiaryMemberId: { type: Schema.Types.ObjectId, ref: 'MlmMember', required: true },
    beneficiaryUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: Number, required: true, min: 1, max: 15 },
    bonusAmount: { type: Number, required: true, min: 0 },
    bonusType: { type: String, enum: ['FIXED', 'PERCENTAGE'], default: 'FIXED' },
    status: { type: String, enum: ['PENDING', 'CREDITED', 'FAILED', 'REVERSED'], default: 'PENDING' },
    walletTransactionId: { type: Schema.Types.ObjectId, ref: 'MlmWalletTransaction' },
    creditedAt: { type: Date },
    failureReason: { type: String },
  },
  { _id: false }
);

const MlmRewardSchema = new Schema(
  {
    fdApplicationId: { type: Schema.Types.ObjectId, ref: 'MlmFdApplication', required: true, unique: true },
    triggeringMemberId: { type: Schema.Types.ObjectId, ref: 'MlmMember', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'MlmProduct', required: true },
    levelConfigId: { type: Schema.Types.ObjectId, ref: 'MlmLevelConfig', required: true },
    levelConfigVersion: { type: Number, required: true },
    rewardItems: { type: [RewardItemSchema], required: true },
    totalRewardAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REVERSED'], default: 'PENDING' },
    processedAt: { type: Date },
  },
  { timestamps: true, collection: 'mlmrewards' }
);

// One reward per FD application — prevents duplicate reward generation
MlmRewardSchema.index({ triggeringMemberId: 1, createdAt: -1 });
MlmRewardSchema.index({ status: 1 });
MlmRewardSchema.index({ 'rewardItems.beneficiaryMemberId': 1 });
MlmRewardSchema.index({ 'rewardItems.beneficiaryUserId': 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmReward) {
  delete mongoose.models.MlmReward;
}

export default mongoose.models.MlmReward ||
  mongoose.model('MlmReward', MlmRewardSchema, 'mlmrewards');
