import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

// GET /api/user/profile — fetch current user profile
export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb_token')?.value;
    const session = token ? verifyToken(token) : null;
    if (!session) return err('Unauthorized', 401);

    const user = await prisma.user.findFirst({
      where: { user_id: session.userId, is_active: true },
      select: {
        user_id: true, email: true, full_name: true,
        first_name: true, last_name: true, phone: true,
        role: true, joined_date: true, is_verified: true, profile_image: true,
      },
    });

    if (!user) return err('User not found', 404);

    return NextResponse.json({ success: true, data: user });
  } catch (e) {
    console.error('Profile GET error:', e);
    return err('Failed to load profile', 500);
  }
}

// POST /api/user/profile — update profile info or change password
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sb_token')?.value;
    const session = token ? verifyToken(token) : null;
    if (!session) return err('Unauthorized', 401);

    const body = await req.json();
    const { action } = body as { action: string };

    if (action === 'update_profile') {
      const { firstName, lastName, phone } = body as { firstName: string; lastName: string; phone?: string };

      if (!firstName?.trim()) return err('First name is required');
      if (!lastName?.trim()) return err('Last name is required');

      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      await prisma.user.update({
        where: { user_id: session.userId },
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          phone: phone?.trim() || null,
        },
      });

      return NextResponse.json({ success: true, message: 'Profile updated successfully', data: { fullName } });
    }

    if (action === 'change_password') {
      const { currentPassword, newPassword } = body as { currentPassword: string; newPassword: string };

      if (!currentPassword) return err('Current password is required');
      if (!newPassword) return err('New password is required');
      if (newPassword.length < 8) return err('New password must be at least 8 characters');
      if (!/[a-zA-Z]/.test(newPassword)) return err('New password must contain a letter');
      if (!/\d/.test(newPassword)) return err('New password must contain a number');

      const user = await prisma.user.findFirst({ where: { user_id: session.userId } });
      if (!user) return err('User not found', 404);

      const valid = await verifyPassword(currentPassword, user.password_hash);
      if (!valid) return err('Current password is incorrect', 401);

      const newHash = await hashPassword(newPassword);
      await prisma.user.update({ where: { user_id: session.userId }, data: { password_hash: newHash } });

      return NextResponse.json({ success: true, message: 'Password changed successfully' });
    }

    return err('Invalid action');
  } catch (e) {
    console.error('Profile POST error:', e);
    return err('Operation failed. Please try again.', 500);
  }
}
