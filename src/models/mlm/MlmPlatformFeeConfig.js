import mongoose from "mongoose";

const MlmPlatformFeeConfigSchema = new mongoose.Schema(
  {
    version:         { type: Number, required: true, unique: true },
    feeAmount:       { type: Number, required: true, min: 0 },
    gstPercent:      { type: Number, default: 0 },
    totalAmount:     { type: Number, required: true },
    isActive:        { type: Boolean, default: true },
    description:     { type: String },
    paymentProvider: { type: String, default: 'adsky_cashfree' },
    effectiveFrom:   { type: Date, default: Date.now },
    updatedBy:       { type: String },
  },
  { timestamps: true, collection: 'mlmplatformfeeconfigs' }
);


export default mongoose.models.MlmPlatformFeeConfig || mongoose.model('MlmPlatformFeeConfig', MlmPlatformFeeConfigSchema, 'mlmplatformfeeconfigs');
