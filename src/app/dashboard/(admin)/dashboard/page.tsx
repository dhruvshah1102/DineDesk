import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Coffee, IndianRupee, Clock, TrendingUp, Users, Calendar } from 'lucide-react';
import { AdminCharts } from '@/components/admin/AdminCharts';

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
      take: 8,
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

  const stats = [
    { label: "Today's Orders", value: todayOrdersCount, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Orders", value: pendingOrdersCount, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Active Tables", value: activeTables, icon: Coffee, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center space-x-2 text-brand font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <TrendingUp size={14} />
              <span>Performance Hub</span>
           </div>
           <h1 className="text-4xl font-black tracking-tight text-slate-900 italic">
             Overview
           </h1>
           <p className="text-slate-500 mt-2 font-medium">Here's a high-level view of your cafe's performance today.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center space-x-2 border border-slate-100">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
             <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-lg shadow-current/5 group-hover:scale-110 transition-transform`}>
                   <stat.icon size={24} />
                </div>
                <div className="bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Live
                </div>
             </div>
             <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-sm rounded-[32px] overflow-hidden bg-white p-2">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
               <div className="w-1.5 h-6 bg-brand rounded-full"></div>
               <span>Revenue Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="h-[350px] w-full">
              <AdminCharts data={chartData} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-sm rounded-[32px] overflow-hidden bg-white p-2 flex flex-col">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
               <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
               <span>Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-6 pb-6 overflow-y-auto max-h-[450px] scrollbar-hide">
             <div className="space-y-4 pt-2">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 group">
                     <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-900 shadow-sm">
                          {order.tableNumber}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">Table {order.tableNumber}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{order.placedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-black text-slate-900 text-sm tracking-tight">₹{Number(order.totalAmount).toFixed(0)}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {order.paymentStatus}
                        </span>
                     </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <div className="text-center py-12">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="text-slate-300" size={24} />
                     </div>
                     <p className="text-slate-400 text-sm font-medium">No orders yet today.</p>
                  </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
