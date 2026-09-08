import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import MlmMember from "@/models/mlm/MlmMember.js";
import MlmPendingRegistration from "@/models/mlm/MlmPendingRegistration.js";
import { generateOTP } from "@/lib/otp.js";
import { sendEmail } from "@/services/emailService.js";
import { sendSMS } from "@/lib/sms.js";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const {
      fullName,
      mobile,
      email,
      password,
      confirmPassword,
      sponsorCode,
      verificationMethod = 'MOBILE',
      pincode,
      state,
      district,
      city,
      block,
      address,
      termsAccepted
    } = body;

    const vMethod = (verificationMethod || 'MOBILE').toUpperCase() === 'EMAIL' ? 'EMAIL' : 'MOBILE';

    if (!sponsorCode?.trim()) {
      return NextResponse.json({ success: false, message: "NextView Sponsor Code is required to register." }, { status: 400 });
    }

    const sponsorMember = await MlmMember.findOne({
      $or: [
        { mlmCode: { $regex: new RegExp(`^${sponsorCode.trim()}$`, "i") } },
        { referralToken: sponsorCode.trim() },
      ],
    }).lean();

    if (!sponsorMember) {
      return NextResponse.json({ success: false, message: "Invalid Sponsor Code. Please check and try again." }, { status: 400 });
    }

    if (!fullName?.trim()) return NextResponse.json({ success: false, message: "Full Name is required" }, { status: 400 });
    if (!mobile || !/^\d{10}$/.test(mobile.trim())) return NextResponse.json({ success: false, message: "Valid 10-digit Mobile Number is required" }, { status: 400 });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return NextResponse.json({ success: false, message: "Valid Email is required" }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ success: false, message: "Password must be at least 8 characters" }, { status: 400 });
    if (confirmPassword && password !== confirmPassword) return NextResponse.json({ success: false, message: "Passwords do not match" }, { status: 400 });

    const existingMember = await MlmMember.findOne({
      $or: [{ mobile: mobile.trim() }, { email: email.trim().toLowerCase() }]
    }).lean();
    if (existingMember) return NextResponse.json({ success: false, message: "Mobile or Email already registered with NextView." }, { status: 400 });

    // Clear previous pending registrations for this mobile or email
    await MlmPendingRegistration.deleteMany({
      $or: [{ mobile: mobile.trim() }, { email: email.trim().toLowerCase() }]
    });

    const otp = generateOTP(6);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 12);

    await MlmPendingRegistration.create({
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      otp,
      otpExpires,
      verificationMethod: vMethod,
      fullName: fullName.trim(),
      password: hashedPassword,
      sponsorCode: sponsorMember.mlmCode,
      pincode, state, district, city, block, address,
      termsAccepted: !!termsAccepted,
    });

    // Send OTP based on selected verificationMethod
    if (vMethod === 'EMAIL') {
      try {
        await sendEmail({
          to: email.trim(),
          subject: "Your NextView Registration OTP",
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">
            <h2 style="color:#2563EB">Welcome to NextView!</h2>
            <p>Please verify your email to complete registration. Your OTP is:</p>
            <div style="background:#f4f4f4;padding:20px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:5px;border-radius:5px;margin:20px 0">${otp}</div>
            <p style="color:#888;font-size:12px">This OTP expires in 10 minutes. Do not share it with anyone.</p>
          </div>`,
        });
        console.log(`[MLM Register] Email OTP sent to ${email}: ${otp}`);
      } catch (err) {
        console.error('[MLM Register] Failed to send email OTP:', err);
      }

      return NextResponse.json({
        success: true,
        message: "OTP sent to your email address. Please verify to complete NextView registration.",
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        verificationMethod: 'EMAIL'
      });
    } else {
      // MOBILE SMS verification using PearlSMS (SakhiHub DLT template)
      try {
        const smsMessage = `Your OTP is ${otp}. Use this to verify your mobile number on SPPLFW. Valid for 5 minutes.`;
        await sendSMS(mobile.trim(), smsMessage);
        console.log(`[MLM Register] Mobile SMS OTP sent to ${mobile}: ${otp}`);
      } catch (err) {
        console.error('[MLM Register] Failed to send mobile SMS OTP:', err);
      }

      return NextResponse.json({
        success: true,
        message: "OTP sent to your mobile number. Please verify to complete NextView registration.",
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        verificationMethod: 'MOBILE'
      });
    }
  } catch (error) {
    console.error("[MLM Register]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
