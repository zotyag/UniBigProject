# AI Chat API Documentation

**Version:** 1.0.0
**Base URL:** `http://localhost:3000/api/v1`
**Last Updated:** November 15, 2025

## Overview

The AI Chat API provides a conversational interface for building CVs through natural dialogue. Instead of filling forms, users chat with an AI assistant that extracts information, asks follow-up questions, and progressively builds a structured CV.[^1][^2]

### Key Features

- Natural language CV building through conversation
- Automatic data extraction from chat messages
- Progressive CV construction with real-time updates
- Session persistence for pause/resume functionality
- Professional content enhancement via Gemini AI
- Structured JSON output in standardized format

***

## Authentication

All endpoints require JWT authentication via Bearer token.[^2][^1]

**Header Format:**

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Getting an Access Token:**

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```


***

## Endpoints

### 1. Start Chat Session

Create a new conversational CV building session.

**Endpoint:** `POST /api/v1/chat/start`

**Request Body:**

```json
{
  "initial_message": "Hi! I am Sarah Johnson, a Senior Data Scientist",
  "doc_type": "cv"
}
```

**Parameters:**


| Field | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `initial_message` | string | Yes | User's first message to start the conversation |
| `doc_type` | enum | Yes | Document type: `"cv"` or `"cover_letter"` |

**Success Response (201 Created):**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Great to meet you, Sarah! I'd love to help you create your CV. Could you share your contact information - email, phone number, and location?",
  "cv_data": {
    "personal_info": {
      "full_name": "Sarah Johnson",
      "title": "Senior Data Scientist",
      "phone": "",
      "email": "",
      "linkedin": "",
      "website": "",
      "location": ""
    },
    "summary": "",
    "experience": [],
    "education": [],
    "skills": {
      "core_competencies": [],
      "software_proficiency": [],
      "language_fluency": [],
      "certifications": []
    },
    "key_projects_achievements": [],
    "awards_and_recognitions": []
  },
  "progress": 16,
  "is_complete": false
}
```

**Response Fields:**


| Field | Type | Description |
| :-- | :-- | :-- |
| `session_id` | string (UUID) | Unique session identifier for subsequent requests |
| `message` | string | AI's conversational response |
| `cv_data` | object | Current state of CV with extracted information |
| `progress` | integer | Completion percentage (0-100) |
| `is_complete` | boolean | Whether CV has all required sections |

**Error Responses:**

```json
// 400 Bad Request - API key not set
{
  "error": "Gemini API key not set. Please set your API key first."
}

// 401 Unauthorized - Invalid token
{
  "error": "Invalid or expired token"
}
```

**Example Usage:**

```javascript
const startChat = async () => {
  const response = await fetch('http://localhost:3000/api/v1/chat/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      initial_message: "I'm a software engineer with 5 years of experience",
      doc_type: "cv"
    })
  });
  
  const data = await response.json();
  console.log('Session ID:', data.session_id);
  console.log('AI Response:', data.message);
  console.log('Progress:', data.progress + '%');
};
```


***

### 2. Send Message

Continue the conversation by sending a new message.

**Endpoint:** `POST /api/v1/chat/message`

**Request Body:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "My email is sarah@datatech.com, phone is +1-555-9999, I'm in Boston, MA"
}
```

**Parameters:**


| Field | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `session_id` | string (UUID) | Yes | Session ID from start chat response |
| `message` | string | Yes | User's conversational message |

**Success Response (200 OK):**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Perfect! I have your contact details. Now let's talk about your work experience. Can you tell me about your current or most recent position?",
  "cv_data": {
    "personal_info": {
      "full_name": "Sarah Johnson",
      "title": "Senior Data Scientist",
      "phone": "+1-555-9999",
      "email": "sarah@datatech.com",
      "linkedin": "",
      "website": "",
      "location": "Boston, MA"
    },
    "summary": "",
    "experience": [],
    "education": [],
    "skills": {
      "core_competencies": [],
      "software_proficiency": [],
      "language_fluency": [],
      "certifications": []
    },
    "key_projects_achievements": [],
    "awards_and_recognitions": []
  },
  "progress": 33,
  "is_complete": false,
  "fields_collected": ["personal_info"],
  "missing_fields": ["summary", "experience", "education", "skills", "key_projects_achievements"]
}
```

**Additional Response Fields:**


| Field | Type | Description |
| :-- | :-- | :-- |
| `fields_collected` | array | List of completed CV sections |
| `missing_fields` | array | List of sections still needed |

