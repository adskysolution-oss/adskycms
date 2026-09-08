import mongoose from "mongoose";

const RecruitmentCandidateSchema = new mongoose.Schema(
  {
    candidateCode: { type: String, unique: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentPartner", required: true },
    partnerCode: { type: String, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentJob" },
    jobCode: { type: String },
    fullName: { type: String, required: true },
    email: { type: String },
    mobile: { type: String, required: true },
    aadhaarNumber: { type: String },
    panNumber: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    age: { type: Number },
    state: { type: String },
    district: { type: String },
    address: { type: String },
    qualification: { type: String },
    experience: { type: String },
    skills: [{ type: String }],
    currentEmployer: { type: String },
    expectedSalary: { type: Number },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["submitted", "under_review", "shortlisted", "interview_scheduled", "selected", "rejected", "joined", "not_retained", "retained"],
      default: "submitted",
    },
    joiningDate: { type: Date },
    retentionCheckDate: { type: Date },
    retentionStatus: { type: String, enum: ["pending", "retained", "not_retained"] },
    submittedAt: { type: Date, default: Date.now },
    notes: { type: String },
    adminNotes: { type: String },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentCandidate" },
    referralTrackingId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true, collection: "recruitment_candidates" }
);

RecruitmentCandidateSchema.index({ partnerId: 1, status: 1 });
RecruitmentCandidateSchema.index({ mobile: 1 });

export default mongoose.models.RecruitmentCandidate || mongoose.model("RecruitmentCandidate", RecruitmentCandidateSchema);
