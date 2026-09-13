import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect.js';
import MlmMarketing from '@/models/mlm/MlmMarketing.js';
import { requireModuleAuth } from '@/lib/moduleAuth.js';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid content ID' }, { status: 400 });
    }

    await dbConnect();
    const item = await MlmMarketing.findById(id).lean();

    if (!item) {
      return NextResponse.json({ success: false, message: 'Marketing content not found' }, { status: 404 });
    }

    // Enforce member visibility restrictions
    const isPublished = item.status === 'PUBLISHED' || (item.isActive && !item.status);
    if (!isPublished) {
      return NextResponse.json({ success: false, message: 'Content is not accessible.' }, { status: 404 });
    }

    const now = new Date();
    if (item.publishFrom && new Date(item.publishFrom) > now) {
      return NextResponse.json({ success: false, message: 'Content is not accessible.' }, { status: 404 });
    }
    if (item.publishUntil && new Date(item.publishUntil) < now) {
      return NextResponse.json({ success: false, message: 'Content has expired.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item: {
        ...item,
        fileUrl: item.fileUrl || item.url,
      },
    });
  } catch (error) {
    console.error('[Gallery Member Single GET Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
