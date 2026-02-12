import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await authApi.getCurrentUser();
          setUser(response.data.data.user);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('authToken');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authApi.register(userData);

      // Only auto login if token is provided (if verification is disabled)
      if (response.data.data.token) {
        const { token: authToken, user: newUser } = response.data.data;
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        setUser(newUser);
      }

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login(email, password);
      const { token: authToken, user: userData } = response.data.data;

      localStorage.setItem('authToken', authToken);
      setToken(authToken);
      setUser(userData);

      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authApi.updateProfile(profileData);
      setUser(response.data.data.user);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Profile update failed';
      setError(errorMsg);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await authApi.forgotPassword(email);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset request failed';
      setError(errorMsg);
      throw err;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      const response = await authApi.resetPassword(token, newPassword);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset failed';
      setError(errorMsg);
      throw err;
    }
  };




  const verifyEmail = async (token) => {
    try {
      console.log('[AuthContext] Starting email verification...');
      console.log('[AuthContext] Token:', token ? token.substring(0, 15) + '...' : 'No token');

      setError(null);
      const response = await authApi.verifyEmail(token);

      console.log('[AuthContext] Verification API response:', response);

      // Auto login disabled to allow manual login as requested by user
      /*
      if (response.data.data.token) {
        console.log('[AuthContext] Auto-login after verification');
        const { token: authToken, user: userData } = response.data.data;
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        setUser(userData);
        console.log('[AuthContext] User logged in:', userData.email);
      }
      */

      return response.data;
    } catch (err) {
      console.error('[AuthContext] Verification failed:', err);
      console.error('[AuthContext] Error details:', err.response?.data);

      const errorMsg = err.response?.data?.message || 'Email verification failed';
      setError(errorMsg);
      throw err;
    }
  };

  const resendVerification = async (email) => {
    try {
      setError(null);
      const response = await authApi.resendVerification(email);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to resend verification email';
      setError(errorMsg);
      throw err;
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        register,
        login,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};