# 🧪 Manual Auth Testing Guide

Step-by-step guide to test auth flow manually.

## Prerequisites

1. **Supabase Project** with Auth enabled
2. **Environment Variables** set in `.env`
3. **Schema** deployed (`schema_auth.sql`)

## Step 1: Start the Server

```bash
cd agentops-api
python auth_main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 2: Test Health Check

```bash
curl http://localhost:8000/health
```

Expected:
```json
{"status":"ok","timestamp":"2025-11-02T...","auth":"enabled"}
```

## Step 3: Sign Up

```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test User"
  }'
```

Expected:
```json
{
  "message": "User created successfully. Check your email to confirm.",
  "user_id": "uuid-here",
  "email": "test@example.com",
  "access_token": "eyJhbGciOi..."
}
```

**💾 SAVE THE ACCESS TOKEN!**

```bash
# Save for next commands
export TOKEN="eyJhbGciOi..."
```

## Step 4: Sign In (Alternative)

If you need to get a new token:

```bash
curl -X POST http://localhost:8000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

Expected:
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com"
  }
}
```

## Step 5: Get Current User

```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
```json
{
  "user_id": "uuid-here",
  "agents": []
}
```

## Step 6: Register an Agent

```bash
curl -X POST http://localhost:8000/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my_test_bot",
    "metadata": {"environment": "test"}
  }'
```

Expected:
```json
{
  "message": "Agent 'my_test_bot' created successfully",
  "agent_id": "agent-uuid",
  "api_key": "agentops_xxxxxxxxxxxxx",
  "user_id": "user-uuid"
}
```

**💾 SAVE THE API KEY!**

```bash
export API_KEY="agentops_xxxxxxxxxxxxx"
export AGENT_ID="agent-uuid"
```

## Step 7: List Your Agents

```bash
curl http://localhost:8000/agents \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
```json
{
  "agents": [
    {
      "id": "agent-uuid",
      "name": "my_test_bot",
      "created_at": "2025-11-02T...",
      "metadata": {"environment": "test"}
    }
  ]
}
```

## Step 8: Send Test Metrics

```bash
curl -X POST http://localhost:8000/metrics \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "prompt": "What is 2+2?",
    "response": "4",
    "semantic_drift": 0.05,
    "factual_support": 0.98,
    "uncertainty": 0.0,
    "hallucination_probability": 0.02,
    "hallucinated": false,
    "latency_sec": 0.3,
    "throughput_qps": 3.3,
    "meta": {"test": true}
  }'
```

Expected:
```json
{
  "status": "ok",
  "eval_id": "eval-uuid",
  "agent_id": "agent-uuid"
}
```

## Step 9: Get Agent Stats

```bash
curl http://localhost:8000/stats/$AGENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
```json
{
  "agent_id": "agent-uuid",
  "total_evals": 1,
  "total_hallucinations": 0,
  "avg_hallucination_prob": 0.02,
  "avg_latency": 0.3,
  "avg_throughput": 3.3
}
```

## Step 10: View Dashboard

```bash
curl http://localhost:8000/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

Expected:
```json
{
  "dashboard": [
    {
      "user_id": "user-uuid",
      "agent_id": "agent-uuid",
      "agent_name": "my_test_bot",
      "total_evals": 1,
      "total_hallucinations": 0,
      "avg_hallucination_prob": 0.02,
      "avg_latency": 0.3,
      "avg_throughput": 3.3
    }
  ]
}
```

## ✅ Verify in Supabase

### Check Users
1. Go to **Authentication → Users**
2. You should see `test@example.com`

### Check Agents Table
1. Go to **Table Editor → agents**
2. You should see `my_test_bot` with your `user_id`

### Check API Keys Table
1. Go to **Table Editor → api_keys**
2. You should see the API key linked to your agent

### Check Evals Table
1. Go to **Table Editor → evals**
2. You should see the test metric you sent

## 🐛 Troubleshooting

### "Invalid or expired token"
- Token expires after 1 hour
- Sign in again to get fresh token
- Check Authorization header format: `Bearer <token>`

### "Invalid or inactive API key"
- Verify you copied the full API key
- Check it's in the `api_keys` table
- Ensure `active = true`

### "Agent not found or access denied"
- Verify agent belongs to your user
- Check `agents.user_id` matches your user ID
- Ensure RLS policies are enabled

### Connection errors
- Verify server is running on port 8000
- Check `.env` file has correct Supabase credentials
- Ensure no firewall blocking localhost:8000

## 🎉 Success Criteria

All these should return 200 OK:
- ✅ Health check
- ✅ Signup
- ✅ Signin
- ✅ Get current user
- ✅ Register agent
- ✅ List agents
- ✅ Send metrics
- ✅ Get stats
- ✅ View dashboard

## 🚀 Next Steps

Once all tests pass:
1. Test with your SDK locally
2. Deploy to GCP Cloud Run
3. Test production endpoint
4. Update SDK with production URL
5. Build frontend dashboard

---

**Ready to test? Run the automated script:**
```bash
chmod +x test_auth_flow.sh
./test_auth_flow.sh
```

