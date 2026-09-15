import mongoose from "mongoose";

const MlmRateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    count: { type: Number, required: true, default: 1 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "mlmratelimits" }
);

// TTL index to automatically clean up old rate limits in the background
MlmRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (process.env.NODE_ENV !== "production" && mongoose.models?.MlmRateLimit) {
  delete mongoose.models.MlmRateLimit;
}

export default mongoose.models.MlmRateLimit || mongoose.model("MlmRateLimit", MlmRateLimitSchema, "mlmratelimits");
