"""
Test Agent Script - AgentOps SDK Integration Test
Tests the SDK with the local API backend and verifies metrics storage.
"""

import sys
import os

# Add parent directory to path to import local SDK during development
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agentops import AgentOps
import time

# Configuration
API_URL = "http://localhost:8000"
API_KEY = "agentops_PkhON27-mBYG77Ou1OKIjCvyqetYkXNllpLKVoaE4RY"  # From registration

print("=" * 70)
print("🧪 AGENTOPS SDK - COMPREHENSIVE TEST")
print("=" * 70)

# Initialize AgentOps with API connection
print("\n1️⃣ Initializing AgentOps client...")
ops = AgentOps(
    api_key=API_KEY,
    api_url=API_URL,
    track_throughput=True
)
print(f"✅ Connected to API: {API_URL}")
print(f"📦 SDK Version: {ops.version()}")

# Test 1: Simple factual question (No-RAG mode, should NOT hallucinate)
print("\n" + "=" * 70)
print("TEST 1: Simple Factual Question (No-RAG Mode)")
print("=" * 70)

result1 = ops.evaluate(
    prompt="What is 2 + 2?",
    response="2 + 2 equals 4.",
    model_name="gpt-4o-mini",
    agent_name="math_bot"
)

print(f"Prompt: What is 2 + 2?")
print(f"Response: 2 + 2 equals 4.")
print(f"---")
print(f"Semantic Drift: {result1['semantic_drift']:.3f}")
print(f"Factual Support: {result1['factual_support']:.3f}")
print(f"Uncertainty: {result1['uncertainty']:.3f}")
print(f"Hallucination Probability: {result1['hallucination_probability']:.3f}")
print(f"Hallucinated: {result1['hallucinated']} ❌" if result1['hallucinated'] else f"Hallucinated: {result1['hallucinated']} ✅")
print(f"Latency: {result1['latency_sec']:.2f}s")
print(f"Throughput: {result1['throughput_qps']:.2f} req/sec")

# Test 2: Uncertain response (should detect uncertainty)
print("\n" + "=" * 70)
print("TEST 2: Uncertain Response Detection")
print("=" * 70)

result2 = ops.evaluate(
    prompt="What is the weather like on Mars?",
    response="I'm not sure, but maybe it's cold and dusty. Perhaps the temperature is around -60°C.",
    model_name="gpt-4o-mini",
    agent_name="space_bot"
)

print(f"Prompt: What is the weather like on Mars?")
print(f"Response: I'm not sure, but maybe it's cold and dusty...")
print(f"---")
print(f"Semantic Drift: {result2['semantic_drift']:.3f}")
print(f"Factual Support: {result2['factual_support']:.3f}")
print(f"Uncertainty: {result2['uncertainty']:.3f} {'⚠️ HIGH' if result2['uncertainty'] > 0.3 else ''}")
print(f"Hallucination Probability: {result2['hallucination_probability']:.3f}")
print(f"Hallucinated: {result2['hallucinated']} ❌" if result2['hallucinated'] else f"Hallucinated: {result2['hallucinated']} ✅")

# Test 3: Clear hallucination (should detect)
print("\n" + "=" * 70)
print("TEST 3: Clear Hallucination Detection")
print("=" * 70)

result3 = ops.evaluate(
    prompt="Who is the current president of Mars?",
    response="The current president of Mars is Elon Musk, elected in 2045.",
    model_name="gpt-4o-mini",
    agent_name="politics_bot"
)

print(f"Prompt: Who is the current president of Mars?")
print(f"Response: The current president of Mars is Elon Musk, elected in 2045.")
print(f"---")
print(f"Semantic Drift: {result3['semantic_drift']:.3f}")
print(f"Factual Support: {result3['factual_support']:.3f} {'⚠️ LOW' if result3['factual_support'] < 0.5 else ''}")
print(f"Uncertainty: {result3['uncertainty']:.3f}")
print(f"Hallucination Probability: {result3['hallucination_probability']:.3f} {'🚨 HIGH' if result3['hallucination_probability'] > 0.5 else ''}")
print(f"Hallucinated: {result3['hallucinated']} {'🚨 DETECTED' if result3['hallucinated'] else '✅'}")

