const axios = require('axios');

async function debugPostmanIssue() {
  console.log('🔍 Debugging Postman Issue...\n');
  
  try {
    console.log('📡 Making request to Vercel...');
    const response = await axios.post(
      'https://nextivaapp.vercel.app/api/auth/validate',
      {
        username: 'demo@thrio.com',
        password: 'demo123'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept any status code
        }
      }
    );
    
    console.log('✅ Request Successful!');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('\n📋 Full Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Request Failed!');
    console.log('Error Type:', error.name);
    console.log('Error Message:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received');
      console.log('Request:', error.request);
    } else {
      console.log('Request setup error:', error.message);
    }
  }
}

debugPostmanIssue();