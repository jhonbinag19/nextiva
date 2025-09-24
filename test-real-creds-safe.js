const axios = require('axios');

// Secure credential testing - no logging of sensitive data
async function testCredentialsSecurely() {
  console.log('🔐 Testing Credentials Securely');
  console.log('================================');
  
  const endpoint = 'https://nextivaapp.vercel.app/api/auth/validate';
  
  // Credentials from user input
  const credentials = {
    username: 'nextiva+wisechoiceremodeling@wisechoiceremodel.com',
    password: 'GHLwiseChoiceAPI2025!!'
  };
  
  console.log('📍 Endpoint:', endpoint);
  console.log('👤 Username:', credentials.username);
  console.log('🔒 Password: [HIDDEN FOR SECURITY]');
  console.log('');
  
  try {
    console.log('🔄 Sending authentication request...');
    
    const response = await axios.post(endpoint, credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    // Success - but don't log the full token
    console.log('✅ SUCCESS! Authentication worked');
    console.log('📊 Status:', response.status);
    console.log('🎯 Message:', response.data.message);
    
    if (response.data.success && response.data.user?.thrioToken) {
      console.log('🔑 Token obtained: [TOKEN RECEIVED - LENGTH:', response.data.user.thrioToken.length, 'chars]');
      console.log('👤 User ID:', response.data.user.id);
      console.log('📧 Username:', response.data.user.username);
      
      // Test if token works for a simple API call
      console.log('\n🧪 Testing token with a simple API call...');
      try {
        const testResponse = await axios.get('https://nextivaapp.vercel.app/api/leads?page=1&limit=1', {
          headers: {
            'Authorization': response.data.user.thrioToken,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log('✅ Token validation successful!');
        console.log('📊 API Response Status:', testResponse.status);
        
        if (testResponse.data && testResponse.data.data) {
          console.log('📋 Sample data received:', testResponse.data.data.length, 'items');
        }
        
      } catch (apiError) {
        console.log('⚠️  Token validation failed:', apiError.response?.status || apiError.message);
      }
      
      console.log('\n💡 Credentials are VALID and working!');
      console.log('🔐 You can now use these credentials for API calls');
      
    } else {
      console.log('⚠️  Authentication succeeded but no token received');
    }
    
  } catch (error) {
    console.log('❌ Authentication failed');
    console.log('📊 Status:', error.response?.status || 'Network Error');
    console.log('📝 Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔒 Invalid credentials - check username/password');
    } else if (error.response?.status === 404) {
      console.log('❌ Endpoint not found');
    } else {
      console.log('⚠️  Other error occurred');
    }
    
    // Don't log full error details for security
    console.log('\n💡 Suggestions:');
    console.log('- Verify credentials are correct');
    console.log('- Check if account is active');
    console.log('- Ensure proper API permissions');
  }
}

// Run the secure test
testCredentialsSecurely().catch(console.error);