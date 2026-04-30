import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true },
    image: { type: String, default: '' },
    bio: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

teamMemberSchema.index({ order: 1 });

export default mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema);
