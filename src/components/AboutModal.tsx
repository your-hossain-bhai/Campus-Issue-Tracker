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
                Community Grievance & Real-Time Campus Resolution Hub
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
              <strong>CampusPulse</strong> is a transparent, student-led issue tracking platform designed to bridge everyday campus challenges—such as bus shortages, library timings, cafeteria food hygiene, and lab equipment—with student representatives and university authorities.
            </p>
          </div>

          {/* Core Pillars / 4 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Vote className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                1. Democratic Upvoting
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Students upvote pressing grievances. Higher upvoted issues gain visibility for student unions and university officials.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                2. Anonymous or Verified
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Submit problems either with your Student ID or anonymously to protect whistleblower privacy without fear of backlash.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                3. AI Intelligence Briefing
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Our smart AI engine analyzes issue descriptions and photos to synthesize 1-sentence Bangla briefs (Main Demand, Status, and Next Steps).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-stone-900">
                4. Real-time Status Tracker
              </h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Issues move dynamically from <strong>Pending Review</strong> to <strong>Resolved</strong> once campus administration delivers solutions.
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
              <li><strong>Browse & Filter:</strong> Search keywords (e.g. bus, library, wifi) or select sectors like Transport, Cafeteria, or Library.</li>
              <li><strong>Upvote:</strong> Click the upvote chevron on any issue to increase its priority.</li>
              <li><strong>Inspect & Summarize:</strong> Click any card to read full accounts, examine photos, and generate AI executive summaries.</li>
              <li><strong>Submit a Report:</strong> Click "+ New Issue" to post a problem with optional photo evidence.</li>
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
            <span>Report an Issue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
