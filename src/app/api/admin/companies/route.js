import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Company from '@/models/Company';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const companies = await Company.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ companies });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
