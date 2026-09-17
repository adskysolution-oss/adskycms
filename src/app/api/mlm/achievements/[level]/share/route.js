import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import MlmMember from '@/models/mlm/MlmMember';
import MlmAchievement from '@/models/mlm/MlmAchievement';
import MlmAuditLog from '@/models/mlm/MlmAuditLog';
import { requireModuleAuth, getRequestMeta } from '@/lib/moduleAuth';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const resolvedParams = await params;
    const level = parseInt(resolvedParams.level, 10);

    if (isNaN(level) || level < 1 || level > 15) {
      return NextResponse.json({ success: false, message: 'Invalid level' }, { status: 400 });
    }

    const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
    const member = await MlmMember.findOne({
      $or: [{ userId: authId }, { _id: authId }],
    }).lean();

    if (!member) {
      return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action === 'download' ? 'download' : 'share';

    const now = new Date();
    const update = {};
    if (action === 'share') {
      update.$inc = { sharesCount: 1 };
      update.$set = { lastSharedAt: now, status: 'SHARED' };
    } else {
      update.$inc = { downloadsCount: 1 };
      update.$set = { lastDownloadedAt: now };
    }

    const updated = await MlmAchievement.findOneAndUpdate(
      { memberId: member._id, level },
      update,
      { returnDocument: 'after' }
    ).lean();

    const { ip, userAgent } = getRequestMeta(req);
    await MlmAuditLog.create({
      action: action === 'share' ? 'ACHIEVEMENT_POSTER_SHARED' : 'ACHIEVEMENT_POSTER_DOWNLOADED',
      performedBy: member.userId || member._id,
      performedByRole: 'mlm_member',
      performedByName: member.fullName,
      targetId: updated?._id || member._id,
      targetModel: 'MlmAchievement',
      details: {
        level,
        action,
        sharesCount: updated?.sharesCount || 1,
        downloadsCount: updated?.downloadsCount || 1,
      },
      ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: {
        level,
        action,
        sharesCount: updated?.sharesCount || 0,
        downloadsCount: updated?.downloadsCount || 0,
      },
    });
  } catch (error) {
    console.error('[Achievement Share POST Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
