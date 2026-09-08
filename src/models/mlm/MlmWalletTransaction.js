import mongoose, { Schema } from 'mongoose';

const MlmWalletTransactionSchema = new Schema(
  {
    walletId: { type: Schema.Types.ObjectId, ref: 'MlmWallet', required: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'MlmMember', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    category: {
      type: String,
      enum: ['MATRIX_LEVEL_REWARD', 'SPONSOR_REWARD', 'FD_REWARD', 'ADJUSTMENT', 'WITHDRAWAL', 'REVERSAL'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
    description: { type: String, required: true },
    level: { type: Number, min: 1, max: 15 },
    referenceId: { type: String },
    referenceModel: { type: String },
    levelConfigSnapshot: {
      configId: { type: Schema.Types.ObjectId, ref: 'MlmLevelConfig' },
      configVersion: { type: Number },
      level: { type: Number },
      appliedAmount: { type: Number },
    },
  },
  { timestamps: true, collection: 'mlmwallettransactions' }
);

// Idempotency: prevent duplicate credit for same reward/level
MlmWalletTransactionSchema.index(
  { referenceId: 1, memberId: 1, category: 1, type: 1 },
  { unique: true, sparse: true }
);
MlmWalletTransactionSchema.index({ memberId: 1, createdAt: -1 });
MlmWalletTransactionSchema.index({ status: 1 });
MlmWalletTransactionSchema.index({ category: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmWalletTransaction) {
  delete mongoose.models.MlmWalletTransaction;
}

export default mongoose.models.MlmWalletTransaction ||
  mongoose.model('MlmWalletTransaction', MlmWalletTransactionSchema, 'mlmwallettransactions');
