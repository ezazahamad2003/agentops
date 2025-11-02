"""
Auth-Enabled AgentOps API
Full Supabase Auth integration with JWT verification
"""
import os
import secrets
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from dotenv import load_dotenv
import uvicorn
import httpx

load_dotenv()

# Supabase clients
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

# Anon client for auth verification
supabase_anon: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY", os.getenv("SUPABASE_SERVICE_KEY"))
)

app = FastAPI(
    title="AgentOps API (Auth-Enabled)",
    description="LLM observability with Supabase Auth",
    version="0.2.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# AUTH HELPERS
# ============================================================================

async def verify_supabase_token(authorization: str = Header(...)) -> str:
    """
    Verify Supabase Auth JWT token and return user_id
    
    Expects: Authorization: Bearer <jwt_token>
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Use: Bearer <token>"
        )
    
    token = authorization.split(" ", 1)[1]
    
    # Verify token with Supabase
    try:
        # Use Supabase client to get user from token
        user_response = supabase_anon.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return user_response.user.id
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


async def verify_api_key_and_get_agent(x_api_key: str = Header(...)) -> dict:
    """
    Verify API key and return agent info
    Used for /metrics endpoint (doesn't require user JWT)
    """
    try:
        result = supabase.table("api_keys")\
            .select("agent_id, active, agent:agents(id, name, user_id)")\
            .eq("key", x_api_key)\
            .eq("active", True)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid or inactive API key")
        
        key_data = result.data[0]
        
        # Update last_used_at
        supabase.table("api_keys")\
            .update({"last_used_at": datetime.utcnow().isoformat()})\
            .eq("key", x_api_key)\
            .execute()
        
        return {
            "agent_id": key_data["agent_id"],
            "agent": key_data.get("agent", {})
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# MODELS
# ============================================================================

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterAgentRequest(BaseModel):
    name: str
    metadata: Optional[dict] = None


class MetricsRequest(BaseModel):
    model: Optional[str] = None
    prompt: str
    response: str
    retrieved_docs: Optional[List[str]] = None
    
    # Core metrics
    semantic_drift: float
    factual_support: float
    uncertainty: float
    hallucination_probability: float
    hallucinated: bool
    
    # Performance
    latency_sec: float
    throughput_qps: Optional[float] = None
    
    # Optional metadata
    meta: Optional[dict] = None


# ============================================================================
# AUTH ROUTES
# ============================================================================

@app.post("/auth/signup")
async def signup(req: SignUpRequest):
    """
    Sign up a new user with email/password
    
    Example:
        curl -X POST http://localhost:8000/auth/signup \
          -H "Content-Type: application/json" \
          -d '{"email":"user@example.com","password":"SecurePass123"}'
    """
    try:
        # Sign up user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password,
            "options": {
                "data": {
                    "full_name": req.full_name
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        return {
            "message": "User created successfully. Check your email to confirm.",
            "user_id": auth_response.user.id,
            "email": auth_response.user.email,
            "access_token": auth_response.session.access_token if auth_response.session else None
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/signin")
async def signin(req: SignInRequest):
    """
    Sign in with email/password
    
    Example:
        curl -X POST http://localhost:8000/auth/signin \
          -H "Content-Type: application/json" \
          -d '{"email":"user@example.com","password":"SecurePass123"}'
    """
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {
            "access_token": auth_response.session.access_token,
            "refresh_token": auth_response.session.refresh_token,
            "expires_in": auth_response.session.expires_in,
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.get("/auth/me")
async def get_current_user(user_id: str = Depends(verify_supabase_token)):
    """
    Get current authenticated user info
    
    Example:
        curl http://localhost:8000/auth/me \
          -H "Authorization: Bearer YOUR_JWT_TOKEN"
    """
    try:
        # Get user's agents
        agents = supabase.table("agents")\
            .select("id, name, created_at, metadata")\
            .eq("user_id", user_id)\
            .execute()
        
        return {
            "user_id": user_id,
            "agents": agents.data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# AGENT ROUTES
# ============================================================================

@app.post("/register")
async def register_agent(
    req: RegisterAgentRequest,
    user_id: str = Depends(verify_supabase_token)
):
    """
    Register a new agent (requires authentication)
    
    Example:
        curl -X POST http://localhost:8000/register \
          -H "Authorization: Bearer YOUR_JWT_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{"name":"my_bot"}'
    """
    try:
        # Create agent linked to user
        agent_data = {
            "name": req.name,
            "user_id": user_id,
            "metadata": req.metadata or {},
            "last_active_at": datetime.utcnow().isoformat()
        }
        
        agent_result = supabase.table("agents").insert(agent_data).execute()
        
        if not agent_result.data:
            raise HTTPException(status_code=500, detail="Failed to create agent")
        
        agent_id = agent_result.data[0]["id"]
        
        # Generate API key
        api_key = f"agentops_{secrets.token_urlsafe(32)}"
        
        key_data = {
            "agent_id": agent_id,
            "name": "default",
            "key": api_key,
            "active": True
        }
        
        key_result = supabase.table("api_keys").insert(key_data).execute()
        
        if not key_result.data:
            raise HTTPException(status_code=500, detail="Failed to create API key")
        
        return {
            "message": f"Agent '{req.name}' created successfully",
            "agent_id": agent_id,
            "api_key": api_key,
            "user_id": user_id
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agents")
async def list_agents(user_id: str = Depends(verify_supabase_token)):
    """
    List all agents for authenticated user
    
    Example:
        curl http://localhost:8000/agents \
          -H "Authorization: Bearer YOUR_JWT_TOKEN"
    """
    try:
        result = supabase.table("agents")\
            .select("id, name, created_at, last_active_at, metadata")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return {"agents": result.data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# METRICS ROUTES
# ============================================================================

@app.post("/metrics")
async def ingest_metrics(
    metrics: MetricsRequest,
    agent_info: dict = Depends(verify_api_key_and_get_agent)
):
    """
    Ingest evaluation metrics (uses API key, not JWT)
    
    Example:
        curl -X POST http://localhost:8000/metrics \
          -H "X-API-Key: agentops_xxxxx" \
          -H "Content-Type: application/json" \
          -d '{...metrics...}'
    """
    try:
        agent_id = agent_info["agent_id"]
        
        # Update agent last_active_at
        supabase.table("agents")\
            .update({"last_active_at": datetime.utcnow().isoformat()})\
            .eq("id", agent_id)\
            .execute()
        
        # Insert evaluation
        eval_data = {
            "agent_id": agent_id,
            "model": metrics.model,
            "prompt": metrics.prompt,
            "response": metrics.response,
            "retrieved_docs": metrics.retrieved_docs,
            "semantic_drift": metrics.semantic_drift,
            "factual_support": metrics.factual_support,
            "uncertainty": metrics.uncertainty,
            "hallucination_probability": metrics.hallucination_probability,
            "hallucinated": metrics.hallucinated,
            "latency_sec": metrics.latency_sec,
            "throughput_qps": metrics.throughput_qps,
            "meta": metrics.meta or {}
        }
        
        eval_result = supabase.table("evals").insert(eval_data).execute()
        
        if not eval_result.data:
            raise HTTPException(status_code=500, detail="Failed to store evaluation")
        
        return {
            "status": "ok",
            "eval_id": eval_result.data[0]["id"],
            "agent_id": agent_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats/{agent_id}")
async def get_agent_stats(
    agent_id: str,
    user_id: str = Depends(verify_supabase_token)
):
    """
    Get stats for a specific agent (must own the agent)
    
    Example:
        curl http://localhost:8000/stats/AGENT_ID \
          -H "Authorization: Bearer YOUR_JWT_TOKEN"
    """
    try:
        # Verify user owns this agent
        agent = supabase.table("agents")\
            .select("id")\
            .eq("id", agent_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if not agent.data:
            raise HTTPException(status_code=403, detail="Agent not found or access denied")
        
        # Get stats
        stats = supabase.table("agent_stats")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .execute()
        
        if not stats.data:
            return {
                "agent_id": agent_id,
                "total_evals": 0,
                "total_hallucinations": 0,
                "avg_hallucination_prob": 0.0,
                "avg_latency": 0.0,
                "avg_throughput": 0.0
            }
        
        return stats.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/dashboard")
async def get_dashboard(user_id: str = Depends(verify_supabase_token)):
    """
    Get dashboard with all agents and their stats
    
    Example:
        curl http://localhost:8000/dashboard \
          -H "Authorization: Bearer YOUR_JWT_TOKEN"
    """
    try:
        stats = supabase.table("user_agent_stats")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()
        
        return {"dashboard": stats.data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat(), "auth": "enabled"}


if __name__ == "__main__":
    uvicorn.run(
        "auth_main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )

