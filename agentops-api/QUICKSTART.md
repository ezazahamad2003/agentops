# 🚀 AgentOps API - 5-Minute Quickstart

Get your API running in 5 minutes!

## Step 1: Set Up Supabase (2 minutes)

1. **Create project** at [supabase.com](https://supabase.com)
   - Name: `agentops`
   - Region: Choose closest to you
   - Database password: (save this!)

2. **Run SQL schema**
   - Go to **SQL Editor** in Supabase
   - Copy contents of `database/schema_minimal.sql`
   - Paste and click **Run**
   - Wait for success ✅

3. **Get your credentials**
   - Go to **Settings → API**
   - Copy:
     - **URL**: `https://xxxxx.supabase.co`
     - **service_role key**: `eyJhbGc...` (keep secret!)

## Step 2: Run API Locally (1 minute)

```bash
cd agentops-api

# Create .env file
cp .env.minimal.example .env

# Edit .env with your Supabase credentials
# (Use notepad, vim, or any editor)

# Install dependencies
pip install -r requirements-minimal.txt

# Run the API!
python minimal_main.py
```

✅ **API running at http://localhost:8000**

## Step 3: Test It! (2 minutes)

### 3a. Register an Agent

```bash
curl -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"my_qa_bot"}'
```

Response:
```json
{
  "agent_id": "uuid-here",
  "api_key": "agentops_abcdefghijk...",
  "message": "Agent 'my_qa_bot' created successfully"
}
```

**💾 Save that API key!**

### 3b. Send Test Metrics

```bash
curl -X POST http://localhost:8000/metrics \
  -H "X-API-Key: agentops_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "model":"gpt-4o-mini",
    "prompt":"What is 2+2?",
    "response":"4",
    "semantic_drift":0.1,
    "factual_support":0.95,
    "uncertainty":0.0,
    "hallucination_probability":0.05,
    "hallucinated":false,
    "latency_sec":0.5,
    "throughput_qps":2.0
  }'
```

Response:
```json
{
  "status": "ok",
  "eval_id": "uuid-here",
  "agent_id": "your-agent-id"
}
```

### 3c. Check Your Data in Supabase

1. Go to **Table Editor** in Supabase
2. Click on `evals` table
3. You should see your test metric! 🎉

### 3d. Get Stats

```bash
curl http://localhost:8000/stats/YOUR_AGENT_ID \
  -H "X-API-Key: agentops_YOUR_KEY_HERE"
```

Response:
```json
{
  "agent_id": "your-agent-id",
  "total_evals": 1,
  "total_hallucinations": 0,
  "avg_hallucination_prob": 0.05,
  "avg_latency": 0.5,
  "avg_throughput": 2.0
}
```

## Step 4: Use with SDK

Update your Python code:

```python
import os
from agentops import AgentOps

# Set environment variables
os.environ['AGENTOPS_API_URL'] = 'http://localhost:8000'
os.environ['AGENTOPS_API_KEY'] = 'agentops_YOUR_KEY_HERE'

# Initialize (will auto-upload)
ops = AgentOps(
    api_url=os.getenv('AGENTOPS_API_URL'),
    api_key=os.getenv('AGENTOPS_API_KEY')
)

# Use normally - automatically uploads!
result = ops.evaluate(
    prompt="What is AI?",
    response="AI is artificial intelligence...",
    model_name="gpt-4o-mini"
)

print(f"Hallucinated: {result['hallucinated']}")
# Data is now in Supabase!
```

## Step 5: Deploy to Production (Optional)

### Render.com (Easiest)

1. Go to [render.com](https://render.com)
2. **New → Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `agentops-api`
   - **Build Command**: `pip install -r requirements-minimal.txt`
   - **Start Command**: `python minimal_main.py`
5. **Environment Variables**:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   ALLOWED_ORIGINS=*
   ```
6. **Create Web Service**

Your API will be live at: `https://agentops-api-xxxx.onrender.com`

### Railway.app (Alternative)

1. Go to [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub**
3. Select your repo
4. Add environment variables (same as above)
5. Railway auto-detects and deploys!

## Troubleshooting

### "Failed to create agent"
- Check `SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_KEY` (not anon key!)
- Ensure schema was run successfully

### "Invalid or inactive API key"
- Make sure you're using the key from `/register`
- Check the `X-API-Key` header format
- Verify key exists in Supabase `api_keys` table

### "Module not found"
- Run `pip install -r requirements-minimal.txt`
- Make sure you're in the `agentops-api/` directory

## API Reference

### POST /register
Create agent and get API key

**Request:**
```json
{"name": "my_agent"}
```

**Response:**
```json
{
  "agent_id": "uuid",
  "api_key": "agentops_xxxxx",
  "message": "Agent created"
}
```

### POST /metrics
Store evaluation metrics

**Headers:**
- `X-API-Key: agentops_xxxxx`

**Request:**
```json
{
  "model": "gpt-4o-mini",
  "prompt": "Question",
  "response": "Answer",
  "semantic_drift": 0.2,
  "factual_support": 0.8,
  "uncertainty": 0.1,
  "hallucination_probability": 0.15,
  "hallucinated": false,
  "latency_sec": 1.2,
  "throughput_qps": 0.8
}
```

**Response:**
```json
{
  "status": "ok",
  "eval_id": "uuid",
  "agent_id": "uuid"
}
```

### GET /stats/{agent_id}
Get aggregated statistics

**Headers:**
- `X-API-Key: agentops_xxxxx`

**Response:**
```json
{
  "agent_id": "uuid",
  "total_evals": 100,
  "total_hallucinations": 8,
  "avg_hallucination_prob": 0.08,
  "avg_latency": 1.5,
  "avg_throughput": 0.67
}
```

### GET /health
Health check

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T00:00:00"
}
```

---

## Next Steps

- [ ] Deploy to Render/Railway
- [ ] Build dashboard to visualize stats
- [ ] Add webhooks for alerts
- [ ] Implement key rotation
- [ ] Add more analytics endpoints

---

**🎉 You're done! Your observability platform is running!**

Questions? Open an issue on [GitHub](https://github.com/ezazahamad2003/agentops/issues)

