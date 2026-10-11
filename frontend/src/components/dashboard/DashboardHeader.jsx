import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ShieldCheck, User, Plus, UserPlus, RefreshCw, LogOut, Crown, Menu } from 'lucide-react';
import UserProfileModal from '../UserProfileModal';

export const DashboardHeader = ({ currentTab }) => {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const { setIsTaskModalOpen, setIsUserModalOpen, fetchTasks, loading, isMobileSidebarOpen, setIsMobileSidebarOpen } = useWorkspace();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 sticky top-0 z-20 shadow-lg">
        <div className="flex items-center gap-2.5">
          {/* Mobile Sidebar Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer flex-shrink-0"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {currentTab === 'create-task' ? 'Create Workspace Task' : currentTab === 'team' ? 'Team Roster & Roles' : isAdmin ? 'Organization Task Board' : 'My Assigned Work Items'}
              </h2>
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> Super Admin Console
              </span>
            ) : isAdmin ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Admin Workspace
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                <User className="w-3.5 h-3.5 text-sky-400" /> Member Workspace
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {currentTab === 'create-task'
              ? 'Fill in task details, set priorities, and assign to team members with full workspace tracking.'
              : isSuperAdmin
                ? 'Root super-administrator access: platform configuration, multi-tenant governance, and global task orchestration.'
                : isAdmin 
                  ? 'Complete oversight over workspace tasks, assignments, status lifecycle, and team members.' 
                  : 'Track and progress the lifecycle of tasks assigned directly to you in real-time.'}
          </p>
        </div>
      </div>

      {/* Action Controls & User Profile */}
      <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTasks}
            title="Refresh Workspace"
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                Invite Member
              </button>

              {currentTab !== 'create-task' && (
                <button
                  onClick={() => navigate('/tasks/create')}
                  className="liquid-button inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </button>
              )}
            </>
          )}

          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* User Profile Pill */}
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer group text-left"
            title="View User Profile & Account Details"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs uppercase text-white shadow-sm flex-shrink-0 ${
              isSuperAdmin
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 ring-1 ring-amber-400/50'
                : isAdmin 
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' 
                  : 'bg-gradient-to-tr from-sky-600 to-indigo-600'
            }`}>
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition truncate max-w-[100px]">
                {user?.full_name || 'Profile'}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {user?.role?.toLowerCase() || 'account'}
              </div>
            </div>
          </button>

          {/* Quick Logout Button */}
          <button
            type="button"
            onClick={logout}
            title="Sign Out (Logout)"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
};

export default DashboardHeader;
