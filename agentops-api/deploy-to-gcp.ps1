# AgentOps API - GCP Cloud Run Deployment Script (PowerShell)

Write-Host "`n🚀 AgentOps API - GCP Deployment" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if gcloud is installed
try {
    $null = gcloud --version
} catch {
    Write-Host "❌ gcloud CLI is not installed" -ForegroundColor Red
    Write-Host "Install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Get project ID
$PROJECT_ID = gcloud config get-value project 2>$null
if ([string]::IsNullOrEmpty($PROJECT_ID)) {
    Write-Host "❌ No GCP project set" -ForegroundColor Red
    Write-Host "Run: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Project ID: $PROJECT_ID" -ForegroundColor Green

# Get Supabase credentials
Write-Host "`n📝 Enter Supabase credentials:" -ForegroundColor Yellow
$SUPABASE_URL = Read-Host "Supabase URL (https://sdezxfhlizivulgjeabq.supabase.co)"
if ([string]::IsNullOrEmpty($SUPABASE_URL)) {
    $SUPABASE_URL = "https://sdezxfhlizivulgjeabq.supabase.co"
}

$SUPABASE_ANON_KEY = Read-Host "Supabase Anon Key"
$SUPABASE_SERVICE_KEY = Read-Host "Supabase Service Key"

# Generate or get SECRET_KEY
Write-Host "`n🔐 JWT Secret Key:" -ForegroundColor Yellow
$SECRET_KEY = Read-Host "Enter SECRET_KEY (or press Enter to generate)"
if ([string]::IsNullOrEmpty($SECRET_KEY)) {
    $SECRET_KEY = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
    Write-Host "Generated SECRET_KEY: $SECRET_KEY" -ForegroundColor Green
    Write-Host "⚠️  SAVE THIS KEY! You'll need it for future deployments." -ForegroundColor Yellow
}

# Get frontend URL for CORS
Write-Host "`n🌐 Frontend Configuration:" -ForegroundColor Yellow
$FRONTEND_URL = Read-Host "Enter your frontend URL (e.g., https://agentops.vercel.app) or press Enter for wildcard"
if ([string]::IsNullOrEmpty($FRONTEND_URL)) {
    $FRONTEND_URL = "*"
    Write-Host "⚠️  Allowing all origins (not recommended for production)" -ForegroundColor Yellow
}

Write-Host "`n🔨 Building and deploying to Cloud Run..." -ForegroundColor Cyan
Write-Host "This may take 5-10 minutes...`n" -ForegroundColor Gray

# Change to API directory
cd $PSScriptRoot

# Deploy to Cloud Run
gcloud run deploy agentops-api `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars="SUPABASE_URL=$SUPABASE_URL,SUPABASE_KEY=$SUPABASE_ANON_KEY,SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY,SECRET_KEY=$SECRET_KEY,ENVIRONMENT=production,ALLOWED_ORIGINS=$FRONTEND_URL,API_HOST=0.0.0.0,API_PORT=8080"

# Get the service URL
$SERVICE_URL = gcloud run services describe agentops-api --region us-central1 --format="value(status.url)" 2>$null

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🌐 Backend URL: $SERVICE_URL" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test health: curl $SERVICE_URL/health" -ForegroundColor White
Write-Host "2. View API docs: $SERVICE_URL/docs" -ForegroundColor White
Write-Host "3. Update frontend REACT_APP_API_URL to: $SERVICE_URL" -ForegroundColor White
Write-Host "4. Deploy frontend to Vercel" -ForegroundColor White
Write-Host "`n📊 View logs:" -ForegroundColor Yellow
Write-Host "gcloud run services logs read agentops-api --region us-central1" -ForegroundColor Gray
Write-Host ""

