import mongoose from "mongoose";
import { DEFAULT_SHARE_MESSAGE } from "@/constants/mlmShare.js";

const MlmShareConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    title: { type: String, default: "NextView Referral WhatsApp Share" },
    messageTemplate: { type: String, default: DEFAULT_SHARE_MESSAGE },
    posterUrl: { type: String, default: "" },
    posterPublicId: { type: String, default: "" },
    posterTitle: { type: String, default: "NextView Official Promotional Poster" },
    includePosterUrlInText: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: String },
  },
  { timestamps: true, collection: 'mlmshareconfigs' }
);

export default mongoose.models.MlmShareConfig || mongoose.model('MlmShareConfig', MlmShareConfigSchema, 'mlmshareconfigs');
