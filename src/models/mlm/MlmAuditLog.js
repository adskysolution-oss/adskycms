import mongoose from "mongoose";

const MlmAuditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    adminId: { type: String },
    adminEmail: { type: String },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember" },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true, collection: 'mlmauditlogs' }
);

export default mongoose.models.MlmAuditLog || mongoose.model('MlmAuditLog', MlmAuditLogSchema, 'mlmauditlogs');
