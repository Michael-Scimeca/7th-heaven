"use client";

import { useState } from "react";
import { useMember } from "@/context/MemberContext";
import Link from "next/link";

interface Attendee {
  id: string;
  status: string;
  checked_in_at: string | null;
  profiles: {
    id: string;
    full_name: string;
    profile_photo_url: string | null;
    tier: string;
  };
}

interface Show {
  id: string;
  venue_name: string;
  city: string;
  state: string;
  date: string;
  time: string;
  doors_time: string | null;
  all_ages: boolean | null;
  cover: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
}

const tierColors: Record<string, string> = {
  Bronze: "border-amber-700/40 text-amber-600",
  Silver: "border-slate-400/40 text-slate-300",
  Gold: "border-yellow-500/40 text-yellow-400",
  Platinum: "border-purple-500/40 text-purple-400",
};
const tierGlow: Record<string, string> = {
  Gold: "shadow-[0_0_12px_rgba(234,179,8,0.2)]",
  Platinum: "shadow-[0_0_12px_rgba(168,85,247,0.2)]",
};

export default function ShowPageClient({
  show,
  initialAttendees,
}: {
  show: Show;
  initialAttendees: Attendee[];
}) {
  const { member, isLoggedIn, openModal } = useMember();
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const myAttendee = attendees.find((a) => a.profiles?.id === member?.id);
  const isGoing = !!myAttendee;
  const goingCount = attendees.filter((a) => a.status === "going" || a.status === "there").length;
  const checkedInCount = attendees.filter((a) => a.status === "there").length;

  const showDate = new Date(show.date + "T12:00:00");
  const isPast = showDate < new Date();
  const dateStr = showDate.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const mapsUrl = show.latitude && show.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${show.latitude},${show.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue_name} ${show.city} ${show.state}`)}`;

  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : `https://7thheavenband.com/shows/${show.id}`;

  const handleRsvp = async () => {
    if (!isLoggedIn) { openModal("login"); return; }
    setRsvpLoading(true);
    if (isGoing) {
      await fetch(`/api/proximity/attendees?showId=${show.id}`, { method: "DELETE" });
      setAttendees((prev) => prev.filter((a) => a.profiles?.id !== member?.id));
    } else {
      await fetch("/api/proximity/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showId: show.id, status: "going" }),
      });
      // Re-fetch attendees
      const res = await fetch(`/api/proximity/attendees?showId=${show.id}`);
      const data = await res.json();
      setAttendees(data.attendees || []);
    }
    setRsvpLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-[72px]">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#0d0718] to-[#050505] border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(133,29,239,0.2)_0%,_transparent_60%)]" />
        <div className="site-container py-16 md:py-24 relative z-10">
          {/* Back link */}
          <Link href="/tour" className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors mb-8 font-bold">
            ← All Shows
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              {/* Status badge */}
              <div className="flex items-center gap-3 mb-4">
                {isPast ? (
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-white/30 border border-white/10 px-3 py-1">Past Show</span>
                ) : show.status === "live" ? (
                  <span className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] font-bold text-red-400 border border-red-500/30 px-3 py-1 bg-red-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Happening Now
                  </span>
                ) : (
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-purple-400 border border-purple-500/30 px-3 py-1 bg-purple-500/5">Upcoming Show</span>
                )}
                {goingCount > 0 && (
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-white/40">
                    {goingCount} fan{goingCount !== 1 ? "s" : ""} going
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none mb-3">
                {show.venue_name}
              </h1>
              <p className="text-lg text-white/50">
                {show.city}{show.state ? `, ${show.state}` : ""}
              </p>
              <p className="text-sm text-white/35 mt-1">{dateStr}</p>

              {/* Show detail pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {show.doors_time && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                    🚪 Doors {show.doors_time}
                  </span>
                )}
                {show.time && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                    🎸 Show {show.time}
                  </span>
                )}
                {show.all_ages !== null && (
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 border text-[0.65rem] font-bold uppercase tracking-widest ${
                    show.all_ages
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}>
                    {show.all_ages ? "✅ All Ages" : "🔞 21+"}
                  </span>
                )}
                {show.cover && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                    💵 Cover: {show.cover}
                  </span>
                )}
                {!show.doors_time && !show.time && show.all_ages === null && !show.cover && (
                  <span className="text-[0.6rem] text-white/20 italic">Show details coming soon</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {!isPast && (
                <button
                  onClick={handleRsvp}
                  disabled={rsvpLoading}
                  id="rsvp-btn"
                  className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer ${
                    isGoing
                      ? "bg-white/10 text-white border border-white/20 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
                      : "bg-[var(--color-accent)] text-white hover:brightness-110 shadow-[0_0_30px_rgba(133,29,239,0.4)]"
                  }`}
                >
                  {rsvpLoading ? "…" : isGoing ? "✓ I'm Going (tap to cancel)" : "🎸 I'm Going"}
                </button>
              )}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="directions-btn"
                className="px-6 py-4 text-sm font-black uppercase tracking-widest border border-white/10 text-white/60 hover:border-white/30 hover:text-white transition-all text-center"
              >
                📍 Directions
              </a>
              <button
                onClick={copyLink}
                id="share-show-btn"
                className="px-6 py-4 text-sm font-black uppercase tracking-widest border border-white/10 text-white/60 hover:border-white/30 hover:text-white transition-all"
              >
                {copied ? "✓ Copied!" : "🔗 Share"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendees */}
      <div className="site-container py-16">
        <div className="max-w-[900px] mx-auto">

          {/* Count banner */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {goingCount > 0 ? `${goingCount} Fan${goingCount !== 1 ? "s" : ""} Going` : "Be the First to RSVP"}
              </h2>
              {checkedInCount > 0 && (
                <p className="text-sm text-emerald-400 mt-1 font-bold">{checkedInCount} already checked in</p>
              )}
            </div>
            {!isLoggedIn && (
              <button
                onClick={() => openModal("signup")}
                className="px-6 py-3 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[0.7rem] font-black uppercase tracking-widest hover:bg-purple-600/30 transition-all"
              >
                Join to RSVP →
              </button>
            )}
          </div>

          {goingCount === 0 ? (
            <div className="py-24 flex flex-col items-center border border-white/[0.06] bg-white/[0.01]">
              <span className="text-5xl mb-4 opacity-20">🎸</span>
              <p className="text-white/40 font-bold text-lg">Nobody&apos;s RSVPed yet.</p>
              <p className="text-white/20 text-sm mt-2">Be the first — tap &ldquo;I&apos;m Going&rdquo; above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {attendees.map((a) => {
                const isMe = a.profiles?.id === member?.id;
                const tier = a.profiles?.tier || "Bronze";
                const initials = a.profiles?.full_name
                  ?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-4 p-4 border transition-all ${
                      isMe
                        ? "border-purple-500/40 bg-purple-500/5"
                        : `border-white/[0.06] bg-white/[0.02] hover:border-white/10 ${tierGlow[tier] || ""}`
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-black text-base border-2 ${tierColors[tier] || "border-white/10 text-white/60"} bg-white/[0.04]`}>
                      {a.profiles?.profile_photo_url ? (
                        <img src={a.profiles.profile_photo_url} alt={a.profiles.full_name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        initials
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">
                        {a.profiles?.full_name || "Fan"}
                        {isMe && <span className="ml-2 text-[0.5rem] uppercase tracking-widest text-purple-400 font-black">You</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tier !== "Bronze" && (
                          <span className={`text-[0.45rem] font-black uppercase tracking-widest ${tierColors[tier]?.split(" ")[1] || "text-white/30"}`}>{tier}</span>
                        )}
                        {a.status === "there" && (
                          <span className="text-[0.45rem] font-black uppercase tracking-widest text-emerald-400">✓ Checked In</span>
                        )}
                        {a.status === "going" && (
                          <span className="text-[0.45rem] font-black uppercase tracking-widest text-white/25">Going</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Share CTA */}
          {!isPast && (
            <div className="mt-16 p-8 bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-white/40 text-sm mb-2">Know someone who might be going?</p>
              <p className="text-white font-bold text-lg mb-6">Share this show page</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={copyLink}
                  className="px-6 py-3 bg-purple-600 text-white text-[0.7rem] font-black uppercase tracking-widest hover:bg-purple-500 transition-all"
                >
                  {copied ? "✓ Link Copied!" : "🔗 Copy Link"}
                </button>
                <a
                  href={`sms:?body=${encodeURIComponent(`7th Heaven is playing at ${show.venue_name} in ${show.city}! I'm going — see who else is: ${shareUrl}`)}`}
                  className="px-6 py-3 border border-white/10 text-white/50 text-[0.7rem] font-black uppercase tracking-widest hover:border-white/30 hover:text-white transition-all"
                >
                  💬 Text a Friend
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
