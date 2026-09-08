import mongoose from "mongoose";

const MlmMemberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", sparse: true },
    mlmCode: { type: String, required: true, unique: true, immutable: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String }, // Hashed password for direct member authentication
    pincode: { type: String },
    state: { type: String },
    district: { type: String },
    city: { type: String },
    block: { type: String },
    address: { type: String },
    profileImage: { type: String },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember" },
    sponsorCode: { type: String },
    matrixNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMatrixNode" },
    matrixLevel: { type: Number },
    matrixPosition: { type: Number },
    kycStatus: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "VERIFIED", "APPROVED", "REJECTED", "CORRECTION_REQUIRED"],
      default: "PENDING",
    },
    kycId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmKyc" },
    platformFeePaid: { type: Boolean, default: false },
    platformFeePaymentId: { type: mongoose.Schema.Types.ObjectId },
    platformFeeAmount: { type: Number, min: 0 },
    platformFeeConfigVersion: { type: Number },
    status: {
      type: String,
      enum: ["PENDING_KYC", "PENDING_PAYMENT", "ACTIVE", "SUSPENDED", "DEACTIVATED"],
      default: "PENDING_KYC",
    },
    activatedAt: { type: Date },
    suspendedAt: { type: Date },
    referralToken: { type: String, required: true, unique: true, immutable: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'mlmmembers' }
);

MlmMemberSchema.index({ sponsorId: 1 });
MlmMemberSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.MlmMember || mongoose.model('MlmMember', MlmMemberSchema, 'mlmmembers');
