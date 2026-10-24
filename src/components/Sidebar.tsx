import React from 'react';
import {
  Bus,
  BookOpen,
  Coffee,
  GraduationCap,
  Wrench,
  FileText,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  Users,
} from 'lucide-react';
import { CampusIssue, IssueCategory } from '../types';
import { TrendingIssuesWidget } from './TrendingIssuesWidget';

interface SidebarProps {
  issues: CampusIssue[];
  selectedCategory: 'ALL' | IssueCategory;
  onSelectCategory: (category: 'ALL' | IssueCategory) => void;
  onOpenCreateModal: () => void;
  onSelectIssue?: (issue: CampusIssue) => void;
}

const CATEGORIES: { label: 'ALL' | IssueCategory; name: string; icon: React.ReactNode; color: string }[] = [
  { label: 'ALL', name: 'All Categories', icon: <GraduationCap className="w-4 h-4" />, color: 'text-stone-700' },
  { label: 'Transport', name: 'Bus & Transport', icon: <Bus className="w-4 h-4" />, color: 'text-blue-600' },
  { label: 'Library', name: 'Library & Reading Room', icon: <BookOpen className="w-4 h-4" />, color: 'text-purple-600' },
  { label: 'Cafeteria', name: 'Cafeteria & Water', icon: <Coffee className="w-4 h-4" />, color: 'text-amber-600' },
  { label: 'Facilities', name: 'Lab, Wi-Fi & Electricity', icon: <Wrench className="w-4 h-4" />, color: 'text-emerald-600' },
  { label: 'Facilities & maintenance', name: 'Facilities & Maintenance', icon: <Wrench className="w-4 h-4" />, color: 'text-emerald-600' },
  { label: 'Internet & technology', name: 'Internet & Technology', icon: <Wrench className="w-4 h-4" />, color: 'text-blue-600' },
  { label: 'Academic services', name: 'Academic Services', icon: <GraduationCap className="w-4 h-4" />, color: 'text-indigo-600' },
  { label: 'Safety & accessibility', name: 'Safety & Accessibility', icon: <ShieldCheck className="w-4 h-4" />, color: 'text-rose-600' },
  { label: 'Student services', name: 'Student Services', icon: <Users className="w-4 h-4" />, color: 'text-violet-600' },
  { label: 'Administration', name: 'Fees & Registration', icon: <FileText className="w-4 h-4" />, color: 'text-indigo-600' },
  { label: 'Other campus concerns', name: 'Other Campus Concerns', icon: <FileText className="w-4 h-4" />, color: 'text-stone-600' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  issues,
  selectedCategory,
  onSelectCategory,
  onOpenCreateModal,
  onSelectIssue,
}) => {
  return (
    <aside className="space-y-4">
      {/* 1. Category Navigation (Reddit subreddit-style) */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 px-1">
          Campus Sectors
        </h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => onSelectCategory(cat.label)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-orange-50 text-orange-900 font-bold border border-orange-200 shadow-xs'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={cat.color}>{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenCreateModal}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-stone-900 hover:bg-stone-800 active:bg-black text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-orange-400" />
          <span>Report Campus Issue</span>
        </button>
      </div>

      {/* 2. Trending Issues & 7-Day Growth Widget (Recharts) */}
      <TrendingIssuesWidget issues={issues} onSelectIssue={onSelectIssue} />

      {/* 3. AI Engine Info Box */}
      <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 p-4 text-white shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-lg bg-white/10 p-1.5 text-emerald-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            AI Issue Summaries
          </span>
        </div>
        <p className="text-xs text-stone-300 leading-relaxed">
          When a server-side API key is configured, summaries use Google GenAI. A clearly labeled demo fallback is used otherwise.
        </p>
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
          <span>Server-side API key optional</span>
          <span className="text-emerald-400 flex items-center gap-1 font-mono">Demo fallback ready</span>
        </div>
      </div>

      {/* 4. Campus Guidelines Card */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs text-xs text-stone-600">
        <div className="flex items-center gap-2 font-bold text-stone-900 mb-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Posting Code of Conduct</span>
        </div>
        <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-[11px] text-stone-500">
          <li>Never post personal phone numbers or private data.</li>
          <li>Attach real photo evidence from campus premises.</li>
          <li>Focus on collective welfare (buses, halls, labs).</li>
          <li>Mark as Resolved once administration delivers.</li>
        </ol>
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
          <span>Campus Community Board</span>
          <span className="font-semibold text-stone-700">Demo community board</span>
        </div>
      </div>
    </aside>
  );
};
