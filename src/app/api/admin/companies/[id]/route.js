import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Company from '@/models/Company';
import { authenticateRequest } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = params;
    const { status } = await request.json();

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const company = await Company.findByIdAndUpdate(id, { $set: { status } }, { new: true });

    return NextResponse.json({ success: true, company });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
