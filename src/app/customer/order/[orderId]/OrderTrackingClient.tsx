'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Coffee, 
  PackageCheck, 
  MapPin, 
  CreditCard,
  ChefHat,
  Sparkles,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderTrackingClientProps {
  initialOrder: any;
  tenantId: string;
}

export default function OrderTrackingClient({ initialOrder, tenantId }: OrderTrackingClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const channel = supabase
      .channel('order-track-' + order.id)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Order',
        filter: 'id=eq.' + order.id
      }, (payload) => {
        const newStatus = payload.new.status;
        if (newStatus !== order.status) {
           handleStatusChange(newStatus);
        }
      })
      .subscribe();

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        if(res.ok) {
           const data = await res.json();
           if(data.status && data.status !== order.status) {
              handleStatusChange(data.status);
           }
        }
      } catch(e) {}
    }, 5000);

    const handleStatusChange = (newStatus: string) => {
       setOrder((prev: any) => ({ ...prev, status: newStatus }));
       if (newStatus === 'preparing') toast.success('Chef started preparing your order!', { icon: '👨‍🍳' });
       if (newStatus === 'ready') toast.success('Order is ready & on the way!', { icon: '🚀' });
       if (newStatus === 'served') toast.success('Enjoy your meal!', { icon: '🍽️' });
    };

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [order.id, order.status, supabase]);

  const steps = [
    { id: 'new', label: 'Order Confirmed', icon: PackageCheck, desc: 'Your ticket has been prioritized by our kitchen queue.' },
    { id: 'preparing', label: 'Culinary Preparation', icon: ChefHat, desc: 'Our chefs are currently hand-crafting your assets.' },
    { id: 'ready', label: 'Quality Verified', icon: Coffee, desc: 'Your assets are ready for distribution to your unit.' },
    { id: 'served', label: 'Mission Complete', icon: CheckCircle2, desc: 'Assets have been deployed successfully to your table.' },
  ];

  const currentStepIndex = Math.max(0, steps.findIndex(s => s.id === order.status));
  const CurrentStepIcon = steps[currentStepIndex]?.icon;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
       {/* Status Card */}
       <div className="bg-slate-900 rounded-[48px] p-10 text-white relative shadow-2xl shadow-slate-900/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
             <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border border-white/5 backdrop-blur-md relative">
                <div className="absolute inset-0 rounded-full bg-brand/30 animate-ping opacity-20"></div>
                <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center shadow-lg shadow-brand/20">
                   {CurrentStepIcon && <CurrentStepIcon size={28} className="text-white" />}
                </div>
             </div>
             
             <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-brand font-black text-[10px] uppercase tracking-[0.3em]">
                   <Zap size={10} fill="currentColor" />
                   <span>Live Tracking Protocol</span>
                </div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">{steps[currentStepIndex]?.label}</h1>
                <p className="text-slate-400 font-medium text-sm max-w-xs">{steps[currentStepIndex]?.desc}</p>
             </div>
          </div>
       </div>

       {/* Vertical Timeline */}
       <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-10">
          <div className="space-y-8 relative">
             <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-50"></div>
             
             {steps.map((step, idx) => {
               const Icon = step.icon;
               const isActive = idx <= currentStepIndex;
               const isCurrent = idx === currentStepIndex;
               
               return (
                 <div key={step.id} className="relative flex items-center space-x-6 z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-[3px] transition-all duration-500 shadow-sm ${
                      isCurrent ? 'bg-brand border-brand text-white shadow-brand/20 scale-110' : 
                      isActive ? 'bg-slate-900 border-slate-900 text-white' : 
                      'bg-white border-slate-50 text-slate-200'
                    }`}>
                       <Icon size={20} />
                    </div>
                    <div className="flex flex-col">
                       <span className={`text-xs font-black uppercase tracking-widest ${isActive ? (isCurrent ? 'text-brand' : 'text-slate-900') : 'text-slate-300'}`}>
                          {step.label}
                       </span>
                       {isCurrent && (
                         <div className="flex items-center space-x-1.5 mt-1">
                            <div className="w-1 h-1 rounded-full bg-slate-400 animate-pulse"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ongoing Task</span>
                         </div>
                       )}
                    </div>
                 </div>
               );
             })}
          </div>
       </div>

       {/* Order Summary */}
       <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                   <PackageCheck size={18} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-900 italic uppercase leading-none mt-1">Order Details</h3>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-1">Reference: {order.id.slice(-8).toUpperCase()}</span>
                </div>
             </div>
             <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 border transition-colors ${
               order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
             }`}>
                <CreditCard size={12} />
                <span>{order.paymentStatus === 'paid' ? 'Paid In Full' : 'Pending Clearance'}</span>
             </div>
          </div>

          <div className="p-8 space-y-6">
             <div className="space-y-4">
                {order.orderItems.map((item: any) => (
                   <div key={item.id} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-4">
                         <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">
                            {item.quantity}
                         </div>
                         <span className="text-sm font-black text-slate-900 uppercase italic tracking-tight group-hover:text-brand transition-colors">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-400 tracking-tighter">₹{Number(item.lineTotal).toFixed(0)}</span>
                   </div>
                ))}
             </div>
             
             <div className="pt-8 border-t border-slate-50 flex justify-between items-end">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Settled Amount</p>
                   <h4 className="text-3xl font-black italic tracking-tighter text-slate-900">₹{order.totalAmount.toFixed(0)}</h4>
                </div>
                <div className="flex items-center space-x-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                   <Sparkles size={14} />
                   <span className="text-[9px] font-black tracking-widest uppercase">Verified Transact</span>
                </div>
             </div>
          </div>
       </div>

       {/* Support / Help */}
       <div className="flex flex-col items-center space-y-4 text-center px-8">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] leading-relaxed">
             If you require specific adjustments to your order, please consult our spatial staff members immediately.
          </p>
          <div className="h-px w-20 bg-slate-100"></div>
          <div className="flex items-center space-x-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
             <MapPin size={12} className="text-brand" />
             <span>HUB-01-TABLE-{order.tableNumber || '??'}</span>
          </div>
       </div>
    </div>
  );
}
