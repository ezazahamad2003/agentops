"""
AgentOps SDK - AI Reliability Engineering for LLM Agents

Monitor hallucinations, latency, and throughput for production LLM systems.
"""

from .client import AgentOps
from .detector_flexible import (
    detect_hallucination,
    reset_throughput_tracker,
    get_throughput_stats,
    uncertainty_score,
)

__version__ = "0.2.0"

__all__ = [
    "AgentOps",
    "detect_hallucination",
    "reset_throughput_tracker",
    "get_throughput_stats",
    "uncertainty_score",
]

