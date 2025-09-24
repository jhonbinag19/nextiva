const axios = require('axios');

async function testPostmanSetup() {
  console.log('🧪 Testing Postman Setup...\n');
  
  const testCases = [
    {
      name: 'Demo Credentials (Your Credentials)',
      data: {
        username: 'nextiva+wisechoiceremodeling@wisechoiceremodel.com',
        password: 'GHLwiseChoiceAPI2025!!'
      }
    },
    {
      name: 'Alternative Demo Credentials',
      data: {
        username: 'demo@thrio.com',
        password: 'demo123'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    try {
      const response = await axios.post(
        'https://nextivaapp.vercel.app/api/auth/validate',
        testCase.data,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ SUCCESS');
      console.log('   Status:', response.status);
      console.log('   Auth Mode:', response.data.authMode);
      console.log('   Is Demo:', response.data.isDemoToken);
      console.log('   Token:', response.data.data.user.thrioToken.substring(0, 50) + '...');
      console.log('');
      
    } catch (error) {
      console.log('❌ FAILED');
      console.log('   Error:', error.response?.status || error.message);
      console.log('   Details:', error.response?.data?.message || error.message);
      console.log('');
    }
  }
}

testPostmanSetup();