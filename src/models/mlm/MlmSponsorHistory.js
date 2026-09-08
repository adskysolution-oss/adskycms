import mongoose from "mongoose";

const MlmSponsorHistorySchema = new mongoose.Schema(
  {
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember", required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember", required: true },
    sponsoredAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'mlmsponsorhistories' }
);

export default mongoose.models.MlmSponsorHistory || mongoose.model('MlmSponsorHistory', MlmSponsorHistorySchema, 'mlmsponsorhistories');
