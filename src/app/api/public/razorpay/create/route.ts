import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_123'
});

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
       return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Amount in paise
    const amountInPaise = Math.round(Number(order.totalAmount) * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: "receipt_" + order.id.substring(0, 10),
      notes: {
        orderId: order.id,
      }
    });

    return NextResponse.json({
       id: rzpOrder.id,
       currency: rzpOrder.currency,
       amount: rzpOrder.amount
    });

  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
  }
}
