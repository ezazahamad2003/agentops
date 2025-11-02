# 🚀 Deploy AgentOps API to GCP Cloud Run

Production deployment guide for Google Cloud Platform.

## 📋 Prerequisites

1. **GCP Account** with billing enabled
2. **gcloud CLI** installed ([install guide](https://cloud.google.com/sdk/docs/install))
3. **Supabase project** with schema deployed
4. **Project setup:**
   ```bash
   # Install gcloud if needed
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # Login
   gcloud auth login
   gcloud auth application-default login
   
   # Create or select project
   gcloud projects create agentops-prod --name="AgentOps Production"
   gcloud config set project agentops-prod
   
   # Enable required APIs
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## ⚡ Quick Deploy (Automated)

### Option 1: Using deploy.sh Script (Recommended)

```bash
cd agentops-api

# Set environment variables
export GCP_PROJECT_ID=your-project-id
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_KEY=your-service-role-key

# Make script executable (first time only)
chmod +x deploy.sh

# Deploy!
./deploy.sh
```

✅ **Done!** Your API will be live in ~3-5 minutes.

---

## 🔧 Manual Deploy (Step by Step)

### Step 1: Build Docker Image

```bash
cd agentops-api

gcloud builds submit \
  --tag gcr.io/YOUR_PROJECT_ID/agentops-api \
  -f Dockerfile.production
```

### Step 2: Deploy to Cloud Run

```bash
gcloud run deploy agentops-api \
  --image gcr.io/YOUR_PROJECT_ID/agentops-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "SUPABASE_URL=https://xxx.supabase.co,SUPABASE_SERVICE_KEY=your_key,ALLOWED_ORIGINS=*" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0
```

### Step 3: Get Service URL

```bash
gcloud run services describe agentops-api \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

---

## 🧪 Test Your Deployment

### 1. Health Check

```bash
curl https://your-service-url.a.run.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-02T00:00:00.000000"}
```

### 2. Register Agent

```bash
curl -X POST https://your-service-url.a.run.app/register \
  -H "Content-Type: application/json" \
  -d '{"name":"production_bot"}'
```

Response:
```json
{
  "agent_id": "uuid-here",
  "api_key": "agentops_abcdefghijk...",
  "message": "Agent 'production_bot' created successfully"
}
```

**💾 Save that API key!**

### 3. Send Test Metrics

```bash
curl -X POST https://your-service-url.a.run.app/metrics \
  -H "X-API-Key: agentops_YOUR_KEY" \
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

### 4. Check Stats

```bash
curl https://your-service-url.a.run.app/stats/YOUR_AGENT_ID \
  -H "X-API-Key: agentops_YOUR_KEY"
```

---

## 🔐 Security Configuration

### Environment Variables

Set these in Cloud Run (do NOT commit to git):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ALLOWED_ORIGINS=https://yourdomain.com
```

### Set via gcloud:

```bash
gcloud run services update agentops-api \
  --set-env-vars "SUPABASE_URL=xxx,SUPABASE_SERVICE_KEY=xxx,ALLOWED_ORIGINS=*" \
  --region us-central1
```

### Enable Authentication (Optional)

Remove `--allow-unauthenticated` and use IAM:

```bash
gcloud run services update agentops-api \
  --no-allow-unauthenticated \
  --region us-central1

# Grant access to specific service accounts
gcloud run services add-iam-policy-binding agentops-api \
  --member="serviceAccount:YOUR_SA@project.iam.gserviceaccount.com" \
  --role="roles/run.invoker" \
  --region us-central1
```

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Real-time logs
gcloud run logs tail agentops-api --region us-central1

# Last 100 lines
gcloud run logs read agentops-api --limit 100

# Filter by severity
gcloud run logs read agentops-api --log-filter="severity>=ERROR"
```

### Metrics Dashboard

1. Go to [GCP Console](https://console.cloud.google.com)
2. **Cloud Run → agentops-api → Metrics**
3. View:
   - Request count
   - Request latency
   - CPU/Memory utilization
   - Error rate

### Set Up Alerts

```bash
# Alert on high error rate
gcloud alpha monitoring policies create \
  --notification-channels=YOUR_CHANNEL_ID \
  --display-name="AgentOps High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300s
```

---

## 🔄 Update & Rollback

### Deploy New Version

```bash
# Just run deploy.sh again
./deploy.sh

# Or manually
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/agentops-api -f Dockerfile.production
gcloud run deploy agentops-api --image gcr.io/$GCP_PROJECT_ID/agentops-api:latest
```

### Rollback to Previous Version

```bash
# List revisions
gcloud run revisions list --service agentops-api --region us-central1

# Route 100% traffic to specific revision
gcloud run services update-traffic agentops-api \
  --to-revisions=agentops-api-00001-abc=100 \
  --region us-central1
```

---

## 💰 Cost Optimization

### Current Configuration

- **Memory**: 512Mi
- **CPU**: 1
- **Min instances**: 0 (scales to zero)
- **Max instances**: 10

### Estimated Costs (per month)

| Usage | Cost |
|-------|------|
| **0-2M requests** | ~$0-10 |
| **5M requests** | ~$25 |
| **10M requests** | ~$50 |

**Free tier**: 2M requests/month included!

### Reduce Costs

```bash
# Increase cold start time, reduce costs
gcloud run services update agentops-api \
  --memory 256Mi \
  --cpu 0.5 \
  --max-instances 5 \
  --region us-central1
```

---

## 🚨 Troubleshooting

### "Permission denied" errors

```bash
# Ensure you have necessary roles
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="user:your-email@gmail.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="user:your-email@gmail.com" \
  --role="roles/cloudbuild.builds.editor"
```

### "Failed to create agent" errors

- Check `SUPABASE_URL` is correct (no trailing slash)
- Verify `SUPABASE_SERVICE_KEY` (not anon key!)
- Ensure schema was deployed to Supabase

### Container fails to start

```bash
# Check build logs
gcloud builds list --limit 5

# Check deployment logs
gcloud run logs read agentops-api --limit 100
```

### Cold start issues

Set minimum instances:

```bash
gcloud run services update agentops-api \
  --min-instances 1 \
  --region us-central1
```

---

## 🎯 Production Checklist

- [ ] GCP project created and billing enabled
- [ ] APIs enabled (Cloud Run, Cloud Build)
- [ ] Supabase project set up with schema
- [ ] Environment variables configured
- [ ] `deploy.sh` executed successfully
- [ ] Health check passing
- [ ] Test agent registered
- [ ] Test metrics sent
- [ ] Custom domain configured (optional)
- [ ] Monitoring alerts set up
- [ ] Logs being collected
- [ ] SDK updated with production URL

---

## 🔗 Next Steps

1. **Custom Domain**: Map `api.yourdomain.com` to Cloud Run
2. **CI/CD**: Automate deployments with GitHub Actions
3. **Dashboard**: Build frontend to visualize metrics
4. **Scaling**: Adjust min/max instances based on traffic

---

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [AgentOps API Reference](./QUICKSTART.md)

---

**🎉 Your API is now running on production infrastructure!**

Questions? Open an issue on [GitHub](https://github.com/ezazahamad2003/agentops/issues)

