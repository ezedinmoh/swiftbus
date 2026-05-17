import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email: string; password: string };

    if (!email?.trim()) return err('Email is required');
    if (!password) return err('Password is required');

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), is_active: true },
    });

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return err('Invalid email or password', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const token = signToken({
      userId: user.user_id,
      dbId: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.user_id,
        email: user.email,
        name: user.full_name,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phone: user.phone ?? 'Not provided',
        joinedDate: user.joined_date,
        isVerified: user.is_verified,
        profileImage: user.profile_image,
      },
    });

    res.cookies.set('sb_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return res;
  } catch (e) {
    console.error('Login error:', e);
    return err('Login failed. Please try again.', 500);
  }
}
