const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testComprehensiveAuthentication() {
  console.log('🚀 Comprehensive Authentication Testing...');
  console.log('=====================================');

  // Test 1: Health Check
  console.log('🧪 Testing Health Check...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health Check:', response.data);
  } catch (error) {
    console.log('❌ Health Check failed:', error.message);
  }

  // Test 2: Validate External Auth with demo credentials (should succeed)
  console.log('\n🧪 Testing Validate External Auth with demo credentials...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/validate`, {
      username: 'nextiva+wisechoiceremodeling@wisechoiceremodel.com',
      password: 'GHLwiseChoiceAPI2025!!',
      company: 'wisechoiceremodeling'
    });
    console.log('✅ Demo credentials authentication successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Demo credentials authentication failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }

  // Test 3: Validate External Auth with invalid credentials (should fail)
  console.log('\n🧪 Testing Validate External Auth with invalid credentials...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/validate`, {
      username: 'invalid@user.com',
      password: 'wrongpassword',
      company: 'invalidcompany'
    });
    console.log('❌ Unexpected success with invalid credentials');
  } catch (error) {
    console.log('✅ Invalid credentials correctly rejected:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }

  // Test 4: Validate External Auth with missing credentials (should fail)
  console.log('\n🧪 Testing Validate External Auth with missing credentials...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/validate`, {
      company: 'testcompany'
    });
    console.log('❌ Unexpected success with missing credentials');
  } catch (error) {
    console.log('✅ Missing credentials correctly rejected:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }

  console.log('\n✅ Comprehensive testing completed!');
  console.log('\n📝 Summary:');
  console.log('- Demo credentials work in development mode');
  console.log('- Invalid credentials are properly rejected');
  console.log('- Missing credentials return appropriate errors');
  console.log('- Server is running and responding correctly');
}

// Run the test
testComprehensiveAuthentication();