# 🚀 AgentOps - Ready for Production Deployment

## ✅ What's Ready

### Backend (FastAPI)
- ✅ Full user authentication with JWT
- ✅ API key management
- ✅ `/metrics` endpoint for SDK (API key auth)
- ✅ `/evaluations/` endpoints for dashboard (JWT auth)
- ✅ Dockerfile configured for Cloud Run
- ✅ Environment variables configured
- ✅ CORS setup for production
- ✅ Deployment scripts ready

### Frontend (React)
- ✅ User registration & login
- ✅ Protected routes
- ✅ API key management UI
- ✅ Real-time monitoring dashboard
- ✅ Environment variables configured
- ✅ Ready for Vercel deployment

### Database (Supabase)
- ✅ Production database already set up
- ✅ Tables: `users`, `api_keys`, `evaluations`
- ✅ Row Level Security (RLS) enabled
- ✅ No migration needed

---

## 📋 Deployment Steps

### Option 1: Quick Deployment (Recommended)

#### 1. Deploy Backend to GCP

**Windows (PowerShell):**
```powershell
cd agentops-api
.\deploy-to-gcp.ps1
```

**Mac/Linux:**
```bash
cd agentops-api
chmod +x deploy-to-gcp.sh
./deploy-to-gcp.sh
```

The script will:
- ✅ Check gcloud CLI is installed
- ✅ Prompt for Supabase credentials
- ✅ Generate JWT secret key
- ✅ Deploy to Cloud Run
- ✅ Give you the backend URL

#### 2. Deploy Frontend to Vercel

**Option A: Vercel CLI**
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repo
4. Set Root Directory: `frontend`
5. Add environment variables (see below)
6. Click "Deploy"

---

### Option 2: Manual Deployment

See `PRODUCTION_DEPLOY_GUIDE.md` for detailed step-by-step instructions.

---

## 🔑 Environment Variables

### Backend (GCP Cloud Run)

You'll need these from Supabase dashboard:

```
SUPABASE_URL=https://sdezxfhlizivulgjeabq.supabase.co
SUPABASE_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-role-key>
SECRET_KEY=<generate-random-64-char-string>
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Where to find Supabase keys:**
1. Go to: https://supabase.com/dashboard/project/sdezxfhlizivulgjeabq/settings/api
2. Copy `anon` key → `SUPABASE_KEY`
3. Copy `service_role` key → `SUPABASE_SERVICE_KEY`

### Frontend (Vercel)

```
REACT_APP_SUPABASE_URL=https://sdezxfhlizivulgjeabq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
REACT_APP_API_URL=<your-gcp-backend-url>
```

---

## 🧪 Testing Production

### 1. Test Backend

```bash
# Health check
curl https://your-backend-url.run.app/health

# API docs
open https://your-backend-url.run.app/docs
```

### 2. Test Frontend

1. Visit your Vercel URL
2. Register a new account
3. Login
4. Create an API key
5. Check Monitor page

### 3. Test SDK

Update `testing-app/.env`:
```env
AGENTOPS_API_KEY=<your-production-api-key>
AGENTOPS_API_URL=https://your-backend-url.run.app
```

Run tests:
```bash
cd testing-app
python run_tests.py
```

---

## 📊 Expected Costs

### GCP Cloud Run (Backend)
- **Free Tier:** 2 million requests/month
- **After free tier:** ~$0.40 per million requests
- **Estimated:** $0-5/month for light usage

### Vercel (Frontend)
- **Hobby Plan:** Free
- **Pro Plan:** $20/month (if you need more)

### Supabase (Database)
- **Free Tier:** 500MB database, 2GB bandwidth
- **Pro Plan:** $25/month (unlimited)

**Total estimated cost:** $0-30/month depending on usage

---

## 🔒 Security Checklist

Before deploying:

- [ ] Generate strong SECRET_KEY (64+ characters)
- [ ] Use SUPABASE_SERVICE_KEY (not anon key) in backend
- [ ] Set specific ALLOWED_ORIGINS (not wildcard)
- [ ] Review Supabase RLS policies
- [ ] Enable 2FA on GCP and Vercel accounts
- [ ] Set up monitoring and alerts
- [ ] Configure custom domain with HTTPS

---

## 📈 Post-Deployment

### Monitoring

**Backend Logs:**
```bash
gcloud run services logs read agentops-api --region us-central1 --limit 50
```

**Frontend Logs:**
- Vercel Dashboard → Your Project → Logs

**Database:**
- Supabase Dashboard → Logs

### Custom Domain (Optional)

**Backend:**
```bash
gcloud run domain-mappings create \
  --service agentops-api \
  --domain api.yourdomain.com \
  --region us-central1
```

**Frontend:**
- Vercel Dashboard → Your Project → Settings → Domains

---

## 🆘 Troubleshooting

### Backend won't deploy
- Check gcloud CLI is authenticated: `gcloud auth list`
- Verify project ID: `gcloud config get-value project`
- Check Cloud Run API is enabled
- Review build logs: `gcloud builds list`

### Frontend shows errors
- Check environment variables in Vercel dashboard
- Verify backend URL is correct
- Check browser console for errors
- Test backend health endpoint

### Database connection issues
- Verify Supabase service key is correct
- Check Supabase project is active
- Review RLS policies in Supabase

---

## 📚 Documentation

- **Full Deployment Guide:** `PRODUCTION_DEPLOY_GUIDE.md`
- **GCP Documentation:** https://cloud.google.com/run/docs
- **Vercel Documentation:** https://vercel.com/docs
- **Supabase Documentation:** https://supabase.com/docs

---

## 🎯 Ready to Deploy?

1. **Make sure you have:**
   - ✅ GCP account with billing enabled
   - ✅ gcloud CLI installed
   - ✅ Vercel account
   - ✅ Supabase credentials ready

2. **Run deployment:**
   ```bash
   cd agentops-api
   ./deploy-to-gcp.ps1  # Windows
   # or
   ./deploy-to-gcp.sh   # Mac/Linux
   ```

3. **Deploy frontend to Vercel**

4. **Test everything works!**

---

**Questions? Check `PRODUCTION_DEPLOY_GUIDE.md` for detailed instructions!**

