import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OTPVerification from '@/models/OTPVerification';

export async function POST(req) {
  try {
    await dbConnect();
    const { userId, otp, newPassword } = await req.json();

    if (!userId || !otp || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify OTP
    const otpRecord = await OTPVerification.findOne({
      userId,
      otp,
      type: 'password_reset',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // 2. Update Password
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.password = newPassword; // Mongoose pre-save hook will hash it
    await user.save();

    // 3. Delete the used OTP
    await OTPVerification.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({ message: 'Password reset successful. You can now login.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
