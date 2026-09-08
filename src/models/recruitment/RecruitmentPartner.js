import mongoose from "mongoose";

const DocumentEntrySchema = new mongoose.Schema({
  url: { type: String },
  publicId: { type: String },
  fileName: { type: String },
  status: {
    type: String,
    enum: ["uploaded", "under_review", "verified", "rejected", "pending"],
    default: "pending",
  },
  uploadedAt: { type: Date },
  verificationRemarks: { type: String },
  rejectionReason: { type: String },
}, { _id: false });

const RecruitmentPartnerSchema = new mongoose.Schema(
  {
    partnerCode: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date },
    gstNumber: { type: String },
    panNumber: { type: String },
    aadhaarNumber: { type: String },
    state: { type: String },
    district: { type: String },
    address: { type: String },
    pincode: { type: String },
    status: {
      type: String,
      enum: ["pending_approval", "active", "rejected", "suspended"],
      default: "pending_approval",
    },
    profileStatus: { type: String, enum: ["incomplete", "completed"], default: "incomplete" },
    documentStatus: { type: String, enum: ["pending", "uploaded", "under_review", "verified", "rejected"], default: "pending" },
    agreementStatus: { type: String, enum: ["not_available", "pending", "generated", "downloaded", "uploaded", "under_review", "approved", "rejected"], default: "not_available" },
    paymentStatus: { type: String, enum: ["not_required", "pending", "completed", "failed"], default: "not_required" },
    verificationStatus: { type: String, enum: ["pending", "under_review", "approved", "rejected"], default: "pending" },
    dashboardAccess: { type: Boolean, default: false },
    recruitmentPartnerType: { type: String },
    subscriptionPayment: {
      required: { type: Boolean, default: false },
      amount: { type: Number, default: 0 },
      status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
      transactionId: { type: String },
      paidAt: { type: Date },
    },
    documents: {
      type: Map,
      of: DocumentEntrySchema,
      default: {},
    },
    agreementUrl: { type: String },
    referralCode: { type: String, unique: true, sparse: true },
    commissionConfig: { type: mongoose.Schema.Types.Mixed },
    verifiedAt: { type: Date },
    verifiedBy: { type: String },
    rejectedAt: { type: Date },
    rejectedBy: { type: String },
    rejectionReason: { type: String },
    timeline: [
      {
        event: { type: String },
        details: { type: String },
        actor: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: "recruitment_partners" }
);

RecruitmentPartnerSchema.index({ status: 1 });
// partnerCode indexed in schema definition

export default mongoose.models.RecruitmentPartner || mongoose.model("RecruitmentPartner", RecruitmentPartnerSchema);
