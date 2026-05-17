import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { verifyOtp } from '@/lib/otpStore';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? 'swiftbus-dev-secret';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP code
    const isValid = verifyOtp(normalizedEmail, code.trim(), 'reset');
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Generate a temporary reset token (expires in 15 mins)
    const token = jwt.sign(
      { email: normalizedEmail, purpose: 'reset-password' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return NextResponse.json({
      success: true,
      token,
      message: 'Code verified successfully.',
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
