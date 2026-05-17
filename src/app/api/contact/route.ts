import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

// POST /api/contact — store a contact message as a system notification / log
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    const { name, email, subject, message } = body;

    if (!name?.trim())    return err('Name is required');
    if (!email?.trim())   return err('Email is required');
    if (!subject?.trim()) return err('Subject is required');
    if (!message?.trim()) return err('Message is required');

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err('Invalid email address');

    // Store as an activity log entry so admins can see it
    await prisma.activityLog.create({
      data: {
        action: 'contact_form',
        entity_type: 'contact',
        description: `Contact from ${name.trim()} <${email.trim()}>: ${subject.trim()}`,
        metadata: {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        },
      },
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully. We will get back to you soon.' });
  } catch (e) {
    console.error('Contact form error:', e);
    return err('Failed to send message. Please try again.', 500);
  }
}
