import React, { useState } from 'react';
import { 
  Code, 
  Terminal, 
  Zap, 
  Shield, 
  Activity,
  CheckCircle,
  Copy,
  Check,
  ChevronRight,
  Book,
  Rocket,
  AlertCircle,
  Settings,
  BarChart3
} from 'lucide-react';

const EnhancedDocumentation: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('quickstart');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'quickstart', label: 'Quick Start', icon: Rocket },
    { id: 'installation', label: 'Installation', icon: Terminal },
    { id: 'configuration', label: 'Configuration', icon: Settings },
    { id: 'usage', label: 'Usage Examples', icon: Code },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'api', label: 'API Reference', icon: Book },
  ];

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => copyToClipboard(code, id)}
          className="p-2 bg-dark-bg/80 hover:bg-dark-bg rounded-lg border border-dark-border transition-colors"
        >
          {copiedCode === id ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-dark-muted" />
          )}
        </button>
      </div>
      <div className="bg-dark-bg border border-dark-border rounded-lg p-4 overflow-x-auto">
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-500/30" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
            <div className="w-3 h-3 rounded-full bg-green-500/30" />
          </div>
          <span className="text-xs text-dark-muted ml-2">{language}</span>
        </div>
        <pre className="text-sm text-dark-text font-mono">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );

  return (
    <div className="flex gap-8">
      {/* Sidebar Navigation */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-2">
          <h3 className="text-sm font-semibold text-dark-muted mb-4 px-3">DOCUMENTATION</h3>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-agentops-500/20 text-agentops-400 border-l-2 border-agentops-500'
                    : 'text-dark-muted hover:bg-dark-surface hover:text-dark-text'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 bg-agentops-500/10 border border-agentops-500/20 rounded-full px-4 py-2">
            <Book className="w-4 h-4 text-agentops-400" />
            <span className="text-sm text-agentops-300">Documentation</span>
          </div>
          <h1 className="text-4xl font-bold text-dark-text">AgentOps Integration Guide</h1>
          <p className="text-xl text-dark-muted">
            Add production-ready AI monitoring to your agents in minutes
          </p>
        </div>

        {/* Quick Start */}
        <section id="quickstart" className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg">
              <Rocket className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-dark-text">Quick Start</h2>
          </div>
          
          <div className="card bg-gradient-to-br from-agentops-500/10 to-agentops-600/5 border-agentops-500/20">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-agentops-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-agentops-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-text mb-2">Get Started in 3 Steps</h3>
                <p className="text-dark-muted">
                  Follow these simple steps to integrate AgentOps into your AI application
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card group hover:border-agentops-500/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-agentops-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-agentops-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-text mb-2">Install SDK</h3>
              <p className="text-sm text-dark-muted">Install the AgentOps client library via pip</p>
            </div>

            <div className="card group hover:border-agentops-500/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-agentops-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-agentops-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-text mb-2">Initialize Client</h3>
              <p className="text-sm text-dark-muted">Set up AgentOps with your API key</p>
            </div>

            <div className="card group hover:border-agentops-500/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-agentops-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold text-agentops-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-dark-text mb-2">Monitor Calls</h3>
              <p className="text-sm text-dark-muted">Wrap your agent responses with evaluate()</p>
            </div>
          </div>
        </section>

        {/* Installation */}
        <section id="installation" className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg">
              <Terminal className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-dark-text">Installation</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-3">Install via pip</h3>
              <CodeBlock
                id="install"
                language="bash"
                code="pip install agentops-client"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-3">Verify Installation</h3>
              <CodeBlock
                id="verify"
                language="bash"
                code={`python -c "import agentops; print(agentops.__version__)"`}
              />
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section id="configuration" className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-dark-text">Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-3">Environment Setup</h3>
              <p className="text-dark-muted mb-3">
                Create a <code className="px-2 py-1 bg-dark-bg rounded text-sm">.env</code> file in your project root:
              </p>
              <CodeBlock
                id="env"
                language=".env"
                code={`# OpenAI API Key (required for hallucination detection)
OPENAI_API_KEY=sk-your-openai-api-key-here

# AgentOps Configuration
AGENTOPS_API_KEY=your-agentops-api-key
AGENTOPS_API_URL=https://your-backend-url.com`}
              />
            </div>

            <div className="card bg-blue-500/10 border-blue-500/20">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-dark-text mb-1">Getting Your API Key</h4>
                  <p className="text-sm text-dark-muted">
                    Navigate to the API Keys page in your dashboard to generate a new key. 
                    Keep your keys secure and never commit them to version control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section id="usage" className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg">
              <Code className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-dark-text">Usage Examples</h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-3">Basic Usage</h3>
              <CodeBlock
                id="basic"
                language="python"
                code={`import os
from openai import OpenAI
from agentops import AgentOps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize AgentOps
ops = AgentOps(
    api_key=os.getenv("AGENTOPS_API_KEY"),
    api_url=os.getenv("AGENTOPS_API_URL")
)

# Initialize OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def ask_agent(question: str) -> str:
    """Ask your AI agent a question with monitoring"""
    
    # Get response from your agent
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": question}
        ]
    )
    
    answer = response.choices[0].message.content
    
    # Monitor the response for hallucinations
    result = ops.evaluate(prompt=question, response=answer)
    
    # Check results
    if result['hallucinated']:
        print(f"⚠️  Warning: Potential hallucination detected!")
        print(f"Probability: {result['hallucination_probability']:.2%}")
    
    return answer

# Use it
answer = ask_agent("What is the capital of France?")
print(answer)`}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-3">RAG Mode with Retrieved Documents</h3>
              <CodeBlock
                id="rag"
                language="python"
                code={`from agentops import AgentOps

ops = AgentOps(api_key="your-key", api_url="your-url")

# Your retrieved documents from vector store
retrieved_docs = [
    "AgentOps provides hallucination detection for AI agents.",
    "The platform tracks latency and throughput metrics.",
    "Real-time monitoring helps catch issues before users do."
]

# Your RAG agent response
question = "What does AgentOps do?"
response = "AgentOps monitors AI agents for hallucinations and performance."

# Evaluate with RAG mode
result = ops.evaluate(
    prompt=question,
    response=response,
    retrieved_docs=retrieved_docs  # Pass your retrieved context
)

print(f"Hallucinated: {result['hallucinated']}")
print(f"Factual Support: {result['factual_support']:.2%}")`}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-dark-text mb-3">Async/Batch Processing</h3>
              <CodeBlock
                id="batch"
                language="python"
                code={`import asyncio
from agentops import AgentOps

ops = AgentOps(api_key="your-key", api_url="your-url")

async def process_batch(questions):
    """Process multiple questions with monitoring"""
    tasks = []
    
    for question in questions:
        # Your agent logic here
        response = await get_agent_response(question)
        
        # Monitor each response
        result = ops.evaluate(prompt=question, response=response)
        tasks.append(result)
    
    return tasks

# Run batch
questions = [
    "What is AI?",
    "How does machine learning work?",
    "What are neural networks?"
]

results = asyncio.run(process_batch(questions))
print(f"Processed {len(results)} evaluations")`}
              />
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section id="metrics" className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-dark-text">Metrics Explained</h2>
          </div>

          <div className="space-y-4">
            <div className="card border-red-500/20 bg-red-500/5">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-text mb-2">Hallucination Probability</h3>
                  <p className="text-dark-muted mb-3">
                    Overall likelihood that the response contains false or fabricated information based on all metrics.
                  </p>
                  <div className="bg-dark-bg rounded-lg p-3">
                    <code className="text-sm text-dark-text">
                      result['hallucination_probability'] → float (0.0 to 1.0)
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-purple-500/20 bg-purple-500/5">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-text mb-2">Semantic Drift</h3>
                  <p className="text-dark-muted mb-3">
                    Measures how much the response deviates from the original prompt's intent and meaning.
                  </p>
                  <div className="bg-dark-bg rounded-lg p-3">
                    <code className="text-sm text-dark-text">
                      result['semantic_drift'] → float (0.0 to 1.0)
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-text mb-2">Uncertainty</h3>
                  <p className="text-dark-muted mb-3">
                    Detects uncertain language patterns like "maybe", "probably", "might", indicating low confidence.
                  </p>
                  <div className="bg-dark-bg rounded-lg p-3">
                    <code className="text-sm text-dark-text">
                      result['uncertainty'] → float (0.0 to 1.0)
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-green-500/20 bg-green-500/5">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-text mb-2">Factual Support</h3>
                  <p className="text-dark-muted mb-3">
                    How well the response is grounded in factual information and retrieved context (RAG mode).
                  </p>
                  <div className="bg-dark-bg rounded-lg p-3">
                    <code className="text-sm text-dark-text">
                      result['factual_support'] → float (0.0 to 1.0)
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section id="api" className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-pink-500/20 to-pink-600/10 rounded-lg">
              <Book className="w-6 h-6 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-dark-text">API Reference</h2>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-dark-text mb-4">AgentOps Class</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-dark-text mb-2">Constructor</h4>
                  <CodeBlock
                    id="constructor"
                    language="python"
                    code={`AgentOps(api_key: str, api_url: str)`}
                  />
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start space-x-3">
                      <ChevronRight className="w-4 h-4 text-agentops-400 mt-1" />
                      <div>
                        <code className="text-sm text-agentops-400">api_key</code>
                        <span className="text-sm text-dark-muted ml-2">Your AgentOps API key from the dashboard</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <ChevronRight className="w-4 h-4 text-agentops-400 mt-1" />
                      <div>
                        <code className="text-sm text-agentops-400">api_url</code>
                        <span className="text-sm text-dark-muted ml-2">Your AgentOps backend URL</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-dark-text mb-2">evaluate()</h4>
                  <CodeBlock
                    id="evaluate"
                    language="python"
                    code={`ops.evaluate(
    prompt: str,
    response: str,
    retrieved_docs: Optional[List[str]] = None
) -> Dict[str, Any]`}
                  />
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start space-x-3">
                      <ChevronRight className="w-4 h-4 text-agentops-400 mt-1" />
                      <div>
                        <code className="text-sm text-agentops-400">prompt</code>
                        <span className="text-sm text-dark-muted ml-2">The user's input/question</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <ChevronRight className="w-4 h-4 text-agentops-400 mt-1" />
                      <div>
                        <code className="text-sm text-agentops-400">response</code>
                        <span className="text-sm text-dark-muted ml-2">Your agent's response text</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <ChevronRight className="w-4 h-4 text-agentops-400 mt-1" />
                      <div>
                        <code className="text-sm text-agentops-400">retrieved_docs</code>
                        <span className="text-sm text-dark-muted ml-2">Optional list of context documents (for RAG)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-dark-text mb-2">Return Value</h4>
                  <CodeBlock
                    id="return"
                    language="python"
                    code={`{
    'hallucinated': bool,
    'hallucination_probability': float,
    'semantic_drift': float,
    'uncertainty': float,
    'factual_support': float,
    'latency_sec': float,
    'throughput_qps': float
}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-dark-text">Best Practices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card border-green-500/20 bg-green-500/5">
              <CheckCircle className="w-6 h-6 text-green-400 mb-3" />
              <h3 className="font-semibold text-dark-text mb-2">Do</h3>
              <ul className="space-y-2 text-sm text-dark-muted">
                <li className="flex items-start space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Monitor all production agent responses</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Use environment variables for API keys</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Provide retrieved docs for RAG systems</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Set up alerts for high hallucination rates</span>
                </li>
              </ul>
            </div>

            <div className="card border-red-500/20 bg-red-500/5">
              <AlertCircle className="w-6 h-6 text-red-400 mb-3" />
              <h3 className="font-semibold text-dark-text mb-2">Don't</h3>
              <ul className="space-y-2 text-sm text-dark-muted">
                <li className="flex items-start space-x-2">
                  <span className="text-red-400">✗</span>
                  <span>Hardcode API keys in your code</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400">✗</span>
                  <span>Skip monitoring in production</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400">✗</span>
                  <span>Ignore high semantic drift warnings</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400">✗</span>
                  <span>Commit .env files to version control</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <div className="card bg-gradient-to-br from-agentops-500/10 to-agentops-600/5 border-agentops-500/20">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-agentops-500/20 rounded-2xl">
              <Shield className="w-8 h-8 text-agentops-400" />
            </div>
            <h3 className="text-2xl font-bold text-dark-text">Need Help?</h3>
            <p className="text-dark-muted max-w-md mx-auto">
              Check out our GitHub repository for examples, or reach out to our support team
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a 
                href="https://github.com/ezazahamad2003/agentops" 
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                View on GitHub
              </a>
              <a 
                href="mailto:support@agentops.dev"
                className="btn-secondary"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDocumentation;
