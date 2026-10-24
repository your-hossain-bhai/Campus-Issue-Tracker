import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Inbox,
  FilterX,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatsBanner } from './components/StatsBanner';
import { IssueCard } from './components/IssueCard';
import { CreateIssueModal } from './components/CreateIssueModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { AboutModal } from './components/AboutModal';
import { INITIAL_CAMPUS_ISSUES } from './data/mockIssues';
import { CampusIssue, IssueCategory, IssueStatus, SortOption, IssueComment } from './types';

const STORAGE_KEY = 'campus_issues_data_v1';

export default function App() {
  // 1. Core State with LocalStorage Persistence
  const [issues, setIssues] = useState<CampusIssue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure comments array exists on every item
        return parsed.map((item: any) => ({
          ...item,
          comments: Array.isArray(item.comments) ? item.comments : [],
        }));
      }
    } catch (err) {
      console.warn('Could not read from localStorage:', err);
    }
    return INITIAL_CAMPUS_ISSUES;
  });

  // Filters and UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | IssueStatus>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | IssueCategory>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('hot');

  // Modals & Active Items
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CampusIssue | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist issues on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    } catch (err) {
      console.warn('Could not write to localStorage:', err);
    }
  }, [issues]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  // Upvote handling (toggles user upvote with animated increment/decrement)
  const handleUpvote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasVoted = Boolean(item.hasUserUpvoted);
          const newUpvotes = hasVoted ? item.upvotes - 1 : item.upvotes + 1;
          const updated = {
            ...item,
            upvotes: newUpvotes,
            hasUserUpvoted: !hasVoted,
          };
          if (!hasVoted) {
            showToast('Upvote recorded! Your voice amplifies campus demands.');
          }
          if (selectedIssue && selectedIssue.id === id) {
            setSelectedIssue(updated);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Append new issue to top of feed
  const handleCreateIssue = (
    newIssueData: Omit<
      CampusIssue,
      'id' | 'upvotes' | 'date' | 'createdAtTimestamp' | 'commentsCount' | 'comments'
    >
  ) => {
    const newEntry: CampusIssue = {
      ...newIssueData,
      id: `issue-${Date.now()}`,
      upvotes: 1, // Author's automatic self-vote
      date: 'Just now',
      createdAtTimestamp: Date.now(),
      commentsCount: 0,
      comments: [],
      hasUserUpvoted: true,
    };

    setIssues((prev) => [newEntry, ...prev]);
    showToast('Campus issue published successfully!');
  };

  // Add comment with author and timestamp in local state
  const handleAddComment = (
    issueId: string,
    comment: { author: string; text: string }
  ) => {
    const newComment: IssueComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: comment.author,
      text: comment.text,
      timestamp: Date.now(),
      upvotes: 0,
      hasUserUpvoted: false,
    };

    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          const updatedComments = [newComment, ...(item.comments || [])];
          const updated = {
            ...item,
            comments: updatedComments,
            commentsCount: updatedComments.length,
          };
          if (selectedIssue && selectedIssue.id === issueId) {
            setSelectedIssue(updated);
          }
          return updated;
        }
        return item;
      })
    );
    showToast('Comment posted! Your feedback is live.');
  };

  // Upvote comment
  const handleUpvoteComment = (issueId: string, commentId: string) => {
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          const updatedComments = (item.comments || []).map((c) => {
            if (c.id === commentId) {
              const hasVoted = Boolean(c.hasUserUpvoted);
              return {
                ...c,
                upvotes: hasVoted ? (c.upvotes || 1) - 1 : (c.upvotes || 0) + 1,
                hasUserUpvoted: !hasVoted,
              };
            }
            return c;
          });
          const updated = {
            ...item,
            comments: updatedComments,
          };
          if (selectedIssue && selectedIssue.id === issueId) {
            setSelectedIssue(updated);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Update existing issue (e.g. new AI summary, status toggle)
  const handleUpdateIssue = (updated: CampusIssue) => {
    setIssues((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setSelectedIssue(updated);
  };

  // Share issue handler
  const handleShareIssue = (issue: CampusIssue, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}#${issue.id}`;
    navigator.clipboard.writeText(url);
    showToast('Direct issue link copied to clipboard!');
  };

  // Filter & Sort Logic
  const filteredAndSortedIssues = useMemo(() => {
    return issues
      .filter((item) => {
        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchDesc = item.description.toLowerCase().includes(query);
          const matchAuthor = item.author.toLowerCase().includes(query);
          const matchCategory = item.category.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchAuthor && !matchCategory) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'hot') {
          // Hot: balance of upvotes and recency + comment velocity
          const scoreA = a.upvotes + ((a.comments?.length || a.commentsCount || 0) * 2);
          const scoreB = b.upvotes + ((b.comments?.length || b.commentsCount || 0) * 2);
          return scoreB - scoreA;
        }
        if (sortOption === 'top') {
          return b.upvotes - a.upvotes;
        }
        if (sortOption === 'newest') {
          return b.createdAtTimestamp - a.createdAtTimestamp;
        }
        return 0;
      });
  }, [issues, searchQuery, selectedStatus, selectedCategory, sortOption]);

  const pendingCount = issues.filter((i) => i.status === 'Pending').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* Top Sticky Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        pendingCount={pendingCount}
        resolvedCount={resolvedCount}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <StatsBanner issues={issues} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filter Indicator / Active Chips */}
            {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (
              <div className="bg-white rounded-xl p-3 border border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-stone-700">Active Filters:</span>
                  {searchQuery && (
                    <span className="bg-orange-50 text-orange-800 px-2 py-0.5 rounded-md border border-orange-200 font-medium">
                      Search: "{searchQuery}"
                    </span>
                  )}
                  {selectedCategory !== 'ALL' && (
                    <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-medium">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {selectedStatus !== 'ALL' && (
                    <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-medium">
                      Status: {selectedStatus}
                    </span>
                  )}
                  <span className="text-stone-400">
                    ({filteredAndSortedIssues.length} found)
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                  }}
                  className="text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <FilterX className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            )}

            {/* Feed Cards List */}
            {filteredAndSortedIssues.length > 0 ? (
              filteredAndSortedIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onUpvote={handleUpvote}
                  onSelect={(item) => setSelectedIssue(item)}
                  onShare={handleShareIssue}
                  onAddComment={handleAddComment}
                  onUpvoteComment={handleUpvoteComment}
                />
              ))
            ) : (
              /* Empty State */
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
                  <Inbox className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  No issues found matching your criteria
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                  {searchQuery
                    ? `No campus reports matched "${searchQuery}". Try different keywords or clear filters.`
                    : 'No issues match the selected category and status filters.'}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                      setSelectedStatus('ALL');
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Report New Issue
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <Sidebar
                issues={issues}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onSelectIssue={(item) => setSelectedIssue(item)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-stone-200 bg-white text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-stone-800">CampusPulse</span> • Democratic Campus Grievance & Resolution Platform
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <button
              onClick={() => setIsAboutModalOpen(true)}
              className="hover:text-stone-700 transition-colors font-medium cursor-pointer"
            >
              About Platform
            </button>
            <span>•</span>
            <span className="text-orange-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Issue Intelligence
            </span>
          </div>
        </div>
      </footer>

      {/* About Platform Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        onOpenCreate={() => setIsCreateModalOpen(true)}
      />

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateIssue}
      />

      {/* Issue Detail & AI View */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpvote={handleUpvote}
        onUpdateIssue={handleUpdateIssue}
        onAddComment={handleAddComment}
        onUpvoteComment={handleUpvoteComment}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-stone-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
