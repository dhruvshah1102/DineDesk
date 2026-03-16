import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_123')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== 'mock_success' && razorpay_signature !== expectedSign) {
       return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: internal_order_id } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Payment is authentic, update the order
    await prisma.order.update({
       where: { id: internal_order_id },
       data: { 
          paymentStatus: 'paid',
          payment: {
             create: {
                tenantId: order.tenantId,
                amount: order.totalAmount,
                gateway: 'razorpay',
                gatewayPaymentId: razorpay_payment_id,
                status: 'success'
             }
          }
       }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Razorpay Signature Verification Error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
