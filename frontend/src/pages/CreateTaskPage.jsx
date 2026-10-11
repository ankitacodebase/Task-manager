import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import UserSearchSelect from '../components/common/UserSearchSelect';
import DatePicker from '../components/common/DatePicker';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import CreateUserModal from '../components/CreateUserModal';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Sparkles, 
  Calendar, 
  User, 
  Flag, 
  FileText, 
  Clock, 
  Layers,
  ChevronRight,
  RotateCcw,
  Check,
  ShieldAlert,
  FolderKanban
} from 'lucide-react';

export const CreateTaskPage = ({ onBack: propOnBack, onTaskCreated: propOnTaskCreated }) => {
  const navigate = useNavigate();
  const workspace = useWorkspace();
  const { isAdmin, isSuperAdmin } = useAuth();
  const users = workspace?.users || [];
  const projects = workspace?.projects || [];
  
  const handleBack = () => {
    if (propOnBack) propOnBack();
    if (workspace?.setCurrentTab) workspace.setCurrentTab('tasks');
    navigate('/dashboard');
  };

  const onTaskCreated = propOnTaskCreated || workspace?.fetchTasks;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Submission & UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  const selectedAssignee = users.find((u) => u.id === assigneeId);

  const priorityOptions = [
    { 
      value: 'LOW', 
      label: 'Low Priority', 
      description: 'Non-urgent backlog item',
      color: 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500' 
    },
    { 
      value: 'MEDIUM', 
      label: 'Medium Priority', 
      description: 'Standard sprint delivery',
      color: 'border-indigo-700/50 bg-indigo-950/30 text-indigo-300 hover:border-indigo-400' 
    },
    { 
      value: 'HIGH', 
      label: 'High Priority', 
      description: 'Important milestone blocker',
      color: 'border-amber-700/50 bg-amber-950/30 text-amber-300 hover:border-amber-400' 
    },
    { 
      value: 'URGENT', 
      label: 'Urgent Priority', 
      description: 'Critical immediate attention',
      color: 'border-rose-700/50 bg-rose-950/30 text-rose-300 hover:border-rose-400' 
    },
  ];

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setAssigneeId('');
    setDueDate('');
    setSelectedProjectId('');
    setIsCreatingNewProject(false);
    setNewProjectName('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required. Please enter a descriptive title.');
      return;
    }

    if (isCreatingNewProject && !newProjectName.trim()) {
      setError('Please provide a name for the new project or choose an existing project.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        assignee_id: assigneeId || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        project_id: (!isCreatingNewProject && selectedProjectId) ? selectedProjectId : null,
        project_name: isCreatingNewProject ? newProjectName.trim() : null,
      };

      const res = await apiClient.post('/tasks', payload);
      if (res.data && res.data.data) {
        if (onTaskCreated) await onTaskCreated(res.data.data);
        setSuccessToast(true);
        setTimeout(() => {
          handleBack();
        }, 500);
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || 'Failed to create task.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="liquid-glow-orb w-[500px] h-[500px] bg-indigo-600/15 -top-20 -left-20" />
      <div className="liquid-glow-orb w-[600px] h-[600px] bg-purple-600/15 -bottom-40 right-10" />

      {/* 1. Role-Based Sidebar Navigation */}
      <Sidebar currentTab="create-task" setCurrentTab={workspace?.setCurrentTab} />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Workspace Sticky Top Header */}
        <DashboardHeader currentTab="create-task" />

        {/* Dynamic Page Body with Full Width & Generous Spacing */}
        <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl 2xl:max-w-[1700px] 4k:max-w-[2200px] w-full mx-auto flex-1 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* 1. Page Header & Breadcrumbs (Wide & Spacious) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2.5">
          {/* Breadcrumb Path */}
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <button
              type="button"
              onClick={handleBack}
              className="hover:text-white transition cursor-pointer flex items-center gap-1.5 font-medium"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Workspace</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <button
              type="button"
              onClick={handleBack}
              className="hover:text-white transition cursor-pointer font-medium"
            >
              Task Board
            </button>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-indigo-400 font-bold">Create New Task</span>
          </nav>

          <div className="flex items-center gap-3.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create New Task
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-xs">
              Separate Page View
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Fill in the full task details below with wide visual spacing. Assign duties to team members, set delivery deadlines, and configure priorities with complete multi-tenant scoping.
          </p>
        </div>

        {/* Top Action Controls */}
        <div className="flex items-center gap-3.5 self-start md:self-auto">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tasks</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {error && (
        <div className="p-4 sm:p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3.5 text-xs sm:text-sm text-rose-300 shadow-lg animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-rose-200">Unable to create task</p>
            <p className="text-rose-300/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {successToast && (
        <div className="p-4 sm:p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3.5 text-sm text-emerald-300 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">Task created successfully! Redirecting back to your Task Board...</span>
        </div>
      )}

      {/* 2. Main Wide Form Layout (Responsive 12-Column Grid) */}
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT COLUMN: Core Information (7 of 12 columns) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Primary Details Card */}
            <div className="liquid-glass p-4 sm:p-7 lg:p-9 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-6 sm:space-y-8">
              <div className="flex items-center gap-3 pb-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">Task Core Information</h2>
                  <p className="text-xs text-slate-400">Specify the summary, acceptance criteria, and technical guidelines</p>
                </div>
              </div>

              {/* Project Assignment: Select existing or create new */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Project Workspace</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNewProject(!isCreatingNewProject);
                      setNewProjectName('');
                    }}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                  >
                    {isCreatingNewProject ? '← Select Existing Project' : '+ New Project'}
                  </button>
                </div>

                {isCreatingNewProject ? (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g. Mobile App Redesign, Payment Gateway, Marketing..."
                      className="w-full px-5 py-3.5 bg-slate-900/90 border border-indigo-500/40 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 font-medium"
                    />
                    <p className="text-[11px] text-slate-400">
                      A new project will be created in your organization with automatic sequential keys.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-900/80 border border-white/15 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 font-medium cursor-pointer appearance-none"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        Select Project (Defaults to Main Project)
                      </option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                          {p.name} ({p.project_key})
                        </option>
                      ))}
                    </select>
                    <FolderKanban className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Task Title Field */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <span>Task Title</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-xs text-slate-500 font-mono">
                    {title.length} / 255 chars
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement OAuth 2.0 and Multi-Tenant RBAC Integration"
                  className="w-full px-5 py-4 bg-slate-900/80 border border-white/15 rounded-2xl text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500 transition shadow-inner font-medium"
                />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide a clear, actionable summary. This title appears prominently on the Kanban board and task lists.
                </p>
              </div>

              {/* Description & Criteria Field */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Description & Acceptance Criteria
                  </label>
                  <span className="text-xs text-slate-500">Optional</span>
                </div>
                <textarea
                  rows={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe task goals, architectural constraints, technical requirements, acceptance criteria, or relevant links..."
                  className="w-full p-5 bg-slate-900/80 border border-white/15 rounded-2xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500 transition resize-y leading-relaxed shadow-inner"
                />
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Markdown formatting and bullet lists supported.</span>
                  <span className="font-mono">{description.length} characters</span>
                </div>
              </div>
            </div>

            {/* Lifecycle Info Banner */}
            <div className="p-6 bg-indigo-600/[0.08] border border-indigo-500/20 rounded-3xl flex items-start gap-4 shadow-md">
              <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm space-y-1.5 text-slate-300 leading-relaxed">
                <h4 className="font-bold text-white">Task Lifecycle Progression:</h4>
                <p className="text-slate-400">
                  New tasks are automatically initialized with status <span className="text-slate-200 font-semibold">PENDING</span>.
                  Once created, assignees can move tasks across <span className="text-indigo-300 font-semibold">IN PROGRESS</span>, <span className="text-amber-300 font-semibold">UNDER REVIEW</span>, and <span className="text-emerald-300 font-semibold">COMPLETED</span> in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Planning, Assignment & Live Preview (5 of 12 columns) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Planning & Settings Card */}
            <div className="liquid-glass p-4 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl space-y-6 sm:space-y-7 relative z-30">
              <div className="flex items-center gap-3 pb-5 border-b border-white/10">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">Assignment & Planning</h2>
                  <p className="text-xs text-slate-400">Assign duty, set priority, and schedule deadline</p>
                </div>
              </div>

              {/* Assignee Search & Select */}
              <div className="space-y-2.5 relative z-20">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Assigned Team Member
                </label>
                <UserSearchSelect
                  users={users}
                  value={assigneeId}
                  onChange={setAssigneeId}
                  placeholder="Search and assign team member..."
                />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search by user name, email address, or role. Leave blank if unassigned.
                </p>
              </div>

              {/* Priority Selector Pills */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Priority Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {priorityOptions.map((opt) => {
                    const isSelected = priority === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriority(opt.value)}
                        className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/30 text-white border-indigo-400 shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-500/50'
                            : `${opt.color} hover:bg-white/5`
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-bold">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-300" />}
                        </div>
                        <span className="text-[10px] text-slate-400">{opt.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date Calendar Picker */}
              <div className="space-y-2.5 pt-2 relative z-10">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Target Due Date (No Past Dates)
                </label>
                <DatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  placeholder="Select deadline date..."
                />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Previous dates are strictly disabled. Timezone normalization is handled automatically.
                </p>
              </div>
            </div>

            {/* Live Interactive Task Preview Card */}
            <div className="liquid-glass p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Card Preview
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                  Status: PENDING
                </span>
              </div>

              {/* Simulated Card on Board */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/15 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${
                    priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                    priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    priority === 'LOW' ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' :
                    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {priority} Priority
                  </span>
                  
                  {dueDate ? (
                    <span className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {dueDate}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      No deadline
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2">
                  {title.trim() || 'Task Title will appear here...'}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {description.trim() || 'Task description preview will appear here as you type...'}
                </p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                      {selectedAssignee ? selectedAssignee.full_name?.charAt(0) : '?'}
                    </div>
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[150px]">
                      {selectedAssignee ? selectedAssignee.full_name : 'Unassigned'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {isCreatingNewProject ? (newProjectName ? `${newProjectName.substring(0, 4).toUpperCase()}-1` : 'NEW-1') : (projects.find(p => p.id === selectedProjectId)?.project_key || 'TASK') + '-NEW'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Bottom Action Bar with Proper Spacing */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 transition cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Inputs</span>
          </button>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              Cancel & Discard
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 sm:flex-none liquid-button px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-xl shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Creating Task...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Workspace Task</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
        </div>
      </main>

      {/* Workspace Action Modals */}
      <CreateUserModal />
    </div>
  );
};

export default CreateTaskPage;
