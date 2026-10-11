import React, { useState } from 'react';
import apiClient from '../api/client';
import { X, UserPlus, AlertCircle, Shield, User } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const CreateUserModal = ({ 
  isOpen: propIsOpen, 
  onClose: propOnClose, 
  onUserCreated: propOnUserCreated 
}) => {
  const workspace = useWorkspace();
  const isOpen = propIsOpen !== undefined ? propIsOpen : workspace.isUserModalOpen;
  const onClose = propOnClose || (() => workspace.setIsUserModalOpen(false));
  const onUserCreated = propOnUserCreated || workspace.fetchUsers;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await apiClient.post('/users', {
        full_name: fullName,
        email,
        password,
        role,
      });

      if (res.data && res.data.data) {
        if (onUserCreated) onUserCreated(res.data.data);
        onClose();
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('USER');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Failed to add team member.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="liquid-glass rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-white/10 text-white relative z-10">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Invite Team Member</h2>
            <p className="text-xs text-slate-400 mt-0.5">Assign organization role and credentials</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@organization.com"
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Initial Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-900/70 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Workspace Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label 
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition ${
                  role === 'USER' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-xs' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="USER"
                  checked={role === 'USER'}
                  onChange={() => setRole('USER')}
                  className="hidden"
                />
                <User className="w-4 h-4 text-sky-400" />
                <span className="font-semibold">Team Member</span>
              </label>

              <label 
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition ${
                  role === 'ADMIN' 
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-xs' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={role === 'ADMIN'}
                  onChange={() => setRole('ADMIN')}
                  className="hidden"
                />
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">Administrator</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="liquid-button px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
