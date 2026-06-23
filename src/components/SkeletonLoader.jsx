import React from 'react';

// Shimmer helper class using Tailwind's animate-pulse and matching theme colors
const shimmerClass = "animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg";

export const MetricSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
    <div className="space-y-3 w-2/3">
      <div className={`h-4 w-1/2 ${shimmerClass}`}></div>
      <div className={`h-8 w-3/4 ${shimmerClass}`}></div>
    </div>
    <div className={`w-12 h-12 rounded-xl ${shimmerClass}`}></div>
  </div>
);

// Mirrors the real MentorsPage card (image header + body) so there's no
// layout shift when the data swaps in.
export const MentorCardSkeleton = () => (
  <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm">
    {/* Image header */}
    <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-700" />
    {/* Body */}
    <div className="p-6 space-y-4">
      <div className={`h-6 w-28 ${shimmerClass}`}></div>
      <div className="space-y-2">
        <div className={`h-3 w-full ${shimmerClass}`}></div>
        <div className={`h-3 w-4/5 ${shimmerClass}`}></div>
      </div>
      <div className={`h-11 w-full rounded-xl ${shimmerClass}`}></div>
    </div>
  </div>
);

export const SessionRowSkeleton = () => (
  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50">
    <div className="flex items-center gap-4 flex-1">
      <div className={`w-12 h-12 rounded-full ${shimmerClass}`}></div>
      <div className="space-y-2 flex-1">
        <div className={`h-4 w-1/4 ${shimmerClass}`}></div>
        <div className={`h-3 w-1/3 ${shimmerClass}`}></div>
      </div>
    </div>
    <div className={`w-24 h-9 ${shimmerClass}`}></div>
  </div>
);
