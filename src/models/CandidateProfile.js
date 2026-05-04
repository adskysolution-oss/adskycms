import mongoose from 'mongoose';

const candidateProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    skills: { type: [String], default: [] },
    resumeUrl: { type: String, default: '' },
    experience: { type: String, default: '' },
    education: { type: String, default: '' },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    currentCompany: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.CandidateProfile || mongoose.model('CandidateProfile', candidateProfileSchema);
