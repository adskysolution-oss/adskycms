import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import MlmShareConfig from "@/models/mlm/MlmShareConfig.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;
  await dbConnect();
  const member = await MlmMember.findById(auth.payload.id).select("mlmCode fullName referralToken").lean();
  const config = await MlmShareConfig.findOne({ key: "default", isActive: true }).lean();
  if (!config) return NextResponse.json({ success: false, message: "Share config not set up yet." }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const referralLink = `${baseUrl}/nextview/register?ref=${member?.referralToken || member?.mlmCode}`;

  const personalizedMessage = (config.messageTemplate || "")
    .replace(/{{MEMBER_NAME}}/g, member?.fullName || "NextView Member")
    .replace(/{{REFERRAL_CODE}}/g, member?.mlmCode || "")
    .replace(/{{REFERRAL_LINK}}/g, referralLink);

  return NextResponse.json({
    success: true,
    config: { ...config, personalizedMessage, referralLink, posterUrl: config.posterUrl || null },
  });
}
