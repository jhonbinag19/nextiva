const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const THRIO_BASE_URL = 'https://login.thrio.com';
const THRIO_TOKEN_ENDPOINT = '/provider/token-with-authorities';

// Test credentials (you'll need to replace these with actual credentials)
const TEST_CREDENTIALS = {
  username: process.env.TEST_THRIO_USERNAME || 'your_username',
  password: process.env.TEST_THRIO_PASSWORD || 'your_password'
};

/**
 * Test direct Thrio authentication
 */
const testDirectThrioAuth = async () => {
  console.log('\n🧪 Testing Direct Thrio Authentication...');
  console.log('==========================================');
  
  try {
    console.log(`📡 Endpoint: ${THRIO_BASE_URL}${THRIO_TOKEN_ENDPOINT}`);
    console.log(`👤 Username: ${TEST_CREDENTIALS.username}`);
    
    const response = await axios.post(
      `${THRIO_BASE_URL}${THRIO_TOKEN_ENDPOINT}`,
      {
        username: TEST_CREDENTIALS.username,
        password: TEST_CREDENTIALS.password,
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
    
    console.log('✅ Direct Thrio Authentication Successful!');
    console.log('📋 Response Data:');
    console.log(`   - Access Token: ${response.data.access_token ? response.data.access_token.substring(0, 30) + '...' : 'Not found'}`);
    console.log(`   - Token Type: ${response.data.token_type || 'Not specified'}`);
    console.log(`   - Expires In: ${response.data.expires_in || 'Not specified'}`);
    console.log(`   - Authorities: ${JSON.stringify(response.data.authorities || [])}`);
    console.log(`   - Scope: ${response.data.scope || 'Not specified'}`);
    
    return {
      success: true,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      tokenType: response.data.token_type,
      expiresIn: response.data.expires_in
    };
    
  } catch (error) {
    console.error('❌ Direct Thrio Authentication Failed!');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('   No response received from server');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Test API authentication endpoint
 */
const testApiAuthEndpoint = async () => {
  console.log('\n🧪 Testing API Authentication Endpoint...');
  console.log('==========================================');
  
  try {
    console.log(`📡 Endpoint: ${API_BASE_URL}/auth/validate`);
    console.log(`👤 Username: ${TEST_CREDENTIALS.username}`);
    
    const response = await axios.post(
      `${API_BASE_URL}/auth/validate`,
      {
        username: TEST_CREDENTIALS.username,
        password: TEST_CREDENTIALS.password
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('✅ API Authentication Successful!');
    console.log('📋 Response Data:');
    console.log(`   - Success: ${response.data.success}`);
    console.log(`   - Message: ${response.data.message}`);
    console.log(`   - Username: ${response.data.user?.username}`);
    console.log(`   - Thrio Authenticated: ${response.data.user?.thrioAuthenticated}`);
    console.log(`   - Thrio Token: ${response.data.user?.thrioToken ? response.data.user.thrioToken.substring(0, 30) + '...' : 'Not found'}`);
    console.log(`   - Token Type: ${response.data.user?.tokenType}`);
    console.log(`   - Expires In: ${response.data.user?.expiresIn}`);
    
    return {
      success: true,
      user: response.data.user
    };
    
  } catch (error) {
    console.error('❌ API Authentication Failed!');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('   No response received from server');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Test API endpoints with Bearer token
 */
const testApiEndpointsWithToken = async (token) => {
  console.log('\n🧪 Testing API Endpoints with Bearer Token...');
  console.log('==============================================');
  
  const endpoints = [
    { method: 'GET', path: '/leads', description: 'Get all leads' },
    { method: 'GET', path: '/lists', description: 'Get all lists' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.method} ${endpoint.path}`);
      console.log(`   Description: ${endpoint.description}`);
      
      const response = await axios({
        method: endpoint.method,
        url: `${API_BASE_URL}${endpoint.path}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });
      
      console.log(`   ✅ Success! Status: ${response.status}`);
      console.log(`   📊 Data count: ${response.data.leads?.length || response.data.lists?.length || 'N/A'}`);
      
    } catch (error) {
      console.error(`   ❌ Failed!`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Message: ${error.response.data.message || error.response.data}`);
      } else {
        console.error(`   Error: ${error.message}`);
      }
    }
  }
};

/**
 * Test token refresh endpoint
 */
const testTokenRefresh = async () => {
  console.log('\n🧪 Testing Token Refresh Endpoint...');
  console.log('====================================');
  
  try {
    // First, let's get a refresh token by logging in
    console.log('📡 Getting initial tokens...');
    
    // This would normally be done through your login endpoint
    // For now, we'll simulate with a dummy refresh token
    const dummyRefreshToken = 'dummy_refresh_token_for_testing';
    
    console.log(`📡 Testing refresh with token: ${dummyRefreshToken.substring(0, 20)}...`);
    
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {
        refreshToken: dummyRefreshToken
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('✅ Token refresh test completed');
    console.log(`   Status: ${response.status}`);
    
  } catch (error) {
    console.error('❌ Token refresh test failed (expected with dummy token)');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   This is expected behavior with a dummy refresh token`);
    }
  }
};

/**
 * Main test runner
 */
const runAllTests = async () => {
  console.log('🚀 Starting Authentication Tests...');
  console.log('====================================');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Thrio Base URL: ${THRIO_BASE_URL}`);
  
  // Test 1: Direct Thrio authentication
  const directAuthResult = await testDirectThrioAuth();
  
  // Test 2: API authentication endpoint
  const apiAuthResult = await testApiAuthEndpoint();
  
  // Test 3: API endpoints with Bearer token (if we have a valid token)
  if (directAuthResult.success && directAuthResult.accessToken) {
    await testApiEndpointsWithToken(directAuthResult.accessToken);
  } else if (apiAuthResult.success && apiAuthResult.user?.thrioToken) {
    await testApiEndpointsWithToken(apiAuthResult.user.thrioToken);
  } else {
    console.log('\n⚠️  Skipping API endpoint tests - no valid token available');
    console.log('   To test API endpoints, provide valid Thrio credentials');
  }
  
  // Test 4: Token refresh
  await testTokenRefresh();
  
  console.log('\n✅ Authentication testing completed!');
  console.log('\n📋 Summary:');
  console.log(`   - Direct Thrio Auth: ${directAuthResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   - API Auth Endpoint: ${apiAuthResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!directAuthResult.success && !apiAuthResult.success) {
    console.log('\n💡 To run successful tests:');
    console.log('   1. Set TEST_THRIO_USERNAME and TEST_THRIO_PASSWORD environment variables');
    console.log('   2. Or modify the test credentials in this script');
    console.log('   3. Ensure your Thrio credentials are valid');
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };