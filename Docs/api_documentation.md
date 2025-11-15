
# CV Generator API Documentation

**Base URL**: `http://localhost:3000/api/v1`  
**Version**: 1.0.0

## Table of Contents
- [Authentication](#authentication)
- [Auth Endpoints](#auth-endpoints)
- [User Endpoints](#user-endpoints)
- [Document Endpoints](#document-endpoints)
- [Error Handling](#error-handling)

---

## Authentication

Most endpoints require authentication using JWT Bearer tokens.

**Header Format**:
```

Authorization: Bearer YOUR_ACCESS_TOKEN

```

**Token Expiration**:
- Access Token: 30 minutes
- Refresh Token: 7 days

---

## Auth Endpoints

### Register User

Creates a new user account.

**Endpoint**: `POST /auth/register`  
**Authentication**: Not required

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | String | Yes | Valid email address |
| username | String | Yes | 3-64 characters |
| password | String | Yes | Minimum 8 characters |
| password_confirm | String | Yes | Must match password |

**Example Request**:
```

{
"email": "user@example.com",
"username": "johndoe",
"password": "securePassword123",
"password_confirm": "securePassword123"
}

```

**Success Response**: `201 Created`
```

{
"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"token_type": "bearer",
"user": {
"id": 1,
"email": "user@example.com",
"username": "johndoe",
"role": "user",
"created_at": "2025-11-15T01:41:49.153Z",
"has_gemini_api_key": false
}
}

```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `409 Conflict`: Email or username already exists

---

### Login

Authenticates an existing user.

**Endpoint**: `POST /auth/login`  
**Authentication**: Not required

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | String | Yes | User's email |
| password | String | Yes | User's password |

**Example Request**:
```

{
"email": "user@example.com",
"password": "securePassword123"
}

```

**Success Response**: `200 OK`
```

{
"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"token_type": "bearer",
"user": {
"id": 1,
"email": "user@example.com",
"username": "johndoe",
"role": "user",
"created_at": "2025-11-15T01:41:49.153Z",
"has_gemini_api_key": true
}
}

```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Incorrect email or password

---

### Refresh Token

Generates a new access token using a refresh token.

**Endpoint**: `POST /auth/refresh`  
**Authentication**: Not required

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| refresh_token | String | Yes | Valid refresh token |

**Example Request**:
```

{
"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

```

**Success Response**: `200 OK`
```

{
"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"token_type": "bearer"
}

```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token

---

## User Endpoints

### Get Current User

Retrieves the authenticated user's profile.

**Endpoint**: `GET /users/me`  
**Authentication**: Required

**Success Response**: `200 OK`
```

{
"id": 1,
"email": "user@example.com",
"username": "johndoe",
"role": "user",
"created_at": "2025-11-15T01:41:49.153Z",
"has_gemini_api_key": true
}

```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token

---

### Update User Profile

Updates the authenticated user's profile information.

**Endpoint**: `PUT /users/me`  
**Authentication**: Required

**Request Body** (all fields optional):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | String | No | 3-64 characters |
| email | String | No | Valid email address |

**Example Request**:
```

{
"username": "newusername",
"email": "newemail@example.com"
}

```

**Success Response**: `200 OK`
```

{
"id": 1,
"email": "newemail@example.com",
"username": "newusername",
"role": "user",
"created_at": "2025-11-15T01:41:49.153Z",
"has_gemini_api_key": true
}

```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Invalid or missing token

---

### Set Gemini API Key

Stores or updates the user's Gemini API key (required for AI document generation).

**Endpoint**: `POST /users/me/gemini-api-key`  
**Authentication**: Required

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| api_key | String | Yes | Minimum 10 characters |

**Example Request**:
```

{
"api_key": "AIzaSyD7DOCtULRfCyMv3UxuXUCX35as-jS6e_o"
}

```

**Success Response**: `204 No Content`

**Error Responses**:
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Invalid or missing token

---

### Delete Gemini API Key

Removes the stored Gemini API key.

**Endpoint**: `DELETE /users/me/gemini-api-key`  
**Authentication**: Required

**Success Response**: `204 No Content`

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token

---

## Document Endpoints

### Create Document

Creates a new document with AI-generated content.

**Endpoint**: `POST /documents`  
**Authentication**: Required  
**Note**: Requires a Gemini API key to be set

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| doc_type | String | Yes | "cv" or "cover_letter" |
| title | String | Yes | 1-200 characters |
| template_code | String | Yes | Template identifier |
| user_data | Object | Yes | User information for generation |

**Example Request (CV)**:
```

{
"doc_type": "cv",
"title": "My Software Engineer CV",
"template_code": "modern",
"user_data": {
"name": "John Doe",
"email": "john@example.com",
"phone": "+1234567890",
"location": "New York, USA",
"title": "Software Engineer",
"summary": "Passionate developer with 3 years experience",
"experience": [
{
"company": "Tech Company",
"position": "Software Engineer",
"startDate": "01/2022",
"endDate": "Present",
"description": "Developed web applications using Node.js and React"
}
],
"education": [
{
"institution": "University of Technology",
"degree": "Bachelor of Science",
"field": "Computer Science",
"startDate": "09/2018",
"endDate": "06/2022"
}
],
"skills": ["JavaScript", "Node.js", "React", "PostgreSQL", "MongoDB"]
}
}

```

**Success Response**: `201 Created`
```

{
"id": 1,
"user_id": 1,
"doc_type": "cv",
"title": "My Software Engineer CV",
"slug": "my-software-engineer-cv",
"mongo_document_id": "507f1f77bcf86cd799439011",
"current_version": 1,
"created_at": "2025-11-15T02:30:00.000Z",
"updated_at": "2025-11-15T02:30:00.000Z",
"content": {
"profile": {
"name": "John Doe",
"title": "Software Engineer",
"summary": "..."
},
"contact": {
"email": "john@example.com",
"phone": "+1234567890",
"location": "New York, USA"
},
"experience": [...],
"education": [...],
"skills": [...]
}
}

```

**Error Responses**:
- `400 Bad Request`: Validation failed or Gemini API key not set
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: AI generation failed

---

### Get All Documents

Retrieves all documents for the authenticated user.

**Endpoint**: `GET /documents`  
**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| doc_type | String | No | Filter by "cv" or "cover_letter" |

**Example Requests**:
```

GET /documents
GET /documents?doc_type=cv
GET /documents?doc_type=cover_letter

```

**Success Response**: `200 OK`
```

[
{
"id": 1,
"user_id": 1,
"doc_type": "cv",
"title": "My Software Engineer CV",
"slug": "my-software-engineer-cv",
"current_version": 1,
"created_at": "2025-11-15T02:30:00.000Z",
"updated_at": "2025-11-15T02:30:00.000Z"
},
{
"id": 2,
"user_id": 1,
"doc_type": "cover_letter",
"title": "Cover Letter for Tech Company",
"slug": "cover-letter-tech-company",
"current_version": 1,
"created_at": "2025-11-15T03:00:00.000Z",
"updated_at": "2025-11-15T03:00:00.000Z"
}
]

```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token

---

### Get Single Document

Retrieves detailed information for a specific document.

**Endpoint**: `GET /documents/:id`  
**Authentication**: Required

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Integer | Document ID |

**Example Request**:
```

GET /documents/1

```

**Success Response**: `200 OK`
```

{
"id": 1,
"user_id": 1,
"doc_type": "cv",
"title": "My Software Engineer CV",
"slug": "my-software-engineer-cv",
"mongo_document_id": "507f1f77bcf86cd799439011",
"current_version": 1,
"created_at": "2025-11-15T02:30:00.000Z",
"updated_at": "2025-11-15T02:30:00.000Z",
"content": {
"profile": {...},
"contact": {...},
"experience": [...],
"education": [...],
"skills": [...]
}
}

```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Document not found or doesn't belong to user

---

### Update Document

Updates an existing document.

**Endpoint**: `PUT /documents/:id`  
**Authentication**: Required

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Integer | Document ID |

**Request Body** (all fields optional):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | String | No | 1-200 characters |
| content_json | Object | No | Updated content |
| state | String | No | "draft" or "published" |

**Example Request**:
```

{
"title": "Updated CV Title",
"state": "published",
"content_json": {
"profile": {
"name": "John Doe",
"title": "Senior Software Engineer",
"summary": "Updated summary..."
}
}
}

```

**Success Response**: `200 OK`
```

{
"id": 1,
"user_id": 1,
"doc_type": "cv",
"title": "Updated CV Title",
"slug": "my-software-engineer-cv",
"current_version": 2,
"created_at": "2025-11-15T02:30:00.000Z",
"updated_at": "2025-11-15T03:45:00.000Z",
"content": {...}
}

```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Document not found or doesn't belong to user

---

### Delete Document

Permanently deletes a document and all its versions.

**Endpoint**: `DELETE /documents/:id`  
**Authentication**: Required

**URL Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Integer | Document ID |

**Example Request**:
```

DELETE /documents/1

```

**Success Response**: `204 No Content`

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Document not found or doesn't belong to user

---

### Generate Content Preview

Generates AI content without saving it to the database (useful for previews).

**Endpoint**: `POST /documents/generate-content`  
**Authentication**: Required  
**Note**: Requires a Gemini API key to be set

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_data | Object | Yes | User information |
| doc_type | String | Yes | "cv" or "cover_letter" |
| template_code | String | Yes | Template identifier |

**Example Request**:
```

{
"doc_type": "cover_letter",
"template_code": "professional",
"user_data": {
"name": "John Doe",
"company": "Tech Company",
"position": "Software Engineer",
"experience": "5 years in web development"
}
}

```

**Success Response**: `200 OK`
```

{
"content": {
"company": "Tech Company",
"position": "Software Engineer",
"opening": "...",
"body": "...",
"closing": "..."
}
}

```

**Error Responses**:
- `400 Bad Request`: Validation failed or Gemini API key not set
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: AI generation failed

---

## Error Handling

All errors follow a consistent format:

**Error Response Structure**:
```

{
"error": "Error message",
"details": [
{
"type": "field",
"msg": "Validation error message",
"path": "field_name",
"location": "body"
}
]
}

```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request succeeded, no response body |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required or failed |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server-side error |

---

## CORS Configuration

**Allowed Origins**:
- `http://localhost:3000`
- `http://localhost:5173`

**Credentials**: Enabled (cookies and authentication headers allowed)

---

## Rate Limiting

**Limit**: 100 requests per 15 minutes per IP address  
**Applies to**: All `/api/` endpoints

---

## Additional Notes

1. **Authentication**: Access tokens expire after 30 minutes. Use the refresh token endpoint to obtain a new access token.
2. **Gemini API Key**: Required for document creation and content generation. Store securely via the user endpoints.
3. **Document Versioning**: Updates create new versions automatically (stored in MongoDB).
4. **Slugs**: Auto-generated from document titles for URL-friendly identifiers.

---

## Support

For issues or questions, contact the backend team or check the project repository.
