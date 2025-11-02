-- AgentOps Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Input data
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    retrieved_docs TEXT[],
    
    -- Metrics
    semantic_drift FLOAT NOT NULL CHECK (semantic_drift >= 0 AND semantic_drift <= 1),
    uncertainty FLOAT NOT NULL CHECK (uncertainty >= 0 AND uncertainty <= 1),
    factual_support FLOAT NOT NULL CHECK (factual_support >= 0 AND factual_support <= 1),
    hallucination_probability FLOAT NOT NULL CHECK (hallucination_probability >= 0 AND hallucination_probability <= 1),
    hallucinated BOOLEAN NOT NULL,
    
    -- Performance
    latency_sec FLOAT NOT NULL,
    throughput_qps FLOAT,
    
    -- Metadata
    mode VARCHAR(50) NOT NULL,
    model_name VARCHAR(100),
    agent_name VARCHAR(100),
    session_id VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluations_hallucinated ON evaluations(hallucinated);
CREATE INDEX IF NOT EXISTS idx_evaluations_agent_name ON evaluations(agent_name);
CREATE INDEX IF NOT EXISTS idx_evaluations_session_id ON evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Users can manage their own API keys
CREATE POLICY api_keys_all_own ON api_keys
    FOR ALL
    USING (auth.uid() = user_id);

-- Users can manage their own evaluations
CREATE POLICY evaluations_all_own ON evaluations
    FOR ALL
    USING (auth.uid() = user_id);

-- Service role can do everything (bypasses RLS)
-- This is handled by using the service_role key in the application

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample view for analytics
CREATE OR REPLACE VIEW evaluation_analytics AS
SELECT 
    user_id,
    agent_name,
    DATE(created_at) as date,
    COUNT(*) as total_evaluations,
    SUM(CASE WHEN hallucinated THEN 1 ELSE 0 END) as total_hallucinations,
    AVG(hallucination_probability) as avg_hallucination_prob,
    AVG(latency_sec) as avg_latency,
    AVG(throughput_qps) as avg_throughput,
    AVG(semantic_drift) as avg_semantic_drift,
    AVG(uncertainty) as avg_uncertainty,
    AVG(factual_support) as avg_factual_support
FROM evaluations
GROUP BY user_id, agent_name, DATE(created_at);

-- Grant permissions
GRANT SELECT ON evaluation_analytics TO authenticated;
GRANT SELECT ON evaluation_analytics TO service_role;

