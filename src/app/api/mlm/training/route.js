import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import MlmTraining from "@/models/mlm/MlmTraining.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;
  await dbConnect();
  const trainings = await MlmTraining.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
  return NextResponse.json({ success: true, trainings });
}
