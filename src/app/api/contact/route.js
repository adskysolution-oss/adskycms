import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';
import { authenticateRequest } from '@/lib/auth';

// POST: create a contact (public)
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!body.email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    if (!body.phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
    if (!body.message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    await dbConnect();
    const contact = await Contact.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
    });

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error) {
    console.error('Contact POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: list contacts (admin only)
export async function GET(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const total = await Contact.countDocuments();
    const contacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, contacts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Contact GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: remove contact (admin only)
export async function DELETE(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded || decoded.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const doc = await Contact.findByIdAndDelete(id);
    if (!doc) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error('Contact DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
