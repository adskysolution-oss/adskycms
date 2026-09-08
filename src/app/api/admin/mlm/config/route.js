import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import MlmPlatformFeeConfig from '@/models/mlm/MlmPlatformFeeConfig';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';

export async function GET() {
    try {
        const session = await getAuthUser();
        if (!session || !['admin', 'super_admin', 'operations_admin'].includes(session.role)) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        await dbConnect();
        const paymentConfig = await PaymentConfig.findOne({ key: 'default' }).lean();
        // Use isActive:true — model has isActive field, NOT status field
        const feeConfig = await MlmPlatformFeeConfig.findOne({ isActive: true }).sort({ version: -1 }).lean();
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
            platformFeeRequired: true,
            // totalAmount is the final charged amount in the model
            platformFeeAmount: feeConfig?.totalAmount ?? feeConfig?.feeAmount ?? 100,
            gstPercent: feeConfig?.gstPercent ?? 0,
            currency: 'INR',
            paymentProvider: 'cashfree',
            rewardsEnabled: true,
            withdrawalsEnabled: true,
            minWithdrawalAmount: 100,
            maxWithdrawalAmount: 50000,
            manualWithdrawalApproval: true,
            bankTransferEnabled: true,
            upiEnabled: true,
            walletEnabled: true,
            version: feeConfig?.version ?? 1,
            description: feeConfig?.description ?? '',
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
        const feeAmount = Number(configPayload.platformFeeAmount) || 100;
        const gstPercent = Number(configPayload.gstPercent) || 0;
        const totalAmount = Math.round(feeAmount * (1 + gstPercent / 100));
        const description = configPayload.description || 'MLM Platform Activation Fee';

        // 1. Deactivate all existing active configs
        await MlmPlatformFeeConfig.updateMany({ isActive: true }, { $set: { isActive: false } });

        // 2. Create new version (find last version number first)
        const lastConfig = await MlmPlatformFeeConfig.findOne().sort({ version: -1 }).lean();
        const newVersion = (lastConfig?.version ?? 0) + 1;

        const updatedFeeConfig = await MlmPlatformFeeConfig.create({
            version: newVersion,
            feeAmount,
            gstPercent,
            totalAmount,
            isActive: true,
            description,
            effectiveFrom: new Date(),
            updatedBy: session.email || session.id || 'admin',
        });

        // 3. Log Audit
        try {
            await MlmAuditLog.create({
                action: 'UPDATE_PLATFORM_FEE_CONFIG',
                performedBy: session.id,
                performedByRole: session.role || 'admin',
                performedByName: session.name || session.email || 'Admin',
                newValue: {
                    version: newVersion,
                    feeAmount,
                    gstPercent,
                    totalAmount,
                    description,
                    auditReason: auditReason || 'Platform fee config updated by admin',
                },
            });
        }
        catch (auditErr) {
            console.warn('MLM Audit Log warning:', auditErr.message);
        }

        return NextResponse.json({
            success: true,
            message: `Platform fee updated to ₹${totalAmount} (v${newVersion}) successfully`,
            data: {
                ...configPayload,
                platformFeeAmount: totalAmount,
                feeAmount,
                gstPercent,
                totalAmount,
                version: newVersion,
                description,
            },
        });
    }
    catch (error) {
        console.error('Error saving MLM configuration:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
