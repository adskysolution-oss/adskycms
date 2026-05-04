import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import Category from '@/models/Category';
import Company from '@/models/Company';
import User from '@/models/User';
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

    if (isMyJobs) {
      if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      
      // If employer, only show their company's jobs
      if (decoded.role === 'employer') {
        const company = await Company.findOne({ user: decoded.id });
        if (!company) return NextResponse.json({ jobs: [] });
        query.company = company._id;
        delete query.isActive; // Employers can see their inactive jobs
      } else if (decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
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
    const decoded = authenticateRequest(req);
    if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'employer')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Handle manual category entry
    if (body.manualCategory) {
      let cat = await Category.findOne({ name: { $regex: new RegExp(`^${body.manualCategory}$`, 'i') } });
      if (!cat) {
        cat = await Category.create({ 
          name: body.manualCategory, 
          type: 'job',
          icon: 'FaBriefcase'
        });
      }
      body.category = cat._id;
    }

    // Auto-associate company for employers
    if (decoded.role === 'employer') {
      const company = await Company.findOne({ user: decoded.id });
      if (!company) return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
      if (company.status !== 'approved') return NextResponse.json({ error: 'Company not approved yet' }, { status: 403 });
      body.company = company._id;
    }

    if (!body.category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (!body.company) {
      return NextResponse.json({ error: 'Company is required' }, { status: 400 });
    }

    const job = await Job.create(body);
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
