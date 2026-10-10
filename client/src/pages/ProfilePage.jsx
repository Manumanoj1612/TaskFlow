import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import taskService from '../services/taskService';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import { User, Mail, Calendar, LogOut, ShieldCheck, ListTodo } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await taskService.getStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load user statistics:', err);
        setError('Failed to load activity metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-4 h-4 text-slate-400" /> {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors inline-flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <ErrorMessage message={error} onClose={() => setError(null)} />

        {/* Account Details Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" /> Account Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xs font-semibold uppercase text-slate-400 mb-1">User Identifier</span>
              <span className="font-mono text-slate-700 text-xs">{user?._id}</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="block text-xs font-semibold uppercase text-slate-400 mb-1">Member Since</span>
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-500" /> {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* User Task Metrics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600" /> Task Activity Summary
          </h3>

          {loading ? (
            <LoadingState message="Calculating activity..." />
          ) : stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl text-center">
                <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">Total</span>
                <span className="text-2xl font-black text-slate-900">{stats.total}</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl text-center">
                <span className="block text-xs font-semibold text-amber-700 uppercase mb-1">Todo</span>
                <span className="text-2xl font-black text-amber-800">{stats.todo}</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <span className="block text-xs font-semibold text-blue-700 uppercase mb-1">In Progress</span>
                <span className="text-2xl font-black text-blue-800">{stats.inProgress}</span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <span className="block text-xs font-semibold text-emerald-700 uppercase mb-1">Completed</span>
                <span className="text-2xl font-black text-emerald-800">{stats.completed}</span>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
