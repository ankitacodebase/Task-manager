import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Layers, PlayCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export const MetricsCards = () => {
  const { isAdmin } = useAuth();
  const { metrics } = useWorkspace();

  const total = metrics.total || 0;
  const progressPercent = total > 0 ? Math.round((metrics.done / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 2xl:gap-6">
      {/* 1. Total Tasks */}
      <div className="liquid-glass-card p-3.5 sm:p-4 2xl:p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">
              {isAdmin ? 'Workspace Tasks' : 'My Assigned Tasks'}
            </p>
            <p className="text-xl sm:text-2xl 2xl:text-3xl font-black text-white mt-1 tracking-tight">{metrics.total}</p>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform flex-shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active sprint tracking</span>
        </div>
      </div>

      {/* 2. In Progress */}
      <div className="liquid-glass-card p-3.5 sm:p-4 2xl:p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">In Active Progress</p>
            <p className="text-xl sm:text-2xl 2xl:text-3xl font-black text-sky-400 mt-1 tracking-tight">{metrics.inProgress}</p>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform flex-shrink-0">
            <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>Currently in execution</span>
        </div>
      </div>

      {/* 3. In Review */}
      <div className="liquid-glass-card p-3.5 sm:p-4 2xl:p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">Awaiting Review</p>
            <p className="text-xl sm:text-2xl 2xl:text-3xl font-black text-amber-400 mt-1 tracking-tight">{metrics.inReview}</p>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>QA & verification check</span>
        </div>
      </div>

      {/* 4. Completed */}
      <div className="liquid-glass-card p-3.5 sm:p-4 2xl:p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400">Completed Done</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl 2xl:text-3xl font-black text-emerald-400 tracking-tight">{metrics.done}</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400/80">({progressPercent}%)</span>
            </div>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-2.5 sm:mt-3 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;
