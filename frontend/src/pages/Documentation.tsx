import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  Terminal, 
  CheckCircle, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const Documentation: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState('quickstart');
  const [copiedCode, setCopiedCode] = useState('');

  const baseUrl = process.env.REACT_APP_API_URL || 'https://agentops-api-1081133763032.us-central1.run.app';

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language = 'python' }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => handleCopyCode(code)}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        title="Copy code"
      >
        {copiedCode === code ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-300" />
        )}
      </button>
    </div>
  );

  const sections: DocSection[] = [
    {
      id: 'quickstart',
      title: 'Quick Start',
      description: 'Get up and running in minutes',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Installation</h3>
            <CodeBlock code="pip install agentops-client" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Usage</h3>
            <CodeBlock code={`from agentops import AgentOps

# Initialize the SDK
ops = AgentOps(
    api_key="your_api_key_here",
    api_url="${baseUrl}"
)

# Evaluate a response
result = ops.evaluate(
    prompt="Who discovered penicillin?",
    response="Penicillin was discovered by Alexander Fleming in 1928."
)

print(f"Hallucinated: {result['hallucinated']}")
print(f"Latency: {result['latency_sec']}s")`} />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Pro Tip</h4>
            <p className="text-sm text-blue-800">
              Get your API key from the{' '}
              <a href="/api-keys" className="text-blue-600 hover:text-blue-500 underline">
                API Keys page
              </a>
              .
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'concepts',
      title: 'Core Concepts',
      description: 'Understanding AgentOps metrics',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Truth Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Semantic Drift</h4>
                <p className="text-sm text-gray-600">
                  Measures semantic distance between prompt and response using embeddings.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Uncertainty</h4>
                <p className="text-sm text-gray-600">
                  Detects uncertainty language like "maybe", "probably", "might".
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Factual Support</h4>
                <p className="text-sm text-gray-600">
                  RAG mode: Evidence entailment. No-RAG mode: LLM self-check.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Reliability Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Latency</h4>
                <p className="text-sm text-gray-600">
                  End-to-end evaluation time in seconds.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Throughput</h4>
                <p className="text-sm text-gray-600">
                  Queries per second (QPS) for system capacity monitoring.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Detection Modes</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">RAG Mode</h4>
                <p className="text-sm text-gray-600">
                  Provide retrieved_docs for evidence-based factuality checking.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">No-RAG Mode</h4>
                <p className="text-sm text-gray-600">
                  Automatic factual self-check when no documents are available.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'api',
      title: 'API Reference',
      description: 'Complete API documentation',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">AgentOps Class</h3>
            <CodeBlock code={`class AgentOps:
    def __init__(self, api_key=None, api_url=None, track_throughput=True):
        """Initialize AgentOps client"""
        
    def evaluate(self, prompt, response, retrieved_docs=None, 
                model_name=None, agent_name=None, session_id=None):
        """Evaluate response for hallucinations and reliability"""
        
    def start_session(self):
        """Start monitoring session"""
        
    def end_session(self):
        """End session and return statistics"""`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Direct Function</h3>
            <CodeBlock code={`def detect_hallucination(
    prompt: str,
    response: str,
    retrieved_docs: Optional[list[str]] = None,
    track_throughput: bool = True
) -> dict:
    """Detect hallucinations with reliability metrics"""`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Format</h3>
            <CodeBlock code={`{
    # Truth metrics
    "semantic_drift": 0.22,
    "uncertainty": 0.0,
    "factual_support": 0.52,
    "mode": "retrieved-doc entailment",
    "hallucination_probability": 0.57,
    "hallucinated": True,
    
    # Reliability metrics
    "latency_sec": 2.34,
    "throughput_qps": 0.427
}`} />
          </div>
        </div>
      ),
    },
    {
      id: 'examples',
      title: 'Examples',
      description: 'Practical usage examples',
      icon: Terminal,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">RAG Mode</h3>
            <CodeBlock code={`from agentops import AgentOps

ops = AgentOps(api_key="your_key", api_url="${baseUrl}")

# RAG Mode evaluation
result = ops.evaluate(
    prompt="What are the side effects of aspirin?",
    response="Aspirin causes stomach upset, nausea, and heartburn.",
    retrieved_docs=[
        "Common side effects include stomach upset and nausea.",
        "Some people may experience allergic reactions."
    ]
)

print(f"Hallucinated: {result['hallucinated']}")
print(f"Factual support: {result['factual_support']}")`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Batch Monitoring</h3>
            <CodeBlock code={`from agentops import AgentOps

ops = AgentOps(api_key="your_key", api_url="${baseUrl}")

# Start monitoring session
ops.start_session()

# Run multiple evaluations
for prompt, response in test_cases:
    result = ops.evaluate(prompt, response)
    print(f"Latency: {result['latency_sec']}s")

# Get session statistics
stats = ops.end_session()
print(f"Total evaluations: {stats['total_evaluations']}")
print(f"Average throughput: {stats['throughput_qps']} req/sec")`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Context Manager</h3>
            <CodeBlock code={`from agentops import AgentOps

# Auto session management
with AgentOps(api_key="your_key", api_url="${baseUrl}") as ops:
    result = ops.evaluate(prompt, response)
    # Session automatically closed after block`} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">HTTP API</h3>
            <CodeBlock code={`curl -X POST ${baseUrl}/evaluations/ \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "What is the capital of France?",
    "response": "Paris is the capital of France.",
    "semantic_drift": 0.12,
    "uncertainty": 0.0,
    "factual_support": 0.95,
    "hallucination_probability": 0.08,
    "hallucinated": false,
    "latency_sec": 0.42,
    "throughput_qps": 2.38,
    "mode": "self-check"
  }'`} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Documentation</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Everything you need to integrate AgentOps into your LLM applications
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setExpandedSection(section.id)}
              className={`card text-left hover:shadow-md transition-shadow ${
                expandedSection === section.id ? 'ring-2 ring-agentops-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-agentops-100 rounded-lg">
                  <Icon className="w-5 h-5 text-agentops-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="card">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;
          
          return (
            <div key={section.id} className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => setExpandedSection(isExpanded ? '' : section.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-agentops-100 rounded-lg">
                    <Icon className="w-5 h-5 text-agentops-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-6">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* External Resources */}
      <div className="card bg-gradient-to-r from-agentops-50 to-blue-50 border-agentops-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Additional Resources</h2>
            <p className="text-gray-600 mb-4">
              Explore more resources and examples
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/ezazahamad2003/agentops"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                GitHub Repository
              </a>
              <a
                href="https://pypi.org/project/agentops-client/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                PyPI Package
              </a>
            </div>
          </div>
          <div className="hidden lg:block">
            <BookOpen className="w-16 h-16 text-agentops-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
