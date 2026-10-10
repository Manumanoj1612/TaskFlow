import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import taskService from '../services/taskService';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import TaskCard from '../components/TaskCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  ListTodo
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0, highPriority: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, statsRes] = await Promise.all([
        taskService.getTasks(),
        taskService.getStats()
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load tasks or statistics. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const res = await taskService.deleteTask(id);
        if (res.success) {
          fetchData();
        }
      } catch (err) {
        setError('Failed to delete task.');
      }
    }
  };

  // Filter & Search Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here is an overview of your current tasks and active work items.
            </p>
          </div>

          <Link
            to="/tasks/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create New Task
          </Link>
        </div>

        <ErrorMessage message={error} onClose={() => setError(null)} />

        {/* KPI Statistics Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard title="Total Tasks" count={stats.total} icon={ListTodo} color="blue" />
          <StatsCard title="Todo" count={stats.todo} icon={CheckSquare} color="amber" />
          <StatsCard title="In Progress" count={stats.inProgress} icon={Clock} color="indigo" />
          <StatsCard title="Completed" count={stats.completed} icon={CheckCircle} color="emerald" />
          <StatsCard title="High Priority" count={stats.highPriority} icon={AlertTriangle} color="rose" />
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or content..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">LOW Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="HIGH">HIGH Priority</option>
            </select>
          </div>
        </div>

        {/* Task Grid / Content State */}
        {loading ? (
          <LoadingState message="Fetching your task workspace..." />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title={searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' ? 'No matching tasks' : 'No tasks created yet'}
            description={
              searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter selections.'
                : 'Click the button below to add your first task to TaskFlow.'
            }
            actionButton={
              <Link
                to="/tasks/new"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create Task
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => (
              <TaskCard key={task._id} task={task} onDelete={handleDeleteTask} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
