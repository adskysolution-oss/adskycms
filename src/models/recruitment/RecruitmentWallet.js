import mongoose from "mongoose";

const RecruitmentWalletSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentPartner", required: true, unique: true },
    partnerCode: { type: String, required: true },
    balance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "recruitment_wallets" }
);

export default mongoose.models.RecruitmentWallet || mongoose.model("RecruitmentWallet", RecruitmentWalletSchema);
