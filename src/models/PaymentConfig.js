import mongoose, { Schema } from 'mongoose';
const RoleAmountsSchema = {
    vendor: { type: Number, default: 0 },
    sub_vendor: { type: Number, default: 0 },
    employee: { type: Number, default: 0 },
    recruitment_partner: { type: Number, default: 0 },
    health_vendor: { type: Number, default: 0 },
    health_sub_vendor: { type: Number, default: 0 },
    health_team_leader: { type: Number, default: 0 },
    health_executive: { type: Number, default: 0 },
    mlm_member: { type: Number, default: 100 },
};
const RoleTogglesSchema = {
    vendor: { type: Boolean, default: true },
    sub_vendor: { type: Boolean, default: true },
    employee: { type: Boolean, default: true },
    recruitment_partner: { type: Boolean, default: false },
    health_vendor: { type: Boolean, default: true },
    health_sub_vendor: { type: Boolean, default: true },
    health_team_leader: { type: Boolean, default: true },
    health_executive: { type: Boolean, default: true },
    mlm_member: { type: Boolean, default: true },
};
const RolePaymentAccountsSchema = {
    vendor: { type: String, default: 'sakhihub_cashfree' },
    sub_vendor: { type: String, default: 'sakhihub_cashfree' },
    employee: { type: String, default: 'sakhihub_cashfree' },
    recruitment_partner: { type: String, default: 'sakhihub_cashfree' },
    health_vendor: { type: String, default: 'sakhihub_cashfree' },
    health_sub_vendor: { type: String, default: 'sakhihub_cashfree' },
    health_team_leader: { type: String, default: 'sakhihub_cashfree' },
    health_executive: { type: String, default: 'sakhihub_cashfree' },
    mlm_member: { type: String, default: 'sakhihub_cashfree' },
};
/** Nested schema: { subscription: '', deposit: '' } repeated per role */
const RoleUrlPairSchema = {
    subscription: { type: String, default: '' },
    deposit: { type: String, default: '' },
};
const ProviderGroupSchema = {
    cashfree: {
        appId: { type: String, default: '' },
        secretKey: { type: String, default: '' },
        linkUrls: {
            vendor: RoleUrlPairSchema,
            sub_vendor: RoleUrlPairSchema,
            employee: RoleUrlPairSchema,
            recruitment_partner: RoleUrlPairSchema,
            health_vendor: RoleUrlPairSchema,
            health_sub_vendor: RoleUrlPairSchema,
            health_team_leader: RoleUrlPairSchema,
            health_executive: RoleUrlPairSchema,
            mlm_member: RoleUrlPairSchema,
        }
    },
    phonepe: {
        merchantId: { type: String, default: '' },
        clientId: { type: String, default: '' },
        clientSecret: { type: String, default: '' },
        clientVersion: { type: String, default: '1' },
        webhookSecret: { type: String, default: '' },
        linkUrls: {
            vendor: RoleUrlPairSchema,
            sub_vendor: RoleUrlPairSchema,
            employee: RoleUrlPairSchema,
            recruitment_partner: RoleUrlPairSchema,
            health_vendor: RoleUrlPairSchema,
            health_sub_vendor: RoleUrlPairSchema,
            health_team_leader: RoleUrlPairSchema,
            health_executive: RoleUrlPairSchema,
            mlm_member: RoleUrlPairSchema,
        }
    },
    razorpay: {
        keyId: { type: String, default: '' },
        keySecret: { type: String, default: '' },
        webhookSecret: { type: String, default: '' },
        linkUrls: {
            vendor: RoleUrlPairSchema,
            sub_vendor: RoleUrlPairSchema,
            employee: RoleUrlPairSchema,
            recruitment_partner: RoleUrlPairSchema,
            health_vendor: RoleUrlPairSchema,
            health_sub_vendor: RoleUrlPairSchema,
            health_team_leader: RoleUrlPairSchema,
            health_executive: RoleUrlPairSchema,
            mlm_member: RoleUrlPairSchema,
        }
    }
};
const PaymentConfigSchema = new Schema({
    key: { type: String, required: true, unique: true, default: 'default' },
    subscriptionAmount: RoleAmountsSchema,
    depositAmount: RoleAmountsSchema,
    paymentRequired: RoleTogglesSchema,
    subscriptionRequired: RoleTogglesSchema,
    depositRequired: RoleTogglesSchema,
    paymentRequestUrls: {
        vendor: RoleUrlPairSchema,
        sub_vendor: RoleUrlPairSchema,
        employee: RoleUrlPairSchema,
        recruitment_partner: RoleUrlPairSchema,
        health_vendor: RoleUrlPairSchema,
        health_sub_vendor: RoleUrlPairSchema,
        health_team_leader: RoleUrlPairSchema,
        health_executive: RoleUrlPairSchema,
    },
    paymentAccount: RolePaymentAccountsSchema,
    // NEW V2 PROVIDER FIELDS
    paymentMethod: { type: String, enum: ['payment_link', 'gateway_api', 'manual'], default: 'payment_link' },
    activeProvider: { type: String, default: 'sakhihub_cashfree' },
    activeOrganization: { type: String, enum: ['sakhihub', 'foundation'], default: 'sakhihub' },
    environment: { type: String, enum: ['sandbox', 'production'], default: 'production' },
    providers: ProviderGroupSchema,
    foundationProviders: ProviderGroupSchema,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
if (mongoose.models.PaymentConfig) {
    delete mongoose.models.PaymentConfig;
}
export default mongoose.model('PaymentConfig', PaymentConfigSchema);
