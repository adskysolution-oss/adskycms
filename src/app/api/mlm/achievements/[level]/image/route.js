import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmAchievement from '@/models/mlm/MlmAchievement';
import MlmAchievementTemplate from '@/models/mlm/MlmAchievementTemplate';
import { requireModuleAuth } from '@/lib/moduleAuth';
import { isLevelComplete } from '@/lib/mlm/matrixEngine';
import { getLevelAchievementConfig } from '@/constants/mlmAchievements';
import { renderAchievementPoster } from '@/lib/mlm/achievementPosterRenderer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mlm/achievements/[level]/image
 * 
 * Direct dynamic image rendering endpoint.
 * Renders the high-resolution 1080 × 1350 PNG poster on-the-fly and streams it directly.
 * Zero Cloudinary storage dependency. Instant updates when public/l{level}.png or member photo changes.
 * 
 * Query params:
 * - download: '1' or 'true' to trigger native attachment file download
 * - code: optional member MLM code fallback for public/shareable preview
 */
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const level = parseInt(resolvedParams.level, 10);

    if (isNaN(level) || level < 1 || level > 15) {
      return new NextResponse('Invalid level number', { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get('download') === '1' || searchParams.get('download') === 'true';
    const memberCodeQuery = searchParams.get('code');

    // 1. Resolve member
    let member = null;

    // Try session auth first
    const auth = await requireModuleAuth(req, 'mlm');
    if (!(auth instanceof NextResponse) && auth?.payload) {
      const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
      member = await MlmMember.findOne({
        $or: [{ userId: authId }, { _id: authId }],
      }).lean();
    }

    // Fallback to query param if not in session or for preview links
    if (!member && memberCodeQuery) {
      member = await MlmMember.findOne({ mlmCode: memberCodeQuery.trim().toUpperCase() }).lean();
    }

    if (!member) {
      return new NextResponse('Unauthorized: Member profile required', { status: 401 });
    }

    // 2. Resolve level template & config
    const customTemplate = await MlmAchievementTemplate.findOne({ level, isActive: true }).lean();
    const levelConfig = getLevelAchievementConfig(level, customTemplate);

    const templatePath = path.join(process.cwd(), 'public', `l${level}.png`);
    const hasTemplate = Boolean(customTemplate?.customBackgroundUrl || fs.existsSync(templatePath));
    if (!hasTemplate) {
      return new NextResponse(`Level ${level} poster template is not available yet`, { status: 404 });
    }

    // 3. Verify level completion
    let existingAchievement = await MlmAchievement.findOne({
      memberId: member._id,
      level,
    }).lean();

    let isCompleted = !!existingAchievement;
    if (!isCompleted && member.matrixNodeId) {
      isCompleted = await isLevelComplete(member.matrixNodeId, level);
    }

    if (!isCompleted) {
      return new NextResponse(`Level ${level} achievement is locked`, { status: 403 });
    }

    const origin = req.nextUrl?.origin || (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.adskysolution.com');
    const referralUrl = `${origin}/nextview/register?sponsor=${member.mlmCode}`;
    const completedDate = existingAchievement?.completedAt || new Date();

    // 4. Render high-res 1080 × 1350 PNG directly in memory
    const posterResult = await renderAchievementPoster({
      member,
      levelConfig,
      completedAt: completedDate,
      includeReferralCode: true,
      includeReferralQr: true,
      referralUrl,
      templateUrl: customTemplate?.customBackgroundUrl || '',
    });

    const safeTitle = (levelConfig.title || 'achievement').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `nexvia-level-${level}-${safeTitle}.png`;
    const disposition = isDownload ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`;

    // 6. Return streamed PNG response directly to client
    return new NextResponse(posterResult.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': String(posterResult.buffer.length),
        'Content-Disposition': disposition,
        // Short cache to allow instant updates when template or photo changes, while preventing hammering
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[Achievement Image GET Error]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
