import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'positive', // 'positive' | 'negative' | 'neutral'
  colorScheme = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'purple' | 'blue'
}) {
  const schemeStyles = {
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      glow: 'group-hover:border-indigo-200 group-hover:shadow-indigo-500/5',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      glow: 'group-hover:border-emerald-200 group-hover:shadow-emerald-500/5',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700',
      glow: 'group-hover:border-amber-200 group-hover:shadow-amber-500/5',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700',
      glow: 'group-hover:border-purple-200 group-hover:shadow-purple-500/5',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      badgeBg: 'bg-rose-50 text-rose-700',
      glow: 'group-hover:border-rose-200 group-hover:shadow-rose-500/5',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
      badgeBg: 'bg-blue-50 text-blue-700',
      glow: 'group-hover:border-blue-200 group-hover:shadow-blue-500/5',
    },
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.indigo;

  return (
    <div
      className={`group relative bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 ${currentScheme.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 tracking-tight">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </h3>
          </div>
        </div>
        <div
          className={`p-3 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${currentScheme.iconBg}`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500 font-medium truncate">
          {subtitle}
        </span>
        {trend && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
              trendType === 'positive'
                ? 'bg-emerald-50 text-emerald-700'
                : trendType === 'negative'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

