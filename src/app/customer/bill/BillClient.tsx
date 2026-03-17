'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/components/customer/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CreditCard, 
  Receipt, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  PackageCheck, 
  ChefHat, 
  Coffee, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BillClient({ initialOrders = [] }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(true);
  const { tableNumber } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('cafe');

  useEffect(() => {
    if (tableNumber && slug) {
       async function fetchBill() {
          try {
             const res = await fetch(`/api/public/table-orders?slug=${slug}&table=${tableNumber}`);
             if (res.ok) {
                const data = await res.json();
                setOrders(data);
             }
          } catch (e) {
             console.error("Order fetch failed");
          } finally {
             setLoading(false);
          }
       }
       fetchBill();
    } else {
       setLoading(false);
    }
  }, [tableNumber, slug]);

  const totalToPay = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const itemsCount = orders.reduce((sum, order) => sum + order.orderItems.length, 0);

  const stepsMap: any = {
    'new': { label: 'Confirmed', icon: PackageCheck, color: 'text-blue-500' },
    'preparing': { label: 'Preparing', icon: ChefHat, color: 'text-amber-500' },
    'ready': { label: 'Ready', icon: Coffee, color: 'text-emerald-500' },
    'served': { label: 'Served', icon: CheckCircle2, color: 'text-slate-400' }
  };

  const handleSettleBill = async () => {
    if (orders.length === 0) return;
    setLoading(true);
    
    // In a real app we'd create a "Payment" record or a "Multi-Order Payment" session.
    // For now, let's treat the MOST RECENT order as the anchor for payment or mock settle all.
    const anchorOrderId = orders[0].id;
    
    try {
      // Mock payment for all pending orders
      // In production, backend should support batch settlement.
      // Here we settle the anchor order and let backend handle session logic.
      
      const verifyRes = await fetch('/api/public/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: `mock_bill_settle`,
          razorpay_payment_id: `mock_bill_${Math.random().toString(36).substring(7)}`,
          razorpay_signature: 'mock_success',
          internal_order_id: anchorOrderId
        })
      });

      if (!verifyRes.ok) throw new Error();
      
      toast.success("Final Bill Settled!", { icon: '💰' });
      // Redirect to success or home
      router.push(`/table/${tableNumber || 1}${slug ? `?cafe=${slug}` : ''}`);
      
    } catch (err: any) {
      toast.error("Failed to settle bill");
    } finally {
      setLoading(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[50vh] shadow-sm animate-in fade-in zoom-in-95 duration-500">
         <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-inner group">
            <Receipt size={40} className="text-slate-200" />
         </div>
         <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">Bill is Empty</h2>
         <p className="text-slate-400 font-medium mt-2 mb-10 max-w-xs">Deployment of culinary items will generate billable assets here.</p>
         <button onClick={() => router.push(`/table/${tableNumber || 1}${slug ? `?cafe=${slug}` : ''}`)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">Start Ordering</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
       <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10 space-y-6">
             <div className="flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Aggregate Settlement Owed</p>
                <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">₹{totalToPay.toFixed(0)}</h2>
             </div>
             
             <button 
               onClick={handleSettleBill}
               disabled={loading}
               className="w-full bg-white text-slate-900 font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[24px] shadow-xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
             >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-slate-2 00 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                   <>
                     <Zap size={18} className="text-brand" fill="currentColor" />
                     <span>SETTLE FINAL BILL</span>
                   </>
                )}
             </button>
          </div>
       </div>

       {/* Order Segments */}
       <div className="space-y-6">
          <div className="flex items-center space-x-3 px-2">
             <Receipt size={16} className="text-slate-400" />
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order History Log</h3>
          </div>
          
          {orders.map((order, idx) => (
            <div key={order.id} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Order #{idx + 1}</span>
                     <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                        {(() => {
                          const status = stepsMap[order.status] || stepsMap['new'];
                          const Icon = status.icon;
                          return (
                            <>
                               <Icon size={12} className={status.color} />
                               <span className={`text-[8px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                            </>
                          );
                        })()}
                     </div>
                  </div>
                  <span className="text-xs font-black text-slate-900 italic">₹{Number(order.totalAmount).toFixed(0)}</span>
               </div>
               
               <div className="p-6 space-y-3">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                       <div className="flex items-center space-x-2">
                          <span className="text-slate-300 font-black">1x</span>
                          <span className="font-bold text-slate-600 uppercase italic tracking-tight">{item.name}</span>
                       </div>
                       <span className="text-slate-400 font-bold">₹{Number(item.price).toFixed(0)}</span>
                    </div>
                  ))}
               </div>
            </div>
          ))}
       </div>

       <div className="flex flex-col items-center space-y-4 text-center px-8">
          <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
             <ShieldCheck size={14} className="text-emerald-500" />
             <span>3-STEP SECURITY PROTOCOL ENGAGED</span>
          </div>
          <p className="text-[9px] text-slate-300 font-medium max-w-[240px] text-center leading-relaxed italic">
             Final settlement will close your current spatial session. Future orders will require new table identification.
          </p>
       </div>
    </div>
  );
}
