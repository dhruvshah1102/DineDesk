import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import KanbanBoard from '@/components/dashboard/KanbanBoard';

export default async function OrdersPage() {
  const token = cookies().get('menuflow_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.tenantId) redirect('/login');

  const tenantId = payload.tenantId as string;

  // Fetch initial orders for today that are not deeply archived
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { 
      tenantId, 
      status: { in: ['new', 'preparing', 'ready'] },
      paymentStatus: 'paid',
      placedAt: { gte: today }
    },
    include: {
      orderItems: true
    },
    orderBy: { placedAt: 'asc' }
  });

  // Convert dates to string for serialization across Server to Client boundary
  const serializedOrders = orders.map(o => ({
    ...o,
    placedAt: o.placedAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    subtotal: Number(o.subtotal),
    taxAmount: Number(o.taxAmount),
    totalAmount: Number(o.totalAmount),
    orderItems: o.orderItems.map(item => ({
      ...item,
      price: Number(item.price),
      lineTotal: Number(item.lineTotal)
    }))
  }));

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Live Orders</h1>
        <p className="text-gray-500 mt-1">Manage current operations across all tables in real-time.</p>
      </div>
      
      <div className="flex-1 overflow-hidden">
         <KanbanBoard initialOrders={serializedOrders} tenantId={tenantId} />
      </div>
    </div>
  );
}
