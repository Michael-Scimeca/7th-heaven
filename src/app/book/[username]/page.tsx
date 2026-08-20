/* eslint-disable react-doctor/no-giant-component */
"use client";
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import { useMember } from "@/context/MemberContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import PlannerDashboard from "@/components/PlannerDashboard";

export default function PlannerDashboardPage() {
  const { member, isLoggedIn, hydrated, openModal, login } = useMember();
  const router = useRouter();
  const params = useParams();
  const urlUsername = typeof params?.username === 'string' ? params.username : '';
  const isDemoMode = urlUsername === 'demo';

  const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);

  // Redirect to correct username URL if logged in planner visits wrong username
  useEffect(() => {
    if (!isDemoMode && isLoggedIn && member?.username && member.username !== urlUsername) {
      router.replace(`/book/${member.username}`);
    }
  }, [isDemoMode, isLoggedIn, member, urlUsername, router]);

  // Auto-open login modal if not authenticated and not demo
  useEffect(() => {
    if (hydrated && !isDemoMode && !isLoggedIn) {
      openModal("login", "planner");
    }
  }, [hydrated, isDemoMode, isLoggedIn, openModal]);

  const effectiveMember = isDemoMode ? {
    id: 'demo-planner-001',
    name: 'Event Planner',
    email: 'planner@example.com',
    role: 'event_planner',
    signup_source: 'planner_signup',
    username: 'demo',
    avatar: 'EP'
  } as any : member;

  const displayName = effectiveMember?.name || 'Event Planner';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const isAvatarUrl = effectiveMember?.avatar && (effectiveMember.avatar.startsWith('http') || effectiveMember.avatar.startsWith('/') || effectiveMember.avatar.startsWith('data:'));
  const hasAccess = isDemoMode || (isLoggedIn && ((member?.role as string) === 'event_planner' || (member?.role as string) === 'planner' || member?.role === 'admin' || member?.role === 'crew'));

  if (!mounted) return null;

  if (!hasAccess && !isDemoMode) {
    return (
      <div className="site-container min-h-screen bg-transparent text-white pt-[130px] pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-[var(--color-accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-bold text-white/20 uppercase tracking-widest">Loading Planner Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="site-container min-h-screen bg-transparent text-white pt-[130px] pb-16 selection:bg-[var(--color-accent)] selection:text-white">
      <div>
        {/* Planner Profile Header */}
        <header className="mb-8 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex items-start gap-5">
            {/* Member Avatar */}
            <div className="relative shrink-0">
              {isAvatarUrl ? (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[var(--color-accent)]/40 shadow-[0_0_20px_rgba(146,51,234,0.2)]">
                  <Image width={80} height={80} unoptimized src={effectiveMember.avatar} alt={displayName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-900 border-2 border-[var(--color-accent)]/40 flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-[0_0_20px_rgba(146,51,234,0.2)]">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 text-[8px] font-black uppercase text-white bg-[var(--color-accent)] rounded-full shadow-md border border-[var(--color-accent)]/50">
                Planner
              </span>
            </div>

            {/* Member Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white leading-none">
                {displayName}
              </h1>
              <p className="text-[var(--color-accent)] font-bold text-xs md:text-sm tracking-widest uppercase mt-1.5">Event Planner Dashboard</p>
              <p className="text-white/40 text-xs font-mono mt-1">{effectiveMember?.email || ''}</p>
            </div>
          </div>
        </header>

        {/* Planner Dashboard Content */}
        <PlannerDashboard />
      </div>
    </div>
  );
}
