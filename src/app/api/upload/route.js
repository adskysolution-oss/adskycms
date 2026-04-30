import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import { authenticateRequest } from '@/lib/auth';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

// GET media library
export async function GET(request) {
  try {
    const decoded = authenticateRequest(request);
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
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'general';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const result = await uploadImage(file, `adskycms/${folder}`);

    const media = await Media.create({
      name: file.name,
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      size: file.size,
      folder,
      uploadedBy: decoded.id,
    });

    return NextResponse.json({ success: true, media }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE media
export async function DELETE(request) {
  try {
    const decoded = authenticateRequest(request);
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
