import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import taskService from '../services/taskService';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, Edit3, PlusCircle } from 'lucide-react';

const TaskFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      const fetchTask = async () => {
        setLoading(true);
        try {
          const res = await taskService.getTaskById(id);
          if (res.success) {
            setInitialValues(res.data);
          }
        } catch (err) {
          console.error('Failed to load task details:', err);
          setError('Task not found or access unauthorized.');
        } finally {
          setLoading(false);
        }
      };

      fetchTask();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditMode) {
        const res = await taskService.updateTask(id, formData);
        if (res.success) {
          navigate('/dashboard');
        }
      } else {
        const res = await taskService.createTask(formData);
        if (res.success) {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save task. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              {isEditMode ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {isEditMode ? 'Edit Task' : 'Create New Task'}
              </h1>
              <p className="text-xs text-slate-500">
                {isEditMode ? 'Update your task details and status below.' : 'Add a new task item to your personal workspace.'}
              </p>
            </div>
          </div>
        </div>

        <ErrorMessage message={error} onClose={() => setError(null)} />

        {loading ? (
          <LoadingState message="Loading task details..." />
        ) : (
          <TaskForm
            initialValues={initialValues || {}}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            buttonText={isEditMode ? 'Update Task' : 'Create Task'}
            onCancel={() => navigate('/dashboard')}
          />
        )}
      </main>
    </div>
  );
};

export default TaskFormPage;
