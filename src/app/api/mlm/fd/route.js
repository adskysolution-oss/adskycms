import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MlmFdApplication from "@/models/mlm/MlmFdApplication";
import MlmProduct from "@/models/mlm/MlmProduct";
import MlmMember from "@/models/mlm/MlmMember";
import { requireModuleAuth } from "@/lib/moduleAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireModuleAuth(req, "mlm");
  if (auth instanceof NextResponse) return auth;

  await dbConnect();
  const authId = new mongoose.Types.ObjectId(auth.payload.id || auth.payload.userId);
  const member = await MlmMember.findOne({
    $or: [{ userId: authId }, { _id: authId }]
  });
  if (!member) return NextResponse.json({ success: false, message: 'Member not found' }, { status: 404 });

  const applications = await MlmFdApplication.find({
    $or: [{ memberId: member._id }, { userId: member.userId }]
  })
    .populate('productId', 'name type providerName logo minAmount creditLimit interestRate')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    success: true,
    data: applications,
    applications
  });
}
