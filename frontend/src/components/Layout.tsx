import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Key, 
  BookOpen, 
  Activity, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'API Keys', href: '/api-keys', icon: Key },
    { name: 'Documentation', href: '/documentation', icon: BookOpen },
    { name: 'Monitor', href: '/monitor', icon: Activity },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black transition-opacity ${sidebarOpen ? 'opacity-75' : 'opacity-0'}`} 
             onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex w-64 flex-1 flex-col bg-dark-surface transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-dark-border">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-agentops-600" />
              <div>
                <h1 className="text-xl font-bold text-dark-text">AgentOps</h1>
                <p className="text-xs text-dark-muted">PagerDuty for AI Agents</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-dark-bg text-dark-muted"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-agentops-500/20 text-agentops-400 border-l-2 border-agentops-500'
                      : 'text-dark-muted hover:bg-dark-bg hover:text-dark-text'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-dark-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-agentops-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-agentops-400">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-text truncate">
                  {user?.full_name || user?.email}
                </p>
                <p className="text-xs text-dark-muted truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-dark-muted rounded-md hover:bg-dark-bg hover:text-dark-text transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-dark-surface lg:border-r lg:border-dark-border">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-dark-border">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-agentops-600" />
            <div>
              <h1 className="text-xl font-bold text-dark-text">AgentOps</h1>
              <p className="text-xs text-dark-muted">PagerDuty for AI Agents</p>
            </div>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col px-4 py-4">
          <div className="flex-1 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-agentops-500/20 text-agentops-400 border-l-2 border-agentops-500'
                      : 'text-dark-muted hover:bg-dark-bg hover:text-dark-text'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="border-t border-dark-border pt-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-agentops-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-agentops-400">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-text truncate">
                  {user?.full_name || user?.email}
                </p>
                <p className="text-xs text-dark-muted truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-dark-muted rounded-md hover:bg-dark-bg hover:text-dark-text transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-dark-border bg-dark-surface px-4 shadow-sm lg:px-6">
          <button
            type="button"
            className="lg:hidden text-dark-text"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-agentops-500" />
                <span className="text-sm text-dark-muted">System Status:</span>
                <span className="text-sm font-medium text-green-400">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
