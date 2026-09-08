import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db.js";
import MlmMember from "@/models/mlm/MlmMember.js";
import User from "@/models/User.js";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);

export async function POST(req) {
  try {
    await dbConnect();
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Mobile/Email/Member Code and password are required." },
        { status: 400 }
      );
    }

    const cleanId = identifier.trim();

    // 1. Search in MlmMember by mobile, email, or mlmCode
    let member = await MlmMember.findOne({
      $or: [
        { mobile: cleanId },
        { email: cleanId.toLowerCase() },
        { mlmCode: cleanId.toUpperCase() },
      ],
    });

    let effectivePasswordHash = member?.password;

    // 2. If member password not directly on member, check linked User
    if (!effectivePasswordHash && member?.userId) {
      const linkedUser = await User.findById(member.userId);
      if (linkedUser?.password) {
        effectivePasswordHash = linkedUser.password;
      }
    }

    // 3. If no member found, check User collection and find linked member
    if (!member) {
      const user = await User.findOne({
        $or: [
          { mobile: cleanId },
          { email: cleanId.toLowerCase() },
        ],
      });
      if (user) {
        effectivePasswordHash = user.password;
        member = await MlmMember.findOne({
          $or: [
            { userId: user._id },
            { email: user.email },
            { mobile: user.mobile },
          ],
        });
      }
    }

    if (!member) {
      return NextResponse.json({ success: false, message: "Invalid credentials." }, { status: 401 });
    }

    if (!effectivePasswordHash) {
      return NextResponse.json(
        { success: false, message: "No password set for this account. Please set a password or contact support." },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, effectivePasswordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid credentials." }, { status: 401 });
    }

    if (member.status === "SUSPENDED") {
      return NextResponse.json(
        { success: false, message: "Your NextView account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    if (member.status === "DEACTIVATED") {
      return NextResponse.json(
        { success: false, message: "Your NextView account has been deactivated." },
        { status: 403 }
      );
    }

    const tokenPayload = {
      id: member._id.toString(),
      mlmCode: member.mlmCode,
      role: "mlm_member",
      fullName: member.fullName,
      email: member.email,
      mobile: member.mobile,
    };

    const token = await new SignJWT(tokenPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    cookieStore.set("mlm_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Login successful. Welcome back!",
      token,
      member: {
        id: member._id,
        mlmCode: member.mlmCode,
        fullName: member.fullName,
        mobile: member.mobile,
        email: member.email,
        status: member.status,
        kycStatus: member.kycStatus,
        platformFeePaid: member.platformFeePaid,
        referralToken: member.referralToken,
      },
    });
  } catch (error) {
    console.error("[MLM Login]", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
