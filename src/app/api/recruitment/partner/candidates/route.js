import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentCandidate from "@/models/recruitment/RecruitmentCandidate.js";
import RecruitmentJob from "@/models/recruitment/RecruitmentJob.js";
import { uploadImage } from "@/lib/cloudinary.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "recruitment");
  if (auth instanceof NextResponse) return auth;
  await dbConnect();
  const candidates = await RecruitmentCandidate.find({ partnerId: auth.payload.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, candidates });
}

export async function POST(req) {
  const auth = await requireModuleAuth(req, "recruitment");
  if (auth instanceof NextResponse) return auth;
  try {
    await dbConnect();
    const formData = await req.formData();
    const jobId = formData.get("jobId");
    const job = jobId ? await RecruitmentJob.findById(jobId).lean() : null;

    let resumeUrl = "";
    const resumeFile = formData.get("resume");
    if (resumeFile && resumeFile.size > 0) {
      const bytes = await resumeFile.arrayBuffer();
      const base64 = `data:${resumeFile.type};base64,${Buffer.from(bytes).toString("base64")}`;
      const result = await uploadImage(base64, "recruitment/resumes");
      if (result.success) resumeUrl = result.url;
    }

    const candidate = await RecruitmentCandidate.create({
      partnerId: auth.payload.id,
      partnerCode: auth.payload.partnerCode,
      jobId: job?._id,
      jobCode: job?.jobCode,
      fullName: formData.get("fullName"),
      mobile: formData.get("mobile"),
      email: formData.get("email"),
      aadhaarNumber: formData.get("aadhaarNumber"),
      panNumber: formData.get("panNumber"),
      gender: formData.get("gender"),
      age: formData.get("age") ? Number(formData.get("age")) : undefined,
      state: formData.get("state"),
      district: formData.get("district"),
      address: formData.get("address"),
      qualification: formData.get("qualification"),
      experience: formData.get("experience"),
      skills: formData.get("skills") ? JSON.parse(formData.get("skills")) : [],
      expectedSalary: formData.get("expectedSalary") ? Number(formData.get("expectedSalary")) : undefined,
      resumeUrl,
      status: "submitted",
    });

    if (job) await RecruitmentJob.findByIdAndUpdate(jobId, { $inc: { candidatesSubmitted: 1 } });

    return NextResponse.json({ success: true, message: "Candidate submitted.", candidate });
  } catch (error) {
    console.error("[Recruitment Submit Candidate]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
