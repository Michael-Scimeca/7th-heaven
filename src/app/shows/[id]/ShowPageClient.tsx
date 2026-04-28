"use client";

import { useState, useEffect, useCallback } from "react";
import { useMember } from "@/context/MemberContext";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Attendee {
  id: string;
  status: string;
  anonymous: boolean;
  checked_in_at: string | null;
  profiles: {
    id: string;
    full_name: string;
    profile_photo_url: string | null;
    tier: string;
  };
}

interface LiveFeed {
  room: string;
  title: string;
  viewers: number;
  host: string;
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
  const supabase = createClient();

  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [attendeeListOpen, setAttendeeListOpen] = useState(false);
  const [goingFilter, setGoingFilter] = useState<"all" | "going" | "there">("all");
  const [wantAnonymous, setWantAnonymous] = useState(false);
  const [liveFeeds, setLiveFeeds] = useState<LiveFeed[]>([]);
  const [autoRsvpDone, setAutoRsvpDone] = useState(false);

  // ── Auto-RSVP from ?rsvp=going|there SMS link ──────────────────
  useEffect(() => {
    if (autoRsvpDone) return;
    const params = new URLSearchParams(window.location.search);
    const rsvpParam = params.get("rsvp");
    if (rsvpParam !== "going" && rsvpParam !== "there") return;

    if (isLoggedIn) {
      setAutoRsvpDone(true);
      fetch("/api/proximity/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showId: show.id, status: rsvpParam, anonymous: false }),
      }).then(() => {
        fetch(`/api/proximity/attendees?showId=${show.id}`)
          .then((r) => r.json())
          .then((d) => { setAttendees(d.attendees || []); setAttendeeListOpen(true); });
      });
    } else {
      openModal("login");
    }
  }, [isLoggedIn, autoRsvpDone, show.id, openModal]);

  const myAttendee = attendees.find((a) => a.profiles?.id === member?.id);
  const isGoing = !!myAttendee;
  const goingCount = attendees.filter((a) => a.status === "going").length;
  const thereCount = attendees.filter((a) => a.status === "there").length;
  const totalCount = goingCount + thereCount;

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

  // ── Live feed polling ────────────────────────────────────────────
  const checkLiveFeeds = useCallback(async () => {
    try {
      const feeds: LiveFeed[] = [];
      const seenRooms = new Set<string>();

      // Get active LiveKit rooms
      const activeLkRooms = new Set<string>();
      try {
        const res = await fetch("/api/live-rooms");
        const data = await res.json();
        if (data.rooms?.length) data.rooms.forEach((r: { name: string }) => activeLkRooms.add(r.name));
      } catch {}

      // Check Supabase live_streams
      try {
        const { data: streams } = await supabase
          .from("live_streams")
          .select("*")
          .eq("status", "live");
        if (streams?.length) {
          for (const st of streams) {
            const roomName = st.stream_url || `live_${st.user_id}`;
            if (activeLkRooms.has(roomName) && !seenRooms.has(roomName)) {
              seenRooms.add(roomName);
              feeds.push({
                room: roomName,
                title: st.title || "Crew Broadcast",
                viewers: st.viewer_count || 0,
                host: st.title?.split(" — ")[0] || "Crew",
              });
            }
          }
        }
      } catch {}

      // Fallback: raw LiveKit rooms not matched in Supabase
      activeLkRooms.forEach((roomName) => {
        if (!seenRooms.has(roomName)) {
          seenRooms.add(roomName);
          const hostName = roomName.replace(/^live_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          feeds.push({ room: roomName, title: "Crew Broadcast", viewers: 0, host: hostName });
        }
      });

      setLiveFeeds(feeds);
    } catch {}
  }, [supabase]);

  useEffect(() => {
    checkLiveFeeds();
    const interval = setInterval(checkLiveFeeds, 8000);
    return () => clearInterval(interval);
  }, [checkLiveFeeds]);

  // ── RSVP ────────────────────────────────────────────────────────
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
        body: JSON.stringify({ showId: show.id, status: "going", anonymous: wantAnonymous }),
      });
      const res = await fetch(`/api/proximity/attendees?showId=${show.id}`);
      const data = await res.json();
      setAttendees(data.attendees || []);
      setAttendeeListOpen(true);
    }
    setRsvpLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Filtered attendee list ───────────────────────────────────────
  const filteredAttendees = attendees.filter((a) =>
    goingFilter === "all" ? true : a.status === goingFilter
  );

  const renderAttendee = (a: Attendee) => {
    const isMe = a.profiles?.id === member?.id;
    const isAnon = a.anonymous && !isMe;
    const tier = a.profiles?.tier || "Bronze";
    const initials = isAnon ? "?" : (a.profiles?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?");

    return (
      <div
        key={a.id}
        className={`flex items-center gap-4 p-4 border transition-all ${
          a.status === "there"
            ? "border-emerald-500/30 bg-emerald-500/[0.03]"
            : isMe
            ? "border-purple-500/40 bg-purple-500/5"
            : `border-white/[0.06] bg-white/[0.02] hover:border-white/10 ${tierGlow[tier] || ""}`
        }`}
      >
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-black text-sm border-2 ${isAnon ? "border-white/10 text-white/30" : tierColors[tier] || "border-white/10 text-white/60"} bg-white/[0.04]`}>
          {!isAnon && a.profiles?.profile_photo_url ? (
            <img src={a.profiles.profile_photo_url} alt="" className="w-full h-full object-cover rounded-full" />
          ) : isAnon ? "👤" : initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate">
            {isAnon ? "Anonymous Fan" : (a.profiles?.full_name || "Fan")}
            {isMe && <span className="ml-2 text-[0.5rem] uppercase tracking-widest text-purple-400 font-black">You</span>}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {!isAnon && tier !== "Bronze" && (
              <span className={`text-[0.45rem] font-black uppercase tracking-widest ${tierColors[tier]?.split(" ")[1] || "text-white/30"}`}>{tier}</span>
            )}
            {a.status === "there" ? (
              <span className="text-[0.5rem] font-black uppercase tracking-widest text-emerald-400">✓ Here Now</span>
            ) : (
              <span className="text-[0.45rem] font-black uppercase tracking-widest text-white/25">Going</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-[72px]">

      {/* ── LIVE FEED BANNER ─────────────────────────────────────── */}
      {liveFeeds.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/60 via-red-900/40 to-red-950/60 border-b border-red-500/20">
          <div className="site-container py-3">
            {liveFeeds.map((feed) => (
              <Link key={feed.room} href={`/live/${feed.room}`} className="flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  </span>
                  <span className="text-sm font-black text-white uppercase tracking-wide">
                    🎥 {feed.host} is LIVE from the show
                    {feed.title && feed.title !== "Crew Broadcast" ? ` — ${feed.title}` : ""}
                  </span>
                  {feed.viewers > 0 && (
                    <span className="text-[0.6rem] text-red-300/70">{feed.viewers} watching</span>
                  )}
                </div>
                <span className="px-4 py-1.5 bg-red-500 text-white text-[0.6rem] font-black uppercase tracking-widest rounded-lg group-hover:bg-white group-hover:text-red-600 transition-all shrink-0">
                  Watch Now →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-b from-[#0d0718] to-[#050505] border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(133,29,239,0.2)_0%,_transparent_60%)]" />
        <div className="site-container py-14 md:py-20 relative z-10">
          <Link href="/tour" className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors mb-8 font-bold">
            ← All Shows
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              {/* Status badge */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {isPast ? (
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-white/30 border border-white/10 px-3 py-1">Past Show</span>
                ) : show.status === "live" ? (
                  <span className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] font-bold text-red-400 border border-red-500/30 px-3 py-1 bg-red-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Happening Now
                  </span>
                ) : (
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-purple-400 border border-purple-500/30 px-3 py-1 bg-purple-500/5">Upcoming Show</span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none mb-3">{show.venue_name}</h1>
              <p className="text-lg text-white/50">{show.city}{show.state ? `, ${show.state}` : ""}</p>
              <p className="text-sm text-white/35 mt-1">{dateStr}</p>

              {/* Detail pills */}
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
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 border text-[0.65rem] font-bold uppercase tracking-widest ${show.all_ages ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"}`}>
                    {show.all_ages ? "✅ All Ages" : "🔞 21+"}
                  </span>
                )}
                {show.cover && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                    💵 Cover: {show.cover}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 shrink-0 min-w-[200px]">
              {!isPast && (
                <>
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
                    {rsvpLoading ? "…" : isGoing ? "✓ Going (tap to cancel)" : "🎸 I'm Going"}
                  </button>

                  {/* Anonymous toggle — only before RSVP */}
                  {!isGoing && isLoggedIn && (
                    <button
                      type="button"
                      onClick={() => setWantAnonymous(!wantAnonymous)}
                      className={`flex items-center gap-2 px-4 py-2 text-[0.6rem] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                        wantAnonymous
                          ? "border-white/20 bg-white/5 text-white/60"
                          : "border-white/[0.06] text-white/30 hover:text-white/50"
                      }`}
                    >
                      <span className={`w-7 h-4 rounded-full relative transition-colors shrink-0 ${wantAnonymous ? "bg-white/30" : "bg-white/10"}`}>
                        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${wantAnonymous ? "left-[14px]" : "left-0.5"}`} />
                      </span>
                      Go anonymously
                    </button>
                  )}
                </>
              )}
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" id="directions-btn" className="px-6 py-3 text-sm font-black uppercase tracking-widest border border-white/10 text-white/60 hover:border-white/30 hover:text-white transition-all text-center">
                📍 Directions
              </a>
              <button onClick={copyLink} id="share-show-btn" className="px-6 py-3 text-sm font-black uppercase tracking-widest border border-white/10 text-white/60 hover:border-white/30 hover:text-white transition-all">
                {copied ? "✓ Copied!" : "🔗 Share"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ATTENDANCE SECTION ────────────────────────────────────── */}
      <div className="site-container py-14">
        <div className="max-w-[900px] mx-auto">

          {/* Clickable count summary */}
          <button
            id="attendee-toggle-btn"
            onClick={() => setAttendeeListOpen(!attendeeListOpen)}
            className="w-full flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all mb-1 group cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="text-left">
                <p className="text-[0.55rem] uppercase tracking-widest text-white/30 font-bold mb-1">Fans Going</p>
                <p className="text-3xl font-extrabold text-white">{goingCount}</p>
              </div>
              {thereCount > 0 && (
                <>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-left">
                    <p className="text-[0.55rem] uppercase tracking-widest text-emerald-400/60 font-bold mb-1">Here Now</p>
                    <p className="text-3xl font-extrabold text-emerald-400">{thereCount}</p>
                  </div>
                </>
              )}
              {totalCount === 0 && (
                <p className="text-white/30 text-sm font-bold">Be the first to RSVP!</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isLoggedIn && (
                <span className="text-[0.6rem] font-bold uppercase tracking-widest text-purple-400 border border-purple-500/30 px-3 py-1 bg-purple-500/5">
                  Login to RSVP
                </span>
              )}
              <span className={`text-white/40 transition-transform duration-300 text-xl ${attendeeListOpen ? "rotate-180" : ""}`}>
                ↓
              </span>
            </div>
          </button>

          {/* Expandable attendee list */}
          {attendeeListOpen && (
            <div className="border border-t-0 border-white/[0.06] bg-white/[0.01] p-6">

              {/* Filter tabs */}
              {totalCount > 0 && (
                <div className="flex items-center gap-1 mb-6 bg-white/[0.03] border border-white/5 p-1 w-fit">
                  {(["all", "going", "there"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setGoingFilter(f)}
                      className={`px-4 py-1.5 text-[0.6rem] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        goingFilter === f ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"
                      }`}
                    >
                      {f === "all" ? `All (${totalCount})` : f === "going" ? `Going (${goingCount})` : `Here Now (${thereCount})`}
                    </button>
                  ))}
                </div>
              )}

              {totalCount === 0 ? (
                <div className="py-16 flex flex-col items-center">
                  <span className="text-5xl mb-4 opacity-20">🎸</span>
                  <p className="text-white/40 font-bold text-lg">Nobody&apos;s RSVPed yet.</p>
                  <p className="text-white/20 text-sm mt-2">Be the first — hit &ldquo;I&apos;m Going&rdquo; above!</p>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <p className="text-white/25 text-sm py-8 text-center">No fans in this category yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredAttendees.map(renderAttendee)}
                </div>
              )}

              {/* Anonymous note */}
              <p className="text-[0.55rem] text-white/20 mt-4 text-center">
                Fans who chose to go anonymously appear as &ldquo;Anonymous Fan&rdquo;
              </p>
            </div>
          )}

          {/* Share CTA */}
          {!isPast && (
            <div className="mt-12 p-8 bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-white/40 text-sm mb-1">Know someone who might be going?</p>
              <p className="text-white font-bold text-lg mb-6">Share this show page</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button onClick={copyLink} className="px-6 py-3 bg-purple-600 text-white text-[0.7rem] font-black uppercase tracking-widest hover:bg-purple-500 transition-all">
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
