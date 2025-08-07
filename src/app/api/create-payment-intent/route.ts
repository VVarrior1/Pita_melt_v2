import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CustomerInfo } from '@/types/menu';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

interface PaymentIntentRequest {
  amount: number; // in cents
  customerInfo: CustomerInfo;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    customizations: Record<string, string | string[]>;
    specialInstructions?: string;
  }>;
  estimatedPickupMinutes: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentIntentRequest = await request.json();
    const { amount, customerInfo, items, estimatedPickupMinutes } = body;

    // Validate required fields
    if (!amount || amount < 50) { // Stripe minimum is $0.50
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!customerInfo.email || !customerInfo.phone || !customerInfo.firstName || !customerInfo.lastName) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    // Calculate estimated pickup time
    const pickupTime = new Date();
    pickupTime.setMinutes(pickupTime.getMinutes() + estimatedPickupMinutes);

    // Create or retrieve customer
    const customers = await stripe.customers.list({
      email: customerInfo.email,
      limit: 1
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      
      // Update customer information
      await stripe.customers.update(customerId, {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone,
        metadata: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName
        }
      });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: customerInfo.email,
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone,
        metadata: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName
        }
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'cad',
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        estimatedPickupTime: pickupTime.toISOString(),
        orderItems: JSON.stringify(items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations,
          specialInstructions: item.specialInstructions
        }))),
        restaurantName: 'Pita Melt',
        restaurantPhone: '(403) 293-5809',
        restaurantAddress: '7196 Temple Dr NE #22, Calgary, AB'
      },
      description: `Pita Melt Order - ${items.length} item${items.length !== 1 ? 's' : ''} - Pickup at ${pickupTime.toLocaleTimeString()}`,
      receipt_email: customerInfo.email,
      shipping: {
        address: {
          line1: '7196 Temple Dr NE #22',
          city: 'Calgary',
          state: 'AB',
          country: 'CA'
        },
        name: 'Pita Melt - Pickup'
      }
    });

    // Store order in database (we'll implement this with Supabase later)
    // For now, we'll just log the order
    console.log('New order created:', {
      paymentIntentId: paymentIntent.id,
      customerId,
      customerInfo,
      items,
      amount: amount / 100,
      estimatedPickupTime: pickupTime.toISOString()
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      estimatedPickupTime: pickupTime.toISOString()
    });

  } catch (error: unknown) {
    console.error('Payment intent creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create payment intent',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}