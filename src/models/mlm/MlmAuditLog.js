import mongoose from "mongoose";

const MlmAuditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.Mixed },
    performedByRole: { type: String },
    performedByName: { type: String },
    targetId: { type: mongoose.Schema.Types.Mixed },
    targetModel: { type: String },
    reason: { type: String },
    newValue: { type: mongoose.Schema.Types.Mixed },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    adminId: { type: String },
    adminEmail: { type: String },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember" },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true, collection: 'mlmauditlogs', strict: false }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmAuditLog) {
  delete mongoose.models.MlmAuditLog;
}

export default mongoose.models.MlmAuditLog || mongoose.model('MlmAuditLog', MlmAuditLogSchema, 'mlmauditlogs');
