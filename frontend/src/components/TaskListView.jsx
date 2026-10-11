import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import UserSearchSelect from './common/UserSearchSelect';

export const TaskListView = ({
  tasks: propTasks,
  onStatusChange: propOnStatusChange,
}) => {
  const { user, isAdmin } = useAuth();
  const workspace = useWorkspace();

  const tasks = propTasks || workspace.paginatedTasks || workspace.filteredTasks;
  const onStatusChange = propOnStatusChange || workspace.updateTaskStatus;
  const currentUserId = user?.id;

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-2.5 h-2.5 text-rose-400" /> Urgent
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-2.5 h-2.5 text-amber-400" /> High
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            Medium
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Done
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> In Review
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <PlayCircle className="w-3.5 h-3.5 text-sky-400" /> In Progress
          </span>
        );
      case 'TODO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Circle className="w-3.5 h-3.5 text-indigo-400" /> To Do
          </span>
        );
    }
  };

  return (
    <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/10 text-slate-400 uppercase font-bold tracking-wider text-[11px]">
              <th className="py-3.5 px-6">Task Key</th>
              <th className="py-3.5 px-6">Project</th>
              <th className="py-3.5 px-6">Title & Summary</th>
              <th className="py-3.5 px-6">Priority</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Assignee</th>
              <th className="py-3.5 px-6">Due Date</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No tasks found matching filter criteria.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isAssignedToMe = task.assignee_id === currentUserId;

                return (
                  <tr key={task.id} className="hover:bg-white/[0.03] transition">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-300">
                      <span className="px-2 py-0.5 bg-slate-800/80 rounded-lg border border-white/5">
                        {task.task_key}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-[11px] font-medium text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 whitespace-nowrap">
                        {task.project_name || 'Main Project'}
                      </span>
                    </td>

                    <td className="py-4 px-6 max-w-xs">
                      <p className={`font-semibold text-xs leading-snug ${
                        task.status === 'DONE' ? 'line-through text-slate-500' : 'text-white'
                      }`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                      {task.comments && task.comments.length > 0 && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 mt-1.5">
                          <MessageSquare className="w-2.5 h-2.5 text-indigo-400" />
                          <span>{task.comments.length} comment{task.comments.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {getPriorityBadge(task.priority)}
                    </td>

                    <td className="py-4 px-6">
                      {getStatusBadge(task.status)}
                    </td>

                    <td className="py-4 px-6">
                      {isAdmin ? (
                        <UserSearchSelect
                          users={workspace.users}
                          value={task.assignee_id || ''}
                          onChange={(newUserId) => workspace.assignTask(task.id, newUserId || null)}
                          placeholder="Assign..."
                          compact={true}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-indigo-300 uppercase flex-shrink-0">
                            {task.assignee_name ? task.assignee_name.charAt(0) : <User className="w-3 h-3 text-slate-500" />}
                          </div>
                          <span className={`text-xs ${isAssignedToMe ? 'font-bold text-indigo-300' : 'text-slate-300'}`}>
                            {task.assignee_name || 'Unassigned'} {isAssignedToMe && '(You)'}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-400">
                      {task.due_date ? (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {task.status === 'TODO' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition cursor-pointer"
                          >
                            <PlayCircle className="w-3 h-3" />
                            Start
                          </button>
                        )}

                        {task.status === 'IN_PROGRESS' && (
                          <>
                            <button
                              onClick={() => onStatusChange(task.id, 'IN_REVIEW')}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition cursor-pointer"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => onStatusChange(task.id, 'DONE')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Done
                            </button>
                          </>
                        )}

                        {task.status === 'IN_REVIEW' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'DONE')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Approve
                          </button>
                        )}

                        {task.status === 'DONE' && (
                          <button
                            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Re-open
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskListView;
