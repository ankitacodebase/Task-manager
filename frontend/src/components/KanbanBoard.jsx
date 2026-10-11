import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Circle, PlayCircle, Clock, CheckCircle2, Inbox, ArrowDownCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

const COLUMNS = [
  {
    id: 'TODO',
    title: 'To Do',
    description: 'Ready to be worked on',
    icon: Circle,
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
    headerBg: 'bg-indigo-500/10',
    badgeColor: 'bg-indigo-500/20 text-indigo-300',
    dropHighlight: 'ring-2 ring-indigo-400 bg-indigo-500/15 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.25)]',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    description: 'Actively in development',
    icon: PlayCircle,
    color: 'text-sky-400',
    border: 'border-sky-500/20',
    headerBg: 'bg-sky-500/10',
    badgeColor: 'bg-sky-500/20 text-sky-300',
    dropHighlight: 'ring-2 ring-sky-400 bg-sky-500/15 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.25)]',
  },
  {
    id: 'IN_REVIEW',
    title: 'In Review',
    description: 'Pending QA or approval',
    icon: Clock,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    headerBg: 'bg-amber-500/10',
    badgeColor: 'bg-amber-500/20 text-amber-300',
    dropHighlight: 'ring-2 ring-amber-400 bg-amber-500/15 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.25)]',
  },
  {
    id: 'DONE',
    title: 'Completed',
    description: 'Delivered and verified',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    headerBg: 'bg-emerald-500/10',
    badgeColor: 'bg-emerald-500/20 text-emerald-300',
    dropHighlight: 'ring-2 ring-emerald-400 bg-emerald-500/15 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.25)]',
  },
];

export const KanbanBoard = ({
  tasks: propTasks,
  users: propUsers,
  onStatusChange: propOnStatusChange,
  onAssignChange: propOnAssignChange,
}) => {
  const { user, isAdmin } = useAuth();
  const workspace = useWorkspace();

  const tasks = propTasks || workspace.filteredTasks;
  const users = propUsers || workspace.users;
  const onStatusChange = propOnStatusChange || workspace.updateTaskStatus;
  const onAssignChange = propOnAssignChange || ((taskId, newAssigneeId) => workspace.assignTask(taskId, newAssigneeId));

  // Drag and Drop States
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const data = JSON.parse(rawData);
      if (data && data.taskId) {
        const droppedTask = tasks.find((t) => t.id === data.taskId);
        if (!droppedTask) return;

        // If target status is effectively unchanged, do nothing
        const effectiveCurrentStatus = (droppedTask.status === 'BACKLOG' && targetStatus === 'TODO') ? 'TODO' : droppedTask.status;
        if (effectiveCurrentStatus === targetStatus) return;

        // DIRECT STATUS CHANGE: do not ask for confirmation or open popup on drag & drop
        await onStatusChange(droppedTask.id, targetStatus);
      }
    } catch (err) {
      console.error('Failed to parse drag drop payload:', err);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 4k:grid-cols-4 gap-4 sm:gap-5 2xl:gap-6 items-start">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const colTasks = tasks.filter((t) => {
            if (col.id === 'TODO') return t.status === 'TODO' || t.status === 'BACKLOG';
            return t.status === col.id;
          });

          const isColumnHovered = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`liquid-glass rounded-2xl border ${col.border} p-3 sm:p-3.5 2xl:p-4 flex flex-col min-h-[280px] md:min-h-[540px] 2xl:min-h-[620px] shadow-xl transition-all duration-200 ${
                isColumnHovered ? col.dropHighlight : ''
              }`}
            >
              {/* Column Header */}
              <div className={`p-3 rounded-xl ${col.headerBg} border border-white/5 flex items-center justify-between mb-3.5`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="font-bold text-xs text-white tracking-tight">
                    {col.title}
                  </h3>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Drag Drop Interactive Indicator */}
              {isColumnHovered && (
                <div className="mb-3.5 p-3 rounded-xl border-2 border-dashed border-indigo-400/60 bg-indigo-500/10 text-center animate-pulse">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-300">
                    <ArrowDownCircle className="w-4 h-4 text-indigo-400" />
                    <span>Drop task to move to {col.title}</span>
                  </div>
                </div>
              )}

              {/* Column Task Cards */}
              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <div className="h-44 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                    <Inbox className="w-6 h-6 text-slate-500 mb-1" />
                    <p className="text-xs text-slate-400 font-medium">No tasks in this stage</p>
                    <p className="text-[10px] text-slate-500 mt-1">Drag and drop tasks here</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      users={users}
                      onStatusChange={onStatusChange}
                      onAssignChange={onAssignChange}
                      currentUserId={user?.id}
                      isAdmin={isAdmin}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default KanbanBoard;
