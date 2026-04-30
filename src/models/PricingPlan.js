import mongoose from 'mongoose';

const pricingPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    currency: { type: String, default: '₹' },
    period: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    description: { type: String, default: '' },
    features: [{ type: String }],
    highlighted: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pricingPlanSchema.index({ order: 1 });
pricingPlanSchema.index({ isActive: 1 });

export default mongoose.models.PricingPlan || mongoose.model('PricingPlan', pricingPlanSchema);
