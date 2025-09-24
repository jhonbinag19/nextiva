const axios = require('axios');

// Test the Thrio authentication with the CORRECT endpoint
async function testThrioValidateEndpoint() {
  console.log('🔐 Testing Thrio Authentication with /api/auth/validate Endpoint');
  console.log('==========================================================');
  
  const endpoint = 'https://nextivaapp.vercel.app/api/auth/validate';
  
  // Your credentials - testing as external auth for GHL marketplace
  const credentials = {
    username: 'nextiva+wisechoiceremodeling@wisechoiceremodel.com',
    password: 'GHLwiseChoiceAPI2025!!',
    locationId: 'wise-choice-remodeling-location'
  };
  
  console.log('📍 Endpoint:', endpoint);
  console.log('👤 Username:', credentials.username);
  console.log('🔒 Password: [HIDDEN FOR SECURITY]');
  console.log('📍 Location ID:', credentials.locationId);
  console.log('');
  
  try {
    console.log('🔄 Sending Thrio authentication request...');
    
    const response = await axios.post(endpoint, credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ SUCCESS! Thrio authentication worked');
    console.log('📊 Status:', response.status);
    console.log('🎯 Message:', response.data.message);
    
    if (response.data.success && response.data.data) {
      console.log('\n📋 Authentication Details:');
      console.log('   - Authenticated:', response.data.data.authenticated);
      console.log('   - Thrio Authenticated:', response.data.data.user?.thrioAuthenticated);
      console.log('   - Username:', response.data.data.user?.username);
      console.log('   - Location ID:', response.data.data.user?.locationId);
      
      if (response.data.data.user?.thrioToken) {
        console.log('🔑 Thrio Token: [RECEIVED - LENGTH:', response.data.data.user.thrioToken.length, 'chars]');
        console.log('   - Token Type:', response.data.data.user?.tokenType);
        console.log('   - Expires In:', response.data.data.user?.expiresIn, 'seconds');
        console.log('   - Authorities:', response.data.data.user?.authorities);
        console.log('   - Scope:', response.data.data.user?.scope);
        
        // Test the token with a simple API call
        console.log('\n🧪 Testing Thrio token with API call...');
        try {
          const testResponse = await axios.get('https://nextivaapp.vercel.app/api/leads?page=1&limit=1', {
            headers: {
              'Authorization': `Bearer ${response.data.data.user.thrioToken}`,
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
          if (apiError.response?.data) {
            console.log('📝 Error details:', apiError.response.data.message || apiError.response.data);
          }
        }
        
      } else {
        console.log('⚠️  No Thrio token received');
      }
      
      console.log('\n💡 Your credentials are VALID for Thrio authentication!');
      console.log('🔐 You can now use this authentication flow for API calls');
      
    } else {
      console.log('⚠️  Authentication succeeded but no data received');
    }
    
  } catch (error) {
    console.log('❌ Thrio authentication failed');
    console.log('📊 Status:', error.response?.status || 'Network Error');
    console.log('📝 Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔒 Invalid credentials for Thrio API');
    } else if (error.response?.status === 404) {
      console.log('❌ Endpoint not found');
    } else if (error.response?.status === 500) {
      console.log('⚠️  Server error - check logs');
    } else {
      console.log('⚠️  Other error occurred');
    }
    
    if (error.response?.data) {
      console.log('\n📋 Error Details:');
      console.log('   - Error:', error.response.data.error);
      console.log('   - Details:', error.response.data.details);
      console.log('   - Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('- Verify credentials are correct for Thrio');
    console.log('- Check if account has API access');
    console.log('- Ensure location ID is valid');
    console.log('- Check server logs for more details');
  }
}

// Run the test
testThrioValidateEndpoint().catch(console.error);