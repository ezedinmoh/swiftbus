import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtp } from '@/lib/otpStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    // Generate a reset OTP
    const code = generateOtp(normalizedEmail, 'reset');

    // In a real application, send this via email/SMS gateway.
    // For demo purposes the code is returned in the response so the UI can display it.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[FORGOT PASSWORD] Reset code for ${normalizedEmail}: ${code}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Reset code generated successfully.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
