#!/usr/bin/env node

/**
 * Vercel Deployment Debug Script
 * Debug the smart authentication system on Vercel deployment
 */

const https = require('https');

// Test different credential combinations
const TEST_CASES = [
  {
    name: "Your Demo Credentials",
    credentials: {
      username: "nextiva+wisechoiceremodeling@wisechoiceremodel.com",
      password: "GHLwiseChoiceAPI2025!!"
    },
    expectedMode: "demo_hardcoded"
  },
  {
    name: "Alternative Demo Credentials",
    credentials: {
      username: "demo@thrio.com",
      password: "demo123"
    },
    expectedMode: "demo_hardcoded"
  },
  {
    name: "Invalid Credentials",
    credentials: {
      username: "invalid@user.com",
      password: "wrongpass"
    },
    expectedMode: "real_api_only"
  }
];

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

async function debugTest() {
  console.log('🔍 Vercel Smart Authentication Debug');
  console.log('=====================================');
  console.log('Testing deployment: https://nextivaapp.vercel.app');
  console.log('This will help identify the current behavior\n');

  // Test health check
  console.log('🏥 Testing Health Check...');
  try {
    const healthResponse = await makeRequest('/api/health', 'GET');
    console.log(`   Status: ${healthResponse.statusCode}`);
    console.log(`   ✅ Health check accessible\n`);
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}\n`);
    return;
  }

  // Test each case
  for (const testCase of TEST_CASES) {
    console.log(`🧪 Testing: ${testCase.name}`);
    console.log(`   Expected Mode: ${testCase.expectedMode}`);
    
    try {
      const response = await makeRequest('/api/auth/validate', 'POST', testCase.credentials);
      
      console.log(`   Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        const authMode = response.data.authMode || response.data.metadata?.authenticationMode;
        const isDemo = response.data.isDemo || response.data.metadata?.isDemoToken;
        
        console.log(`   ✅ SUCCESS`);
        console.log(`   Auth Mode: ${authMode}`);
        console.log(`   Is Demo: ${isDemo}`);
        
        if (authMode === testCase.expectedMode) {
          console.log(`   ✅ Expected mode matches!`);
        } else {
          console.log(`   ⚠️  Expected ${testCase.expectedMode}, got ${authMode}`);
        }
        
      } else if (response.statusCode === 401) {
        console.log(`   ❌ Authentication Failed`);
        console.log(`   Error: ${response.data.message || 'Unknown error'}`);
        console.log(`   Auth Mode: ${response.data.authMode || 'not provided'}`);
        
        if (testCase.expectedMode === 'demo_hardcoded') {
          console.log(`   ⚠️  Demo credentials should not fail with 401!`);
        }
      } else {
        console.log(`   ❌ Unexpected status: ${response.statusCode}`);
        console.log(`   Response:`, response.data);
      }
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🔍 Debug Summary:');
  console.log('================');
  console.log('If demo credentials are failing with 401, the deployment may need to be updated.');
  console.log('The smart authentication fix might not be deployed to Vercel yet.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Check if Vercel deployment is up-to-date');
  console.log('2. Verify the latest code is deployed');
  console.log('3. Check Vercel logs for errors');
  console.log('4. Consider redeploying with the latest changes');
}

// Run debug
debugTest().catch(console.error);