import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';
import { AuthContext } from './AuthContext.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await authService.getCurrentUser();
      if (response?.success && response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthStatus(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [checkAuthStatus]);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response?.success && response?.data?.user) {
        if (response?.data?.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.user);
        return response.data.user;
      }
      throw new Error('Login failed. Please check credentials.');
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, role }) => {
    setLoading(true);
    try {
      const response = await authService.register({ name, email, password, role });
      if (response?.success && response?.data?.user) {
        if (response?.data?.token) {
          localStorage.setItem('token', response.data.token);
        }
        setUser(response.data.user);
        return response.data.user;
      }
      throw new Error('Registration failed.');
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
