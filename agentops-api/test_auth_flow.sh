#!/bin/bash
# Complete Auth Flow Test Script for AgentOps API

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000"
TEST_EMAIL="test_$(date +%s)@example.com"  # Unique email
TEST_PASSWORD="TestPass123!"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     AgentOps API Auth Flow Test               ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}[1/7] Testing health endpoint...${NC}"
HEALTH=$(curl -s $API_URL/health)
if echo $HEALTH | grep -q "ok"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "   Response: $HEALTH"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: Sign Up
echo -e "${YELLOW}[2/7] Testing user signup...${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST $API_URL/auth/signup \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"full_name\":\"Test User\"}")

echo "   Response: $SIGNUP_RESPONSE"

if echo $SIGNUP_RESPONSE | grep -q "user_id"; then
    echo -e "${GREEN}✅ Signup successful${NC}"
    ACCESS_TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "   Email: $TEST_EMAIL"
    echo "   Token: ${ACCESS_TOKEN:0:30}..."
else
    echo -e "${RED}❌ Signup failed${NC}"
    exit 1
fi
echo ""

# Test 3: Sign In
echo -e "${YELLOW}[3/7] Testing user signin...${NC}"
SIGNIN_RESPONSE=$(curl -s -X POST $API_URL/auth/signin \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "   Response: $SIGNIN_RESPONSE"

if echo $SIGNIN_RESPONSE | grep -q "access_token"; then
    echo -e "${GREEN}✅ Signin successful${NC}"
    ACCESS_TOKEN=$(echo $SIGNIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo $SIGNIN_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "   User ID: $USER_ID"
    echo "   New Token: ${ACCESS_TOKEN:0:30}..."
else
    echo -e "${RED}❌ Signin failed${NC}"
    exit 1
fi
echo ""

# Test 4: Get Current User
echo -e "${YELLOW}[4/7] Testing /auth/me endpoint...${NC}"
ME_RESPONSE=$(curl -s $API_URL/auth/me \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Response: $ME_RESPONSE"

if echo $ME_RESPONSE | grep -q "user_id"; then
    echo -e "${GREEN}✅ Current user endpoint working${NC}"
else
    echo -e "${RED}❌ Failed to get current user${NC}"
    exit 1
fi
echo ""

# Test 5: Register Agent
echo -e "${YELLOW}[5/7] Testing agent registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/register \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"test_bot","metadata":{"environment":"test"}}')

echo "   Response: $REGISTER_RESPONSE"

if echo $REGISTER_RESPONSE | grep -q "api_key"; then
    echo -e "${GREEN}✅ Agent registered successfully${NC}"
    API_KEY=$(echo $REGISTER_RESPONSE | grep -o '"api_key":"[^"]*' | cut -d'"' -f4)
    AGENT_ID=$(echo $REGISTER_RESPONSE | grep -o '"agent_id":"[^"]*' | cut -d'"' -f4)
    echo "   Agent ID: $AGENT_ID"
    echo "   API Key: ${API_KEY:0:20}..."
else
    echo -e "${RED}❌ Agent registration failed${NC}"
    exit 1
fi
echo ""

# Test 6: Send Metrics
echo -e "${YELLOW}[6/7] Testing metrics ingestion...${NC}"
METRICS_RESPONSE=$(curl -s -X POST $API_URL/metrics \
    -H "X-API-Key: $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model":"gpt-4o-mini",
        "prompt":"What is AI?",
        "response":"AI is artificial intelligence...",
        "semantic_drift":0.1,
        "factual_support":0.95,
        "uncertainty":0.0,
        "hallucination_probability":0.05,
        "hallucinated":false,
        "latency_sec":0.5,
        "throughput_qps":2.0,
        "meta":{"test":"true"}
    }')

echo "   Response: $METRICS_RESPONSE"

if echo $METRICS_RESPONSE | grep -q "ok"; then
    echo -e "${GREEN}✅ Metrics ingested successfully${NC}"
    EVAL_ID=$(echo $METRICS_RESPONSE | grep -o '"eval_id":"[^"]*' | cut -d'"' -f4)
    echo "   Eval ID: $EVAL_ID"
else
    echo -e "${RED}❌ Metrics ingestion failed${NC}"
    exit 1
fi
echo ""

# Test 7: Get Stats
echo -e "${YELLOW}[7/7] Testing stats endpoint...${NC}"
sleep 1  # Give DB a moment
STATS_RESPONSE=$(curl -s $API_URL/stats/$AGENT_ID \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Response: $STATS_RESPONSE"

if echo $STATS_RESPONSE | grep -q "agent_id"; then
    echo -e "${GREEN}✅ Stats retrieved successfully${NC}"
else
    echo -e "${RED}❌ Failed to get stats${NC}"
    exit 1
fi
echo ""

# Test 8: Dashboard
echo -e "${YELLOW}[BONUS] Testing dashboard endpoint...${NC}"
DASHBOARD_RESPONSE=$(curl -s $API_URL/dashboard \
    -H "Authorization: Bearer $ACCESS_TOKEN")

echo "   Response: $DASHBOARD_RESPONSE"

if echo $DASHBOARD_RESPONSE | grep -q "dashboard"; then
    echo -e "${GREEN}✅ Dashboard working${NC}"
else
    echo -e "${RED}❌ Dashboard failed${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 ALL TESTS PASSED! 🎉              ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}Test Summary:${NC}"
echo "   Email: $TEST_EMAIL"
echo "   Password: $TEST_PASSWORD"
echo "   User ID: $USER_ID"
echo "   Agent ID: $AGENT_ID"
echo "   API Key: $API_KEY"
echo ""
echo -e "${BLUE}You can now:${NC}"
echo "   1. Check Supabase → Authentication → Users"
echo "   2. Check Supabase → Table Editor → agents, api_keys, evals"
echo "   3. Use this API key with your SDK"
echo ""
echo -e "${GREEN}Auth flow is working perfectly! Ready to deploy! 🚀${NC}"

