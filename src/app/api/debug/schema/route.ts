import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Checking table schema...');
    
    // Query the information_schema to see column constraints
    const { data, error } = await supabaseAdmin
      .rpc('get_table_info', { table_name: 'orders' })
      .single();
    
    if (error) {
      // Fallback: try to insert a minimal record to see what fails
      console.log('RPC failed, trying test insert...');
      
      const testData = {
        stripe_session_id: 'test_schema_check',
        customer_name: 'Test User',
        // Deliberately omitting optional fields to see what's required
        status: 'confirmed',
        payment_status: 'succeeded',
        total_amount: 1.00,
        items: []
      };
      
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('orders')
        .insert(testData)
        .select();
        
      if (insertError) {
        return NextResponse.json({
          success: false,
          method: 'test_insert',
          error: insertError.message,
          details: insertError,
          attempted_data: testData
        });
      }
      
      // Clean up test record
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('stripe_session_id', 'test_schema_check');
        
      return NextResponse.json({
        success: true,
        method: 'test_insert',
        message: 'Minimal data insert successful',
        inserted_data: insertData
      });
    }
    
    return NextResponse.json({
      success: true,
      method: 'rpc',
      schema_info: data
    });
    
  } catch (error) {
    console.error('Schema check failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}