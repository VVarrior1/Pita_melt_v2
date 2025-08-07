// Test webhook endpoint directly
const testWebhook = async () => {
  try {
    console.log('Testing webhook endpoint...');
    
    // Test with invalid signature first to see if webhook is reachable
    const response = await fetch('http://localhost:3000/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'invalid_signature'
      },
      body: JSON.stringify({
        id: 'evt_test',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {
              orderItems: JSON.stringify([{
                id: 'test-item',
                name: 'Test Item',
                price: 10.99,
                quantity: 1
              }]),
              customerName: 'Test Customer',
              customerPhone: '1234567890',
              estimatedPickupTime: new Date().toISOString()
            },
            customer_details: {
              name: 'Test Customer',
              phone: '1234567890'
            },
            amount_total: 1099
          }
        }
      })
    });
    
    console.log('Response status:', response.status);
    const result = await response.text();
    console.log('Response body:', result);
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testWebhook();