"""
Dual-mode hallucination detector for LLM responses with reliability metrics.

Works in two modes:
- RAG mode: Uses retrieved documents for entailment checking
- No-RAG mode: Uses self-check for factual verification

Returns explainable scores including:
- Truth metrics: semantic drift, uncertainty, factual support
- Reliability metrics: latency, throughput
"""

import os
import re
import time
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv
from threading import Lock

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ---------- Throughput Tracker ----------

class ThroughputTracker:
    """
    Thread-safe throughput tracker for batch/concurrent evaluation scenarios.
    Tracks cumulative evaluations and total time for throughput calculation.
    """
    def __init__(self):
        self.total_evaluations = 0
        self.total_time = 0.0
        self.lock = Lock()
    
    def record(self, latency):
        """Record an evaluation and its latency."""
        with self.lock:
            self.total_evaluations += 1
            self.total_time += latency
    
    def get_throughput(self):
        """Get current throughput (requests per second)."""
        with self.lock:
            if self.total_time == 0:
                return 0.0
            return round(self.total_evaluations / self.total_time, 3)
    
    def reset(self):
        """Reset counters."""
        with self.lock:
            self.total_evaluations = 0
            self.total_time = 0.0


# Global throughput tracker for batch mode
_throughput_tracker = ThroughputTracker()


# ---------- Helper Functions ----------

def cosine(v1, v2):
    """Calculate cosine similarity between two vectors."""
    v1, v2 = np.array(v1), np.array(v2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))


def get_embedding(text):
    """Get embedding vector for text using OpenAI's embedding model."""
    emb = client.embeddings.create(model="text-embedding-3-small", input=text)
    return emb.data[0].embedding


# ---------- Core Checks ----------

def uncertainty_score(text):
    """
    Calculate uncertainty score based on lexical cues.
    
    Returns:
        float: Score from 0 to 1, where higher means more uncertain language
    """
    cues = ["maybe", "probably", "unsure", "not sure", "might", "perhaps", "possibly"]
    hits = sum(1 for w in cues if w in text.lower())
    return min(1.0, hits * 0.2)


def entailment_score(response, retrieved_docs):
    """
    Check how well retrieved documents support the response using LLM evaluation.
    
    Args:
        response: The LLM's response text
        retrieved_docs: List of evidence text chunks
    
    Returns:
        float: Score from 0 to 1, where 1 = fully supported by evidence
    """
    evidence = "\n\n".join(retrieved_docs)
    prompt = f"""
Given the EVIDENCE below, rate from 0 to 1 how well it supports the ANSWER.
1 = fully supported, 0 = completely unsupported.

EVIDENCE:
{evidence[:4000]}

ANSWER:
{response}
"""
    comp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    txt = comp.choices[0].message.content
    m = re.search(r"0\.\d+|1", txt)
    return float(m.group()) if m else 0.5


def factual_selfcheck(prompt, response):
    """
    Ask model to evaluate factual accuracy of response relative to question.
    Used when no retrieved documents are available.
    
    Args:
        prompt: The original user question
        response: The LLM's response
    
    Returns:
        float: Score from 0 to 1, where 1 = factually correct
    """
    query = f"""
Evaluate the factual accuracy of the following response relative to the question.
Rate from 0 (hallucinated) to 1 (factually correct).

Question: {prompt}
Response: {response}
"""
    comp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": query}],
        temperature=0
    )
    txt = comp.choices[0].message.content
    m = re.search(r"0\.\d+|1", txt)
    return float(m.group()) if m else 0.5


# ---------- Unified Detector ----------

def detect_hallucination(prompt, response, retrieved_docs=None, track_throughput=True):
    """
    Detect potential hallucinations in LLM responses with reliability metrics.
    
    Works in two modes:
    - RAG mode (if retrieved_docs provided): Uses entailment checking
    - No-RAG mode (if retrieved_docs is None): Uses factual self-check
    
    Args:
        prompt: The original user question/prompt
        response: The LLM's response text
        retrieved_docs: Optional list of retrieved evidence chunks
        track_throughput: Whether to update global throughput tracker (default: True)
    
    Returns:
        dict: {
            # Truth metrics
            'semantic_drift': float (0-1, semantic distance from prompt),
            'uncertainty': float (0-1, uncertainty language score),
            'factual_support': float (0-1, factual grounding score),
            'mode': str ('retrieved-doc entailment' or 'self-check'),
            'hallucination_probability': float (0-1, overall score),
            'hallucinated': bool (True if probability > 0.45),
            
            # Reliability metrics
            'latency_sec': float (end-to-end evaluation time in seconds),
            'throughput_qps': float (requests per second - cumulative if tracking enabled)
        }
    """
    # Start latency timer
    start_time = time.time()
    
    # Always compute drift and uncertainty
    drift = 1 - cosine(get_embedding(prompt), get_embedding(response))
    uncert = uncertainty_score(response)

    if retrieved_docs:
        factual = entailment_score(response, retrieved_docs)
        reason = "retrieved-doc entailment"
    else:
        factual = factual_selfcheck(prompt, response)
        reason = "self-check"

    # Weighted fusion: 40% factual, 40% drift, 20% uncertainty
    halluc_prob = round(0.4 * (1 - factual) + 0.4 * drift + 0.2 * uncert, 3)
    
    # Calculate latency
    end_time = time.time()
    latency = round(end_time - start_time, 3)
    
    # Calculate throughput
    if track_throughput:
        _throughput_tracker.record(latency)
        throughput = _throughput_tracker.get_throughput()
    else:
        # Single-run mode: throughput = 1 / latency
        throughput = round(1.0 / latency, 3) if latency > 0 else 0.0
    
    return {
        # Truth metrics
        "semantic_drift": round(drift, 3),
        "uncertainty": round(uncert, 3),
        "factual_support": round(factual, 3),
        "mode": reason,
        "hallucination_probability": halluc_prob,
        "hallucinated": halluc_prob > 0.45,
        
        # Reliability metrics
        "latency_sec": latency,
        "throughput_qps": throughput
    }


def reset_throughput_tracker():
    """
    Reset the global throughput tracker.
    Useful for starting fresh batch measurements or benchmarking.
    """
    _throughput_tracker.reset()


def get_throughput_stats():
    """
    Get current throughput statistics without running an evaluation.
    
    Returns:
        dict: {
            'total_evaluations': int,
            'total_time_sec': float,
            'throughput_qps': float
        }
    """
    return {
        "total_evaluations": _throughput_tracker.total_evaluations,
        "total_time_sec": round(_throughput_tracker.total_time, 3),
        "throughput_qps": _throughput_tracker.get_throughput()
    }

