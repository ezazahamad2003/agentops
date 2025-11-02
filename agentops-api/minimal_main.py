"""
Minimal AgentOps API - MVP Version
Just 3 endpoints: /register, /metrics, /health
"""
import os
import secrets
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import uvicorn

load_dotenv()

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

app = FastAPI(
    title="AgentOps API",
    description="Minimal API for LLM observability",
    version="0.1.0"
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
# MODELS
# ============================================================================

class RegisterRequest(BaseModel):
    name: str
    metadata: Optional[dict] = None


class RegisterResponse(BaseModel):
    agent_id: str
    api_key: str
    message: str


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
# ROUTES
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/register", response_model=RegisterResponse)
async def register_agent(req: RegisterRequest):
    """
    Create a new agent and return API key
    
    Example:
        curl -X POST http://localhost:8000/register \
          -H "Content-Type: application/json" \
          -d '{"name":"qa_bot"}'
    """
    try:
        # Create agent
        agent_data = {
            "name": req.name,
            "metadata": req.metadata or {},
            "last_active_at": datetime.utcnow().isoformat()
        }
        
        agent_result = supabase.table("agents").insert(agent_data).execute()
        
        if not agent_result.data:
            raise HTTPException(status_code=500, detail="Failed to create agent")
        
        agent_id = agent_result.data[0]["id"]
        
        # Generate API key
        api_key = f"agentops_{secrets.token_urlsafe(32)}"
        
        # Store API key
        key_data = {
            "agent_id": agent_id,
            "name": "default",
            "key": api_key,
            "active": True
        }
        
        key_result = supabase.table("api_keys").insert(key_data).execute()
        
        if not key_result.data:
            raise HTTPException(status_code=500, detail="Failed to create API key")
        
        return RegisterResponse(
            agent_id=agent_id,
            api_key=api_key,
            message=f"Agent '{req.name}' created successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/metrics")
async def ingest_metrics(
    metrics: MetricsRequest,
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Ingest evaluation metrics
    
    Example:
        curl -X POST http://localhost:8000/metrics \
          -H "X-API-Key: agentops_xxxxx" \
          -H "Content-Type: application/json" \
          -d '{
            "model":"gpt-4o-mini",
            "prompt":"What is AI?",
            "response":"AI is...",
            "semantic_drift":0.2,
            "factual_support":0.8,
            "uncertainty":0.1,
            "hallucination_probability":0.12,
            "hallucinated":false,
            "latency_sec":1.1,
            "throughput_qps":0.9
          }'
    """
    try:
        # Verify API key and get agent_id
        key_result = supabase.table("api_keys")\
            .select("agent_id, active")\
            .eq("key", x_api_key)\
            .eq("active", True)\
            .execute()
        
        if not key_result.data:
            raise HTTPException(status_code=401, detail="Invalid or inactive API key")
        
        agent_id = key_result.data[0]["agent_id"]
        
        # Update last_used_at for API key
        supabase.table("api_keys")\
            .update({"last_used_at": datetime.utcnow().isoformat()})\
            .eq("key", x_api_key)\
            .execute()
        
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
    x_api_key: str = Header(..., alias="X-API-Key")
):
    """
    Get aggregated statistics for an agent
    
    Example:
        curl http://localhost:8000/stats/AGENT_ID \
          -H "X-API-Key: agentops_xxxxx"
    """
    try:
        # Verify API key belongs to this agent
        key_result = supabase.table("api_keys")\
            .select("agent_id")\
            .eq("key", x_api_key)\
            .eq("agent_id", agent_id)\
            .eq("active", True)\
            .execute()
        
        if not key_result.data:
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        # Get stats from view
        stats_result = supabase.table("agent_stats")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .execute()
        
        if not stats_result.data:
            return {
                "agent_id": agent_id,
                "total_evals": 0,
                "total_hallucinations": 0,
                "avg_hallucination_prob": 0.0,
                "avg_latency": 0.0,
                "avg_throughput": 0.0
            }
        
        return stats_result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))  # Cloud Run default
    uvicorn.run(
        "minimal_main:app",
        host="0.0.0.0",
        port=port,
        reload=False  # Production mode
    )

