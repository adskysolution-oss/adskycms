import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MlmPendingRegistration from "@/models/mlm/MlmPendingRegistration.js";
import { generateOTP } from "@/lib/otp.js";
import { sendEmail } from "@/services/emailService.js";
import { sendSMS } from "@/lib/sms.js";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { mobile, email } = body;

    if (!mobile && !email) {
      return NextResponse.json({ success: false, message: "Mobile number or Email is required" }, { status: 400 });
    }

    const pending = await MlmPendingRegistration.findOne({
      $or: [
        ...(mobile ? [{ mobile: mobile.trim() }] : []),
        ...(email ? [{ email: email.trim().toLowerCase() }] : []),
      ]
    });

    if (!pending) {
      return NextResponse.json({ success: false, message: "No pending registration found." }, { status: 400 });
    }

    // Rate limit: 60 seconds between resends
    const now = new Date();
    const timeSinceCreated = now - new Date(pending.updatedAt || pending.createdAt);
    if (timeSinceCreated < 60000) {
      return NextResponse.json({ success: false, message: "Please wait 60 seconds before requesting a new OTP." }, { status: 429 });
    }

    const otp = generateOTP(6);
    pending.otp = otp;
    pending.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    pending.otpAttempts = 0;
    await pending.save();

    const vMethod = pending.verificationMethod || 'MOBILE';

    if (vMethod === 'EMAIL') {
      try {
        await sendEmail({
          to: pending.email,
          subject: "NextView — Resend OTP",
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">
            <h2 style="color:#2563EB">NextView OTP Resend</h2>
            <p>Your new OTP is:</p>
            <div style="background:#f4f4f4;padding:20px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:5px;border-radius:5px;margin:20px 0">${otp}</div>
            <p style="color:#888;font-size:12px">This OTP expires in 10 minutes. Do not share it with anyone.</p>
          </div>`,
        });
        console.log(`[MLM Resend OTP] Email OTP sent to ${pending.email}: ${otp}`);
      } catch (err) {
        console.error('[MLM Resend OTP] Email send error:', err);
      }

      return NextResponse.json({ success: true, message: "OTP resent to your registered email address." });
    } else {
      try {
        const smsMessage = `Your OTP is ${otp}. Use this to verify your mobile number on SPPLFW. Valid for 5 minutes.`;
        await sendSMS(pending.mobile, smsMessage);
        console.log(`[MLM Resend OTP] Mobile SMS OTP sent to ${pending.mobile}: ${otp}`);
      } catch (err) {
        console.error('[MLM Resend OTP] SMS send error:', err);
      }

      return NextResponse.json({ success: true, message: "OTP resent to your mobile number." });
    }
  } catch (error) {
    console.error("[MLM Resend OTP]", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
