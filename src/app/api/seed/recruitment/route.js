import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentConfig from "@/models/recruitment/RecruitmentConfig.js";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await dbConnect();
    const existing = await RecruitmentConfig.findOne({ key: "default" });
    if (existing) return NextResponse.json({ success: true, message: "Recruitment config already exists.", config: existing });

    const config = await RecruitmentConfig.create({
      key: "default",
      referralEnabled: true,
      subscriptionFeeRequired: false,
      subscriptionFeeAmount: 0,
      retentionPeriodDays: 90,
      milestonePayouts: [
        { type: "CANDIDATE_JOINED", triggerEvent: "candidate_joined", amount: 1000, isActive: true },
        { type: "CANDIDATE_RETAINED_90D", triggerEvent: "candidate_retained_90d", amount: 2000, isActive: true },
      ],
      commissionRate: 0,
      isActive: true,
    });

    return NextResponse.json({ success: true, message: "Recruitment module seeded.", config });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
