import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  User, 
  LogOut, 
  Building2, 
  Plus, 
  UserPlus, 
  Globe,
  Sparkles,
  Crown,
  X
} from 'lucide-react';
import UserProfileModal from './UserProfileModal';

export const Sidebar = ({ currentTab, setCurrentTab }) => {
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const workspace = useWorkspace();
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const taskCount = workspace?.tasks?.length || 0;
  const teamCount = workspace?.users?.length || 0;

  const handleTabChange = (tab) => {
    if (workspace?.setIsMobileSidebarOpen) {
      workspace.setIsMobileSidebarOpen(false);
    }
    if (setCurrentTab) {
      setCurrentTab(tab);
    }
    if (tab === 'create-task') {
      navigate('/tasks/create');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {workspace?.isMobileSidebarOpen && (
        <div
          onClick={() => workspace.setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-950/95 backdrop-blur-2xl border-r border-white/10 text-slate-300 flex flex-col flex-shrink-0 min-h-screen select-none transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0 ${
        workspace?.isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* 1. Header & Workspace Branding */}
        <div className="p-4 sm:p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg shadow-indigo-500/25 flex-shrink-0">
                <div className="w-full h-full bg-slate-950/90 rounded-[11px] backdrop-blur-md flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-white text-base tracking-tight truncate">TaskFlow</h1>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                  {user?.tenant_name || 'Organization'}
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => workspace?.setIsMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer flex-shrink-0 ml-2"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* 2. Primary Navigation Links (Strictly Role-Based) */}
      <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Workspace Navigation
        </div>

        {/* Tasks View (Available to both Admin and User) */}
        <button
          onClick={() => handleTabChange('tasks')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            currentTab === 'tasks'
              ? 'liquid-button text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4" />
            <span>{isAdmin ? 'All Workspace Tasks' : 'My Assigned Tasks'}</span>
          </div>
          {taskCount > 0 && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              currentTab === 'tasks' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
            }`}>
              {taskCount}
            </span>
          )}
        </button>

        {/* Team Members Tab (ADMIN ONLY - Strictly hidden for USER) */}
        {isAdmin && (
          <button
            onClick={() => handleTabChange('team')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              currentTab === 'team'
                ? 'liquid-button text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Team Management</span>
            </div>
            {teamCount > 0 && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                currentTab === 'team' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
              }`}>
                {teamCount}
              </span>
            )}
          </button>
        )}

        {/* Create Task Tab (ADMIN ONLY) */}
        {isAdmin && (
          <button
            onClick={() => handleTabChange('create-task')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              currentTab === 'create-task'
                ? 'liquid-button text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </div>
            {currentTab === 'create-task' && (
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                Active
              </span>
            )}
          </button>
        )}

        {/* Public Overview Navigation */}
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
        >
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>Platform Overview</span>
        </button>

        {/* 3. Quick Action Buttons */}
        <div className="pt-6 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Quick Actions
        </div>

        {isAdmin ? (
          <div className="space-y-2 px-1">
            <button
              onClick={() => handleTabChange('create-task')}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                currentTab === 'create-task'
                  ? 'liquid-button text-white border-transparent shadow-lg shadow-indigo-600/30'
                  : 'bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 hover:text-white border-indigo-500/30'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>

            <button
              onClick={() => workspace.setIsUserModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl text-xs font-medium transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-400" />
              Invite Team Member
            </button>
          </div>
        ) : (
          <div className="px-3 py-3 bg-white/[0.03] rounded-2xl border border-white/5 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Role Permissions</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Assigned work items appear in your view. Update statuses as you complete your work.
            </p>
          </div>
        )}
      </div>

      {/* 4. Authenticated User Profile & Role Pill */}
      <div className="p-3 border-t border-white/10 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.03] border border-white/5">
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-85 transition"
            title="Click to view user profile & account info"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-white shadow-inner flex-shrink-0 ${
              isSuperAdmin
                ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 shadow-amber-500/25 ring-1 ring-amber-400/40'
                : isAdmin 
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' 
                  : 'bg-gradient-to-tr from-sky-600 to-indigo-600'
            }`}>
              {user?.full_name ? user.full_name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                    <Crown className="w-3 h-3 text-amber-400" /> Super Admin
                  </span>
                ) : isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-400">
                    <User className="w-3 h-3" /> Member
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out (Logout)"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </aside>
    </>
  );
};

export default Sidebar;
