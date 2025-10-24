# Nextiva API Endpoints Documentation

This document provides a comprehensive overview of all available API endpoints in the Nextiva application.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Health Check
```
GET /api/health
```
- **Description**: Check if the server is running
- **Access**: Public (no authentication required)
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Validate Authentication (GoHighLevel Marketplace)
```
POST /api/auth/validate
```
- **Description**: Validate credentials for GoHighLevel marketplace app installation
- **Access**: Public
- **Features**: Supports both direct credentials and GoHighLevel credential fetching
- **Request Body Options**:

**Option 1: Direct Credentials**
```json
{
  "username": "thrio-username",
  "password": "thrio-password"
}
```

**Option 2: GoHighLevel Credential Fetching**
```json
{
  "username": "any-username",
  "password": "any-password",
  "apiKey": "your-ghl-api-key",
  "locationId": "your-ghl-location-id"
}
```

- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "username": "thrio-username",
    "authenticated": true,
    "timestamp": "2025-01-01T12:00:00.000Z",
    "thrioAuthenticated": true,
    "thrioToken": "<thrio-access-token>",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "authorities": ["ROLE_USER", "ROLE_ADMIN"],
    "scope": "read write"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing credentials
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

### Verify Token
```
GET /api/auth/verify
```
- **Description**: Verify the current authentication token
- **Access**: Private (requires authentication)
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "username": "thrio-username",
    "authenticated": true
  }
}
```

### Refresh Token
```
POST /api/auth/refresh
```
- **Description**: Refresh an expired authentication token
- **Access**: Public
- **Request Body**:
```json
{
  "refreshToken": "<refresh-token>"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "token": "<new-jwt-token>",
  "expiresIn": 3600
}
```

### Authentication Health Check
```
GET /api/auth/health
```
- **Description**: Check authentication service health
- **Access**: Public
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "service": "authentication",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## 👥 Lead Management Endpoints

All lead endpoints require authentication.

### Get All Leads
```
GET /api/leads
```
- **Description**: Retrieve all leads
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters** (optional):
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 50)
  - `sort`: Sort field (default: createdAt)
  - `order`: Sort order (asc/desc, default: desc)
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "lead-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Company Name",
      "status": "new",
      "source": "website",
      "tags": ["tag1", "tag2"],
      "customFields": {},
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### Get Lead by ID
```
GET /api/leads/:id
```
- **Description**: Retrieve a specific lead by ID
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "lead-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Company Name",
    "status": "new",
    "source": "website",
    "tags": ["tag1", "tag2"],
    "customFields": {},
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### Create New Lead
```
POST /api/leads
```
- **Description**: Create a new lead
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Company Name",
  "status": "new",
  "source": "website",
  "tags": ["tag1", "tag2"],
  "customFields": {
    "customField1": "value1",
    "customField2": "value2"
  }
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "new-lead-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Company Name",
    "status": "new",
    "source": "website",
    "tags": ["tag1", "tag2"],
    "customFields": {},
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### Update Lead
```
PUT /api/leads/:id
```
- **Description**: Update an existing lead
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "phone": "+1234567890",
  "company": "New Company Name",
  "status": "qualified",
  "tags": ["qualified", "hot-lead"]
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "lead-id",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "phone": "+1234567890",
    "company": "New Company Name",
    "status": "qualified",
    "updatedAt": "2025-01-01T12:30:00.000Z"
  }
}
```

### Delete Lead
```
DELETE /api/leads/:id
```
- **Description**: Delete a lead
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

### Search Leads
```
POST /api/leads/search
```
- **Description**: Search leads by various criteria
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "email": "john@example.com",
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Company Name",
  "status": "new",
  "tags": ["tag1", "tag2"],
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  }
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "lead-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Company Name",
      "status": "new",
      "tags": ["tag1", "tag2"],
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Bulk Create Leads
```
POST /api/leads/bulk
```
- **Description**: Create multiple leads in one request
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "leads": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+0987654321"
    }
  ]
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": [
    {
      "id": "lead-id-1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "createdAt": "2025-01-01T12:00:00.000Z"
    },
    {
      "id": "lead-id-2",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "phone": "+0987654321",
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ],
  "created": 2,
  "failed": 0
}
```

### Bulk Update Leads
```
PUT /api/leads/bulk
```
- **Description**: Update multiple leads in one request
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "updates": [
    {
      "id": "lead-id-1",
      "status": "qualified",
      "tags": ["qualified"]
    },
    {
      "id": "lead-id-2",
      "status": "closed",
      "tags": ["closed-won"]
    }
  ]
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "lead-id-1",
      "status": "qualified",
      "updatedAt": "2025-01-01T12:30:00.000Z"
    },
    {
      "id": "lead-id-2",
      "status": "closed",
      "updatedAt": "2025-01-01T12:30:00.000Z"
    }
  ],
  "updated": 2,
  "failed": 0
}
```

