import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import MlmPlatformFeeConfig from '@/models/mlm/MlmPlatformFeeConfig';
import PaymentConfig from '@/models/PaymentConfig';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
export async function GET() {
    try {
        const session = await getAuthUser();
        if (!session || !['admin', 'super_admin', 'operations_admin'].includes(session.role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const paymentConfig = await PaymentConfig.findOne({ key: 'default' }).lean();
        const feeConfig = await MlmPlatformFeeConfig.findOne({ status: 'active' }).sort({ version: -1 }).lean();
        const configData = {
            registrationEnabled: true,
            requireSponsorCode: true,
            allowDirectPublicRegistrationWithoutSponsor: false,
            otpVerificationRequired: true,
            otpMethods: ['MOBILE', 'EMAIL'],
            kycRequired: true,
            panRequired: true,
            aadhaarRequired: true,
            bankDetailsRequired: true,
            kycApprovalRequiredBeforeActivation: true,
            platformFeeRequired: paymentConfig?.subscriptionRequired?.mlm_member ?? feeConfig?.activationRequired ?? true,
            platformFeeAmount: paymentConfig?.subscriptionAmount?.mlm_member ?? feeConfig?.amount ?? 100,
            currency: feeConfig?.currency ?? 'INR',
            paymentProvider: paymentConfig?.paymentAccount?.mlm_member ?? feeConfig?.paymentGateway ?? 'sakhihub_cashfree',
            rewardsEnabled: true,
            withdrawalsEnabled: true,
            minWithdrawalAmount: 100,
            maxWithdrawalAmount: 50000,
            manualWithdrawalApproval: true,
            bankTransferEnabled: true,
            upiEnabled: true,
            walletEnabled: true,
            version: feeConfig?.version ?? 1,
        };
        return NextResponse.json({
            success: true,
            data: configData,
        });
    }
    catch (error) {
        console.error('Error fetching MLM configuration:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        const session = await getAuthUser();
        if (!session || !['admin', 'super_admin', 'operations_admin'].includes(session.role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const body = await req.json();
        const { auditReason, ...configPayload } = body;
        const amount = Number(configPayload.platformFeeAmount) || 100;
        const required = configPayload.platformFeeRequired !== false;
        const provider = configPayload.paymentProvider || 'sakhihub_cashfree';
        // 1. Update MlmPlatformFeeConfig
        const updatedFeeConfig = await MlmPlatformFeeConfig.findOneAndUpdate({ status: 'active' }, {
            feeName: 'MLM Platform Activation Charge',
            amount,
            activationRequired: required,
            paymentGateway: provider,
            effectiveFrom: new Date(),
            status: 'active',
            $inc: { version: 1 },
        }, { upsert: true, new: true });
        // 2. Update PaymentConfig to stay in sync
        let paymentConfig = await PaymentConfig.findOne({ key: 'default' });
        if (paymentConfig) {
            const subAmount = paymentConfig.subscriptionAmount || {};
            const subReq = paymentConfig.subscriptionRequired || {};
            const payAcc = paymentConfig.paymentAccount || {};
            subAmount.mlm_member = amount;
            subReq.mlm_member = required;
            payAcc.mlm_member = provider;
            paymentConfig.subscriptionAmount = subAmount;
            paymentConfig.subscriptionRequired = subReq;
            paymentConfig.paymentAccount = payAcc;
            paymentConfig.markModified('subscriptionAmount');
            paymentConfig.markModified('subscriptionRequired');
            paymentConfig.markModified('paymentAccount');
            await paymentConfig.save();
        }
        // 3. Log Audit
        try {
            await MlmAuditLog.create({
                action: 'UPDATE_CONFIG',
                adminId: session.id,
                adminEmail: session.email || 'admin@sakhihub.com',
                details: {
                    platformFeeAmount: amount,
                    platformFeeRequired: required,
                    paymentProvider: provider,
                    auditReason: auditReason || 'MLM Configuration updated by super admin',
                },
            });
        }
        catch (auditErr) {
            console.warn('MLM Audit Log warning:', auditErr.message);
        }
        return NextResponse.json({
            success: true,
            message: 'MLM Configuration updated successfully',
            data: {
                ...configPayload,
                platformFeeAmount: amount,
                platformFeeRequired: required,
                paymentProvider: provider,
                version: updatedFeeConfig?.version ?? 1,
            },
        });
    }
    catch (error) {
        console.error('Error saving MLM configuration:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
