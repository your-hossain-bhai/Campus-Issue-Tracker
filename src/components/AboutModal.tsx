import React from 'react';
import {
  X,
  Megaphone,
  CheckCircle2,
  Sparkles,
  Vote,
  ShieldCheck,
  Camera,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreate: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenCreate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:px-7 sm:py-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Megaphone className="w-6 h-6 -rotate-12" />
            </div>
            <div>
              <h2 id="about-modal-title" className="text-xl font-extrabold tracking-tight">
                About CampusPulse
              </h2>
              <p className="text-xs text-orange-100">
                Events, clubs, opportunities & campus issues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-stone-700">
          {/* Mission statement */}
          <div>
            <h3 className="text-base font-bold text-stone-900 mb-2">
              What is CampusPulse?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              <strong>CampusPulse</strong> helps students discover campus events and clubs, keep up with sample opportunities, and report and follow practical campus issues.
            </p>
          </div>

          {/* Core Pillars / 4 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Vote className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                1. Events & Communities
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Browse sample events and clubs, save activities, and mark yourself Interested or Going on this browser.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                2. Campus Issue Tracking
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Report campus concerns, discuss updates, and follow issue statuses using the existing tracker.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                3. AI Issue Summary
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                A server-side Google GenAI key enables Bangla summaries; a clearly labeled demo fallback is available without a key.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                4. Browser-local demo
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Local votes, RSVPs, and submissions are not shared, verified, or synchronized across devices.
              </p>
            </div>
          </div>

          {/* Step-by-step How it works */}
          <div className="rounded-2xl p-4 bg-orange-50/70 border border-orange-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-900 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              How to Use CampusPulse:
            </h4>
            <ul className="text-xs text-orange-950 space-y-1.5 list-disc pl-4">
              <li><strong>Discover:</strong> Search events and clubs by topic, category, status, or date.</li>
              <li><strong>Plan:</strong> Save events, update your local RSVP, share an event, or download a calendar file.</li>
              <li><strong>Take part:</strong> Submit an event suggestion for a clearly labeled demo review flow.</li>
              <li><strong>Improve campus:</strong> Use Campus Issues to report a concern and follow community discussion.</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-7 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenCreate();
            }}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Report a Campus Issue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
