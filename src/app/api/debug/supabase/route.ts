import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test simple query to orders table
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(3);
    
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
      ordersFound: data?.length || 0,
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