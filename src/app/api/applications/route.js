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
    const body = await req.json();
    const application = await Application.create(body);
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
