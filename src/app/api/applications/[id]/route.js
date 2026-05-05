import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();
    const application = await Application.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();
    // Validate status if provided
    if (body.status && !['applied', 'shortlisted', 'rejected'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const application = await Application.findByIdAndUpdate(id, { $set: body }, { new: true });
    return NextResponse.json({ application }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    await Application.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Application deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
