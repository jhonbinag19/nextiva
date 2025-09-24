#!/usr/bin/env node

/**
 * Test script for GoHighLevel credential fetching and authentication
 * This script tests the new authentication flow that fetches credentials from GoHighLevel
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Test scenarios
const testScenarios = [
  {
    name: 'Health Check',
    endpoint: '/api/health',
    method: 'GET',
    data: null,
    expectedStatus: 200
  },
  {
    name: 'Authentication with demo credentials (no GHL fetch)',
    endpoint: '/auth/validate',
    method: 'POST',
    data: {
      username: 'nextiva+wisechoiceremodeling@wisechoiceremodel.com',
      password: 'GHLwiseChoiceAPI2025!!'
    },
    expectedStatus: 200
  },
  {
    name: 'Authentication with dynamic credentials (simulating GHL fetch)',
    endpoint: '/auth/validate',
    method: 'POST',
    data: {
      username: 'nextiva+wisechoiceremodeling@wisechoiceremodel.com',
      password: 'GHLwiseChoiceAPI2025!!',
      apiKey: 'test-api-key',
      locationId: 'test-location-id'
    },
    expectedStatus: 200
  },
  {
    name: 'Authentication with invalid credentials',
    endpoint: '/auth/validate',
    method: 'POST',
    data: {
      username: 'invalid@user.com',
      password: 'wrongpassword'
    },
    expectedStatus: 401
  },
  {
    name: 'Authentication with missing credentials',
    endpoint: '/auth/validate',
    method: 'POST',
    data: {
      username: 'test@user.com'
      // missing password
    },
    expectedStatus: 400
  }
];

async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📍 Endpoint: ${testCase.method} ${testCase.endpoint}`);
  
  try {
    const config = {
      method: testCase.method,
      url: `${API_BASE_URL}${testCase.endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };
    
    if (testCase.data) {
      config.data = testCase.data;
    }
    
    console.log(`📤 Request data:`, JSON.stringify(testCase.data, null, 2));
    
    const response = await axios(config);
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📥 Response:`, JSON.stringify(response.data, null, 2));
    
    if (response.status === testCase.expectedStatus) {
      console.log(`✅ Test passed!`);
      return { success: true, testCase, response: response.data };
    } else {
      console.log(`❌ Test failed! Expected status ${testCase.expectedStatus}, got ${response.status}`);
      return { success: false, testCase, error: `Unexpected status: ${response.status}` };
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ Status: ${error.response.status}`);
      console.log(`📥 Error response:`, JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === testCase.expectedStatus) {
        console.log(`✅ Test passed! Expected error status received.`);
        return { success: true, testCase, response: error.response.data };
      } else {
        console.log(`❌ Test failed! Expected status ${testCase.expectedStatus}, got ${error.response.status}`);
        return { success: false, testCase, error: `Unexpected error status: ${error.response.status}` };
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`❌ Connection refused. Is the server running?`);
      return { success: false, testCase, error: 'Connection refused' };
    } else {
      console.log(`❌ Request failed:`, error.message);
      return { success: false, testCase, error: error.message };
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting GoHighLevel Authentication Tests');
  console.log(`🎯 API Base URL: ${API_BASE_URL}`);
  console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const testCase of testScenarios) {
    const result = await runTest(testCase);
    results.push(result);
    
    // Small delay between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(50));
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const testName = result.testCase.name;
    console.log(`${index + 1}. ${status} - ${testName}`);
    
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log(`📈 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The GoHighLevel credential fetching is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
  
  // Additional analysis
  console.log('\n🔍 Analysis:');
  const demoTest = results.find(r => r.testCase.name.includes('demo credentials'));
  const dynamicTest = results.find(r => r.testCase.name.includes('dynamic credentials'));
  
  if (demoTest && demoTest.success) {
    console.log('✅ Demo authentication works correctly');
  }
  
  if (dynamicTest && dynamicTest.success) {
    console.log('✅ Dynamic credential fetching (simulating GoHighLevel) works correctly');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. Test with real GoHighLevel API credentials');
  console.log('2. Set up custom fields in GoHighLevel to store Thrio credentials');
  console.log('3. Configure proper credential storage in GoHighLevel location settings');
  console.log('4. Test the complete marketplace app installation flow');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testScenarios };