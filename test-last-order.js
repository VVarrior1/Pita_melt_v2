// Test with the exact order details from the failed webhook
const crypto = require('crypto');

const testLastOrder = async () => {
  try {
    console.log('Testing with last order details...');
    
    // Simulate the exact Stripe webhook payload that failed
    const webhookPayload = {
      id: 'evt_test_webhook',
      object: 'event',
      api_version: '2020-08-27',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'cs_test_a1jveCXZNpbC7mKB1b6pPAyqE7UCMZ8xYGiS7V92QmlNqbhOL62xxDzGSW',
          object: 'checkout.session',
          amount_total: 1050, // $10.50
          customer_details: {
            email: 'abduehabtahermm@gmail.com', // This was missing before!
            name: 'Abdelrahman Ehab Mohamed',
            phone: '+15878916940'
          },
          metadata: {
            orderItems: JSON.stringify([{
              id: 'beef-donair-M-sauce:garlic,hotsauce,tahini-',
              name: 'Beef Donair',
              quantity: 1,
              price: 10.5,
              customizations: {
                sauce: ['garlic', 'hotsauce', 'tahini']
              },
              specialInstructions: ''
            }]),
            customerName: 'Abdelrahman Ehab Mohamed',
            customerPhone: '+15878916940',
            estimatedPickupTime: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 minutes from now
          },
          payment_status: 'paid',
          status: 'complete'
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: 'req_test',
        idempotency_key: null
      },
      type: 'checkout.session.completed'
    };

    console.log('📋 Test payload created');
    console.log('💰 Amount:', webhookPayload.data.object.amount_total / 100);
    console.log('👤 Customer:', webhookPayload.data.object.customer_details.name);
    console.log('📧 Email:', webhookPayload.data.object.customer_details.email);
    console.log('📱 Phone:', webhookPayload.data.object.customer_details.phone);

    // Create a mock signature (this will fail signature verification, but we can see the data processing)
    const payload = JSON.stringify(webhookPayload);
    const signature = 'v1=' + crypto.createHmac('sha256', 'test_secret').update(payload).digest('hex');

    console.log('\n🔄 Sending test webhook to local endpoint...');
    
    const response = await fetch('http://localhost:3000/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': `t=${Math.floor(Date.now() / 1000)},${signature}`
      },
      body: payload
    });

    console.log('📊 Response status:', response.status);
    const result = await response.text();
    console.log('📄 Response:', result);

    // Also test production endpoint
    console.log('\n🌐 Testing production endpoint...');
    const prodResponse = await fetch('https://pita-melt-v2-tud6.vercel.app/api/webhook/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': `t=${Math.floor(Date.now() / 1000)},${signature}`
      },
      body: payload
    });

    console.log('📊 Production response status:', prodResponse.status);
    const prodResult = await prodResponse.text();
    console.log('📄 Production response:', prodResult);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

testLastOrder();