-- Auth-Enabled AgentOps Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add user_id column to agents table (links to Supabase Auth)
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS agents_user_idx ON agents(user_id);

-- Update agents table to require user_id for new entries
-- (Existing rows without user_id will remain, but new ones need it)

-- Optional: Backfill existing agents with a default user
-- UPDATE agents SET user_id = 'YOUR_DEFAULT_USER_ID' WHERE user_id IS NULL;

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE evals ENABLE ROW LEVEL SECURITY;

-- Agents: Users can only see/modify their own agents
CREATE POLICY "Users can view their own agents"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- API Keys: Users can only see/modify keys for their agents
CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create API keys for their agents"
  ON api_keys FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own API keys"
  ON api_keys FOR DELETE
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- Evals: Users can only see evals for their agents
CREATE POLICY "Users can view their own evals"
  ON evals FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

-- Service role bypasses RLS (for API to write metrics)
-- This is handled by using SUPABASE_SERVICE_KEY in the API

-- View for user dashboard stats
CREATE OR REPLACE VIEW user_agent_stats AS
SELECT 
  a.user_id,
  a.id as agent_id,
  a.name as agent_name,
  COUNT(e.id) as total_evals,
  SUM(CASE WHEN e.hallucinated THEN 1 ELSE 0 END) as total_hallucinations,
  AVG(e.hallucination_probability) as avg_hallucination_prob,
  AVG(e.latency_sec) as avg_latency,
  AVG(e.throughput_qps) as avg_throughput,
  MAX(e.created_at) as last_eval_at
FROM agents a
LEFT JOIN evals e ON e.agent_id = a.id
GROUP BY a.user_id, a.id, a.name;

-- Grant access to authenticated users
GRANT SELECT ON user_agent_stats TO authenticated;
GRANT SELECT ON user_agent_stats TO service_role;

-- Function to check if API key belongs to user
CREATE OR REPLACE FUNCTION user_owns_api_key(api_key_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM api_keys k
    JOIN agents a ON a.id = k.agent_id
    WHERE k.key = api_key_value
    AND a.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

