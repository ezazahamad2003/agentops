import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://agentops-api-1081133763032.us-central1.run.app';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('agentops_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Authentication
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, fullName: string) {
    const response = await apiClient.post('/auth/register', { 
      email, 
      password, 
      full_name: fullName 
    });
    return response.data;
  },

  // Agent Registration (Minimal backend - no auth required)
  async registerAgent(name: string, metadata?: any) {
    const response = await apiClient.post('/register', { name, metadata });
    return response.data;
  },

  // API Keys - Using minimal backend's register endpoint
  async createApiKeys(name: string) {
    // Minimal backend: register creates an agent and returns api_key
    const response = await apiClient.post('/register', { 
      name,
      metadata: { created_from: 'frontend', user: localStorage.getItem('agentops_user') }
    });
    
    // Transform response to match expected format
    return {
      id: response.data.agent_id,
      name: name,
      key: response.data.api_key,
      created_at: new Date().toISOString(),
      is_active: true
    };
  },

  async getApiKeys() {
    // Minimal backend doesn't have list endpoint
    // Return stored keys from localStorage
    const storedKeys = localStorage.getItem('agentops_api_keys');
    return storedKeys ? JSON.parse(storedKeys) : [];
  },

  async deleteApiKey(keyId: string) {
    const token = localStorage.getItem('agentops_token');
    const response = await apiClient.delete(`/auth/api-keys/${keyId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  },

  // Evaluations - Minimal backend uses /stats/{agent_id}
  async getEvaluations(params?: {
    limit?: number;
    offset?: number;
    agent_name?: string;
    hallucinated?: boolean;
    start_date?: string;
    end_date?: string;
  }) {
    // Minimal backend doesn't have list evaluations endpoint
    // Return empty array for now
    return [];
  },

  async getEvaluationStats(days: number = 7, agent_name?: string) {
    // Minimal backend uses /stats/{agent_id} with X-API-Key header
    const storedKeys = localStorage.getItem('agentops_api_keys');
    if (storedKeys) {
      const keys = JSON.parse(storedKeys);
      if (keys.length > 0) {
        const agentId = keys[0].id;
        const apiKey = keys[0].key;
        
        try {
          const response = await apiClient.get(`/stats/${agentId}`, {
            headers: { 'X-API-Key': apiKey }
          });
          
          // Transform minimal backend response to expected format
          const data = response.data;
          return {
            total_evaluations: data.total_evals || 0,
            total_hallucinations: data.total_hallucinations || 0,
            hallucination_rate: data.avg_hallucination_prob || 0,
            avg_latency: data.avg_latency || 0,
            avg_throughput: data.avg_throughput || 0,
            avg_semantic_drift: 0,
            avg_uncertainty: 0,
            avg_factual_support: 0
          };
        } catch (err) {
          console.error('Error fetching stats:', err);
          // Return default stats on error
        }
      }
    }
    
    // Return default stats if no agent or error
    return {
      total_evaluations: 0,
      total_hallucinations: 0,
      hallucination_rate: 0,
      avg_latency: 0,
      avg_throughput: 0,
      avg_semantic_drift: 0,
      avg_uncertainty: 0,
      avg_factual_support: 0
    };
  },

  // Upload metrics to GCP backend
  async uploadMetrics(evaluation: any) {
    const apiKey = localStorage.getItem('agentops_api_key');
    const response = await apiClient.post('/metrics', evaluation, {
      headers: { 'X-API-Key': apiKey }
    });
    return response.data;
  },

  // Get agent stats from GCP
  async getAgentStats(agentId: string) {
    const response = await apiClient.get(`/stats/${agentId}`);
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiService;
