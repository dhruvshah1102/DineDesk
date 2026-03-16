import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { email },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!tenant.isActive) {
      return NextResponse.json({ error: 'Account suspended. Contact admin.' }, { status: 403 });
    }

    const isValid = await verifyPassword(password, tenant.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signToken({
      tenantId: tenant.id,
      email: tenant.email,
      role: 'owner',
    });

    const res = NextResponse.json({ success: true });
    
    res.cookies.set('menuflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error) {
    console.error('Owner login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
