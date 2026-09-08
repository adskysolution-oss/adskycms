import mongoose, { Schema } from 'mongoose';
const MlmFdApplicationSchema = new Schema({
    memberId: { type: Schema.Types.ObjectId, ref: 'MlmMember', required: true, immutable: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    productId: { type: Schema.Types.ObjectId, ref: 'MlmProduct', required: true, immutable: true },
    applicantName: { type: String, required: true },
    applicantMobile: { type: String, required: true },
    applicantEmail: { type: String },
    applicationReference: { type: String },
    maskedCardNumber: { type: String },
    providerUrl: { type: String },
    applicationDate: { type: Date },
    documents: {
        applicationScreenshot: { url: String, publicId: String },
        bankStatement: { url: String, publicId: String },
        fdCertificate: { url: String, publicId: String },
    },
    fdAmount: { type: Number, min: 0, default: 2000 },
    creditLimit: { type: Number, min: 0, default: 1800 },
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'ELIGIBLE', 'REJECTED', 'CORRECTION_REQUIRED', 'CANCELLED', 'REVERSED'],
        default: 'PENDING',
    },
    adminRemarks: { type: String },
    correctionRemarks: { type: String },
    rejectionReason: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    eligibleAt: { type: Date },
    rewardId: { type: Schema.Types.ObjectId, ref: 'MlmReward' },
    rewardGeneratedAt: { type: Date },
    rewardIdempotencyKey: { type: String, required: true, unique: true },
}, { timestamps: true });
MlmFdApplicationSchema.index({ memberId: 1, status: 1 });
MlmFdApplicationSchema.index({ productId: 1, applicationReference: 1 });
if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmFdApplication) {
    delete mongoose.models.MlmFdApplication;
}
export default mongoose.models.MlmFdApplication ||
    mongoose.model('MlmFdApplication', MlmFdApplicationSchema, 'mlmfdapplications');
