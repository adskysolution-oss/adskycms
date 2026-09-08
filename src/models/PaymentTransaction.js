import mongoose, { Schema } from 'mongoose';
const PaymentTransactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['subscription', 'deposit', 'product_order', 'health_service_booking', 'platform_fee'], required: true },
    role: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
        type: String,
        enum: ['created', 'pending', 'paid', 'completed', 'success', 'failed', 'refunded'],
        default: 'created',
    },
    cashfreeOrderId: { type: String, unique: true, sparse: true },
    cashfreePaymentId: { type: String },
    paymentSessionId: { type: String },
    paymentUrl: { type: String },
    paymentMethod: { type: String },
    provider: { type: String },
    organization: { type: String, default: 'sakhihub' },
    planKey: { type: String },
    planId: { type: Schema.Types.ObjectId, ref: 'MembershipPlan' },
    planName: { type: String },
    purchaseType: { type: String, enum: ['NEW_MEMBERSHIP', 'UPGRADE_MEMBERSHIP'], default: 'NEW_MEMBERSHIP' },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewayReferenceId: { type: String },
    webhookReceived: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    gatewayResponse: { type: Schema.Types.Mixed },
    failureReason: { type: String },
    paidAt: { type: Date },
    emailSent: { type: Boolean, default: false },
    businessModule: { type: String, enum: ['subscription', 'product', 'wallet', 'donation', 'training', 'exam', 'health', 'mlm'] },
    entityType: { type: String, enum: ['subscription', 'product', 'donation', 'appointment', 'mlm'] },
    entityId: { type: Schema.Types.ObjectId }, // Remove refPath constraint to allow direct references to HealthAppointment
}, { timestamps: true });
// Compound index for quick lookups: find latest transaction for a user+type
PaymentTransactionSchema.index({ userId: 1, type: 1, status: 1 });
if (mongoose.models.PaymentTransaction) {
    delete mongoose.models.PaymentTransaction;
}
export default mongoose.model('PaymentTransaction', PaymentTransactionSchema);
