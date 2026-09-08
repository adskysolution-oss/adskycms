import mongoose from "mongoose";

const RecruitmentConfigSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    referralEnabled: { type: Boolean, default: true },
    subscriptionFeeRequired: { type: Boolean, default: false },
    subscriptionFeeAmount: { type: Number, default: 0 },
    retentionPeriodDays: { type: Number, default: 90 },
    milestonePayouts: [
      {
        type: { type: String },
        triggerEvent: { type: String },
        amount: { type: Number },
        isActive: { type: Boolean, default: true },
      },
    ],
    commissionRate: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: String },
  },
  { timestamps: true, collection: "recruitment_configs" }
);

export default mongoose.models.RecruitmentConfig || mongoose.model("RecruitmentConfig", RecruitmentConfigSchema);
