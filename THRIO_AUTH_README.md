# Thrio Authentication Flow

This document explains how the authentication system works for the Nextiva-GHL integration, where GoHighLevel (GHL) serves as a username/password repository for authenticating with Thrio APIs.

## 🚀 Smart Authentication System

The system now includes **Smart Authentication** that automatically detects and handles both **demo** and **real** Thrio accounts, making testing and development much easier.

### Smart Authentication Features

- **Auto-Detection**: Automatically determines if credentials are demo or real
- **Clear Indicators**: Every response includes authentication mode indicators
- **Demo Mode**: Hardcoded demo credentials for development and testing
- **Real API Mode**: Authenticates against actual Thrio API when real credentials are used
- **Fallback Mode**: In development, unknown credentials fall back to demo mode

### Authentication Modes

1. **Real API Mode**: Attempts authentication against actual Thrio API
2. **Demo Hardcoded Mode**: Uses predefined demo credentials
3. **Demo Fallback Mode**: Falls back to demo mode in development environment

## Overview

The system implements a marketplace app installation flow where:
1. The app is installed on a GHL sub-location
2. During installation, GHL requests username/password credentials for Thrio authentication
3. These credentials are used to authenticate with Thrio's `token-with-authorities` endpoint
4. The obtained access token is stored and used for all subsequent API calls to Thrio
5. Token refresh is handled automatically when tokens expire

## Authentication Flow

### 1. Marketplace App Installation

When the app is installed via GHL marketplace:

```
GHL Marketplace App Installation
├── GHL requests credentials from user
├── GHL sends credentials to /api/auth/external/validate
├── System validates credentials with Thrio (Smart Auth)
│   ├── Attempts real Thrio API authentication
│   ├── Falls back to demo mode if needed
│   └── Returns clear authentication mode indicators
├── System stores credentials and tokens
└── System responds to GHL with authentication status
```

### 2. API Request Flow

For subsequent API requests:

```
Client Request
├── JWT token validation (authenticate middleware)
├── Extract stored Thrio credentials
├── Make API call to Thrio with access token
├── Handle token expiration (auto-refresh)
└── Return response to client
```

## Key Components

### Configuration (`src/config/config.js`)

```javascript
api: {
  thrio: {
    baseUrl: process.env.THRIO_BASE_URL || 'https://login.thrio.com',
    tokenEndpoint: process.env.THRIO_TOKEN_ENDPOINT || '/provider/token-with-authorities',
    timeout: parseInt(process.env.THRIO_TIMEOUT) || 30000
  }
}
```

### Authentication Controller (`src/controllers/authController.js`)

- `validateExternalAuth()`: Handles GHL marketplace authentication requests with smart detection
- `authenticateWithThrio()`: Authenticates with Thrio token endpoint (smart mode)
- `authenticateWithThrioRealAPI()`: Handles real Thrio API authentication

#### Smart Authentication Logic

The authentication controller now implements smart detection:

```javascript
// Smart authentication flow
1. Attempt real Thrio API authentication first
2. If real auth fails or credentials are demo credentials:
   └── Generate demo token with appropriate indicators
3. Return response with clear authentication mode indicators
```

#### Demo Credentials (Built-in)

For development and testing, these demo credentials are hardcoded:

- **Username**: `nextiva+wisechoiceremodeling@wisechoiceremodel.com`
- **Password**: `GHLwiseChoiceAPI2025!!`
- **Alternative Demo**: `demo@thrio.com` / `demo123`

These credentials will automatically trigger demo mode with full user/admin permissions.

### Nextiva CRM Service (`src/services/nextivaCrmService.js`)

- Uses stored Thrio access tokens for API calls
- Automatic token refresh on 401 errors
- Environment-based token management

## Environment Variables

```bash
# Thrio Authentication Configuration
THRIO_BASE_URL=https://login.thrio.com
THRIO_TOKEN_ENDPOINT=/provider/token-with-authorities
THRIO_USERNAME=your_username
THRIO_PASSWORD=your_password
THRIO_ACCESS_TOKEN=obtained_access_token
THRIO_REFRESH_TOKEN=obtained_refresh_token
```

## API Endpoints

### External Authentication Validation

**POST** `/api/auth/external/validate`

Request body:
```json
{
  "username": "thrio_username",
  "password": "thrio_password",
  "locationId": "ghl_location_id"
}
```

