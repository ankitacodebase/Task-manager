import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Search, Filter, Kanban, List, X, Users, FolderKanban } from 'lucide-react';

export const FilterToolbar = () => {
  const { isAdmin } = useAuth();
  const {
    viewMode,
    setViewMode,
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    selectedAssignee,
    setSelectedAssignee,
    selectedProject,
    setSelectedProject,
    searchQuery,
    setSearchQuery,
    users,
    projects
  } = useWorkspace();

  const statuses = [
    { id: 'ALL', label: 'All Tasks' },
    { id: 'TODO', label: 'To Do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'IN_REVIEW', label: 'In Review' },
    { id: 'DONE', label: 'Completed' },
  ];

  const hasActiveFilters = selectedStatus !== 'ALL' || selectedPriority !== 'ALL' || selectedAssignee !== 'ALL' || selectedProject !== 'ALL' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setSelectedAssignee('ALL');
    setSelectedProject('ALL');
    setSearchQuery('');
  };

  return (
    <div className="liquid-glass p-4 rounded-2xl border border-white/10 space-y-3.5 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === st.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                  : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* View Switcher: Kanban vs Table List */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 self-start lg:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'kanban' 
                ? 'bg-white/10 text-white shadow-xs border border-white/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-white/10 text-white shadow-xs border border-white/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5 text-indigo-400" />
            <span>Table List</span>
          </button>
        </div>
      </div>

      {/* Second Row: Detailed Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-white/5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or assignee..."
            className="w-full pl-9 pr-8 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority & Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter (Separation across multiple projects) */}
          <div className="relative flex-1 sm:flex-initial min-w-[130px] sm:min-w-[140px]">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name} ({p.project_key})
                </option>
              ))}
            </select>
            <FolderKanban className="w-3.5 h-3.5 text-indigo-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative flex-1 sm:flex-initial min-w-[120px] sm:min-w-[130px]">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Priorities</option>
              <option value="LOW" className="bg-slate-900 text-slate-200">Low Priority</option>
              <option value="MEDIUM" className="bg-slate-900 text-slate-200">Medium Priority</option>
              <option value="HIGH" className="bg-slate-900 text-slate-200">High Priority</option>
              <option value="URGENT" className="bg-slate-900 text-rose-400">Urgent Priority</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Assignee Filter (Admin only) */}
          {isAdmin && (
            <div className="relative flex-1 sm:flex-initial min-w-[130px] sm:min-w-[140px]">
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">All Assignees</option>
                <option value="UNASSIGNED" className="bg-slate-900 text-amber-400">Unassigned Only</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
              <Users className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              title="Reset all filters"
              className="p-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterToolbar;
