import mongoose from 'mongoose';

const MlmPasswordResetSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MlmMember',
      required: true,
      index: true,
    },
    identifier: { type: String, required: true },
    mobile: { type: String },
    email: { type: String },
    method: {
      type: String,
      enum: ['MOBILE', 'EMAIL'],
      default: 'MOBILE',
    },
    otp: { type: String, required: true },
    otpExpires: {
      type: Date,
      required: true,
      index: { expires: 900 }, // 15 mins TTL
    },
    otpAttempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'mlm_password_resets' }
);

if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmPasswordReset) {
  delete mongoose.models.MlmPasswordReset;
}

export default mongoose.models.MlmPasswordReset ||
  mongoose.model('MlmPasswordReset', MlmPasswordResetSchema);
