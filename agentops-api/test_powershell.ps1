# PowerShell Test Script for AgentOps API Auth Flow
# Run this in PowerShell: .\test_powershell.ps1

$ErrorActionPreference = "Stop"

$API_URL = "http://localhost:8000"
$TEST_EMAIL = "test_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$TEST_PASSWORD = "TestPass123!"

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║     AgentOps API Auth Flow Test (PowerShell)  ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Blue

# Test 1: Health Check
Write-Host "[1/7] Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_URL/health" -Method Get
    if ($health.status -eq "ok") {
        Write-Host "✅ Health check passed" -ForegroundColor Green
        Write-Host "   Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    Write-Host "`nIs the server running? Start it with: python auth_main.py" -ForegroundColor Yellow
    exit 1
}

# Test 2: Sign Up
Write-Host "`n[2/7] Testing user signup..." -ForegroundColor Yellow
try {
    $signupBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
        full_name = "Test User"
    } | ConvertTo-Json

    $signup = Invoke-RestMethod -Uri "$API_URL/auth/signup" -Method Post `
        -ContentType "application/json" -Body $signupBody
    
    Write-Host "✅ Signup successful" -ForegroundColor Green
    Write-Host "   Email: $TEST_EMAIL" -ForegroundColor Gray
    Write-Host "   User ID: $($signup.user_id)" -ForegroundColor Gray
    Write-Host "   Token: $($signup.access_token.Substring(0,30))..." -ForegroundColor Gray
    
    $ACCESS_TOKEN = $signup.access_token
    $USER_ID = $signup.user_id
} catch {
    Write-Host "❌ Signup failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Sign In
Write-Host "`n[3/7] Testing user signin..." -ForegroundColor Yellow
try {
    $signinBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
    } | ConvertTo-Json

    $signin = Invoke-RestMethod -Uri "$API_URL/auth/signin" -Method Post `
        -ContentType "application/json" -Body $signinBody
    
    Write-Host "✅ Signin successful" -ForegroundColor Green
    Write-Host "   New Token: $($signin.access_token.Substring(0,30))..." -ForegroundColor Gray
    
    $ACCESS_TOKEN = $signin.access_token
} catch {
    Write-Host "❌ Signin failed: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Get Current User
Write-Host "`n[4/7] Testing /auth/me endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $ACCESS_TOKEN"
    }
    
    $me = Invoke-RestMethod -Uri "$API_URL/auth/me" -Method Get -Headers $headers
    
    Write-Host "✅ Current user endpoint working" -ForegroundColor Green
    Write-Host "   User ID: $($me.user_id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get current user: $_" -ForegroundColor Red
    exit 1
}

# Test 5: Register Agent
Write-Host "`n[5/7] Testing agent registration..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $ACCESS_TOKEN"
    }
    
    $registerBody = @{
        name = "test_bot"
        metadata = @{
            environment = "test"
        }
    } | ConvertTo-Json

    $register = Invoke-RestMethod -Uri "$API_URL/register" -Method Post `
        -Headers $headers -ContentType "application/json" -Body $registerBody
    
    Write-Host "✅ Agent registered successfully" -ForegroundColor Green
    Write-Host "   Agent ID: $($register.agent_id)" -ForegroundColor Gray
    Write-Host "   API Key: $($register.api_key.Substring(0,20))..." -ForegroundColor Gray
    
    $API_KEY = $register.api_key
    $AGENT_ID = $register.agent_id
} catch {
    Write-Host "❌ Agent registration failed: $_" -ForegroundColor Red
    exit 1
}

# Test 6: Send Metrics
Write-Host "`n[6/7] Testing metrics ingestion..." -ForegroundColor Yellow
try {
    $headers = @{
        "X-API-Key" = $API_KEY
    }
    
    $metricsBody = @{
        model = "gpt-4o-mini"
        prompt = "What is AI?"
        response = "AI is artificial intelligence..."
        semantic_drift = 0.1
        factual_support = 0.95
        uncertainty = 0.0
        hallucination_probability = 0.05
        hallucinated = $false
        latency_sec = 0.5
        throughput_qps = 2.0
        meta = @{
            test = $true
        }
    } | ConvertTo-Json

    $metrics = Invoke-RestMethod -Uri "$API_URL/metrics" -Method Post `
        -Headers $headers -ContentType "application/json" -Body $metricsBody
    
    Write-Host "✅ Metrics ingested successfully" -ForegroundColor Green
    Write-Host "   Eval ID: $($metrics.eval_id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Metrics ingestion failed: $_" -ForegroundColor Red
    exit 1
}

# Test 7: Get Stats
Write-Host "`n[7/7] Testing stats endpoint..." -ForegroundColor Yellow
Start-Sleep -Seconds 1  # Give DB a moment
try {
    $headers = @{
        "Authorization" = "Bearer $ACCESS_TOKEN"
    }
    
    $stats = Invoke-RestMethod -Uri "$API_URL/stats/$AGENT_ID" -Method Get -Headers $headers
    
    Write-Host "✅ Stats retrieved successfully" -ForegroundColor Green
    Write-Host "   Total Evals: $($stats.total_evals)" -ForegroundColor Gray
    Write-Host "   Avg Latency: $($stats.avg_latency)s" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get stats: $_" -ForegroundColor Red
    exit 1
}

# Bonus: Dashboard
Write-Host "`n[BONUS] Testing dashboard endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $ACCESS_TOKEN"
    }
    
    $dashboard = Invoke-RestMethod -Uri "$API_URL/dashboard" -Method Get -Headers $headers
    
    Write-Host "✅ Dashboard working" -ForegroundColor Green
    Write-Host "   Agents: $($dashboard.dashboard.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Dashboard failed: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           🎉 ALL TESTS PASSED! 🎉              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Test Summary:" -ForegroundColor Blue
Write-Host "   Email: $TEST_EMAIL" -ForegroundColor Gray
Write-Host "   Password: $TEST_PASSWORD" -ForegroundColor Gray
Write-Host "   User ID: $USER_ID" -ForegroundColor Gray
Write-Host "   Agent ID: $AGENT_ID" -ForegroundColor Gray
Write-Host "   API Key: $API_KEY" -ForegroundColor Gray

Write-Host "`nYou can now:" -ForegroundColor Blue
Write-Host "   1. Check Supabase → Authentication → Users" -ForegroundColor Gray
Write-Host "   2. Check Supabase → Table Editor → agents, api_keys, evals" -ForegroundColor Gray
Write-Host "   3. Use this API key with your SDK" -ForegroundColor Gray

Write-Host "`n✅ Auth flow is working perfectly! Ready to deploy! 🚀" -ForegroundColor Green

