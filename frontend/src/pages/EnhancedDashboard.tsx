import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Clock,
  CheckCircle,
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EnhancedDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await apiService.getEvaluationStats(7);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const confidenceScore = stats ? ((1 - stats.hallucination_rate) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-agentops-600 via-agentops-700 to-agentops-800 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-64 h-64 bg-agentops-400/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome to AgentOps</h1>
              <p className="text-agentops-100">Monitor your AI agents in real-time</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-agentops-100 text-sm mb-1">Confidence Score</p>
              <p className="text-4xl font-bold text-white">{confidenceScore}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-agentops-100 text-sm mb-1">Total Evaluations</p>
              <p className="text-4xl font-bold text-white">{stats?.total_evaluations || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-agentops-100 text-sm mb-1">System Health</p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <p className="text-2xl font-bold text-white">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Hallucination Rate */}
        <div className="group card hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/20 rounded-xl group-hover:bg-red-500/30 transition-colors">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">Track</span>
            </div>
          </div>
          <p className="text-sm font-medium text-dark-muted mb-2">Hallucination Rate</p>
          <p className="text-3xl font-bold text-dark-text mb-1">
            {((stats?.hallucination_rate || 0) * 100).toFixed(1)}%
          </p>
          <div className="h-1 bg-dark-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-1000"
              style={{ width: `${(stats?.hallucination_rate || 0) * 100}%` }}
            />
          </div>
        </div>

        {/* Average Latency */}
        <div className="group card hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl group-hover:bg-yellow-500/30 transition-colors">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400">Monitor</span>
            </div>
          </div>
          <p className="text-sm font-medium text-dark-muted mb-2">Average Latency</p>
          <p className="text-3xl font-bold text-dark-text mb-1">
            {(stats?.avg_latency || 0).toFixed(2)}s
          </p>
          <div className="h-1 bg-dark-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-1000"
              style={{ width: `${Math.min((stats?.avg_latency || 0) * 20, 100)}%` }}
            />
          </div>
        </div>

        {/* Throughput */}
        <div className="group card hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
          <p className="text-sm font-medium text-dark-muted mb-2">Throughput</p>
          <p className="text-3xl font-bold text-dark-text mb-1">
            {(stats?.avg_throughput || 0).toFixed(1)} <span className="text-lg text-dark-muted">QPS</span>
          </p>
          <div className="h-1 bg-dark-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
              style={{ width: `${Math.min((stats?.avg_throughput || 0) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Success Rate */}
        <div className="group card hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400">Excellent</span>
            </div>
          </div>
          <p className="text-sm font-medium text-dark-muted mb-2">Success Rate</p>
          <p className="text-3xl font-bold text-dark-text mb-1">
            {confidenceScore}%
          </p>
          <div className="h-1 bg-dark-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/monitor" className="group card hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-dark-text mb-1">View Analytics</h3>
              <p className="text-sm text-dark-muted">Detailed charts and insights</p>
            </div>
            <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link to="/api-keys" className="group card hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/30 transition-colors">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-dark-text mb-1">Manage API Keys</h3>
              <p className="text-sm text-dark-muted">Create and configure keys</p>
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link to="/documentation" className="group card hover:shadow-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors">
              <Activity className="w-8 h-8 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-dark-text mb-1">Documentation</h3>
              <p className="text-sm text-dark-muted">Get started guide</p>
            </div>
            <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-text">Recent Activity</h2>
          <Link to="/monitor" className="text-sm text-agentops-400 hover:text-agentops-300 flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {[
            { icon: CheckCircle, color: 'green', text: 'Evaluation completed successfully', time: '2 min ago' },
            { icon: CheckCircle, color: 'green', text: 'No hallucinations detected', time: '5 min ago' },
            { icon: Activity, color: 'blue', text: 'System health check passed', time: '10 min ago' },
            { icon: CheckCircle, color: 'green', text: 'Performance metrics updated', time: '15 min ago' },
          ].map((item, index) => (
            <div 
              key={index} 
              className="flex items-center space-x-4 p-4 bg-dark-bg/50 rounded-lg hover:bg-dark-bg transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`p-2 bg-${item.color}-500/20 rounded-lg`}>
                <item.icon className={`w-5 h-5 text-${item.color}-400`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-dark-text">{item.text}</p>
                <p className="text-xs text-dark-muted">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="card bg-gradient-to-br from-agentops-500/10 to-agentops-600/5 border-agentops-500/20">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-agentops-500/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-agentops-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-dark-text mb-2">Ready to integrate?</h3>
            <p className="text-dark-muted mb-4">
              Add AgentOps monitoring to your AI agents with just 3 lines of code. Start tracking hallucinations and performance metrics today.
            </p>
            <Link to="/documentation" className="inline-flex items-center space-x-2 px-4 py-2 bg-agentops-600 hover:bg-agentops-700 text-white rounded-lg transition-colors">
              <span>View Integration Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
