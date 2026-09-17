import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import '@/models/mlm/MlmKyc';
import '@/models/mlm/MlmMatrixNode';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await dbConnect();
    const auth = await requireModuleAuth(req, 'mlm');
    if (auth instanceof NextResponse) return auth;

    const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
    let member = await MlmMember.findOne({
      $or: [{ userId: authId }, { _id: authId }]
    })
      .populate('sponsorId', 'fullName mobile mlmCode')
      .populate('kycId')
      .populate('matrixNodeId');

    if (!member) {
      return NextResponse.json({ success: false, message: 'MLM Member profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Error fetching MLM member profile:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const auth = await requireModuleAuth(req, 'mlm');
    if (auth instanceof NextResponse) return auth;

    const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
    const body = await req.json();
    const { fullName, email, address, state, district, profileImage } = body;

    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (email) updates.email = email;
    if (address) updates.address = address;
    if (state) updates.state = state;
    if (district) updates.district = district;
    if (typeof profileImage === 'string') updates.profileImage = profileImage.trim();

    const member = await MlmMember.findOneAndUpdate(
      { $or: [{ userId: authId }, { _id: authId }] },
      { $set: updates },
      { new: true }
    ).lean();

    // If profileImage was updated, automatically refresh unlocked achievement posters in background
    if (typeof profileImage === 'string' && member) {
      import('@/lib/mlm/achievementService')
        .then(({ autoGenerateAchievementPoster }) => {
          import('@/models/mlm/MlmAchievement').then(({ default: MlmAchievement }) => {
            MlmAchievement.find({ memberId: member._id, status: { $in: ['UNLOCKED', 'POSTER_GENERATED'] } })
              .then((achievements) => {
                for (const ach of achievements) {
                  autoGenerateAchievementPoster({ member, level: ach.level, forceRegenerate: true }).catch(() => {});
                }
              })
              .catch(() => {});
          }).catch(() => {});
        })
        .catch(() => {});
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Error updating MLM member profile:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
