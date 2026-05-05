import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },

    technologies: [{ type: String }],
    link: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

projectSchema.index({ order: 1 });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
