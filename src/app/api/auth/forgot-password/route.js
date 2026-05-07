import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OTPVerification from '@/models/OTPVerification';
import { sendOTPEmail } from '@/services/emailService';

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: 'If an account exists, a reset code has been sent.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTPVerification.create({
      userId: user._id,
      otp,
      type: 'password_reset',
      expiresAt,
    });

    // Send Email
    await sendOTPEmail(user.email, otp, 'password_reset');

    return NextResponse.json({ 
      message: 'Password reset code sent to your email.',
      userId: user._id 
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
