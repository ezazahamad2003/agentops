"""
Authentication routes for user management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from loguru import logger
import secrets

from ..models.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    APIKeyCreate,
    APIKeyResponse,
    APIKeyListItem
)
from ..core.database import get_service_db
from ..core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user: UserCreate, db=Depends(get_service_db)):
    """
    Register a new user
    """
    try:
        # Check if user already exists
        existing = db.table("users")\
            .select("id")\
            .eq("email", user.email)\
            .execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user.password)
        
        # Create user
        user_data = {
            "email": user.email,
            "hashed_password": hashed_password,
            "full_name": user.full_name,
            "is_active": True
        }
        
        result = db.table("users").insert(user_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        logger.info(f"New user registered: {user.email}")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db=Depends(get_service_db)):
    """
    Login and receive JWT access token
    """
    try:
        # Find user
        result = db.table("users")\
            .select("*")\
            .eq("email", credentials.email)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        user = result.data[0]
        
        # Verify password
        if not verify_password(credentials.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Check if user is active
        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": user["id"], "email": user["email"]},
            expires_delta=access_token_expires
        )
        
        logger.info(f"User logged in: {credentials.email}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user), db=Depends(get_service_db)):
    """
    Get current user information
    """
    try:
        result = db.table("users")\
            .select("*")\
            .eq("id", current_user["user_id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user info: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/api-keys", response_model=APIKeyResponse, status_code=201)
async def create_api_key(
    key_data: APIKeyCreate,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_service_db)
):
    """
    Create a new API key for the authenticated user
    
    The full API key is only shown once. Store it securely!
    """
    try:
        # Generate a secure random API key
        api_key = f"agops_{secrets.token_urlsafe(32)}"
        
        # Store API key
        key_entry = {
            "user_id": current_user["user_id"],
            "name": key_data.name,
            "key": api_key,
            "is_active": True
        }
        
        result = db.table("api_keys").insert(key_entry).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create API key")
        
        logger.info(f"Created API key '{key_data.name}' for user {current_user['user_id']}")
        
        return {
            **result.data[0],
            "key": api_key  # Only returned once!
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating API key: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/api-keys", response_model=list[APIKeyListItem])
async def list_api_keys(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_service_db)
):
    """
    List all API keys for the authenticated user
    
    Note: Full keys are not returned, only previews
    """
    try:
        result = db.table("api_keys")\
            .select("id, name, key, created_at, last_used_at, is_active")\
            .eq("user_id", current_user["user_id"])\
            .order("created_at", desc=True)\
            .execute()
        
        # Add key preview (first 10 and last 3 characters)
        keys = []
        for key in result.data:
            key_preview = f"{key['key'][:10]}...{key['key'][-3:]}"
            keys.append({
                **key,
                "key_preview": key_preview,
                "key": None  # Remove full key
            })
            del keys[-1]["key"]
        
        return keys
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing API keys: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/api-keys/{key_id}", status_code=204)
async def delete_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_service_db)
):
    """
    Delete an API key
    """
    try:
        result = db.table("api_keys")\
            .delete()\
            .eq("id", key_id)\
            .eq("user_id", current_user["user_id"])\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="API key not found")
        
        logger.info(f"Deleted API key {key_id}")
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting API key: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

