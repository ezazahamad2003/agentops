"""
AgentOps API - FastAPI Backend for LLM Agent Observability

Main application entry point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
import sys
from contextlib import asynccontextmanager

from app.core.config import settings
from app.routes import evaluations, auth, health, api_keys, metrics


# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level="INFO"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle events for the FastAPI application
    """
    # Startup
    logger.info("Starting AgentOps API...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Supabase URL: {settings.supabase_url}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AgentOps API...")


# Create FastAPI application
app = FastAPI(
    title="AgentOps API",
    description="Backend API for LLM Agent Observability - Monitor hallucinations, latency, and throughput",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler for unhandled errors
    """
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "type": type(exc).__name__
        }
    )


# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(api_keys.router)
app.include_router(evaluations.router)
app.include_router(metrics.router)  # SDK compatibility endpoint


# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": "AgentOps API",
        "version": "0.1.0",
        "description": "Backend API for LLM Agent Observability",
        "docs": "/docs",
        "health": "/health",
        "status": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
        log_level="info"
    )

