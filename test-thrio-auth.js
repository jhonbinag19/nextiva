const axios = require('axios');

// Test script to verify Thrio authentication
const testThrioAuth = async () => {
  const config = {
    baseUrl: 'https://login.thrio.com',
    tokenEndpoint: '/provider/token-with-authorities'
  };
  
  const username = 'test_user'; // Replace with actual test credentials
  const password = 'test_password'; // Replace with actual test credentials
  
  try {
    console.log('Testing Thrio authentication...');
    console.log('Endpoint:', `${config.baseUrl}${config.tokenEndpoint}`);
    console.log('Username:', username);
    
    const response = await axios.post(
      `${config.baseUrl}${config.tokenEndpoint}`,
      {
        username: username,
        password: password,
        grant_type: 'password',
        client_id: 'thrio-client'
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ Authentication successful!');
    console.log('Response data:', response.data);
    
    if (response.data.access_token) {
      console.log('✅ Access token received:', response.data.access_token.substring(0, 20) + '...');
      console.log('Token type:', response.data.token_type);
      console.log('Expires in:', response.data.expires_in);
      console.log('Authorities:', response.data.authorities);
      console.log('Scope:', response.data.scope);
    }
    
  } catch (error) {
    console.error('❌ Authentication failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    console.error('Full error:', error);
  }
};

// Run the test
if (require.main === module) {
  testThrioAuth();
}

module.exports = { testThrioAuth };