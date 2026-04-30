import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    size: { type: Number },
    folder: { type: String, default: 'general' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

mediaSchema.index({ folder: 1, createdAt: -1 });

export default mongoose.models.Media || mongoose.model('Media', mediaSchema);
