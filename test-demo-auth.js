const axios = require('axios');

async function testDemoAuthentication() {
  console.log('🧪 Testing Demo Authentication on Production');
  console.log('==========================================');
  
  const endpoint = 'https://nextivaapp.vercel.app/api/auth/validate';
  const demoCredentials = {
    username: 'demo@user.com',
    password: 'demo123'
  };
  
  console.log('Endpoint:', endpoint);
  console.log('Credentials:', demoCredentials);
  console.log('');
  
  try {
    console.log('📤 Sending POST request...');
    const response = await axios.post(endpoint, demoCredentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('');
    
    if (response.data.success) {
      console.log('🔐 Authentication Successful!');
      console.log('Token:', response.data.user.thrioToken);
      console.log('');
      console.log('📋 Full Response:');
      console.log(JSON.stringify(response.data, null, 2));
      
      // Show how to use the token in subsequent requests
      console.log('\n📝 How to use this token in other requests:');
      console.log('Headers: {');
      console.log('  "Authorization": "' + response.data.user.thrioToken + '"');
      console.log('  "Content-Type": "application/json"');
      console.log('}');
      
    } else {
      console.log('⚠️  Authentication failed:', response.data.message);
    }
    
  } catch (error) {
    console.log('❌ ERROR');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.log('Full Error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testDemoAuthentication();