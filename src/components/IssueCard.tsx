import React, { useState } from 'react';
import {
  ChevronUp,
  MessageSquare,
  Sparkles,
  Share2,
  Clock,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Send,
  ChevronDown,
  User,
} from 'lucide-react';
import { CampusIssue, IssueComment } from '../types';
import { formatTimeAgo } from '../utils/timeAgo';

interface IssueCardProps {
  issue: CampusIssue;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onSelect: (issue: CampusIssue) => void;
  onShare: (issue: CampusIssue, e: React.MouseEvent) => void;
  onAddComment?: (issueId: string, comment: { author: string; text: string }) => void;
  onUpvoteComment?: (issueId: string, commentId: string) => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onUpvote,
  onSelect,
  onShare,
  onAddComment,
  onUpvoteComment,
}) => {
  const isPending = issue.status === 'Pending';
  const [showInlineComments, setShowInlineComments] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [commentText, setCommentText] = useState('');

  const commentsList = issue.comments || [];
  const count = commentsList.length;

  const handleInlineSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentText.trim()) return;

    const author = isAnonymous
      ? 'Anonymous Student'
      : authorName.trim()
      ? authorName.trim()
      : 'Student User';

    if (onAddComment) {
      onAddComment(issue.id, {
        author,
        text: commentText.trim(),
      });
    }

    setCommentText('');
  };

  return (
    <article
      onClick={() => onSelect(issue)}
      className="group bg-white rounded-2xl border border-stone-200/90 hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col relative"
      tabIndex={0}
      role="button"
      aria-label={`View issue: ${issue.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(issue);
        }
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Reddit-style Upvote Left Gutter */}
        <div
          className="hidden sm:flex flex-col items-center justify-start p-3 bg-stone-50/70 border-r border-stone-100 w-14 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => onUpvote(issue.id, e)}
            aria-label={issue.hasUserUpvoted ? 'Remove upvote' : 'Upvote issue'}
            className={`p-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
              issue.hasUserUpvoted
                ? 'bg-orange-500 text-white shadow-xs scale-105'
                : 'text-stone-500 hover:bg-orange-100 hover:text-orange-600'
            }`}
          >
            <ChevronUp className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span
            className={`text-xs font-bold my-1 tracking-tight ${
              issue.hasUserUpvoted ? 'text-orange-600 font-extrabold' : 'text-stone-700'
            }`}
          >
            {issue.upvotes}
          </span>
        </div>

        {/* Main Card Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Card Meta Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-stone-500">
                {/* Category pill */}
                <span className="font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px]">
                  {issue.category}
                </span>

                {/* Author badge */}
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600">
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

                <span className="text-stone-300">•</span>

                {/* Timestamp */}
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                  <Clock className="w-3 h-3" />
                  {issue.date}
                </span>
              </div>

              {/* Status Badge */}
              <div>
                {isPending ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Pending Review
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Resolved
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors leading-snug mb-1.5">
              {issue.title}
            </h2>

            {/* Description snippet */}
            <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
              {issue.description}
            </p>
          </div>

          {/* Optional Image Preview thumbnail */}
          {issue.imageUrl && (
            <div className="mt-3 relative rounded-xl overflow-hidden bg-stone-100 max-h-48 border border-stone-100">
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-36 sm:h-44 object-cover group-hover:scale-[1.01] transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> Photo Attached
              </div>
            </div>
          )}

          {/* Card Footer Actions */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Mobile Upvote Button */}
            <div className="flex sm:hidden items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => onUpvote(issue.id, e)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  issue.hasUserUpvoted
                    ? 'bg-orange-500 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-orange-50'
                }`}
              >
                <ChevronUp className="w-4 h-4" />
                <span>{issue.upvotes}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 text-stone-500">
              {/* Comment Toggle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInlineComments(!showInlineComments);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  showInlineComments
                    ? 'bg-orange-100 text-orange-800'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
                aria-label="Toggle comments"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{count} {count === 1 ? 'comment' : 'comments'}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    showInlineComments ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <button
                onClick={(e) => onShare(issue, e)}
                className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 transition-colors p-1"
                aria-label="Share issue link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* AI Intelligence badge */}
            <div className="flex items-center gap-1.5 ml-auto">
              {issue.aiSummary ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  AI Summary Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Generate AI Summary
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXTENDED: INLINE COMMENT SECTION ON CARD */}
      {/* ========================================================================= */}
      {showInlineComments && (
        <div
          className="bg-stone-50/80 border-t border-stone-200 p-4 sm:p-5 space-y-3 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-xs font-bold text-stone-700">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-orange-600" />
              Comments & Student Voices ({commentsList.length})
            </span>
            <button
              onClick={() => onSelect(issue)}
              className="text-orange-600 hover:text-orange-800 text-[11px] font-semibold hover:underline"
            >
              Open Full Modal →
            </button>
          </div>

          {/* Quick Comment Input Form */}
          <form
            onSubmit={handleInlineSubmitComment}
            className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {!isAnonymous ? (
                <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your Name or Student ID"
                    className="w-full px-2 py-1 bg-stone-50 rounded-md border border-stone-200 text-xs text-stone-800 outline-hidden focus:border-orange-500"
                  />
                </div>
              ) : (
                <span className="text-[11px] text-stone-500 italic">
                  Posting as Anonymous Student
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className="text-[11px] text-stone-500 hover:text-stone-800 font-medium underline"
              >
                {isAnonymous ? 'Use Name / Student ID' : 'Post Anonymously'}
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment or eyewitness note..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-hidden"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {commentsList.length > 0 ? (
              commentsList.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-3 rounded-xl border border-stone-200/70 text-xs space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-900">{c.author}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-400 font-mono">
                        {formatTimeAgo(c.timestamp)}
                      </span>
                    </div>
                    {onUpvoteComment && (
                      <button
                        onClick={() => onUpvoteComment(issue.id, c.id)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                          c.hasUserUpvoted
                            ? 'text-orange-600 bg-orange-50'
                            : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        ▲ {c.upvotes || 0}
                      </button>
                    )}
                  </div>
                  <p className="text-stone-700 leading-relaxed text-xs">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-stone-400 text-center py-2 italic">
                No comments yet. Be the first to share an update!
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
