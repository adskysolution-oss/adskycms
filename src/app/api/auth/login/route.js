import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { createToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // 1. Validate Input
    const validatedData = loginSchema.parse(body);

    // 2. Find User
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Check Password
    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 4. Check Status
    if (user.status === 'suspended' || user.status === 'banned') {
      return NextResponse.json({ error: `Your account is ${user.status}. Please contact support.` }, { status: 403 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ 
        error: 'Email not verified', 
        isVerified: false, 
        userId: user._id 
      }, { status: 403 });
    }

    // 5. Generate Token
    const token = await createToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // 6. Set Cookie
    await setAuthCookie(token);

    // 7. Update Last Login
    user.lastLogin = new Date();
    await user.save();

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
