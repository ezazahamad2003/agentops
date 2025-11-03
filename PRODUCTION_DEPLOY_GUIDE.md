# 🚀 Production Deployment Guide

## Prerequisites

### 1. GCP Setup
- [ ] Google Cloud account with billing enabled
- [ ] GCP Project created
- [ ] gcloud CLI installed and authenticated
- [ ] Cloud Run API enabled
- [ ] Cloud Build API enabled

### 2. Supabase (Already Set Up)
- [x] Supabase project: `sdezxfhlizivulgjeabq`
- [x] Database schema deployed
- [x] Tables: `users`, `api_keys`, `evaluations`

### 3. Vercel Setup
- [ ] Vercel account
- [ ] GitHub repository connected

---

## Phase 1: Deploy Backend to GCP Cloud Run

### Step 1: Set GCP Project

```bash
# Set your GCP project ID
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 2: Set Environment Variables in GCP

```bash
cd agentops-api

# Deploy with environment variables
gcloud run deploy agentops-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=https://sdezxfhlizivulgjeabq.supabase.co" \
  --set-env-vars="SUPABASE_KEY=<SUPABASE_ANON_KEY>" \
  --set-env-vars="SUPABASE_SERVICE_KEY=<SUPABASE_SERVICE_KEY>" \
  --set-env-vars="SECRET_KEY=<GENERATE_STRONG_SECRET>" \
  --set-env-vars="ENVIRONMENT=production" \
  --set-env-vars="ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://agentops.vercel.app"
```

### Step 3: Get Backend URL

After deployment, you'll get a URL like:
```
https://agentops-api-<hash>-uc.a.run.app
```

Save this URL - you'll need it for the frontend!

### Step 4: Test Backend

```bash
# Test health endpoint
curl https://agentops-api-<hash>-uc.a.run.app/health

# Test database connection
curl https://agentops-api-<hash>-uc.a.run.app/health/db

# Test API docs
open https://agentops-api-<hash>-uc.a.run.app/docs
```

---

## Phase 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment Variables

Create `frontend/.env.production`:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://sdezxfhlizivulgjeabq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>

# AgentOps API Configuration (GCP Backend)
REACT_APP_API_URL=https://agentops-api-<hash>-uc.a.run.app
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
5. Add Environment Variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_API_URL`
6. Click "Deploy"

### Step 3: Update CORS in Backend

After getting your Vercel URL (e.g., `https://agentops.vercel.app`), update the backend:

```bash
gcloud run services update agentops-api \
  --region us-central1 \
  --update-env-vars="ALLOWED_ORIGINS=https://agentops.vercel.app,https://your-custom-domain.com"
```

---

## Phase 3: Test Production Stack

### 1. Test Frontend
- Visit your Vercel URL
- Register a new account
- Login
- Create an API key

### 2. Test SDK with Production
Update your testing app `.env`:
```env
AGENTOPS_API_KEY=<your-production-api-key>
AGENTOPS_API_URL=https://agentops-api-<hash>-uc.a.run.app
```

Run tests:
```bash
cd testing-app
python run_tests.py
```

### 3. Verify Dashboard
- Check Monitor page shows evaluations
- Verify charts display data
- Test all features

---

## Environment Variables Reference

### Backend (GCP Cloud Run)
```
SUPABASE_URL=https://sdezxfhlizivulgjeabq.supabase.co
SUPABASE_KEY=<anon_key>
SUPABASE_SERVICE_KEY=<service_role_key>
SECRET_KEY=<generate-strong-secret-key>
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
API_HOST=0.0.0.0
API_PORT=8080
```

### Frontend (Vercel)
```
REACT_APP_SUPABASE_URL=https://sdezxfhlizivulgjeabq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon_key>
REACT_APP_API_URL=https://agentops-api-<hash>-uc.a.run.app
```

---

## Security Checklist

- [ ] Generate strong SECRET_KEY for JWT tokens
- [ ] Use SUPABASE_SERVICE_KEY (not anon key) in backend
- [ ] Enable HTTPS only (Cloud Run does this automatically)
- [ ] Set proper CORS origins
- [ ] Review Supabase RLS policies
- [ ] Enable Cloud Run authentication if needed
- [ ] Set up monitoring and logging
- [ ] Configure custom domain (optional)

---

## Monitoring & Logs

### View Backend Logs
```bash
gcloud run services logs read agentops-api \
  --region us-central1 \
  --limit 50
```

### View Metrics
```bash
# Open Cloud Console
gcloud run services describe agentops-api \
  --region us-central1 \
  --format="value(status.url)"
```

---

## Rollback

If something goes wrong:

```bash
# List revisions
gcloud run revisions list --service agentops-api --region us-central1

# Rollback to previous revision
gcloud run services update-traffic agentops-api \
  --region us-central1 \
  --to-revisions=<previous-revision>=100
```

---

## Cost Optimization

- Cloud Run charges per request and CPU time
- First 2 million requests/month are free
- Optimize by:
  - Setting min instances to 0
  - Setting max instances based on traffic
  - Using smaller container images

---

## Next Steps

1. Set up custom domain
2. Configure CI/CD with GitHub Actions
3. Set up monitoring alerts
4. Add rate limiting
5. Enable Cloud CDN for frontend
6. Set up backup strategy

---

## Support

- GCP Documentation: https://cloud.google.com/run/docs
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs

