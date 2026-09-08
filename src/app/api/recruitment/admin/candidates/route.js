import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentCandidate from "@/models/recruitment/RecruitmentCandidate.js";
import RecruitmentPayout from "@/models/recruitment/RecruitmentPayout.js";
import RecruitmentWallet from "@/models/recruitment/RecruitmentWallet.js";
import { authenticateRequest } from "@/lib/auth.js";

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
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const partnerId = searchParams.get("partnerId");
  const filter = {};
  if (status) filter.status = status;
  if (partnerId) filter.partnerId = partnerId;
  const candidates = await RecruitmentCandidate.find(filter).sort({ submittedAt: -1 }).populate("partnerId", "companyName contactPerson partnerCode").lean();
  return NextResponse.json({ success: true, candidates });
}

export async function PATCH(req) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  try {
    await dbConnect();
    const { candidateId, status, adminNotes, joiningDate } = await req.json();
    const candidate = await RecruitmentCandidate.findByIdAndUpdate(
      candidateId,
      { status, adminNotes, ...(joiningDate ? { joiningDate: new Date(joiningDate) } : {}) },
      { new: true }
    );
    return NextResponse.json({ success: true, candidate });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
