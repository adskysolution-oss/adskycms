import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';

export async function PUT(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    
    // Update basic user fields and profile-specific fields
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { 
        $set: { 
          skills: body.skills,
          resumeUrl: body.resumeUrl,
          // Add other profile fields if needed
        } 
      },
      { new: true }
    ).select('-password');

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
