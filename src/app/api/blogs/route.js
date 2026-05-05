import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';


export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const admin = searchParams.get('admin');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (slug) {
      const blog = await Blog.findOne({ slug }).populate('author', 'name avatar');
      if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      blog.views += 1;
      await blog.save();
      return NextResponse.json({ success: true, blog });
    }

    const filter = admin ? {} : { isPublished: true };
    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body.title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    if (!body.content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    if (!body.slug) {
      const slugify = (await import('slugify')).default;
      body.slug = slugify(body.title, { lower: true, strict: true });
    }

    body.author = decoded.id;
    const blog = await Blog.create(body);
    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...updateData } = body;

    const existingBlog = await Blog.findById(id);
    if (!existingBlog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });

    // Handle Cloudinary Image Cleanup
    if (updateData.coverImagePublicId && existingBlog.coverImagePublicId && updateData.coverImagePublicId !== existingBlog.coverImagePublicId) {
      console.log('[DEBUG] Deleting old blog cover image:', existingBlog.coverImagePublicId);
      await deleteImage(existingBlog.coverImagePublicId);
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    revalidatePath('/');
    revalidatePath('/blogs');
    return NextResponse.json({ success: true, blog });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const blog = await Blog.findById(id);
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });

    // Cleanup Cloudinary before DB deletion
    if (blog.coverImagePublicId) {
      console.log('[DEBUG] Deleting blog image on record deletion:', blog.coverImagePublicId);
      await deleteImage(blog.coverImagePublicId);
    }

    await Blog.findByIdAndDelete(id);
    revalidatePath('/');
    revalidatePath('/blogs');
    return NextResponse.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
