import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import { requireModuleAuth } from "@/lib/moduleAuth.js";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const auth = await requireModuleAuth(req, "mlm");
    if (auth instanceof NextResponse) return auth;

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ success: false, message: "New password must be at least 8 characters long." }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, message: "Passwords do not match." }, { status: 400 });
    }

    const member = await MlmMember.findById(auth.payload.id);
    if (!member) {
      return NextResponse.json({ success: false, message: "Member not found." }, { status: 404 });
    }

    if (member.password && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, member.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "Current password is incorrect." }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    member.password = hashedPassword;
    await member.save();

    return NextResponse.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("[Change Password Error]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
