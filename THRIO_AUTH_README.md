# Thrio Authentication Flow

This document explains how the authentication system works for the Nextiva-GHL integration, where GoHighLevel (GHL) serves as a username/password repository for authenticating with Thrio APIs.

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
├── System validates credentials with Thrio
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

- `validateExternalAuth()`: Handles GHL marketplace authentication requests
- `authenticateWithThrio()`: Authenticates with Thrio token endpoint

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
  "data": {
    "authenticated": true,
    "user": {
      "username": "thrio_username",
      "locationId": "ghl_location_id",
      "thrioToken": "access_token_here",
      "tokenType": "Bearer",
      "expiresIn": 3600,
      "authorities": ["ROLE_USER", "ROLE_ADMIN"],
      "scope": "read write"
    }
  }
}
```

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

Use the provided test script to verify Thrio authentication:

```bash
node test-thrio-auth.js
```

## Security Considerations

1. **Credential Storage**: In production, encrypt stored credentials
2. **Token Expiration**: Implement proper token lifecycle management
3. **Rate Limiting**: Implement rate limiting for authentication attempts
4. **Audit Logging**: Log all authentication attempts and token refreshes
5. **Environment Isolation**: Use separate credentials per GHL location

## Error Handling

Common authentication errors:

- `INVALID_THRIO_CREDENTIALS`: Invalid username/password
- `SERVICE_UNAVAILABLE`: Thrio authentication service down
- `NO_ACCESS_TOKEN`: Thrio response missing access token
- `AUTHENTICATION_FAILED`: General authentication failure

## Integration with GHL

The system integrates with GHL marketplace by:

1. Responding to GHL's external authentication validation requests
2. Providing authentication status and token information
3. Maintaining per-location authentication state
4. Supporting GHL's multi-location architecture