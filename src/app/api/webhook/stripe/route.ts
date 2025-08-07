import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log('🚀 WEBHOOK CALLED!', new Date().toISOString());
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;
    
    console.log('📝 Webhook body length:', body.length);
    console.log('🔐 Signature present:', !!signature);
    console.log('🔑 Webhook secret configured:', !!webhookSecret);
    console.log('🔍 Webhook secret prefix:', webhookSecret ? webhookSecret.substring(0, 15) + '...' : 'NOT SET');
    console.log('🔍 Signature prefix:', signature ? signature.substring(0, 20) + '...' : 'NOT SET');

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ Webhook signature verified successfully');
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    console.log('🎯 Event type received:', event.type);
    console.log('🆔 Event ID:', event.id);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💰 CHECKOUT SESSION COMPLETED!');
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💳 Payment successful for session:', session.id);
        console.log('📋 Session metadata:', session.metadata);
        console.log('👤 Customer details:', session.customer_details);
        
        try {
          // Parse cart items from metadata
          const orderItems = JSON.parse(session.metadata?.orderItems || '[]');
          const pickupTime = session.metadata?.estimatedPickupTime || new Date().toISOString();
          
          console.log('Parsed order items:', orderItems);
          console.log('Pickup time:', pickupTime);
          
          // Create order in database
          const orderData = {
            stripe_session_id: session.id,
            customer_email: session.customer_details?.email || session.metadata?.customerEmail || 'no-email@provided.com',
            customer_name: session.customer_details?.name || session.metadata?.customerName || '',
            customer_phone: session.customer_details?.phone || session.metadata?.customerPhone || '',
            pickup_time: new Date(pickupTime).toISOString(),
            total_amount: (session.amount_total || 0) / 100,
            status: 'confirmed' as const,
            payment_status: 'succeeded' as const,
            items: orderItems,
            special_instructions: null,
          };
          
          console.log('💾 Order data to insert:', JSON.stringify(orderData, null, 2));
          console.log('🔄 Attempting to save to Supabase...');
          
          const { data, error } = await supabaseAdmin
            .from('orders')
            .insert(orderData)
            .select();
          
          if (error) {
            console.error('❌ ERROR creating order:', error);
            console.error('📋 Error details:', JSON.stringify(error, null, 2));
            console.error('🚨 Order data that failed:', JSON.stringify(orderData, null, 2));
          } else {
            console.log('✅ ORDER CREATED SUCCESSFULLY!');
            console.log('📋 Created order data:', JSON.stringify(data, null, 2));
            console.log('🆔 Order ID:', data?.[0]?.id);
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
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('💥 WEBHOOK CRITICAL ERROR:', error);
    console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    );
  }
}