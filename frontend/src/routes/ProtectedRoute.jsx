import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="liquid-glow-orb w-96 h-96 bg-indigo-600/30 -top-20 -left-20" />
        <div className="liquid-glow-orb w-96 h-96 bg-purple-600/30 -bottom-20 -right-20" />
        <div className="liquid-glass rounded-3xl p-8 border border-white/10 text-center relative z-10 shadow-2xl">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-indigo-500 border-t-transparent mb-4" />
          <h3 className="text-white font-bold text-base tracking-tight">Authenticating Session</h3>
          <p className="text-slate-400 text-xs mt-1">Verifying HttpOnly credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
