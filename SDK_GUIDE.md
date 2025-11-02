# AgentOps SDK Integration Guide

This guide shows you how to integrate AgentOps into your LLM agents and applications.

## Installation

```bash
# Install in development mode
pip install -e .

# Or install dependencies only
pip install -r requirements.txt
```

## Quick Start

### 1. Basic Integration

```python
from agentops import AgentOps

# Initialize SDK
ops = AgentOps()

# Evaluate your agent's response
result = ops.evaluate(
    prompt="What is Python?",
    response="Python is a programming language created in 1991."
)

# Check results
if result['hallucinated']:
    print("⚠️ Warning: Response may contain hallucinations")
    print(f"Probability: {result['hallucination_probability']}")
else:
    print("✅ Response looks good!")

print(f"Latency: {result['latency_sec']}s")
```

### 2. RAG Integration

If your agent uses retrieval (RAG), pass the retrieved documents for better accuracy:

```python
from agentops import AgentOps

ops = AgentOps()

# Your RAG system retrieves these documents
retrieved_docs = [
    "Python was created by Guido van Rossum in 1991.",
    "Python emphasizes code readability and simplicity."
]

# Evaluate with evidence
result = ops.evaluate(
    prompt="Tell me about Python",
    response="Python is a language created in 1991 by Guido.",
    retrieved_docs=retrieved_docs  # Pass evidence
)

print(f"Mode: {result['mode']}")  # "retrieved-doc entailment"
print(f"Factual Support: {result['factual_support']}")
```

### 3. Batch Monitoring

Monitor multiple evaluations and track cumulative statistics:

```python
from agentops import AgentOps

ops = AgentOps()
ops.start_session()

# Run your agent on multiple queries
test_cases = [
    ("What is 2+2?", "4"),
    ("Who discovered America?", "Christopher Columbus in 1492"),
    ("Explain AI briefly", "AI is artificial intelligence...")
]

for prompt, response in test_cases:
    result = ops.evaluate(prompt, response)
    print(f"Latency: {result['latency_sec']}s")

# Get session statistics
stats = ops.end_session()
print(f"\nSession Summary:")
print(f"  Total evaluations: {stats['total_evaluations']}")
print(f"  Average throughput: {stats['throughput_qps']} req/sec")
print(f"  Total time: {stats['total_time_sec']}s")
```

### 4. Context Manager

Use context managers for automatic session management:

```python
from agentops import AgentOps

with AgentOps() as ops:
    # Session automatically starts
    
    for query in your_test_queries:
        response = your_agent(query)
        result = ops.evaluate(query, response)
        
        if result['hallucinated']:
            handle_hallucination(query, response)
    
    # Session automatically ends
```

## Integration Patterns

### Pattern 1: Decorator for Agent Functions

```python
from agentops import AgentOps
from functools import wraps

ops = AgentOps()

def monitor_agent(func):
    """Decorator to automatically monitor agent responses."""
    @wraps(func)
    def wrapper(prompt):
        # Get agent response
        response = func(prompt)
        
        # Monitor with AgentOps
        result = ops.evaluate(prompt, response)
        
        # Log or alert on issues
        if result['hallucinated']:
            print(f"⚠️ Hallucination detected: {result['hallucination_probability']}")
        
        return response
    return wrapper

@monitor_agent
def my_agent(prompt):
    # Your agent logic here
    return generate_response(prompt)
```

### Pattern 2: RAG Pipeline Integration

```python
from agentops import AgentOps

class RAGAgent:
    def __init__(self):
        self.ops = AgentOps()
        self.retriever = YourRetriever()
        self.generator = YourGenerator()
    
    def query(self, prompt):
        # Retrieve documents
        docs = self.retriever.retrieve(prompt)
        
        # Generate response
        response = self.generator.generate(prompt, docs)
        
        # Monitor quality
        result = self.ops.evaluate(
            prompt=prompt,
            response=response,
            retrieved_docs=docs  # Important for RAG
        )
        
        # Add monitoring metadata to response
        return {
            'response': response,
            'hallucinated': result['hallucinated'],
            'factual_support': result['factual_support'],
            'latency': result['latency_sec']
        }
```

