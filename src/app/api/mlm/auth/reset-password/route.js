import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import MlmMember from "@/models/mlm/MlmMember.js";
import User from "@/models/User.js";
import MlmPasswordReset from "@/models/mlm/MlmPasswordReset.js";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { memberId, identifier, otp, newPassword, confirmPassword } = body;

    if (!otp || typeof otp !== "string" || !otp.trim()) {
      return NextResponse.json(
        { success: false, message: "6-digit OTP is required." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New password and confirmation password do not match." },
        { status: 400 }
      );
    }

    // 1. Locate the active OTP reset record
    let queryConditions = [];
    if (memberId && mongoose.Types.ObjectId.isValid(memberId)) {
      queryConditions.push({ memberId: new mongoose.Types.ObjectId(memberId) });
    }
    if (identifier && typeof identifier === "string" && identifier.trim()) {
      const cleanId = identifier.trim();
      queryConditions.push(
        { identifier: cleanId },
        { mobile: cleanId },
        { email: cleanId.toLowerCase() }
      );
    }

    if (queryConditions.length === 0) {
      return NextResponse.json(
        { success: false, message: "Member identifier is required to verify OTP." },
        { status: 400 }
      );
    }

    const resetRecord = await MlmPasswordReset.findOne({
      $or: queryConditions,
      otpExpires: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP. Please request a new verification code." },
        { status: 400 }
      );
    }

    // 2. Check maximum attempts (5 tries)
    if ((resetRecord.otpAttempts || 0) >= 5) {
      await resetRecord.deleteOne();
      return NextResponse.json(
        { success: false, message: "Too many failed attempts. Please request a new OTP." },
        { status: 400 }
      );
    }

    // 3. Verify OTP
    if (resetRecord.otp.trim() !== otp.trim()) {
      resetRecord.otpAttempts = (resetRecord.otpAttempts || 0) + 1;
      await resetRecord.save();
      const remaining = 5 - resetRecord.otpAttempts;
      return NextResponse.json(
        {
          success: false,
          message: `Incorrect OTP code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "Please request a new code."}`,
        },
        { status: 400 }
      );
    }

    // 4. Update Password on MlmMember and linked User
    const member = await MlmMember.findById(resetRecord.memberId);
    if (!member) {
      return NextResponse.json(
        { success: false, message: "NextView member account not found." },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    member.password = hashedPassword;
    await member.save();

    if (member.userId) {
      try {
        await User.findByIdAndUpdate(member.userId, { password: hashedPassword });
      } catch (err) {
        console.warn("[Reset Password] Warning updating linked user:", err.message);
      }
    }

    // 5. Clean up reset records for this member
    await MlmPasswordReset.deleteMany({ memberId: member._id });

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
      member: {
        mlmCode: member.mlmCode,
        fullName: member.fullName,
        mobile: member.mobile,
        email: member.email,
      },
    });
  } catch (error) {
    console.error("[NextView Reset Password Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
