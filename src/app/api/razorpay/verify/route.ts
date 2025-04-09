import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  const {
    razorpay_subscription_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
  } = await req.json();

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(razorpay_payment_id + "|" + razorpay_subscription_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'PREMIUM' },
    });
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
