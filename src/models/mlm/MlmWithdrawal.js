import mongoose from "mongoose";

const MlmWithdrawalSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember", required: true },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmWallet", required: true },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PROCESSED", "FAILED"],
      default: "PENDING",
    },
    bankAccountNumber: { type: String },
    bankIfscCode: { type: String },
    bankName: { type: String },
    accountHolderName: { type: String },
    upiId: { type: String },
    paymentMode: { type: String, enum: ["BANK_TRANSFER", "UPI"], default: "BANK_TRANSFER" },
    transactionId: { type: String },
    utrNumber: { type: String },
    processedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    adminNotes: { type: String },
    processedBy: { type: String },
  },
  { timestamps: true, collection: 'mlmwithdrawals' }
);

MlmWithdrawalSchema.index({ memberId: 1, status: 1 });

export default mongoose.models.MlmWithdrawal || mongoose.model('MlmWithdrawal', MlmWithdrawalSchema, 'mlmwithdrawals');
