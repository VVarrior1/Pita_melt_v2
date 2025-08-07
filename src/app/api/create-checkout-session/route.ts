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

    // Validate required fields
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: paymentMethod === 'paypal' ? ['paypal'] : ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        estimatedPickupTime: pickupTime.toISOString(),
        orderItems: JSON.stringify(items),
        restaurantName: 'Pita Melt',
        restaurantPhone: '(403) 293-5809',
        restaurantAddress: '7196 Temple Dr NE #22, Calgary, AB'
      },
      payment_intent_data: {
        metadata: {
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email,
          estimatedPickupTime: pickupTime.toISOString(),
        },
        description: `Pita Melt Order - ${items.length} item${items.length !== 1 ? 's' : ''} - Pickup at ${pickupTime.toLocaleTimeString()}`,
        receipt_email: customerInfo.email,
      },
      shipping_address_collection: {
        allowed_countries: ['CA'],
      },
      customer_update: {
        address: 'auto',
      },
    });

    // Log the order creation
    console.log('New checkout session created:', {
      sessionId: session.id,
      customerId,
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