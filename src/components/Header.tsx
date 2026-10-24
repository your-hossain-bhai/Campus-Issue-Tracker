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
} from 'lucide-react';
import { IssueStatus, SortOption } from '../types';
import { CampusSection } from '../types/campus';

interface HeaderProps {
  activeSection: CampusSection;
  onSectionChange: (section: CampusSection) => void;
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
  activeSection,
  onSectionChange,
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
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="min-w-0 truncate font-medium text-stone-300">
              CampusPulse • Events, clubs, opportunities & campus issues
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAboutModal}
              className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-200 hover:text-white px-2.5 py-1 rounded-full text-[11px] font-semibold border border-stone-700 transition-colors cursor-pointer shadow-xs"
              aria-label="Open About Platform section"
            >
              <Info className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">About CampusPulse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Reddit-style Navbar */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Brand */}
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
                One platform for campus life
              </p>
            </div>
          </div>

          {/* Real-time Search Bar */}
          {activeSection === 'issues' && (
            <div className="relative min-w-0 max-w-xl flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search campus issues, demands, or keywords (e.g. bus, library, wifi)..."
                aria-label="Search issues"
                className="w-full rounded-full border border-stone-200 bg-stone-100 py-2 pl-10 pr-9 text-sm text-stone-900 outline-hidden transition-all placeholder:text-stone-400 hover:bg-stone-50 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Actions: About & New Issue Button */}
          <div className="flex items-center gap-2 shrink-0">
            {activeSection === 'issues' && <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
              aria-label="Create new campus issue"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Issue</span>
              <span className="sm:hidden">Post</span>
            </button>}
          </div>
        </div>

        <nav aria-label="Main navigation" className="mt-3 flex gap-1 overflow-x-auto border-t border-stone-100 pt-2">
          {([
            ['home', 'Home'],
            ['events', 'Events'],
            ['clubs', 'Clubs'],
            ['issues', 'Campus Issues'],
            ['activities', 'My Activities'],
            ['about', 'About'],
          ] as [CampusSection, string][]).map(([section, label]) => (
            <button
              key={section}
              type="button"
              aria-current={activeSection === section ? 'page' : undefined}
              onClick={() => onSectionChange(section)}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                activeSection === section
                  ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Sub-bar: Status and Sort Filters */}
        {activeSection === 'issues' && (
        <div className="mt-2 pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
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
        )}
      </div>
    </header>
  );
};
