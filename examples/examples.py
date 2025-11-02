"""
Example usage of the hallucination detector with reliability metrics.

Demonstrates:
- RAG mode and No-RAG mode
- Truth metrics (drift, uncertainty, factual support)
- Reliability metrics (latency, throughput)

Run this after setting up your .env file with OPENAI_API_KEY.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agentops import (
    detect_hallucination,
    reset_throughput_tracker,
    get_throughput_stats
)


def example_rag_mode():
    """Example: Using hallucination detector with retrieved documents (RAG mode)."""
    print("=" * 60)
    print("EXAMPLE A — RAG Mode")
    print("=" * 60)
    
    prompt = "Summarize the side effects of Ozempic."
    retrieved_docs = [
        "Common side effects include nausea, vomiting, diarrhea, and abdominal pain.",
        "Rare adverse events include pancreatitis and kidney injury."
    ]
    response = "Ozempic can cause nausea, vomiting, and fatigue. In rare cases, it may cause heart palpitations."
    
    result = detect_hallucination(prompt, response, retrieved_docs)
    
    print(f"\nPrompt: {prompt}")
    print(f"\nResponse: {response}")
    print(f"\nRetrieved docs: {len(retrieved_docs)} documents")
    print(f"\n📊 Detection Result:")
    print(f"\n  Truth Metrics:")
    print(f"    semantic_drift: {result['semantic_drift']}")
    print(f"    uncertainty: {result['uncertainty']}")
    print(f"    factual_support: {result['factual_support']}")
    print(f"    hallucination_probability: {result['hallucination_probability']}")
    print(f"    hallucinated: {result['hallucinated']}")
    print(f"    mode: {result['mode']}")
    print(f"\n  Reliability Metrics:")
    print(f"    latency_sec: {result['latency_sec']}")
    print(f"    throughput_qps: {result['throughput_qps']}")
    print()


def example_no_rag_mode():
    """Example: Using hallucination detector without retrieved documents (No-RAG mode)."""
    print("=" * 60)
    print("EXAMPLE B — No-RAG Mode")
    print("=" * 60)
    
    prompt = "Who discovered penicillin?"
    response = "Penicillin was discovered by Alexander Fleming in 1928."
    
    result = detect_hallucination(prompt, response)
    
    print(f"\nPrompt: {prompt}")
    print(f"\nResponse: {response}")
    print(f"\nRetrieved docs: None (No-RAG mode)")
    print(f"\n📊 Detection Result:")
    print(f"\n  Truth Metrics:")
    print(f"    semantic_drift: {result['semantic_drift']}")
    print(f"    uncertainty: {result['uncertainty']}")
    print(f"    factual_support: {result['factual_support']}")
    print(f"    hallucination_probability: {result['hallucination_probability']}")
    print(f"    hallucinated: {result['hallucinated']}")
    print(f"    mode: {result['mode']}")
    print(f"\n  Reliability Metrics:")
    print(f"    latency_sec: {result['latency_sec']}")
    print(f"    throughput_qps: {result['throughput_qps']}")
    print()


def example_uncertain_response():
    """Example: Response with uncertainty language."""
    print("=" * 60)
    print("EXAMPLE C — Uncertain Language")
    print("=" * 60)
    
    prompt = "What is the weather on Mars?"
    response = "Maybe it's probably cold. I'm not sure, but it might be around -60 degrees Celsius."
    
    result = detect_hallucination(prompt, response)
    
    print(f"\nPrompt: {prompt}")
    print(f"\nResponse: {response}")
    print(f"\n📊 Detection Result:")
    print(f"\n  Truth Metrics:")
    print(f"    semantic_drift: {result['semantic_drift']}")
    print(f"    uncertainty: {result['uncertainty']}")
    print(f"    factual_support: {result['factual_support']}")
    print(f"    hallucination_probability: {result['hallucination_probability']}")
    print(f"    hallucinated: {result['hallucinated']}")
    print(f"    mode: {result['mode']}")
    print(f"\n  Reliability Metrics:")
    print(f"    latency_sec: {result['latency_sec']}")
    print(f"    throughput_qps: {result['throughput_qps']}")
    print()


def example_semantic_drift():
    """Example: Response with high semantic drift from prompt."""
    print("=" * 60)
    print("EXAMPLE D — Semantic Drift")
    print("=" * 60)
    
    prompt = "How do I make chocolate chip cookies?"
    response = "The history of quantum mechanics began in the early 20th century with Max Planck's work."
    
    result = detect_hallucination(prompt, response)
    
    print(f"\nPrompt: {prompt}")
    print(f"\nResponse: {response}")
    print(f"\n📊 Detection Result:")
    print(f"\n  Truth Metrics:")
    print(f"    semantic_drift: {result['semantic_drift']}")
    print(f"    uncertainty: {result['uncertainty']}")
    print(f"    factual_support: {result['factual_support']}")
    print(f"    hallucination_probability: {result['hallucination_probability']}")
    print(f"    hallucinated: {result['hallucinated']}")
    print(f"    mode: {result['mode']}")
    print(f"\n  Reliability Metrics:")
    print(f"    latency_sec: {result['latency_sec']}")
    print(f"    throughput_qps: {result['throughput_qps']}")
    print()


def example_batch_throughput():
    """Example: Batch throughput tracking across multiple evaluations."""
    print("=" * 60)
    print("EXAMPLE E — Batch Throughput Tracking")
    print("=" * 60)
    
    # Reset tracker for clean demonstration
    reset_throughput_tracker()
    
    test_cases = [
        ("What is 2+2?", "4"),
        ("What is the capital of Japan?", "Tokyo"),
        ("Who wrote Romeo and Juliet?", "William Shakespeare"),
    ]
    
    print("\n🔄 Running 3 evaluations...\n")
    
    for i, (prompt, response) in enumerate(test_cases, 1):
        result = detect_hallucination(prompt, response, track_throughput=True)
        print(f"  Evaluation {i}:")
        print(f"    Prompt: {prompt}")
        print(f"    Response: {response}")
        print(f"    Latency: {result['latency_sec']}s")
        print(f"    Hallucinated: {result['hallucinated']}")
        print()
    
    # Get cumulative stats
    stats = get_throughput_stats()
    
    print("📈 Cumulative Statistics:")
    print(f"    Total evaluations: {stats['total_evaluations']}")
    print(f"    Total time: {stats['total_time_sec']}s")
    print(f"    Average throughput: {stats['throughput_qps']} req/sec")
    print(f"    Average latency: {round(stats['total_time_sec'] / stats['total_evaluations'], 3)}s")
    print()


if __name__ == "__main__":
    print("\n🧠 HALLUCINATION DETECTOR - EXAMPLES WITH RELIABILITY METRICS\n")
    
    try:
        example_rag_mode()
        example_no_rag_mode()
        example_uncertain_response()
        example_semantic_drift()
        example_batch_throughput()
        
        print("=" * 60)
        print("✅ All examples completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure you have:")
        print("  1. Created a .env file with your OPENAI_API_KEY")
        print("  2. Installed requirements: pip install -r requirements.txt")

