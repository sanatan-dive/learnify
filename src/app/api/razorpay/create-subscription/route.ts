import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { PrismaClient } from "@prisma/client";
import { SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Define interface for request body
interface SubscriptionRequest {
  userId: string;
  planId?: string; // Optional: Allow overriding the default plan
}

export async function POST(req: NextRequest) {
  try {
    // Create Razorpay instance inside the handler
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Parse request body
    const { userId, planId = process.env.DEFAULT_RAZORPAY_PLAN_ID } = await req.json() as SubscriptionRequest;

    if (!planId) {
      console.error('Plan ID is required. Set DEFAULT_RAZORPAY_PLAN_ID env variable or provide planId in request.');
      return NextResponse.json(
        { error: 'Plan ID is required. Set DEFAULT_RAZORPAY_PLAN_ID env variable or provide planId in request.' },
        { status: 400 }
      );
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.email) {
      console.log('User email is required');
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    try {
      // Create or retrieve customer
      let customerId = user.razorpayCustomerId;

      if (!customerId) {
        try {
          const customer = await razorpay.customers.create({
            name: user.firstName || 'Learnify User',
            email: user.email,
          });
          customerId = customer.id;

          // Save it immediately
          await prisma.user.update({
            where: { id: userId },
            data: { razorpayCustomerId: customerId }
          });
        } catch (error: any) {
          if (error?.error?.code === 'BAD_REQUEST_ERROR' && error?.error?.description?.includes('Customer already exists')) {
            console.log('Customer already exists. Please retry or fix duplicate emails in DB.');
            return NextResponse.json(
              { error: 'Customer already exists. Please retry or fix duplicate emails in DB.' },
              { status: 400 }
            );
          }
          console.error('Failed to create customer:', error);
          return NextResponse.json(
            { error: 'Failed to create Razorpay customer', details: error },
            { status: 500 }
          );
        }
      }

      // Create subscription using type assertion to bypass TypeScript error
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: 12, // 12 billing cycles
        customer_id: customerId,
      } as any); // Type assertion to fix TypeScript error

      // Update user record with Razorpay IDs
      await prisma.user.update({
        where: { id: userId },
        data: {
          razorpayCustomerId: customerId,
          razorpaySubscriptionId: subscription.id,
          subscriptionStatus: SubscriptionStatus.ACTIVE, // Track subscription status
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          shortUrl: subscription.short_url // Payment link the user can be redirected to
        }
      });
    } catch (razorpayError) {
      console.error('Razorpay API error:', razorpayError);
      return NextResponse.json(
        { error: 'Failed to create subscription', details: razorpayError },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}