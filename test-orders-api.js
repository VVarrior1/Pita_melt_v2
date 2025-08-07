// Quick test script to check the orders API
const testOrdersAPI = async () => {
  try {
    console.log('Testing orders API...');
    
    // Test local
    console.log('\n--- Testing LOCAL API ---');
    try {
      const localResponse = await fetch('http://localhost:3000/api/orders');
      const localData = await localResponse.json();
      console.log('Local API Status:', localResponse.status);
      console.log('Local API Response:', localData);
    } catch (error) {
      console.log('Local API Error:', error.message);
    }
    
    // Test production
    console.log('\n--- Testing PRODUCTION API ---');
    try {
      const prodResponse = await fetch('https://pita-melt-v2-tud6.vercel.app/api/orders');
      const prodData = await prodResponse.json();
      console.log('Production API Status:', prodResponse.status);
      console.log('Production API Response:', prodData);
    } catch (error) {
      console.log('Production API Error:', error.message);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the test
testOrdersAPI();