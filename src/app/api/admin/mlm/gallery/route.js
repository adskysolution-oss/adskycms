import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect.js';
import MlmMarketing from '@/models/mlm/MlmMarketing.js';
import { requireModuleAuth } from '@/lib/moduleAuth.js';
import { uploadImage } from '@/lib/cloudinary.js';
import { validateMarketingFile, escapeRegex } from '@/lib/mlm/galleryValidator.js';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const auth = await requireModuleAuth(req, 'admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const contentType = searchParams.get('contentType');
    const sort = searchParams.get('sort') || 'latest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const filter = {};

    if (status && status !== 'ALL') {
      filter.status = status.toUpperCase();
    }

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (contentType && contentType !== 'ALL') {
      filter.contentType = contentType.toUpperCase();
    }

    if (search) {
      const escaped = escapeRegex(search);
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { caption: searchRegex },
        { shareText: searchRegex },
        { tags: searchRegex },
      ];
    }

    let sortQuery = { createdAt: -1 };
    if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (sort === 'downloads') {
      sortQuery = { downloadCount: -1, createdAt: -1 };
    } else if (sort === 'shares') {
      sortQuery = { shareCount: -1, createdAt: -1 };
    } else if (sort === 'order') {
      sortQuery = { sortOrder: 1, displayOrder: 1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [items, total, statsAgg] = await Promise.all([
      MlmMarketing.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      MlmMarketing.countDocuments(filter),
      // Aggregate summary statistics across entire marketing collection
      MlmMarketing.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ['$status', 'PUBLISHED'] }, { $and: [{ $eq: ['$isActive', true] }, { $not: ['$status'] }] }] },
                  1,
                  0,
                ],
              },
            },
            draft: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } },
            archived: { $sum: { $cond: [{ $eq: ['$status', 'ARCHIVED'] }, 1, 0] } },
            images: {
              $sum: {
                $cond: [{ $in: ['$contentType', ['POSTER', 'IMAGE', 'BANNER']] }, 1, 0],
              },
            },
            videos: {
              $sum: {
                $cond: [{ $in: ['$contentType', ['VIDEO', 'REEL']] }, 1, 0],
              },
            },
            documents: {
              $sum: {
                $cond: [{ $in: ['$contentType', ['DOCUMENT', 'PDF', 'PPT']] }, 1, 0],
              },
            },
            totalDownloads: { $sum: { $ifNull: ['$downloadCount', 0] } },
            totalShares: { $sum: { $ifNull: ['$shareCount', 0] } },
          },
        },
      ]),
    ]);

    const stats = statsAgg[0] || {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      images: 0,
      videos: 0,
      documents: 0,
      totalDownloads: 0,
      totalShares: 0,
    };

    return NextResponse.json({
      success: true,
      items: items.map((item) => ({
        ...item,
        fileUrl: item.fileUrl || item.url,
      })),
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Admin Gallery GET Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = await requireModuleAuth(req, 'admin');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const formData = await req.formData();

    const title = (formData.get('title') || '').trim();
    if (!title) {
      return NextResponse.json({ success: false, message: 'Content title is required.' }, { status: 400 });
    }

    const category = formData.get('category') || 'Posters';
    let contentType = (formData.get('contentType') || 'POSTER').toUpperCase();
    const description = (formData.get('description') || '').trim();
    const caption = (formData.get('caption') || '').trim();
    const shareText = (formData.get('shareText') || '').trim();
    const status = (formData.get('status') || 'PUBLISHED').toUpperCase();
    const featured = formData.get('featured') === 'true';
    const sortOrder = parseInt(formData.get('sortOrder') || '0', 10) || 0;

    const publishFromRaw = formData.get('publishFrom');
    const publishUntilRaw = formData.get('publishUntil');
    const publishFrom = publishFromRaw ? new Date(publishFromRaw) : null;
    const publishUntil = publishUntilRaw ? new Date(publishUntilRaw) : null;

    let captions = {};
    const captionsRaw = formData.get('captions');
    if (captionsRaw) {
      try {
        captions = typeof captionsRaw === 'string' ? JSON.parse(captionsRaw) : captionsRaw;
      } catch {
        // Fallback if not valid JSON
      }
    }

    let tags = [];
    const tagsRaw = formData.get('tags');
    if (tagsRaw) {
      try {
        tags = typeof tagsRaw === 'string' && tagsRaw.startsWith('[')
          ? JSON.parse(tagsRaw)
          : tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
      } catch {
        tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // Media file upload
    const file = formData.get('file');
    let fileUrl = formData.get('fileUrl') || formData.get('url') || '';
    let fileSize = 0;
    let mimeType = '';
    let fileName = '';

    if (file && typeof file === 'object' && file.size > 0) {
      const validation = validateMarketingFile(file);
      if (!validation.valid) {
        return NextResponse.json({ success: false, message: validation.error }, { status: 400 });
      }

      fileSize = file.size;
      mimeType = file.type || '';
      fileName = file.name || 'marketing-asset';

      // Auto-set content type if generic
      if (validation.fileType && (contentType === 'OTHER' || contentType === 'POSTER')) {
        contentType = validation.fileType;
      }

      const uploadResult = await uploadImage(file, 'nextview/marketing');
      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, message: uploadResult.error || 'Failed to upload media to storage.' },
          { status: 500 }
        );
      }
      fileUrl = uploadResult.url;
    }

    // Optional thumbnail upload (e.g. for videos or PDFs)
    const thumbnailFile = formData.get('thumbnail');
    let thumbnailUrl = formData.get('thumbnailUrl') || '';

    if (thumbnailFile && typeof thumbnailFile === 'object' && thumbnailFile.size > 0) {
      const thumbValidation = validateMarketingFile(thumbnailFile);
      if (thumbValidation.valid) {
        const thumbResult = await uploadImage(thumbnailFile, 'nextview/marketing/thumbnails');
        if (thumbResult.success) {
          thumbnailUrl = thumbResult.url;
        }
      }
    }

    // Fallback: If image and no separate thumbnail provided, use fileUrl as thumbnail
    if (!thumbnailUrl && fileUrl && (contentType === 'POSTER' || contentType === 'IMAGE' || contentType === 'BANNER')) {
      thumbnailUrl = fileUrl;
    }

    const newMaterial = await MlmMarketing.create({
      title,
      description,
      category,
      contentType,
      url: fileUrl,
      fileUrl,
      thumbnailUrl,
      caption,
      shareText,
      captions,
      tags,
      status,
      featured,
      isActive: status === 'PUBLISHED',
      sortOrder,
      displayOrder: sortOrder,
      publishFrom,
      publishUntil,
      fileSize,
      mimeType,
      fileName,
      uploadedBy: auth.payload?.email || 'admin',
      viewCount: 0,
      downloadCount: 0,
      shareCount: 0,
      copyCount: 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Marketing content created successfully.',
      material: newMaterial,
    });
  } catch (error) {
    console.error('[Admin Gallery POST Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
