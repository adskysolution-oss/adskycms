import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import User from "@/models/User.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const auth = await requireModuleAuth(req, "mlm");
    if (auth instanceof NextResponse) {
      return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
    }

    await dbConnect();
    const rawId = auth.payload.id || auth.payload._id || auth.payload.userId;
    const isValidObjectId = rawId && typeof rawId === 'string' && mongoose.Types.ObjectId.isValid(rawId);

    // If admin role
    if (['admin', 'super_admin', 'operations_admin', 'superadmin'].includes(auth.payload.role)) {
      let adminUser = null;
      if (isValidObjectId) {
        adminUser = await User.findById(rawId).select('-password').lean();
      }
      return NextResponse.json({
        success: true,
        user: {
          id: adminUser?._id || rawId,
          fullName: adminUser?.name || auth.payload.name || "Administrator",
          email: adminUser?.email || auth.payload.email || "admin@adskysolution.com",
          role: auth.payload.role || "admin",
          status: "active",
        },
        data: {
          user: adminUser || auth.payload,
        }
      });
    }

    // Member role
    let member = null;
    if (isValidObjectId) {
      member = await MlmMember.findById(rawId).lean();
      if (!member) {
        member = await MlmMember.findOne({ userId: rawId }).lean();
      }
    }
    if (!member && auth.payload.email) {
      member = await MlmMember.findOne({ email: auth.payload.email }).lean();
    }
    if (!member && auth.payload.mobile) {
      member = await MlmMember.findOne({ mobile: auth.payload.mobile }).lean();
    }

    if (!member) {
      return NextResponse.json({ success: false, message: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: member._id,
        fullName: member.fullName,
        mobile: member.mobile,
        email: member.email,
        role: "mlm_member",
        status: member.status,
        kycStatus: member.kycStatus,
        platformFeePaid: member.platformFeePaid,
        mlmCode: member.mlmCode,
      },
      member,
      data: {
        user: member,
        member,
      }
    });
  } catch (error) {
    console.error("[Auth Me GET]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
