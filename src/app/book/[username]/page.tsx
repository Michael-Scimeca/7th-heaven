/* eslint-disable react-doctor/no-giant-component */
"use client";
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import { useMember } from "@/context/MemberContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import PlannerDashboard from "@/components/PlannerDashboard";
import { CosmicRadialButton } from "@/components/CosmicRadialButton";
import { Plus } from "lucide-react";

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

  const handleCreateNewEvent = () => {
    const p = new URLSearchParams();
    p.set("from", "planner");
    const name = effectiveMember?.name || member?.name || "Event Planner";
    const email = effectiveMember?.email || member?.email || "planner@7thheavenband.com";
    const phone = effectiveMember?.phone || member?.phone || "(847) 555-0199";
    const organization = effectiveMember?.organization || member?.organization || "Scoreboard Entertainment";
    const venueName = effectiveMember?.venueName || "Bridges Scoreboard";
    const venueCity = effectiveMember?.venueCity || "Chicago";
    const venueState = effectiveMember?.venueState || "IL";
    const indoorOutdoor = "Outdoor";
    const expectedAttendance = "250";
    const soundSystem = "Yes — full PA system";
    const stageAvailable = "Yes";
    const loadInTime = "3:00 PM";
    const parkingAddress = "980 S Bartlett Rd, Lot B";
    const parkingNotes = "Band bus & crew truck park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd.";

    if (name) p.set("name", name);
    if (email) p.set("email", email);
    if (phone) p.set("phone", phone);
    if (organization) p.set("organization", organization);
    if (venueName) p.set("venueName", venueName);
    if (venueCity) p.set("venueCity", venueCity);
    if (venueState) p.set("venueState", venueState);
    if (indoorOutdoor) p.set("indoorOutdoor", indoorOutdoor);
    if (expectedAttendance) p.set("expectedAttendance", expectedAttendance);
    if (soundSystem) p.set("soundSystem", soundSystem);
    if (stageAvailable) p.set("stageAvailable", stageAvailable);
    if (loadInTime) p.set("loadInTime", loadInTime);
    if (parkingAddress) p.set("parkingAddress", parkingAddress);
    if (parkingNotes) p.set("parkingNotes", parkingNotes);

    router.push(`/book?${p.toString()}`);
  };

  return (
    <div className="site-container bg-transparent text-white pt-[130px] selection:bg-[var(--color-accent)] selection:text-white">
      <div>
        {/* Planner Profile Header */}
        <header className="mb-8 border-b border-white/10 pb-8 flex flex-col md:flex-row items-end md:items-end justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Member Avatar */}
            <div className="relative shrink-0">
              {isAvatarUrl ? (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-[var(--color-accent)]/40 shadow-[0_0_20px_rgba(146,51,234,0.2)]">
                  <Image width={80} height={80} unoptimized src={effectiveMember.avatar} alt={displayName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-900 border-2 border-[var(--color-accent)]/40 flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-[0_0_20px_rgba(146,51,234,0.2)]">
                  {initials}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 text-[9px] font-bold uppercase text-white bg-[var(--color-accent)] rounded-lg shadow-md border border-[var(--color-accent)]/50">
                Planner
              </span>
            </div>

            {/* Member Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase    text-white leading-none">
                {displayName}
              </h1>
              <p className="font-bold    uppercase mt-1.5">Event Planner Dashboard</p>
              <p className="   mt-1">{effectiveMember?.email || ''}</p>
            </div>
          </div>

          {/* Plus Sign Create New Event Button */}
          <div className="flex items-center self-start md:self-auto">
            <CosmicRadialButton
              icon={<Plus className="w-4 h-4 text-white" />}
              onClick={handleCreateNewEvent}
              className="px-5 py-2.5 rounded-lg font-bold uppercase  shadow-lg flex items-center gap-2 cursor-pointer"
            >
              Create New Event
            </CosmicRadialButton>
          </div>
        </header>

        {/* Planner Dashboard Content */}
        <PlannerDashboard />
      </div>
    </div>
  );
}
