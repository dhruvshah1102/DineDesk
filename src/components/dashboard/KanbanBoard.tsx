'use client';

import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import toast from 'react-hot-toast';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';

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
    // 1. Subscribe to Postgres changes for this specific tenant's orders (If enabled)
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

    // 2. Fallback Long-Polling (Every 5s)
    const pollInterval = setInterval(() => {
       fetchFreshOrders(false);
    }, 5000);

    const fetchFreshOrders = async (showToast = false) => {
       try {
           const res = await fetch('/api/orders?date=today');
           const freshData = await res.json();
           
           // Check if we have new orders to alert
           if (showToast) {
              const newOrdersCount = freshData.length - orders.length;
              if (newOrdersCount > 0) toast('🔔 New Order received!', { icon: '🍽️', duration: 4000});
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
    
    // Optimistic UI mapping
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      toast.error('Failed to update order status');
      setOrders(previousOrders); // Revert
    }
  };

  const getElapsedTime = (placedAtStr: string) => {
    const elapsedMs = new Date().getTime() - new Date(placedAtStr).getTime();
    const minutes = Math.floor(elapsedMs / 60000);
    return `${minutes} min ago`;
  };

  const activeOrdersLength = orders.filter(o => ['new', 'preparing', 'ready'].includes(o.status)).length;

  if (activeOrdersLength === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 bg-opacity-50">
         <ClipboardList size={64} className="text-gray-300 mb-4" />
         <h3 className="text-lg font-medium text-gray-900">No active orders</h3>
         <p className="text-sm text-gray-500 mt-1">Waiting for customers to place an order...</p>
      </div>
    );
  }

  const Column = ({ title, status, colorClass, nextLabel, nextStatus }: { title: string, status: string, colorClass: string, nextLabel: string, nextStatus: string }) => {
    const columnOrders = orders.filter(o => o.status === status);
    
    return (
      <div className="flex-1 min-w-[300px] bg-gray-100 rounded-lg p-4 flex flex-col max-h-full">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-semibold text-gray-800 flex items-center">
            {title}
            <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full text-white ${colorClass}`}>
              {columnOrders.length}
            </span>
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
           {columnOrders.map((order) => {
             return (
               <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${colorClass}`}></div>
                
                <div className="flex justify-between items-start mb-3 ml-2">
                   <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md font-bold text-lg">
                      T{order.tableNumber}
                   </div>
                   <div className="text-right">
                      <div className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                         <Clock size={12} className="mr-1" />
                         {getElapsedTime(order.placedAt)}
                      </div>
                   </div>
                </div>

                <div className="ml-2 mb-4">
                  <ul className="text-sm text-gray-600 space-y-1">
                    {order.orderItems?.map(item => (
                      <li key={item.id} className="flex justify-between">
                         <span className="truncate pr-2">
                           <span className="font-medium text-gray-900">{item.quantity}x</span> {item.name}
                         </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="ml-2 mt-auto pt-3 border-t border-gray-100">
                  <button
                    onClick={() => updateStatus(order.id, nextStatus)}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white transition-colors ${colorClass.replace('bg-', 'bg-').replace('text-', 'text-')}`}
                  >
                    {nextLabel}
                  </button>
                </div>
             </div>
             );
           })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      <Column title="New Orders" status="new" colorClass="bg-orange-500" nextLabel="Start Preparing" nextStatus="preparing" />
      <Column title="Preparing" status="preparing" colorClass="bg-amber-500" nextLabel="Mark Ready" nextStatus="ready" />
      <Column title="Ready" status="ready" colorClass="bg-green-500" nextLabel="Mark Served" nextStatus="served" />
    </div>
  );
}
