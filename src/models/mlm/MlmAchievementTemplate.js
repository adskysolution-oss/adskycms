import mongoose from 'mongoose';

const MlmAchievementTemplateSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 15,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    badgeName: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      enum: [
        'emerald',
        'cyan',
        'blue',
        'indigo',
        'purple',
        'fuchsia',
        'rose',
        'amber',
        'orange',
        'gold',
        'platinum',
        'titanium',
        'ruby',
        'diamond',
        'crown',
      ],
      default: 'gold',
    },
    congratulationsText: {
      type: String,
      default: 'Congratulations on achieving this remarkable milestone!',
    },
    motivationalMessage: {
      type: String,
      default: 'Your dedication and leadership inspire the entire network.',
    },
    tagline: {
      type: String,
      default: 'People Grow. Dreams Grow.',
    },
    customBackgroundUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowReferralQr: {
      type: Boolean,
      default: true,
    },
    allowReferralCode: {
      type: Boolean,
      default: true,
    },
    defaultCaptionTemplate: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
    collection: 'mlmachievementtemplates',
  }
);

if (mongoose.models?.MlmAchievementTemplate) {
  delete mongoose.models.MlmAchievementTemplate;
}

export default mongoose.models.MlmAchievementTemplate ||
  mongoose.model('MlmAchievementTemplate', MlmAchievementTemplateSchema, 'mlmachievementtemplates');
