const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testWithRealCredentials() {
  console.log('🚀 Testing Authentication with Real Credentials...');
  console.log('=====================================');

  try {
    // Test the validate endpoint with real credentials
    console.log('🧪 Testing Validate External Auth with real credentials...');
    
    const response = await axios.post(`${API_BASE_URL}/auth/validate`, {
      username: 'nextiva+wisechoiceremodeling@wisechoiceremodel.com',
      password: 'GHLwiseChoiceAPI2025!!',
      company: 'wisechoiceremodeling'
    });

    console.log('✅ Authentication successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Authentication failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }

  console.log('\n✅ Testing completed!');
}

// Run the test
testWithRealCredentials();