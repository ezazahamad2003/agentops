"""
API Keys Routes - CRUD operations for API key management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from datetime import datetime
from loguru import logger
import secrets

from app.core.database import get_supabase
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


class ApiKeyCreate(BaseModel):
    name: str


class ApiKeyResponse(BaseModel):
    id: str
    name: str
    key: str
    active: bool
    created_at: str
    last_used_at: str | None


class ApiKeyListResponse(BaseModel):
    id: str
    name: str
    key_preview: str  # Only show last 4 characters
    active: bool
    created_at: str
    last_used_at: str | None


def generate_api_key() -> str:
    """Generate a secure API key"""
    return f"agentops_{secrets.token_urlsafe(32)}"


@router.post("/", response_model=ApiKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    api_key_data: ApiKeyCreate,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    Create a new API key for the authenticated user
    """
    try:
        user_id = current_user["id"]
        
        # Generate API key
        api_key = generate_api_key()
        
        # Create agent first (required by foreign key)
        agent_response = supabase.table("agents").insert({
            "name": api_key_data.name,
            "metadata": {"created_by": user_id, "created_from": "frontend"}
        }).execute()
        
        if not agent_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create agent"
            )
        
        agent_id = agent_response.data[0]["id"]
        
        # Create API key
        key_response = supabase.table("api_keys").insert({
            "agent_id": agent_id,
            "name": api_key_data.name,
            "key": api_key,
            "active": True
        }).execute()
        
        if not key_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create API key"
            )
        
        key_data = key_response.data[0]
        
        logger.info(f"Created API key for user {user_id}: {api_key_data.name}")
        
        return ApiKeyResponse(
            id=key_data["id"],
            name=key_data["name"],
            key=key_data["key"],
            active=key_data["active"],
            created_at=key_data["created_at"],
            last_used_at=key_data.get("last_used_at")
        )
        
    except Exception as e:
        logger.error(f"Error creating API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create API key: {str(e)}"
        )


@router.get("/", response_model=List[ApiKeyListResponse])
async def list_api_keys(
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    List all API keys for the authenticated user
    """
    try:
        user_id = current_user["id"]
        
        # Get all agents created by this user
        agents_response = supabase.table("agents").select("id").eq("metadata->>created_by", user_id).execute()
        
        if not agents_response.data:
            return []
        
        agent_ids = [agent["id"] for agent in agents_response.data]
        
        # Get API keys for these agents
        keys_response = supabase.table("api_keys").select("*").in_("agent_id", agent_ids).eq("active", True).execute()
        
        if not keys_response.data:
            return []
        
        # Return keys with masked values
        return [
            ApiKeyListResponse(
                id=key["id"],
                name=key["name"],
                key_preview=f"...{key['key'][-4:]}",
                active=key["active"],
                created_at=key["created_at"],
                last_used_at=key.get("last_used_at")
            )
            for key in keys_response.data
        ]
        
    except Exception as e:
        logger.error(f"Error listing API keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list API keys: {str(e)}"
        )


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    """
    Delete (deactivate) an API key
    """
    try:
        user_id = current_user["id"]
        
        # Verify key belongs to user's agent
        key_response = supabase.table("api_keys").select("agent_id").eq("id", key_id).execute()
        
        if not key_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="API key not found"
            )
        
        agent_id = key_response.data[0]["agent_id"]
        
        # Verify agent belongs to user
        agent_response = supabase.table("agents").select("metadata").eq("id", agent_id).execute()
        
        if not agent_response.data or agent_response.data[0].get("metadata", {}).get("created_by") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this API key"
            )
        
        # Soft delete - set active to false
        supabase.table("api_keys").update({"active": False}).eq("id", key_id).execute()
        
        logger.info(f"Deactivated API key {key_id} for user {user_id}")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete API key: {str(e)}"
        )
