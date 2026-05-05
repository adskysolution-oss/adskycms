import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const candidateId = searchParams.get('candidateId');
    const isEmployerQuery = searchParams.get('employer') === 'true';

    let query = {};
    if (jobId) query.job = jobId;
    if (candidateId) query.candidate = candidateId;

    if (isEmployerQuery && decoded) {
      // Find jobs owned by this employer
      const employerJobs = await Job.find({ company: decoded.id }).select('_id');
      const jobIds = employerJobs.map(j => j._id);
      query.job = { $in: jobIds };
    }

    const applications = await Application.find(query)
      .populate('job', 'title location type')
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { job, coverLetter } = body;
    let { resumeUrl } = body;

    if (!job) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      job,
      candidate: decoded.id
    });

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this job' }, { status: 400 });
    }

    // Resume logic: if not provided, try to get from user profile
    if (!resumeUrl) {
      const user = await User.findById(decoded.id);
      if (user && user.resumeUrl) {
        resumeUrl = user.resumeUrl;
      }
    }

    if (!resumeUrl) {
      return NextResponse.json({ error: 'Resume is required to apply' }, { status: 400 });
    }

    const application = await Application.create({
      job,
      candidate: decoded.id,
      resumeUrl,
      coverLetter,
      status: 'applied'
    });

    return NextResponse.json({ application, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