**Error Responses:**

```json
// 404 Not Found - Invalid session
{
  "error": "Chat session not found or expired"
}
```

**Example Usage:**

```javascript
const sendMessage = async (sessionId, message) => {
  const response = await fetch('http://localhost:3000/api/v1/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      session_id: sessionId,
      message: message
    })
  });
  
  const data = await response.json();
  
  // Display AI's response
  console.log('AI:', data.message);
  
  // Update progress bar
  updateProgressBar(data.progress);
  
  // Update CV preview
  renderCVPreview(data.cv_data);
  
  return data;
};
```


***

### 3. Get Session Details

Retrieve complete session information including full conversation history.

**Endpoint:** `GET /api/v1/chat/session/:session_id`

**URL Parameters:**


| Parameter | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `session_id` | string (UUID) | Yes | Session identifier |

**Success Response (200 OK):**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "doc_type": "cv",
  "status": "active",
  "conversation_history": [
    {
      "role": "user",
      "parts": [{"text": "Hi! I am Sarah Johnson"}],
      "timestamp": "2025-11-15T20:58:14.954Z"
    },
    {
      "role": "model",
      "parts": [{"text": "Great to meet you, Sarah!..."}],
      "timestamp": "2025-11-15T20:58:15.120Z"
    }
  ],
  "current_cv_data": {
    "personal_info": { /* ... */ },
    "summary": "",
    "experience": [],
    "education": [],
    "skills": { /* ... */ },
    "key_projects_achievements": [],
    "awards_and_recognitions": []
  },
  "progress": 33,
  "fields_collected": ["personal_info"],
  "created_at": "2025-11-15T20:58:14.963Z",
  "updated_at": "2025-11-15T21:05:30.123Z"
}
```

**Response Fields:**


| Field | Type | Description |
| :-- | :-- | :-- |
| `status` | enum | Session status: `"active"` or `"completed"` |
| `conversation_history` | array | Full chat transcript with timestamps |
| `current_cv_data` | object | Current CV state with all extracted data |

**Example Usage:**

```javascript
const getSession = async (sessionId) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/chat/session/${sessionId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  const data = await response.json();
  
  // Render conversation history
  data.conversation_history.forEach(msg => {
    displayMessage(msg.role, msg.parts[^0].text);
  });
  
  // Show current CV state
  renderCVPreview(data.current_cv_data);
};
```


***

### 4. Get All User Sessions

List all active chat sessions for the authenticated user.

**Endpoint:** `GET /api/v1/chat/sessions`

**Success Response (200 OK):**

```json
{
  "sessions": [
    {
      "session_id": "550e8400-e29b-41d4-a716-446655440000",
      "doc_type": "cv",
      "status": "active",
      "progress": 67,
      "updated_at": "2025-11-15T21:05:30.123Z"
    },
    {
      "session_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "doc_type": "cover_letter",
      "status": "completed",
      "progress": 100,
      "updated_at": "2025-11-14T18:22:15.456Z"
    }
  ]
}
```

**Example Usage:**

```javascript
const listSessions = async () => {
  const response = await fetch('http://localhost:3000/api/v1/chat/sessions', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const data = await response.json();
  
  // Display session list
  data.sessions.forEach(session => {
    console.log(`${session.doc_type} - ${session.progress}% complete`);
  });
};
```


***

### 5. Finalize Session

Convert completed chat session into a permanent CV document.

**Endpoint:** `POST /api/v1/chat/session/:session_id/finalize`

**URL Parameters:**


| Parameter | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `session_id` | string (UUID) | Yes | Session to finalize |

**Request Body:**

```json
{
  "title": "Sarah Johnson - Data Scientist CV",
  "template_code": "professional"
}
```

**Parameters:**


| Field | Type | Required | Description |
| :-- | :-- | :-- | :-- |
| `title` | string | No | Document title (defaults to "My {doc_type}") |
| `template_code` | string | No | Template identifier (defaults to "default") |

**Success Response (200 OK):**

```json
{
  "message": "CV created successfully from chat session",
  "document": {
    "id": "3",
    "user_id": 1,
    "doc_type": "cv",
    "title": "Sarah Johnson - Data Scientist CV",
    "slug": "sarah-johnson-data-scientist-cv",
    "mongo_document_id": "6918f28da3b3a4a09026e30a",
    "current_version": 1,
    "created_at": "2025-11-15T21:37:18.370Z",
    "updated_at": "2025-11-15T21:37:18.370Z"
  },
  "cv_data": {
    "personal_info": { /* complete data */ },
    "summary": "Professional summary...",
    "experience": [ /* work history */ ],
    "education": [ /* degrees */ ],
    "skills": { /* skills breakdown */ },
    "key_projects_achievements": [ /* projects */ ],
    "awards_and_recognitions": [ /* awards */ ]
  }
}
```

**Example Usage:**

```javascript
const finalizeCV = async (sessionId) => {
  const response = await fetch(
    `http://localhost:3000/api/v1/chat/session/${sessionId}/finalize`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: "My Professional CV 2025",
        template_code: "modern"
      })
    }
  );
  
  const data = await response.json();
  
  // Redirect to document view
  window.location.href = `/documents/${data.document.id}`;
};
```


***

## Data Structures

### CV Data Object

The `cv_data` object follows this standardized structure:[^1]

```typescript
interface CVData {
  personal_info: {
    full_name: string;
    title: string;
    phone: string;
    email: string;
    linkedin: string;
    website: string;
    location: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    start_date: string;  // Format: MM/YYYY
    end_date: string;    // Format: MM/YYYY or "Present"
    description_bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    graduation_date: string;  // Format: MM/YYYY
    details: string;
  }>;
  skills: {
    core_competencies: string[];
    software_proficiency: string[];
    language_fluency: string[];
    certifications: string[];
  };
  key_projects_achievements: Array<{
    name: string;
    description: string;
    key_areas_used: string[];
  }>;
  awards_and_recognitions: string[];
}
```


***

## Implementation Guide

### Complete Flow Example

```javascript
class CVChatManager {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'http://localhost:3000/api/v1';
    this.sessionId = null;
  }
  
  async startChat(initialMessage) {
    const response = await fetch(`${this.baseURL}/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify({
        initial_message: initialMessage,
        doc_type: 'cv'
      })
    });
    
    const data = await response.json();
    this.sessionId = data.session_id;
    
    return data;
  }
  
  async sendMessage(message) {
    const response = await fetch(`${this.baseURL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      },
      body: JSON.stringify({
        session_id: this.sessionId,
        message: message
      })
    });
    
    return await response.json();
  }
  
  async finalize(title) {
    const response = await fetch(
      `${this.baseURL}/chat/session/${this.sessionId}/finalize`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({ title })
      }
    );
    
    return await response.json();
  }
}

