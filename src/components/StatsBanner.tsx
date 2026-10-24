import React from 'react';
import { CheckCircle2, Clock, ThumbsUp, Building2 } from 'lucide-react';
import { CampusIssue } from '../types';

interface StatsBannerProps {
  issues: CampusIssue[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ issues }) => {
  const total = issues.length;
  const resolved = issues.filter((i) => i.status === 'Resolved').length;
  const pending = issues.filter((i) => i.status === 'Pending').length;
  const totalUpvotes = issues.reduce((acc, curr) => acc + curr.upvotes, 0);
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-600" />
            Campus Issue Observatory
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Campus issue feed with browser-local demo data. Votes and comments are not verified student identities or shared live.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
          <div className="bg-stone-50 rounded-xl p-2 border border-stone-100">
            <span className="block text-base font-extrabold text-stone-900">{total}</span>
            <span className="text-[11px] text-stone-500 font-medium">Reported</span>
          </div>
          <div className="bg-amber-50 rounded-xl p-2 border border-amber-100">
            <span className="block text-base font-extrabold text-amber-700 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {pending}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Pending</span>
          </div>
          <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100">
            <span className="block text-base font-extrabold text-emerald-700 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {resolved}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Resolved</span>
          </div>
          <div className="bg-orange-50 rounded-xl p-2 border border-orange-100">
            <span className="block text-base font-extrabold text-orange-700 flex items-center justify-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" /> {totalUpvotes}
            </span>
            <span className="text-[11px] text-orange-700 font-medium">Upvotes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
