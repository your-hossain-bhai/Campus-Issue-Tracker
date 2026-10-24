import React from 'react';
import {
  Megaphone,
  Search,
  Plus,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  X,
  Info,
  HelpCircle,
} from 'lucide-react';
import { IssueStatus, SortOption } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: 'ALL' | IssueStatus;
  onStatusChange: (status: 'ALL' | IssueStatus) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenCreateModal: () => void;
  onOpenAboutModal: () => void;
  pendingCount: number;
  resolvedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  sortOption,
  onSortChange,
  onOpenCreateModal,
  onOpenAboutModal,
  pendingCount,
  resolvedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner: Clickable About Bar giving overall idea about the platform */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 border-b border-stone-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-stone-300 truncate">
              Campus Issue Tracker • Real-time student voice & resolution observatory
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAboutModal}
              className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-200 hover:text-white px-2.5 py-1 rounded-full text-[11px] font-semibold border border-stone-700 transition-colors cursor-pointer shadow-xs"
              aria-label="Open About Platform section"
            >
              <Info className="w-3.5 h-3.5 text-orange-400" />
              <span>About CampusPulse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Reddit-style Navbar */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Logo & Title (IIUC Hub removed as requested) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Megaphone className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-stone-900">
                  Campus<span className="text-orange-600">Pulse</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Democratic Student Voice & AI-Powered Campus Briefings
              </p>
            </div>
          </div>

          {/* Real-time Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search campus issues, demands, or keywords (e.g. bus, library, wifi)..."
                aria-label="Search issues"
                className="w-full pl-10 pr-9 py-2 bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm rounded-full border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-hidden transition-all placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions: About & New Issue Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAboutModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-stone-200 hover:border-orange-300 hover:bg-orange-50/50 text-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              title="Learn how CampusPulse works"
            >
              <HelpCircle className="w-4 h-4 text-stone-500" />
              <span className="hidden sm:inline">About</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
              aria-label="Create new campus issue"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Issue</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Status and Sort Filters */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => onStatusChange('ALL')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedStatus === 'ALL'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Issues
            </button>
            <button
              onClick={() => onStatusChange('Pending')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedStatus === 'Pending'
                  ? 'bg-amber-100 text-amber-900 font-semibold ring-1 ring-amber-400'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending</span>
              <span className="bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => onStatusChange('Resolved')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedStatus === 'Resolved'
                  ? 'bg-emerald-100 text-emerald-900 font-semibold ring-1 ring-emerald-400'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Resolved</span>
              <span className="bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded-full text-[10px]">
                {resolvedCount}
              </span>
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1 ml-auto text-stone-500">
            <span className="text-[11px] font-medium hidden md:inline mr-1 text-stone-400">
              Sort by:
            </span>
            <button
              onClick={() => onSortChange('hot')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                sortOption === 'hot'
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Hot</span>
            </button>
            <button
              onClick={() => onSortChange('top')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                sortOption === 'top'
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
              <span>Top Voted</span>
            </button>
            <button
              onClick={() => onSortChange('newest')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                sortOption === 'newest'
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Newest</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
