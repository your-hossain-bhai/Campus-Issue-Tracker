import React, { useState } from 'react';
import {
  X,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  MessageSquare,
  Clock,
  UserCheck,
  UserX,
  RefreshCw,
  Loader2,
  Tag,
  User,
  ThumbsUp,
} from 'lucide-react';
import { CampusIssue, AISummary, IssueComment } from '../types';
import { generateCampusSummary } from '../services/aiService';
import { formatTimeAgo } from '../utils/timeAgo';

interface IssueDetailModalProps {
  issue: CampusIssue | null;
  onClose: () => void;
  onUpvote: (id: string, e?: React.MouseEvent) => void;
  onUpdateIssue: (updated: CampusIssue) => void;
  onAddComment?: (issueId: string, comment: { author: string; text: string }) => void;
  onUpvoteComment?: (issueId: string, commentId: string) => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onUpvote,
  onUpdateIssue,
  onAddComment,
  onUpvoteComment,
}) => {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  if (!issue) return null;

  const commentsList = issue.comments || [];

  const handleGenerateSummary = async () => {
    setIsGeneratingAI(true);
    try {
      const summary: AISummary = await generateCampusSummary(
        `${issue.title}\n\n${issue.description}`,
        issue.imageUrl
      );

      const updated: CampusIssue = {
        ...issue,
        aiSummary: summary,
      };
      onUpdateIssue(updated);
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleToggleStatus = () => {
    const newStatus = issue.status === 'Pending' ? 'Resolved' : 'Pending';
    const updated: CampusIssue = {
      ...issue,
      status: newStatus,
    };
    onUpdateIssue(updated);
  };

  const handleCopySummary = () => {
    if (!issue.aiSummary) return;
    const textToCopy = `📋 [Campus Issue Summary - AI Briefing]\n📌 মূল দাবি: ${issue.aiSummary.main_demand}\n⚡ অবস্থা: ${issue.aiSummary.status}\n👉 পরবর্তী পদক্ষেপ: ${issue.aiSummary.next_steps}\n\n🔗 Tracked on Campus Issue Tracker`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const author = isAnonymous
      ? 'Anonymous Student'
      : authorName.trim()
      ? authorName.trim()
      : 'Student User';

    if (onAddComment) {
      onAddComment(issue.id, {
        author,
        text: commentInput.trim(),
      });
    } else {
      const newComment: IssueComment = {
        id: `c-${Date.now()}`,
        author,
        text: commentInput.trim(),
        timestamp: Date.now(),
        upvotes: 0,
      };
      const updatedComments = [newComment, ...commentsList];
      onUpdateIssue({
        ...issue,
        comments: updatedComments,
        commentsCount: updatedComments.length,
      });
    }

    setCommentInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-detail-title"
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 sm:py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Category tag */}
            <span className="font-bold px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 flex items-center gap-1 shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-orange-600" />
              {issue.category}
            </span>

            {/* Author */}
            <span className="inline-flex items-center gap-1 text-stone-600 font-medium bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
              {issue.isAnonymous ? (
                <>
                  <UserX className="w-3.5 h-3.5 text-stone-400" />
                  <span>Anonymous</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold text-stone-800">{issue.author}</span>
                </>
              )}
            </span>

            {/* Timestamp */}
            <span className="text-stone-400 inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {issue.date}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Status toggle action */}
            <button
              onClick={handleToggleStatus}
              title="Toggle issue status"
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                issue.status === 'Resolved'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              {issue.status === 'Resolved' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Resolved</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pending</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Main Title & Upvote Section */}
          <div className="flex items-start gap-4">
            <button
              onClick={(e) => onUpvote(issue.id, e)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                issue.hasUserUpvoted
                  ? 'bg-orange-500 border-orange-600 text-white shadow-md scale-105'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600'
              }`}
            >
              <ChevronUp className="w-6 h-6 stroke-[3]" />
              <span className="text-sm font-extrabold">{issue.upvotes}</span>
            </button>

            <div className="flex-1">
              <h1 id="issue-detail-title" className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                {issue.title}
              </h1>
              <p className="mt-3 text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {issue.description}
              </p>
            </div>
          </div>

          {/* Large Image Preview (if provided) */}
          {issue.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-stone-900 relative">
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full max-h-96 object-cover object-center"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg">
                Verified Campus Photographic Evidence
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* THE AI MAGIC CARD */}
          {/* ========================================================================= */}
          <section className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-purple-500/10 border-2 border-orange-400/40 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-stone-900">
                      AI Update & Summary
                    </h2>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300">
                      AI Engine
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Extracts core demands, current status & next steps in Bangla format for student leaders.
                  </p>
                </div>
              </div>

              {/* Generate / Re-generate Button */}
              <button
                onClick={handleGenerateSummary}
                disabled={isGeneratingAI}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : issue.aiSummary ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Re-analyze with AI</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Generate AI Summary</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Loading State (Shimmer & Pulsing Skeleton) */}
            {isGeneratingAI && (
              <div className="mt-3 p-5 rounded-2xl bg-white/90 border border-orange-200 space-y-3.5 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI model is processing campus issue text & image context...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-orange-100/70 rounded-md w-3/4"></div>
                  <div className="h-4 bg-orange-100/50 rounded-md w-5/6"></div>
                  <div className="h-4 bg-orange-100/40 rounded-md w-1/2"></div>
                </div>
              </div>
            )}

            {/* AI Output Display (when available) */}
            {!isGeneratingAI && issue.aiSummary && (
              <div className="mt-3 bg-white rounded-2xl p-5 border border-orange-200/80 shadow-xs space-y-4">
                {/* 1. Main Demand (মূল দাবি) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>মূল দাবি (Main Demand):</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-stone-900 leading-snug pl-3.5 border-l-2 border-orange-500">
                    {issue.aiSummary.main_demand}
                  </p>
                </div>

                {/* 2. Status (বর্তমান অবস্থা) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>বর্তমান অবস্থা (Status):</span>
                  </div>
                  <div className="pl-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                        issue.aiSummary.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {issue.aiSummary.status === 'Resolved' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resolved (মীমাংসিত)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending (বিচারাধীন / অনিষ্পন্ন)</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* 3. Next Steps (পরবর্তী পদক্ষেপ) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>পরবর্তী পদক্ষেপ (Next Steps):</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-3.5 border-l-2 border-blue-500 font-medium">
                    {issue.aiSummary.next_steps}
                  </p>
                </div>

                {/* Card Utilities: Copy & Model details */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-stone-400 text-[11px] font-mono">
                    Analysis: Verified AI Extraction
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopySummary}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">অনুলিপি সম্পন্ন!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>অনুলিপি করুন (Copy)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state if summary not yet generated */}
            {!isGeneratingAI && !issue.aiSummary && (
              <div className="mt-3 p-4 rounded-2xl bg-white/70 border border-dashed border-orange-300 text-center">
                <p className="text-xs text-stone-600 mb-2">
                  No AI executive summary generated yet for this issue. Click the button above to run AI inference.
                </p>
                <button
                  onClick={handleGenerateSummary}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-800"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Run AI Analysis Now
                </button>
              </div>
            )}
          </section>

          {/* ========================================================================= */}
          {/* EXTENDED: COMMUNITY COMMENTS SECTION WITH LOCAL STATE PERSISTENCE */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                Community Discussion & Eyewitness Updates ({commentsList.length})
              </h3>
              <span className="text-[11px] text-stone-400">Moderated student thread</span>
            </div>

            {/* Comment Form with Author Name & Timestamp */}
            <form onSubmit={handleAddComment} className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                {!isAnonymous ? (
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <User className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Your Name or Student ID (e.g. C211048)"
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-stone-300 text-xs text-stone-900 outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-stone-500 italic flex items-center gap-1">
                    <UserX className="w-3.5 h-3.5 text-stone-400" />
                    Posting as Anonymous Student
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className="text-xs text-orange-600 hover:text-orange-800 font-semibold underline cursor-pointer"
                >
                  {isAnonymous ? 'Use Name / Student ID' : 'Post Anonymously'}
                </button>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  rows={2}
                  placeholder="Share verified updates, protest location info, or administrative feedback..."
                  className="flex-1 p-3 text-xs sm:text-sm rounded-xl border border-stone-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-hidden"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="px-5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-orange-400" />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>

            {/* Comment List with Author and Timestamp */}
            <div className="space-y-3">
              {commentsList.length > 0 ? (
                commentsList.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200/90 text-xs space-y-2 shadow-2xs hover:border-stone-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-[10px]">
                          {comment.author.startsWith('Student #') ? 'ID' : 'ST'}
                        </div>
                        <span className="font-bold text-stone-900">{comment.author}</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-stone-400 font-mono text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>

                      {onUpvoteComment && (
                        <button
                          onClick={() => onUpvoteComment(issue.id, comment.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                            comment.hasUserUpvoted
                              ? 'text-orange-600 bg-orange-50 border border-orange-200'
                              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-stone-200'
                          }`}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>{comment.upvotes || 0}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-stone-700 leading-relaxed text-xs sm:text-sm pl-8">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 text-stone-500 text-xs">
                  No comments yet on this issue. Share the first update!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>Campus Issue Tracker • Community Grievance Board</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
