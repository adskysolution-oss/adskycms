import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import MlmMember from "@/models/mlm/MlmMember.js";
import User from "@/models/User.js";
import MlmPasswordReset from "@/models/mlm/MlmPasswordReset.js";
import { generateOTP } from "@/lib/otp.js";
import { sendEmail } from "@/services/emailService.js";
import { sendSMS } from "@/lib/sms.js";

export const dynamic = "force-dynamic";

function maskMobile(mobile) {
  if (!mobile) return "";
  const cleaned = mobile.replace(/\D/g, "");
  if (cleaned.length <= 4) return "******";
  return `+91 ******${cleaned.slice(-4)}`;
}

function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [user, domain] = email.split("@");
  const maskedUser =
    user.length > 2
      ? `${user[0]}***${user[user.length - 1]}`
      : `${user[0]}***`;
  return `${maskedUser}@${domain}`;
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { identifier, method = "MOBILE" } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: "Mobile number, Email, or Member Code is required." },
        { status: 400 }
      );
    }

    const cleanId = identifier.trim();
    const requestedMethod = (method || "MOBILE").toUpperCase() === "EMAIL" ? "EMAIL" : "MOBILE";

    // 1. Search in MlmMember by mobile, email, or mlmCode
    let member = await MlmMember.findOne({
      $or: [
        { mobile: cleanId },
        { email: cleanId.toLowerCase() },
        { mlmCode: cleanId.toUpperCase() },
      ],
    });

    // 2. If not found, check User collection and find linked member
    if (!member) {
      const user = await User.findOne({
        $or: [
          { mobile: cleanId },
          { email: cleanId.toLowerCase() },
          { phone: cleanId },
        ],
      });
      if (user) {
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
      return NextResponse.json(
        { success: false, message: "No NextView account found matching the provided details." },
        { status: 404 }
      );
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

    // Validate delivery method availability
    let effectiveMethod = requestedMethod;
    if (effectiveMethod === "EMAIL" && !member.email) {
      if (member.mobile) {
        return NextResponse.json(
          {
            success: false,
            message: "No registered email address found for this account. Please select Mobile SMS OTP.",
            fallbackMethod: "MOBILE",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: "No registered email or mobile found. Please contact support." },
        { status: 400 }
      );
    }

    if (effectiveMethod === "MOBILE" && !member.mobile) {
      if (member.email) {
        return NextResponse.json(
          {
            success: false,
            message: "No registered mobile number found for this account. Please select Email OTP.",
            fallbackMethod: "EMAIL",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, message: "No registered mobile found. Please contact support." },
        { status: 400 }
      );
    }

    // Clear previous password reset OTPs for this member
    await MlmPasswordReset.deleteMany({ memberId: member._id });

    // Generate 6-digit OTP
    const otp = generateOTP ? generateOTP(6) : Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create record
    await MlmPasswordReset.create({
      memberId: member._id,
      identifier: cleanId,
      mobile: member.mobile,
      email: member.email,
      method: effectiveMethod,
      otp,
      otpExpires,
      otpAttempts: 0,
    });

    let maskedDestination = "";

    // Send OTP
    if (effectiveMethod === "EMAIL") {
      maskedDestination = maskEmail(member.email);
      try {
        await sendEmail({
          to: member.email.trim(),
          subject: "NextView — Password Reset Verification Code",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #2563EB; font-size: 24px; margin: 0;">NextView</h1>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">NexVia Network Portal</p>
              </div>
              <p style="font-size: 15px;">Hello <strong>${member.fullName}</strong>,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                We received a request to reset the password for your NextView account (Member Code: <strong>${member.mlmCode}</strong>).
              </p>
              <p style="font-size: 14px; color: #475569;">
                Use the following 6-digit One-Time Password (OTP) to complete your password reset:
              </p>
              <div style="background: #f1f5f9; border: 1px dashed #cbd5e1; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e293b; border-radius: 8px; margin: 24px 0;">
                ${otp}
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                AdSky Solutions & NextView Network &bull; Automated Security Notification
              </p>
            </div>
          `,
        });
        console.log(`[NextView Forgot Password] Email OTP sent to ${member.email}: ${otp}`);
      } catch (emailErr) {
        console.error("[NextView Forgot Password] Email error:", emailErr);
      }
    } else {
      maskedDestination = maskMobile(member.mobile);
      try {
        const smsMessage = `Your OTP is ${otp}. Use this to verify your mobile number on SPPLFW. Valid for 5 minutes.`;
        await sendSMS(member.mobile.trim(), smsMessage);
        console.log(`[NextView Forgot Password] Mobile SMS OTP sent to ${member.mobile}: ${otp}`);
      } catch (smsErr) {
        console.error("[NextView Forgot Password] SMS error:", smsErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to your registered ${effectiveMethod === "EMAIL" ? "email" : "mobile number"}.`,
      memberId: member._id.toString(),
      method: effectiveMethod,
      destination: maskedDestination,
      hasMobile: !!member.mobile,
      hasEmail: !!member.email,
      fullName: member.fullName,
      mlmCode: member.mlmCode,
    });
  } catch (error) {
    console.error("[NextView Forgot Password Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
