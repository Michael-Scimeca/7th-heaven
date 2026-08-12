"use client";

import React from "react";

// --- Components ---

const COLORS = {
  blue: "border-blue-500/30 bg-blue-500/5 text-blue-300",
  purple: "border-purple-500/30 bg-purple-500/5 text-purple-300",
  red: "border-red-500/30 bg-red-500/5 text-red-300",
  amber: "border-purple-500/30 bg-purple-600/5 text-purple-200",
  cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300",
  emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
};

const DOTS = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
  amber: "bg-purple-600",
  cyan: "bg-cyan-500",
  emerald: "bg-emerald-500",
};

function Node({
  label,
  sub,
  color = "blue",
  icon,
  wide = false,
  small = false
}: {
  label: string;
  sub?: string;
  color?: "blue" | "purple" | "red" | "amber" | "cyan" | "emerald";
  icon?: string;
  wide?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`border transition-colors flex flex-col items-center justify-center text-center w-full ${COLORS[color]} ${wide ? "px-8 py-4" : small ? "px-2 py-2" : "px-4 py-3"}`}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOTS[color]}`} />
        <span className="text-xs font-black uppercase tracking-widest leading-tight">
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </span>
      </div>
      {sub && <span className="text-[var(--font-size-2xs)] text-white/20 font-mono mt-0.5">{sub}</span>}
    </div>
  );
}

function VertLine() {
  return (
    <div className="flex flex-col items-center shrink-0 py-0.5">
      <div className="w-px h-4 bg-white/[0.08]" />
      <div className="w-1 h-1 rounded-full bg-white/[0.08]" />
      <div className="w-px h-2 bg-white/[0.08]" />
    </div>
  );
}

function Branch({ cols }: { cols: number }) {
  return (
    <div className="flex justify-around items-start py-3 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-white/[0.08]" />
      <div className="absolute top-3 bg-white/[0.08] h-px" style={{ left: `calc(100%/${cols}/2)`, right: `calc(100%/${cols}/2)` }} />
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-px h-3 bg-white/[0.08] mt-3" />
          <div className="w-1 h-1 rounded-full bg-white/[0.08]" />
          <div className="w-px h-2 bg-white/[0.08]" />
        </div>
      ))}
    </div>
  );
}

// --- Page ---

export default function EmailMapPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white pt-24 pb-40 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-16">
          <span className="inline-block text-xs font-black uppercase tracking-[0.25em]  text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-3 py-1 mb-4">
            System Architecture
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Email <span className="gradient-text">Flow Map</span>
          </h1>
          <p className="text-white/40 text-sm max-w-2xl leading-relaxed">
            Transactional triggers, templates, and routing logic. All emails are processed through the <code className="text-blue-400 bg-blue-500/10 px-1 rounded">/api/email</code> bridge using Resend infrastructure.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 mb-12 text-xs font-bold uppercase tracking-widest border-b border-white/[0.06] pb-8">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Fan Transactional</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Cruise System</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Event Planner</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Admin / Crew Alerts</span>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="min-w-[1000px]">

            {/* Entry Point */}
            <div className="flex justify-center">
              <Node label="EMAIL ENGINE" sub="src/lib/email.ts" icon="" color="blue" wide />
            </div>
            <Branch cols={4} />

            {/* Top Level Categories */}
            <div className="grid grid-cols-4 gap-4">

              {/* Category 1: Fan & Account */}
              <div className="flex flex-col items-center">
                <Node label="FAN ACCOUNT" sub="Auth & Fan Triggers" color="purple" />
                <VertLine />
                <div className="space-y-1 w-full">
                  <Node label="WELCOME FAN" sub="welcomeFan" icon="" color="purple" small />
                  <Node label="FAN INVITATION" sub="fanInvitation + PIN" icon="" color="purple" small />
                  <Node label="RAFFLE ENTRY / WIN" sub="raffleEntry / raffleWin" icon="" color="purple" small />
                  <Node label="FLASH MERCH PICKUP" sub="flashMerchPickup" icon="" color="purple" small />
                  <Node label="FAN UPLOAD NOTIFY" sub="fanUploadApproved/Rejected" icon="" color="purple" small />
                </div>
              </div>

              {/* Category 2: Cruise System */}
              <div className="flex flex-col items-center">
                <Node label="CRUISE HUB" sub="/api/cruise/*" color="cyan" />
                <VertLine />
                <div className="space-y-1 w-full">
                  <Node label="CRUISE CONFIRM" sub="cruiseConfirmation" icon="" color="cyan" small />
                  <Node label="COMMUNITY WELCOME" sub="cruiseCommunityWelcome" icon="" color="cyan" small />
                  <Node label="COMMUNITY BLAST" sub="cruiseCommunityBlast" icon="" color="cyan" small />
                  <Node label="RSVP CANCELLED" sub="Token-based RSVP link" icon="" color="cyan" small />
                </div>
              </div>

              {/* Category 3: Event Planner */}
              <div className="flex flex-col items-center">
                <Node label="BOOKING FLOW" sub="/api/booking/*" color="emerald" />
                <VertLine />
                <div className="space-y-1 w-full">
                  <Node label="REQUEST RECEIVED" sub="bookingConfirmation" icon="" color="emerald" small />
                  <Node label="STATUS: APPROVED" sub="bookingStatusUpdate" icon="" color="emerald" small />
                  <Node label="WELCOME PLANNER" sub="welcomePlanner" icon="" color="emerald" small />
                  <Node label="STATUS: CANCELLED" sub="bookingCancelledAdminAlert" icon="" color="emerald" small />
                </div>
              </div>

              {/* Category 4: Crew & Admin */}
              <div className="flex flex-col items-center">
                <Node label="CREW & ADMIN" sub="Staff & Management" color="red" />
                <VertLine />
                <div className="space-y-1 w-full">
                  <Node label="WELCOME CREW" sub="welcomeCrew + Temp Pass" icon="" color="red" small />
                  <Node label="SCHEDULE ALERT" sub="scheduleChangeAlert" icon="" color="red" small />
                  <Node label="SHIFT COVERAGE" sub="shiftCoverageRequest" icon="" color="red" small />
                  <Node label="NEW ACCOUNT ALERT" sub="newAccountAdminAlert" icon="" color="red" small />
                  <Node label="NEWSLETTER" sub="newsletterBlast" icon="" color="red" small />
                </div>
              </div>

            </div>

            {/* Integration Points */}
            <div className="my-16 border-t border-white/[0.06] relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050505] px-4 text-xs uppercase tracking-widest text-white/20 font-bold italic">External Services</span>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <Node label="RESEND API" sub="Transactional Delivery" color="blue" wide />
              </div>
              <div className="flex flex-col items-center">
                <Node label="SUPABASE" sub="User & Booking Data" color="emerald" wide />
              </div>
              <div className="flex flex-col items-center">
                <Node label="DOMAIN DNS" sub="DKIM / SPF / DMARC" color="amber" wide />
              </div>
            </div>

          </div>
        </div>

        {/* Logic Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-20">
          <div className="p-6 bg-white/[0.02] border border-white/[0.06]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              The API Bridge
            </h3>
            <p className="text-white/40 text-xs leading-relaxed mb-4">
              To keep server-side logic fast, heavy email rendering is often offloaded or handled via internal fetch calls to <code className="text-white/60">/api/email</code>. This ensures that a database timeout doesn't block the user's confirmation screen.
            </p>
            <div className="bg-black/40 p-4 rounded font-mono text-xs text-blue-400">
              fetch(&apos;/api/email&apos;, &#123; method: &apos;POST&apos;, body: &#123; to, subject, html &#125; &#125;)
            </div>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/[0.06]">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              Token Security
            </h3>
            <p className="text-white/40 text-xs leading-relaxed mb-4">
              Cancellation and status links use crypographic tokens stored in Supabase. This allows fans to manage their RSVPs or bookings directly from their inbox without requiring a password login every time.
            </p>
            <div className="bg-black/40 p-4 rounded font-mono text-xs text-cyan-400">
              URL: /cruise/cancel?token=7f9a...
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
