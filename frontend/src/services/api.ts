import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('agentops_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Authentication - Full backend
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('agentops_token', response.data.access_token);
    }
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

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async logout() {
    localStorage.removeItem('agentops_token');
    localStorage.removeItem('agentops_user');
  },

  // API Keys - Full backend with JWT authentication
  async createApiKeys(name: string) {
    const response = await apiClient.post('/auth/api-keys', { name });
    return {
      id: response.data.id,
      name: response.data.name,
      key: response.data.key,
      created_at: response.data.created_at,
      is_active: response.data.is_active
    };
  },

  async getApiKeys() {
    const response = await apiClient.get('/auth/api-keys');
    return response.data.map((key: any) => ({
      id: key.id,
      name: key.name,
      key: key.key_preview || key.key,
      created_at: key.created_at,
      last_used_at: key.last_used_at,
      is_active: key.is_active
    }));
  },

  async deleteApiKey(keyId: string) {
    const response = await apiClient.delete(`/auth/api-keys/${keyId}`);
    return response.data;
  },

  // Evaluations - Full backend
  async getEvaluations(params?: {
    limit?: number;
    offset?: number;
    agent_name?: string;
    hallucinated?: boolean;
    start_date?: string;
    end_date?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.agent_name) queryParams.append('agent_name', params.agent_name);
    if (params?.hallucinated !== undefined) queryParams.append('hallucinated', params.hallucinated.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);

    const response = await apiClient.get(`/evaluations/?${queryParams.toString()}`);
    return response.data;
  },

  async getEvaluationStats(days: number = 7, agent_name?: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('days', days.toString());
    if (agent_name) queryParams.append('agent_name', agent_name);

    const response = await apiClient.get(`/evaluations/stats?${queryParams.toString()}`);
    return response.data;
  },

  async createEvaluation(evaluation: any) {
    const response = await apiClient.post('/evaluations/', evaluation);
    return response.data;
  },

  async getEvaluation(id: string) {
    const response = await apiClient.get(`/evaluations/${id}`);
    return response.data;
  },

  async deleteEvaluation(id: string) {
    const response = await apiClient.delete(`/evaluations/${id}`);
    return response.data;
  },

  // Health check
  async healthCheck() {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiService;
