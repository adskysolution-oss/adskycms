import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentJob from "@/models/recruitment/RecruitmentJob.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "recruitment");
  if (auth instanceof NextResponse) return auth;
  await dbConnect();
  const jobs = await RecruitmentJob.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, jobs });
}