Response:
```json
{
  "success": true,
  "message": "Authentication successful",
  "authMode": "demo_hardcoded",        // Authentication mode indicator
  "isDemoToken": true,                 // Demo token indicator
  "data": {
    "authenticated": true,
    "user": {
      "username": "thrio_username",
      "locationId": "ghl_location_id",
      "thrioToken": "access_token_here",
      "tokenType": "Bearer",
      "expiresIn": 3600,
      "authorities": ["ROLE_USER", "ROLE_ADMIN"],
      "scope": "read write",
      "authenticationMode": "demo_hardcoded"  // Additional mode indicator
    }
  }
}
```

**Authentication Mode Indicators:**
- `authMode`: `"real_api"`, `"demo_hardcoded"`, or `"demo_fallback"`
- `isDemoToken`: `true` for demo tokens, `false` for real tokens
- `authenticationMode`: Additional indicator in user data

## Token Management

### Automatic Token Refresh

The system automatically handles token expiration:

1. When a 401 error is received from Thrio API
2. The system attempts to refresh the token using stored credentials
3. If successful, the original request is retried with the new token
4. If refresh fails, an authentication error is returned

### Token Storage

- Access tokens are stored in `process.env.THRIO_ACCESS_TOKEN`
- Refresh tokens are stored in `process.env.THRIO_REFRESH_TOKEN`
- Username/password are stored for re-authentication when needed

## Testing

### Smart Authentication Testing

The system now includes comprehensive testing for both demo and real authentication modes:

```bash
# Test smart authentication system
node test-smart-auth-system.js

# Test demo authentication specifically
node test-your-credentials-work.js

# Run comprehensive authentication tests
node demo-smart-auth.js
```

### Test Scenarios

1. **Demo Credentials**: Tests hardcoded demo credentials
2. **Real Credentials**: Tests real Thrio API authentication
3. **Fallback Mode**: Tests fallback to demo in development
4. **Invalid Credentials**: Tests error handling

### Postman Testing

Import the provided `Nextiva-Thrio-API.postman_collection.json` which includes:

- Smart authentication with demo credentials
- Real authentication testing
- Token validation tests
- API endpoint testing with both token types

## Security Considerations

1. **Credential Storage**: In production, encrypt stored credentials
2. **Token Expiration**: Implement proper token lifecycle management
3. **Rate Limiting**: Implement rate limiting for authentication attempts
4. **Audit Logging**: Log all authentication attempts and token refreshes
5. **Environment Isolation**: Use separate credentials per GHL location
6. **Demo Mode Security**: Demo credentials are development-only and should not be used in production

## Development vs Production

### Development Mode
- Demo credentials automatically trigger demo mode
- Unknown credentials fall back to demo mode
- Clear authentication mode indicators in responses
- Enhanced logging for debugging

### Production Mode
- Only real Thrio API authentication is attempted
- Demo credentials will fail authentication
- No fallback to demo mode
- Enhanced security measures

## Error Handling

Common authentication errors:

- `INVALID_THRIO_CREDENTIALS`: Invalid username/password
- `SERVICE_UNAVAILABLE`: Thrio authentication service down
- `NO_ACCESS_TOKEN`: Thrio response missing access token
- `AUTHENTICATION_FAILED`: General authentication failure
- `DEMO_MODE_ONLY`: Real authentication failed, falling back to demo (development only)

## Quick Start Guide

### For Testing (Demo Mode)

1. Use these credentials:
   - **Username**: `nextiva+wisechoiceremodeling@wisechoiceremodel.com`
   - **Password**: `GHLwiseChoiceAPI2025!!`

2. The system will automatically detect and use demo mode

3. Check the response for `authMode: "demo_hardcoded"` and `isDemoToken: true`

### For Real API Testing

1. Use your real Thrio credentials
2. The system will attempt real Thrio API authentication first
3. Check the response for `authMode: "real_api"` and `isDemoToken: false`

### Postman Integration

1. Import `Nextiva-Thrio-API.postman_collection.json`
2. Set environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `demo_username`: `nextiva+wisechoiceremodeling@wisechoiceremodel.com`
   - `demo_password`: `GHLwiseChoiceAPI2025!!`
3. Use the pre-configured requests for testing

## Integration with GHL

The system integrates with GHL marketplace by:

1. Responding to GHL's external authentication validation requests
2. Providing authentication status and token information
3. Maintaining per-location authentication state
4. Supporting GHL's multi-location architecture
5. **NEW**: Clear authentication mode indicators for easy testing

### Smart Authentication Benefits for GHL Integration

- **Easy Testing**: Demo credentials work immediately without real API setup
- **Clear Indicators**: Know exactly which authentication mode is active
- **Seamless Development**: No configuration needed for basic testing
- **Production Ready**: Real credentials automatically use real Thrio API