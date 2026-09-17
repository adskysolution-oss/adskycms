import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmAchievement from '@/models/mlm/MlmAchievement';
import MlmAchievementTemplate from '@/models/mlm/MlmAchievementTemplate';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import { DEFAULT_ACHIEVEMENT_LEVELS, getLevelAchievementConfig } from '@/constants/mlmAchievements';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const auth = await requireModuleAuth(req, 'admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    // 1. Fetch aggregate metrics
    const [stats, levelCounts] = await Promise.all([
      MlmAchievement.aggregate([
        {
          $group: {
            _id: null,
            totalUnlocked: { $sum: 1 },
            totalPosters: {
              $sum: { $cond: [{ $gt: ['$generationCount', 0] }, 1, 0] },
            },
            totalShares: { $sum: '$sharesCount' },
            totalDownloads: { $sum: '$downloadsCount' },
          },
        },
      ]),
      MlmAchievement.aggregate([
        {
          $group: {
            _id: '$level',
            completedCount: { $sum: 1 },
            postersCount: { $sum: { $cond: [{ $gt: ['$generationCount', 0] }, 1, 0] } },
            shares: { $sum: '$sharesCount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const globalStats = stats[0] || {
      totalUnlocked: 0,
      totalPosters: 0,
      totalShares: 0,
      totalDownloads: 0,
    };

    const countMap = new Map(levelCounts.map((c) => [c._id, c]));

    // 2. Fetch templates
    const templates = await MlmAchievementTemplate.find().lean();
    const templateMap = new Map(templates.map((t) => [t.level, t]));

    const levels = DEFAULT_ACHIEVEMENT_LEVELS.map((def) => {
      const custom = templateMap.get(def.level) || null;
      const config = getLevelAchievementConfig(def.level, custom);
      const metrics = countMap.get(def.level) || { completedCount: 0, postersCount: 0, shares: 0 };

      return {
        ...config,
        isActive: custom ? custom.isActive : true,
        completedCount: metrics.completedCount,
        postersCount: metrics.postersCount,
        sharesCount: metrics.shares,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: globalStats,
        levels,
      },
    });
  } catch (error) {
    console.error('[Admin Achievements GET Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  const auth = await requireModuleAuth(req, 'admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const body = await req.json();
    const { level, title, subtitle, badgeName, congratulationsText, motivationalMessage, tagline, isActive } = body;

    const levelNum = parseInt(level, 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 15) {
      return NextResponse.json({ success: false, message: 'Invalid level number' }, { status: 400 });
    }

    const updated = await MlmAchievementTemplate.findOneAndUpdate(
      { level: levelNum },
      {
        $set: {
          title,
          subtitle,
          badgeName,
          congratulationsText,
          motivationalMessage,
          tagline,
          isActive: isActive !== false,
          updatedBy: auth.payload.email || auth.payload.fullName || 'admin',
        },
      },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    const { ip, userAgent } = getRequestMeta(req);
    await MlmAuditLog.create({
      action: 'ACHIEVEMENT_TEMPLATE_UPDATED',
      performedBy: auth.payload.id || auth.payload.userId,
      performedByRole: auth.payload.role,
      performedByName: auth.payload.fullName || 'Admin',
      targetId: updated._id,
      targetModel: 'MlmAchievementTemplate',
      newValue: { level: levelNum, title },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `Level ${levelNum} template updated successfully`,
      data: updated,
    });
  } catch (error) {
    console.error('[Admin Achievements PUT Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
