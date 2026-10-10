import React from 'react';

const StatsCard = ({ title, count, icon: Icon, color = 'blue' }) => {
  const colorStyles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
  }[color] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };

  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm transition-all hover:shadow-md flex items-center justify-between ${colorStyles.border}`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h4 className="text-2xl font-extrabold text-slate-900">{count ?? 0}</h4>
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg ${colorStyles.bg} ${colorStyles.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatsCard;
