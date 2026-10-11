import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate active session on initial load or refresh via HttpOnly cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Browser automatically attaches the HttpOnly cookie
        const res = await apiClient.get('/auth/me');
        if (res.data && res.data.data) {
          setUser(res.data.data);
        }
      } catch (err) {
        // Not authenticated or session expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    // Backend sets the secure HttpOnly cookie upon successful login
    const res = await apiClient.post('/auth/login', { email, password });
    const userData = res.data.data.user;
    setUser(userData);
    return userData;
  };

  const register = async (tenantName, fullName, email, password) => {
    // Registers tenant and dispatches verification OTP to email
    const res = await apiClient.post('/auth/register', {
      tenant_name: tenantName,
      full_name: fullName,
      email,
      password,
    });
    return res.data;
  };

  const verifyOtp = async (email, otpCode) => {
    // Backend validates OTP and sets secure HttpOnly cookie
    const res = await apiClient.post('/auth/otp/verify', {
      email,
      otp_code: otpCode,
    });
    const userData = res.data.data.user;
    setUser(userData);
    return userData;
  };

  const sendOtp = async (email, purpose = 'REGISTRATION_VERIFICATION') => {
    const res = await apiClient.post('/auth/otp/send', { email, purpose });
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data.data;
  };

  const resetPassword = async (token, newPassword) => {
    const res = await apiClient.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return res.data.data;
  };

  const logout = async () => {
    try {
      // Backend clears the HttpOnly cookie
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request completed:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOtp,
        sendOtp,
        forgotPassword,
        resetPassword,
        logout,
        isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
        isSuperAdmin: user?.role === 'SUPER_ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
