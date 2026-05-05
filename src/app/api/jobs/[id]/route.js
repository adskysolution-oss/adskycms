import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import Category from '@/models/Category';
import Company from '@/models/Company';

export async function GET(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const job = await Job.findById(id)
      .populate('category', 'name icon tag')
      .populate('company');

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();
    const job = await Job.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();
    const job = await Job.findByIdAndUpdate(id, { $set: body }, { new: true });
    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    await Job.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Job deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
