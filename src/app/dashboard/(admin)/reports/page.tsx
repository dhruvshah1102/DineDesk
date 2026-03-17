import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { BarChart3, TrendingUp, Wallet, ShoppingBag, PieChart, Calendar } from 'lucide-react';

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
  const aov = totalOrders > 0 ? (allTimeRevenue / totalOrders) : 0;

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
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center space-x-2 text-brand font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <BarChart3 size={14} />
              <span>Intelligence Suite</span>
           </div>
           <h1 className="text-4xl font-black tracking-tight text-slate-900 italic">
             Financial <span className="text-brand">Analytics</span>
           </h1>
           <p className="text-slate-500 mt-2 font-medium">Deep insights into your revenue streams and operational performance.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center space-x-2 border border-slate-100">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Historical View</span>
           </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-emerald-100 transition-colors"></div>
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-4 rounded-[20px] bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-500/5 group-hover:scale-110 transition-transform">
                 <Wallet size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Net Capital</span>
           </div>
           <div className="relative z-10">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mb-1">Lifetime Revenue</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">₹{allTimeRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-100 transition-colors"></div>
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-4 rounded-[20px] bg-blue-50 text-blue-600 shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform">
                 <ShoppingBag size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Volume</span>
           </div>
           <div className="relative z-10">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mb-1">Total Orders</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{totalOrders.toLocaleString()}</h3>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
           <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-brand/10 transition-colors"></div>
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-4 rounded-[20px] bg-brand/10 text-brand shadow-lg shadow-brand/5 group-hover:scale-110 transition-transform">
                 <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Efficiency</span>
           </div>
           <div className="relative z-10">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mb-1">Average Order Value</p>
              <h3 className="text-3xl font-black tracking-tighter italic text-brand">₹{aov.toFixed(1)}</h3>
           </div>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white p-4">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
               <div className="w-1.5 h-6 bg-brand rounded-full"></div>
               <span>Revenue Velocity (Last 7 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-4">
            <div className="h-[400px] w-full">
               <AdminCharts data={chartData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
         <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <PieChart className="text-brand" size={24} />
               </div>
               <h3 className="text-2xl font-black italic tracking-tight mb-2">Category Performance</h3>
               <p className="text-slate-400 font-medium mb-8">Identify which segments of your menu are driving the most traction.</p>
               <button className="px-8 py-3 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 hover:-translate-y-1 transition-all">
                  Request Deep Audit
               </button>
            </div>
         </div>

         <div className="bg-emerald-600 rounded-[48px] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <TrendingUp className="text-white" size={24} />
               </div>
               <h3 className="text-2xl font-black italic tracking-tight mb-2">Sales Forecast</h3>
               <p className="text-emerald-100 font-medium mb-8">AI-driven projections based on historical pattern recognition.</p>
               <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-emerald-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></div>
                  <span>Experimental Feature</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
