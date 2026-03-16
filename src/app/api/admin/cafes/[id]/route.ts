import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('menuflow_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.role?.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isActive, plan } = await req.json();
    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (plan !== undefined) updateData.plan = plan;

    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    console.error('Admin cafe update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
