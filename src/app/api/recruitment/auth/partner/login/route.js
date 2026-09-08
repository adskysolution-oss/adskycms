import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentPartner from "@/models/recruitment/RecruitmentPartner.js";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "adsky-nextview-secret-key-2026");

export async function POST(req) {
  try {
    await dbConnect();
    const { identifier, password } = await req.json();

    const partner = await RecruitmentPartner.findOne({
      $or: [{ email: identifier?.toLowerCase() }, { mobile: identifier }],
    });

    if (!partner) return NextResponse.json({ success: false, message: "Invalid credentials." }, { status: 401 });

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) return NextResponse.json({ success: false, message: "Invalid credentials." }, { status: 401 });

    if (partner.status === "rejected" || partner.status === "suspended") {
      return NextResponse.json({ success: false, message: `Account is ${partner.status}. Contact support.` }, { status: 403 });
    }

    const tokenPayload = { id: partner._id.toString(), partnerCode: partner.partnerCode, role: "recruitment_partner", email: partner.email };
    const token = await new SignJWT(tokenPayload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });

    return NextResponse.json({ success: true, partner: { id: partner._id, partnerCode: partner.partnerCode, companyName: partner.companyName, status: partner.status, dashboardAccess: partner.dashboardAccess } });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
