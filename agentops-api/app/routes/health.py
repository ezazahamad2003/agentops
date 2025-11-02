"""
Health check and system status routes
"""
from fastapi import APIRouter, Depends
from datetime import datetime
from ..core.database import db_manager

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
async def health_check():
    """
    Basic health check endpoint
    
    Returns status and timestamp
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "agentops-api",
        "version": "0.1.0"
    }


@router.get("/db")
async def database_health():
    """
    Check database connection health
    """
    is_healthy = await db_manager.health_check()
    
    return {
        "database": "healthy" if is_healthy else "unhealthy",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/ready")
async def readiness_check():
    """
    Kubernetes-style readiness probe
    
    Checks if the service is ready to accept traffic
    """
    db_healthy = await db_manager.health_check()
    
    if not db_healthy:
        return {
            "ready": False,
            "reason": "Database connection failed"
        }, 503
    
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat()
    }

