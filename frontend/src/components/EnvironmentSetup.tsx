import React from 'react';
import { AlertCircle, ExternalLink, Copy, CheckCircle } from 'lucide-react';

const EnvironmentSetup: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const envConfig = `# Supabase Configuration (if using Supabase for auth)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# AgentOps GCP Backend Configuration
REACT_APP_API_URL=https://agentops-api-1081133763032.us-central1.run.app`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(envConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-900 mb-2">Environment Setup Required</h3>
          <p className="text-sm text-yellow-800 mb-4">
            Create a <code className="bg-yellow-100 px-1 py-0.5 rounded text-xs">.env.local</code> file in your frontend directory with the following configuration:
          </p>
          
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {envConfig}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Copy configuration"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-300" />
              )}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The GCP backend is already deployed and ready to use at:
            </p>
            <a
              href="https://agentops-api-1081133763032.us-central1.run.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-yellow-700 hover:text-yellow-600 underline"
            >
              https://agentops-api-1081133763032.us-central1.run.app
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-1">Quick Start Steps:</h4>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Create <code className="bg-yellow-200 px-1 py-0.5 rounded text-xs">.env.local</code> in frontend directory</li>
              <li>Copy the configuration above</li>
              <li>Run <code className="bg-yellow-200 px-1 py-0.5 rounded text-xs">npm install</code></li>
              <li>Run <code className="bg-yellow-200 px-1 py-0.5 rounded text-xs">npm start</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentSetup;
