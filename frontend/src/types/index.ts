export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface Evaluation {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  retrieved_docs?: string[];
  semantic_drift: number;
  uncertainty: number;
  factual_support: number;
  hallucination_probability: number;
  hallucinated: boolean;
  latency_sec: number;
  throughput_qps?: number;
  mode: string;
  model_name?: string;
  agent_name?: string;
  session_id?: string;
  created_at: string;
}

export interface EvaluationStats {
  total_evaluations: number;
  total_hallucinations: number;
  hallucination_rate: number;
  avg_latency: number;
  avg_throughput: number;
  avg_semantic_drift: number;
  avg_uncertainty: number;
  avg_factual_support: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
