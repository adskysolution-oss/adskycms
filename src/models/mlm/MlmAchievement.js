import mongoose from 'mongoose';

const MlmAchievementSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MlmMember',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 15,
    },
    status: {
      type: String,
      enum: ['UNLOCKED', 'POSTER_GENERATED', 'SHARED'],
      default: 'UNLOCKED',
    },
    completedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    posterUrl: {
      type: String,
      default: '',
    },
    posterPublicId: {
      type: String,
      default: '',
    },
    lastGeneratedAt: {
      type: Date,
    },
    generationCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
    },
    downloadsCount: {
      type: Number,
      default: 0,
    },
    lastSharedAt: {
      type: Date,
    },
    lastDownloadedAt: {
      type: Date,
    },
    customCaption: {
      type: String,
      default: '',
    },
    referralCodeIncluded: {
      type: Boolean,
      default: true,
    },
    referralQrIncluded: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'mlmachievements',
  }
);

// Compound unique index ensuring only one achievement record per member per level
MlmAchievementSchema.index({ memberId: 1, level: 1 }, { unique: true });
MlmAchievementSchema.index({ level: 1, status: 1 });

if (mongoose.models?.MlmAchievement) {
  delete mongoose.models.MlmAchievement;
}

export default mongoose.models.MlmAchievement ||
  mongoose.model('MlmAchievement', MlmAchievementSchema, 'mlmachievements');
