import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ApiKey } from '../types';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [baseUrl] = useState(process.env.REACT_APP_API_URL || 'https://agentops-api-1081133763032.us-central1.run.app');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const data = await apiService.getApiKeys();
      setApiKeys(data || []);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setCreating(true);
      setError('');
      
      const response = await apiService.createApiKeys(newKeyName);
      setNewApiKey(response.key);
      setNewKeyName('');
      
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteApiKey(keyId);
      await fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600">Manage your AgentOps API keys for agent integration</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create API Key
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* API Base URL Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">API Base URL</h3>
            <p className="text-sm text-blue-700 mt-1">{baseUrl}</p>
            <button
              onClick={() => handleCopyApiKey(baseUrl)}
              className="text-sm text-blue-600 hover:text-blue-500 mt-2"
            >
              Copy URL
            </button>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your API Keys</h2>
        
        {apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys yet</h3>
            <p className="text-gray-600 mb-6">Create your first API key to start monitoring your agents</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-agentops-100 rounded-full flex items-center justify-center">
                      <Key className="w-5 h-5 text-agentops-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                      <p className="text-sm text-gray-500">
                        Created {new Date(apiKey.created_at).toLocaleDateString()}
                        {apiKey.last_used_at && ` • Last used ${new Date(apiKey.last_used_at).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${
                      apiKey.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {apiKey.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>Inactive</span>
                        </>
                      )}
                    </span>
                    
                    <button
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete API key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Show masked API key (security best practice) */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-gray-700 font-mono flex-1">
                      {apiKey.key}
                    </code>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Full key is only shown once during creation
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How to use your API key</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Python SDK</h3>
            <pre className="text-sm bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
{`from agentops import AgentOps

# Initialize with your API key
ops = AgentOps(
    api_key="your_api_key_here",
    api_url="${baseUrl}"
)

# Evaluate a response
result = ops.evaluate(
    prompt="What is AI?",
    response="AI is artificial intelligence..."
)`}
            </pre>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">cURL</h3>
            <pre className="text-sm bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
{`curl -X POST ${baseUrl}/evaluations/ \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "What is AI?",
    "response": "AI is artificial intelligence...",
    "hallucinated": false,
    "latency_sec": 1.2
  }'`}
            </pre>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {newApiKey ? 'Your API Key' : 'Create New API Key'}
            </h2>

            {!newApiKey ? (
              <form onSubmit={handleCreateApiKey}>
                <div className="mb-4">
                  <label htmlFor="keyName" className="label">
                    API Key Name
                  </label>
                  <input
                    id="keyName"
                    type="text"
                    required
                    className="input"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Agent, Development Bot"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Give your API key a descriptive name to easily identify it later
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewKeyName('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {creating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <LoadingSpinner size="sm" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Key'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>Important:</strong> Copy this API key now. You won't be able to see it again.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-900 break-all">
                      {newApiKey}
                    </code>
                    <button
                      onClick={() => handleCopyApiKey(newApiKey)}
                      className="ml-2 p-2 text-agentops-600 hover:bg-agentops-50 rounded-lg transition-colors"
                      title="Copy API key"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewApiKey('');
                    setCopied(false);
                  }}
                  className="btn-primary w-full"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;
