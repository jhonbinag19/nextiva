const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAuthentication() {
  console.log('🚀 Testing Authentication Endpoints...');
  console.log('=====================================');
  
  // Test 1: Health Check
  console.log('\n🧪 Testing Health Check...');
  try {
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
  
  // Test 2: Validate External Auth (without credentials)
  console.log('\n🧪 Testing Validate External Auth (no credentials)...');
  try {
    const validateResponse = await axios.post(`${API_BASE_URL}/auth/validate`, {});
    console.log('✅ Validate Response:', validateResponse.data);
  } catch (error) {
    console.log('❌ Validate Failed (expected):', error.response?.status, error.response?.data?.message);
  }
  
  // Test 3: Validate External Auth (with dummy credentials)
  console.log('\n🧪 Testing Validate External Auth (dummy credentials)...');
  try {
    const validateResponse = await axios.post(`${API_BASE_URL}/auth/validate`, {
      username: 'test_user',
      password: 'test_password'
    });
    console.log('✅ Validate Response:', validateResponse.data);
  } catch (error) {
    console.log('❌ Validate Failed:', error.response?.status, error.response?.data?.message);
    if (error.response?.data?.details) {
      console.log('   Details:', error.response.data.details);
    }
  }
  
  // Test 4: Refresh Token (without token)
  console.log('\n🧪 Testing Refresh Token (no token)...');
  try {
    const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {});
    console.log('✅ Refresh Response:', refreshResponse.data);
  } catch (error) {
    console.log('❌ Refresh Failed (expected):', error.response?.status, error.response?.data?.message);
  }
  
  console.log('\n✅ Authentication testing completed!');
}

testAuthentication().catch(console.error);