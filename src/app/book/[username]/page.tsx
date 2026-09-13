/* eslint-disable react-doctor/no-giant-component */
"use client";
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import { useMember } from "@/context/MemberContext";
import { useRouter, useParams } from "next/navigation";
import { useTransition } from "@/context/TransitionContext";
import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import PlannerDashboard from "@/components/PlannerDashboard";
import { CosmicRadialButton } from "@/components/CosmicRadialButton";
import { Plus } from "lucide-react";
import MemberHeaderBadge from "@/components/MemberHeaderBadge";

export default function PlannerDashboardPage() {
  const { member, isLoggedIn, hydrated, openModal, login } = useMember();
  const router = useRouter();
  const { requestTransition } = useTransition();
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

    requestTransition(`/book?${p.toString()}`);
  };

  return (
    <div className="site-container text-white pt-[100px] selection:bg-[var(--color-accent)] selection:text-white">
      <div>
        {/* Planner Profile Header */}
        <header className="mb-8 border-b border-white/10 pb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <MemberHeaderBadge
 name={displayName}
 email={effectiveMember?.email || ''}
 avatar={effectiveMember?.avatar}
 badgeLabel="PLANNER"
 badgeColorClass="bg-purple-600/70 border-purple-400/50 text-purple-200"
 subtitle="Manage upcoming event bookings, venue logistics, and show requests."
 />

          {/* Plus Sign Create New Event Button */}
          <div className="flex items-center self-start md:self-auto">
            <CosmicRadialButton
 icon={<Plus className="w-4 h-4 text-white" />}
              onClick={handleCreateNewEvent}
              className="px-5 py-2.5 rounded-lg uppercase flex items-center gap-2 cursor-pointer">
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
