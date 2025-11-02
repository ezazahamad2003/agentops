# Changelog

All notable changes to the AgentOps SDK project.

## [Phase 2] - 2025-11-02 - Reliability Metrics

### Added
- ⏱️ **Latency tracking**: End-to-end evaluation time measurement
- 📊 **Throughput calculation**: 
  - Single-run mode: `throughput = 1 / latency`
  - Batch mode: `throughput = total_evaluations / total_time`
- 🔒 **Thread-safe ThroughputTracker class**: Concurrent tracking with locks
- 🛠️ **Management functions**:
  - `reset_throughput_tracker()`: Reset cumulative counters
  - `get_throughput_stats()`: Get current stats without running evaluation
- 📝 **New parameter**: `track_throughput` (default: True) for mode selection
- 🧪 **4 new tests**: Reliability metrics test suite
- 📚 **Example E**: Batch throughput tracking demonstration

### Changed
- Return format now includes `latency_sec` and `throughput_qps` fields
- Updated all existing tests to validate new metrics
- Enhanced examples with organized output (Truth Metrics + Reliability Metrics)
- Comprehensive README update with reliability engineering section

### Technical Details
- Uses `time.time()` for high-resolution timing
- Thread-safe implementation using `threading.Lock()`
- Non-breaking change: existing code continues to work
- All 16 tests passing (12 original + 4 new)

### Performance Metrics (Observed)
- RAG mode: ~2.5-3.0s latency, ~0.3-0.4 qps
- No-RAG mode: ~1.3-1.8s latency, ~0.4-0.5 qps
- Batch mode: ~0.8 qps average for sequential evaluations

---

## [Phase 1] - 2025-11-02 - Core Hallucination Detection

### Added
- ✅ Dual-mode detection (RAG and No-RAG)
- ✅ Semantic drift calculation (cosine similarity)
- ✅ Uncertainty language detection
- ✅ Evidence entailment scoring (RAG mode)
- ✅ Factual self-check (No-RAG mode)
- ✅ Weighted fusion scoring
- ✅ 12 comprehensive tests
- ✅ 4 example scenarios
- ✅ Complete documentation

### Features
- Works with OpenAI embeddings (text-embedding-3-small)
- Uses GPT-4o-mini for factual evaluation
- Threshold-based hallucination flagging (0.45)
- Explainable output with all intermediate scores

---

---

## [Phase 3] - 2025-11-02 - SDK Integration

### Added
- 🎁 **AgentOps SDK Client**: High-level wrapper class for easy integration
- 📦 **Package Structure**: Proper Python package with `agentops/` directory
- 🔄 **Session Management**: 
  - `start_session()` and `end_session()` for explicit control
  - Context manager support (`with AgentOps() as ops:`)
- 📝 **Real-World Examples**: `wrap_agent.py` with actual OpenAI integration
- 🧪 **SDK Test Suite**: 9 comprehensive tests for SDK functionality
- 📦 **setup.py**: Pip-installable package configuration
- 📚 **SDK Guide**: Complete integration guide (`SDK_GUIDE.md`)

### Changed
- Reorganized project structure:
  - Core detector → `agentops/detector_flexible.py`
  - SDK wrapper → `agentops/client.py`
  - Tests → `tests/` directory
  - Examples → `examples/` directory
- Updated README with SDK-first documentation
- Updated all import paths for new structure

### Technical Details
- Clean package exports via `agentops/__init__.py`
- Backward compatible: Both SDK and direct function access available
- Context manager implementation with `__enter__` and `__exit__`
- Session state tracking for automatic management
- All 25 tests passing (16 detector + 9 SDK)

### SDK Features
```python
# Simple initialization
ops = AgentOps()

# Easy evaluation
result = ops.evaluate(prompt, response)

# Session management
ops.start_session()
# ... evaluations ...
stats = ops.end_session()

# Context manager
with AgentOps() as ops:
    result = ops.evaluate(prompt, response)
```

---

## Roadmap

### Phase 4: Cloud Integration (Next)
- [ ] FastAPI endpoint for HTTP API
- [ ] Supabase/database schema and integration
- [ ] Persistent metrics storage
- [ ] Visual dashboard (metrics over time)
- [ ] Cloud deployment

### Phase 5: Advanced Features
- [ ] Sentence-level breakdown
- [ ] Custom model support (non-OpenAI)
- [ ] Async/concurrent evaluation
- [ ] Performance optimization for scale
- [ ] Alerting and anomaly detection
- [ ] Multi-agent comparison

