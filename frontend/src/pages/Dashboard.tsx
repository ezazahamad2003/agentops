import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Key, 
  BookOpen, 
  Activity, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { EvaluationStats, ApiKey } from '../types';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EvaluationStats | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, apiKeysData] = await Promise.all([
        apiService.getEvaluationStats(7),
        apiService.getApiKeys()
      ]);
      
      setStats(statsData);
      setApiKeys(apiKeysData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Create API Key',
      description: 'Generate a new API key for your agent',
      icon: Key,
      href: '/api-keys',
      color: 'bg-blue-500',
    },
    {
      title: 'View Documentation',
      description: 'Learn how to integrate AgentOps',
      icon: BookOpen,
      href: '/documentation',
      color: 'bg-green-500',
    },
    {
      title: 'Monitor Agents',
      description: 'View performance metrics and alerts',
      icon: Activity,
      href: '/monitor',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-agentops-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.full_name || user?.email}!
            </h1>
            <p className="text-agentops-100">
              PagerDuty for AI Agents - Monitor your LLM systems with confidence
            </p>
          </div>
          <div className="hidden lg:block">
            <Shield className="w-16 h-16 text-white/20" />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_evaluations || 0}</p>
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
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <h2 className="text-xl font-semibold text-gray-900 lg:col-span-3">Quick Actions</h2>
        
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="card hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 ${action.color} rounded-full group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-agentops-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-agentops-600 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent API Keys */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent API Keys</h2>
          <Link
            to="/api-keys"
            className="text-sm text-agentops-600 hover:text-agentops-500 font-medium"
          >
            View all →
          </Link>
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No API keys yet</p>
            <Link
              to="/api-keys"
              className="btn-primary"
            >
              Create your first API key
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.slice(0, 3).map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-agentops-100 rounded-full flex items-center justify-center">
                    <Key className="w-4 h-4 text-agentops-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apiKey.name}</p>
                    <p className="text-sm text-gray-500">Created {new Date(apiKey.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    apiKey.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {apiKey.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Getting Started */}
      <div className="card bg-gradient-to-r from-agentops-50 to-blue-50 border-agentops-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Getting Started</h2>
            <p className="text-gray-600 mb-4">
              Follow our quick start guide to integrate AgentOps with your LLM application in minutes.
            </p>
            <Link
              to="/documentation"
              className="btn-primary"
            >
              View Documentation
            </Link>
          </div>
          <div className="hidden lg:block">
            <BookOpen className="w-16 h-16 text-agentops-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
