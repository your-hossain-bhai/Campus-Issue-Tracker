import React, { useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  Flame,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { CampusIssue } from '../types';

interface TrendingIssuesWidgetProps {
  issues: CampusIssue[];
  onSelectIssue?: (issue: CampusIssue) => void;
}

export const TrendingIssuesWidget: React.FC<TrendingIssuesWidgetProps> = ({
  issues,
  onSelectIssue,
}) => {
  // Compute report growth over the last 7 days
  const chartData = useMemo(() => {
    const days = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Baseline historical distribution + active user issues
    const baseline = [3, 5, 4, 8, 11, 14, 18];

    // Count issues created within each day window
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    issues.forEach((issue) => {
      const diff = now - issue.createdAtTimestamp;
      const dayIndex = Math.floor(diff / oneDay);
      if (dayIndex >= 0 && dayIndex < 7) {
        // Map 0 -> index 6 (Today), 1 -> index 5 (Yesterday), etc.
        const targetIdx = 6 - dayIndex;
        dayCounts[targetIdx] += 1;
      } else {
        // Older than 7 days, attribute to earliest day
        dayCounts[0] += 1;
      }
    });

    return days.map((dayLabel, idx) => {
      const totalReports = baseline[idx] + dayCounts[idx];
      return {
        day: dayLabel,
        reports: totalReports,
        newToday: dayCounts[idx],
      };
    });
  }, [issues]);

  // Calculate 7-day growth rate
  const growthRate = useMemo(() => {
    if (chartData.length < 2) return '+24%';
    const start = chartData[0].reports;
    const end = chartData[chartData.length - 1].reports;
    const pct = Math.round(((end - start) / Math.max(start, 1)) * 100);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }, [chartData]);

  // Top 3 trending issues by upvotes
  const topTrending = useMemo(() => {
    return [...issues].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
  }, [issues]);

  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs space-y-3.5">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Trending Growth
            </h3>
            <span className="text-[11px] text-stone-400">Past 7 days report volume</span>
          </div>
        </div>

        {/* Growth badge */}
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ArrowUpRight className="w-3.5 h-3.5" />
          {growthRate}
        </span>
      </div>

      {/* Recharts Area Chart */}
      <div className="pt-1">
        <div className="h-32 w-full -ml-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: '#78716c' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: '#a8a29e' }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-stone-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg border border-stone-800">
                        <div className="font-semibold text-orange-400">{data.day}</div>
                        <div className="text-stone-200">
                          Total volume: <span className="font-bold text-white">{data.reports}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="reports"
                stroke="#ea580c"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#reportsGradient)"
                activeDot={{ r: 4, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trending Topics Spotlight */}
      <div className="pt-2 border-t border-stone-100 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Top Velocity Issues
          </span>
          <span className="text-[10px] text-stone-400">Upvotes</span>
        </div>

        <div className="space-y-1.5">
          {topTrending.map((issue, idx) => (
            <button
              key={issue.id}
              onClick={() => onSelectIssue && onSelectIssue(issue)}
              className="w-full text-left p-2 rounded-xl hover:bg-orange-50/60 active:bg-orange-100/60 transition-colors cursor-pointer group flex items-center justify-between gap-2 border border-transparent hover:border-orange-200/60"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 text-[11px] font-extrabold text-stone-400 group-hover:text-orange-600 shrink-0">
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-stone-800 group-hover:text-orange-600 truncate transition-colors">
                  {issue.title}
                </span>
              </div>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 group-hover:bg-orange-200/80 text-stone-700 group-hover:text-orange-900 shrink-0">
                ▲ {issue.upvotes}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
