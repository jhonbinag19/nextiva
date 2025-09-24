# GoHighLevel Credential Storage Setup Guide

This guide explains how to set up GoHighLevel to securely store Thrio API credentials for the Nextiva marketplace app.

## Overview

The authentication system now supports fetching credentials dynamically from GoHighLevel location settings instead of using hardcoded environment variables. This provides better security and easier credential management.

## Setup Steps

### 1. GoHighLevel Custom Fields Configuration

You need to create custom fields in your GoHighLevel location to store the Thrio API credentials:

#### Option A: Location Custom Fields (Recommended)

1. **Navigate to Location Settings**:
   - Go to your GoHighLevel dashboard
   - Click on "Settings" → "Custom Fields"
   - Select "Location" tab

2. **Create Custom Fields**:
   - **Field 1**: `thrio_username` or `nextiva_username`
     - Type: Text
     - Label: "Thrio API Username"
     - Description: "Username for Thrio API authentication"
   
   - **Field 2**: `thrio_password` or `nextiva_password`
     - Type: Text (or Password if available)
     - Label: "Thrio API Password"
     - Description: "Password for Thrio API authentication"

3. **Set Values**:
   - Add your actual Thrio API credentials to these fields
   - Example values:
     - `thrio_username`: `your-thrio-username`
     - `thrio_password`: `your-thrio-password`

#### Option B: Contact Custom Fields (Alternative)

If location custom fields are not available, you can use contact custom fields:

1. **Create a Special Contact**:
   - Create a contact named "Thrio API Credentials" or "System Credentials"
   - Add custom fields to this contact

2. **Create Contact Custom Fields**:
   - `thrio_username` (Text field)
   - `thrio_password` (Text field)

3. **Tag the Contact**:
   - Add a tag like "thrio-credentials" or "system-credentials"
   - This helps identify the credential contact

### 2. API Key and Location ID

You'll need these values when calling the authentication endpoint:

- **API Key**: Your GoHighLevel API key (from Settings → API Keys)
- **Location ID**: Your GoHighLevel location ID (can be found in URL or settings)

### 3. Authentication Flow

#### Direct Authentication (Traditional)
```json
POST /api/auth/validate
{
  "username": "your-thrio-username",
  "password": "your-thrio-password"
}
```

#### GoHighLevel Credential Fetching (New)
```json
POST /api/auth/validate
{
  "username": "any-username",
  "password": "any-password",
  "apiKey": "your-ghl-api-key",
  "locationId": "your-ghl-location-id"
}
```

### 4. How It Works

1. **Credential Fetching Process**:
   - When `apiKey` and `locationId` are provided, the system fetches credentials from GoHighLevel
   - First checks location custom fields for `thrio_username` and `thrio_password`
   - Falls back to searching contacts with Thrio-related tags
   - Uses fetched credentials for Thrio API authentication

2. **Fallback Mechanism**:
   - If GoHighLevel fetch fails, uses provided username/password
   - If both fail, returns authentication error

3. **Demo Mode** (Development Only):
   - In development mode (`NODE_ENV=development`), specific demo credentials bypass Thrio API
   - Demo credentials: `nextiva+wisechoiceremodeling@wisechoiceremodel.com` / `GHLwiseChoiceAPI2025!!`

## Security Benefits

1. **No Hardcoded Credentials**: Credentials are not stored in environment variables or code
2. **Centralized Management**: All credentials managed through GoHighLevel interface
3. **Per-Location Credentials**: Each GoHighLevel location can have different credentials
4. **Easy Updates**: Change credentials in GoHighLevel without code changes
5. **Audit Trail**: GoHighLevel provides activity logs for credential changes

## Testing

### Test the Setup

1. **Health Check**:
   ```bash
   curl -X GET http://localhost:3000/api/health
   ```

2. **Direct Authentication**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/validate \
     -H "Content-Type: application/json" \
     -d '{"username": "demo@thrio.com", "password": "demo123"}'
   ```

3. **GoHighLevel Credential Fetching**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/validate \
     -H "Content-Type: application/json" \
     -d '{
       "username": "test@user.com",
       "password": "testpass",
       "apiKey": "your-api-key",
       "locationId": "your-location-id"
     }'
   ```

### Run Test Script
```bash
# Test comprehensive authentication scenarios
node test-comprehensive-auth.js

# Test GoHighLevel credential fetching
node test-gohighlevel-auth.js
```

## Troubleshooting

### Common Issues

1. **401 Authentication Failed**:
   - Check if credentials are correctly set in GoHighLevel custom fields
   - Verify API key and location ID are correct
   - Ensure custom field names match expected names (`thrio_username`, `thrio_password`)

2. **GoHighLevel API Errors**:
   - Verify API key has proper permissions
   - Check if location ID is correct
   - Ensure GoHighLevel API is accessible

3. **Credential Not Found**:
   - Check custom field names are correct
   - Verify credentials are set in the right location
   - Try using contact-based credentials as fallback

### Debug Mode

Enable debug logging to see detailed authentication flow:
```bash
# Set debug environment variable
export DEBUG=auth:*

# Run server
npm run dev
```

## Production Deployment

1. **Disable Demo Mode**: Set `NODE_ENV=production`
2. **Configure Real Credentials**: Set up actual Thrio API credentials in GoHighLevel
3. **Secure API Keys**: Use secure API keys with proper permissions
4. **Monitor Logs**: Set up proper logging and monitoring

## Support

For issues or questions:
- Check the test scripts for examples
- Review server logs for detailed error messages
- Verify GoHighLevel API key permissions
- Ensure custom fields are properly configured