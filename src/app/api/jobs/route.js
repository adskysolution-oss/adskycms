import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import Category from '@/models/Category';
import Company from '@/models/Company';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');
    const isMyJobs = searchParams.get('my') === 'true';

    let query = { isActive: true };
    if (isMyJobs && decoded) {
      query.company = decoded.id;
    }
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(query)
      .populate('category', 'name icon tag')
      .populate('company', 'companyName logo')
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const job = await Job.create(body);
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
