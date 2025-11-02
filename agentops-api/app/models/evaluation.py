"""
Pydantic models for evaluation data
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class EvaluationCreate(BaseModel):
    """Model for creating a new evaluation"""
    prompt: str = Field(..., description="The user prompt/question")
    response: str = Field(..., description="The LLM response")
    retrieved_docs: Optional[List[str]] = Field(None, description="Retrieved documents (RAG mode)")
    
    # Metrics
    semantic_drift: float = Field(..., ge=0, le=1)
    uncertainty: float = Field(..., ge=0, le=1)
    factual_support: float = Field(..., ge=0, le=1)
    hallucination_probability: float = Field(..., ge=0, le=1)
    hallucinated: bool
    
    # Performance
    latency_sec: float = Field(..., gt=0)
    throughput_qps: Optional[float] = None
    
    # Metadata
    mode: str = Field(..., description="Detection mode: 'retrieved-doc entailment' or 'self-check'")
    model_name: Optional[str] = Field(None, description="Name of the LLM model used")
    agent_name: Optional[str] = Field(None, description="Name of the agent")
    session_id: Optional[str] = Field(None, description="Session identifier for batch tracking")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "What is the capital of France?",
                "response": "Paris is the capital and largest city of France.",
                "retrieved_docs": None,
                "semantic_drift": 0.15,
                "uncertainty": 0.0,
                "factual_support": 0.95,
                "hallucination_probability": 0.08,
                "hallucinated": False,
                "latency_sec": 0.42,
                "throughput_qps": 2.38,
                "mode": "self-check",
                "model_name": "gpt-4o-mini",
                "agent_name": "qa_assistant"
            }
        }


class EvaluationResponse(BaseModel):
    """Model for evaluation response"""
    id: str
    user_id: str
    created_at: datetime
    
    # All fields from EvaluationCreate
    prompt: str
    response: str
    retrieved_docs: Optional[List[str]]
    semantic_drift: float
    uncertainty: float
    factual_support: float
    hallucination_probability: float
    hallucinated: bool
    latency_sec: float
    throughput_qps: Optional[float]
    mode: str
    model_name: Optional[str]
    agent_name: Optional[str]
    session_id: Optional[str]


class EvaluationStats(BaseModel):
    """Aggregated evaluation statistics"""
    total_evaluations: int
    total_hallucinations: int
    hallucination_rate: float
    avg_latency: float
    avg_throughput: float
    avg_semantic_drift: float
    avg_uncertainty: float
    avg_factual_support: float
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_evaluations": 150,
                "total_hallucinations": 12,
                "hallucination_rate": 0.08,
                "avg_latency": 0.52,
                "avg_throughput": 1.92,
                "avg_semantic_drift": 0.23,
                "avg_uncertainty": 0.15,
                "avg_factual_support": 0.82
            }
        }


class BatchEvaluationRequest(BaseModel):
    """Request model for batch evaluation"""
    evaluations: List[EvaluationCreate] = Field(..., min_length=1, max_length=100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "evaluations": [
                    {
                        "prompt": "What is AI?",
                        "response": "AI is artificial intelligence...",
                        "semantic_drift": 0.12,
                        "uncertainty": 0.0,
                        "factual_support": 0.90,
                        "hallucination_probability": 0.08,
                        "hallucinated": False,
                        "latency_sec": 0.35,
                        "mode": "self-check"
                    }
                ]
            }
        }

