import mongoose from "mongoose";

const RecruitmentPayoutSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentPartner", required: true },
    partnerCode: { type: String },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["milestone", "manual", "referral_commission"] },
    milestoneType: { type: String },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentCandidate" },
    status: { type: String, enum: ["pending", "approved", "processed", "rejected"], default: "pending" },
    transactionReference: { type: String },
    utrNumber: { type: String },
    processedAt: { type: Date },
    processedBy: { type: String },
    notes: { type: String },
  },
  { timestamps: true, collection: "recruitment_payouts" }
);

export default mongoose.models.RecruitmentPayout || mongoose.model("RecruitmentPayout", RecruitmentPayoutSchema);
