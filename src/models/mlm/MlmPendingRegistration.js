import mongoose from "mongoose";

const MlmPendingRegistrationSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    type: { type: String, default: "mlm_registration" },
    otp: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    otpAttempts: { type: Number, default: 0 },
    verificationMethod: { type: String, enum: ['EMAIL', 'MOBILE'], default: 'MOBILE' },
    fullName: { type: String, required: true },
    password: { type: String, required: true }, // already hashed before storing
    sponsorCode: { type: String, required: true },
    pincode: { type: String },
    state: { type: String },
    district: { type: String },
    city: { type: String },
    block: { type: String },
    address: { type: String },
    termsAccepted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "mlm_pending_registrations",
  }
);

// Auto-expire after 24 hours
MlmPendingRegistrationSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 86400 });
MlmPendingRegistrationSchema.index({ mobile: 1, type: 1 });
MlmPendingRegistrationSchema.index({ email: 1, type: 1 });

if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmPendingRegistration) {
  delete mongoose.models.MlmPendingRegistration;
}

export default mongoose.models.MlmPendingRegistration || mongoose.model("MlmPendingRegistration", MlmPendingRegistrationSchema);
