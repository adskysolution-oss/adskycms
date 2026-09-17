import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmMatrixNode from '@/models/mlm/MlmMatrixNode';
import MlmAchievement from '@/models/mlm/MlmAchievement';
import MlmAchievementTemplate from '@/models/mlm/MlmAchievementTemplate';
import { requireModuleAuth } from '@/lib/moduleAuth';
import { isLevelComplete, getLevelOccupancy } from '@/lib/mlm/matrixEngine';
import { DEFAULT_ACHIEVEMENT_LEVELS, getLevelAchievementConfig, buildAchievementCaption } from '@/constants/mlmAchievements';
import { autoGenerateAchievementPoster } from '@/lib/mlm/achievementService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mlm/achievements
 * Returns all 15 level achievements for the authenticated member.
 * Evaluates completion status dynamically from the matrix engine.
 */
export async function GET(req) {
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
    const member = await MlmMember.findOne({
      $or: [{ userId: authId }, { _id: authId }],
    }).lean();

    if (!member) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    const origin = req.nextUrl?.origin || (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.adskysolution.com');
    const referralUrl = `${origin}/nextview/register?sponsor=${member.mlmCode}`;

    // 1. Fetch custom templates from DB if configured by admin
    const templates = await MlmAchievementTemplate.find({ isActive: true }).lean();
    const templateMap = new Map(templates.map((t) => [t.level, t]));

    // 2. Fetch existing achievement records for this member
    const existingAchievements = await MlmAchievement.find({ memberId: member._id }).lean();
    const achievementMap = new Map(existingAchievements.map((a) => [a.level, a]));

    const matrixNodeId = member.matrixNodeId;
    let latestCompletedLevel = null;
    const levelsResult = [];

    // 3. Evaluate each level 1 to 15
    for (let l = 1; l <= 15; l++) {
      const template = templateMap.get(l) || null;
      const levelConfig = getLevelAchievementConfig(l, template);
      let existingRecord = achievementMap.get(l) || null;

      let isCompleted = false;
      let occupancy = null;

      if (matrixNodeId) {
        try {
          occupancy = await getLevelOccupancy(matrixNodeId, l);
          const fdComplete = await isLevelComplete(matrixNodeId, l);
          // Level is complete if all required matrix slots are filled OR FD requirement met
          isCompleted = (occupancy?.filledCount >= occupancy?.capacity) || fdComplete;
        } catch (err) {
          console.warn(`[Achievements API] Level ${l} calculation error:`, err.message);
        }
      }

      // If level is complete in the matrix engine but no achievement record exists yet,
      // register it atomically without modifying historical timestamps.
      if (isCompleted && !existingRecord) {
        try {
          existingRecord = await MlmAchievement.findOneAndUpdate(
            { memberId: member._id, level: l },
            {
              $setOnInsert: {
                memberId: member._id,
                userId: member.userId || authId,
                level: l,
                status: 'UNLOCKED',
                completedAt: new Date(),
              },
            },
            { upsert: true, new: true }
          ).lean();
        } catch (upsertErr) {
          console.warn(`[Achievements API] Upsert achievement warning:`, upsertErr.message);
          existingRecord = await MlmAchievement.findOne({ memberId: member._id, level: l }).lean();
        }
      }

      // If achievement record already exists from past completion, treat as completed
      if (existingRecord) {
        isCompleted = true;
      }

      if (isCompleted) {
        if (latestCompletedLevel === null || l > latestCompletedLevel) {
          latestCompletedLevel = l;
        }
      }

      const defaultCaption = buildAchievementCaption({
        member,
        levelConfig,
        referralLink: referralUrl,
      });

      // Direct dynamic image endpoint: zero Cloudinary storage needed, instant template updates
      const directPosterUrl = isCompleted ? `/api/mlm/achievements/${l}/image` : '';

      levelsResult.push({
        level: l,
        title: levelConfig.title,
        subtitle: levelConfig.subtitle,
        badgeName: levelConfig.badgeName,
        theme: levelConfig.theme,
        primaryColor: levelConfig.primaryColor,
        accentColor: levelConfig.accentColor,
        congratulationsText: levelConfig.congratulationsText,
        motivationalMessage: levelConfig.motivationalMessage,
        tagline: levelConfig.tagline,
        capacity: levelConfig.capacity,
        filledCount: occupancy?.filledCount ?? 0,
        isCompleted,
        isUnlocked: isCompleted,
        completedAt: existingRecord?.completedAt || null,
        posterUrl: directPosterUrl,
        lastGeneratedAt: existingRecord?.lastGeneratedAt || null,
        generationCount: existingRecord?.generationCount || 0,
        sharesCount: existingRecord?.sharesCount || 0,
        downloadsCount: existingRecord?.downloadsCount || 0,
        customCaption: existingRecord?.customCaption || '',
        defaultCaption,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isPlaced: !!matrixNodeId,
        latestCompletedLevel,
        levels: levelsResult,
        member: {
          _id: member._id,
          fullName: member.fullName,
          mlmCode: member.mlmCode,
          profileImage: member.profileImage || null,
          hasProfilePhoto: !!member.profileImage,
          referralUrl,
        },
      },
    });
  } catch (error) {
    console.error('[Achievements API GET Error]', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