### Pattern 3: Production Monitoring

```python
from agentops import AgentOps
import logging

logger = logging.getLogger(__name__)

class MonitoredAgent:
    def __init__(self):
        self.ops = AgentOps()
        self.ops.start_session()
    
    def process_query(self, prompt):
        response = self.generate_response(prompt)
        
        # Monitor
        result = self.ops.evaluate(prompt, response)
        
        # Log metrics
        logger.info(f"Query processed", extra={
            'latency': result['latency_sec'],
            'hallucinated': result['hallucinated'],
            'hallucination_prob': result['hallucination_probability']
        })
        
        # Alert on issues
        if result['hallucination_probability'] > 0.7:
            logger.warning(f"High hallucination risk: {prompt[:50]}")
        
        return response
    
    def get_metrics(self):
        """Get current session metrics."""
        return self.ops.metrics()
```

## API Reference

### AgentOps Class

#### `__init__(api_key=None, track_throughput=True)`
- `api_key`: Optional API key (for future cloud features)
- `track_throughput`: Enable cumulative throughput tracking

#### `evaluate(prompt, response, retrieved_docs=None)`
Evaluate an agent response.

**Returns:**
```python
{
    'hallucinated': bool,
    'hallucination_probability': float,
    'semantic_drift': float,
    'factual_support': float,
    'uncertainty': float,
    'mode': str,
    'latency_sec': float,
    'throughput_qps': float
}
```

#### `metrics()`
Get cumulative statistics.

**Returns:**
```python
{
    'total_evaluations': int,
    'total_time_sec': float,
    'throughput_qps': float
}
```

#### `start_session()`
Start a new monitoring session with fresh metrics.

#### `end_session()`
End current session and return final statistics.

#### `reset_metrics()`
Reset throughput tracker.

## Best Practices

### 1. **Use RAG Mode When Possible**
Always pass `retrieved_docs` if your agent uses retrieval. This enables evidence-based fact checking:

```python
# ✅ Good - with evidence
result = ops.evaluate(prompt, response, retrieved_docs=docs)

# ⚠️ Limited - no evidence
result = ops.evaluate(prompt, response)
```

### 2. **Monitor in Production**
Start a session at application startup and track throughout:

```python
# Application startup
ops = AgentOps()
ops.start_session()

# ... handle queries ...

# Periodic logging
metrics = ops.metrics()
logger.info(f"Throughput: {metrics['throughput_qps']} qps")
```

### 3. **Set Thresholds**
Define what "hallucination" means for your use case:

```python
result = ops.evaluate(prompt, response)

# Default threshold is 0.45
if result['hallucinated']:
    # High confidence hallucination
    reject_response()

# Custom threshold
elif result['hallucination_probability'] > 0.3:
    # Medium risk - request human review
    flag_for_review()
```

### 4. **Track Latency**
Use latency metrics for performance optimization:

```python
result = ops.evaluate(prompt, response)

if result['latency_sec'] > 5.0:
    logger.warning("Slow evaluation detected")
    
# Track p95, p99 latencies over time
```

### 5. **Batch Processing**
For batch evaluation, use sessions:

```python
with AgentOps() as ops:
    for item in batch:
        ops.evaluate(item.prompt, item.response)
    
# Stats automatically available after session ends
```

## Troubleshooting

### Import Errors
```python
# If you get import errors, ensure proper installation:
pip install -e .

# Or add to path:
import sys
sys.path.insert(0, '/path/to/agentops')
```

### OpenAI API Key
```bash
# Set your .env file:
echo "OPENAI_API_KEY=your_key_here" > .env
```

### Performance Issues
- Use `track_throughput=False` for single evaluations to avoid global state
- Batch evaluations are more efficient than individual calls
- Consider async evaluation for high throughput (future feature)

## Examples

See the `examples/` directory for complete working examples:
- `examples/examples.py` - Low-level API examples
- `examples/wrap_agent.py` - Real OpenAI agent integration

## Next Steps

- Check out the [main README](README.md) for full documentation
- Review [CHANGELOG](CHANGELOG.md) for version history
- Join our community for support and updates

