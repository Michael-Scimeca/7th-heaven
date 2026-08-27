"use client";

import React from "react";

export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#07040d] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* Top Navigation Bar Skeleton */}
      <div className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
          <div className="w-40 h-5 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-8  rounded-lg  bg-white/10 animate-pulse" />
          <div className="w-9 h-9  rounded-lg  bg-purple-500/20 animate-pulse" />
        </div>
      </div>

      {/* Header Banner Skeleton */}
      <div className="px-6 py-6 border-b border-white/10 bg-gradient-to-r from-purple-950/20 via-black to-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="w-64 h-8 rounded-lg bg-white/15 animate-pulse" />
          <div className="w-96 h-4 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-10 rounded-xl bg-purple-600/30 animate-pulse" />
          <div className="w-32 h-10 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-3"
          >
            <div className="w-24 h-3 rounded bg-white/10 animate-pulse" />
            <div className="w-16 h-7 rounded bg-white/20 animate-pulse" />
            <div className="w-20 h-3 rounded bg-emerald-500/20 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Layout Skeleton */}
      <div className="flex-1 px-6 pb-12 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar Schedule Skeleton */}
        <div className="lg:col-span-1 rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
          <div className="w-36 h-5 rounded bg-white/15 animate-pulse mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-2">
              <div className="w-28 h-4 rounded bg-white/20 animate-pulse" />
              <div className="w-40 h-3 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main Dashboard Cards Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="w-48 h-6 rounded bg-white/20 animate-pulse" />
                <div className="w-20 h-6  rounded-lg  bg-white/10 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="h-24 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-24 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-24 rounded-lg bg-white/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardSkeleton;
