import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, default: 'job' }, // e.g., 'job', 'blog'
    icon: { type: String, default: 'FaBriefcase' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    tag: { type: String, default: 'Remote' }, // e.g., 'Remote', 'Field Work'
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
