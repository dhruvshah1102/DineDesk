import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import { Activity } from 'lucide-react';

export default async function OrdersPage() {
  const token = cookies().get('menuflow_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.tenantId) redirect('/login');

  const tenantId = payload.tenantId as string;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { 
      tenantId, 
      status: { in: ['new', 'preparing', 'ready'] },
      placedAt: { gte: today }
    },
    include: {
      orderItems: true
    },
    orderBy: { placedAt: 'asc' }
  });

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
    <div className="h-full flex flex-col space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center space-x-2 text-brand font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <Activity size={14} />
              <span>Real-time Operations</span>
           </div>
           <h1 className="text-4xl font-black tracking-tight text-slate-900">Live Orders</h1>
           <p className="text-slate-500 mt-2 font-medium">Manage current orders and kitchen operations in real-time.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-4 py-2 bg-emerald-50 rounded-xl flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Sync</span>
           </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
         <KanbanBoard initialOrders={serializedOrders} tenantId={tenantId} />
      </div>
    </div>
  );
}
