import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect.js';
import MlmMarketing from '@/models/mlm/MlmMarketing.js';
import { requireModuleAuth } from '@/lib/moduleAuth.js';
import { escapeRegex } from '@/lib/mlm/galleryValidator.js';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const auth = await requireModuleAuth(req, 'mlm');
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const category = searchParams.get('category');
    const contentType = searchParams.get('type') || searchParams.get('contentType');
    const sort = searchParams.get('sort') || 'latest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    const now = new Date();

    // Base filter: Only PUBLISHED and currently valid schedule
    const filter = {
      $and: [
        {
          $or: [
            { status: 'PUBLISHED' },
            { isActive: true, status: { $exists: false } },
          ],
        },
        {
          $or: [
            { publishFrom: { $lte: now } },
            { publishFrom: null },
            { publishFrom: { $exists: false } },
          ],
        },
        {
          $or: [
            { publishUntil: { $gte: now } },
            { publishUntil: null },
            { publishUntil: { $exists: false } },
          ],
        },
      ],
    };

    // Category filter
    if (category && category !== 'All') {
      filter.$and.push({ category });
    }

    // Content Type filter
    if (contentType && contentType !== 'All') {
      filter.$and.push({ contentType: contentType.toUpperCase() });
    }

    // Search query
    if (search) {
      const escaped = escapeRegex(search);
      const searchRegex = new RegExp(escaped, 'i');
      filter.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { caption: searchRegex },
          { shareText: searchRegex },
          { tags: searchRegex },
        ],
      });
    }

    // Sorting
    let sortQuery = { sortOrder: 1, displayOrder: 1, createdAt: -1 };
    if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (sort === 'downloads') {
      sortQuery = { downloadCount: -1, createdAt: -1 };
    } else if (sort === 'shares') {
      sortQuery = { shareCount: -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [total, items, featuredItems] = await Promise.all([
      MlmMarketing.countDocuments(filter),
      MlmMarketing.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      // Top featured items (max 6)
      MlmMarketing.find({
        ...filter,
        featured: true,
      })
        .sort({ sortOrder: 1, createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    // Available categories list
    const standardCategories = [
      'All',
      'Posters',
      'Images',
      'Videos',
      'Documents',
      'Banners',
      'Social Media',
      'Announcements',
      'Other',
    ];

    return NextResponse.json({
      success: true,
      items: items.map((item) => ({
        ...item,
        fileUrl: item.fileUrl || item.url,
      })),
      featuredItems: featuredItems.map((item) => ({
        ...item,
        fileUrl: item.fileUrl || item.url,
      })),
      categories: standardCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('[Gallery Member API GET Error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
