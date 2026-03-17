'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/components/customer/CartContext';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Trash2, User, FileText, CreditCard, ChevronLeft, Sparkles, ShoppingBag, Receipt, History } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CartClient({ slug }: { slug: string }) {
  const { items, updateQuantity, removeItem, clearCart, subtotal, tableNumber } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const router = useRouter();

  const taxAmount = subtotal * 0.05;
  const totalAmount = subtotal + taxAmount;

  const pastSubtotal = pastOrders.reduce((sum, order) => sum + Number(order.subtotal), 0);
  const pastTax = pastOrders.reduce((sum, order) => sum + Number(order.taxAmount), 0);
  const sessionTotal = totalAmount + pastSubtotal + pastTax;

  useEffect(() => {
    if (tableNumber && slug) {
      async function fetchPastOrders() {
        try {
          const res = await fetch(`/api/public/table-orders?slug=${slug}&table=${tableNumber}`);
          if (res.ok) {
            const data = await res.json();
            setPastOrders(data);
          }
        } catch (e) {
          console.error("Failed to fetch past orders");
        }
      }
      fetchPastOrders();
    }
  }, [tableNumber, slug]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber) {
      toast.error('Spatial Token Missing. Re-scan QR.');
      return;
    }

    if (items.length === 0) return;

    setLoading(true);

    try {
      const res = await fetch('/api/public/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          tableNumber: parseInt(tableNumber, 10),
          items,
          customerName,
          notes
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Checkout failed');
      }

      const { orderId } = await res.json();
      clearCart();
      
      toast.success("Order deployed to kitchen!", { icon: '🔥' });
      
      // Navigate to tracking immediately (skipping payment)
      router.push(`/order/${orderId}${slug ? `?cafe=${slug}` : ''}`);
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 p-12 text-center flex flex-col items-center justify-center min-h-[50vh] shadow-sm animate-in fade-in zoom-in-95 duration-500">
         <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-inner group">
            <ShoppingBag size={40} className="text-slate-200 group-hover:scale-110 transition-transform" />
         </div>
         <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">Cart is empty</h2>
         <p className="text-slate-400 font-medium mt-2 mb-10 max-w-xs">Looks like you haven't selected any culinary assets yet.</p>
         <Link 
           href={`/table/${tableNumber || 1}${slug ? `?cafe=${slug}` : ''}`} 
           className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all"
         >
           Browse Digital Menu
         </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleCheckout} className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
       <div className="flex items-center justify-between px-2">
          <Link href={`/table/${tableNumber || 1}${slug ? `?cafe=${slug}` : ''}`} className="flex items-center space-x-2 text-slate-400 hover:text-slate-900 transition-colors">
             <ChevronLeft size={16} />
             <span className="text-[10px] font-black uppercase tracking-widest">Back to Menu</span>
          </Link>
          <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
             T-{tableNumber} Secure Session
          </div>
       </div>

       {/* Cart Items */}
       <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm divide-y divide-slate-50">
          {items.map(item => (
            <div key={item.id} className="p-6 flex items-start justify-between group">
               <div className="flex-1 pr-6 space-y-1">
                  <div className="flex items-center space-x-2">
                     <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                     <h3 className="font-black text-slate-900 tracking-tight italic uppercase text-sm group-hover:text-brand transition-colors">{item.name}</h3>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate: ₹{item.price.toFixed(0)}</p>
               </div>
               
               <div className="flex flex-col items-end space-y-3">
                  <div className="flex items-center bg-slate-50 rounded-xl p-0.5 border border-slate-100">
                     <button type="button" onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"><Minus size={14} /></button>
                     <span className="px-3 text-sm font-black text-slate-900 w-8 text-center">{item.quantity}</span>
                     <button type="button" onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"><Plus size={14} /></button>
                  </div>
                  <p className="font-black text-slate-900 text-sm tracking-tighter italic">₹{(item.price * item.quantity).toFixed(0)}</p>
               </div>
            </div>
          ))}
       </div>

       {/* Past Orders in Session */}
       {pastOrders.length > 0 && (
         <div className="space-y-4">
           <div className="flex items-center space-x-2 px-2">
             <History size={14} className="text-slate-400" />
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past Orders This Session</h3>
           </div>
           <div className="bg-slate-50 rounded-[40px] border border-slate-100 overflow-hidden divide-y divide-slate-100/50">
             {pastOrders.map((order, idx) => (
               <div key={order.id} className="p-6 opacity-60 grayscale-[0.5] hover:grayscale-0 hover:opacity-100 transition-all group">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Segment #{pastOrders.length - idx}</span>
                     <span className="text-[10px] font-black text-slate-900 tracking-tighter italic">₹{Number(order.totalAmount).toFixed(0)}</span>
                  </div>
                  <div className="space-y-2">
                     {order.orderItems.map((item: any) => (
                       <div key={item.id} className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                          <span className="uppercase tracking-tight italic">{item.quantity}x {item.name}</span>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
           </div>
         </div>
       )}

       {/* Customer Info */}
       <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
          
          <div className="space-y-4 relative z-10">
             <div className="space-y-2">
                <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   <User size={12} />
                   <span>Identify Your Order</span>
                </label>
                <input 
                  type="text" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)} 
                  required 
                  placeholder="Enter name for pick-up / delivery"
                  className="w-full bg-slate-50 border border-slate-100 rounded-[20px] px-6 py-4 font-black text-slate-900 focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none" 
                />
             </div>
             <div>
                <label className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                   <FileText size={12} />
                   <span>Specific Instructions</span>
                </label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="e.g. Extra spicy / No onions / Cutlery needed"
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 font-bold text-slate-900 text-sm focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all outline-none resize-none" 
                />
             </div>
          </div>
       </div>

       {/* Billing Summary */}
       <div className="bg-slate-900 rounded-[40px] p-8 text-white relative shadow-2xl shadow-slate-900/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand opacity-10 rounded-full blur-3xl -mr-24 -mt-24"></div>
          
          <div className="relative z-10 space-y-3 font-bold text-xs uppercase tracking-widest">
              <div className="flex justify-between items-center text-slate-400">
                 <span>Current Draft Total</span>
                 <span>₹{totalAmount.toFixed(0)}</span>
              </div>
              {pastOrders.length > 0 && (
                <div className="flex justify-between items-center text-brand">
                   <span>Past Sessions Owed</span>
                   <span>₹{(pastSubtotal + pastTax).toFixed(0)}</span>
                </div>
              )}
              <div className="pt-6 mt-4 border-t border-white/10 flex justify-between items-end">
                 <div className="space-y-1">
                    <p className="text-[10px] text-brand">Total Session Liability</p>
                    <h4 className="text-3xl font-black italic tracking-tighter">₹{sessionTotal.toFixed(0)}</h4>
                 </div>
                 <div className="bg-white/5 px-3 py-2 rounded-xl flex items-center space-x-2 border border-white/5">
                    <CreditCard size={14} className="text-brand" />
                    <span className="text-[9px]">Deferred Settlement</span>
                 </div>
              </div>
          </div>
       </div>

       <button 
         type="submit" 
         disabled={loading}
         className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[24px] shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
       >
          {loading ? (
             <>
               <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
               <span>Processing Protocol...</span>
             </>
          ) : (
             <>
               <Sparkles size={18} fill="currentColor" />
               <span>DEEPLOY ORDER</span>
             </>
          )}
       </button>
    </form>
  );
}
