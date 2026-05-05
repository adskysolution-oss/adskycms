import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';
import Company from '@/models/Company';
import { authenticateRequest } from '@/lib/auth';

export async function GET(req) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(req);
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const candidateId = searchParams.get('candidateId');
    const isEmployerQuery = searchParams.get('employer') === 'true';

    console.log('[DEBUG] GET Applications - User:', decoded?.id, 'Role:', decoded?.role, 'IsEmployerQuery:', isEmployerQuery);

    let query = {};
    if (jobId) query.$or = [{ jobId }, { job: jobId }];
    if (candidateId) query.$or = [{ candidateId }, { candidate: candidateId }];

    if (isEmployerQuery && decoded) {
      const company = await Company.findOne({ user: decoded.id });
      console.log('[DEBUG] Employer Company:', company?._id, company?.companyName);

      if (company) {
        query.$or = [
          { employerId: decoded.id },
          { companyId: company._id },
          { employer: decoded.id },
          { company: company._id }
        ];
      } else {
        query.$or = [
          { employerId: decoded.id },
          { employer: decoded.id }
        ];
      }
    }

    const applications = await Application.find(query)
      .populate('jobId candidateId')

      .sort({ createdAt: -1 });

    console.log(`[DEBUG] Found ${applications.length} applications for query:`, JSON.stringify(query));

    // Normalize and Self-Heal
    const normalizedApps = await Promise.all(applications.map(async (app) => {
      const doc = app.toObject();
      let normalized = {
        ...doc,
        job: doc.jobId || doc.job,
        candidate: doc.candidateId || doc.candidate,
        employer: doc.employerId || doc.employer,
        company: doc.companyId || doc.company
      };

      // Ensure Job is an object with title
      if (!normalized.job || !normalized.job.title) {
         const fullJob = await Job.findById(normalized.job?._id || normalized.job).populate('company');
         if (fullJob) normalized.job = fullJob;
      }

      // Self-heal missing owner fields
      if (!doc.employerId && normalized.job?.company) {
        try {
          const comp = await Company.findById(normalized.job.company._id || normalized.job.company);
          if (comp) {
            await Application.findByIdAndUpdate(doc._id, { 
              $set: { 
                employerId: comp.user, 
                companyId: comp._id,
                jobId: normalized.job._id,
                candidateId: normalized.candidate?._id || normalized.candidate
              } 
            });
            normalized.employer = comp.user;
            normalized.company = comp._id;
          }
        } catch (err) {
          console.error('[HEAL ERROR]', err.message);
        }
      }

      return normalized;
    }));

    return NextResponse.json({ applications: normalizedApps, success: true }, { status: 200 });
  } catch (error) {
    console.error('[API ERROR] GET Applications:', error);
    return NextResponse.json({ error: error.message, success: false }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(req);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { job: jobId, coverLetter } = body;
    let { resumeUrl } = body;

    if (!jobId) return NextResponse.json({ error: 'Job ID required' }, { status: 400 });

    const job = await Job.findById(jobId).populate('company');
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const company = job.company;
    if (!company) return NextResponse.json({ error: 'Job has no linked company' }, { status: 400 });

    // Strict Duplicate Check
    const existing = await Application.findOne({
      $and: [
        { $or: [{ jobId: jobId }, { job: jobId }] },
        { $or: [{ candidateId: decoded.id }, { candidate: decoded.id }] }
      ]
    });

    if (existing) {
      return NextResponse.json({ error: 'Already applied for this position', success: false }, { status: 400 });
    }

    if (!resumeUrl) {
      const user = await User.findById(decoded.id);
      resumeUrl = user?.resumeUrl;
    }

    if (!resumeUrl) return NextResponse.json({ error: 'Resume required' }, { status: 400 });

    const application = await Application.create({
      jobId: jobId,
      candidateId: decoded.id,
      employerId: company.user,
      companyId: company._id,
      resumeUrl,
      coverLetter,
      status: 'applied'
    });

    console.log('[DEBUG] Application created:', application._id, 'for employer:', company.user);

    return NextResponse.json({ application, success: true }, { status: 201 });
  } catch (error) {
    console.error('[API ERROR] POST Application:', error);
    return NextResponse.json({ error: error.message, success: false }, { status: 400 });
  }
}
