import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmLevelConfig from '@/models/mlm/MlmLevelConfig';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import mongoose from 'mongoose';
/** Default seeded 15-level reward configuration */
const DEFAULT_LEVELS = [
    { level: 1, bonusAmount: 200, bonusType: 'FIXED', active: true },
    { level: 2, bonusAmount: 100, bonusType: 'FIXED', active: true },
    { level: 3, bonusAmount: 65, bonusType: 'FIXED', active: true },
    { level: 4, bonusAmount: 55, bonusType: 'FIXED', active: true },
    { level: 5, bonusAmount: 45, bonusType: 'FIXED', active: true },
    { level: 6, bonusAmount: 40, bonusType: 'FIXED', active: true },
    { level: 7, bonusAmount: 35, bonusType: 'FIXED', active: true },
    { level: 8, bonusAmount: 30, bonusType: 'FIXED', active: true },
    { level: 9, bonusAmount: 25, bonusType: 'FIXED', active: true },
    { level: 10, bonusAmount: 22, bonusType: 'FIXED', active: true },
    { level: 11, bonusAmount: 20, bonusType: 'FIXED', active: true },
    { level: 12, bonusAmount: 18, bonusType: 'FIXED', active: true },
    { level: 13, bonusAmount: 17, bonusType: 'FIXED', active: true },
    { level: 14, bonusAmount: 15, bonusType: 'FIXED', active: true },
    { level: 15, bonusAmount: 13, bonusType: 'FIXED', active: true },
];
/**
 * GET /api/admin/mlm/levels
 * Returns active level configurations.
 */
export async function GET(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
        if (auth instanceof NextResponse)
            return auth;
        let activeConfig = await MlmLevelConfig.findOne({
            status: 'active',
            effectiveFrom: { $lte: new Date() },
        }).sort({ version: -1, effectiveFrom: -1 }).lean();
        if (!activeConfig) {
            activeConfig = await MlmLevelConfig.findOne({ status: 'active' }).sort({ version: -1 }).lean();
        }
        if (!activeConfig) {
            // Return default seed template
            return NextResponse.json({
                success: true,
                data: {
                    levels: DEFAULT_LEVELS,
                    version: 1,
                    status: 'active',
                }
            });
        }
        return NextResponse.json({ success: true, data: activeConfig });
    } catch (error) {
        console.error('Error in /api/admin/mlm/levels GET:', error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to load level configuration' }, { status: 500 });
    }
}
/**
 * POST /api/admin/mlm/levels
 * Creates a new versioned Level 1-15 reward configuration.
 */
export async function POST(req) {
    try {
        await dbConnect();
        const auth = await requireModuleAuth(req, 'admin', ['super_admin', 'operations_admin']);
        if (auth instanceof NextResponse)
            return auth;
        const body = await req.json();
        const { levels, sponsorBonusAmount, description, effectiveFrom, effectiveTo } = body;
        if (!levels || !Array.isArray(levels) || levels.length === 0) {
            return NextResponse.json({ success: false, message: 'levels array is required' }, { status: 400 });
        }
        const formattedLevels = levels.map((l) => ({
            level: Number(l.level),
            bonusAmount: Number(l.bonusAmount ?? l.rewardAmount ?? 0),
            bonusType: l.bonusType || 'FIXED',
            active: l.active !== false,
        }));
        const existingCount = await MlmLevelConfig.countDocuments({});
        const config = await MlmLevelConfig.create({
            levels: formattedLevels,
            sponsorBonusAmount: sponsorBonusAmount ? Number(sponsorBonusAmount) : undefined,
            description: description || 'Updated via MLM Admin Portal',
            effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
            effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
            version: existingCount + 1,
            status: 'active',
            createdBy: (auth.payload?.id && mongoose.Types.ObjectId.isValid(auth.payload.id) ? new mongoose.Types.ObjectId(auth.payload.id) : auth.payload?.id || 'admin'),
        });
        try {
            const { ip, userAgent } = getRequestMeta(req);
            await MlmAuditLog.create({
                action: 'LEVEL_CONFIG_UPDATED',
                performedBy: (auth.payload?.id && mongoose.Types.ObjectId.isValid(auth.payload.id) ? new mongoose.Types.ObjectId(auth.payload.id) : auth.payload?.id || 'admin'),
                performedByRole: auth.payload?.role || 'admin',
                performedByName: auth.payload?.fullName || auth.payload?.email || 'Admin',
                targetId: config._id,
                targetModel: 'MlmLevelConfig',
                newValue: { version: config.version, levels: formattedLevels },
                ip, userAgent,
            });
        } catch (auditErr) {
            console.warn('[MLM Audit Log warning]:', auditErr.message);
        }
        return NextResponse.json({ success: true, data: config, message: `Configuration v${config.version} saved successfully!` }, { status: 201 });
    } catch (error) {
        console.error('Error in /api/admin/mlm/levels POST:', error);
        return NextResponse.json({ success: false, message: error.message || 'Failed to save configuration' }, { status: 500 });
    }
}
