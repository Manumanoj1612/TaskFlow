import React from 'react';
import { ClipboardList } from 'lucide-react';

const EmptyState = ({ title = 'No tasks found', description = 'Get started by creating a new task or adjust your search filters.', actionButton = null }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm my-4">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
        <ClipboardList className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
