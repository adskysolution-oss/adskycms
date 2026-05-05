import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { authenticateRequest } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';


export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    let query = {};
    if (activeOnly) query.isActive = true;

    const projects = await Project.find(query).sort({ order: 1 });
    return NextResponse.json({ success: true, projects });
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
    const project = await Project.create(body);
    return NextResponse.json({ success: true, project }, { status: 201 });
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

    const existingProject = await Project.findById(id);
    if (!existingProject) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Handle Cloudinary Image Cleanup
    if (updateData.imagePublicId && existingProject.imagePublicId && updateData.imagePublicId !== existingProject.imagePublicId) {
      console.log('[DEBUG] Deleting old project image:', existingProject.imagePublicId);
      await deleteImage(existingProject.imagePublicId);
    }

    const project = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    revalidatePath('/');
    revalidatePath('/projects');
    return NextResponse.json({ success: true, project });
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

    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Cleanup Cloudinary before DB deletion
    if (project.imagePublicId) {
      console.log('[DEBUG] Deleting project image on record deletion:', project.imagePublicId);
      await deleteImage(project.imagePublicId);
    }

    await Project.findByIdAndDelete(id);
    revalidatePath('/');
    revalidatePath('/projects');
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
