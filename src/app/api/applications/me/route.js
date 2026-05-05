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
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await Application.find({ 
      $or: [
        { candidateId: decoded.id },
        { candidate: decoded.id }
      ]
    })
      .populate({
        path: 'jobId',
        select: 'title location type salary company',
        populate: {
          path: 'company',
          select: 'companyName logo'
        }
      })
      .sort({ createdAt: -1 });


    // Normalize
    const normalizedApps = applications.map(app => {
      const doc = app.toObject();
      return {
        ...doc,
        job: doc.jobId || doc.job,
        candidate: doc.candidateId || doc.candidate,
        employer: doc.employerId || doc.employer,
        company: doc.companyId || doc.company
      };
    });

    return NextResponse.json({ applications: normalizedApps }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
