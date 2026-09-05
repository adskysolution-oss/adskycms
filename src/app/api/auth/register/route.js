import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import OTPVerification from '@/models/OTPVerification';
import { sendOTPEmail } from '@/services/emailService';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // 1. Validate Input
    const validatedData = registerSchema.parse(body);

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // 3. Create User (Initially Pending)
    const user = await User.create({
      ...validatedData,
      status: 'pending',
      isVerified: false,
    });

    // 4. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTPVerification.create({
      userId: user._id,
      otp,
      type: 'registration',
      expiresAt,
    });

    // 5. Send OTP Email
    const emailRes = await sendOTPEmail(user.email, otp, 'registration');
    if (!emailRes.success) {
      console.error('Failed to send OTP email:', emailRes.error);
    }

    return NextResponse.json({ 
      message: 'Registration successful. Please verify your email.',
      userId: user._id 
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
