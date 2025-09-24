const axios = require('axios');

async function finalPostmanVerification() {
  console.log('🎯 Final Postman Verification\n');
  
  const config = {
    method: 'POST',
    url: 'https://nextivaapp.vercel.app/api/auth/validate',
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      username: 'demo@thrio.com',
      password: 'demo123'
    }
  };
  
  console.log('📤 Request Configuration:');
  console.log('Method:', config.method);
  console.log('URL:', config.url);
  console.log('Headers:', config.headers);
  console.log('Body:', JSON.stringify(config.data, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');
  
  try {
    const response = await axios(config);
    
    console.log('✅ SUCCESS! API is working perfectly.');
    console.log('Status Code:', response.status);
    console.log('\n📋 Response Summary:');
    console.log('- Auth Mode:', response.data.authMode);
    console.log('- Is Demo:', response.data.isDemo);
    console.log('- Message:', response.data.message);
    console.log('- Token Generated:', !!response.data.user.thrioToken);
    console.log('\n🎉 Your Postman setup should work with these exact settings!');
    
  } catch (error) {
    console.log('❌ Request failed:');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

finalPostmanVerification();