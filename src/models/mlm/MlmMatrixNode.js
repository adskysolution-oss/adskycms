import mongoose from "mongoose";

const MlmMatrixNodeSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMember", required: true, unique: true },
    mlmCode: { type: String, required: true },
    parentNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "MlmMatrixNode", default: null },
    positionInParent: { type: Number, enum: [1, 2, 3], default: null },
    level: { type: Number, required: true, min: 1, max: 15 },
    ancestorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "MlmMatrixNode" }],
    isRoot: { type: Boolean, default: false },
    subtreeCount: { type: Number, default: 0 },
    childCount: { type: Number, default: 0 },
    directChildIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "MlmMatrixNode" }],
  },
  { timestamps: true, collection: 'mlmmatrixnodes' }
);

MlmMatrixNodeSchema.index({ parentNodeId: 1 });
MlmMatrixNodeSchema.index({ level: 1 });
MlmMatrixNodeSchema.index({ memberId: 1 });

export default mongoose.models.MlmMatrixNode || mongoose.model('MlmMatrixNode', MlmMatrixNodeSchema, 'mlmmatrixnodes');