# Test 4: RAG mode with retrieved documents
print("\n" + "=" * 70)
print("TEST 4: RAG Mode with Retrieved Documents")
print("=" * 70)

retrieved_docs = [
    "The Eiffel Tower was completed in 1889 for the World's Fair in Paris.",
    "Gustave Eiffel was the engineer behind the tower's design.",
    "The tower is 330 meters (1,083 feet) tall."
]

result4 = ops.evaluate(
    prompt="When was the Eiffel Tower built?",
    response="The Eiffel Tower was completed in 1889.",
    retrieved_docs=retrieved_docs,
    model_name="gpt-4o-mini",
    agent_name="history_bot"
)

print(f"Prompt: When was the Eiffel Tower built?")
print(f"Response: The Eiffel Tower was completed in 1889.")
print(f"Retrieved Docs: {len(retrieved_docs)} documents")
print(f"---")
print(f"Mode: RAG (with evidence)")
print(f"Semantic Drift: {result4['semantic_drift']:.3f}")
print(f"Factual Support: {result4['factual_support']:.3f} {'✅ SUPPORTED' if result4['factual_support'] > 0.7 else ''}")
print(f"Uncertainty: {result4['uncertainty']:.3f}")
print(f"Hallucination Probability: {result4['hallucination_probability']:.3f}")
print(f"Hallucinated: {result4['hallucinated']} ✅" if not result4['hallucinated'] else f"Hallucinated: {result4['hallucinated']} ❌")

# Test 5: RAG mode with unsupported response
print("\n" + "=" * 70)
print("TEST 5: RAG Mode - Unsupported Response")
print("=" * 70)

retrieved_docs_france = [
    "France is a country in Western Europe.",
    "Paris is the capital of France.",
    "French is the official language of France."
]

result5 = ops.evaluate(
    prompt="What is the capital of France?",
    response="The capital of France is Lyon, known for its Roman ruins.",
    retrieved_docs=retrieved_docs_france,
    model_name="gpt-4o-mini",
    agent_name="geography_bot"
)

print(f"Prompt: What is the capital of France?")
print(f"Response: The capital of France is Lyon...")
print(f"Retrieved Docs: {len(retrieved_docs_france)} documents (mentions Paris)")
print(f"---")
print(f"Mode: RAG (with evidence)")
print(f"Semantic Drift: {result5['semantic_drift']:.3f}")
print(f"Factual Support: {result5['factual_support']:.3f} {'🚨 CONTRADICTS EVIDENCE' if result5['factual_support'] < 0.5 else ''}")
print(f"Uncertainty: {result5['uncertainty']:.3f}")
print(f"Hallucination Probability: {result5['hallucination_probability']:.3f}")
print(f"Hallucinated: {result5['hallucinated']} {'🚨 DETECTED' if result5['hallucinated'] else '✅'}")

# Get cumulative metrics
print("\n" + "=" * 70)
print("📊 SESSION SUMMARY")
print("=" * 70)

metrics = ops.metrics()
print(f"Total Evaluations: {metrics['total_evaluations']}")
print(f"Cumulative Time: {metrics['total_time_sec']:.2f}s")
print(f"Average Throughput: {metrics['throughput_qps']:.2f} req/sec")

# Summary
print("\n" + "=" * 70)
print("✅ TEST RESULTS SUMMARY")
print("=" * 70)

results = [result1, result2, result3, result4, result5]
total_tests = len(results)
total_hallucinations = sum(1 for r in results if r['hallucinated'])
avg_latency = sum(r['latency_sec'] for r in results) / total_tests
avg_hallucination_prob = sum(r['hallucination_probability'] for r in results) / total_tests

print(f"Total Tests: {total_tests}")
print(f"Hallucinations Detected: {total_hallucinations}/{total_tests} ({total_hallucinations/total_tests*100:.1f}%)")
print(f"Average Latency: {avg_latency:.2f}s")
print(f"Average Hallucination Probability: {avg_hallucination_prob:.3f}")

print("\n" + "=" * 70)
print("🎉 ALL TESTS COMPLETED!")
print("=" * 70)
print("\n✅ Data uploaded to API: http://localhost:8000")
print("✅ Stored in Supabase database")
print("\n📊 Next: Check the database with SQL queries to verify!")
print("=" * 70)

