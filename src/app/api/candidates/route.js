import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded || !['admin', 'employer'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const skills = searchParams.get('skills');
    const name = searchParams.get('name');

    let query = { role: 'candidate' };
    
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArray.map(s => new RegExp(s, 'i')) };
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    const candidates = await User.find(query)
      .select('name email skills resumeUrl experience education')
      .limit(20);

    return NextResponse.json({ candidates });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
