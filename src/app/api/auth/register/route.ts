import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, generateUserId, ADMIN_EMAILS } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password } = body as Record<string, string>;

    // Validate required fields
    if (!firstName?.trim()) return err('First name is required');
    if (!lastName?.trim()) return err('Last name is required');
    if (!email?.trim()) return err('Email is required');
    if (!password) return err('Password is required');

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Invalid email address');

    // Validate password strength
    if (password.length < 8) return err('Password must be at least 8 characters');
    if (!/[a-z]/.test(password)) return err('Password must contain a lowercase letter');
    if (!/[A-Z]/.test(password)) return err('Password must contain an uppercase letter');
    if (!/\d/.test(password)) return err('Password must contain a number');
    if (!/[@$!%*?&]/.test(password)) return err('Password must contain a special character (@$!%*?&)');

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return err('Email address already registered', 409);

    const role = ADMIN_EMAILS.has(email.toLowerCase()) ? 'admin' : 'user';
    const passwordHash = await hashPassword(password);
    const userId = generateUserId();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const user = await prisma.user.create({
      data: {
        user_id: userId,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: fullName,
        phone: phone?.trim() || null,
        role,
        joined_date: new Date(),
      },
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
      message: 'Account created successfully',
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
      },
    });

    res.cookies.set('sb_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch (e) {
    console.error('Register error:', e);
    return err('Registration failed. Please try again.', 500);
  }
}
