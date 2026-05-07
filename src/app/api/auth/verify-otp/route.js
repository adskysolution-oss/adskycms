import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OTPVerification from '@/models/OTPVerification';

export async function POST(req) {
  try {
    await dbConnect();
    const { userId, otp, type } = await req.json();

    if (!userId || !otp || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find the latest valid OTP for this user and type
    const otpRecord = await OTPVerification.findOne({
      userId,
      otp,
      type,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // 2. Update user status
    if (type === 'registration') {
      await User.findByIdAndUpdate(userId, {
        isVerified: true,
        status: 'active',
      });
    }

    // 3. Delete the used OTP
    await OTPVerification.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({ 
      message: type === 'registration' ? 'Email verified successfully!' : 'OTP verified successfully!',
      success: true 
    });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
