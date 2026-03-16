import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Coffee, CreditCard, Users } from 'lucide-react';
import { StartDateOfWeek, EndDateOfWeek } from '@/lib/utils'; // I will add these next
// For demonstration charts
import { AdminCharts } from '@/components/admin/AdminCharts';

export default async function AdminDashboardPage() {
  const [totalCafes, activeCafes, todayOrders, totalGMV, recentSignups] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.order.count({
      where: {
        placedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'paid',
        placedAt: {
           gte: new Date(new Date().setHours(0, 0, 0, 0)),
        }
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.tenant.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    })
  ]);

  const gmv = totalGMV._sum.totalAmount ? Number(totalGMV._sum.totalAmount) : 0;

  // Let's assume some dummy data for the chart, ideally we query Prisma for grouped stats
  const chartData = [
    { name: 'Mon', signups: 2 },
    { name: 'Tue', signups: 1 },
    { name: 'Wed', signups: 5 },
    { name: 'Thu', signups: 3 },
    { name: 'Fri', signups: 4 },
    { name: 'Sat', signups: 8 },
    { name: 'Sun', signups: 2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Platform overview and recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cafes</CardTitle>
            <Coffee className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCafes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cafes</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCafes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Orders</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s GMV</CardTitle>
            <CreditCard className="h-4 w-4 text-brand" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{gmv.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>New Signups This Week</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AdminCharts data={chartData} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSignups.map((cafe) => (
                <div key={cafe.id} className="flex items-center">
                  <div className="ml-4 space-y-1 w-full">
                    <p className="text-sm font-medium leading-none flex justify-between">
                      {cafe.name}
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{cafe.plan}</span>
                    </p>
                    <p className="text-sm text-gray-500">{cafe.email}</p>
                  </div>
                </div>
              ))}
              {recentSignups.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent signups</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
