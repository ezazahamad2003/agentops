import React, { useState, useEffect } from 'react';
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Terminal,
  CheckCircle,
  Code,
  Sparkles,
  Shield
} from 'lucide-react';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  created_at: string;
  last_used?: string;
}

const EnhancedApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'typescript' | 'curl'>('python');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://agentops-api-1081133763032.us-central1.run.app';

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await apiService.getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;

    try {
      setCreating(true);
      const newKey = await apiService.createApiKeys(newKeyName);
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setNewlyCreatedKey(newKey.key);
      setTimeout(() => setNewlyCreatedKey(null), 10000);
    } catch (error) {
      console.error('Failed to create API key:', error);
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteApiKey(keyId);
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const toggleRevealKey = (keyId: string) => {
    const newRevealed = new Set(revealedKeys);
    if (newRevealed.has(keyId)) {
      newRevealed.delete(keyId);
    } else {
      newRevealed.add(keyId);
    }
    setRevealedKeys(newRevealed);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 8) + '••••••••••••••••••••••••••••••••••••' + key.substring(key.length - 4);
  };

  const codeExamples = {
    python: `from agentops import AgentOps

# Initialize with your API key
ops = AgentOps(
    api_key="${apiKeys[0]?.key || 'your_api_key_here'}",
    api_url="${API_BASE_URL}"
)

# Monitor your agent responses
result = ops.evaluate(
    prompt="What is the capital of France?",
    response="Paris is the capital of France."
)

print(f"Hallucinated: {result['hallucinated']}")
print(f"Confidence: {(1 - result['hallucination_probability']) * 100:.1f}%")`,
    
    typescript: `import { AgentOps } from '@agentops/client';

// Initialize with your API key
const ops = new AgentOps({
  apiKey: '${apiKeys[0]?.key || 'your_api_key_here'}',
  apiUrl: '${API_BASE_URL}'
});

// Monitor your agent responses
const result = await ops.evaluate({
  prompt: 'What is the capital of France?',
  response: 'Paris is the capital of France.'
});

console.log(\`Hallucinated: \${result.hallucinated}\`);
console.log(\`Confidence: \${(1 - result.hallucinationProbability) * 100}%\`);`,
    
    curl: `curl -X POST ${API_BASE_URL}/metrics \\
  -H "X-API-Key: ${apiKeys[0]?.key || 'your_api_key_here'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "What is the capital of France?",
    "response": "Paris is the capital of France.",
    "hallucination_probability": 0.05,
    "semantic_drift": 0.12,
    "uncertainty": 0.03,
    "factual_support": 0.95,
    "latency_sec": 1.2,
    "throughput_qps": 0.83
  }'`
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-dark-text">API Keys</h1>
            <p className="text-dark-muted mt-2">
              Manage your AgentOps API keys for agent integration
            </p>
          </div>
          <button
            onClick={() => document.getElementById('create-key-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-6 py-3 bg-gradient-to-r from-agentops-600 via-agentops-500 to-agentops-600 hover:from-agentops-700 hover:via-agentops-600 hover:to-agentops-700 text-white font-semibold rounded-xl shadow-lg shadow-agentops-500/50 hover:shadow-xl hover:shadow-agentops-500/70 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            <span className="relative z-10">Create API Key</span>
            <Sparkles className="w-4 h-4 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      {/* Alert for new key */}
      {newlyCreatedKey && (
        <div className="card bg-green-500/10 border-green-500/30 animate-fade-in">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-400 mb-1">API Key Created Successfully</h3>
              <p className="text-sm text-dark-muted mb-3">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
              <div className="flex items-center space-x-2 bg-dark-bg/50 rounded-lg p-3 font-mono text-sm">
                <code className="flex-1 text-green-400">{newlyCreatedKey}</code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey, 'new-key')}
                  className="p-2 hover:bg-dark-surface rounded transition-colors"
                >
                  {copiedKey === 'new-key' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-dark-muted" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Base URL */}
      <div className="card">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Terminal className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-dark-text mb-2">API Base URL</h3>
            <p className="text-sm text-dark-muted mb-3">
              Use this base URL for all API requests
            </p>
            <div className="flex items-center space-x-2 bg-dark-bg border border-dark-border rounded-lg p-3">
              <code className="flex-1 text-sm text-blue-400 font-mono">{API_BASE_URL}</code>
              <button
                onClick={() => copyToClipboard(API_BASE_URL, 'base-url')}
                className="p-2 hover:bg-dark-surface rounded transition-colors"
              >
                {copiedKey === 'base-url' ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-dark-muted" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Your API Keys */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-dark-text">Your API Keys</h2>
        
        {apiKeys.length === 0 ? (
          <div className="card text-center py-12">
            <div className="inline-flex p-4 bg-dark-bg rounded-2xl mb-4">
              <Key className="w-8 h-8 text-dark-muted" />
            </div>
            <h3 className="text-lg font-semibold text-dark-text mb-2">No API keys yet</h3>
            <p className="text-dark-muted mb-6">Create your first API key to start monitoring your agents</p>
            <button
              onClick={() => document.getElementById('create-key-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-agentops-600 via-agentops-500 to-agentops-600 hover:from-agentops-700 hover:via-agentops-600 hover:to-agentops-700 text-white font-semibold rounded-xl shadow-lg shadow-agentops-500/50 hover:shadow-xl hover:shadow-agentops-500/70 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Create API Key</span>
              <Sparkles className="w-4 h-4 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="card hover:border-agentops-500/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 bg-agentops-500/20 rounded-xl">
                      <Key className="w-5 h-5 text-agentops-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-dark-text mb-1">{apiKey.name || 'API Key'}</h3>
                      <div className="flex items-center space-x-4 text-sm text-dark-muted">
                        <span>Created {new Date(apiKey.created_at).toLocaleDateString()}</span>
                        {apiKey.last_used && (
                          <span>Last used {new Date(apiKey.last_used).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-3 bg-dark-bg rounded-lg p-3">
                        <code className="flex-1 text-sm font-mono text-dark-text">
                          {revealedKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                        </code>
                        <button
                          onClick={() => toggleRevealKey(apiKey.id)}
                          className="p-2 hover:bg-dark-surface rounded transition-colors"
                          title={revealedKeys.has(apiKey.id) ? 'Hide key' : 'Reveal key'}
                        >
                          {revealedKeys.has(apiKey.id) ? (
                            <EyeOff className="w-4 h-4 text-dark-muted" />
                          ) : (
                            <Eye className="w-4 h-4 text-dark-muted" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          className="p-2 hover:bg-dark-surface rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedKey === apiKey.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-dark-muted" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteApiKey(apiKey.id)}
                    className="ml-4 p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    title="Delete API key"
                  >
                    <Trash2 className="w-5 h-5 text-dark-muted group-hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Key */}
      <div id="create-key-section" className="card bg-gradient-to-br from-agentops-500/10 to-agentops-600/5 border-agentops-500/20">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-agentops-500/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-agentops-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-dark-text mb-2">Create New API Key</h3>
            <p className="text-dark-muted mb-6">
              Generate a new API key to authenticate your agent integration
            </p>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createApiKey()}
                placeholder="Enter key name (e.g., Production, Development, Staging)"
                className="input flex-1 text-base"
                disabled={creating}
              />
              <button
                onClick={createApiKey}
                disabled={!newKeyName.trim() || creating}
                className="group relative px-6 py-3 bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-700 hover:via-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/70 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
              >
                {creating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="relative z-10">Creating...</span>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="relative z-10">Create Key</span>
                    <Key className="w-4 h-4 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-dark-text">Quick Start</h2>
        
        <div className="card">
          <div className="flex items-start space-x-4 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Code className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-1">Integration Examples</h3>
              <p className="text-sm text-dark-muted">
                Get started with AgentOps in your favorite language
              </p>
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex items-center space-x-2 mb-4 border-b border-dark-border pb-4">
            <button
              onClick={() => setSelectedLanguage('python')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLanguage === 'python'
                  ? 'bg-agentops-500/20 text-agentops-400'
                  : 'text-dark-muted hover:bg-dark-bg'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setSelectedLanguage('typescript')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLanguage === 'typescript'
                  ? 'bg-agentops-500/20 text-agentops-400'
                  : 'text-dark-muted hover:bg-dark-bg'
              }`}
            >
              TypeScript
            </button>
            <button
              onClick={() => setSelectedLanguage('curl')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLanguage === 'curl'
                  ? 'bg-agentops-500/20 text-agentops-400'
                  : 'text-dark-muted hover:bg-dark-bg'
              }`}
            >
              cURL
            </button>
          </div>

          {/* Code Block */}
          <div className="relative group">
            <button
              onClick={() => copyToClipboard(codeExamples[selectedLanguage], `code-${selectedLanguage}`)}
              className="absolute top-4 right-4 p-2 bg-dark-bg/80 hover:bg-dark-bg rounded-lg border border-dark-border transition-colors z-10"
            >
              {copiedKey === `code-${selectedLanguage}` ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-dark-muted" />
              )}
            </button>
            <div className="bg-dark-bg border border-dark-border rounded-lg p-6 overflow-x-auto">
              <pre className="text-sm text-dark-text font-mono">
                <code>{codeExamples[selectedLanguage]}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="card bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-dark-text mb-2">Security Best Practices</h3>
            <ul className="space-y-2 text-sm text-dark-muted">
              <li className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>Never commit API keys to version control or share them publicly</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>Use environment variables to store your API keys securely</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>Rotate your keys regularly and delete unused keys immediately</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>Use separate keys for development, staging, and production environments</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedApiKeys;
