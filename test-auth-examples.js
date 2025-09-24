const axios = require('axios');

async function testAuthExamples() {
  console.log('🎯 Nextiva Production Authentication Examples');
  console.log('============================================');
  
  const endpoint = 'https://nextivaapp.vercel.app/api/auth/validate';
  
  // Example 1: Basic Authentication Format
  console.log('\n📋 Example 1: Basic Authentication Request');
  console.log('Method: POST');
  console.log('URL:', endpoint);
  console.log('Headers: {"Content-Type": "application/json"}');
  console.log('Body:');
  console.log(JSON.stringify({
    username: "your-thrio-username",
    password: "your-thrio-password"
  }, null, 2));
  
  // Example 2: GoHighLevel Integration Format
  console.log('\n📋 Example 2: GoHighLevel Integration Request');
  console.log('Method: POST');
  console.log('URL:', endpoint);
  console.log('Headers: {"Content-Type": "application/json"}');
  console.log('Body:');
  console.log(JSON.stringify({
    username: "any-username",
    password: "any-password", 
    apiKey: "your-ghl-api-key",
    locationId: "your-ghl-location-id"
  }, null, 2));
  
  // Expected Success Response
  console.log('\n✅ Expected Success Response (200):');
  console.log(JSON.stringify({
    success: true,
    message: "Authentication successful",
    user: {
      id: "user-id",
      username: "your-username",
      thrioToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      thrioUserId: "thrio-user-id"
    }
  }, null, 2));
  
  // Expected Error Response
  console.log('\n❌ Expected Error Response (401):');
  console.log(JSON.stringify({
    success: false,
    message: "Invalid credentials for Thrio API",
    error: "INVALID_THRIO_CREDENTIALS",
    details: "Unauthorized"
  }, null, 2));
  
  console.log('\n💡 Important Notes:');
  console.log('- Use real Thrio API credentials for production');
  console.log('- The demo credentials (demo@user.com/demo123) only work in local development');
  console.log('- Always send as JSON with Content-Type: application/json header');
  console.log('- Never use Postman\'s Basic Auth tab - use raw JSON body');
  console.log('- Store the returned thrioToken for subsequent API calls');
  
  // Test actual connection
  console.log('\n🔍 Testing Connection to Production Endpoint...');
  try {
    const response = await axios.get('https://nextivaapp.vercel.app/api/health', {
      timeout: 5000
    }).catch(() => null);
    
    if (response && response.status === 200) {
      console.log('✅ Production endpoint is reachable');
    } else {
      console.log('⚠️  Production endpoint status unclear');
    }
  } catch (error) {
    console.log('⚠️  Could not verify endpoint status');
  }
}

testAuthExamples();