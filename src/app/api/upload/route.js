import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { requireModuleAuth } from '@/lib/moduleAuth';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

// GET media library
export async function GET(request) {
  try {
    let decoded = await authenticateRequest(request);
    if (!decoded) {
      try {
        const auth = await requireModuleAuth(request, 'mlm');
        if (!(auth instanceof NextResponse) && auth?.payload) decoded = auth.payload;
      } catch (e) {}
    }
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter = folder ? { folder } : {};
    const total = await Media.countDocuments(filter);
    const media = await Media.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      media,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPLOAD media
export async function POST(request) {
  try {
    let decoded = await authenticateRequest(request);
    if (!decoded) {
      try {
        const auth = await requireModuleAuth(request, 'mlm');
        if (!(auth instanceof NextResponse) && auth?.payload) decoded = auth.payload;
      } catch (e) {}
    }
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'general';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const result = await uploadImage(file, `adskycms/${folder}`);
    if (!result || !result.success) {
      return NextResponse.json({ error: result?.error || 'Failed to upload image to Cloudinary' }, { status: 500 });
    }

    const userId = decoded.id || decoded.userId || decoded._id;
    const validUploadedBy = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : undefined;

    const media = await Media.create({
      name: file.name || 'image',
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      size: file.size,
      folder,
      uploadedBy: validUploadedBy,
    });

    return NextResponse.json({ success: true, media }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE media
export async function DELETE(request) {
  try {
    let decoded = await authenticateRequest(request);
    if (!decoded) {
      try {
        const auth = await requireModuleAuth(request, 'mlm');
        if (!(auth instanceof NextResponse) && auth?.payload) decoded = auth.payload;
      } catch (e) {}
    }
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const media = await Media.findById(id);
    if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 });

    await deleteImage(media.publicId);
    await Media.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
