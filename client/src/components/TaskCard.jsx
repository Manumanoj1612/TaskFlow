import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Edit, Trash2, Eye, Clock, CheckCircle2 } from 'lucide-react';

const TaskCard = ({ task, onDelete, onStatusChange }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><Clock className="w-3.5 h-3.5" /> In Progress</span>;
      case 'TODO':
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Todo</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">High Priority</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Low</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-bold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors">
            <Link to={`/tasks/${task._id}`}>{task.title}</Link>
          </h3>
          {getPriorityBadge(task.priority)}
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {task.description || 'No description provided.'}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 mb-4">
          <div>{getStatusBadge(task.status)}</div>
          {task.dueDate && (
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            to={`/tasks/${task._id}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to={`/tasks/edit/${task._id}`}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Edit Task"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(task._id)}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
