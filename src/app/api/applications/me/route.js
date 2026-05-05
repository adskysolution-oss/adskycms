import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await Application.find({ candidate: decoded.id })
      .populate({
        path: 'job',
        select: 'title location type salary company',
        populate: {
          path: 'company',
          select: 'companyName logo'
        }
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
