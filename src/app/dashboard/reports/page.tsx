import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminCharts } from '@/components/admin/AdminCharts';

export default async function ReportsPage() {
  const token = cookies().get('menuflow_token')?.value;
  if (!token) redirect('/login');
  
  const payload = await verifyToken(token);
  if (!payload || !payload.tenantId) redirect('/login');

  const tenantId = payload.tenantId as string;

  const stats = await prisma.order.aggregate({
    where: { tenantId, paymentStatus: 'paid' },
    _sum: { totalAmount: true },
    _count: { id: true }
  });

  const allTimeRevenue = stats._sum.totalAmount ? Number(stats._sum.totalAmount) : 0;
  const totalOrders = stats._count.id;

  // Placeholder static analytics for demo mapping mapping native raw SQL grouping locally safely
  const chartData = [
    { name: 'Mon', signups: 8000 },
    { name: 'Tue', signups: 10450 },
    { name: 'Wed', signups: 12000 },
    { name: 'Thu', signups: 9500 },
    { name: 'Fri', signups: 22600 },
    { name: 'Sat', signups: 34000 },
    { name: 'Sun', signups: 29000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Financial Reports</h1>
        <p className="text-gray-500 mt-1">Dive deep into your cafe's sales, popular items, and historical traction.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">All Time Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-gray-900">₹{allTimeRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">Lifetime Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-gray-900">{totalOrders.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium">Avg Order Value (AOV)</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-bold text-brand">₹{(totalOrders > 0 ? (allTimeRevenue/totalOrders) : 0).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue by Day (Demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminCharts data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
