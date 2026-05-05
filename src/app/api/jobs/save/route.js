import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';

export async function POST(req) {
  await dbConnect();
  try {
    const decoded = authenticateRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isSaved = user.savedJobs.includes(jobId);
    
    if (isSaved) {
      // Remove from saved jobs
      user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      // Add to saved jobs
      user.savedJobs.push(jobId);
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      isSaved: !isSaved,
      message: isSaved ? 'Job removed from saved' : 'Job saved successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
