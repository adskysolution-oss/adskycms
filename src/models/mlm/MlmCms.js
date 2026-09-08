import mongoose, { Schema } from 'mongoose';
const MlmCmsSchema = new Schema({
    section: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String },
    subtitle: { type: String },
    body: { type: String },
    imageUrl: { type: String },
    videoUrl: { type: String },
    ctaText: { type: String },
    ctaLink: { type: String },
    items: [
        {
            title: { type: String },
            body: { type: String },
            iconUrl: { type: String },
            order: { type: Number, default: 0 },
            _id: false,
        },
    ],
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
    displayOrder: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
MlmCmsSchema.index({ section: 1, status: 1 });
if (process.env.NODE_ENV !== 'production' && mongoose.models?.MlmCms) {
    delete mongoose.models.MlmCms;
}
export default mongoose.models.MlmCms ||
    mongoose.model('MlmCms', MlmCmsSchema, 'mlmcms');
