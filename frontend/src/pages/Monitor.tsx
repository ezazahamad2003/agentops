import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3,
  LineChart,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
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
import { Evaluation, EvaluationStats } from '../types';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Monitor: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(7);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMonitoringData();
  }, [timeRange, selectedAgent]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if API keys exist
      const storedKeys = localStorage.getItem('agentops_api_keys');
      if (!storedKeys || JSON.parse(storedKeys).length === 0) {
        setError('No API keys found. Please create an API key first.');
        setLoading(false);
        return;
      }

      const [evaluationsData, statsData] = await Promise.all([
        apiService.getEvaluations({
          limit: 100,
          agent_name: selectedAgent !== 'all' ? selectedAgent : undefined,
        }),
        apiService.getEvaluationStats(timeRange, selectedAgent !== 'all' ? selectedAgent : undefined)
      ]);

      setEvaluations(evaluationsData || []);
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

  // Prepare chart data
  const prepareTimeSeriesData = () => {
    const data = evaluations.slice(0, 50).reverse().map((eval_, index) => ({
      time: new Date(eval_.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      latency: eval_.latency_sec,
      throughput: eval_.throughput_qps || 0,
      hallucination_probability: eval_.hallucination_probability,
      semantic_drift: eval_.semantic_drift,
      factual_support: eval_.factual_support,
    }));
    return data;
  };

  const preparePieData = () => {
    const hallucinated = evaluations.filter(e => e.hallucinated).length;
    const normal = evaluations.length - hallucinated;
    
    return [
      { name: 'Normal', value: normal, color: '#10b981' },
      { name: 'Hallucinated', value: hallucinated, color: '#ef4444' }
    ];
  };

  const prepareAgentData = () => {
    const agentStats: Record<string, { count: number; hallucinations: number; avgLatency: number }> = {};
    
    evaluations.forEach(eval_ => {
      const agent = eval_.agent_name || 'Unknown';
      if (!agentStats[agent]) {
        agentStats[agent] = { count: 0, hallucinations: 0, avgLatency: 0 };
      }
      agentStats[agent].count++;
      if (eval_.hallucinated) agentStats[agent].hallucinations++;
      agentStats[agent].avgLatency += eval_.latency_sec;
    });

    return Object.entries(agentStats).map(([agent, stats]) => ({
      agent,
      evaluations: stats.count,
      hallucinations: stats.hallucinations,
      hallucination_rate: (stats.hallucinations / stats.count * 100).toFixed(1),
      avg_latency: (stats.avgLatency / stats.count).toFixed(2),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Unable to load monitoring data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <p className="font-medium">💡 Getting Started:</p>
          <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
            <li>Create an API key in the "API Keys" section</li>
            <li>Use the API key to upload metrics via the SDK or API</li>
            <li>Return here to view your agent's performance metrics</li>
          </ol>
        </div>
      </div>
    );
  }

  const timeSeriesData = prepareTimeSeriesData();
  const pieData = preparePieData();
  const agentData = prepareAgentData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitor</h1>
          <p className="text-gray-600">Real-time monitoring of your AI agents</p>
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
            <option value={90}>Last 90 days</option>
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_evaluations || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Last {timeRange} days</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hallucination Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {((stats?.hallucination_rate || 0) * 100).toFixed(1)}%
              </p>
              <div className="flex items-center mt-1">
                {(stats?.hallucination_rate || 0) > 0.1 ? (
                  <TrendingUp className="w-3 h-3 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                )}
                <span className={`text-xs ${(stats?.hallucination_rate || 0) > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
                  {(stats?.hallucination_rate || 0) > 0.1 ? 'High' : 'Normal'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900">{(stats?.avg_latency || 0).toFixed(2)}s</p>
              <div className="flex items-center mt-1">
                {(stats?.avg_latency || 0) > 2 ? (
                  <TrendingUp className="w-3 h-3 text-yellow-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-green-500 mr-1" />
                )}
                <span className={`text-xs ${(stats?.avg_latency || 0) > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {(stats?.avg_latency || 0) > 2 ? 'Slow' : 'Good'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Throughput</p>
              <p className="text-2xl font-bold text-gray-900">{(stats?.avg_throughput || 0).toFixed(1)} QPS</p>
              <div className="flex items-center mt-1">
                {(stats?.avg_throughput || 0) > 1 ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-yellow-500 mr-1" />
                )}
                <span className={`text-xs ${(stats?.avg_throughput || 0) > 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {(stats?.avg_throughput || 0) > 1 ? 'High' : 'Low'}
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency & Throughput Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Latency & Throughput Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#3b82f6" name="Latency (s)" />
              <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#10b981" name="Throughput (QPS)" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Hallucination Probability Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hallucination Probability</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="hallucination_probability" stroke="#ef4444" fill="#fca5a5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Truth Metrics Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Truth Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="semantic_drift" stroke="#8b5cf6" name="Semantic Drift" />
              <Line type="monotone" dataKey="factual_support" stroke="#06b6d4" name="Factual Support" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>

        {/* Hallucination Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Agent Performance</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-secondary"
          >
            {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {agentData.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No agent data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evaluations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hallucinations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hallucination Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Latency
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agentData.map((agent, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {agent.agent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.evaluations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.hallucinations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        parseFloat(agent.hallucination_rate) > 20
                          ? 'bg-red-100 text-red-800'
                          : parseFloat(agent.hallucination_rate) > 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {agent.hallucination_rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.avg_latency}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Evaluations */}
      {showDetails && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Evaluations</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {evaluations.slice(0, 10).map((evaluation) => (
              <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        evaluation.hallucinated
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {evaluation.hallucinated ? 'Hallucinated' : 'Normal'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {evaluation.agent_name || 'Unknown Agent'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(evaluation.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">
                      <strong>Prompt:</strong> {evaluation.prompt.substring(0, 100)}...
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Response:</strong> {evaluation.response.substring(0, 100)}...
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Latency: {evaluation.latency_sec}s</span>
                      <span>Throughput: {evaluation.throughput_qps || 0} QPS</span>
                      <span>Score: {(evaluation.hallucination_probability * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitor;
