"""
API routes for metrics (SDK compatibility endpoint)
This endpoint maintains compatibility with the deployed SDK
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from datetime import datetime
from loguru import logger

from ..models.evaluation import EvaluationCreate
from ..core.database import get_service_db
from ..core.security import verify_api_key

router = APIRouter(tags=["metrics"])


@router.post("/metrics", response_model=dict, status_code=201)
async def create_metric(
    evaluation: EvaluationCreate,
    x_api_key: str = Header(..., alias="X-API-Key", description="Your AgentOps API key"),
    db=Depends(get_service_db)
):
    """
    Create a new evaluation entry (SDK compatibility endpoint)
    
    This endpoint maintains compatibility with the deployed SDK.
    It's an alias for POST /evaluations/ with the same functionality.
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
        
        logger.info(f"Created evaluation {result.data[0]['id']} for user {user_info['user_id']} via /metrics endpoint")
        
        return {
            "eval_id": result.data[0]["id"],
            "status": "success",
            "message": "Evaluation stored successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating evaluation via /metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

