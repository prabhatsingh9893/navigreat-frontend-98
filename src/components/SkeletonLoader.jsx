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

export const MentorCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full hover:shadow-md transition-shadow duration-300">
    <div>
      <div className="flex items-center gap-4 mb-4">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-full ${shimmerClass}`}></div>
        {/* Name and role */}
        <div className="space-y-2 flex-1">
          <div className={`h-4 w-3/4 ${shimmerClass}`}></div>
          <div className={`h-3 w-1/2 ${shimmerClass}`}></div>
        </div>
      </div>
      {/* College and Branch */}
      <div className="space-y-2 mb-4">
        <div className={`h-3 w-5/6 ${shimmerClass}`}></div>
        <div className={`h-3 w-2/3 ${shimmerClass}`}></div>
      </div>
      {/* About */}
      <div className="space-y-1.5 mb-6">
        <div className={`h-3 w-full ${shimmerClass}`}></div>
        <div className={`h-3 w-full ${shimmerClass}`}></div>
        <div className={`h-3 w-4/5 ${shimmerClass}`}></div>
      </div>
    </div>
    {/* Buttons */}
    <div className="flex gap-3">
      <div className={`h-11 flex-1 ${shimmerClass}`}></div>
      <div className={`h-11 flex-1 ${shimmerClass}`}></div>
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
