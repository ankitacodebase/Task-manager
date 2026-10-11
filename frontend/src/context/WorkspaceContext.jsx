import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../api/client';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI, Filter & Tab states
  const [currentTab, setCurrentTab] = useState('tasks'); // 'tasks' | 'team' | 'create-task'
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 10, 25, 50

  // Modals / Page state (Redirects task modal to full create-task page)
  const isTaskModalOpen = currentTab === 'create-task';
  const setIsTaskModalOpen = useCallback((open) => {
    if (open) {
      setCurrentTab('create-task');
    } else {
      setCurrentTab((prev) => (prev === 'create-task' ? 'tasks' : prev));
    }
  }, []);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await apiClient.get('/tasks');
      if (res.data?.data) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err.response?.data?.error?.message || 'Failed to load workspace tasks.');
    }
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await apiClient.get('/tasks/projects');
      if (res.data?.data) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  }, []);

  // Create project on the fly
  const createProject = useCallback(async (projectData) => {
    try {
      const res = await apiClient.post('/tasks/projects', projectData);
      await fetchProjects();
      return res.data?.data;
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  }, [fetchProjects]);

  // Fetch users (ADMIN only)
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      setUsers([]);
      return;
    }
    try {
      const res = await apiClient.get('/users');
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    }
  }, [isAdmin]);

  // Initial load when user changes
  useEffect(() => {
    let isMounted = true;
    const loadWorkspace = async () => {
      if (user) {
        setError('');
        try {
          await Promise.all([
            fetchTasks(),
            fetchProjects(),
            isAdmin ? fetchUsers() : Promise.resolve(),
          ]);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) {
          setTasks([]);
          setUsers([]);
          setProjects([]);
          setLoading(false);
        }
      }
    };
    loadWorkspace();
    return () => { isMounted = false; };
  }, [user, isAdmin, fetchTasks, fetchProjects, fetchUsers]);

  // Real-time synchronization via WebSocket and background fallback polling
  useEffect(() => {
    if (!user) return;

    let socket = null;
    let reconnectTimeout = null;
    let isSubscribed = true;

    const connectWs = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/api/v1/ws`;

        socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type) {
              fetchTasks();
            }
          } catch (e) {
            // ignore non-json messages
          }
        };

        socket.onclose = () => {
          if (isSubscribed) {
            reconnectTimeout = setTimeout(connectWs, 3000);
          }
        };

        socket.onerror = () => {
          try { socket.close(); } catch (_) {}
        };
      } catch (err) {
        if (isSubscribed) {
          reconnectTimeout = setTimeout(connectWs, 3000);
        }
      }
    };

    connectWs();

    // Resilient background polling fallback (every 4 seconds) to guarantee 100% sync
    // across all admin and user browser windows without requiring manual page refresh
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchTasks();
      }
    }, 4000);

    return () => {
      isSubscribed = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) {
        try { socket.close(); } catch (_) {}
      }
      clearInterval(pollInterval);
    };
  }, [user, fetchTasks]);

  // Actions
  const createTask = async (taskData) => {
    const res = await apiClient.post('/tasks', taskData);
    await Promise.all([fetchTasks(), fetchProjects()]);
    return res.data?.data;
  };

  const addComment = async (taskId, content) => {
    if (!content || !content.trim()) return;
    try {
      const res = await apiClient.post(`/tasks/${taskId}/comments`, { content: content.trim() });
      const newComment = res.data?.data;
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const currentComments = t.comments || [];
          return {
            ...t,
            comments: [...currentComments, newComment],
          };
        }
        return t;
      }));
      return newComment;
    } catch (err) {
      console.error('Failed to post comment:', err);
      throw err;
    }
  };

  const updateTaskStatus = async (taskId, newStatus, note = null) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const payload = { status: newStatus };
      if (note && note.trim()) {
        payload.note = note.trim();
      }
      await apiClient.patch(`/tasks/${taskId}/status`, payload);
      await fetchTasks();
    } catch (err) {
      console.error('Status transition failed:', err);
      await fetchTasks(); // rollback on failure
      throw err;
    }
  };

  const assignTask = async (taskId, assigneeId) => {
    try {
      await apiClient.patch(`/tasks/${taskId}/assign`, { assignee_id: assigneeId });
      await fetchTasks();
    } catch (err) {
      console.error('Task assignment failed:', err);
      await fetchTasks();
      throw err;
    }
  };

  const updateTask = async (taskId, payload) => {
    const res = await apiClient.patch(`/tasks/${taskId}/status`, payload);
    await fetchTasks();
    return res.data?.data;
  };

  const deleteTask = async (taskId) => {
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await apiClient.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error('Task deletion failed:', err);
      await fetchTasks();
      throw err;
    }
  };

  const claimTask = async (taskId) => {
    if (!user) return;
    await updateTask(taskId, { assignee_id: user.id });
  };

  const inviteUser = async (userData) => {
    const res = await apiClient.post('/users', userData);
    await fetchUsers();
    return res.data?.data;
  };

  // Metrics computation
  const metrics = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
      done: tasks.filter(t => t.status === 'DONE').length,
    };
  }, [tasks]);

  // Filtered tasks computation with Project separation
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (selectedStatus !== 'ALL' && task.status !== selectedStatus) return false;
      if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) return false;
      if (selectedProject !== 'ALL' && task.project_id !== selectedProject) return false;
      if (isAdmin && selectedAssignee !== 'ALL') {
        if (selectedAssignee === 'UNASSIGNED') {
          if (task.assignee_id) return false;
        } else if (task.assignee_id !== selectedAssignee) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesAssignee = task.assignee_name?.toLowerCase().includes(query);
        const matchesProject = task.project_name?.toLowerCase().includes(query);
        const matchesKey = task.task_key?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesAssignee && !matchesProject && !matchesKey) return false;
      }
      return true;
    });
  }, [tasks, selectedStatus, selectedPriority, selectedAssignee, selectedProject, searchQuery, isAdmin]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedPriority, selectedAssignee, selectedProject, searchQuery]);

  // Paginated tasks computation
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(start, start + itemsPerPage);
  }, [filteredTasks, currentPage, itemsPerPage]);

  const value = {
    tasks,
    users,
    projects,
    loading,
    error,
    metrics,
    filteredTasks,
    paginatedTasks,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
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
    currentTab,
    setCurrentTab,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isUserModalOpen,
    setIsUserModalOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    fetchTasks,
    fetchProjects,
    createProject,
    fetchUsers,
    createTask,
    addComment,
    updateTaskStatus,
    assignTask,
    updateTask,
    deleteTask,
    claimTask,
    inviteUser,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext;
