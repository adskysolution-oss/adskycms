import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Company from '@/models/Company';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const company = await Company.findOne({ user: decoded.id });
    return NextResponse.json({ company });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    
    // Check if company already exists
    const existing = await Company.findOne({ user: decoded.id });
    if (existing) return NextResponse.json({ error: 'Company already exists' }, { status: 400 });

    const company = await Company.create({
      ...body,
      user: decoded.id,
      status: 'pending'
    });

    return NextResponse.json({ success: true, company }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    
    const company = await Company.findOneAndUpdate(
      { user: decoded.id },
      { $set: body },
      { new: true }
    );

    return NextResponse.json({ success: true, company });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
