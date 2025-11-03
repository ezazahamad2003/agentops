#!/bin/bash

# AgentOps API - GCP Cloud Run Deployment Script

set -e

echo "🚀 AgentOps API - GCP Deployment"
echo "================================"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No GCP project set"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📦 Project ID: $PROJECT_ID"

# Check for required environment variables
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL not set"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_KEY not set"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "⚠️  SECRET_KEY not set, generating one..."
    SECRET_KEY=$(openssl rand -hex 32)
    echo "Generated SECRET_KEY: $SECRET_KEY"
    echo "⚠️  SAVE THIS KEY! You'll need it for future deployments."
fi

# Get frontend URL for CORS
read -p "Enter your frontend URL (e.g., https://agentops.vercel.app): " FRONTEND_URL
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL="*"
    echo "⚠️  No frontend URL provided, allowing all origins (not recommended for production)"
fi

echo ""
echo "🔨 Building and deploying to Cloud Run..."
echo ""

# Deploy to Cloud Run
gcloud run deploy agentops-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="SUPABASE_URL=$SUPABASE_URL" \
  --set-env-vars="SUPABASE_KEY=$SUPABASE_ANON_KEY" \
  --set-env-vars="SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY" \
  --set-env-vars="SECRET_KEY=$SECRET_KEY" \
  --set-env-vars="ENVIRONMENT=production" \
  --set-env-vars="ALLOWED_ORIGINS=$FRONTEND_URL" \
  --set-env-vars="API_HOST=0.0.0.0" \
  --set-env-vars="API_PORT=8080"

# Get the service URL
SERVICE_URL=$(gcloud run services describe agentops-api --region us-central1 --format="value(status.url)")

echo ""
echo "✅ Deployment complete!"
echo "================================"
echo "🌐 Backend URL: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Test health: curl $SERVICE_URL/health"
echo "2. View API docs: $SERVICE_URL/docs"
echo "3. Update frontend REACT_APP_API_URL to: $SERVICE_URL"
echo "4. Deploy frontend to Vercel"
echo ""
echo "📊 View logs: gcloud run services logs read agentops-api --region us-central1"
echo ""

