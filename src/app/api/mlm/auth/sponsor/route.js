import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import MlmMember from "@/models/mlm/MlmMember.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim();

    if (!code) return NextResponse.json({ success: false, message: "Sponsor code required" }, { status: 400 });

    const sponsor = await MlmMember.findOne({
      $or: [
        { mlmCode: { $regex: new RegExp(`^${code}$`, "i") } },
        { referralToken: code },
      ],
      status: "ACTIVE",
    }).select("mlmCode fullName").lean();

    if (!sponsor) return NextResponse.json({ success: false, message: "Sponsor not found or inactive." }, { status: 404 });

    return NextResponse.json({
      success: true,
      sponsor: { code: sponsor.mlmCode, name: sponsor.fullName },
      data: { mlmCode: sponsor.mlmCode, fullName: sponsor.fullName },
    });
  } catch (error) {
    console.error("[Sponsor API Error]", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}