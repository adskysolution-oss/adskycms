import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['admin', 'employer', 'candidate', 'user'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'banned'],
      default: 'pending',
      index: true
    },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    lastLogin: { type: Date },
    skills: { type: [String], default: [] },
    resumeUrl: { type: String, default: '' },
    experience: [{
      title: String,
      company: String,
      duration: String
    }],
    education: [{
      degree: String,
      school: String,
      year: String
    }],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    isActive: { type: Boolean, default: true },

  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', userSchema);
