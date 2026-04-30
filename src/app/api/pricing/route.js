import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PricingPlan from '@/models/PricingPlan';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const plans = await PricingPlan.find().sort({ order: 1 });
    return NextResponse.json({ success: true, plans });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const plan = await PricingPlan.create(body);
    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id, ...data } = await request.json();
    const plan = await PricingPlan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const decoded = authenticateRequest(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const plan = await PricingPlan.findByIdAndDelete(id);
    if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
