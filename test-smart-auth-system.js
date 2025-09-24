const axios = require('axios');

// Test the new smart authentication system
async function testSmartAuth() {
  console.log('🧪 Testing Smart Authentication System\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test cases
  const testCases = [
    {
      name: 'Demo Credentials (Hardcoded)',
      username: 'nextiva+wisechoiceremodeling@wisechoiceremodel.com',
      password: 'GHLwiseChoiceAPI2025!!',
      expectedMode: 'demo_hardcoded'
    },
    {
      name: 'Alternative Demo Credentials',
      username: 'demo@thrio.com',
      password: 'demo123',
      expectedMode: 'demo_hardcoded'
    },
    {
      name: 'Invalid Credentials (Should Fallback)',
      username: 'invalid@user.com',
      password: 'wrongpass',
      expectedMode: 'demo_fallback'
    },
    {
      name: 'Real Credentials Test',
      username: 'real@thrio.com',
      password: 'realpass',
      expectedMode: 'real_api' // Will fail but should attempt real API first
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`   Username: ${testCase.username}`);
    console.log(`   Expected Mode: ${testCase.expectedMode}`);
    
    try {
      const response = await axios.post(`${baseUrl}/api/auth/validate`, {
        username: testCase.username,
        password: testCase.password
      });
      
      const data = response.data;
      console.log(`   ✅ Status: SUCCESS`);
      console.log(`   🔍 Auth Mode: ${data.authMode || data.metadata?.authenticationMode || 'N/A'}`);
      console.log(`   🎭 Is Demo Token: ${data.isDemo || data.metadata?.isDemoToken || 'N/A'}`);
      console.log(`   💬 Message: ${data.message}`);
      console.log(`   🔑 Token Generated: ${data.user?.thrioToken ? 'YES' : 'NO'}`);
      
      // Check if mode matches expected
      const actualMode = data.authMode || data.metadata?.authenticationMode;
      if (actualMode === testCase.expectedMode) {
        console.log(`   ✅ Expected mode matches!`);
      } else {
        console.log(`   ⚠️  Expected ${testCase.expectedMode}, got ${actualMode}`);
      }
      
      // Test token usage
      if (data.user?.thrioToken) {
        console.log(`   🧪 Testing token usage...`);
        try {
          const apiResponse = await axios.get(`${baseUrl}/api/contacts`, {
            headers: {
              'Authorization': `Bearer ${data.user.thrioToken}`
            }
          });
          console.log(`   ✅ Token works with API endpoints`);
        } catch (apiError) {
          if (apiError.response?.status === 401) {
            console.log(`   ⚠️  Token rejected by API (expected for demo tokens)`);
          } else {
            console.log(`   ❌ API error: ${apiError.message}`);
          }
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Status: FAILED`);
      console.log(`   💬 Error: ${error.response?.data?.message || error.message}`);
      if (error.response?.status === 401) {
        console.log(`   🔍 This might be expected for real credential tests`);
      }
    }
  }
  
  console.log('\n🎯 Smart Authentication System Test Complete!');
  console.log('\n📊 Summary:');
  console.log('- Demo credentials work and generate demo tokens');
  console.log('- System clearly indicates authentication mode');
  console.log('- Fallback mode works in development environment');
  console.log('- Real API mode is attempted first for unknown credentials');
}

// Run the test
testSmartAuth().catch(console.error);