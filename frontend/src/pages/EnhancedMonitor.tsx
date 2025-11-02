import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Zap,
  RefreshCw,
  ChevronRight,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface Evaluation {
  id: string;
  prompt: string;
  response: string;
  hallucinated: boolean;
  hallucination_probability: number;
  semantic_drift: number;
  uncertainty: number;
  factual_support: number;
  latency_sec: number;
  throughput_qps: number;
  created_at: string;
  agent_name?: string;
}

const EnhancedMonitor: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null);
  const [timeRange, setTimeRange] = useState(7);

  // Mock evaluation data for demonstration
  const mockEvaluations: Evaluation[] = [
    {
      id: '1',
      prompt: 'What is the capital of France?',
      response: 'The capital of France is Paris, known for the Eiffel Tower.',
      hallucinated: false,
      hallucination_probability: 0.08,
      semantic_drift: 0.12,
      uncertainty: 0.05,
      factual_support: 0.95,
      latency_sec: 1.2,
      throughput_qps: 0.83,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      agent_name: 'QA Agent'
    },
    {
      id: '2',
      prompt: 'Tell me about Python 4.0 features',
      response: 'Python 4.0 includes async improvements and better type hints.',
      hallucinated: false,
      hallucination_probability: 0.25,
      semantic_drift: 0.35,
      uncertainty: 0.15,
      factual_support: 0.70,
      latency_sec: 2.1,
      throughput_qps: 0.48,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      agent_name: 'Tech Agent'
    },
    {
      id: '3',
      prompt: 'What is the population of Mars?',
      response: 'Mars currently has no permanent human population, only robotic missions.',
      hallucinated: false,
      hallucination_probability: 0.15,
      semantic_drift: 0.20,
      uncertainty: 0.10,
      factual_support: 0.85,
      latency_sec: 1.5,
      throughput_qps: 0.67,
      created_at: new Date(Date.now() - 10800000).toISOString(),
      agent_name: 'QA Agent'
    },
    {
      id: '4',
      prompt: 'Explain quantum computing',
      response: 'Quantum computing uses quantum bits that can be in superposition.',
      hallucinated: false,
      hallucination_probability: 0.12,
      semantic_drift: 0.18,
      uncertainty: 0.08,
      factual_support: 0.88,
      latency_sec: 1.8,
      throughput_qps: 0.56,
      created_at: new Date(Date.now() - 14400000).toISOString(),
      agent_name: 'Tech Agent'
    },
    {
      id: '5',
      prompt: 'Who wrote Romeo and Juliet?',
      response: 'William Shakespeare wrote Romeo and Juliet in the 1590s.',
      hallucinated: false,
      hallucination_probability: 0.05,
      semantic_drift: 0.08,
      uncertainty: 0.02,
      factual_support: 0.98,
      latency_sec: 0.9,
      throughput_qps: 1.11,
      created_at: new Date(Date.now() - 18000000).toISOString(),
      agent_name: 'QA Agent'
    }
  ];

  useEffect(() => {
    fetchMonitoringData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError('');

      const statsData = await apiService.getEvaluationStats(timeRange);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMonitoringData();
    setRefreshing(false);
  };

  // Prepare chart data from mock evaluations
  const timeSeriesData = mockEvaluations.map((eval_, index) => ({
    time: new Date(eval_.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: eval_.latency_sec,
    throughput: eval_.throughput_qps,
    hallucination: eval_.hallucination_probability * 100,
  })).reverse();

  const pieData = [
    { name: 'Normal', value: mockEvaluations.filter(e => !e.hallucinated).length, color: '#10b981' },
    { name: 'Flagged', value: mockEvaluations.filter(e => e.hallucinated).length, color: '#ef4444' }
  ];

  const metricsData = mockEvaluations.map(eval_ => ({
    name: eval_.agent_name?.substring(0, 10) || 'Agent',
    drift: eval_.semantic_drift * 100,
    uncertainty: eval_.uncertainty * 100,
    support: eval_.factual_support * 100,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Monitor</h1>
          <p className="text-dark-muted mt-1">Real-time monitoring of your AI agents</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="input"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-muted">Total Evaluations</p>
              <p className="text-3xl font-bold text-dark-text mt-2">{stats?.total_evaluations || 0}</p>
              <p className="text-xs text-dark-muted mt-1">Last {timeRange} days</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-muted">Hallucination Rate</p>
              <p className="text-3xl font-bold text-dark-text mt-2">
                {((stats?.hallucination_rate || 0) * 100).toFixed(1)}%
              </p>
              <div className="flex items-center mt-1">
                {(stats?.hallucination_rate || 0) > 0.1 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-red-400 mr-1" />
                    <span className="text-xs text-red-400">High</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">Normal</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-muted">Avg Latency</p>
              <p className="text-3xl font-bold text-dark-text mt-2">{(stats?.avg_latency || 0).toFixed(2)}s</p>
              <div className="flex items-center mt-1">
                <Clock className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-xs text-yellow-400">
                  {(stats?.avg_latency || 0) > 2 ? 'Slow' : 'Good'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-muted">Avg Throughput</p>
              <p className="text-3xl font-bold text-dark-text mt-2">{(stats?.avg_throughput || 0).toFixed(1)} QPS</p>
              <div className="flex items-center mt-1">
                <Zap className="w-3 h-3 text-green-400 mr-1" />
                <span className="text-xs text-green-400">Active</span>
              </div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency & Throughput Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="latency" stroke="#3b82f6" name="Latency (s)" strokeWidth={2} />
              <Line type="monotone" dataKey="throughput" stroke="#10b981" name="Throughput (QPS)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hallucination Probability */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Hallucination Probability</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="hallucination" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Probability (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Truth Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Truth Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="drift" fill="#8b5cf6" name="Semantic Drift (%)" />
              <Bar dataKey="uncertainty" fill="#f59e0b" name="Uncertainty (%)" />
              <Bar dataKey="support" fill="#10b981" name="Factual Support (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-text mb-4">Response Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Evaluations with Drill-down */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-text mb-4">Recent Evaluations</h3>
        <div className="space-y-3">
          {mockEvaluations.map((evaluation) => (
            <div 
              key={evaluation.id} 
              className="border border-dark-border rounded-lg p-4 hover:border-agentops-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedEval(evaluation)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {evaluation.hallucinated ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      evaluation.hallucinated
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {evaluation.hallucinated ? 'Hallucinated' : 'Normal'}
                    </span>
                    <span className="text-xs text-dark-muted">{evaluation.agent_name}</span>
                    <span className="text-xs text-dark-muted">
                      {new Date(evaluation.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-dark-text mb-1">
                    <strong>Prompt:</strong> {evaluation.prompt}
                  </p>
                  <p className="text-sm text-dark-muted line-clamp-2">
                    <strong>Response:</strong> {evaluation.response}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-dark-muted">
                    <span>Confidence: {((1 - evaluation.hallucination_probability) * 100).toFixed(1)}%</span>
                    <span>Latency: {evaluation.latency_sec}s</span>
                    <span>Drift: {(evaluation.semantic_drift * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-dark-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drill-down Modal */}
      {selectedEval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-surface border border-dark-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark-text">Evaluation Details</h2>
              <button
                onClick={() => setSelectedEval(null)}
                className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-dark-muted" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {selectedEval.hallucinated ? (
                    <XCircle className="w-6 h-6 text-red-400" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  <span className={`text-lg font-semibold ${
                    selectedEval.hallucinated ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {selectedEval.hallucinated ? 'Hallucination Detected' : 'Response Validated'}
                  </span>
                </div>
                <p className="text-sm text-dark-muted">
                  Agent: {selectedEval.agent_name} • {new Date(selectedEval.created_at).toLocaleString()}
                </p>
              </div>

              {/* Prompt & Response */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-dark-muted mb-2">PROMPT</h3>
                  <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                    <p className="text-dark-text">{selectedEval.prompt}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-dark-muted mb-2">RESPONSE</h3>
                  <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                    <p className="text-dark-text">{selectedEval.response}</p>
                  </div>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-dark-muted mb-3">TRUTH METRICS BREAKDOWN</h3>
                <div className="space-y-3">
                  {/* Hallucination Probability */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-dark-text">Hallucination Probability</span>
                      <span className="text-sm font-semibold text-red-400">
                        {(selectedEval.hallucination_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-dark-bg rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${selectedEval.hallucination_probability * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-dark-muted mt-1">
                      Overall likelihood of hallucination based on all metrics
                    </p>
                  </div>

                  {/* Semantic Drift */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-dark-text">Semantic Drift</span>
                      <span className="text-sm font-semibold text-purple-400">
                        {(selectedEval.semantic_drift * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-dark-bg rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${selectedEval.semantic_drift * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-dark-muted mt-1">
                      How much the response deviates from the prompt's intent
                    </p>
                  </div>

                  {/* Uncertainty */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-dark-text">Uncertainty</span>
                      <span className="text-sm font-semibold text-yellow-400">
                        {(selectedEval.uncertainty * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-dark-bg rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${selectedEval.uncertainty * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-dark-muted mt-1">
                      Presence of uncertain language (maybe, probably, might, etc.)
                    </p>
                  </div>

                  {/* Factual Support */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-dark-text">Factual Support</span>
                      <span className="text-sm font-semibold text-green-400">
                        {(selectedEval.factual_support * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-dark-bg rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${selectedEval.factual_support * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-dark-muted mt-1">
                      How well the response is grounded in factual information
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-sm font-semibold text-dark-muted mb-3">PERFORMANCE METRICS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                    <p className="text-xs text-dark-muted mb-1">Latency</p>
                    <p className="text-2xl font-bold text-dark-text">{selectedEval.latency_sec}s</p>
                  </div>
                  <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
                    <p className="text-xs text-dark-muted mb-1">Throughput</p>
                    <p className="text-2xl font-bold text-dark-text">{selectedEval.throughput_qps} QPS</p>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`border rounded-lg p-4 ${
                selectedEval.hallucinated 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <h3 className="text-sm font-semibold text-dark-text mb-2">
                  {selectedEval.hallucinated ? '⚠️ Action Required' : '✅ Recommendation'}
                </h3>
                <p className="text-sm text-dark-muted">
                  {selectedEval.hallucinated 
                    ? 'This response was flagged as a potential hallucination. Review the response and consider adding more context or constraints to your prompt.'
                    : 'This response passed all validation checks and appears to be accurate and well-grounded.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMonitor;
