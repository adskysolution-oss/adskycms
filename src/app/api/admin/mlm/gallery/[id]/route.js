import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect.js';
import MlmMarketing from '@/models/mlm/MlmMarketing.js';
import { requireModuleAuth } from '@/lib/moduleAuth.js';
import { uploadImage } from '@/lib/cloudinary.js';
import { validateMarketingFile } from '@/lib/mlm/galleryValidator.js';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const auth = await requireModuleAuth(req, 'admin');
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    await dbConnect();
    const item = await MlmMarketing.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, message: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      item: {
        ...item,
        fileUrl: item.fileUrl || item.url,
      },
    });
  } catch (error) {
    console.error('[Admin Gallery Single GET Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const auth = await requireModuleAuth(req, 'admin');
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    await dbConnect();
    const existing = await MlmMarketing.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Content not found' }, { status: 404 });
    }

    const contentTypeHeader = req.headers.get('content-type') || '';
    let updateFields = {};

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await req.formData();

      if (formData.has('title')) updateFields.title = (formData.get('title') || '').trim();
      if (formData.has('description')) updateFields.description = (formData.get('description') || '').trim();
      if (formData.has('category')) updateFields.category = formData.get('category');
      if (formData.has('contentType')) updateFields.contentType = (formData.get('contentType') || '').toUpperCase();
      if (formData.has('caption')) updateFields.caption = (formData.get('caption') || '').trim();
      if (formData.has('shareText')) updateFields.shareText = (formData.get('shareText') || '').trim();
      if (formData.has('status')) {
        updateFields.status = (formData.get('status') || 'PUBLISHED').toUpperCase();
        updateFields.isActive = updateFields.status === 'PUBLISHED';
      }
      if (formData.has('featured')) updateFields.featured = formData.get('featured') === 'true';
      if (formData.has('sortOrder')) {
        const sOrder = parseInt(formData.get('sortOrder') || '0', 10) || 0;
        updateFields.sortOrder = sOrder;
        updateFields.displayOrder = sOrder;
      }

      if (formData.has('publishFrom')) {
        const v = formData.get('publishFrom');
        updateFields.publishFrom = v ? new Date(v) : null;
      }
      if (formData.has('publishUntil')) {
        const v = formData.get('publishUntil');
        updateFields.publishUntil = v ? new Date(v) : null;
      }

      const captionsRaw = formData.get('captions');
      if (captionsRaw) {
        try {
          updateFields.captions = typeof captionsRaw === 'string' ? JSON.parse(captionsRaw) : captionsRaw;
        } catch {
          // ignore
        }
      }

      const tagsRaw = formData.get('tags');
      if (tagsRaw) {
        try {
          updateFields.tags = typeof tagsRaw === 'string' && tagsRaw.startsWith('[')
            ? JSON.parse(tagsRaw)
            : tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
        } catch {
          updateFields.tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      // Check if replacing media file
      const newFile = formData.get('file');
      if (newFile && typeof newFile === 'object' && newFile.size > 0) {
        const validation = validateMarketingFile(newFile);
        if (!validation.valid) {
          return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
        }

        const uploadResult = await uploadImage(newFile, 'nextview/marketing');
        if (!uploadResult.success) {
          return NextResponse.json({ success: false, message: uploadResult.error || 'Failed to upload replacement file' }, { status: 500 });
        }

        updateFields.url = uploadResult.url;
        updateFields.fileUrl = uploadResult.url;
        updateFields.fileSize = newFile.size;
        updateFields.mimeType = newFile.type || '';
        updateFields.fileName = newFile.name || 'updated-asset';
      }

      // Check if replacing thumbnail
      const newThumbnail = formData.get('thumbnail');
      if (newThumbnail && typeof newThumbnail === 'object' && newThumbnail.size > 0) {
        const thumbValidation = validateMarketingFile(newThumbnail);
        if (thumbValidation.valid) {
          const thumbResult = await uploadImage(newThumbnail, 'nextview/marketing/thumbnails');
          if (thumbResult.success) {
            updateFields.thumbnailUrl = thumbResult.url;
          }
        }
      }
    } else {
      // JSON payload
      const body = await req.json().catch(() => ({}));
      updateFields = { ...body };
      if (updateFields.status) {
        updateFields.status = updateFields.status.toUpperCase();
        updateFields.isActive = updateFields.status === 'PUBLISHED';
      }
      if (updateFields.fileUrl && !updateFields.url) {
        updateFields.url = updateFields.fileUrl;
      }
      if (updateFields.url && !updateFields.fileUrl) {
        updateFields.fileUrl = updateFields.url;
      }
    }

    Object.assign(existing, updateFields);
    await existing.save();

    return NextResponse.json({
      success: true,
      message: 'Marketing content updated successfully.',
      material: existing,
    });
  } catch (error) {
    console.error('[Admin Gallery PATCH Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export const PUT = PATCH;

export async function DELETE(req, { params }) {
  const auth = await requireModuleAuth(req, 'admin');
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    await dbConnect();
    if (permanent) {
      await MlmMarketing.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Content permanently deleted.' });
    } else {
      // Soft-delete / Archive
      await MlmMarketing.findByIdAndUpdate(id, {
        status: 'ARCHIVED',
        isActive: false,
      });
      return NextResponse.json({ success: true, message: 'Content archived successfully.' });
    }
  } catch (error) {
    console.error('[Admin Gallery DELETE Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
