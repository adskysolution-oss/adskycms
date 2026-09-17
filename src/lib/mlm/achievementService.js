import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmMatrixNode from '@/models/mlm/MlmMatrixNode';
import MlmAchievement from '@/models/mlm/MlmAchievement';
import MlmAchievementTemplate from '@/models/mlm/MlmAchievementTemplate';
import MlmNotification from '@/models/mlm/MlmNotification';
import { getLevelAchievementConfig, buildAchievementCaption } from '@/constants/mlmAchievements';
import { renderAchievementPoster } from '@/lib/mlm/achievementPosterRenderer';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import { getLevelOccupancy, isLevelComplete, MAX_DEPTH } from '@/lib/mlm/matrixEngine';

/**
 * Automatically generates, uploads, and saves an achievement milestone poster.
 */
export async function autoGenerateAchievementPoster({
  member,
  level,
  origin,
  forceRegenerate = false,
}) {
  try {
    await dbConnect();
    let memberDoc = member;
    if (typeof memberDoc === 'string' || memberDoc instanceof mongoose.Types.ObjectId) {
      memberDoc = await MlmMember.findById(memberDoc).lean();
    }
    if (!memberDoc) {
      return { success: false, message: 'Member not found' };
    }

    const numLevel = parseInt(level, 10);
    if (!numLevel || numLevel < 1 || numLevel > 15) {
      return { success: false, message: 'Invalid level number' };
    }

    // Check existing achievement
    const existing = await MlmAchievement.findOne({ memberId: memberDoc._id, level: numLevel }).lean();

    // Check if the master template file was modified after the poster was generated
    const templatePath = path.join(process.cwd(), 'public', `l${numLevel}.png`);
    let templateFileChanged = false;
    if (fs.existsSync(templatePath) && existing?.lastGeneratedAt) {
      const stat = fs.statSync(templatePath);
      if (stat.mtime > new Date(existing.lastGeneratedAt)) {
        templateFileChanged = true;
      }
    }

    if (existing?.posterUrl && !forceRegenerate && !templateFileChanged) {
      return {
        success: true,
        posterUrl: existing.posterUrl,
        publicId: existing.posterPublicId,
        alreadyGenerated: true,
        achievement: existing,
      };
    }

    // Load template configuration
    const customTemplate = await MlmAchievementTemplate.findOne({ level: numLevel, isActive: true }).lean();
    const levelConfig = getLevelAchievementConfig(numLevel, customTemplate);

    const baseUrl = origin || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.adskysolution.com';
    const referralUrl = `${baseUrl}/nextview/register?sponsor=${memberDoc.mlmCode}`;
    const completedDate = existing?.completedAt || new Date();

    // 1. Render high-res 1080 × 1350 PNG
    const imageResponse = await renderAchievementPoster({
      member: memberDoc,
      levelConfig,
      completedAt: completedDate,
      includeReferralCode: true,
      includeReferralQr: true,
      referralUrl,
      templateUrl: customTemplate?.customBackgroundUrl || '',
    });

    const pngArrayBuffer = await imageResponse.arrayBuffer();
    const pngBuffer = Buffer.from(pngArrayBuffer);

    // 2. Upload to Cloudinary
    const uploadRes = await uploadImage(pngBuffer, 'adsky/achievements');
    if (!uploadRes?.success || !uploadRes?.url) {
      console.error('[AchievementService] Cloudinary upload failed:', uploadRes?.error);
      return { success: false, message: uploadRes?.error || 'Cloudinary upload failed' };
    }

    const now = new Date();

    // 3. Atomically update or insert MlmAchievement
    const updated = await MlmAchievement.findOneAndUpdate(
      { memberId: memberDoc._id, level: numLevel },
      {
        $setOnInsert: {
          memberId: memberDoc._id,
          userId: memberDoc.userId,
          level: numLevel,
          completedAt: completedDate,
        },
        $set: {
          status: 'POSTER_GENERATED',
          posterUrl: uploadRes.url,
          posterPublicId: uploadRes.publicId || '',
          lastGeneratedAt: now,
          referralCodeIncluded: true,
          referralQrIncluded: true,
        },
        $inc: { generationCount: 1 },
      },
      { upsert: true, new: true }
    ).lean();

    return {
      success: true,
      posterUrl: uploadRes.url,
      publicId: uploadRes.publicId,
      achievement: updated,
    };
  } catch (err) {
    console.error('[AchievementService] autoGenerateAchievementPoster error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Checks all levels for a member. If any level is completed, it registers the achievement
 * and automatically triggers poster generation.
 */
export async function checkAndUnlockLevelMilestones(memberInput, origin) {
  try {
    await dbConnect();
    let member = memberInput;
    if (typeof member === 'string' || member instanceof mongoose.Types.ObjectId) {
      member = await MlmMember.findById(member).lean();
    }
    if (!member || !member.matrixNodeId) return [];

    const unlocked = [];

    for (let l = 1; l <= MAX_DEPTH; l++) {
      let isComplete = false;
      try {
        const occ = await getLevelOccupancy(member.matrixNodeId, l);
        // Completed if either all slots are placed OR full FD criteria is satisfied
        if (occ.filledCount >= occ.capacity || occ.isComplete) {
          isComplete = true;
        } else {
          isComplete = await isLevelComplete(member.matrixNodeId, l);
        }
      } catch (e) {
        continue;
      }

      if (!isComplete) continue;

      // Find or create achievement
      let achievement = await MlmAchievement.findOne({ memberId: member._id, level: l });
      if (!achievement) {
        achievement = await MlmAchievement.create({
          memberId: member._id,
          userId: member.userId,
          level: l,
          status: 'UNLOCKED',
          completedAt: new Date(),
        });

        // Send celebratory notification
        try {
          await MlmNotification.create({
            memberId: member._id,
            type: 'LEVEL_ACHIEVEMENT_UNLOCKED',
            title: `🏆 Level ${l} Completed!`,
            message: `Congratulations! You have completed Level ${l}. Your official milestone achievement poster is being generated automatically!`,
            data: { level: l },
          });
        } catch (notifErr) {}
      }

      // If poster not yet generated, auto-generate it now!
      if (!achievement.posterUrl) {
        const posterRes = await autoGenerateAchievementPoster({
          member,
          level: l,
          origin,
        });
        if (posterRes.success && posterRes.achievement) {
          achievement = posterRes.achievement;
        }
      }

      unlocked.push(achievement);
    }

    return unlocked;
  } catch (err) {
    console.error('[AchievementService] checkAndUnlockLevelMilestones error:', err);
    return [];
  }
}

/**
 * Called on every new node placement in the matrix.
 * Checks all ancestors to see if the new placement completed a level for them.
 */
export async function onMatrixPlacementCheckAchievements(placedNode, origin) {
  if (!placedNode?.ancestorIds?.length) return;
  try {
    await dbConnect();
    for (const ancestorId of placedNode.ancestorIds) {
      const ancNode = await MlmMatrixNode.findById(ancestorId).select('memberId level').lean();
      if (!ancNode?.memberId) continue;

      const relativeLevel = placedNode.level - ancNode.level;
      if (relativeLevel < 1 || relativeLevel > MAX_DEPTH) continue;

      const occ = await getLevelOccupancy(ancNode._id, relativeLevel);
      if (occ.filledCount >= occ.capacity || occ.isComplete) {
        await checkAndUnlockLevelMilestones(ancNode.memberId, origin);
      }
    }
  } catch (err) {
    console.warn('[AchievementService] onMatrixPlacementCheckAchievements warning:', err.message);
  }
}
