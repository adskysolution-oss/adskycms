import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['registration', 'password_reset'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '10m' }, // Automatically delete after 10 minutes
    },
  },
  { timestamps: true }
);

export default mongoose.models.OTPVerification || mongoose.model('OTPVerification', otpVerificationSchema);
