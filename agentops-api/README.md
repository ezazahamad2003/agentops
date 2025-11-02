# 🚀 AgentOps API

Backend API for LLM Agent Observability - Monitor hallucinations, latency, and throughput.

## 📋 Features

- ✅ **RESTful API** - FastAPI with automatic OpenAPI documentation
- ✅ **Authentication** - JWT tokens + API key authentication
- ✅ **Database** - Supabase/PostgreSQL with Row Level Security
- ✅ **Metrics Storage** - Store and query evaluation data
- ✅ **Analytics** - Aggregated statistics and trends
- ✅ **Rate Limiting** - Protect against abuse
- ✅ **Docker Support** - Containerized deployment
- ✅ **Health Checks** - Kubernetes-ready probes

## 🛠️ Tech Stack

- **FastAPI** - Modern Python web framework
- **Supabase** - PostgreSQL database with built-in auth
- **Pydantic** - Data validation
- **JWT** - Secure authentication
- **Loguru** - Beautiful logging
- **Docker** - Containerization

## 📦 Installation

### Local Development

1. **Clone and navigate to the API directory:**
```bash
cd agentops-api
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Set up Supabase:**
- Create a project at [supabase.com](https://supabase.com)
- Run the SQL schema from `database/schema.sql` in the Supabase SQL Editor
- Copy your Supabase URL and keys to `.env`

6. **Run the server:**
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Docker Deployment

1. **Build and run with Docker Compose:**
```bash
docker-compose up --build
```

2. **Or build and run manually:**
```bash
docker build -t agentops-api .
docker run -p 8000:8000 --env-file .env agentops-api
```

## 📚 API Documentation

Once running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🔐 Authentication

### 1. Register a User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "full_name": "John Doe"
  }'
```

### 2. Login to Get JWT Token

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

Response:
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
    "name": "My Production Key"
  }'
```

Response:
```json
{
  "id": "uuid-here",
  "name": "My Production Key",
  "key": "agops_xxxxxxxxxxxxxxxxxxxxx",
  "created_at": "2025-11-02T00:00:00",
  "is_active": true
}
```

**⚠️ Save the API key! It's only shown once.**

## 📊 Using the API

### Create an Evaluation

```bash
curl -X POST http://localhost:8000/evaluations/ \
  -H "X-API-Key: agops_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is the capital of France?",
    "response": "Paris is the capital of France.",
    "semantic_drift": 0.12,
    "uncertainty": 0.0,
    "factual_support": 0.95,
    "hallucination_probability": 0.08,
    "hallucinated": false,
    "latency_sec": 0.42,
    "throughput_qps": 2.38,
    "mode": "self-check",
    "model_name": "gpt-4o-mini",
    "agent_name": "qa_assistant"
  }'
```

### Get Evaluation Statistics

```bash
curl -X GET "http://localhost:8000/evaluations/stats?days=7" \
  -H "X-API-Key: agops_your_api_key_here"
```

Response:
```json
{
  "total_evaluations": 150,
  "total_hallucinations": 12,
  "hallucination_rate": 0.08,
  "avg_latency": 0.52,
  "avg_throughput": 1.92,
  "avg_semantic_drift": 0.23,
  "avg_uncertainty": 0.15,
  "avg_factual_support": 0.82
}
```

### List Evaluations

```bash
curl -X GET "http://localhost:8000/evaluations/?limit=10&hallucinated=true" \
  -H "X-API-Key: agops_your_api_key_here"
```

## 🗄️ Database Schema

The API uses the following main tables:

- **users** - User accounts
- **api_keys** - API authentication keys
- **evaluations** - Evaluation metrics and data

See `database/schema.sql` for the complete schema.

## 🔧 Configuration

All configuration is done via environment variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Required |
| `SUPABASE_KEY` | Supabase anon key | Required |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Required |
| `SECRET_KEY` | JWT secret (generate with `openssl rand -hex 32`) | Required |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:3000` |
| `API_PORT` | Port to run on | `8000` |
| `RATE_LIMIT_PER_MINUTE` | Max requests per minute | `60` |

## 🧪 Testing

```bash
# Install dev dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/

# With coverage
pytest --cov=app tests/
```

## 📈 Monitoring

The API includes several health check endpoints:

- `GET /health` - Basic health check
- `GET /health/db` - Database connectivity check
- `GET /health/ready` - Kubernetes readiness probe

## 🚀 Deployment

### Render.com

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `pip install -r agentops-api/requirements.txt`
4. Set start command: `cd agentops-api && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/agentops-api

# Deploy
gcloud run deploy agentops-api \
  --image gcr.io/PROJECT_ID/agentops-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "$(cat .env | xargs)"
```

### AWS ECS / Fargate

Use the provided `Dockerfile` and set environment variables in the task definition.

## 📝 Integration with SDK

Update your `agentops-client` SDK to post to the API:

```python
from agentops import AgentOps
import httpx

# Initialize with API endpoint
ops = AgentOps(api_url="https://your-api.com", api_key="agops_xxx")

# Evaluate (automatically posts to API)
result = ops.evaluate(prompt, response)
```

## 🛣️ Roadmap

- [ ] Async background job processing
- [ ] Email notifications for anomalies
- [ ] Webhook support
- [ ] Multi-tenant support
- [ ] Advanced analytics dashboards
- [ ] Export to CSV/JSON
- [ ] Prometheus metrics endpoint

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🤝 Contributing

See the main repository [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 🔗 Links

- **Main SDK**: [agentops-client](../README.md)
- **PyPI Package**: https://pypi.org/project/agentops-client/
- **GitHub**: https://github.com/ezazahamad2003/agentops

---

**Built with ❤️ for the LLM community**

