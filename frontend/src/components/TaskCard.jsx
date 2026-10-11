import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  RotateCcw, 
  Calendar, 
  GripVertical,
  MessageSquare,
  Send,
  X,
  Check
} from 'lucide-react';
import UserSearchSelect from './common/UserSearchSelect';
import { useWorkspace } from '../context/WorkspaceContext';

export const TaskCard = ({
  task,
  users = [],
  onStatusChange,
  onAssignChange,
  currentUserId,
  isAdmin,
}) => {
  const workspace = useWorkspace();
  const comments = task.comments || [];
  const [isDragging, setIsDragging] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [targetStatusForComment, setTargetStatusForComment] = useState(null);
  const [commentSavedToast, setCommentSavedToast] = useState(false);

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Done
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <PlayCircle className="w-3 h-3 text-sky-400" /> In Progress
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3 text-amber-400" /> In Review
          </span>
        );
      case 'TODO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Circle className="w-3 h-3 text-indigo-400" /> To Do
          </span>
        );
    }
  };

  const isAssignedToMe = task.assignee_id === currentUserId;

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        taskId: task.id,
        status: task.status,
        taskKey: task.task_key,
        title: task.title,
      })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`liquid-glass-card rounded-2xl border p-4.5 flex flex-col justify-between shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40 scale-95 border-indigo-400 ring-2 ring-indigo-400/40' : ''
      } ${
        task.status === 'DONE' 
          ? 'border-emerald-500/20 opacity-80' 
          : 'border-white/10 hover:border-indigo-500/40 hover:-translate-y-1'
      }`}
    >
      <div>
        {/* Top Header: Task Key + Priority + Status + Grip Handle */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-slate-800/80 text-indigo-300 rounded-lg border border-white/5">
              {task.task_key}
            </span>
            {task.project_name && (
              <span className="text-[10px] font-medium px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-lg border border-indigo-500/20 truncate max-w-[110px]" title={`Project: ${task.project_name}`}>
                {task.project_name}
              </span>
            )}
            {getPriorityBadge(task.priority)}
          </div>
          <div className="flex items-center gap-1.5">
            {getStatusBadge(task.status)}
            <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-grab" />
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-xs font-bold mb-1.5 leading-snug tracking-tight ${
          task.status === 'DONE' ? 'text-slate-400 line-through' : 'text-white'
        }`}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 space-y-2.5">
        {/* Assignee Information & Reassignment */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-indigo-300 uppercase flex-shrink-0">
              {task.assignee_name ? task.assignee_name.charAt(0) : <User className="w-3 h-3 text-slate-500" />}
            </div>
            <div className="truncate">
              {task.assignee_name ? (
                <span className={`text-[11px] font-medium ${isAssignedToMe ? 'text-indigo-300 font-semibold' : 'text-slate-300'}`}>
                  {task.assignee_name} {isAssignedToMe && '(You)'}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 italic">Unassigned</span>
              )}
            </div>
          </div>

          {/* Searchable Assignee picker for Admin or self-assign */}
          {isAdmin ? (
            <UserSearchSelect
              users={users}
              value={task.assignee_id || ''}
              onChange={(newUserId) => onAssignChange(task.id, newUserId || null)}
              placeholder="Assign member..."
              compact={true}
            />
          ) : !task.assignee_id ? (
            <button
              onClick={() => onAssignChange(task.id, currentUserId)}
              className="text-[10px] font-bold text-indigo-300 hover:text-white px-2 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-md transition cursor-pointer"
            >
              Claim Task
            </button>
          ) : null}
        </div>

        {/* Due Date (if present) & Quick Inline Comment Trigger */}
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          {task.due_date ? (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-indigo-400" />
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          ) : (
            <div />
          )}

          {/* On-Card Comments Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setShowCommentBox(!showCommentBox);
              setTargetStatusForComment(null);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer ${
              showCommentBox || comments.length > 0
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25'
                : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
            }`}
            title="View comments & discussion"
          >
            <MessageSquare className="w-3 h-3 text-indigo-400" />
            <span>{comments.length > 0 ? `Comments (${comments.length})` : 'Comment'}</span>
          </button>
        </div>

        {/* INLINE ON-CARD COMMENTS THREAD & COMPOSER */}
        {showCommentBox && (
          <div className="p-3 bg-slate-900/95 border border-indigo-500/30 rounded-xl space-y-2.5 animate-in fade-in duration-150 shadow-inner">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-indigo-400" />
                {targetStatusForComment ? `Note for ${targetStatusForComment}` : `Discussion (${comments.length})`}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowCommentBox(false);
                  setTargetStatusForComment(null);
                  setCommentText('');
                }}
                className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Existing Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-950/80 border border-white/5 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[9px] uppercase">
                          {c.user_name ? c.user_name.charAt(0) : 'U'}
                        </div>
                        <span className="font-semibold text-indigo-300">
                          {c.user_name || 'Team Member'}
                        </span>
                      </div>
                      <span className="text-slate-500 text-[9px]">
                        {c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed break-words pl-5.5">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic py-1 text-center">
                No comments yet. Write a comment below.
              </p>
            )}

            {/* Comment Input Box */}
            <div className="pt-1.5 space-y-2 border-t border-white/5">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[9px] text-slate-500">
                  Visible to Admin & Team
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommentBox(false);
                      setTargetStatusForComment(null);
                      setCommentText('');
                    }}
                    className="px-2 py-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingComment || !commentText.trim()}
                    onClick={async () => {
                      if (!commentText.trim()) return;
                      setIsSubmittingComment(true);
                      try {
                        if (targetStatusForComment) {
                          await onStatusChange(task.id, targetStatusForComment, commentText.trim());
                          setTargetStatusForComment(null);
                        } else if (workspace.addComment) {
                          await workspace.addComment(task.id, commentText.trim());
                        }
                        setCommentText('');
                        setCommentSavedToast(true);
                        setTimeout(() => setCommentSavedToast(false), 2000);
                      } catch (err) {
                        console.error('Failed to save comment:', err);
                      } finally {
                        setIsSubmittingComment(false);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition cursor-pointer disabled:opacity-40"
                  >
                    {isSubmittingComment ? (
                      <span className="inline-block animate-spin rounded-full h-2.5 w-2.5 border border-white border-t-transparent" />
                    ) : (
                      <>
                        <Send className="w-2.5 h-2.5" />
                        <span>Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {commentSavedToast && (
          <div className="px-2 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-300 flex items-center gap-1 font-semibold animate-in fade-in">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Comment saved!</span>
          </div>
        )}

        {/* Task Lifecycle Actions */}
        <div className="pt-1.5 flex items-center justify-end gap-1.5">
          {task.status === 'TODO' && (
            <button
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              className="w-full liquid-button inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-xl cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Start Task
            </button>
          )}

          {task.status === 'IN_PROGRESS' && (
            <div className="w-full flex items-center gap-1.5">
              <button
                onClick={() => onStatusChange(task.id, 'TODO')}
                className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Move back to To Do"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                onClick={() => onStatusChange(task.id, 'IN_REVIEW')}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition cursor-pointer"
              >
                Submit Review
              </button>
              <button
                onClick={() => onStatusChange(task.id, 'DONE')}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done
              </button>
            </div>
          )}

          {task.status === 'IN_REVIEW' && (
            <div className="w-full flex items-center gap-1.5">
              <button
                onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Revise
              </button>
              <button
                onClick={() => onStatusChange(task.id, 'DONE')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve
              </button>
            </div>
          )}

          {task.status === 'DONE' && (
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Finished
              </span>
              <button
                onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Re-open
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
