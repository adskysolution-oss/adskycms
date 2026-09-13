import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect.js';
import MlmMarketing from '@/models/mlm/MlmMarketing.js';
import { requireModuleAuth } from '@/lib/moduleAuth.js';

export const dynamic = 'force-dynamic';

const ALLOWED_ACTIONS = {
  view: 'viewCount',
  download: 'downloadCount',
  share: 'shareCount',
  copy: 'copyCount',
};

export async function POST(req, { params }) {
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, action } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid content ID' }, { status: 400 });
    }

    const fieldToIncrement = ALLOWED_ACTIONS[action?.toLowerCase()];
    if (!fieldToIncrement) {
      return NextResponse.json({ success: false, message: 'Invalid analytics action.' }, { status: 400 });
    }

    await dbConnect();

    // Atomic increment without race conditions or overwriting other fields
    await MlmMarketing.findByIdAndUpdate(id, {
      $inc: { [fieldToIncrement]: 1 },
    });

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error('[Gallery Analytics Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
