import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  badgeText?: string;
  badgeColor?: string;
  progressValue?: number;
  progressMax?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeColor = 'bg-blue-50 text-blue-700 border-blue-200/80',
  progressValue,
  progressMax,
}) => {
  const percentage = progressValue && progressMax ? Math.min(Math.round((progressValue / progressMax) * 100), 100) : null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight group-hover:text-blue-600 transition-colors">{value}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-normal">{subtitle}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 transition-all shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {badgeText && (
          <div className="mt-3">
            <span className={`inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
              {badgeText}
            </span>
          </div>
        )}
      </div>

      {percentage !== null && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
            <span>Usage</span>
            <span>{percentage}% ({progressValue?.toLocaleString()} / {progressMax?.toLocaleString()})</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage > 90 ? 'bg-rose-500' : 'bg-blue-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
