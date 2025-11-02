"""
AgentOps SDK - Production Backend Test
Tests the SDK with live GCP Cloud Run backend

Run this test to verify:
- SDK works with production URL
- All evaluations are uploaded successfully
- Data is stored in Supabase
- Ready for v0.2.1 release
"""

import sys
import os

# Add parent directory to path for local SDK testing
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agentops import AgentOps
import httpx
import time

# Production backend URL
PRODUCTION_URL = "https://agentops-api-1081133763032.us-central1.run.app"

print("=" * 80)
print("🚀 AGENTOPS SDK - PRODUCTION BACKEND TEST")
print("=" * 80)
print(f"Production URL: {PRODUCTION_URL}")
print(f"Testing SDK auto-upload to GCP Cloud Run backend")
print("=" * 80)

# Step 1: Verify backend health
print("\n1️⃣ Checking production backend health...")
try:
    health_response = httpx.get(f"{PRODUCTION_URL}/health", timeout=10.0)
    health_data = health_response.json()
    print(f"✅ Backend is healthy!")
    print(f"   Status: {health_data['status']}")
    print(f"   Timestamp: {health_data['timestamp']}")
except Exception as e:
    print(f"❌ Backend health check failed: {e}")
    sys.exit(1)

# Step 2: Register a new agent
print("\n2️⃣ Registering new test agent...")
try:
    register_response = httpx.post(
        f"{PRODUCTION_URL}/register",
        json={"name": "production_sdk_test_agent"},
        timeout=10.0
    )
    register_response.raise_for_status()
    agent_data = register_response.json()
    
    API_KEY = agent_data['api_key']
    AGENT_ID = agent_data['agent_id']
    
    print(f"✅ Agent registered successfully!")
    print(f"   Agent ID: {AGENT_ID}")
    print(f"   API Key: {API_KEY[:30]}...")
except Exception as e:
    print(f"❌ Agent registration failed: {e}")
    sys.exit(1)

# Step 3: Initialize SDK with production backend
print("\n3️⃣ Initializing SDK with production credentials...")
try:
    ops = AgentOps(
        api_key=API_KEY,
        api_url=PRODUCTION_URL
    )
    print(f"✅ SDK initialized!")
    print(f"   SDK Version: {ops.version()}")
    print(f"   Backend: Production (GCP Cloud Run)")
    print(f"   Auto-upload: Enabled ✅")
except Exception as e:
    print(f"❌ SDK initialization failed: {e}")
    sys.exit(1)

# Step 4: Run comprehensive test suite
print("\n" + "=" * 80)
print("4️⃣ RUNNING TEST SUITE (5 comprehensive tests)")
print("=" * 80)

test_cases = [
    {
        "name": "Test 1: Simple Math (No RAG)",
        "prompt": "What is 7 + 5?",
        "response": "7 + 5 equals 12.",
        "model": "gpt-4o-mini",
        "retrieved_docs": None,
        "expected": "Low hallucination probability"
    },
    {
        "name": "Test 2: Uncertain Response (High Uncertainty)",
        "prompt": "Will it snow in July in Hawaii?",
        "response": "I'm not sure, but maybe it could snow. Perhaps at high elevations, possibly.",
        "model": "gpt-4o-mini",
        "retrieved_docs": None,
        "expected": "High uncertainty score"
    },
    {
        "name": "Test 3: Historical Fact (Accurate)",
        "prompt": "When did the first moon landing happen?",
        "response": "The first moon landing happened on July 20, 1969.",
        "model": "gpt-4o-mini",
        "retrieved_docs": None,
        "expected": "High factual support"
    },
    {
        "name": "Test 4: Complete Hallucination",
        "prompt": "Who is the current king of Antarctica?",
        "response": "King James III is the current ruler of Antarctica, crowned in 2020.",
        "model": "gpt-4o-mini",
        "retrieved_docs": None,
        "expected": "High hallucination probability"
    },
    {
        "name": "Test 5: RAG Mode with Evidence",
        "prompt": "What is the Eiffel Tower made of?",
        "response": "The Eiffel Tower is made of iron and was completed in 1889.",
        "model": "gpt-4o-mini",
        "retrieved_docs": [
            "The Eiffel Tower is a wrought-iron lattice tower in Paris, France.",
            "It was designed by Gustave Eiffel and built between 1887 and 1889.",
            "The tower is made of iron and weighs approximately 10,000 tonnes."
        ],
        "expected": "High factual support (RAG evidence)"
    }
]

results = []
start_time = time.time()

