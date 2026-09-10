import mongoose from "mongoose";

const LevelItemSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true, min: 1, max: 15 },
    bonusAmount: { type: Number, default: 0 },
    rewardAmount: { type: Number },
    bonusType: { type: String, enum: ['FIXED', 'PERCENTAGE'], default: 'FIXED' },
    active: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    capacity: { type: Number },
  },
  { _id: false }
);

const MlmLevelConfigSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['active', 'inactive', 'draft', 'archived'], default: 'active' },
    effectiveFrom: { type: Date, default: Date.now },
    effectiveTo: { type: Date },
    levels: { type: [LevelItemSchema], default: [] },
    sponsorBonusAmount: { type: Number },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.Mixed },
    updatedBy: { type: String },

    // Optional legacy flat fields
    level: { type: Number },
    rewardAmount: { type: Number },
    capacity: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'mlmlevelconfigs', strict: false }
);

if (mongoose.models?.MlmLevelConfig) {
  delete mongoose.models.MlmLevelConfig;
}

export default mongoose.models.MlmLevelConfig || mongoose.model('MlmLevelConfig', MlmLevelConfigSchema, 'mlmlevelconfigs');

