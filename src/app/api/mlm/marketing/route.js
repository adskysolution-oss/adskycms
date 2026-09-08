import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import MlmMarketing from "@/models/mlm/MlmMarketing.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const contentType = searchParams.get("type");
  const filter = { isActive: true };
  if (contentType) filter.contentType = contentType;
  const materials = await MlmMarketing.find(filter).sort({ displayOrder: 1 }).lean();
  return NextResponse.json({ success: true, materials });
}
