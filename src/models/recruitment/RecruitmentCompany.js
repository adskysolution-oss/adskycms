import mongoose from "mongoose";

const RecruitmentCompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    industry: { type: String },
    description: { type: String },
    logoUrl: { type: String },
    website: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    address: { type: String },
    state: { type: String },
    isActive: { type: Boolean, default: true },
    openPositions: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "recruitment_companies" }
);

export default mongoose.models.RecruitmentCompany || mongoose.model("RecruitmentCompany", RecruitmentCompanySchema);
