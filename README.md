# 🧠 AgentOps Client - AI Reliability Engineering for LLM Agents

[![PyPI version](https://badge.fury.io/py/agentops-client.svg)](https://pypi.org/project/agentops-client/)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://static.pepy.tech/badge/agentops-client)](https://pepy.tech/project/agentops-client)

A flexible hallucination detection system for LLM responses that works both **with** and **without** RAG (Retrieval Augmented Generation). Monitor **truth quality**, **latency**, and **throughput** for production LLM systems.

## 🎯 Features

### Truth Detection
- **Dual-mode operation**: Works with or without retrieved documents
- **Multi-signal detection**: Combines semantic drift, uncertainty analysis, and factual checking
- **Explainable scores**: Returns detailed breakdown of all metrics

### Reliability Engineering 🆕
- **Latency tracking**: Measures end-to-end evaluation time
- **Throughput monitoring**: Calculates requests per second (single-run or batch)
- **Full observability**: Datadog-style metrics for LLM systems

### Technical
- **OpenAI-powered**: Uses embeddings and GPT-4o-mini for evaluation
- **Thread-safe**: Concurrent throughput tracking with locks
- **Simple API**: Single function call with optional parameters

## 🏗️ Architecture

```text
User Prompt + Response
   ↓
[ ⏱️  Latency Timer Start ]
   ↓
[ Embedding Drift Check ]   → always active
[ Uncertainty Analysis ]    → always active
[ Evidence Entailment ]     → only if retrieved_docs
[ Factual Self-Check LLM ]  → fallback when no evidence
   ↓
Weighted Fusion (0.4 factual + 0.4 drift + 0.2 uncertainty)
   ↓
[ ⏱️  Latency Timer End ]
[ 📊 Throughput Calculation ]
   ↓
→ truth metrics + reliability metrics
```

## 📦 Installation

### Quick Install from PyPI

```bash
pip install agentops-client
```

That's it! You're ready to start monitoring your LLM agents.

### Environment Setup

Create a `.env` file or set environment variable:

```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

Or in Python:
```python
import os
os.environ['OPENAI_API_KEY'] = 'your_openai_api_key_here'
```

### Development Installation

If you want to contribute or modify the code:

```bash
git clone https://github.com/ezazahamad2003/agentops.git
cd agentops
pip install -e .
```

## 🚀 Quick Start

### SDK Usage (Recommended)

```python
from agentops import AgentOps

# Initialize the SDK
ops = AgentOps()

# Evaluate a single response
result = ops.evaluate(
    prompt="Who discovered penicillin?",
    response="Penicillin was discovered by Alexander Fleming in 1928."
)

print(f"Hallucinated: {result['hallucinated']}")
print(f"Latency: {result['latency_sec']}s")
```

### RAG Mode with Retrieved Documents

```python
from agentops import AgentOps

ops = AgentOps()

# RAG Mode evaluation
result = ops.evaluate(
    prompt="What are the side effects of aspirin?",
    response="Aspirin causes stomach upset, nausea, and heartburn.",
    retrieved_docs=[
        "Common side effects include stomach upset and nausea.",
        "Some people may experience allergic reactions."
    ]
)

print(result)
```

### Batch Monitoring with Sessions

```python
from agentops import AgentOps

ops = AgentOps()

# Start a monitoring session
ops.start_session()

# Run multiple evaluations
for prompt, response in your_test_cases:
    result = ops.evaluate(prompt, response)
    print(f"Latency: {result['latency_sec']}s")

# Get session statistics
stats = ops.end_session()
print(f"Total evaluations: {stats['total_evaluations']}")
print(f"Average throughput: {stats['throughput_qps']} req/sec")
```

### Context Manager (Auto Sessions)

```python
from agentops import AgentOps

with AgentOps() as ops:
    result = ops.evaluate(prompt, response)
    # Session automatically closed after block
```

### Direct Function Access

```python
from agentops import detect_hallucination

# Direct function call (lower-level API)
result = detect_hallucination(prompt, response, retrieved_docs)
print(result)
```

## 📊 Return Format

```python
{
    # Truth Metrics
    "semantic_drift": 0.22,         # 0-1: semantic distance from prompt
    "uncertainty": 0.0,             # 0-1: uncertainty language score
    "factual_support": 0.52,        # 0-1: factual grounding score
    "mode": "retrieved-doc entailment",  # or "self-check"
    "hallucination_probability": 0.57,   # 0-1: overall score
    "hallucinated": True,           # True if probability > 0.45
    
    # Reliability Metrics 🆕
    "latency_sec": 2.34,            # End-to-end evaluation time in seconds
    "throughput_qps": 0.427         # Requests per second (queries per second)
}
```

## 🎯 Detection Modes

| Mode            | retrieved_docs | Truth Checks                                            | Reliability Metrics            |
| --------------- | -------------- | ------------------------------------------------------- | ------------------------------ |
| **RAG mode**    | List of chunks | Semantic drift + entailment (evidence-based factuality) | Latency + Throughput (tracked) |
| **No-RAG mode** | None           | Semantic drift + uncertainty + factual self-check (LLM) | Latency + Throughput (tracked) |

## 📈 Reliability Metrics

### Latency Tracking
- **What**: End-to-end time from request to response
- **Why**: Shows model responsiveness and performance degradation
- **Unit**: Seconds (rounded to 3 decimal places)

### Throughput Tracking
- **What**: Number of evaluations processed per second
- **Why**: Measures system capacity and parallel efficiency
- **Unit**: Queries per second (QPS)
- **Modes**:
  - **Single-run** (`track_throughput=False`): `throughput = 1 / latency`
  - **Batch mode** (`track_throughput=True`): `throughput = total_evaluations / total_time`

## 🧪 Testing

Run the test suite:

```bash
pytest test_detector.py -v
```

Run example scenarios:

```bash
python examples.py
```

## 📈 Scoring System

### Components

1. **Semantic Drift** (weight: 0.4)
   - Measures cosine distance between prompt and response embeddings
   - High drift = response is semantically distant from question

2. **Uncertainty** (weight: 0.2)
   - Detects uncertainty language: "maybe", "probably", "might", etc.
   - Higher score = more uncertain language

3. **Factual Support** (weight: 0.4)
   - **RAG mode**: Entailment check against retrieved docs
   - **No-RAG mode**: LLM self-check for factual accuracy

### Threshold

- **Hallucination threshold**: 0.45
- Scores above 0.45 are flagged as potential hallucinations

## 🔧 Configuration

### Adjusting Weights

Edit the fusion weights in `detector_flexible.py`:

```python
halluc_prob = round(0.4 * (1 - factual) + 0.4 * drift + 0.2 * uncert, 3)
#                   ^^^                    ^^^          ^^^
#                   factual weight         drift        uncertainty
```

### Adjusting Threshold

Change the threshold in the return statement:

```python
"hallucinated": halluc_prob > 0.45  # Change 0.45 to desired threshold
```

### Throughput Tracking Modes

```python
# Single-run mode (throughput = 1/latency)
result = detect_hallucination(prompt, response, track_throughput=False)

# Batch mode (cumulative tracking)
result = detect_hallucination(prompt, response, track_throughput=True)

# Reset cumulative tracker
from detector_flexible import reset_throughput_tracker
reset_throughput_tracker()

# Get current stats
from detector_flexible import get_throughput_stats
stats = get_throughput_stats()
# Returns: {'total_evaluations': int, 'total_time_sec': float, 'throughput_qps': float}
```

## 📝 Example Use Cases

### Case 1: Medical RAG System

```python
prompt = "What are Ozempic side effects?"
docs = ["Common: nausea, vomiting", "Rare: pancreatitis"]
response = "Causes nausea and heart palpitations"  # ⚠️ heart palpitations not in docs

result = detect_hallucination(prompt, response, docs)
# High hallucination probability due to unsupported claim
```

### Case 2: General Knowledge

```python
prompt = "Who invented the telephone?"
response = "Alexander Graham Bell invented the telephone."

result = detect_hallucination(prompt, response)
# Low hallucination probability - factually correct
```

### Case 3: Uncertain Response

```python
prompt = "What's the weather like?"
response = "Maybe it's probably sunny, I'm not sure."

result = detect_hallucination(prompt, response)
# High uncertainty score detected
```

## 🛠️ API Reference

### AgentOps SDK Client

#### `AgentOps(api_key=None, track_throughput=True)`

Initialize the AgentOps SDK client.

**Parameters:**
- `api_key` (str, optional): API key for future cloud features
- `track_throughput` (bool, default=True): Enable cumulative throughput tracking

**Methods:**

##### `evaluate(prompt, response, retrieved_docs=None)`

Evaluate an agent's response for hallucinations and reliability.

**Returns:** `dict` with truth and reliability metrics

##### `metrics()`

Get current cumulative statistics.

**Returns:** `{'total_evaluations': int, 'total_time_sec': float, 'throughput_qps': float}`

##### `reset_metrics()`

Reset throughput tracker for new session.

##### `start_session()`

Start a new monitoring session with fresh metrics.

##### `end_session()`

End current session and return final statistics.

**Context Manager Support:**
```python
with AgentOps() as ops:
    result = ops.evaluate(prompt, response)
```

### Direct Function API

#### `detect_hallucination(prompt, response, retrieved_docs=None, track_throughput=True)`

Low-level detection function with reliability metrics.

**Parameters:**
- `prompt` (str): Original user question/prompt
- `response` (str): LLM's generated response
- `retrieved_docs` (list[str], optional): Retrieved evidence chunks for RAG mode
- `track_throughput` (bool, default=True): Enable cumulative throughput tracking

**Returns:**
- `dict`: Detection results with truth metrics and reliability metrics

### Utility Functions

- `reset_throughput_tracker()`: Reset cumulative throughput counters
- `get_throughput_stats()`: Get current throughput statistics
- `uncertainty_score(text)`: Calculate uncertainty language score

## 🚧 Roadmap

### Phase 1: Core Detection ✅
- [x] Dual-mode hallucination detection
- [x] Semantic drift, uncertainty, factual support
- [x] Comprehensive test suite

### Phase 2: Reliability Metrics ✅ 
- [x] Latency tracking
- [x] Throughput calculation (single-run and batch)
- [x] Thread-safe cumulative tracking

### Phase 3: Integration (Next)
- [ ] FastAPI endpoint for HTTP access
- [ ] Supabase/database logging
- [ ] AgentOps SDK for automatic instrumentation
- [ ] Visual dashboard (metrics over time)

### Phase 4: Advanced Features
- [ ] Sentence-level breakdown (flag specific hallucinated sentences)
- [ ] Custom model support (non-OpenAI)
- [ ] Async/concurrent evaluation
- [ ] Performance optimization for large-scale deployment
- [ ] Alerting on anomalies (latency spikes, hallucination rate)

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please test your changes with the test suite before submitting.

---

Built with ❤️ using OpenAI APIs
