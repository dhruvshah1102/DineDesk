'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle } from 'lucide-react';

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

  if (isPaid) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center">
         <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100 text-green-500">
            <CheckCircle size={32} />
         </div>
         <h2 className="text-xl font-bold text-gray-900">Payment Successful</h2>
         <p className="text-gray-500 mt-2 mb-6">Your order is being sent to the kitchen.</p>
         <button onClick={() => router.push(`/order/${orderId}`)} className="bg-[var(--customer-brand)] text-white px-6 py-2 rounded-md font-medium">Track Order Status</button>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Bypassing real Razorpay SDK for Local Development

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
      
      toast.success("Mock Payment Successful!");
      
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
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 text-center border-b border-gray-100">
            <p className="text-gray-500 text-sm font-medium mb-1">Total to Pay</p>
            <h2 className="text-4xl font-black text-gray-900">₹{amount.toFixed(2)}</h2>
         </div>
         
         <div className="p-6 bg-gray-50 flex flex-col items-center">
            <button 
              onClick={handlePayment} 
              disabled={loading}
              className="w-full max-w-sm bg-[var(--customer-brand)] text-white font-bold text-lg py-3.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <CreditCard size={20} />
              <span>{loading ? 'Initializing...' : 'Pay with Razorpay'}</span>
            </button>
            <p className="text-xs text-gray-400 mt-4 flex items-center space-x-1">
               <span>Secured by Razorpay</span>
            </p>
         </div>
      </div>
    </>
  );
}
