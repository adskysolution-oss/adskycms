import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import MlmShareConfig from "@/models/mlm/MlmShareConfig.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";
import { DEFAULT_SHARE_MESSAGE } from "@/constants/mlmShare.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();

    // Check optional MLM auth to personalize if member token is present
    let member = null;
    try {
      const auth = await requireModuleAuth(req, "mlm");
      if (!(auth instanceof NextResponse) && auth?.payload?.id) {
        member = await MlmMember.findById(auth.payload.id).select("mlmCode fullName referralToken").lean();
      }
    } catch {
      // Allow unauthenticated fallback so template can still be fetched
    }

    let config = await MlmShareConfig.findOne({ key: "default" }).lean();
    if (!config) {
      config = {
        key: "default",
        title: "NEXVIA Referral WhatsApp Share",
        messageTemplate: DEFAULT_SHARE_MESSAGE,
        posterUrl: "",
        posterTitle: "NEXVIA Official Promotional Poster",
        includePosterUrlInText: false,
        isActive: true,
      };
    }

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = req.headers.get("origin") || (host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_BASE_URL || "https://www.adskysolution.com"));

    const memberCode = member?.mlmCode || "";
    const memberName = member?.fullName || "NEXVIA Member";
    const referralLink = memberCode
      ? `${baseUrl}/nextview/register?sponsor=${memberCode}`
      : `${baseUrl}/nextview/register`;

    const rawTemplate = config.messageTemplate || DEFAULT_SHARE_MESSAGE;
    let personalizedMessage = rawTemplate
      .replace(/\{\{REFERRAL_LINK\}\}/g, referralLink)
      .replace(/\*?\{\{REFERRAL_CODE\}\}\*?/g, memberCode ? `*${memberCode}*` : '{{REFERRAL_CODE}}')
      .replace(/\{\{MEMBER_NAME\}\}/g, memberName);

    if (config.includePosterUrlInText && config.posterUrl && !personalizedMessage.includes(config.posterUrl)) {
      personalizedMessage += `\n\n🖼️ Official Campaign Poster:\n${config.posterUrl}`;
    }

    const data = {
      ...config,
      personalizedMessage,
      referralLink,
      posterUrl: config.posterUrl || null,
    };

    return NextResponse.json({
      success: true,
      data,
      config: data,
    });
  } catch (err) {
    console.error("Error in GET /api/mlm/share-config:", err);
    const fallbackData = {
      key: "default",
      title: "NEXVIA Referral WhatsApp Share",
      messageTemplate: DEFAULT_SHARE_MESSAGE,
      personalizedMessage: DEFAULT_SHARE_MESSAGE,
      referralLink: "https://www.adskysolution.com/nextview/register",
      posterUrl: null,
      includePosterUrlInText: false,
    };
    return NextResponse.json({
      success: true,
      data: fallbackData,
      config: fallbackData,
    });
  }
}

