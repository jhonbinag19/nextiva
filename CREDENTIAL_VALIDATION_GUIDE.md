# 🔐 Credential Validation Guide

## Test Results for Provided Credentials

**Username:** `nextiva+wisechoiceremodeling@wisechoiceremodel.com`
**Password:** `GHLwiseChoiceAPI2025!!`
**Status:** ❌ **Invalid for Thrio API**

## 🎯 Understanding the Authentication System

### How It Works
1. Your credentials are sent to the Nextiva API endpoint
2. The API forwards them to Thrio's authentication system
3. Thrio validates the credentials and returns a JWT token
4. The token is used for subsequent API calls

### Credential Requirements
- Must be valid Thrio CRM credentials
- Must have API access permissions
- Must be active and not expired/suspended

## 🔍 Testing Your Credentials

### Method 1: Using Our Test Script
```bash
node test-real-creds-safe.js
```

### Method 2: Using Postman
```http
POST https://nextivaapp.vercel.app/api/auth/validate
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

### Method 3: Using curl
```bash
curl -X POST https://nextivaapp.vercel.app/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-username",
    "password": "your-password"
  }'
```

## 📋 Common Credential Issues

### ❌ Invalid Credentials (401)
- **Cause:** Wrong username/password
- **Solution:** Verify credentials with your Thrio admin

### ❌ Account Not Found (404)
- **Cause:** User doesn't exist in Thrio system
- **Solution:** Create account or check spelling

### ❌ Account Suspended (403)
- **Cause:** Account is disabled or suspended
- **Solution:** Contact Thrio support to reactivate

### ❌ No API Access (403)
- **Cause:** Account lacks API permissions
- **Solution:** Request API access from Thrio admin

### ❌ Expired Password (401)
- **Cause:** Password has expired
- **Solution:** Reset password through Thrio portal

## 🔑 Getting Valid Credentials

### Option 1: Thrio Admin Portal
1. Log into your Thrio admin dashboard
2. Navigate to User Management
3. Create/find your user account
4. Ensure API access is enabled
5. Reset password if needed

### Option 2: Contact Thrio Support
- Email: support@thrio.com
- Provide your account details
- Request API access verification

### Option 3: GoHighLevel Integration
If you have GoHighLevel credentials, you can use:
```json
{
  "username": "any-username",
  "password": "any-password",
  "apiKey": "your-ghl-api-key",
  "locationId": "your-ghl-location-id"
}
```

## ✅ Validating Credentials

### Successful Response (200)
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": "user-id",
    "username": "your-username",
    "thrioToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "thrioUserId": "thrio-user-id"
  }
}
```

### Failed Response (401)
```json
{
  "success": false,
  "message": "Invalid credentials for Thrio API",
  "error": "INVALID_THRIO_CREDENTIALS",
  "details": "Unauthorized"
}
```

## 🛡️ Security Best Practices

1. **Never share credentials** in public forums or chats
2. **Use environment variables** for storing credentials
3. **Rotate passwords** regularly
4. **Enable 2FA** when available
5. **Use API keys** instead of passwords when possible

## 🚀 Next Steps

1. **Verify your Thrio account** exists and is active
2. **Check API permissions** with your admin
3. **Test with valid credentials** using our scripts
4. **Store credentials securely** in environment variables

## 📞 Need Help?

If you continue to have credential issues:
1. Contact your Thrio system administrator
2. Reach out to Thrio support
3. Verify account status and permissions
4. Check if API access is enabled for your account