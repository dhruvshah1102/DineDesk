import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getTenantId() {
  const token = cookies().get('menuflow_token')?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.role === 'owner' ? payload.tenantId as string : null;
}

export async function GET() {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const categories = await prisma.category.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, sortOrder } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const category = await prisma.category.create({
      data: {
        tenantId,
        name,
        sortOrder: sortOrder || 0,
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
