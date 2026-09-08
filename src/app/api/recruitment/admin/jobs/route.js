import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentJob from "@/models/recruitment/RecruitmentJob.js";
import { authenticateRequest } from "@/lib/auth.js";
import crypto from "crypto";

export const dynamic = "force-dynamic";

async function requireAdmin(req) {
  const user = await authenticateRequest(req);
  if (!user || user.role !== "admin") return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
  return user;
}

export async function GET(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await dbConnect();
  const jobs = await RecruitmentJob.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, jobs });
}

export async function POST(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  try {
    await dbConnect();
    const body = await req.json();
    const jobCode = `JB${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const job = await RecruitmentJob.create({ ...body, jobCode });
    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { jobId, ...updates } = await req.json();
  const job = await RecruitmentJob.findByIdAndUpdate(jobId, updates, { new: true });
  return NextResponse.json({ success: true, job });
}

export async function DELETE(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, message: "id required" }, { status: 400 });
  await dbConnect();
  await RecruitmentJob.findByIdAndDelete(id);
  return NextResponse.json({ success: true, message: "Job deleted." });
}
