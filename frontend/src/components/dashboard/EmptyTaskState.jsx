import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Layers, Plus, FilterX } from 'lucide-react';

export const EmptyTaskState = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { 
    tasks, 
    setIsTaskModalOpen, 
    setSelectedStatus, 
    setSelectedPriority, 
    setSelectedAssignee, 
    setSearchQuery 
  } = useWorkspace();

  const isFiltered = tasks.length > 0;

  const resetFilters = () => {
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setSelectedAssignee('ALL');
    setSearchQuery('');
  };

  return (
    <div className="liquid-glass rounded-3xl p-12 border border-white/10 text-center max-w-lg mx-auto shadow-2xl relative overflow-hidden my-8">
      <div className="liquid-glow-orb w-48 h-48 bg-indigo-500/20 top-0 left-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4 text-indigo-400">
          {isFiltered ? <FilterX className="w-8 h-8" /> : <Layers className="w-8 h-8" />}
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">
          {isFiltered ? 'No matching tasks found' : 'No tasks created yet'}
        </h3>
        
        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          {isFiltered 
            ? 'Try adjusting your status, priority, or assignee search criteria to view more items.' 
            : isAdmin 
              ? 'Get started by creating your first organizational task and assigning it to a team member.'
              : 'You do not have any tasks assigned to you currently. As soon as an admin assigns work, it will appear here.'}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          {isFiltered ? (
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              Clear All Filters
            </button>
          ) : isAdmin ? (
            <button
              onClick={() => navigate('/tasks/create')}
              className="liquid-button px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Task</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EmptyTaskState;
