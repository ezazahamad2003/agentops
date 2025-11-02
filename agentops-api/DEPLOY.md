# 🚀 Deployment Guide for AgentOps API

## Quick Deploy Options

### Option 1: Render.com (Easiest)

1. **Push to GitHub** (already done!)

2. **Go to [Render.com](https://render.com)** and sign in

3. **Create New Web Service**
   - Connect your GitHub repository
   - Select the `agentops` repository
   - Root directory: `agentops-api`

4. **Configure:**
   - Name: `agentops-api`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables:**
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   SECRET_KEY=your-secret-key
   ALLOWED_ORIGINS=https://your-frontend.com
   ```

6. **Deploy!** Click "Create Web Service"

7. **Your API will be live at:** `https://agentops-api.onrender.com`

---

### Option 2: Railway.app

1. **Go to [Railway.app](https://railway.app)**

2. **New Project → Deploy from GitHub**

3. **Select your repository**

4. **Add environment variables** (same as above)

5. **Railway will auto-detect and deploy**

---

### Option 3: Google Cloud Run

```bash
# Install Google Cloud SDK first
# https://cloud.google.com/sdk/docs/install

# Build and push
cd agentops-api
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/agentops-api

# Deploy
gcloud run deploy agentops-api \
  --image gcr.io/YOUR_PROJECT_ID/agentops-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL=xxx,SUPABASE_KEY=xxx,SECRET_KEY=xxx
```

---

### Option 4: Docker (Self-Hosted)

```bash
# Build
docker build -t agentops-api .

# Run
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name agentops-api \
  agentops-api

# Or use docker-compose
docker-compose up -d
```

---

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it `agentops`
4. Choose a region close to your API
5. Set a strong database password

### 2. Run Database Schema

1. Go to **SQL Editor** in Supabase
2. Copy the contents of `database/schema.sql`
3. Paste and click "Run"
4. Wait for success message

### 3. Get API Keys

1. Go to **Settings → API**
2. Copy these values:
   - **URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (keep secret!)

### 4. Add to Environment Variables

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc... (anon key)
SUPABASE_SERVICE_KEY=eyJhbGc... (service_role key)
```

---

## 🔐 Generate Secret Key

```bash
# Linux/Mac
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"

# Windows PowerShell
python -c "import secrets; print(secrets.token_hex(32))"
```

Add to `.env`:
```
SECRET_KEY=your_generated_key_here
```

---

## ✅ Post-Deployment Checks

1. **Health Check**
   ```bash
   curl https://your-api.com/health
   ```

2. **Register First User**
   ```bash
   curl -X POST https://your-api.com/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"SecurePass123"}'
   ```

3. **Check API Docs**
   - Visit: `https://your-api.com/docs`

---

## 🔄 Updates & Rollbacks

### Render/Railway
- Push to GitHub → Auto-deploys

### Google Cloud Run
```bash
gcloud run deploy agentops-api --image gcr.io/PROJECT/agentops-api:TAG
```

### Docker
```bash
docker-compose down
docker-compose pull
docker-compose up -d
```

---

## 📊 Monitoring

### Logs

**Render:**
- Dashboard → Logs tab

**Google Cloud Run:**
```bash
gcloud run services logs read agentops-api --limit 100
```

**Docker:**
```bash
docker logs agentops-api --tail 100 -f
```

### Health Checks

Set up monitoring at:
- [UptimeRobot](https://uptimerobot.com) (free)
- [BetterUptime](https://betteruptime.com) (free tier)

Monitor:
- `GET /health` - Should return 200
- `GET /health/db` - Should return 200 (db check)

---

## 🚨 Troubleshooting

### "Database connection failed"
- Check `SUPABASE_URL` and keys
- Verify schema was run successfully
- Check Supabase project status

### "Invalid credentials"
- Regenerate `SECRET_KEY`
- Check JWT token expiration
- Verify user exists in database

### "Rate limit exceeded"
- Increase `RATE_LIMIT_PER_MINUTE` in `.env`
- Consider Redis-based rate limiting for production

---

## 🎯 Production Checklist

- [ ] Supabase project created and schema deployed
- [ ] Environment variables set (all required ones)
- [ ] SECRET_KEY is strong (32+ characters)
- [ ] CORS origins configured correctly
- [ ] Health checks passing
- [ ] First admin user created
- [ ] API documentation accessible at `/docs`
- [ ] Rate limiting configured
- [ ] Monitoring/alerts set up
- [ ] Backup strategy for database
- [ ] SSL/HTTPS enabled (automatic on most platforms)

---

## 📈 Scaling

### Horizontal Scaling
- Render/Railway: Adjust instance count in settings
- GCP: Set `--max-instances` flag
- Docker: Use load balancer + multiple containers

### Database
- Supabase automatically scales
- Consider read replicas for heavy traffic
- Use connection pooling

### Caching
- Add Redis for:
  - Rate limiting
  - Session storage
  - Query caching

---

## 💰 Cost Estimates

| Platform | Free Tier | Paid (Small) |
|----------|-----------|--------------|
| **Render** | 750hrs/mo | $7/mo (starter) |
| **Railway** | $5 credit/mo | $5-20/mo |
| **Google Cloud Run** | 2M requests/mo | Pay per use |
| **Supabase** | 500MB DB, 2GB bandwidth | $25/mo (pro) |

**Total for small deployment:** ~$12-30/month

---

**Questions? Open an issue on [GitHub](https://github.com/ezazahamad2003/agentops/issues)!**

