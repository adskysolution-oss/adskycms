import mongoose from "mongoose";

const MlmGeneralConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
    label: { type: String },
    description: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true, collection: 'mlmgeneralconfigs' }
);

export default mongoose.models.MlmGeneralConfig || mongoose.model('MlmGeneralConfig', MlmGeneralConfigSchema, 'mlmgeneralconfigs');
