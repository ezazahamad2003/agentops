# AgentOps Client - AI Reliability Engineering for LLM Agents

Monitor your LLM agents with production-grade observability. Detect hallucinations, track latency, and measure throughput—all in one SDK.

## 🎯 Why AgentOps Client?

When deploying LLM agents to production, you need to know:
- **Is my agent hallucinating?** (Truth Quality)
- **How fast is it responding?** (Latency)
- **Can it handle load?** (Throughput)

AgentOps Client answers all three questions with a simple, pip-installable SDK.

## ✨ Key Features

### 🔍 Dual-Mode Hallucination Detection
- **RAG Mode**: Evidence-based fact checking against retrieved documents
- **No-RAG Mode**: Semantic drift + uncertainty analysis + LLM self-check
- **Multi-Signal Fusion**: Combines semantic similarity, uncertainty cues, and factual verification

### 📊 Reliability Metrics
- **Latency Tracking**: End-to-end evaluation timing
- **Throughput Monitoring**: Requests per second (single-run or batch)
- **Thread-Safe**: Concurrent session management with locks

### 🛠️ Developer-Friendly
- **Simple API**: 3 lines of code to get started
- **Session Management**: Context managers for batch operations
- **Explainable Scores**: Detailed breakdown of every metric
- **Type Hints**: Full IDE autocomplete support

## 🚀 Quick Start

```python
from agentops import AgentOps

# Initialize
ops = AgentOps()

# Evaluate a response
result = ops.evaluate(
    prompt="What is the capital of France?",
    response="Paris is the capital and largest city of France."
)

# Check results
print(f"Hallucinated: {result['hallucinated']}")  # False
print(f"Confidence: {1 - result['hallucination_probability']:.2%}")  # 95%
print(f"Latency: {result['latency_sec']}s")  # 0.42s
```

## 📈 Advanced Usage

### RAG Mode with Retrieved Documents

```python
result = ops.evaluate(
    prompt="What are the side effects of Ozempic?",
    response="Common side effects include nausea and vomiting.",
    retrieved_docs=[
        "Ozempic side effects: nausea, vomiting, diarrhea...",
        "Serious adverse events include pancreatitis..."
    ]
)
```

### Batch Monitoring with Sessions

```python
with AgentOps() as ops:
    for prompt, response in test_cases:
        result = ops.evaluate(prompt, response)
        
    # Get cumulative metrics
    metrics = ops.metrics()
    print(f"Average throughput: {metrics['throughput_qps']:.2f} req/sec")
```

## 🧠 How It Works

AgentOps uses a **weighted fusion algorithm** that combines:

1. **Semantic Drift** (40% weight): Measures cosine distance between prompt and response embeddings
2. **Factual Support** (40% weight): 
   - RAG mode: Entailment check against evidence
   - No-RAG mode: LLM-based self-verification
3. **Uncertainty** (20% weight): Lexical analysis of hedging language

```python
hallucination_probability = (
    0.4 × (1 - factual_support) +
    0.4 × semantic_drift +
    0.2 × uncertainty
)
```

## 🔧 Requirements

- Python 3.8+
- OpenAI API key (for embeddings & LLM calls)

## 📦 Installation

```bash
pip install agentops-client
```

Set your OpenAI API key:
```bash
export OPENAI_API_KEY='your-api-key-here'
```

Or in code:
```python
import os
os.environ['OPENAI_API_KEY'] = 'your-api-key-here'
```

## 🧪 Testing

The package includes a comprehensive test suite (25 tests, 100% passing):

```bash
pip install pytest
pytest tests/
```

## 🛣️ Roadmap

- [x] Core hallucination detection
- [x] Reliability metrics (latency, throughput)
- [x] SDK wrapper with session management
- [x] PyPI publication
- [ ] FastAPI endpoint for HTTP access
- [ ] Supabase/database logging
- [ ] Web dashboard for visualization
- [ ] Multi-LLM support (Anthropic, local models)
- [ ] Sentence-level breakdown

## 📄 License

MIT License - see [LICENSE](https://github.com/ezazahamad2003/agentops/blob/main/LICENSE) for details.

## 🤝 Contributing

Contributions welcome! Please check the [GitHub repository](https://github.com/ezazahamad2003/agentops) for:
- Issue tracker
- Pull request guidelines
- Development setup

## 🔗 Links

- **PyPI**: https://pypi.org/project/agentops-client/
- **GitHub**: https://github.com/ezazahamad2003/agentops
- **Documentation**: [README.md](https://github.com/ezazahamad2003/agentops#readme)
- **Bug Reports**: [Issues](https://github.com/ezazahamad2003/agentops/issues)

## 💡 Use Cases

### Production Monitoring
```python
# Wrap your production agent
def production_agent(prompt):
    response = your_llm_call(prompt)
    
    # Check quality
    check = ops.evaluate(prompt, response)
    if check['hallucinated']:
        log_warning(f"High hallucination risk: {check['reason']}")
    
    return response
```

### A/B Testing
```python
# Compare model versions
for model in ['gpt-4', 'gpt-3.5-turbo']:
    with AgentOps() as ops:
        for prompt in test_set:
            response = call_model(model, prompt)
            ops.evaluate(prompt, response)
        
        print(f"{model} throughput: {ops.metrics()['throughput_qps']}")
```

### RAG Pipeline Validation
```python
# Validate retrieval quality
def rag_pipeline(query):
    docs = retrieve(query)
    response = generate(query, docs)
    
    # Check factual grounding
    check = ops.evaluate(query, response, retrieved_docs=docs)
    
    return response, check
```

---

**Built with ❤️ for the LLM community**

Questions? Open an [issue on GitHub](https://github.com/ezazahamad2003/agentops/issues) or reach out!

