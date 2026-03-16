import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminCharts } from '@/components/admin/AdminCharts';

export default async function PlatformAnalyticsPage() {
  const stats = await prisma.order.aggregate({
    where: { paymentStatus: 'paid' },
    _sum: { totalAmount: true },
    _count: { id: true },
  });

  const totalGMV = stats._sum.totalAmount ? Number(stats._sum.totalAmount) : 0;
  const totalOrders = stats._count.id;

  // Placeholder static analytics for demo mapping requirement mapping without complex native raw SQL grouping.
  const chartData = [
    { name: 'Mon', signups: 1000 },
    { name: 'Tue', signups: 1540 },
    { name: 'Wed', signups: 2000 },
    { name: 'Thu', signups: 1200 },
    { name: 'Fri', signups: 2600 },
    { name: 'Sat', signups: 4000 },
    { name: 'Sun', signups: 3200 },
  ];

  // Top cafes by revenue
  const tenants = await prisma.tenant.findMany({
    include: {
      orders: {
        where: { paymentStatus: 'paid' },
        select: { totalAmount: true }
      }
    }
  });

  const tenantRevenues = tenants.map(t => {
    const revenue = t.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    return { id: t.id, name: t.name, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Platform Analytics</h1>
        <p className="text-gray-500 mt-2">Comprehensive performance tracking and revenue statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">Total Lifetime GMV</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-brand">₹{totalGMV.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">Total Lifetime Orders</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-gray-900">{totalOrders.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform GMV by Day (Demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminCharts data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Cafes by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
             <ul className="space-y-4">
                {tenantRevenues.map((t, i) => (
                  <li key={t.id} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-800">
                      {i + 1}. {t.name}
                    </span>
                    <span className="font-bold text-gray-600">₹{t.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </li>
                ))}
                {tenantRevenues.length === 0 && (
                   <div className="text-gray-500 text-sm py-2 text-center">No revenue generated yet.</div>
                )}
             </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
