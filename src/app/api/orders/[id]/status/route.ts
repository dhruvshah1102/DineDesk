import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('menuflow_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = payload.tenantId as string;
    const { status } = await req.json();

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    
    if (!order || order.tenantId !== tenantId) {
       return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json({ success: true, status: updatedOrder.status });
  } catch (err) {
    console.error('Update order status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