// Usage
const chat = new CVChatManager(accessToken);

// Start conversation
const start = await chat.startChat("I'm a software engineer");
console.log(start.message);

// Continue chatting
const msg1 = await chat.sendMessage("My email is john@example.com");
console.log(msg1.message);

// Finalize when done
const doc = await chat.finalize("My Professional CV");
console.log('Document created:', doc.document.id);
```


***

## Best Practices

### 1. Handle Progress Updates

Update your UI in real-time as progress increases:[^2][^1]

```javascript
if (data.progress > previousProgress) {
  updateProgressBar(data.progress);
  showNotification(`CV ${data.progress}% complete!`);
}
```


### 2. Display Missing Fields

Guide users by showing what's still needed:

```javascript
if (data.missing_fields.length > 0) {
  displayMissingFields(data.missing_fields);
}
```


### 3. Preview CV in Real-Time

Update CV preview after each message:

```javascript
renderCVPreview(data.cv_data);
```


### 4. Save Session ID

Store session ID to allow users to resume later:

```javascript
localStorage.setItem('activeSessionId', data.session_id);
```


### 5. Handle Errors Gracefully

```javascript
try {
  const data = await sendMessage(sessionId, message);
} catch (error) {
  if (error.status === 404) {
    alert('Session expired. Please start a new conversation.');
  }
}
```


***

## Error Handling

| Status Code | Description | Action |
| :-- | :-- | :-- |
| 400 | Bad Request - Invalid input or missing API key | Check request body format and ensure API key is set |
| 401 | Unauthorized - Invalid/expired token | Refresh access token or re-login |
| 404 | Not Found - Invalid session ID | Start new session |
| 500 | Server Error - Gemini API or database issue | Retry request or contact support |


***

## Rate Limits

- **No explicit rate limits** on chat endpoints
- Gemini API has its own quotas (check Google Cloud Console)
- Sessions auto-expire after 7 days of inactivity

***
