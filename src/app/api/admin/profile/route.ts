import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb_token')?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || session.role !== 'admin') return null;
  return session;
}

// GET /api/admin/profile
export async function GET() {
  const session = await getAdmin();
  if (!session) return err('Unauthorized', 401);

  try {
    const user = await prisma.user.findFirst({
      where: { user_id: session.userId, is_active: true },
      select: {
        user_id: true, email: true, full_name: true,
        first_name: true, last_name: true, phone: true,
        role: true, joined_date: true, is_verified: true, profile_image: true,
        _count: { select: { activity_logs: true } },
      },
    });
    if (!user) return err('User not found', 404);
    return NextResponse.json({ success: true, data: user });
  } catch (e) {
    console.error('Admin profile GET error:', e);
    return err('Failed to load profile', 500);
  }
}

// POST /api/admin/profile — update_profile | change_password
export async function POST(req: NextRequest) {
  const session = await getAdmin();
  if (!session) return err('Unauthorized', 401);

  try {
    const body = await req.json() as { action: string; [k: string]: unknown };

    if (body.action === 'update_profile') {
      const { firstName, lastName, phone } = body as unknown as { firstName: string; lastName: string; phone?: string };
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

    if (body.action === 'change_password') {
      const { currentPassword, newPassword } = body as unknown as { currentPassword: string; newPassword: string };
      if (!currentPassword) return err('Current password is required');
      if (!newPassword || newPassword.length < 8) return err('New password must be at least 8 characters');
      if (!/[a-zA-Z]/.test(newPassword)) return err('Password must contain a letter');
      if (!/\d/.test(newPassword)) return err('Password must contain a number');

      const user = await prisma.user.findFirst({ where: { user_id: session.userId } });
      if (!user) return err('User not found', 404);

      const valid = await verifyPassword(currentPassword, user.password_hash);
      if (!valid) return err('Current password is incorrect', 401);

      await prisma.user.update({
        where: { user_id: session.userId },
        data: { password_hash: await hashPassword(newPassword) },
      });
      return NextResponse.json({ success: true, message: 'Password changed successfully' });
    }

    return err('Invalid action');
  } catch (e) {
    console.error('Admin profile POST error:', e);
    return err('Operation failed. Please try again.', 500);
  }
}

// PUT /api/admin/profile — avatar upload (multipart/form-data)
export async function PUT(req: NextRequest) {
  const session = await getAdmin();
  if (!session) return err('Unauthorized', 401);

  try {
    const formData = await req.formData();
    const file = formData.get('avatar') as File | null;
    if (!file) return err('No file provided');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) return err('Only JPEG, PNG, WebP, or GIF images are allowed');
    if (file.size > 5 * 1024 * 1024) return err('Image must be under 5 MB');

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = `admin_${session.userId}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const imageUrl = `/uploads/avatars/${filename}`;
    await prisma.user.update({
      where: { user_id: session.userId },
      data: { profile_image: imageUrl },
    });

    return NextResponse.json({ success: true, message: 'Avatar updated', data: { imageUrl } });
  } catch (e) {
    console.error('Admin avatar upload error:', e);
    return err('Avatar upload failed. Please try again.', 500);
  }
}
