import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CustomerInfo } from '@/types/menu';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
});

interface CheckoutSessionRequest {
  customerInfo: CustomerInfo;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    customizations: Record<string, string | string[]>;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  estimatedPickupMinutes: number;
  paymentMethod?: 'card' | 'paypal';
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutSessionRequest = await request.json();
    const { customerInfo, items, totalAmount, estimatedPickupMinutes, paymentMethod = 'card' } = body;

    // Validate required fields - only name is required now
    if (!customerInfo.name || !customerInfo.name.trim()) {
      return NextResponse.json(
        { error: 'Customer name is required' },
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

    // Create Stripe line items
    const lineItems = items.map(item => {
      // Calculate unit price (totalPrice already includes quantity, so divide by quantity)
      const unitPrice = item.price / item.quantity;
      let description = `Unit price: $${unitPrice.toFixed(2)}`;
      
      // Add customizations to description
      if (Object.keys(item.customizations).length > 0) {
        const customizationText = Object.entries(item.customizations)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(', ');
        description += ` | ${customizationText}`;
      }
      
      // Add special instructions
      if (item.specialInstructions) {
        description += ` | Note: ${item.specialInstructions}`;
      }

      return {
        price_data: {
          currency: 'cad',
          product_data: {
            name: item.name,
            description: description,
          },
          unit_amount: Math.round(unitPrice * 100), // Convert unit price to cents
        },
        quantity: item.quantity,
      };
    });


    // Create checkout session
    const sessionData: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: paymentMethod === 'paypal' ? ['paypal'] : ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone || '',
        estimatedPickupTime: pickupTime.toISOString(),
        orderItems: JSON.stringify(items),
        restaurantName: 'Pita Melt',
        restaurantPhone: '(403) 293-5809',
        restaurantAddress: '7196 Temple Dr NE #22, Calgary, AB'
      },
      payment_intent_data: {
        metadata: {
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone || '',
            estimatedPickupTime: pickupTime.toISOString(),
        },
        description: `Pita Melt Order - ${items.length} item${items.length !== 1 ? 's' : ''} - Pickup at ${pickupTime.toLocaleTimeString()}`,
      },
      shipping_address_collection: {
        allowed_countries: ['CA'],
      },
    };


    const session = await stripe.checkout.sessions.create(sessionData);

    // Log the order creation
    console.log('New checkout session created:', {
      sessionId: session.id,
      customerInfo,
      items,
      totalAmount,
      estimatedPickupTime: pickupTime.toISOString()
    });

    return NextResponse.json({
      sessionId: session.id,
      estimatedPickupTime: pickupTime.toISOString()
    });

  } catch (error: unknown) {
    console.error('Checkout session creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}