import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentPartner from "@/models/recruitment/RecruitmentPartner.js";
import RecruitmentWallet from "@/models/recruitment/RecruitmentWallet.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "recruitment");
  if (auth instanceof NextResponse) return auth;
  await dbConnect();
  const partner = await RecruitmentPartner.findById(auth.payload.id).select("-password -otp").lean();
  if (!partner) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  const wallet = await RecruitmentWallet.findOne({ partnerId: auth.payload.id }).lean();
  return NextResponse.json({ success: true, partner, wallet });
}