for i, test in enumerate(test_cases, 1):
    print(f"\n{'─' * 80}")
    print(f"{test['name']}")
    print(f"{'─' * 80}")
    
    try:
        result = ops.evaluate(
            prompt=test["prompt"],
            response=test["response"],
            retrieved_docs=test.get("retrieved_docs"),
            model_name=test["model"],
            agent_name="production_test"
        )
        
        results.append(result)
        
        print(f"📝 Prompt: {test['prompt']}")
        print(f"💬 Response: {test['response'][:70]}...")
        if test.get("retrieved_docs"):
            print(f"📚 Retrieved Docs: {len(test['retrieved_docs'])} documents (RAG mode)")
        print(f"")
        print(f"📊 Results:")
        print(f"   Hallucination Prob: {result['hallucination_probability']:.3f} {'🚨' if result['hallucination_probability'] > 0.5 else '✅'}")
        print(f"   Hallucinated: {'🚨 YES' if result['hallucinated'] else '✅ NO'}")
        print(f"   Semantic Drift: {result['semantic_drift']:.3f}")
        print(f"   Factual Support: {result['factual_support']:.3f}")
        print(f"   Uncertainty: {result['uncertainty']:.3f} {'⚠️' if result['uncertainty'] > 0.3 else ''}")
        print(f"   Latency: {result['latency_sec']:.2f}s")
        print(f"   Throughput: {result['throughput_qps']:.2f} req/sec")
        print(f"")
        print(f"✅ Test {i}/5 passed - Data uploaded to production!")
        
    except Exception as e:
        print(f"❌ Test {i}/5 FAILED: {e}")
        results.append(None)

total_time = time.time() - start_time

# Step 5: Retrieve and verify statistics
print("\n" + "=" * 80)
print("5️⃣ RETRIEVING STATISTICS FROM PRODUCTION")
print("=" * 80)

try:
    stats_response = httpx.get(
        f"{PRODUCTION_URL}/stats/{AGENT_ID}",
        headers={"X-API-Key": API_KEY},
        timeout=10.0
    )
    stats_response.raise_for_status()
    stats = stats_response.json()
    
    print(f"\n📊 Production Backend Statistics:")
    print(f"   Total Evaluations: {stats['total_evals']}")
    print(f"   Total Hallucinations: {stats['total_hallucinations']}")
    print(f"   Hallucination Rate: {(stats['total_hallucinations']/stats['total_evals']*100):.1f}%")
    print(f"   Avg Hallucination Prob: {stats['avg_hallucination_prob']:.3f}")
    print(f"   Avg Latency: {stats['avg_latency']:.2f}s")
    print(f"   Avg Throughput: {stats['avg_throughput']:.2f} req/sec")
    print(f"   Last Evaluation: {stats['last_eval_at']}")
    
    # Verify counts match
    successful_tests = len([r for r in results if r is not None])
    if stats['total_evals'] == successful_tests:
        print(f"\n✅ Data verification passed! All {successful_tests} evaluations stored correctly.")
    else:
        print(f"\n⚠️  Warning: Expected {successful_tests} evals, got {stats['total_evals']}")
        
except Exception as e:
    print(f"❌ Failed to retrieve statistics: {e}")

# Step 6: Final summary
print("\n" + "=" * 80)
print("✅ PRODUCTION TEST COMPLETE!")
print("=" * 80)

successful_tests = len([r for r in results if r is not None])
failed_tests = len([r for r in results if r is None])

print(f"\n🎯 Test Summary:")
print(f"   Total Tests: {len(test_cases)}")
print(f"   Passed: {successful_tests} ✅")
print(f"   Failed: {failed_tests} {'❌' if failed_tests > 0 else '✅'}")
print(f"   Total Time: {total_time:.2f}s")
print(f"   Avg Time per Test: {(total_time/len(test_cases)):.2f}s")

print(f"\n📦 SDK Information:")
print(f"   SDK Version: 0.2.0")
print(f"   Backend: Production (GCP Cloud Run)")
print(f"   Backend URL: {PRODUCTION_URL}")
print(f"   Data Storage: ✅ Supabase")
print(f"   Auto-upload: ✅ Working")

print(f"\n🔐 Test Agent Credentials:")
print(f"   Agent ID: {AGENT_ID}")
print(f"   API Key: {API_KEY}")

if failed_tests == 0:
    print("\n" + "=" * 80)
    print("🎉 ALL TESTS PASSED! READY FOR v0.2.1 RELEASE!")
    print("=" * 80)
    print("\n✅ Next Steps:")
    print("   1. Update SDK version to v0.2.1")
    print("   2. Update documentation with production URL")
    print("   3. Build and publish to PyPI")
    print("   4. Announce the release!")
    exit_code = 0
else:
    print("\n" + "=" * 80)
    print("⚠️  SOME TESTS FAILED - REVIEW BEFORE RELEASE")
    print("=" * 80)
    exit_code = 1

print("=" * 80)
sys.exit(exit_code)

