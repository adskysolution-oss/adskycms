import mongoose from "mongoose";

const MlmPlacementHistorySchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember", required: true },
    matrixNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMatrixNode", required: true },
    parentNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMatrixNode" },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember" },
    level: { type: Number, required: true },
    positionInParent: { type: Number },
    placedAt: { type: Date, default: Date.now },
    placementType: { type: String, enum: ["DIRECT", "SPILLOVER"], default: "DIRECT" },
  },
  { timestamps: true, collection: 'mlmplacementhistories' }
);

export default mongoose.models.MlmPlacementHistory || mongoose.model('MlmPlacementHistory', MlmPlacementHistorySchema, 'mlmplacementhistories');
