import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtp } from '@/lib/otpStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json() as { email: string; type?: 'register' | 'reset' };

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const resolvedType = type === 'reset' ? 'reset' : 'register';

    // Verify user exists if resetting password
    if (resolvedType === 'reset') {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No account found with this email address' },
          { status: 404 }
        );
      }
    }

    // Generate new OTP
    const code = generateOtp(normalizedEmail, resolvedType);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP RESEND] Re-sent code to ${normalizedEmail} (Type: ${resolvedType})`);
    }

    return NextResponse.json({
      success: true,
      message: 'A new verification code has been generated.',
    });
  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
