# 🧪 Postman Authentication Testing Guide

## Endpoint Details
- **URL:** `https://nextivaapp.vercel.app/api/auth/validate`
- **Method:** `POST`
- **Content-Type:** `application/json`

## ✅ Correct Postman Configuration

### Step 1: Set Up the Request
1. Open Postman
2. Create a new POST request
3. Enter URL: `https://nextivaapp.vercel.app/api/auth/validate`
4. **Important:** Do NOT use Postman's "Authorization" tab - use raw JSON body

### Step 2: Set Headers
```
Content-Type: application/json
```

### Step 3: Set Request Body (Raw JSON)

#### Option A: Basic Authentication
```json
{
  "username": "your-thrio-username",
  "password": "your-thrio-password"
}
```

#### Option B: GoHighLevel Integration
```json
{
  "username": "any-username",
  "password": "any-password",
  "apiKey": "your-ghl-api-key",
  "locationId": "your-ghl-location-id"
}
```

## 🎯 Testing with Real Credentials

### For Production Testing:
Use your actual Thrio API credentials:
```json
{
  "username": "your-real-thrio-username",
  "password": "your-real-thrio-password"
}
```

### For Local Development:
Use demo credentials (only works locally):
```json
{
  "username": "demo@user.com",
  "password": "demo123"
}
```

## 📊 Expected Responses

### ✅ Success Response (200)
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

### ❌ Error Response (401)
```json
{
  "success": false,
  "message": "Invalid credentials for Thrio API",
  "error": "INVALID_THRIO_CREDENTIALS",
  "details": "Unauthorized"
}
```

## 🔑 Using the Token in Subsequent Requests

Once you get the token, use it in the Authorization header:
```
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

## ⚠️ Common Mistakes to Avoid

1. **Don't use Postman's Basic Auth tab** - Always use raw JSON body
2. **Don't forget Content-Type header** - Must be `application/json`
3. **Don't use demo credentials in production** - They only work locally
4. **Don't send empty body** - Must include username and password
5. **Don't use wrong endpoint** - Make sure it's `/api/auth/validate` (not `/api/auth/valid`)

## 🧪 Quick Test Script

Save this as a Postman pre-request script to verify your setup:
```javascript
console.log("Testing Nextiva Authentication");
console.log("URL:", pm.request.url.toString());
console.log("Method:", pm.request.method);
console.log("Headers:", pm.request.headers);
```