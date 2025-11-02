"""
Test suite for hallucination detector with reliability metrics.

Tests both RAG mode and no-RAG mode with various scenarios.
Tests truth metrics (drift, uncertainty, factual support) and
reliability metrics (latency, throughput).
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from agentops.detector_flexible import (
    detect_hallucination,
    uncertainty_score,
    cosine,
    get_embedding,
    reset_throughput_tracker,
    get_throughput_stats
)


class TestUncertaintyScore:
    """Test uncertainty language detection."""
    
    def test_no_uncertainty(self):
        text = "The capital of France is Paris."
        score = uncertainty_score(text)
        assert score == 0.0
    
    def test_single_uncertainty_cue(self):
        text = "Maybe the capital is Paris."
        score = uncertainty_score(text)
        assert score == 0.2
    
    def test_multiple_uncertainty_cues(self):
        text = "Maybe probably perhaps the capital is Paris."
        score = uncertainty_score(text)
        assert score == pytest.approx(0.6)
    
    def test_max_uncertainty_cap(self):
        text = "maybe probably unsure not sure might perhaps possibly"
        score = uncertainty_score(text)
        assert score == 1.0  # Capped at 1.0


class TestCosineHelper:
    """Test cosine similarity calculation."""
    
    def test_identical_vectors(self):
        v1 = [1, 0, 0]
        v2 = [1, 0, 0]
        assert cosine(v1, v2) == pytest.approx(1.0)
    
    def test_orthogonal_vectors(self):
        v1 = [1, 0, 0]
        v2 = [0, 1, 0]
        assert cosine(v1, v2) == pytest.approx(0.0)
    
    def test_opposite_vectors(self):
        v1 = [1, 0, 0]
        v2 = [-1, 0, 0]
        assert cosine(v1, v2) == pytest.approx(-1.0)


class TestRAGMode:
    """Test hallucination detection with retrieved documents."""
    
    def test_supported_response(self):
        """Response fully supported by retrieved docs."""
        reset_throughput_tracker()  # Start fresh
        
        prompt = "What are common side effects of aspirin?"
        retrieved_docs = [
            "Aspirin commonly causes stomach upset, nausea, and heartburn.",
            "Some people may experience allergic reactions."
        ]
        response = "Common side effects of aspirin include stomach upset, nausea, and heartburn."
        
        result = detect_hallucination(prompt, response, retrieved_docs)
        
        # Truth metrics
        assert result["mode"] == "retrieved-doc entailment"
        assert "semantic_drift" in result
        assert "uncertainty" in result
        assert "factual_support" in result
        assert "hallucination_probability" in result
        assert isinstance(result["hallucinated"], bool)
        
        # Reliability metrics
        assert "latency_sec" in result
        assert "throughput_qps" in result
        assert result["latency_sec"] > 0
        assert result["throughput_qps"] > 0
    
    def test_unsupported_response(self):
        """Response contains information not in retrieved docs."""
        prompt = "What are common side effects of aspirin?"
        retrieved_docs = [
            "Aspirin commonly causes stomach upset, nausea, and heartburn."
        ]
        response = "Aspirin causes hair loss and purple skin discoloration."
        
        result = detect_hallucination(prompt, response, retrieved_docs)
        
        assert result["mode"] == "retrieved-doc entailment"
        # Should have low factual support (≤ 0.5 indicating unsupported/uncertain)
        assert result["factual_support"] <= 0.5
        # Verify reliability metrics present
        assert "latency_sec" in result
        assert "throughput_qps" in result


class TestNoRAGMode:
    """Test hallucination detection without retrieved documents."""
    
    def test_factually_correct(self):
        """Well-known factual response."""
        prompt = "Who discovered penicillin?"
        response = "Penicillin was discovered by Alexander Fleming in 1928."
        
        result = detect_hallucination(prompt, response)
        
        assert result["mode"] == "self-check"
        assert result["hallucinated"] is False
    
    def test_with_uncertainty_language(self):
        """Response with uncertain language."""
        prompt = "What is the population of Mars?"
        response = "Maybe there are probably a few thousand people on Mars."
        
        result = detect_hallucination(prompt, response)
        
        assert result["mode"] == "self-check"
        assert result["uncertainty"] > 0.0


class TestHallucinationThreshold:
    """Test hallucination probability thresholding."""
    
    def test_threshold_value(self):
        """Verify threshold is at 0.45."""
        # This is a simple test to document the threshold
        prompt = "Test question"
        response = "Test answer"
        
        result = detect_hallucination(prompt, response)
        
        # Threshold is 0.45
        if result["hallucination_probability"] > 0.45:
            assert result["hallucinated"] is True
        else:
            assert result["hallucinated"] is False


class TestReliabilityMetrics:
    """Test latency and throughput tracking."""
    
    def test_latency_tracking(self):
        """Verify latency is measured and reasonable."""
        prompt = "What is 2+2?"
        response = "4"
        
        result = detect_hallucination(prompt, response, track_throughput=False)
        
        assert "latency_sec" in result
        assert result["latency_sec"] > 0
        # Should complete in reasonable time (< 30 seconds for single eval)
        assert result["latency_sec"] < 30.0
    
    def test_single_run_throughput(self):
        """Verify single-run throughput calculation (1/latency)."""
        prompt = "What is the capital of France?"
        response = "Paris"
        
        result = detect_hallucination(prompt, response, track_throughput=False)
        
        assert "throughput_qps" in result
        assert result["throughput_qps"] > 0
        # Throughput should be approximately 1/latency
        expected_throughput = 1.0 / result["latency_sec"]
        assert abs(result["throughput_qps"] - expected_throughput) < 0.01
    
    def test_batch_throughput_tracking(self):
        """Verify cumulative throughput tracking across multiple calls."""
        reset_throughput_tracker()
        
        # Run 3 evaluations
        for i in range(3):
            detect_hallucination(
                f"Question {i}",
                f"Answer {i}",
                track_throughput=True
            )
        
        # Get stats
        stats = get_throughput_stats()
        
        assert stats["total_evaluations"] == 3
        assert stats["total_time_sec"] > 0
        assert stats["throughput_qps"] > 0
        # Throughput should be total_evals / total_time
        expected = 3 / stats["total_time_sec"]
        assert abs(stats["throughput_qps"] - expected) < 0.01
    
    def test_throughput_reset(self):
        """Verify throughput tracker can be reset."""
        # Run some evaluations
        detect_hallucination("Test", "Answer", track_throughput=True)
        
        # Reset
        reset_throughput_tracker()
        
        # Check stats are zeroed
        stats = get_throughput_stats()
        assert stats["total_evaluations"] == 0
        assert stats["total_time_sec"] == 0
        assert stats["throughput_qps"] == 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

