import { prisma } from '@/lib/prisma';
import AdminUsersClient from './AdminUsersClient';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? '1'));
  const q = sp.q ?? '';
  const role = sp.role ?? '';
  const limit = 15;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (q) {
    where.OR = [
      { full_name: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        user_id: true, full_name: true, email: true, phone: true,
        role: true, is_active: true, is_verified: true,
        joined_date: true, last_login: true,
        _count: { select: { bookings: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const formatted = users.map(u => ({
    id: u.user_id,
    name: u.full_name,
    email: u.email,
    phone: u.phone ?? '—',
    role: u.role,
    isActive: u.is_active,
    isVerified: u.is_verified,
    joinedDate: u.joined_date.toISOString(),
    lastLogin: u.last_login?.toISOString() ?? null,
    bookingCount: u._count.bookings,
  }));

  return (
    <AdminUsersClient
      users={formatted}
      total={total}
      page={page}
      pages={Math.ceil(total / limit)}
      currentQ={q}
      currentRole={role}
    />
  );
}
