'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, Sparkles, ChevronRight, Lock, LogOut } from 'lucide-react';
import { useCart } from '@/components/customer/CartContext';

interface PaymentProps {
  orderId: string;
  amount: number;
  isPaid: boolean;
  cafeName: string;
  cafeEmail: string;
  customerName: string;
}

export default function PaymentClient({ orderId, amount, isPaid, cafeName, cafeEmail, customerName }: PaymentProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { clearTableSession } = useCart();

  if (isPaid) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 p-12 text-center flex flex-col items-center shadow-sm animate-in fade-in zoom-in-95 duration-700">
         <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-10 border border-emerald-100 relative group">
            <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping"></div>
            <CheckCircle2 size={48} className="text-emerald-500 relative z-10 group-hover:scale-110 transition-transform" />
         </div>
         <div className="space-y-2 mb-10">
            <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Transaction Settled</h2>
            <p className="text-slate-400 font-medium text-sm">Your order is being transmitted to the kitchen queue.</p>
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-2">Table Access Released</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => {
                  const currentUrl = new URL(window.location.href);
                  const currentCafe = currentUrl.searchParams.get('cafe');
                  router.push(`/order/${orderId}${currentCafe ? `?cafe=${currentCafe}` : ''}`);
              }} 
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all flex items-center justify-center space-x-3"
            >
              <span>Track Order</span>
              <ChevronRight size={14} />
            </button>
            <button 
              onClick={() => {
                  const currentUrl = new URL(window.location.href);
                  const currentCafe = currentUrl.searchParams.get('cafe');
                  router.push(`/${currentCafe ? `?cafe=${currentCafe}` : ''}`);
              }} 
              className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center space-x-3"
            >
              <LogOut size={14} />
              <span>Exit Table</span>
            </button>
         </div>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      const verifyRes = await fetch('/api/public/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: `mock_order_${Math.random().toString(36).substring(7)}`,
          razorpay_payment_id: `mock_payment_${Math.random().toString(36).substring(7)}`,
          razorpay_signature: 'mock_success',
          internal_order_id: orderId
        })
      });

      if (!verifyRes.ok) throw new Error();
      
      // Clear table session immediately on success
      clearTableSession();
      
      toast.success("Transaction Successfully Verified!", {
         style: { borderRadius: '12px', background: '#0F172A', color: '#fff', fontSize: '12px', fontWeight: 'bold' }
      });
      
      const currentUrl = new URL(window.location.href);
      const currentCafe = currentUrl.searchParams.get('cafe');
      router.push(`/order/${orderId}${currentCafe ? `?cafe=${currentCafe}` : ''}`);

    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand opacity-10 rounded-full blur-3xl -mr-32 -mt-32"></div>
         <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand opacity-5 rounded-full blur-3xl -ml-16 -mb-16"></div>
         
         <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="space-y-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Payable Settlement</p>
               <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">₹{amount.toFixed(0)}</h2>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
               <Lock size={12} className="text-brand" fill="currentColor" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">End-to-End Encrypted Tunnel</span>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-8">
         <div className="flex items-center justify-between border-b border-slate-50 pb-6 text-slate-400">
            <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <CreditCard size={18} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest">Digital Merchant Interface</span>
            </div>
            <span className="text-[10px] font-bold">RAZORPAY_PRO</span>
         </div>
         
         <div className="space-y-6">
            <button 
              onClick={handlePayment} 
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[24px] shadow-xl hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {loading ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                   <span>PROVISIONING...</span>
                 </>
              ) : (
                 <>
                   <Zap size={18} fill="currentColor" className="text-brand" />
                   <span>AUTHORIZE PAYMENT</span>
                 </>
              )}
            </button>
            
            <div className="flex flex-col items-center space-y-3">
               <div className="flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.1em]">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>3-STEP SECURITY PROTOCOL ENGAGED</span>
               </div>
               <p className="text-[9px] text-slate-300 font-medium max-w-[240px] text-center leading-relaxed italic border-t border-slate-50 pt-3">
                  Deployment of payment will trigger immediate culinary production. All transactions are non-refundable once assets are staged.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
