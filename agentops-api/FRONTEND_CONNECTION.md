# Frontend Connection Guide

## ✅ Backend Status: RUNNING

**API Base URL:** `http://localhost:8000`

---

## Quick Test

```bash
# Test if backend is running
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","timestamp":"2025-11-02T22:03:30.837360","service":"agentops-api","version":"0.1.0"}
```

---

## Frontend Configuration

### Environment Variables for Frontend

Create or update your frontend `.env` file with:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000  # If using Vite
REACT_APP_API_URL=http://localhost:8000  # If using Create React App

# API Base URL (use this in your API client)
API_BASE_URL=http://localhost:8000
```

---

## Available Endpoints

### Public Endpoints (No Auth Required)

```bash
GET  /                    # API info
GET  /health              # Health check
GET  /docs                # Swagger UI
GET  /redoc               # ReDoc documentation
```

### Authentication Endpoints

```bash
POST /auth/register       # Register new user
POST /auth/login          # Login (get JWT token)
GET  /auth/me             # Get current user info (requires JWT)
POST /auth/api-keys       # Create API key (requires JWT)
GET  /auth/api-keys       # List API keys (requires JWT)
DELETE /auth/api-keys/{id} # Delete API key (requires JWT)
```

### Evaluation Endpoints (Require API Key)

```bash
POST /evaluations/        # Create evaluation
POST /evaluations/batch   # Create multiple evaluations
GET  /evaluations/        # List evaluations
GET  /evaluations/stats   # Get statistics
GET  /evaluations/{id}    # Get specific evaluation
DELETE /evaluations/{id}  # Delete evaluation
```

### API Keys Endpoints (Require JWT)

```bash
POST /api-keys/           # Create API key
GET  /api-keys/           # List API keys
DELETE /api-keys/{id}     # Delete API key
```

---

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (Next.js default)
- `http://localhost:8000` (Backend itself)

If your frontend runs on a different port, you'll need to update the `.env` file:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000
```

Then restart the backend.

---

## Testing the Connection from Frontend

### JavaScript/TypeScript Example

```typescript
// Test connection
const testConnection = async () => {
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    console.log('Backend connected:', data);
    return data.status === 'healthy';
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};

// Register a user
const registerUser = async (email: string, password: string, fullName: string) => {
  const response = await fetch('http://localhost:8000/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  return await response.json();
};

// Login
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  // Store the token
  localStorage.setItem('access_token', data.access_token);
  return data;
};

// Create API Key (requires JWT token)
const createApiKey = async (name: string, token: string) => {
  const response = await fetch('http://localhost:8000/auth/api-keys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create API key');
  }
  
  return await response.json();
};

// Get evaluation stats (requires API key)
const getStats = async (apiKey: string, days: number = 7) => {
  const response = await fetch(
    `http://localhost:8000/evaluations/stats?days=${days}`,
    {
      headers: {
        'X-API-Key': apiKey,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  
  return await response.json();
};
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

export const useBackendHealth = () => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        const data = await response.json();
        setIsHealthy(data.status === 'healthy');
      } catch (error) {
        console.error('Health check failed:', error);
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return { isHealthy, loading };
};
```

---

## Authentication Flow

### 1. Register a User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123",
    "full_name": "Test User"
  }'
```

**Response:**
```json
{
  "id": "uuid-here",
  "email": "test@example.com",
  "full_name": "Test User",
  "is_active": true,
  "created_at": "2025-11-02T22:00:00"
}
```

### 2. Login to Get JWT Token

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### 3. Create an API Key

```bash
curl -X POST http://localhost:8000/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Frontend App"
  }'
```

**Response:**
```json
{
  "id": "uuid-here",
  "name": "My Frontend App",
  "key": "agops_xxxxxxxxxxxxxxxxxxxxx",
  "is_active": true,
  "created_at": "2025-11-02T22:00:00"
}
```

⚠️ **Save this API key! It's only shown once.**

### 4. Use API Key for Evaluations

```bash
curl -X GET http://localhost:8000/evaluations/stats \
  -H "X-API-Key: agops_xxxxxxxxxxxxxxxxxxxxx"
```

---

## Troubleshooting

### Backend Not Responding

```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start it:
cd agentops-api
python main.py
```

### CORS Errors

If you see CORS errors in the browser console:

1. Check your frontend is running on an allowed origin
2. Update `ALLOWED_ORIGINS` in `.env`
3. Restart the backend

### Connection Refused

Make sure:
- Backend is running on port 8000
- No firewall blocking localhost connections
- Using `http://` not `https://` for local development

---

## Next Steps

1. **Start your frontend** (e.g., `npm run dev`)
2. **Test the connection** using the health check endpoint
3. **Implement authentication** flow in your frontend
4. **Create API keys** for your users
5. **Start sending evaluations** to track metrics

---

## API Documentation

For complete API documentation with interactive testing:

**Swagger UI:** http://localhost:8000/docs
**ReDoc:** http://localhost:8000/redoc

---

**Status: ✅ READY FOR FRONTEND INTEGRATION**

The backend is running and ready to accept connections from your frontend!

