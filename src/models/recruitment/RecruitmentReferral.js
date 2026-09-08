import mongoose from "mongoose";

const RecruitmentReferralSchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentPartner" },
    referralToken: { type: String, unique: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentJob" },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentCandidate" },
    status: { type: String, enum: ["active", "used", "expired"], default: "active" },
    clickCount: { type: Number, default: 0 },
    convertedAt: { type: Date },
  },
  { timestamps: true, collection: "recruitment_referrals" }
);

export default mongoose.models.RecruitmentReferral || mongoose.model("RecruitmentReferral", RecruitmentReferralSchema);
