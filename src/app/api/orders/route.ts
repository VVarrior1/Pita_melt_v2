import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    console.log('Raw orders from database:', orders?.length || 0, 'orders found');
    console.log('Sample raw order:', orders?.[0]);

    // Transform database format to TypeScript interface format
    const transformedOrders = (orders || []).map(order => ({
      id: order.id,
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        menuItem: {
          id: item.id,
          name: item.name,
          prices: item.price ? [{ price: item.price, size: 'Regular', label: `$${item.price}` }] : []
        },
        quantity: item.quantity || 1,
        selectedSize: { price: item.price || 0, size: 'Regular', label: `$${item.price || 0}` },
        customizations: item.customizations || {},
        totalPrice: item.price ? item.price * (item.quantity || 1) : 0,
        specialInstructions: item.specialInstructions || ''
      })),
      customerInfo: {
        name: order.customer_name || '',
        phone: order.customer_phone || ''
      },
      totalAmount: order.total_amount || 0,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentIntentId: order.stripe_session_id,
      estimatedPickupTime: order.pickup_time ? new Date(order.pickup_time) : new Date(),
      createdAt: order.created_at ? new Date(order.created_at) : new Date(),
      updatedAt: order.updated_at ? new Date(order.updated_at) : new Date()
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}