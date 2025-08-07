import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment successful for session:', session.id);
        console.log('Session metadata:', session.metadata);
        console.log('Customer details:', session.customer_details);
        
        try {
          // Parse cart items from metadata
          const orderItems = JSON.parse(session.metadata?.orderItems || '[]');
          const pickupTime = session.metadata?.estimatedPickupTime || new Date().toISOString();
          
          console.log('Parsed order items:', orderItems);
          console.log('Pickup time:', pickupTime);
          
          // Create order in database
          const orderData = {
            stripe_session_id: session.id,
            customer_name: session.customer_details?.name || session.metadata?.customerName || '',
            customer_phone: session.customer_details?.phone || session.metadata?.customerPhone || '',
            pickup_time: new Date(pickupTime).toLocaleString(),
            total_amount: (session.amount_total || 0) / 100,
            status: 'confirmed' as const,
            payment_status: 'succeeded' as const,
            items: orderItems,
            special_instructions: null,
          };
          
          console.log('Order data to insert:', orderData);
          
          const { data, error } = await supabaseAdmin
            .from('orders')
            .insert(orderData)
            .select();
          
          if (error) {
            console.error('Error creating order:', error);
          } else {
            console.log('Order created successfully:', data);
          }
        } catch (error) {
          console.error('Error processing checkout session:', error);
        }
        
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}