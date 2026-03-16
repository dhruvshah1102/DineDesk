'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { CheckCircle, Clock, Utensils, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderTrackingClientProps {
  initialOrder: any;
  tenantId: string;
}

export default function OrderTrackingClient({ initialOrder, tenantId }: OrderTrackingClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    // 1. Attempt Supabase Realtime (Works if Table is 'Enable Realtime' in Dashboard)
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

    // 2. Fallback Long-Polling (Fires every 5s if websockets fail/disabled)
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
       if (newStatus === 'preparing') toast.success('Chef started preparing your order!');
       if (newStatus === 'ready') toast.success('Your food is ready & on the way!');
       if (newStatus === 'served') toast.success('Enjoy your meal!');
    };

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [order.id, order.status, supabase]);

  const steps = [
    { id: 'new', label: 'Order Placed', icon: Clock },
    { id: 'preparing', label: 'Preparing', icon: Utensils },
    { id: 'ready', label: 'Ready to Serve', icon: Coffee },
    { id: 'served', label: 'Served', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);

  return (
    <div className="space-y-6">
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="relative flex justify-between w-full px-2">
             {/* Progress Line */}
             <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 -z-10 rounded-full"></div>
             <div 
               className="absolute top-5 left-8 h-1 bg-[var(--customer-brand)] -z-10 rounded-full transition-all duration-500 ease-in-out"
               style={{ width: `calc(${(Math.max(0, currentStepIndex) / 3) * 100}% - 4rem)` }}
             ></div>

             {steps.map((step, idx) => {
               const Icon = step.icon;
               const isActive = idx <= currentStepIndex;
               const isCurrent = idx === currentStepIndex;
               
               return (
                 <div key={step.id} className="flex flex-col items-center z-10 w-16">
                    <div className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-300 border-2 ${isActive ? 'bg-[var(--customer-brand)] text-white border-[var(--customer-brand)] shadow-md' : 'bg-gray-100 text-gray-400 border-white'}`}>
                       <Icon size={18} />
                    </div>
                    <span className={`text-[10px] mt-2 text-center uppercase tracking-tight leading-tight ${isCurrent ? 'text-gray-900 font-bold' : isActive ? 'text-gray-600 font-medium' : 'text-gray-400 font-medium'}`}>
                       {step.label}
                    </span>
                 </div>
               );
             })}
          </div>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
             <h3 className="font-semibold text-gray-800">Order Items</h3>
             <span className="text-xs font-bold px-2 py-1 bg-gray-200 rounded text-gray-600 uppercase">
               {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
             </span>
          </div>

          <div className="divide-y divide-gray-100 relative">
             {/* Disable items interaction overlay since it's paid/placed */}
             <div className="absolute inset-0 z-10 pointer-events-none"></div> 

             {order.orderItems.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between opacity-90">
                   <div className="flex-1 pr-4">
                      <div className="flex items-center space-x-2">
                         <h3 className="font-bold text-gray-900 text-sm">{item.quantity}x {item.name}</h3>
                      </div>
                   </div>
                   <div className="flex items-center space-x-4">
                      <p className="font-bold text-gray-600 text-sm">₹{Number(item.lineTotal).toFixed(2)}</p>
                   </div>
                </div>
             ))}
          </div>

          <div className="p-4 bg-gray-50 flex justify-between text-lg font-black text-gray-900 border-t border-gray-100">
             <span>Total</span>
             <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
       </div>
    </div>
  );
}
