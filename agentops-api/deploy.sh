#!/bin/bash
# One-command deployment to GCP Cloud Run

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AgentOps API - GCP Cloud Run Deployment${NC}"
echo ""

# Check if required env vars are set
if [ -z "$GCP_PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: GCP_PROJECT_ID not set${NC}"
    echo "Run: export GCP_PROJECT_ID=your-project-id"
    exit 1
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ Error: Supabase credentials not set${NC}"
    echo "Run:"
    echo "  export SUPABASE_URL=https://your-project.supabase.co"
    echo "  export SUPABASE_SERVICE_KEY=your-service-key"
    exit 1
fi

echo -e "${GREEN}✅ Configuration validated${NC}"
echo "  Project: $GCP_PROJECT_ID"
echo "  Supabase: ${SUPABASE_URL:0:30}..."
echo ""

# Build and push image
echo -e "${BLUE}📦 Building Docker image...${NC}"
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/agentops-api \
    --project $GCP_PROJECT_ID \
    -f Dockerfile.production

echo ""
echo -e "${BLUE}🌐 Deploying to Cloud Run...${NC}"

# Deploy to Cloud Run
gcloud run deploy agentops-api \
    --image gcr.io/$GCP_PROJECT_ID/agentops-api:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars "SUPABASE_URL=$SUPABASE_URL,SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY,ALLOWED_ORIGINS=*" \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --project $GCP_PROJECT_ID

echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe agentops-api \
    --platform managed \
    --region us-central1 \
    --format 'value(status.url)' \
    --project $GCP_PROJECT_ID)

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🌐 Your API is live at:${NC}"
echo -e "   ${GREEN}$SERVICE_URL${NC}"
echo ""
echo -e "${BLUE}🧪 Test your deployment:${NC}"
echo ""
echo "1. Health check:"
echo "   curl $SERVICE_URL/health"
echo ""
echo "2. Register an agent:"
echo "   curl -X POST $SERVICE_URL/register \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"name\":\"production_bot\"}'"
echo ""
echo "3. Save the API key from the response above, then test metrics:"
echo "   curl -X POST $SERVICE_URL/metrics \\"
echo "     -H 'X-API-Key: agentops_YOUR_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"model\":\"gpt-4o-mini\",\"prompt\":\"test\",\"response\":\"test\",\"semantic_drift\":0.1,\"factual_support\":0.9,\"uncertainty\":0.0,\"hallucination_probability\":0.1,\"hallucinated\":false,\"latency_sec\":1.0}'"
echo ""
echo -e "${BLUE}📊 View logs:${NC}"
echo "   gcloud run logs read agentops-api --project $GCP_PROJECT_ID"
echo ""
echo -e "${BLUE}🔄 Redeploy:${NC}"
echo "   ./deploy.sh"
echo ""

