import mongoose from "mongoose";

const MlmKycSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember", required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    mlmCode: { type: String, required: true },
    fullName: { type: String, required: true },
    panNumber: { type: String },
    panImageUrl: { type: String },
    aadhaarNumber: { type: String },
    aadhaarFrontUrl: { type: String },
    aadhaarBackUrl: { type: String },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      branchName: { type: String },
      upiId: { type: String },
    },
    // Also keep flat fields for backward compatibility
    bankAccountNumber: { type: String },
    bankIfscCode: { type: String },
    bankName: { type: String },
    bankBranch: { type: String },
    accountHolderName: { type: String },
    passbookOrChequeUrl: { type: String },
    selfieUrl: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED", "CORRECTION_REQUIRED"],
      default: "PENDING",
    },
    adminNotes: { type: String },
    adminRemarks: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    verifiedBy: { type: String },
    verifiedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'mlmkycs' }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmKyc) {
  delete mongoose.models.MlmKyc;
}

export default mongoose.models.MlmKyc || mongoose.model('MlmKyc', MlmKycSchema, 'mlmkycs');
