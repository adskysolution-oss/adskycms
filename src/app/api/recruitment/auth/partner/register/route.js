import { NextResponse } from "next/server";
import dbConnect from "@/lib/db.js";
import RecruitmentPartner from "@/models/recruitment/RecruitmentPartner.js";
import MlmPendingRegistration from "@/models/mlm/MlmPendingRegistration.js";
import { generateOTP } from "@/lib/otp.js";
import { sendEmail } from "@/services/emailService.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function generatePartnerCode() {
  return `RP${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function POST(req) {
  try {
    await dbConnect();
    const { companyName, contactPerson, email, mobile, password, confirmPassword, state, district, address, pincode, gstNumber } = await req.json();

    if (!companyName || !contactPerson || !email || !mobile || !password) {
      return NextResponse.json({ success: false, message: "All required fields must be filled." }, { status: 400 });
    }
    if (!/^\d{10}$/.test(mobile)) return NextResponse.json({ success: false, message: "Valid 10-digit mobile required." }, { status: 400 });
    if (!email.includes("@")) return NextResponse.json({ success: false, message: "Valid email required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    if (confirmPassword && password !== confirmPassword) return NextResponse.json({ success: false, message: "Passwords do not match." }, { status: 400 });

    const existing = await RecruitmentPartner.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] }).lean();
    if (existing) return NextResponse.json({ success: false, message: "Email or Mobile already registered." }, { status: 400 });

    // Store pending registration (reuse MlmPendingRegistration with different type)
    await MlmPendingRegistration.deleteMany({ mobile, type: "recruitment_registration" });

    const otp = generateOTP(6);
    const hashedPassword = await bcrypt.hash(password, 12);

    await MlmPendingRegistration.create({
      mobile,
      email: email.toLowerCase(),
      type: "recruitment_registration",
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      fullName: contactPerson,
      password: hashedPassword,
      sponsorCode: "RECRUITMENT_MODULE",
      state, district, address, pincode,
      termsAccepted: true,
    });

    await sendEmail({
      to: email,
      subject: "AdSky Recruitment Partner — OTP Verification",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">
        <h2 style="color:#2563EB">Recruitment Partner Registration</h2>
        <p>Hello <strong>${contactPerson}</strong>, verify your email to complete partner registration.</p>
        <div style="background:#f4f4f4;padding:20px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:5px;border-radius:5px;margin:20px 0">${otp}</div>
        <p style="color:#888;font-size:12px">OTP valid for 10 minutes. Do not share with anyone.</p>
      </div>`,
    });

    return NextResponse.json({ success: true, message: "OTP sent to your email.", email: email.toLowerCase(), mobile, companyName, contactPerson, gstNumber, state, district, address, pincode });
  } catch (error) {
    console.error("[Recruitment Register]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
