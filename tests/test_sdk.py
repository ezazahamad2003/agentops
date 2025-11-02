"""
Test suite for AgentOps SDK Client.

Tests the high-level SDK wrapper and session management.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from agentops import AgentOps


class TestAgentOpsClient:
    """Test AgentOps SDK client initialization and basic functionality."""
    
    def test_initialization(self):
        """Test SDK client can be initialized."""
        ops = AgentOps()
        assert ops.api_key is None
        assert ops.track_throughput is True
        assert ops._session_active is False
    
    def test_initialization_with_key(self):
        """Test SDK client with API key."""
        ops = AgentOps(api_key="test_key_123")
        assert ops.api_key == "test_key_123"
    
    def test_evaluate_basic(self):
        """Test basic evaluation returns expected fields."""
        ops = AgentOps()
        
        result = ops.evaluate(
            prompt="What is 2+2?",
            response="4"
        )
        
        # Truth metrics
        assert "hallucination_probability" in result
        assert "hallucinated" in result
        assert "semantic_drift" in result
        assert "factual_support" in result
        assert "uncertainty" in result
        assert "mode" in result
        
        # Reliability metrics
        assert "latency_sec" in result
        assert "throughput_qps" in result
        
        # Check session activated
        assert ops._session_active is True
    
    def test_evaluate_with_retrieved_docs(self):
        """Test evaluation in RAG mode."""
        ops = AgentOps()
        
        result = ops.evaluate(
            prompt="What is Python?",
            response="Python is a programming language.",
            retrieved_docs=["Python is a high-level programming language."]
        )
        
        assert result["mode"] == "retrieved-doc entailment"
        assert "latency_sec" in result


class TestSessionManagement:
    """Test session management features."""
    
    def test_start_session(self):
        """Test starting a new session."""
        ops = AgentOps()
        
        # Run one evaluation
        ops.evaluate("test", "test")
        
        # Start new session should reset
        ops.start_session()
        assert ops._session_active is True
        
        stats = ops.metrics()
        assert stats["total_evaluations"] == 0
    
    def test_end_session(self):
        """Test ending a session returns stats."""
        ops = AgentOps()
        ops.start_session()
        
        # Run evaluations
        ops.evaluate("test1", "answer1")
        ops.evaluate("test2", "answer2")
        
        # End session
        stats = ops.end_session()
        
        assert stats["total_evaluations"] == 2
        assert stats["total_time_sec"] > 0
        assert ops._session_active is False
    
    def test_reset_metrics(self):
        """Test resetting metrics."""
        ops = AgentOps()
        
        # Run some evaluations
        ops.evaluate("test", "answer")
        ops.evaluate("test2", "answer2")
        
        # Reset
        ops.reset_metrics()
        
        stats = ops.metrics()
        assert stats["total_evaluations"] == 0
        assert stats["total_time_sec"] == 0
        assert ops._session_active is False
    
    def test_context_manager(self):
        """Test context manager auto-session management."""
        with AgentOps() as ops:
            assert ops._session_active is True
            
            ops.evaluate("test", "answer")
            stats = ops.metrics()
            assert stats["total_evaluations"] == 1
        
        # After context exit, session should be ended
        # (Note: ops is still accessible but session is ended)


class TestMetrics:
    """Test metrics retrieval."""
    
    def test_get_metrics(self):
        """Test getting metrics without evaluation."""
        ops = AgentOps()
        ops.reset_metrics()
        
        stats = ops.metrics()
        
        assert "total_evaluations" in stats
        assert "total_time_sec" in stats
        assert "throughput_qps" in stats
        assert stats["total_evaluations"] == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

