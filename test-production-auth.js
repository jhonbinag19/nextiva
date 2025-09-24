const axios = require('axios');

// Production endpoint
const PRODUCTION_URL = 'https://nextivaapp.vercel.app/api/auth/validate';

// Test configurations
const testConfigs = [
  {
    name: 'Demo Credentials (Production)',
    data: {
      username: 'demo@user.com',
      password: 'demo123'
    }
  },
  {
    name: 'Real Thrio Credentials Format',
    data: {
      username: 'your-thrio-username',
      password: 'your-thrio-password'
    }
  },
  {
    name: 'GoHighLevel Integration Format',
    data: {
      username: 'any-username',
      password: 'any-password',
      apiKey: 'your-ghl-api-key',
      locationId: 'your-ghl-location-id'
    }
  }
];

async function testAuthentication() {
  console.log('🚀 Testing Nextiva Production Authentication');
  console.log('==========================================');
  console.log('Endpoint:', PRODUCTION_URL);
  console.log('');

  for (const config of testConfigs) {
    console.log(`\n📋 Test: ${config.name}`);
    console.log('Request Body:', JSON.stringify(config.data, null, 2));
    
    try {
      const response = await axios.post(PRODUCTION_URL, config.data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ SUCCESS - Response Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success && response.data.user?.thrioToken) {
        console.log('🔑 Token obtained:', response.data.user.thrioToken.substring(0, 20) + '...');
      }
      
    } catch (error) {
      console.log('❌ ERROR - Status:', error.response?.status || 'Network Error');
      console.log('Error Message:', error.response?.data?.message || error.message);
      
      if (error.response?.data) {
        console.log('Error Details:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Run the test
testAuthentication().catch(console.error);