---

## 📋 List Management Endpoints

All list endpoints require authentication.

### Get All Lists
```
GET /api/lists
```
- **Description**: Retrieve all lists
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "list-id",
      "name": "Hot Leads",
      "description": "High priority leads",
      "tags": ["hot", "priority"],
      "leadCount": 25,
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

### Get List by ID
```
GET /api/lists/:id
```
- **Description**: Retrieve a specific list by ID
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "list-id",
    "name": "Hot Leads",
    "description": "High priority leads",
    "tags": ["hot", "priority"],
    "leadCount": 25,
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### Create New List
```
POST /api/lists
```
- **Description**: Create a new list
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "name": "Hot Leads",
  "description": "High priority leads that need immediate attention",
  "tags": ["hot", "priority", "sales-ready"]
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "new-list-id",
    "name": "Hot Leads",
    "description": "High priority leads that need immediate attention",
    "tags": ["hot", "priority", "sales-ready"],
    "leadCount": 0,
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### Update List
```
PUT /api/lists/:id
```
- **Description**: Update an existing list
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "name": "Qualified Leads",
  "description": "Leads that have been qualified by sales team",
  "tags": ["qualified", "sales-ready", "follow-up"]
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "list-id",
    "name": "Qualified Leads",
    "description": "Leads that have been qualified by sales team",
    "tags": ["qualified", "sales-ready", "follow-up"],
    "updatedAt": "2025-01-01T12:30:00.000Z"
  }
}
```

### Delete List
```
DELETE /api/lists/:id
```
- **Description**: Delete a list
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "List deleted successfully"
}
```

### Get Leads in List
```
GET /api/lists/:id/leads
```
- **Description**: Get all leads in a specific list
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "lead-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Company Name",
      "status": "new",
      "addedAt": "2025-01-01T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Add Leads to List
```
POST /api/lists/:id/leads
```
- **Description**: Add leads to a list
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "leadIds": ["lead-id-1", "lead-id-2", "lead-id-3"]
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Leads added to list successfully",
  "added": 3,
  "failed": 0
}
```

### Remove Lead from List
```
DELETE /api/lists/:id/leads/:leadId
```
- **Description**: Remove a specific lead from a list
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Lead removed from list successfully"
}
```

### Sync List with GoHighLevel
```
POST /api/lists/:id/sync
```
- **Description**: Sync list and its leads with GoHighLevel (creates tags and contacts)
- **Access**: Private
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "List synced with GoHighLevel successfully",
  "synced": {
    "tags": 3,
    "contacts": 25,
    "updated": 5,
    "created": 20
  }
}
```

---

## 🧪 Testing Endpoints

The following test scripts are available to verify the API functionality:

1. **Basic Authentication Test**:
   ```bash
   node test-authentication.js
   ```

2. **Live Authentication Test**:
   ```bash
   node test-auth-live.js
   ```

3. **Comprehensive Authentication Test**:
   ```bash
   node test-comprehensive-auth.js
   ```

4. **GoHighLevel Authentication Test**:
   ```bash
   node test-gohighlevel-auth.js
   ```

5. **Thrio Authentication Test**:
   ```bash
   node test-thrio-auth.js
   ```

6. **Real Credentials Test**:
   ```bash
   node test-with-real-creds.js
   ```

---

## 📊 HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## 🔒 Security Notes

1. **Authentication**: Most endpoints require JWT token authentication
2. **Rate Limiting**: Implemented on all endpoints
3. **Input Validation**: All inputs are validated and sanitized
4. **Error Handling**: Consistent error responses with proper status codes
5. **Demo Mode**: Available in development environment for testing

---

## 🚀 Quick Start Examples

### 1. Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

### 2. Authenticate with Demo Credentials
```bash
curl -X POST http://localhost:3000/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nextiva+wisechoiceremodeling@wisechoiceremodel.com",
    "password": "GHLwiseChoiceAPI2025!!"
  }'
```

### 3. Get All Leads (Requires Auth)
```bash
curl -X GET http://localhost:3000/api/leads \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 4. Create a New Lead
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

### 5. Create a New List
```bash
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Hot Leads",
    "description": "High priority leads"
  }'
```