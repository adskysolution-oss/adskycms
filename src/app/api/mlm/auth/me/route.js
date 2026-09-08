import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmWallet from "@/models/mlm/MlmWallet.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;

  try {
    await dbConnect();
    const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
    const member = await MlmMember.findOne({
      $or: [{ userId: authId }, { _id: authId }]
    })
      .select("-__v")
      .lean();

    if (!member) {
      return NextResponse.json({ success: false, message: "Member not found." }, { status: 404 });
    }

    const wallet = await MlmWallet.findOne({
      $or: [{ memberId: member._id }, { userId: member.userId }]
    }).lean();

    return NextResponse.json({
      success: true,
      member: {
        ...member,
        wallet: wallet ?? null,
      },
    });
  } catch (error) {
    console.error("[MLM Me]", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
