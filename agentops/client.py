"""
AgentOps SDK Client

Wrapper for easy integration with LLM agents and applications.
Provides simple API for hallucination detection and reliability monitoring.
"""

from typing import Optional
import httpx
from loguru import logger

from .detector_flexible import (
    detect_hallucination,
    get_throughput_stats,
    reset_throughput_tracker
)

# Suppress loguru unless explicitly configured
logger.disable("agentops")


class AgentOps:
    """
    AgentOps SDK Client for AI Reliability Engineering.
    
    Monitor your LLM agents for:
    - Hallucinations (truth quality)
    - Latency (system health)
    - Throughput (scalability)
    
    Example:
        ```python
        from agentops import AgentOps
        
        ops = AgentOps(api_key="your_key")
        
        # Evaluate a response
        result = ops.evaluate(
            prompt="What is AI?",
            response="AI is artificial intelligence..."
        )
        
        print(f"Hallucinated: {result['hallucinated']}")
        print(f"Latency: {result['latency_sec']}s")
        ```
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        track_throughput: bool = True,
        auto_upload: bool = True
    ):
        """
        Initialize AgentOps client.
        
        Args:
            api_key: AgentOps API key (from dashboard or auth/api-keys endpoint)
            api_url: AgentOps API base URL (default: None, local evaluation only)
            track_throughput: Enable cumulative throughput tracking (default: True)
            auto_upload: Automatically upload evaluations to API when api_key is set (default: True)
        
        Examples:
            # Local only (no API)
            ops = AgentOps()
            
            # With API integration
            ops = AgentOps(
                api_key="agops_xxxxxxxxxxxxx",
                api_url="https://your-api.com"
            )
        """
        self.api_key = api_key
        self.api_url = api_url.rstrip('/') if api_url else None
        self.track_throughput = track_throughput
        self.auto_upload = auto_upload and api_key is not None and api_url is not None
        self._session_active = False
        
        if self.auto_upload:
            logger.enable("agentops")
            logger.info(f"AgentOps API integration enabled: {self.api_url}")
    
    @staticmethod
    def version():
        """Return the AgentOps SDK version."""
        from . import __version__
        return __version__
    
    def evaluate(
        self,
        prompt: str,
        response: str,
        retrieved_docs: Optional[list[str]] = None,
        model_name: Optional[str] = None,
        agent_name: Optional[str] = None,
        session_id: Optional[str] = None,
        upload: Optional[bool] = None
    ):
        """
        Evaluate an agent's response for hallucination and reliability metrics.
        
        Args:
            prompt: The original user question/prompt
            response: The agent's response text
            retrieved_docs: Optional list of retrieved evidence chunks (RAG mode)
            model_name: Name of the LLM model used (e.g., "gpt-4o-mini")
            agent_name: Name of your agent (e.g., "customer_support_bot")
            session_id: Optional session identifier for batch tracking
            upload: Override auto_upload for this evaluation (default: use self.auto_upload)
        
        Returns:
            dict: {
                # Truth metrics
                'hallucination_probability': float,
                'hallucinated': bool,
                'semantic_drift': float,
                'factual_support': float,
                'uncertainty': float,
                'mode': str,
                
                # Reliability metrics
                'latency_sec': float,
                'throughput_qps': float
            }
        """
        if not self._session_active:
            self._session_active = True
        
        # Run local evaluation
        result = detect_hallucination(
            prompt,
            response,
            retrieved_docs,
            track_throughput=self.track_throughput
        )
        
        # Upload to API if enabled
        should_upload = upload if upload is not None else self.auto_upload
        if should_upload:
            try:
                self._upload_evaluation(
                    result=result,
                    prompt=prompt,
                    response=response,
                    retrieved_docs=retrieved_docs,
                    model_name=model_name,
                    agent_name=agent_name,
                    session_id=session_id
                )
            except Exception as e:
                logger.warning(f"Failed to upload evaluation to API: {e}")
        
        return result
    
    def _upload_evaluation(
        self,
        result: dict,
        prompt: str,
        response: str,
        retrieved_docs: Optional[list[str]],
        model_name: Optional[str],
        agent_name: Optional[str],
        session_id: Optional[str]
    ):
        """
        Upload evaluation to AgentOps API.
        
        Internal method - called automatically when auto_upload is enabled.
        """
        if not self.api_url or not self.api_key:
            return
        
        payload = {
            "prompt": prompt,
            "response": response,
            "retrieved_docs": retrieved_docs,
            "semantic_drift": result["semantic_drift"],
            "uncertainty": result["uncertainty"],
            "factual_support": result["factual_support"],
            "hallucination_probability": result["hallucination_probability"],
            "hallucinated": result["hallucinated"],
            "latency_sec": result["latency_sec"],
            "throughput_qps": result.get("throughput_qps"),
            "mode": result["mode"],
            "model_name": model_name,
            "agent_name": agent_name,
            "session_id": session_id
        }
        
        try:
            with httpx.Client(timeout=5.0) as client:
                resp = client.post(
                    f"{self.api_url}/evaluations/",
                    json=payload,
                    headers={"X-API-Key": self.api_key}
                )
                resp.raise_for_status()
                logger.debug(f"Uploaded evaluation {resp.json().get('id')}")
        except httpx.HTTPError as e:
            logger.warning(f"API upload failed: {e}")
            raise
    
    def metrics(self):
        """
        Return cumulative throughput statistics.
        
        Returns:
            dict: {
                'total_evaluations': int,
                'total_time_sec': float,
                'throughput_qps': float
            }
        """
        return get_throughput_stats()
    
    def reset_metrics(self):
        """
        Reset global throughput tracker (for new test sessions).
        
        Useful when:
        - Starting a new benchmark
        - Beginning a new user session
        - Testing different configurations
        """
        reset_throughput_tracker()
        self._session_active = False
    
    def start_session(self):
        """
        Start a new monitoring session with fresh metrics.
        """
        self.reset_metrics()
        self._session_active = True
    
    def end_session(self):
        """
        End the current session and return final metrics.
        
        Returns:
            dict: Final session statistics
        """
        stats = self.metrics()
        self._session_active = False
        return stats
    
    def __enter__(self):
        """Context manager entry."""
        self.start_session()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.end_session()
        return False

