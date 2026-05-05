import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['applied', 'shortlisted', 'interviewing', 'selected', 'rejected'], 
      default: 'applied' 
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Application || mongoose.model('Application', applicationSchema);
