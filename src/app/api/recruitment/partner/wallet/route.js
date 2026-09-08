import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentWallet from "@/models/recruitment/RecruitmentWallet.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "recruitment");
  if (auth instanceof NextResponse) return auth;
  await dbConnect();
  const wallet = await RecruitmentWallet.findOne({ partnerId: auth.payload.id }).lean();
  return NextResponse.json({ success: true, wallet: wallet ?? { balance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0 } });
}
