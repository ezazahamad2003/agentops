# 🔐 Auth-Enabled AgentOps API Guide

Complete guide for using AgentOps with Supabase Auth.

## 🎯 Overview

The auth-enabled version adds:
- ✅ Email/password authentication
- ✅ JWT token verification
- ✅ Multi-user support
- ✅ Row Level Security (RLS)
- ✅ User dashboards

## 📋 Setup

### 1. Enable Supabase Auth

1. Go to your Supabase project
2. **Authentication → Settings**
3. Enable **Email provider**
4. Configure email templates (optional)

### 2. Run Auth Schema

```sql
-- In Supabase SQL Editor
-- Run: agentops-api/database/schema_auth.sql
```

This adds:
- `user_id` column to `agents` table
- Row Level Security policies
- User dashboard views

### 3. Update Environment Variables

```bash
# agentops-api/.env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key  # NEW!
ALLOWED_ORIGINS=*
```

### 4. Run Auth-Enabled API

```bash
cd agentops-api
pip install -r requirements-minimal.txt
python auth_main.py
```

## 🧪 Complete Workflow

### Step 1: Sign Up

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "full_name": "John Doe"
  }'
```

Response:
```json
{
  "message": "User created successfully. Check your email to confirm.",
  "user_id": "uuid-here",
  "email": "user@example.com",
  "access_token": "eyJhbGciOi..."
}
```

**💾 Save the access_token!**

### Step 2: Sign In (if needed)

```bash
curl -X POST http://localhost:8000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "refresh_token_here",
  "expires_in": 3600,
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  }
}
```

### Step 3: Register an Agent

```bash
curl -X POST http://localhost:8000/register \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my_qa_bot",
    "metadata": {"environment": "production"}
  }'
```

Response:
```json
{
  "message": "Agent 'my_qa_bot' created successfully",
  "agent_id": "agent-uuid",
  "api_key": "agentops_xxxxxxxxxxxxx",
  "user_id": "user-uuid"
}
```

**💾 Save the api_key for SDK usage!**

### Step 4: List Your Agents

```bash
curl http://localhost:8000/agents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 5: Send Metrics (Using API Key)

```bash
curl -X POST http://localhost:8000/metrics \
  -H "X-API-Key: agentops_xxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "prompt": "What is AI?",
    "response": "AI is artificial intelligence...",
    "semantic_drift": 0.1,
    "factual_support": 0.95,
    "uncertainty": 0.0,
    "hallucination_probability": 0.05,
    "hallucinated": false,
    "latency_sec": 0.5,
    "throughput_qps": 2.0
  }'
```

### Step 6: View Stats

```bash
curl http://localhost:8000/stats/YOUR_AGENT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 7: Dashboard

```bash
curl http://localhost:8000/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔐 Security Features

### Row Level Security (RLS)

Users can only:
- ✅ View their own agents
- ✅ Create agents for themselves
- ✅ See evaluations for their agents
- ✅ Manage their own API keys

### Token Types

| Token Type | Usage | Duration |
|------------|-------|----------|
| **JWT Access Token** | User authentication (register agents, view stats) | 1 hour |
| **API Key** | SDK metrics ingestion | No expiration |
| **Refresh Token** | Renew access token | 7 days (configurable) |

### Token Refresh

```bash
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

## 🧩 SDK Integration

Update your SDK to use authenticated API:

```python
from agentops import AgentOps
import requests

# 1. Sign in to get token
auth_response = requests.post(
    "https://your-api.com/auth/signin",
    json={"email": "user@example.com", "password": "pass"}
).json()

access_token = auth_response["access_token"]

# 2. Register agent
agent_response = requests.post(
    "https://your-api.com/register",
    headers={"Authorization": f"Bearer {access_token}"},
    json={"name": "production_bot"}
).json()

api_key = agent_response["api_key"]

# 3. Use SDK with API key (no JWT needed for metrics)
ops = AgentOps(
    api_key=api_key,
    api_url="https://your-api.com"
)

# Metrics are sent with API key, not JWT
result = ops.evaluate(
    prompt="What is AI?",
    response="AI is...",
    model_name="gpt-4o-mini"
)
```

## 📊 API Endpoints

### Auth Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/auth/signup` | No | Create new user |
| `POST` | `/auth/signin` | No | Login and get JWT |
| `GET` | `/auth/me` | JWT | Get current user info |

### Agent Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/register` | JWT | Register new agent |
| `GET` | `/agents` | JWT | List user's agents |

### Metrics Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/metrics` | API Key | Store evaluation metrics |
| `GET` | `/stats/{agent_id}` | JWT | Get agent statistics |
| `GET` | `/dashboard` | JWT | Get all agents' stats |

### Health

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/health` | No | Health check |

## 🎯 Migration from Minimal

### Option 1: Fresh Start

1. Deploy `auth_main.py` to new service
2. Users sign up and create agents
3. Point SDK to new URL

### Option 2: Migrate Existing Data

```sql
-- Create a default user for existing agents
INSERT INTO auth.users (email, encrypted_password)
VALUES ('system@agentops.com', crypt('default_password', gen_salt('bf')));

-- Link existing agents to default user
UPDATE agents 
SET user_id = (SELECT id FROM auth.users WHERE email = 'system@agentops.com')
WHERE user_id IS NULL;
```

## 🔄 Comparison

| Feature | `minimal_main.py` | `auth_main.py` |
|---------|-------------------|----------------|
| **Authentication** | None | Supabase Auth |
| **User Management** | No | Yes |
| **Multi-tenant** | No | Yes (RLS) |
| **Agent Registration** | Open | Requires login |
| **Metrics Ingestion** | API key only | API key only |
| **Dashboard** | Single agent | Per-user |
| **Security** | Basic | Enterprise-grade |

## 🚀 Deployment

Use the same deployment files with auth-enabled version:

```bash
# Update Dockerfile.production to use auth_main.py
# Change:
# CMD exec uvicorn minimal_main:app ...
# To:
# CMD exec uvicorn auth_main:app ...

cd agentops-api
export GCP_PROJECT_ID=your-project
export SUPABASE_URL=https://xxx.supabase.co
export SUPABASE_SERVICE_KEY=your_service_key
export SUPABASE_ANON_KEY=your_anon_key  # NEW!

./deploy.sh
```

## 🐛 Troubleshooting

### "Invalid or expired token"
- Check JWT hasn't expired (1 hour default)
- Use refresh token to get new access token
- Verify token format: `Bearer <token>`

### "Agent not found or access denied"
- Verify you own the agent
- Check agent_id is correct
- Ensure user_id is set on agent

### RLS Issues
- Service role key bypasses RLS (used by API)
- Anon key respects RLS (used for auth verification)
- Check policies are enabled

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://supabase.com/docs/guides/auth/jwts)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**🔐 Your API is now secure and multi-tenant ready!**

