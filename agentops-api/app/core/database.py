"""
Supabase database connection and utilities
"""
from supabase import create_client, Client
from loguru import logger
from .config import settings


class DatabaseManager:
    """Manages Supabase database connections"""
    
    def __init__(self):
        self._client: Client | None = None
        self._service_client: Client | None = None
    
    def get_client(self) -> Client:
        """Get standard Supabase client (respects RLS)"""
        if self._client is None:
            logger.info(f"Connecting to Supabase: {settings.supabase_url}")
            self._client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
        return self._client
    
    def get_service_client(self) -> Client:
        """Get service role client (bypasses RLS)"""
        if self._service_client is None:
            logger.info(f"Connecting to Supabase with service role")
            self._service_client = create_client(
                settings.supabase_url,
                settings.supabase_service_key
            )
        return self._service_client
    
    async def health_check(self) -> bool:
        """Check if database connection is healthy"""
        try:
            client = self.get_client()
            # Simple query to test connection
            result = client.table("evaluations").select("id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False


# Global database manager instance
db_manager = DatabaseManager()


def get_db() -> Client:
    """Dependency to get database client"""
    return db_manager.get_client()


def get_service_db() -> Client:
    """Dependency to get service role database client"""
    return db_manager.get_service_client()

