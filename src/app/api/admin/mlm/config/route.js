import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import MlmPlatformFeeConfig from "@/models/mlm/MlmPlatformFeeConfig";
import MlmAuditLog from "@/models/mlm/MlmAuditLog";

export async function GET() {
    try {
        const session = await getAuthUser();
        if (!session || !["admin", "super_admin", "operations_admin"].includes(session.role)) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        await dbConnect();

        const feeConfig = await MlmPlatformFeeConfig.findOne({ isActive: true }).sort({ version: -1 }).lean();
        const history   = await MlmPlatformFeeConfig.find({}).sort({ version: -1 }).limit(10).lean();

        const configData = {
            platformFeeAmount: feeConfig?.totalAmount  ?? feeConfig?.feeAmount ?? 100,
            feeAmount:         feeConfig?.feeAmount    ?? 100,
            gstPercent:        feeConfig?.gstPercent   ?? 0,
            totalAmount:       feeConfig?.totalAmount  ?? 100,
            description:       feeConfig?.description  ?? "Lifetime Membership & 3x15 Matrix Placement Fee",
            paymentProvider:   feeConfig?.paymentProvider ?? "adsky_cashfree",
            version:           feeConfig?.version ?? 1,
        };

        return NextResponse.json({ success: true, data: configData, history });
    } catch (error) {
        console.error("Error fetching MLM configuration:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getAuthUser();
        if (!session || !["admin", "super_admin", "operations_admin"].includes(session.role)) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        await dbConnect();

        const body = await req.json();
        const feeAmount       = Number(body.platformFeeAmount) || 100;
        const gstPercent      = Number(body.gstPercent)        || 0;
        const totalAmount     = Math.round(feeAmount * (1 + gstPercent / 100));
        const description     = body.description     || "Lifetime Membership & 3x15 Matrix Placement Fee";
        const paymentProvider = body.paymentProvider || "adsky_cashfree";
        const auditReason     = body.auditReason     || "Platform fee config updated by admin";

        await MlmPlatformFeeConfig.updateMany({ isActive: true }, { $set: { isActive: false } });

        const lastConfig = await MlmPlatformFeeConfig.findOne().sort({ version: -1 }).lean();
        const newVersion = (lastConfig?.version ?? 0) + 1;

        await MlmPlatformFeeConfig.create({
            version:         newVersion,
            feeAmount,
            gstPercent,
            totalAmount,
            isActive:        true,
            description,
            paymentProvider,
            effectiveFrom:   new Date(),
            updatedBy:       session.email || session.id || "admin",
        });

        try {
            await MlmAuditLog.create({
                action:          "UPDATE_PLATFORM_FEE_CONFIG",
                performedBy:     session.id,
                performedByRole: session.role || "admin",
                performedByName: session.name || session.email || "Admin",
                newValue:        { version: newVersion, feeAmount, gstPercent, totalAmount, paymentProvider, description, auditReason },
            });
        } catch (auditErr) {
            console.warn("MLM Audit Log warning:", auditErr.message);
        }

        return NextResponse.json({
            success: true,
            message: `Platform fee updated to Rs.${totalAmount} (v${newVersion}) successfully`,
            data: { platformFeeAmount: totalAmount, feeAmount, gstPercent, totalAmount, description, paymentProvider, version: newVersion },
        });
    } catch (error) {
        console.error("Error saving MLM configuration:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}
