import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import OrderTrackingClient from './OrderTrackingClient';

export default async function OrderStatusPage({ params, searchParams }: { params: { orderId: string }, searchParams: { slug?: string } }) {
  const { headers } = await import('next/headers');
  const slugHeader = headers().get('x-cafe-slug');
  const slug = slugHeader || searchParams.slug;

  if (!slug) return notFound();

  const tenant = await prisma.tenant.findUnique({
    where: { slug: slug },
    select: { name: true, id: true }
  });

  if (!tenant) return notFound();

  const order = await prisma.order.findUnique({
    where: { id: params.orderId, tenantId: tenant.id },
    include: { orderItems: true }
  });

  if (!order) return notFound();

  // Convert Date to string
  const serializedOrder = {
     ...order,
     placedAt: order.placedAt.toISOString(),
     updatedAt: order.updatedAt.toISOString(),
     subtotal: Number(order.subtotal),
     taxAmount: Number(order.taxAmount),
     totalAmount: Number(order.totalAmount),
     orderItems: order.orderItems.map(item => ({
       ...item,
       price: Number(item.price),
       lineTotal: Number(item.lineTotal)
     }))
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--customer-brand)]"></div>
         <h1 className="text-xl font-bold text-gray-900 ml-2">Order Status</h1>
         <p className="text-sm text-gray-500 ml-2 mt-1">Table {order.tableNumber} • ID: #{order.id.substring(0,8)}</p>
      </div>

      <OrderTrackingClient initialOrder={serializedOrder} tenantId={tenant.id} />
    </div>
  );
}
