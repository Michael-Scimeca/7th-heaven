"use client";

import React from "react";

export function AdminDashboardSkeleton() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#07040d] select-none">
      {/* Top Navigation Bar Skeleton */}
      <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-black/40 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-white/10" />
          <div className="h-5 w-40 animate-pulse bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-white/10" />
          <div className="bg- purple-white/20 h-11 w-11 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* Header Banner Skeleton */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-purple-950/20 via-black to-purple-950/20 px-6 py-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-white/15" />
          <div className="h-4 w-96 animate-pulse bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 animate-pulse rounded-xl bg-purple-600/30" />
          <div className="h-10 w-32 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md"
          >
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-7 w-16 animate-pulse rounded bg-white/20" />
            <div className="h-3 w-20 animate-pulse rounded bg-emerald-500/20" />
          </div>
        ))}
      </div>

      {/* Main Content Layout Skeleton */}
      <div className="grid flex-1 grid-cols-1 gap-6 px-6 pb-12 lg:grid-cols-4">
        {/* Left Sidebar Schedule Skeleton */}
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 lg:col-span-1">
          <div className="mb-6 h-5 w-36 animate-pulse rounded bg-white/15" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <div className="h-4 w-28 animate-pulse rounded bg-white/20" />
              <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>

        {/* Main Dashboard Cards Skeleton */}
        <div className="space-y-6 lg:col-span-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="h-6 w-48 animate-pulse rounded bg-white/20" />
                <div className="h-6 w-20 animate-pulse rounded-lg bg-white/10" />
              </div>
              <div className="grid grid-cols-1 gap-6 pt-2 sm:grid-cols-3">
                <div className="h-24 animate-pulse rounded-lg bg-white/5" />
                <div className="h-24 animate-pulse rounded-lg bg-white/5" />
                <div className="h-24 animate-pulse rounded-lg bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardSkeleton;
