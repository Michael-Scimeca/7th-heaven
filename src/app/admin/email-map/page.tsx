"use client";

import React from "react";

// --- Components ---

const COLORS = {
  blue: "border-blue-500/30 bg-blue-500/5 text-blue-300",
  purple: "border-purple-500/30 bg-purple-500/5 text-purple-300",
  red: "border-red-500/30 bg-red-500/5 text-red-300",
  amber: "border-purple-500/30 bg-purple-600/5 text-purple-200",
  cyan: "border-purple-500/30 bg-cyan-500/5   ",
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
  small = false,
}: {
  label: string;
  sub?: string;
  color?: "blue" | "purple" | "red" | "amber" | "cyan" | "emerald";
  icon?: string;
  wide?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center border text-center transition-colors ${COLORS[color]} ${wide ? "px-8 py-4" : small ? "px-2 py-2" : "px-4 py-3"}`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-lg ${DOTS[color]}`} />
        <span>
          {icon && <span className="mr-1">{icon}</span>}
          {label}
        </span>
      </div>
      {sub && (
        <span className="mt-0.5 text-[var(--font-size-2xs)] text-white/20">
          {sub}
        </span>
      )}
    </div>
  );
}

function VertLine() {
  return (
    <div className="flex shrink-0 flex-col items-center py-0.5">
      <div className="h-4 w-px bg-white/[0.08]" />
      <div className="h-1 w-1 rounded-lg bg-white/[0.08]" />
      <div className="h-2 w-px bg-white/[0.08]" />
    </div>
  );
}

function Branch({ cols }: { cols: number }) {
  return (
    <div className="relative flex items-start justify-around py-3">
      <div className="absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-white/[0.08]" />
      <div
        className="absolute top-3 h-px bg-white/[0.08]"
        style={{ left: `calc(100%/${cols}/2)`, right: `calc(100%/${cols}/2)` }}
      />
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex flex-1 flex-col items-center">
          <div className="mt-3 h-3 w-px bg-white/[0.08]" />
          <div className="h-1 w-1 rounded-lg bg-white/[0.08]" />
          <div className="h-2 w-px bg-white/[0.08]" />
        </div>
      ))}
    </div>
  );
}

// --- Page ---

