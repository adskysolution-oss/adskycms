import mongoose, { Schema } from 'mongoose';

const MlmWalletSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, sparse: true },
    memberId: { type: Schema.Types.ObjectId, ref: 'MlmMember', required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    lifetimeEarnings: { type: Number, default: 0, min: 0 },
    totalWithdrawn: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'mlmwallets' }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmWallet) {
  delete mongoose.models.MlmWallet;
}

export default mongoose.models.MlmWallet ||
  mongoose.model('MlmWallet', MlmWalletSchema, 'mlmwallets');
