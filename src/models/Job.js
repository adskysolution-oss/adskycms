import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    location: { type: String, required: true },
    salary: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Field Work'],
      required: true 
    },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    experience: { type: String, default: 'Entry Level' },
    skills: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    deadline: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model('Job', jobSchema);
