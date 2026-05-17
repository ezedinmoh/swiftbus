import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid or expired session' }, { status: 401 });
    }

    // Fetch fresh user data from DB
    const user = await prisma.user.findFirst({
      where: { user_id: payload.userId, is_active: true },
      select: {
        user_id: true,
        email: true,
        full_name: true,
        first_name: true,
        last_name: true,
        role: true,
        phone: true,
        joined_date: true,
        is_verified: true,
        profile_image: true,
        last_login: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
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
        lastLogin: user.last_login,
      },
    });
  } catch (e) {
    console.error('Auth me error:', e);
    return NextResponse.json({ success: false, message: 'Session check failed' }, { status: 500 });
  }
}
