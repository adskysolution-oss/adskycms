import mongoose from "mongoose";

const MlmMarketingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    contentType: {
      type: String,
      enum: ["POSTER", "BANNER", "VIDEO", "REEL", "WHATSAPP", "CAPTION", "PPT", "PDF", "SCRIPT"],
      required: true,
    },
    url: { type: String },
    thumbnailUrl: { type: String },
    caption: { type: String },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    uploadedBy: { type: String },
  },
  { timestamps: true, collection: 'mlmmarketings' }
);

export default mongoose.models.MlmMarketing || mongoose.model('MlmMarketing', MlmMarketingSchema, 'mlmmarketings');
