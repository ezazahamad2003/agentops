-- AgentOps Database Verification Queries
-- Run these in Supabase SQL Editor after running test_agent.py

-- ============================================================
-- 1. Check all agents
-- ============================================================
SELECT 
  id,
  name,
  created_at,
  last_active_at,
  metadata
FROM agents
ORDER BY created_at DESC;

-- ============================================================
-- 2. Check API keys
-- ============================================================
SELECT 
  id,
  agent_id,
  name,
  LEFT(key, 20) || '...' as key_preview,  -- Show first 20 chars only
  active,
  last_used_at,
  created_at
FROM api_keys
ORDER BY created_at DESC;

-- ============================================================
-- 3. View all evaluations (most recent first)
-- ============================================================
SELECT 
  id,
  agent_id,
  model,
  LEFT(prompt, 50) || '...' as prompt_preview,
  LEFT(response, 50) || '...' as response_preview,
  semantic_drift,
  factual_support,
  uncertainty,
  hallucination_probability,
  hallucinated,
  latency_sec,
  throughput_qps,
  created_at
FROM evals
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================
-- 4. Get detailed view of specific evaluations
-- ============================================================
SELECT 
  id,
  model,
  prompt,
  response,
  semantic_drift,
  factual_support,
  uncertainty,
  hallucination_probability,
  CASE 
    WHEN hallucinated THEN '🚨 YES' 
    ELSE '✅ NO' 
  END as hallucinated_status,
  latency_sec,
  created_at
FROM evals
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================
-- 5. Check agent statistics (using the view)
-- ============================================================
SELECT 
  agent_id,
  total_evals,
  total_hallucinations,
  ROUND((total_hallucinations::numeric / total_evals * 100), 2) as hallucination_rate_pct,
  ROUND(avg_hallucination_prob::numeric, 3) as avg_hallucination_prob,
  ROUND(avg_latency::numeric, 3) as avg_latency_sec,
  ROUND(avg_throughput::numeric, 3) as avg_throughput_qps,
  last_eval_at
FROM agent_stats;

-- ============================================================
-- 6. Hallucination analysis
-- ============================================================
SELECT 
  hallucinated,
  COUNT(*) as count,
  ROUND(AVG(hallucination_probability)::numeric, 3) as avg_prob,
  ROUND(AVG(semantic_drift)::numeric, 3) as avg_drift,
  ROUND(AVG(factual_support)::numeric, 3) as avg_factual_support,
  ROUND(AVG(uncertainty)::numeric, 3) as avg_uncertainty
FROM evals
GROUP BY hallucinated
ORDER BY hallucinated DESC;

-- ============================================================
-- 7. Performance metrics over time
-- ============================================================
SELECT 
  DATE_TRUNC('minute', created_at) as time_bucket,
  COUNT(*) as num_evals,
  ROUND(AVG(latency_sec)::numeric, 3) as avg_latency,
  ROUND(AVG(throughput_qps)::numeric, 3) as avg_throughput,
  SUM(CASE WHEN hallucinated THEN 1 ELSE 0 END) as hallucinations
FROM evals
GROUP BY DATE_TRUNC('minute', created_at)
ORDER BY time_bucket DESC
LIMIT 10;

