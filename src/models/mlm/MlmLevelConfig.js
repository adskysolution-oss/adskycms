import mongoose from "mongoose";

const MlmLevelConfigSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true, unique: true, min: 1, max: 15 },
    rewardAmount: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String },
    updatedBy: { type: String },
    version: { type: Number, default: 1 },
  },
  { timestamps: true, collection: 'mlmlevelconfigs' }
);

export default mongoose.models.MlmLevelConfig || mongoose.model('MlmLevelConfig', MlmLevelConfigSchema, 'mlmlevelconfigs');
