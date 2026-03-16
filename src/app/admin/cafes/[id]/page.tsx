import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { CafeActions } from '../CafeActions';

export default async function CafeDetailPage({ params }: { params: { id: string } }) {
  const cafe = await prisma.tenant.findUnique({
    where: { id: params.id },
    include: {
      categories: { include: { _count: { select: { menuItems: true } } } },
      orders: {
        take: 20,
        orderBy: { placedAt: 'desc' },
      },
      _count: {
        select: { orders: true }
      }
    }
  });

  if (!cafe) return notFound();

  // Calculate revenue explicitly ensuring types
  const allTimeRevenueAggr = await prisma.order.aggregate({
    where: { tenantId: cafe.id, paymentStatus: 'paid' },
    _sum: { totalAmount: true }
  });
  
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  
  const monthlyRevenueAggr = await prisma.order.aggregate({
    where: { 
      tenantId: cafe.id, 
      paymentStatus: 'paid',
      placedAt: { gte: last30Days }
    },
    _sum: { totalAmount: true }
  });

  const allTimeRevenue = allTimeRevenueAggr._sum.totalAmount ? Number(allTimeRevenueAggr._sum.totalAmount) : 0;
  const monthlyRevenue = monthlyRevenueAggr._sum.totalAmount ? Number(monthlyRevenueAggr._sum.totalAmount) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{cafe.name}</h1>
          <p className="text-gray-500 mt-1">{cafe.slug}.menuflow.com</p>
          <div className="mt-2 text-sm text-gray-600 flex space-x-4">
             <span>Email: {cafe.email}</span>
             <span>Phone: {cafe.phone || 'N/A'}</span>
             <span className="capitalize">Plan: {cafe.plan}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-md shadow-sm border border-gray-100">
           <span className="text-sm text-gray-600 font-medium mr-2">Status:</span>
           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cafe.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
             {cafe.isActive ? 'Active' : 'Suspended'}
           </span>
           <div className="h-4 w-px bg-gray-300 mx-2"></div>
           <CafeActions cafeId={cafe.id} initialStatus={cafe.isActive} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">All Time Revenue</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-brand">₹{allTimeRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">Last 30 Days Revenue</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-gray-900">₹{monthlyRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-gray-900">{cafe._count.orders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle>Menu Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {cafe.categories.length === 0 ? (
               <p className="text-sm text-gray-500">No categories found.</p>
            ) : (
               <ul className="divide-y divide-gray-100">
                 {cafe.categories.map(cat => (
                   <li key={cat.id} className="py-3 flex justify-between items-center">
                     <span className="font-medium text-gray-800">{cat.name}</span>
                     <span className="text-sm text-gray-500">{cat._count.menuItems} items</span>
                   </li>
                 ))}
               </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Recent Orders ({cafe.orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {cafe.orders.length === 0 ? (
               <p className="text-sm text-gray-500">No orders yet.</p>
            ) : (
               <ul className="divide-y divide-gray-100">
                 {cafe.orders.map(order => (
                   <li key={order.id} className="py-2 flex justify-between items-center text-sm">
                     <div className="flex flex-col">
                       <span className="font-medium text-gray-800">Table {order.tableNumber}</span>
                       <span className="text-xs text-gray-500">{order.placedAt.toLocaleString()}</span>
                     </div>
                     <div className="flex flex-col items-end">
                       <span className="font-medium">₹{Number(order.totalAmount).toFixed(2)}</span>
                       <span className={`text-xs capitalize ${order.status === 'ready' || order.status === 'served' ? 'text-green-600' : 'text-amber-600'}`}>
                         {order.status}
                       </span>
                     </div>
                   </li>
                 ))}
               </ul>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
