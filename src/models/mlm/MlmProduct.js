import mongoose, { Schema } from 'mongoose';
const MlmProductSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, required: true, default: 'FD_CARD' },
    providerId: { type: Schema.Types.ObjectId, ref: 'CorporateProvider' },
    providerName: { type: String },
    logo: { type: String },
    description: { type: String },
    benefits: [{ type: String }],
    eligibility: { type: String },
    terms: { type: String },
    faq: [{ question: { type: String }, answer: { type: String }, _id: false }],
    referralUrl: { type: String },
    applicationUrl: { type: String },
    interestRate: { type: String, default: 'Up to 9.0% p.a.' },
    trackingCode: { type: String },
    requiredDocuments: [{ type: String }],
    minAmount: { type: Number, min: 0, default: 2000 },
    maxAmount: { type: Number, min: 0, default: 2000 },
    creditLimit: { type: Number, min: 0, default: 1800 },
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'], default: 'ACTIVE' },
    displayOrder: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
MlmProductSchema.index({ status: 1, displayOrder: 1 });
if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmProduct) {
    delete mongoose.models.MlmProduct;
}
export default mongoose.models.MlmProduct ||
    mongoose.model('MlmProduct', MlmProductSchema, 'mlmproducts');
