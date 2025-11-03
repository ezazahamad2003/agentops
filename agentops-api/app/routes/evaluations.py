"""
API routes for evaluation management
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from typing import List, Optional
from datetime import datetime, timedelta
from loguru import logger

from ..models.evaluation import (
    EvaluationCreate,
    EvaluationResponse,
    EvaluationStats,
    BatchEvaluationRequest
)
from ..core.database import get_service_db
from ..core.security import verify_api_key, get_current_user

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.post("/", response_model=dict, status_code=201)
async def create_evaluation(
    evaluation: EvaluationCreate,
    x_api_key: str = Header(..., description="Your AgentOps API key"),
    db=Depends(get_service_db)
):
    """
    Create a new evaluation entry
    
    This endpoint receives evaluation data from the SDK and stores it in the database.
    """
    try:
        # Verify API key
        user_info = await verify_api_key(x_api_key)
        
        # Prepare data for insertion
        eval_data = evaluation.model_dump()
        eval_data["user_id"] = user_info["user_id"]
        eval_data["created_at"] = datetime.utcnow().isoformat()
        
        # Insert into database
        result = db.table("evaluations").insert(eval_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create evaluation")
        
        logger.info(f"Created evaluation {result.data[0]['id']} for user {user_info['user_id']}")
        
        return {
            "id": result.data[0]["id"],
            "status": "created",
            "message": "Evaluation stored successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating evaluation: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=dict, status_code=201)
async def create_batch_evaluations(
    batch: BatchEvaluationRequest,
    x_api_key: str = Header(..., description="Your AgentOps API key"),
    db=Depends(get_service_db)
):
    """
    Create multiple evaluations in a single request
    
    Useful for batch processing and session-based tracking.
    """
    try:
        # Verify API key
        user_info = await verify_api_key(x_api_key)
        
        # Prepare all evaluations
        eval_list = []
        for evaluation in batch.evaluations:
            eval_data = evaluation.model_dump()
            eval_data["user_id"] = user_info["user_id"]
            eval_data["created_at"] = datetime.utcnow().isoformat()
            eval_list.append(eval_data)
        
        # Batch insert
        result = db.table("evaluations").insert(eval_list).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create batch evaluations")
        
        logger.info(f"Created {len(result.data)} evaluations for user {user_info['user_id']}")
        
        return {
            "count": len(result.data),
            "status": "created",
            "message": f"Successfully stored {len(result.data)} evaluations"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating batch evaluations: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/", response_model=List[EvaluationResponse])
async def list_evaluations(
    limit: int = Query(default=50, le=1000, description="Number of evaluations to return"),
    offset: int = Query(default=0, ge=0, description="Number of evaluations to skip"),
    agent_name: Optional[str] = Query(None, description="Filter by agent name"),
    hallucinated: Optional[bool] = Query(None, description="Filter by hallucination status"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_service_db)
):
    """
    List evaluations for the authenticated user (JWT auth)
    
    Supports filtering by agent name, hallucination status, and date range.
    """
    try:
        # Get user info from JWT
        user_info = {"user_id": current_user["user_id"]}
        
        # Build query
        query = db.table("evaluations")\
            .select("*")\
            .eq("user_id", user_info["user_id"])\
            .order("created_at", desc=True)\
            .limit(limit)\
            .range(offset, offset + limit - 1)
        
        # Apply filters
        if agent_name:
            query = query.eq("agent_name", agent_name)
        if hallucinated is not None:
            query = query.eq("hallucinated", hallucinated)
        if start_date:
            query = query.gte("created_at", start_date.isoformat())
        if end_date:
            query = query.lte("created_at", end_date.isoformat())
        
        result = query.execute()
        
        return result.data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing evaluations: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/stats", response_model=EvaluationStats)
async def get_evaluation_stats(
    days: int = Query(default=7, le=365, description="Number of days to include in stats"),
    agent_name: Optional[str] = Query(None, description="Filter by agent name"),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_service_db)
):
    """
    Get aggregated statistics for evaluations (JWT auth)
    
    Returns metrics like hallucination rate, average latency, and throughput.
    """
    try:
        # Get user info from JWT
        user_info = {"user_id": current_user["user_id"]}
        
        # Calculate date threshold
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Build query
        query = db.table("evaluations")\
            .select("*")\
            .eq("user_id", user_info["user_id"])\
            .gte("created_at", start_date.isoformat())
        
        if agent_name:
            query = query.eq("agent_name", agent_name)
        
        result = query.execute()
        evaluations = result.data
        
        if not evaluations:
            return EvaluationStats(
                total_evaluations=0,
                total_hallucinations=0,
                hallucination_rate=0.0,
                avg_latency=0.0,
                avg_throughput=0.0,
                avg_semantic_drift=0.0,
                avg_uncertainty=0.0,
                avg_factual_support=0.0
            )
        
        # Calculate statistics
        total = len(evaluations)
        hallucinations = sum(1 for e in evaluations if e["hallucinated"])
        
        avg_latency = sum(e["latency_sec"] for e in evaluations) / total
        avg_throughput = sum(e.get("throughput_qps", 0) or 0 for e in evaluations) / total
        avg_drift = sum(e["semantic_drift"] for e in evaluations) / total
        avg_uncertainty = sum(e["uncertainty"] for e in evaluations) / total
        avg_factual = sum(e["factual_support"] for e in evaluations) / total
        
        return EvaluationStats(
            total_evaluations=total,
            total_hallucinations=hallucinations,
            hallucination_rate=round(hallucinations / total, 4),
            avg_latency=round(avg_latency, 4),
            avg_throughput=round(avg_throughput, 4),
            avg_semantic_drift=round(avg_drift, 4),
            avg_uncertainty=round(avg_uncertainty, 4),
            avg_factual_support=round(avg_factual, 4)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating stats: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{evaluation_id}", response_model=EvaluationResponse)
async def get_evaluation(
    evaluation_id: str,
    x_api_key: str = Header(..., description="Your AgentOps API key"),
    db=Depends(get_service_db)
):
    """
    Get a specific evaluation by ID
    """
    try:
        # Verify API key
        user_info = await verify_api_key(x_api_key)
        
        # Query evaluation
        result = db.table("evaluations")\
            .select("*")\
            .eq("id", evaluation_id)\
            .eq("user_id", user_info["user_id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching evaluation: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{evaluation_id}", status_code=204)
async def delete_evaluation(
    evaluation_id: str,
    x_api_key: str = Header(..., description="Your AgentOps API key"),
    db=Depends(get_service_db)
):
    """
    Delete an evaluation by ID
    """
    try:
        # Verify API key
        user_info = await verify_api_key(x_api_key)
        
        # Delete evaluation
        result = db.table("evaluations")\
            .delete()\
            .eq("id", evaluation_id)\
            .eq("user_id", user_info["user_id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        logger.info(f"Deleted evaluation {evaluation_id}")
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting evaluation: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

