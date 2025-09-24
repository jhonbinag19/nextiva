# Vercel Smart Authentication Testing Guide

This guide explains how to test the smart authentication system on the Vercel deployment.

## ⚠️ IMPORTANT: Deployment Status

**Current Issue**: The Vercel deployment needs to be updated with the latest smart authentication fixes.

**Problem**: Demo credentials are currently failing with 401 errors because the production authentication logic hasn't been updated to handle demo credentials properly.

**Solution**: The deployment needs to be updated with the latest code changes that allow demo credentials to work in production mode.

## 🚀 Quick Start (Once Deployment is Updated)

**Vercel Endpoint:** `https://nextivaapp.vercel.app`

### Test Demo Credentials (Immediate After Update)
```bash
# Test with hardcoded demo credentials
curl -X POST https://nextivaapp.vercel.app/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nextiva+wisechoiceremodeling@wisechoiceremodel.com",
    "password": "GHLwiseChoiceAPI2025!!"
  }'
```

### Test Health Check
```bash
curl https://nextivaapp.vercel.app/api/health
```

## 📋 Test Script

Run the automated test script:
```bash
node test-vercel-auth.js
```

## 🔧 Testing with Demo Credentials

### Your Demo Credentials (Hardcoded)
```json
POST https://nextivaapp.vercel.app/api/auth/validate
Content-Type: application/json

{
  "username": "nextiva+wisechoiceremodeling@wisechoiceremodel.com",
  "password": "GHLwiseChoiceAPI2025!!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "authMode": "demo_hardcoded",
  "isDemo": true,
  "user": {
    "username": "nextiva+wisechoiceremodeling@wisechoiceremodel.com",
    "thrioToken": "demo-access-token-...",
    "authenticated": true
  },
  "metadata": {
    "authenticationMode": "demo_hardcoded",
    "isDemoToken": true
  }
}
```

### Alternative Demo Credentials
```json
POST https://nextivaapp.vercel.app/api/auth/validate
Content-Type: application/json

{
  "username": "demo@thrio.com",
  "password": "demo123"
}
```

**Expected Response:** Same as above, with `authMode: "demo_hardcoded"`

## 🔑 Testing with Real Credentials

Replace with your actual Thrio credentials:
```json
POST https://nextivaapp.vercel.app/api/auth/validate
Content-Type: application/json

{
  "username": "your_real_thrio_username",
  "password": "your_real_thrio_password"
}
```

**Expected Response (if credentials are valid):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "authMode": "real_api",
  "isDemo": false,
  "user": {
    "username": "your_real_thrio_username",
    "thrioToken": "real-access-token-...",
    "authenticated": true
  },
  "metadata": {
    "authenticationMode": "real_api",
    "isDemoToken": false
  }
}
```

**Expected Response (if credentials are invalid):**
```json
{
  "success": false,
  "message": "Invalid credentials for Thrio API",
  "error": "INVALID_THRIO_CREDENTIALS",
  "authMode": "real_api_only"
}
```

## 🧪 Testing Methods

### 1. cURL Commands

**Demo Credentials Test:**
```bash
curl -X POST https://nextivaapp.vercel.app/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nextiva+wisechoiceremodeling@wisechoiceremodel.com",
    "password": "GHLwiseChoiceAPI2025!!"
  }'
```

**Health Check:**
```bash
curl https://nextivaapp.vercel.app/api/health
```

### 2. Postman Testing

#### Manual Setup
1. Create a new POST request to `https://nextivaapp.vercel.app/api/auth/validate`
2. Set Headers:
   - `Content-Type: application/json`
3. Set Body (raw JSON):
   - Use demo credentials from above
4. Send request and check response

#### Environment Variables
Create a Postman environment with:
- `baseUrl`: `https://nextivaapp.vercel.app`
- `demo_username`: `nextiva+wisechoiceremodeling@wisechoiceremodel.com`
- `demo_password`: `GHLwiseChoiceAPI2025!!`
- `real_username`: `your_real_thrio_username`
- `real_password`: `your_real_thrio_password`

### 3. Vercel Postman Collection

Use the provided `Nextiva-Thrio-API-Vercel.postman_collection.json` file which includes:
- Pre-configured requests for all test scenarios
- Automated test scripts
- Environment variable setup
- Response validation

## 📊 Test Scenarios

1. **Demo Authentication**: Use hardcoded demo credentials
2. **Real Authentication**: Use valid Thrio API credentials
3. **Invalid Credentials**: Use incorrect credentials to test error handling
4. **Token Usage**: Test using generated tokens with other API endpoints
5. **Health Check**: Verify the deployment is accessible

## 🎯 Response Indicators

Look for these key indicators in responses:
- `authMode`: Shows which authentication mode was used
  - `demo_hardcoded`: Used built-in demo credentials
  - `real_api`: Successfully authenticated with real Thrio API
  - `demo_fallback`: Real API failed, fell back to demo mode
  - `real_api_only`: Production mode with real credentials only
- `isDemoToken`: Boolean indicating if this is a demo token
- `metadata.authenticationMode`: Additional confirmation of auth mode

## 🛠️ Troubleshooting

1. **401 Unauthorized**: 
   - Check if credentials are correct
   - Demo credentials should always work
   - Real credentials must be valid Thrio credentials

2. **404 Not Found**: 
   - Verify the endpoint URL is correct: `/api/auth/validate`
   - Check if deployment is successful

3. **500 Internal Server Error**: 
   - Check Vercel logs in dashboard
   - Verify environment variables are set

4. **CORS Issues**: 
   - Ensure proper headers are set
   - Check CORS configuration

## 🚀 Next Steps

After successful testing:
1. ✅ Demo credentials work (immediate)
2. ✅ Health check passes
3. 🔄 Test with your real Thrio credentials
4. 🔗 Use generated tokens to test other API endpoints
5. 📱 Integrate with your GoHighLevel marketplace app
6. 📊 Monitor authentication logs in production

## 📚 Additional Resources

- **Test Script**: `test-vercel-auth.js` - Automated testing
- **Postman Collection**: `Nextiva-Thrio-API-Vercel.postman_collection.json`
- **Full Documentation**: `THRIO_AUTH_README.md`
- **Local Testing**: `test-smart-auth-system.js` (for local development)

## 💡 Pro Tips

1. **Always test demo credentials first** - they should work immediately
2. **Use the test script** for quick validation
3. **Check authMode in responses** to understand what happened
4. **Use Postman collection** for comprehensive testing
5. **Monitor Vercel logs** for debugging production issues