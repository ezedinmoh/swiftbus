import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb_token')?.value;
  const session = token ? verifyToken(token) : null;
  if (!session || session.role !== 'admin') return null;
  return session;
}

// PATCH /api/admin/users — toggle user active status
export async function PATCH(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { userId, isActive } = await req.json() as { userId: string; isActive: boolean };

    await prisma.user.update({
      where: { user_id: userId },
      data: { is_active: isActive },
    });

    return NextResponse.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
  }
}
