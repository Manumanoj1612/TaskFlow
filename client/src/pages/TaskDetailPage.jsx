import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import taskService from '../services/taskService';
import Navbar from '../components/Navbar';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, Edit, Trash2, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await taskService.getTaskById(id);
        if (res.success) {
          setTask(res.data);
        }
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError('Task not found or access unauthorized.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const res = await taskService.deleteTask(id);
        if (res.success) {
          navigate('/dashboard');
        }
      } catch (err) {
        setError('Failed to delete task.');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-4 h-4" /> Completed</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><Clock className="w-4 h-4" /> In Progress</span>;
      case 'TODO':
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Todo</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">High Priority</span>;
      case 'MEDIUM':
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Medium Priority</span>;
      case 'LOW':
      default:
        return <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">Low Priority</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <ErrorMessage message={error} onClose={() => setError(null)} />

        {loading ? (
          <LoadingState message="Loading task details..." />
        ) : task ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-3">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/tasks/edit/${task._id}`}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {task.title}
              </h1>
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {task.description || 'No detailed description provided for this task.'}
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div>
                <span className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">Due Date</span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Calendar className="w-4 h-4 text-blue-500" /> {formatDate(task.dueDate)}
                </span>
              </div>
              <div>
                <span className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">Created At</span>
                <span className="font-medium text-slate-700">{formatDate(task.createdAt)}</span>
              </div>
              <div>
                <span className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">Last Updated</span>
                <span className="font-medium text-slate-700">{formatDate(task.updatedAt)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default TaskDetailPage;
