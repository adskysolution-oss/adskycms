import mongoose from "mongoose";

const RecruitmentPaymentSchema = new mongoose.Schema(
  {
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "RecruitmentPartner", required: true },
    type: { type: String, enum: ["subscription", "deposit"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
    orderId: { type: String },
    transactionId: { type: String },
    paymentGateway: { type: String, default: "cashfree" },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },
    paidAt: { type: Date },
  },
  { timestamps: true, collection: "recruitment_payments" }
);

export default mongoose.models.RecruitmentPayment || mongoose.model("RecruitmentPayment", RecruitmentPaymentSchema);
