import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    icon: { type: String, default: 'FaCode' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ order: 1 });
serviceSchema.index({ isActive: 1 });

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);
