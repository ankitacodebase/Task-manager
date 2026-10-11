import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  User, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Fingerprint, 
  CheckCircle2,
  Calendar,
  Crown
} from 'lucide-react';

export const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !user) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="liquid-glass rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10 text-white relative z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">User Account Profile</h2>
              <p className="text-xs text-slate-400">Authenticated Session Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="p-6 space-y-5">
          {/* Avatar Hero */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold uppercase text-white shadow-lg ${
              isSuperAdmin
                ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 shadow-amber-500/30 ring-2 ring-amber-400/40'
                : isAdmin 
                  ? 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 shadow-indigo-500/20' 
                  : 'bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-500 shadow-indigo-500/20'
            }`}>
              {user.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base truncate">{user.full_name}</h3>
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                    <Crown className="w-3 h-3 text-amber-400" /> Super Admin (Root)
                  </span>
                ) : isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    <User className="w-3 h-3" /> Member
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Organization</span>
              </div>
              <span className="font-semibold text-white">{user.tenant_name || 'TaskFlow HQ'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Fingerprint className="w-4 h-4 text-indigo-400" />
                <span>User Identifier</span>
              </div>
              <span className="font-mono text-[10px] text-slate-300 truncate max-w-[200px]">
                {user.id}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Session Security</span>
              </div>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3 h-3" /> HttpOnly Secure Cookie
              </span>
            </div>
          </div>

          {/* Logout Action Area */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out (Logout)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
