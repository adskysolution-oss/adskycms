import mongoose from "mongoose";

const RecruitmentAuditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    adminId: { type: String },
    adminEmail: { type: String },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentPartner" },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentCandidate" },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: true, collection: "recruitment_audit_logs" }
);

export default mongoose.models.RecruitmentAuditLog || mongoose.model("RecruitmentAuditLog", RecruitmentAuditLogSchema);
