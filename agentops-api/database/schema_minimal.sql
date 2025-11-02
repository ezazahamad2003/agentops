-- Minimal AgentOps Schema for MVP
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Agents table (one per SDK instance/project)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- API Keys table (maps keys → agents)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'default',
  key TEXT UNIQUE NOT NULL,        -- store raw for MVP; hash later
  active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluations table (all the metrics)
CREATE TABLE IF NOT EXISTS evals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Input
  model TEXT,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  retrieved_docs TEXT[],
  
  -- Metrics
  semantic_drift FLOAT,
  factual_support FLOAT,
  uncertainty FLOAT,
  hallucination_probability FLOAT,
  hallucinated BOOLEAN,
  
  -- Performance
  latency_sec FLOAT,
  throughput_qps FLOAT,
  
  -- Metadata
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS api_keys_agent_idx ON api_keys(agent_id);
CREATE INDEX IF NOT EXISTS api_keys_active_idx ON api_keys(active);
CREATE INDEX IF NOT EXISTS api_keys_key_idx ON api_keys(key);

CREATE INDEX IF NOT EXISTS evals_agent_idx ON evals(agent_id);
CREATE INDEX IF NOT EXISTS evals_created_idx ON evals(created_at DESC);
CREATE INDEX IF NOT EXISTS evals_hallucinated_idx ON evals(hallucinated);
CREATE INDEX IF NOT EXISTS evals_model_idx ON evals(model);

-- View for quick stats
CREATE OR REPLACE VIEW agent_stats AS
SELECT 
  agent_id,
  COUNT(*) as total_evals,
  SUM(CASE WHEN hallucinated THEN 1 ELSE 0 END) as total_hallucinations,
  AVG(hallucination_probability) as avg_hallucination_prob,
  AVG(latency_sec) as avg_latency,
  AVG(throughput_qps) as avg_throughput,
  MAX(created_at) as last_eval_at
FROM evals
GROUP BY agent_id;

