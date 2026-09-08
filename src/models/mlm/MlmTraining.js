import mongoose from "mongoose";

const MlmTrainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String },
    documentUrl: { type: String },
    thumbnailUrl: { type: String },
    category: { type: String },
    duration: { type: String },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true, collection: 'mlmtrainings' }
);

export default mongoose.models.MlmTraining || mongoose.model('MlmTraining', MlmTrainingSchema, 'mlmtrainings');