-- ============================================================
-- 8. Model-wise performance
-- ============================================================
SELECT 
  model,
  COUNT(*) as total_evals,
  SUM(CASE WHEN hallucinated THEN 1 ELSE 0 END) as hallucinations,
  ROUND((SUM(CASE WHEN hallucinated THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100), 2) as hallucination_rate_pct,
  ROUND(AVG(hallucination_probability)::numeric, 3) as avg_hallucination_prob,
  ROUND(AVG(latency_sec)::numeric, 3) as avg_latency,
  ROUND(AVG(factual_support)::numeric, 3) as avg_factual_support
FROM evals
GROUP BY model
ORDER BY hallucination_rate_pct DESC;

-- ============================================================
-- 9. Recent hallucinations (to investigate)
-- ============================================================
SELECT 
  model,
  prompt,
  response,
  semantic_drift,
  factual_support,
  uncertainty,
  hallucination_probability,
  created_at
FROM evals
WHERE hallucinated = true
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- 10. Top 5 best (most reliable) responses
-- ============================================================
SELECT 
  model,
  LEFT(prompt, 60) || '...' as prompt,
  LEFT(response, 60) || '...' as response,
  hallucination_probability,
  factual_support,
  semantic_drift,
  uncertainty
FROM evals
ORDER BY hallucination_probability ASC, factual_support DESC
LIMIT 5;

-- ============================================================
-- 11. Top 5 worst (most likely hallucinated) responses
-- ============================================================
SELECT 
  model,
  LEFT(prompt, 60) || '...' as prompt,
  LEFT(response, 60) || '...' as response,
  hallucination_probability,
  factual_support,
  semantic_drift,
  uncertainty
FROM evals
ORDER BY hallucination_probability DESC
LIMIT 5;

-- ============================================================
-- 12. Check if RAG mode was used (retrieved_docs present)
-- ============================================================
SELECT 
  COUNT(*) as total_evals,
  SUM(CASE WHEN retrieved_docs IS NOT NULL AND array_length(retrieved_docs, 1) > 0 THEN 1 ELSE 0 END) as rag_mode_evals,
  SUM(CASE WHEN retrieved_docs IS NULL OR array_length(retrieved_docs, 1) = 0 THEN 1 ELSE 0 END) as no_rag_evals
FROM evals;

-- ============================================================
-- 13. Distribution of hallucination probabilities
-- ============================================================
SELECT 
  CASE 
    WHEN hallucination_probability < 0.2 THEN '0.0-0.2 (Low)'
    WHEN hallucination_probability < 0.4 THEN '0.2-0.4 (Medium-Low)'
    WHEN hallucination_probability < 0.6 THEN '0.4-0.6 (Medium)'
    WHEN hallucination_probability < 0.8 THEN '0.6-0.8 (Medium-High)'
    ELSE '0.8-1.0 (High)'
  END as probability_range,
  COUNT(*) as count,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM evals) * 100), 2) as percentage
FROM evals
GROUP BY probability_range
ORDER BY probability_range;

-- ============================================================
-- 14. Latest 5 evaluations with full details
-- ============================================================
SELECT 
  e.id,
  e.model,
  e.prompt,
  e.response,
  e.semantic_drift,
  e.factual_support,
  e.uncertainty,
  e.hallucination_probability,
  e.hallucinated,
  e.latency_sec,
  e.throughput_qps,
  e.retrieved_docs,
  e.meta,
  e.created_at,
  a.name as agent_name
FROM evals e
JOIN agents a ON e.agent_id = a.id
ORDER BY e.created_at DESC
LIMIT 5;

-- ============================================================
-- 15. Summary statistics (single row overview)
-- ============================================================
SELECT 
  COUNT(*) as total_evaluations,
  COUNT(DISTINCT agent_id) as unique_agents,
  COUNT(DISTINCT model) as unique_models,
  SUM(CASE WHEN hallucinated THEN 1 ELSE 0 END) as total_hallucinations,
  ROUND((SUM(CASE WHEN hallucinated THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100), 2) as overall_hallucination_rate_pct,
  ROUND(AVG(hallucination_probability)::numeric, 3) as avg_hallucination_prob,
  ROUND(AVG(latency_sec)::numeric, 3) as avg_latency_sec,
  ROUND(AVG(throughput_qps)::numeric, 3) as avg_throughput_qps,
  ROUND(AVG(semantic_drift)::numeric, 3) as avg_semantic_drift,
  ROUND(AVG(factual_support)::numeric, 3) as avg_factual_support,
  ROUND(AVG(uncertainty)::numeric, 3) as avg_uncertainty,
  MIN(created_at) as first_eval,
  MAX(created_at) as last_eval
FROM evals;

