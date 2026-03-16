import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Coffee, IndianRupee, Clock } from 'lucide-react';
import { AdminCharts } from '@/components/admin/AdminCharts'; // Reusing for sparkline

export default async function CafeOwnerDashboard() {
  const token = cookies().get('menuflow_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.tenantId) redirect('/login');

  const tenantId = payload.tenantId as string;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayOrdersCount, todayRevenueAggr, pendingOrdersCount, activeTablesCount, recentOrders] = await Promise.all([
    prisma.order.count({
      where: { tenantId, placedAt: { gte: today } }
    }),
    prisma.order.aggregate({
      where: { tenantId, paymentStatus: 'paid', placedAt: { gte: today } },
      _sum: { totalAmount: true }
    }),
    prisma.order.count({
      where: { tenantId, status: { in: ['new', 'preparing'] } }
    }),
    prisma.order.groupBy({
      by: ['tableId'],
      where: { tenantId, status: { in: ['new', 'preparing', 'ready'] } },
    }),
    prisma.order.findMany({
      where: { tenantId },
      orderBy: { placedAt: 'desc' },
      take: 10,
    })
  ]);

  const todayRevenue = todayRevenueAggr._sum.totalAmount ? Number(todayRevenueAggr._sum.totalAmount) : 0;
  const activeTables = activeTablesCount.length;

  const chartData = [
    { name: 'Mon', signups: 15 },
    { name: 'Tue', signups: 20 },
    { name: 'Wed', signups: 18 },
    { name: 'Thu', signups: 35 },
    { name: 'Fri', signups: 50 },
    { name: 'Sat', signups: 80 },
    { name: 'Sun', signups: 65 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Today's Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">Here's what's happening at your cafe today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{todayOrdersCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingOrdersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Tables</CardTitle>
            <Coffee className="h-4 w-4 text-brand-dark" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeTables}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days Demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminCharts data={chartData} />
          </CardContent>
        </Card>

        <Card className="col-span-3 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
             <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                     <div>
                       <div className="flex items-center space-x-2">
                         <span className="font-semibold text-gray-900">Table {order.tableNumber}</span>
                         <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full text-white ${
                            order.status === 'new' ? 'bg-orange-500' : 
                            order.status === 'preparing' ? 'bg-amber-500' :
                            order.status === 'ready' ? 'bg-green-500' : 'bg-slate-400'
                         }`}>
                           {order.status}
                         </span>
                       </div>
                       <p className="text-xs text-gray-500 mt-1">{order.placedAt.toLocaleTimeString()}</p>
                     </div>
                     <div className="text-right">
                       <p className="font-medium text-gray-900">₹{Number(order.totalAmount).toFixed(2)}</p>
                       <p className={`text-xs ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                         {order.paymentStatus}
                       </p>
                     </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No orders yet today.
                  </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
