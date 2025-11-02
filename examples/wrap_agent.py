"""
Example: Wrapping a real LLM agent with AgentOps monitoring.

This demonstrates how to integrate AgentOps into your existing agent code
for automatic hallucination detection and reliability monitoring.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agentops import AgentOps
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Initialize clients
client = OpenAI()
ops = AgentOps(api_key="your_agentops_key")  # Optional key for future cloud features


def my_agent(prompt):
    """
    Simple agent that uses GPT-4o-mini to answer questions.
    """
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return completion.choices[0].message.content


def run_single_evaluation():
    """Example 1: Single evaluation"""
    print("=" * 60)
    print("EXAMPLE 1 — Single Agent Evaluation")
    print("=" * 60)
    
    prompt = "Explain artificial intelligence as if it existed in 1900."
    print(f"\n📝 Prompt: {prompt}\n")
    
    # Get agent response
    response = my_agent(prompt)
    print(f"🤖 Agent Response:\n{response}\n")
    
    # Evaluate with AgentOps
    report = ops.evaluate(prompt, response)
    
    print("📊 AgentOps Report:")
    print(f"  Hallucinated: {'❌ YES' if report['hallucinated'] else '✅ NO'}")
    print(f"  Hallucination Probability: {report['hallucination_probability']}")
    print(f"  Semantic Drift: {report['semantic_drift']}")
    print(f"  Factual Support: {report['factual_support']}")
    print(f"  Uncertainty: {report['uncertainty']}")
    print(f"  Latency: {report['latency_sec']}s")
    print(f"  Throughput: {report['throughput_qps']} req/sec")
    print()


def run_batch_monitoring():
    """Example 2: Batch monitoring with session management"""
    print("=" * 60)
    print("EXAMPLE 2 — Batch Monitoring with Session")
    print("=" * 60)
    
    # Start a fresh session
    ops.start_session()
    
    test_prompts = [
        "What is 2+2?",
        "Who was the first person on the moon?",
        "Explain quantum computing in simple terms.",
    ]
    
    print(f"\n🔄 Running {len(test_prompts)} agent evaluations...\n")
    
    for i, prompt in enumerate(test_prompts, 1):
        response = my_agent(prompt)
        report = ops.evaluate(prompt, response)
        
        print(f"Evaluation {i}:")
        print(f"  Prompt: {prompt}")
        print(f"  Hallucinated: {'❌' if report['hallucinated'] else '✅'}")
        print(f"  Latency: {report['latency_sec']}s")
        print()
    
    # Get session stats
    stats = ops.end_session()
    
    print("📈 Session Statistics:")
    print(f"  Total evaluations: {stats['total_evaluations']}")
    print(f"  Total time: {stats['total_time_sec']}s")
    print(f"  Average throughput: {stats['throughput_qps']} req/sec")
    print(f"  Average latency: {round(stats['total_time_sec'] / stats['total_evaluations'], 3)}s")
    print()


def run_context_manager():
    """Example 3: Using context manager for automatic session management"""
    print("=" * 60)
    print("EXAMPLE 3 — Context Manager (Auto Session)")
    print("=" * 60)
    
    print("\n🔄 Running evaluations with automatic session management...\n")
    
    with AgentOps() as ops_session:
        for i in range(3):
            prompt = f"Tell me a fact about number {i+1}."
            response = my_agent(prompt)
            report = ops_session.evaluate(prompt, response)
            
            print(f"Evaluation {i+1}: Latency {report['latency_sec']}s")
    
    print("\n✅ Session automatically closed with context manager")
    print()


def run_rag_agent():
    """Example 4: RAG agent with retrieved documents"""
    print("=" * 60)
    print("EXAMPLE 4 — RAG Agent with Retrieved Documents")
    print("=" * 60)
    
    # Simulate retrieved documents
    retrieved_docs = [
        "Python was created by Guido van Rossum and first released in 1991.",
        "Python is known for its simple syntax and readability.",
        "Python is widely used in data science, web development, and AI."
    ]
    
    prompt = "Tell me about Python programming language."
    response = my_agent(prompt)
    
    print(f"\n📝 Prompt: {prompt}")
    print(f"\n📚 Retrieved {len(retrieved_docs)} documents from knowledge base")
    print(f"\n🤖 Agent Response:\n{response}\n")
    
    # Evaluate with RAG mode
    report = ops.evaluate(prompt, response, retrieved_docs=retrieved_docs)
    
    print("📊 AgentOps Report (RAG Mode):")
    print(f"  Mode: {report['mode']}")
    print(f"  Factual Support: {report['factual_support']} (evidence-based)")
    print(f"  Hallucinated: {'❌ YES' if report['hallucinated'] else '✅ NO'}")
    print(f"  Latency: {report['latency_sec']}s")
    print()


if __name__ == "__main__":
    print("\n🚀 AgentOps SDK - Agent Monitoring Examples\n")
    
    try:
        run_single_evaluation()
        run_batch_monitoring()
        run_context_manager()
        run_rag_agent()
        
        print("=" * 60)
        print("✅ All examples completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure you have:")
        print("  1. Created a .env file with your OPENAI_API_KEY")
        print("  2. Installed requirements: pip install -r requirements.txt")
        print("  3. Run from the project root directory")

