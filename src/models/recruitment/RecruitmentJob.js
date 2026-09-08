import mongoose from "mongoose";

const RecruitmentJobSchema = new mongoose.Schema(
  {
    jobCode: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    company: { type: String },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentCompany" },
    location: { type: String },
    locationType: { type: String, enum: ["onsite", "remote", "hybrid"], default: "onsite" },
    jobType: { type: String, enum: ["full_time", "part_time", "contract", "internship"], default: "full_time" },
    department: { type: String },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    experience: { type: String },
    qualifications: [{ type: String }],
    skills: [{ type: String }],
    openings: { type: Number, default: 1 },
    genderPreference: { type: String, enum: ["any", "male", "female"], default: "any" },
    ageMin: { type: Number },
    ageMax: { type: Number },
    applicationDeadline: { type: Date },
    isActive: { type: Boolean, default: true },
    partnerCommission: { type: Number },
    commissionType: { type: String, enum: ["fixed", "percentage"], default: "fixed" },
    candidatesRequired: { type: Number },
    candidatesSubmitted: { type: Number, default: 0 },
    referralTrackingEnabled: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "recruitment_jobs" }
);

export default mongoose.models.RecruitmentJob || mongoose.model("RecruitmentJob", RecruitmentJobSchema);
