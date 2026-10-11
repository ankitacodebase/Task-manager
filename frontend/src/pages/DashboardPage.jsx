import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import MetricsCards from '../components/dashboard/MetricsCards';
import FilterToolbar from '../components/dashboard/FilterToolbar';
import EmptyTaskState from '../components/dashboard/EmptyTaskState';
import KanbanBoard from '../components/KanbanBoard';
import TaskListView from '../components/TaskListView';
import PaginationControls from '../components/dashboard/PaginationControls';
import TeamManagement from '../components/TeamManagement';
import CreateUserModal from '../components/CreateUserModal';
import { AlertCircle } from 'lucide-react';

export const DashboardPage = () => {
  const { isAdmin } = useAuth();
  const { filteredTasks, viewMode, error, loading, currentTab, setCurrentTab } = useWorkspace();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/create') || location.search.includes('create')) {
      setCurrentTab('tasks');
    }
  }, [location, setCurrentTab]);

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="liquid-glow-orb w-[500px] h-[500px] bg-indigo-600/15 -top-20 -left-20" />
      <div className="liquid-glow-orb w-[600px] h-[600px] bg-purple-600/15 -bottom-40 right-10" />

      {/* 1. Role-Based Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Workspace Sticky Top Header */}
        <DashboardHeader currentTab={currentTab} />

        {/* Dynamic Tab Body */}
        <div className="p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl 2xl:max-w-[1700px] 4k:max-w-[2400px] w-full mx-auto flex-1">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Tasks Board / List View */}
          {currentTab === 'tasks' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Dynamic Animated Metrics */}
              <MetricsCards />

              {/* Search, Filter, and View Mode Switcher */}
              <FilterToolbar />

              {/* Tasks Content: Kanban Board or Table List */}
              {loading ? (
                <div className="p-16 text-center liquid-glass rounded-2xl border border-white/10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-500 border-t-transparent mb-3" />
                  <p className="text-xs text-slate-400">Loading workspace tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <EmptyTaskState />
              ) : viewMode === 'kanban' ? (
                <KanbanBoard />
              ) : (
                <div className="space-y-4">
                  <TaskListView />
                  <PaginationControls />
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Team Management (Admin Only) */}
          {currentTab === 'team' && isAdmin && (
            <div className="animate-in fade-in duration-200">
              <TeamManagement />
            </div>
          )}
        </div>
      </main>

      {/* Workspace Action Modals */}
      <CreateUserModal />
    </div>
  );
};

export default DashboardPage;
