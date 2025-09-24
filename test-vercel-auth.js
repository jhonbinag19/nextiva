#!/usr/bin/env node

/**
 * Vercel Smart Authentication Testing Script
 * Test the smart authentication system on Vercel deployment
 * 
 * Usage: node test-vercel-auth.js
 */

const https = require('https');

// Demo credentials that trigger hardcoded demo mode
const DEMO_CREDENTIALS = {
  username: 'nextiva+wisechoiceremodeling@wisechoiceremodel.com',
  password: 'GHLwiseChoiceAPI2025!!'
};

// Alternative demo credentials
const ALT_DEMO_CREDENTIALS = {
  username: 'demo@thrio.com',
  password: 'demo123'
};

// Vercel endpoint
const VERCEL_ENDPOINT = 'https://nextivaapp.vercel.app';

function makeRequest(path, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'nextivaapp.vercel.app',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testAuthentication(credentials, testName) {
  console.log(`\n🧪 Testing ${testName}...`);
  
  try {
    const response = await makeRequest('/api/auth/validate', 'POST', credentials);
    
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const authMode = response.data.authMode || response.data.metadata?.authenticationMode;
      const isDemo = response.data.isDemoToken || response.data.metadata?.isDemoToken;
      
      console.log(`   ✅ SUCCESS`);
      console.log(`   Auth Mode: ${authMode}`);
      console.log(`   Is Demo Token: ${isDemo}`);
      
      if (response.data.data?.user?.thrioToken) {
        console.log(`   Token Preview: ${response.data.data.user.thrioToken.substring(0, 30)}...`);
      }
      
      return {
        success: true,
        authMode,
        isDemo,
        token: response.data.data?.user?.thrioToken
      };
    } else {
      console.log(`   ❌ FAILED: ${response.statusCode}`);
      console.log(`   Response:`, response.data);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testHealthCheck() {
  console.log(`\n🏥 Testing Health Check...`);
  
  try {
    const response = await makeRequest('/api/health', 'GET');
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   ✅ Health check accessible`);
    return true;
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}`);
    return false;
  }
}

async function runVercelTests() {
  console.log('🚀 Vercel Smart Authentication Testing');
  console.log('=========================================');
  console.log(`Endpoint: ${VERCEL_ENDPOINT}`);
  
  // Test health check first
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Vercel endpoint is not accessible. Check deployment status.');
    return;
  }
  
  // Test demo credentials
  const demoResult = await testAuthentication(DEMO_CREDENTIALS, 'Demo Credentials (Your Credentials)');
  
  // Test alternative demo credentials
  const altDemoResult = await testAuthentication(ALT_DEMO_CREDENTIALS, 'Alternative Demo Credentials');
  
  console.log('\n📊 Test Summary');
  console.log('================');
  console.log(`Demo Credentials: ${demoResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Alt Demo Credentials: ${altDemoResult.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (demoResult.success) {
    console.log(`Demo Auth Mode: ${demoResult.authMode}`);
    console.log(`Demo Is Token: ${demoResult.isDemo}`);
  }
  
  console.log('\n💡 Next Steps:');
  console.log('- Import the Vercel Postman collection for more testing');
  console.log('- Test with your real Thrio credentials');
  console.log('- Use the demo token to test other API endpoints');
  console.log('- Check the full testing guide in VERCEL_TESTING_GUIDE.md');
}

// Run tests
runVercelTests().catch(console.error);