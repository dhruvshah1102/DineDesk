import { prisma } from '@/lib/prisma';
import { notEmpty } from '@/lib/utils';
import { notFound } from 'next/navigation';
import PaymentClient from './PaymentClient';

export default async function PaymentPage({ params, searchParams }: { params: { orderId: string }, searchParams: { slug?: string } }) {
  const { headers } = await import('next/headers');
  const slugHeader = headers().get('x-cafe-slug');
  const slug = slugHeader || searchParams.slug;

  if (!slug) return notFound();

  const tenant = await prisma.tenant.findUnique({
    where: { slug: slug },
    select: { name: true, slug: true, email: true, phone: true }
  });

  if (!tenant) return notFound();

  const order = await prisma.order.findUnique({
    where: { id: params.orderId, tenantId: tenant.id },
    include: { orderItems: true }
  });

  if (!order) return notFound();

  // Redirect if already paid logically or handled.
  // We won't redirect here natively so they can review their paid receipt later perhaps.

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden text-center">
         <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--customer-brand)]"></div>
         <h1 className="text-xl font-bold text-gray-900">Checkout ({tenant.name})</h1>
         <p className="text-sm text-gray-500 mt-1">Table {order.tableNumber} • Amount: ₹{Number(order.totalAmount).toFixed(2)}</p>
      </div>

      <PaymentClient 
        orderId={order.id} 
        amount={Number(order.totalAmount)} 
        isPaid={order.paymentStatus === 'paid'}
        cafeName={tenant.name}
        cafeEmail={tenant.email}
        customerName={order.customerName || 'Customer'}
      />
    </div>
  );
}
