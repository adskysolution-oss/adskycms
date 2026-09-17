import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmAchievement from '@/models/mlm/MlmAchievement';
import MlmAchievementTemplate from '@/models/mlm/MlmAchievementTemplate';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import { isLevelComplete } from '@/lib/mlm/matrixEngine';
import { getLevelAchievementConfig, buildAchievementCaption } from '@/constants/mlmAchievements';
import { renderAchievementPoster } from '@/lib/mlm/achievementPosterRenderer';
import { uploadImage } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const resolvedParams = await params;
    const level = parseInt(resolvedParams.level, 10);

    if (isNaN(level) || level < 1 || level > 15) {
      return NextResponse.json(
        { success: false, message: 'Invalid level. Must be between 1 and 15.' },
        { status: 400 }
      );
    }

    // 1. Resolve authenticated member strictly from auth session (IDOR protection)
    const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
    const member = await MlmMember.findOne({
      $or: [{ userId: authId }, { _id: authId }],
    });

    if (!member) {
      return NextResponse.json({ success: false, message: 'Member profile not found' }, { status: 404 });
    }

    // Check template existence for future level architecture
    const fs = await import('fs');
    const path = await import('path');
    const templatePath = path.join(process.cwd(), 'public', `l${level}.png`);
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        {
          success: false,
          code: 'LEVEL_TEMPLATE_UNAVAILABLE',
          message: `Level ${level} achievement template is not available yet. (Levels 1 to 3 are currently available).`,
        },
        { status: 403 }
      );
    }

    // 2. Strict Backend Eligibility Check: Is Level actually completed?
    let existingAchievement = await MlmAchievement.findOne({
      memberId: member._id,
      level,
    });

    let isCompleted = false;
    if (existingAchievement) {
      isCompleted = true;
    } else if (member.matrixNodeId) {
      isCompleted = await isLevelComplete(member.matrixNodeId, level);
    }

    if (!isCompleted) {
      return NextResponse.json(
        {
          success: false,
          code: 'LEVEL_LOCKED',
          message: `Level ${level} achievement has not been unlocked yet.`,
        },
        { status: 403 }
      );
    }

    // 3. Member Photo Check: Must have profile photo
    if (!member.profileImage || !member.profileImage.trim()) {
      return NextResponse.json(
        {
          success: false,
          code: 'PROFILE_PHOTO_REQUIRED',
          message: `Upload your profile photo to create your Level ${level} achievement poster.`,
        },
        { status: 400 }
      );
    }

    // 4. Parse request options
    const body = await req.json().catch(() => ({}));
    const includeReferralCode = body.includeReferralCode !== false;
    const includeReferralQr = body.includeReferralQr !== false;

    const origin = req.nextUrl?.origin || (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.adskysolution.com');
    const referralUrl = `${origin}/nextview/register?sponsor=${member.mlmCode}`;

    const { autoGenerateAchievementPoster } = await import('@/lib/mlm/achievementService');
    const genRes = await autoGenerateAchievementPoster({
      member,
      level,
      origin,
      forceRegenerate: true,
    });

    if (!genRes?.success || !genRes?.posterUrl) {
      return NextResponse.json(
        { success: false, message: genRes?.message || 'Failed to generate poster.' },
        { status: 500 }
      );
    }

    const updatedAchievement = genRes.achievement;

    // 9. Generate clean share caption
    const customTemplate = await MlmAchievementTemplate.findOne({ level, isActive: true }).lean();
    const levelConfig = getLevelAchievementConfig(level, customTemplate);
    const shareCaption = buildAchievementCaption({
      member,
      levelConfig,
      referralLink: referralUrl,
    });

    // 10. Audit log
    const { ip, userAgent } = getRequestMeta(req);
    await MlmAuditLog.create({
      action: 'ACHIEVEMENT_POSTER_GENERATED',
      performedBy: member.userId || member._id,
      performedByRole: 'mlm_member',
      performedByName: member.fullName,
      targetId: updatedAchievement._id,
      targetModel: 'MlmAchievement',
      details: {
        level,
        posterUrl: genRes.posterUrl,
        generationCount: updatedAchievement?.generationCount || 1,
      },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `Level ${level} poster generated successfully!`,
      data: {
        posterUrl: genRes.posterUrl,
        achievement: updatedAchievement,
        shareCaption,
      },
    });
  } catch (error) {
    console.error('[Achievement Poster POST Error]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate poster.' },
      { status: 500 }
    );
  }
}
