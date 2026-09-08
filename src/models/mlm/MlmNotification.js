import mongoose from "mongoose";

const MlmNotificationSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, collection: 'mlmnotifications' }
);

export default mongoose.models.MlmNotification || mongoose.model('MlmNotification', MlmNotificationSchema, 'mlmnotifications');
