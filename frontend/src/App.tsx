import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import EnvironmentSetup from './components/EnvironmentSetup';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EnhancedDashboard from './pages/EnhancedDashboard';
import EnhancedApiKeys from './pages/EnhancedApiKeys';
import EnhancedDocumentation from './pages/EnhancedDocumentation';
import EnhancedMonitor from './pages/EnhancedMonitor';
import LoadingSpinner from './components/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component - requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <EnhancedDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/api-keys" element={
          <ProtectedRoute>
            <Layout>
              <EnhancedApiKeys />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/documentation" element={
          <ProtectedRoute>
            <Layout>
              <EnhancedDocumentation />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/monitor" element={
          <ProtectedRoute>
            <Layout>
              <EnhancedMonitor />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            {/* Environment Setup Notice - Only show if API URL is not configured */}
            {!process.env.REACT_APP_API_URL ? (
              <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                  <EnvironmentSetup />
                </div>
              </div>
            ) : (
              <AppRoutes />
            )}
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
