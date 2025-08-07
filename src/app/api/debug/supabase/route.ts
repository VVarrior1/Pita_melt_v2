import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test simple query to orders table
    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }
    
    console.log('Supabase connection successful, data:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      totalOrders: count,
      sampleData: data
    });
    
  } catch (error) {
    console.error('Connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}