export default function EmailMapPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 pt-24 pb-40">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16">
          <span className="mb-6 inline-block border border-white/10 px-3 py-1">
            System Architecture
          </span>
          <h1 className="mb-6">
            Email <span className="gradient-text">Flow Map</span>
          </h1>
          <p className="max-w-2xl">
            Transactional triggers, templates, and routing logic. All emails are
            processed through the{" "}
            <code className="rounded bg-blue-500/10 px-1 text-blue-400">
              /api/email
            </code>{" "}
            bridge using Resend infrastructure.
          </p>
        </div>

        {/* Legend */}
        <div className="mb-12 flex flex-wrap items-center gap-6 border-b border-white/[0.06] pb-8">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-lg bg-purple-500" />{" "}
            Fan Transactional
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-lg bg-cyan-500" />{" "}
            Cruise System
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-lg bg-emerald-500" />{" "}
            Event Planner
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-lg bg-red-500" />{" "}
            Admin / Crew Alerts
          </span>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="min-w-[1000px]">
            {/* Entry Point */}
            <div className="flex justify-center">
              <Node
                label="EMAIL ENGINE"
                sub="src/lib/email.ts"
                icon=""
                color="blue"
                wide
              />
            </div>
            <Branch cols={4} />

            {/* Top Level Categories */}
            <div className="grid grid-cols-4 gap-4">
              {/* Category 1: Fan & Account */}
              <div className="flex flex-col items-center">
                <Node
                  label="FAN ACCOUNT"
                  sub="Auth & Fan Triggers"
                  color="purple"
                />
                <VertLine />
                <div className="w-full space-y-1">
                  <Node
                    label="WELCOME FAN"
                    sub="welcomeFan"
                    icon=""
                    color="purple"
                    small
                  />
                  <Node
                    label="FAN INVITATION"
                    sub="fanInvitation + PIN"
                    icon=""
                    color="purple"
                    small
                  />
                  <Node
                    label="RAFFLE ENTRY / WIN"
                    sub="raffleEntry / raffleWin"
                    icon=""
                    color="purple"
                    small
                  />
                  <Node
                    label="FLASH MERCH PICKUP"
                    sub="flashMerchPickup"
                    icon=""
                    color="purple"
                    small
                  />
                  <Node
                    label="FAN UPLOAD NOTIFY"
                    sub="fanUploadApproved/Rejected"
                    icon=""
                    color="purple"
                    small
                  />
                </div>
              </div>

              {/* Category 2: Cruise System */}
              <div className="flex flex-col items-center">
                <Node label="CRUISE HUB" sub="/api/cruise/*" color="cyan" />
                <VertLine />
                <div className="w-full space-y-1">
                  <Node
                    label="CRUISE CONFIRM"
                    sub="cruiseConfirmation"
                    icon=""
                    color="cyan"
                    small
                  />
                  <Node
                    label="COMMUNITY WELCOME"
                    sub="cruiseCommunityWelcome"
                    icon=""
                    color="cyan"
                    small
                  />
                  <Node
                    label="COMMUNITY BLAST"
                    sub="cruiseCommunityBlast"
                    icon=""
                    color="cyan"
                    small
                  />
                  <Node
                    label="RSVP CANCELLED"
                    sub="Token-based RSVP link"
                    icon=""
                    color="cyan"
                    small
                  />
                </div>
              </div>

              {/* Category 3: Event Planner */}
              <div className="flex flex-col items-center">
                <Node
                  label="BOOKING FLOW"
                  sub="/api/booking/*"
                  color="emerald"
                />
                <VertLine />
                <div className="w-full space-y-1">
                  <Node
                    label="REQUEST RECEIVED"
                    sub="bookingConfirmation"
                    icon=""
                    color="emerald"
                    small
                  />
                  <Node
                    label="STATUS: APPROVED"
                    sub="bookingStatusUpdate"
                    icon=""
                    color="emerald"
                    small
                  />
                  <Node
                    label="WELCOME PLANNER"
                    sub="welcomePlanner"
                    icon=""
                    color="emerald"
                    small
                  />
                  <Node
                    label="STATUS: CANCELLED"
                    sub="bookingCancelledAdminAlert"
                    icon=""
                    color="emerald"
                    small
                  />
                </div>
              </div>

              {/* Category 4: Crew & Admin */}
              <div className="flex flex-col items-center">
                <Node
                  label="CREW & ADMIN"
                  sub="Staff & Management"
                  color="red"
                />
                <VertLine />
                <div className="w-full space-y-1">
                  <Node
                    label="WELCOME CREW"
                    sub="welcomeCrew + Temp Pass"
                    icon=""
                    color="red"
                    small
                  />
                  <Node
                    label="SCHEDULE ALERT"
                    sub="scheduleChangeAlert"
                    icon=""
                    color="red"
                    small
                  />
                  <Node
                    label="SHIFT COVERAGE"
                    sub="shiftCoverageRequest"
                    icon=""
                    color="red"
                    small
                  />
                  <Node
                    label="NEW ACCOUNT ALERT"
                    sub="newAccountAdminAlert"
                    icon=""
                    color="red"
                    small
                  />
                  <Node
                    label="NEWSLETTER"
                    sub="newsletterBlast"
                    icon=""
                    color="red"
                    small
                  />
                </div>
              </div>
            </div>

            {/* Integration Points */}
            <div className="relative my-16 border-t border-white/[0.06]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050505] px-4 text-white/20 italic">
                External Services
              </span>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <Node
                  label="RESEND API"
                  sub="Transactional Delivery"
                  color="blue"
                  wide
                />
              </div>
              <div className="flex flex-col items-center">
                <Node
                  label="SUPABASE"
                  sub="User & Booking Data"
                  color="emerald"
                  wide
                />
              </div>
              <div className="flex flex-col items-center">
                <Node
                  label="DOMAIN DNS"
                  sub="DKIM / SPF / DMARC"
                  color="amber"
                  wide
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logic Cards */}
        <div className="mt-20 grid gap-4 md:grid-cols-2">
          <div className="border border-white/[0.06] bg-white/[0.02] p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-lg bg-blue-500" />
              The API Bridge
            </h3>
            <p className="mb-6">
              To keep server-side logic fast, heavy email rendering is often
              offloaded or handled via internal fetch calls to{" "}
              <code>/api/email</code>. This ensures that a database timeout
              doesn't block the user's confirmation screen.
            </p>
            <div className="rounded bg-black/40 p-4 text-blue-400">
              fetch(&apos;/api/email&apos;, &#123; method: &apos;POST&apos;,
              body: &#123; to, subject, html &#125; &#125;)
            </div>
          </div>
          <div className="border border-white/[0.06] bg-white/[0.02] p-6">
            <h3 className="mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-lg bg-cyan-500" />
              Token Security
            </h3>
            <p className="mb-6">
              Cancellation and status links use crypographic tokens stored in
              Supabase. This allows fans to manage their RSVPs or bookings
              directly from their inbox without requiring a password login every
              time.
            </p>
            <div className="rounded bg-black/40 p-4">
              URL: /cruise/cancel?token=7f9a...
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
