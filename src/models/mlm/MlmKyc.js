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
    dob: { type: String }, // Date of Birth in DD/MM/YYYY format
    panVerification: {
      status: {
        type: String,
        enum: ["NOT_VERIFIED", "VERIFYING", "VERIFIED", "FAILED", "MISMATCH", "MANUAL_REVIEW"],
        default: "NOT_VERIFIED",
      },
      verified: { type: Boolean, default: false },
      verificationSource: {
        type: String,
        enum: ["AUTOMATIC_APITXT", "ADMIN_MANUAL"],
      },
      nameMatch: { type: Boolean },
      dobMatch: { type: Boolean },
      category: { type: String },
      aadhaarSeedingStatus: { type: String },
      verifiedAt: { type: Date },
      provider: { type: String, default: "APITXT" },
      requestId: { type: String },
      providerMessage: { type: String },
    },
    aadhaarVerification: {
      status: {
        type: String,
        enum: ["NOT_VERIFIED", "OTP_SENT", "VERIFIED", "FAILED", "MISMATCH", "MANUAL_REVIEW"],
        default: "NOT_VERIFIED",
      },
      verified: { type: Boolean, default: false },
      verificationSource: {
        type: String,
        enum: ["AUTOMATIC_APITXT", "ADMIN_MANUAL"],
      },
      referenceId: { type: String }, // Server-side session identifier, never sent to frontend
      referenceIdExpiresAt: { type: Date },
      otpSentAt: { type: Date },
      otpAttempts: { type: Number, default: 0 },
      verifiedAt: { type: Date },
      provider: { type: String, default: "APITXT" },
      requestId: { type: String },
      providerMessage: { type: String },
      verifiedName: { type: String },
    },
    verificationSource: {
      type: String,
      enum: ["AUTOMATIC_APITXT", "ADMIN_MANUAL"],
      default: "AUTOMATIC_APITXT",
    },
    verificationHistory: [
      {
        verificationType: {
          type: String,
          enum: ["PAN", "AADHAAR", "OVERALL_KYC", "BANK", "MANUAL_OVERRIDE"],
          required: true,
        },
        source: {
          type: String,
          enum: ["AUTOMATIC_APITXT", "ADMIN_MANUAL"],
          required: true,
        },
        status: { type: String, required: true },
        provider: { type: String },
        requestId: { type: String },
        maskedIdentifier: { type: String },
        remarks: { type: String },
        performedBy: { type: String },
        performedByRole: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
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
