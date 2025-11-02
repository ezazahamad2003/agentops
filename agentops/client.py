"""
AgentOps SDK Client

Wrapper for easy integration with LLM agents and applications.
Provides simple API for hallucination detection and reliability monitoring.
"""

from .detector_flexible import (
    detect_hallucination,
    get_throughput_stats,
    reset_throughput_tracker
)


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
    
    def __init__(self, api_key=None, track_throughput=True):
        """
        Initialize AgentOps client.
        
        Args:
            api_key: Optional API key for future cloud features
            track_throughput: Enable cumulative throughput tracking (default: True)
        """
        self.api_key = api_key
        self.track_throughput = track_throughput
        self._session_active = False
    
    @staticmethod
    def version():
        """Return the AgentOps SDK version."""
        from . import __version__
        return __version__
    
    def evaluate(self, prompt, response, retrieved_docs=None):
        """
        Evaluate an agent's response for hallucination and reliability metrics.
        
        Args:
            prompt: The original user question/prompt
            response: The agent's response text
            retrieved_docs: Optional list of retrieved evidence chunks (RAG mode)
        
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
        
        return detect_hallucination(
            prompt,
            response,
            retrieved_docs,
            track_throughput=self.track_throughput
        )
    
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

