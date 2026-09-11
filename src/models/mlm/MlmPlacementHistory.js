import mongoose from "mongoose";

const MlmPlacementHistorySchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember", required: true },
    matrixNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMatrixNode" },
    newNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMatrixNode" },
    parentNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMatrixNode" },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember" },
    level: { type: Number },
    newLevel: { type: Number },
    positionInParent: { type: Number },
    newPosition: { type: Number },
    placedBy: { type: mongoose.Schema.Types.ObjectId },
    placedByRole: { type: String },
    reason: { type: String },
    placedAt: { type: Date, default: Date.now },
    timestamp: { type: Date, default: Date.now },
    placementType: { type: String, enum: ["DIRECT", "SPILLOVER"], default: "DIRECT" },
  },
  { timestamps: true, collection: 'mlmplacementhistories' }
);

export default mongoose.models.MlmPlacementHistory || mongoose.model('MlmPlacementHistory', MlmPlacementHistorySchema, 'mlmplacementhistories');
