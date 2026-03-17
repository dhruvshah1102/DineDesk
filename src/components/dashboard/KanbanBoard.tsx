'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import toast from 'react-hot-toast';
import { 
  ClipboardList, 
  Clock, 
  ArrowRight,
  ChevronRight,
  ChefHat,
  Bell,
  CheckCircle2
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

interface Order {
  id: string;
  tableNumber: number;
  status: string;
  totalAmount: number;
  placedAt: string;
  orderItems: OrderItem[];
}

interface KanbanProps {
  initialOrders: Order[];
  tenantId: string;
}

export default function KanbanBoard({ initialOrders, tenantId }: KanbanProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    const channel = supabase
      .channel('orders-' + tenantId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Order',
        filter: 'tenantId=eq.' + tenantId
      }, async (payload) => {
        if (payload.eventType === 'INSERT') fetchFreshOrders(true);
        if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, status: payload.new.status } : o));
        }
      })
      .subscribe();

    const pollInterval = setInterval(() => {
       fetchFreshOrders(false);
    }, 5000);

    const fetchFreshOrders = async (showToast = false) => {
       try {
           const res = await fetch('/api/orders?date=today');
           const freshData = await res.json();
           
           if (showToast) {
              const newOrdersCount = freshData.length - orders.length;
              if (newOrdersCount > 0) {
                toast.success('New Order received!', {
                  icon: '🔔',
                  style: {
                    borderRadius: '12px',
                    background: '#0F172A',
                    color: '#fff',
                    fontWeight: 'bold'
                  },
                });
              }
           }

           setOrders(freshData.map((o:any) => ({
               ...o,
               totalAmount: Number(o.totalAmount),
           })));
       } catch (e) {}
    };

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [tenantId, supabase, orders.length]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const previousOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      
      toast.success(`Order moved to ${newStatus}`, {
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (e) {
      toast.error('Failed to update status');
      setOrders(previousOrders);
    }
  };

  const getElapsedTime = (placedAtStr: string) => {
    const elapsedMs = new Date().getTime() - new Date(placedAtStr).getTime();
    const minutes = Math.floor(elapsedMs / 60000);
    return `${minutes}m`;
  };

  const activeOrdersLength = orders.filter(o => ['new', 'preparing', 'ready'].includes(o.status)).length;

  if (activeOrdersLength === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <ClipboardList size={32} className="text-slate-300" />
         </div>
         <h3 className="text-xl font-bold text-slate-900">All caught up!</h3>
         <p className="text-slate-500 mt-2 text-center max-w-xs">
           No active orders at the moment. New orders will appear here automatically.
         </p>
      </div>
    );
  }

  const Column = ({ title, status, icon: Icon, color, accentColor, nextLabel, nextStatus }: any) => {
    const columnOrders = orders.filter(o => o.status === status);
    
    return (
      <div className="flex-1 min-w-[340px] flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center space-x-3">
             <div className={`p-2 rounded-xl ${accentColor} ${color}`}>
                <Icon size={18} />
             </div>
             <h2 className="font-bold text-slate-900 tracking-tight text-lg">
               {title}
             </h2>
             <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
               {columnOrders.length}
             </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-6 scrollbar-hide">
           {columnOrders.map((order) => (
             <div key={order.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-xl hover:border-brand/20 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center space-x-3">
                      <div className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-slate-900/10">
                         {order.tableNumber}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">TABLE</p>
                        <div className="flex items-center space-x-2">
                           <Clock size={12} className="text-slate-400" />
                           <span className="text-sm font-bold text-slate-600">{getElapsedTime(order.placedAt)}</span>
                        </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-lg font-black text-slate-900 tracking-tight">₹{order.totalAmount.toFixed(0)}</div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">TOTAL</p>
                   </div>
                </div>

                <div className="space-y-3 mb-6">
                   {order.orderItems?.map(item => (
                     <div key={item.id} className="flex items-center justify-between bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                        <div className="flex items-center space-x-2 overflow-hidden">
                           <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-900">
                             {item.quantity}
                           </span>
                           <span className="text-sm font-bold text-slate-700 truncate">{item.name}</span>
                        </div>
                     </div>
                   ))}
                </div>

                <button
                  onClick={() => updateStatus(order.id, nextStatus)}
                  className={`w-full group/btn flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl text-sm font-black transition-all duration-300 ${color} ${accentColor} shadow-lg shadow-current/5 hover:-translate-y-0.5 active:translate-y-0`}
                >
                  <span>{nextLabel}</span>
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
           ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-8 h-full overflow-x-auto pb-4 scrollbar-hide">
      <Column 
        title="Incoming" 
        status="new" 
        icon={Bell} 
        color="text-orange-600" 
        accentColor="bg-orange-50"
        nextLabel="Start Preparing" 
        nextStatus="preparing" 
      />
      <Column 
        title="Preparing" 
        status="preparing" 
        icon={ChefHat} 
        color="text-blue-600" 
        accentColor="bg-blue-50"
        nextLabel="Mark Ready" 
        nextStatus="ready" 
      />
      <Column 
        title="Ready to Serve" 
        status="ready" 
        icon={CheckCircle2} 
        color="text-emerald-600" 
        accentColor="bg-emerald-50"
        nextLabel="Confirm Served" 
        nextStatus="served" 
      />
    </div>
  );
}
