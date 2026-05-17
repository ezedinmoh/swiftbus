import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? 'swiftbus-dev-secret';

interface ResetTokenPayload {
  email: string;
  purpose: string;
}

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Token, email, and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify token
    let decoded: ResetTokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Reset session expired or invalid. Please request a new code.' },
        { status: 401 }
      );
    }

    if (decoded.purpose !== 'reset-password' || decoded.email !== normalizedEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized reset request.' },
        { status: 403 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Hash and update password in DB
    const newHash = await hashPassword(password);
    
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password_hash: newHash,
        is_verified: true, // Mark verified as they verified their email via OTP
      },
    });

    console.log(`[PASSWORD RESET] Successfully updated password for ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
