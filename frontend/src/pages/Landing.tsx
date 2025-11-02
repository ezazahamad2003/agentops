import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Activity, 
  BarChart3, 
  ArrowRight,
  Github,
  Code,
  TrendingUp,
  AlertTriangle,
  Clock,
  Eye
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-agentops-900/20 via-dark-bg to-dark-bg" />
        
        {/* Navigation */}
        <nav className="relative z-10 border-b border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-agentops-500" />
                <div>
                  <h1 className="text-xl font-bold text-dark-text">AgentOps</h1>
                  <p className="text-xs text-dark-muted">PagerDuty for AI Agents</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="https://github.com/ezazahamad2003/agentops" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-dark-muted hover:text-dark-text transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <Link 
                  to="/login" 
                  className="px-5 py-2.5 bg-dark-surface border border-dark-border hover:border-agentops-500/50 text-dark-text rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-agentops-500/20 font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="group relative px-6 py-2.5 bg-gradient-to-r from-agentops-600 via-agentops-500 to-agentops-600 hover:from-agentops-700 hover:via-agentops-600 hover:to-agentops-700 text-white font-semibold rounded-lg shadow-lg shadow-agentops-500/50 hover:shadow-xl hover:shadow-agentops-500/70 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-agentops-500/10 border border-agentops-500/20 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-agentops-400" />
              <span className="text-sm text-agentops-300">Production-Ready AI Monitoring</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-agentops-200 to-agentops-400 bg-clip-text text-transparent">
              Monitor Your AI Agents
              <br />
              Like a Pro
            </h1>
            
            <p className="text-xl text-dark-muted max-w-3xl mx-auto mb-12">
              Detect hallucinations, track performance, and ensure reliability for your LLM applications. 
              Add monitoring to your agents with just <span className="text-agentops-400 font-semibold">3 lines of code</span>.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Link 
                to="/register" 
                className="group relative inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-agentops-600 via-agentops-500 to-agentops-600 hover:from-agentops-700 hover:via-agentops-600 hover:to-agentops-700 text-white text-lg font-bold rounded-xl shadow-2xl shadow-agentops-500/50 hover:shadow-agentops-500/70 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Start Free</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link 
                to="/documentation" 
                className="group inline-flex items-center space-x-2 px-8 py-4 bg-dark-surface border-2 border-dark-border hover:border-agentops-500/50 text-dark-text text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-agentops-500/30 hover:scale-105"
              >
                <Code className="w-5 h-5 group-hover:text-agentops-400 transition-colors" />
                <span>View Docs</span>
              </Link>
            </div>

            {/* Code Preview */}
            <div className="mt-16 max-w-2xl mx-auto">
              <div className="bg-dark-surface border border-dark-border rounded-lg p-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-dark-muted">Quick Integration</span>
                  <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">3 lines</span>
                </div>
                <pre className="text-sm text-dark-text overflow-x-auto">
                  <code>{`from agentops import AgentOps

ops = AgentOps(api_key="your_key")
result = ops.evaluate(prompt, response)`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-dark-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-dark-muted">Comprehensive monitoring for production AI systems</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card hover:border-agentops-500/50 transition-colors">
              <div className="w-12 h-12 bg-agentops-500/10 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-agentops-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hallucination Detection</h3>
              <p className="text-dark-muted">
                Automatically detect when your AI agents generate false or inconsistent information with advanced semantic analysis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card hover:border-agentops-500/50 transition-colors">
              <div className="w-12 h-12 bg-agentops-500/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-agentops-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Metrics</h3>
              <p className="text-dark-muted">
                Track latency, throughput, and response times in real-time. Identify bottlenecks before they impact users.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card hover:border-agentops-500/50 transition-colors">
              <div className="w-12 h-12 bg-agentops-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-agentops-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Dashboard</h3>
              <p className="text-dark-muted">
                Beautiful, intuitive dashboards with charts and visualizations. Monitor all your agents from one place.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card hover:border-agentops-500/50 transition-colors">
              <div className="w-12 h-12 bg-agentops-500/10 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-agentops-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Full Observability</h3>
              <p className="text-dark-muted">
                Complete visibility into your AI pipeline. Track every request, response, and evaluation metric.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card hover:border-agentops-500/50 transition-colors">
              <div className="w-12 h-12 bg-agentops-500/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-agentops-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-dark-muted">
                Minimal overhead with async processing. Your agents stay fast while we handle the monitoring.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card hover:border-agentops-500/50 transition-colors">
              <div className="w-12 h-12 bg-agentops-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-agentops-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
              <p className="text-dark-muted">
                Battle-tested and scalable. Monitor millions of requests with confidence and reliability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="text-xl text-dark-muted">Three simple steps to full AI observability</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-agentops-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-agentops-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Install SDK</h3>
              <p className="text-dark-muted mb-4">
                Install the AgentOps SDK with a single pip command
              </p>
              <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
                <code className="text-sm text-agentops-300">pip install agentops-client</code>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-agentops-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-agentops-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Add 3 Lines</h3>
              <p className="text-dark-muted mb-4">
                Initialize AgentOps and wrap your agent calls
              </p>
              <div className="bg-dark-surface border border-dark-border rounded-lg p-4 text-left">
                <code className="text-sm text-dark-text">
                  <div>ops = AgentOps()</div>
                  <div className="text-dark-muted"># Your agent code</div>
                  <div>ops.evaluate(...)</div>
                </code>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-agentops-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-agentops-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Monitor & Scale</h3>
              <p className="text-dark-muted mb-4">
                View metrics in real-time on your dashboard
              </p>
              <div className="bg-gradient-to-br from-agentops-500/20 to-agentops-600/10 border border-agentops-500/30 rounded-lg p-4">
                <Activity className="w-8 h-8 text-agentops-400 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-agentops-900/20 to-agentops-800/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Monitor Your AI Agents?</h2>
          <p className="text-xl text-dark-muted mb-8">
            Join developers building reliable AI systems with AgentOps
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link 
              to="/register" 
              className="group relative inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-agentops-600 via-agentops-500 to-agentops-600 hover:from-agentops-700 hover:via-agentops-600 hover:to-agentops-700 text-white text-lg font-bold rounded-xl shadow-2xl shadow-agentops-500/50 hover:shadow-agentops-500/70 transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Start Free Trial</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <a 
              href="https://github.com/ezazahamad2003/agentops" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-dark-surface border-2 border-dark-border hover:border-agentops-500/50 text-dark-text text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-agentops-500/30 hover:scale-105"
            >
              <Github className="w-5 h-5 group-hover:text-agentops-400 transition-colors" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-agentops-500" />
              <span className="font-semibold">AgentOps</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-dark-muted">
              <Link to="/documentation" className="hover:text-dark-text transition-colors">
                Documentation
              </Link>
              <a 
                href="https://github.com/ezazahamad2003/agentops" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-dark-text transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://pypi.org/project/agentops-client/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-dark-text transition-colors"
              >
                PyPI
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-dark-muted">
            © 2025 AgentOps. Built for the LLM community.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
