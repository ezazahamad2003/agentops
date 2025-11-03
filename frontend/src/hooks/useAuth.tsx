import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('agentops_token');
      
      if (token) {
        // Validate token with backend by fetching user info
        try {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          // Token is invalid, clear it
          console.error('Token validation failed:', err);
          localStorage.removeItem('agentops_token');
          localStorage.removeItem('agentops_user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Authentication check failed');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call actual backend login API
      const response = await apiService.login(email, password);
      
      // Store JWT token
      localStorage.setItem('agentops_token', response.access_token);
      
      // Fetch user data
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      localStorage.setItem('agentops_user', JSON.stringify(userData));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call actual backend registration API
      await apiService.register(email, password, fullName);
      
      // Auto-login after successful registration
      await login(email, password);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('agentops_token');
      localStorage.removeItem('agentops_user');
      localStorage.removeItem('agentops_api_key');
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
