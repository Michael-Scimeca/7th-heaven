/* eslint-disable react-doctor/no-giant-component */
"use client";
import Image from 'next/image';

import { useState, useEffect, useCallback, useSyncExternalStore, useRef } from "react";
import { useMember } from "@/context/MemberContext";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GradientToggle } from "@/components/GradientToggle";
import CosmicRadialButton from "@/components/CosmicRadialButton";
import InputField from "@/components/InputField";
import QRCode from "react-qr-code";
import { SectionBadge } from "@/components/SectionBadge";

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
  Bronze: "border-purple-700/40  text-[var(--color-accent)]",
  Silver: "border-slate-400/40 text-slate-300",
  Gold: "border-yellow-500/40 text-yellow-400",
  Platinum: "border-purple-500/40  text-[var(--color-accent)]",
};
const tierGlow: Record<string, string> = {
  Gold: "shadow-[0_0_12px_rgba(234,179,8,0.2)]",
  Platinum: "shadow-[0_0_12px_rgba(255,10,61,0.2)]",
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
  const autoRsvpDoneRef = useRef(false);

  // ── Notify Me Next Time States ──────────────────────────────────
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyError, setNotifyError] = useState("");

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    setNotifyLoading(true);
    setNotifyError("");
    try {
      const res = await fetch("/api/shows/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId: show.id,
          email: notifyEmail,
          venueName: show.venue_name
        })
      });
      if (res.ok) {
        setNotifySuccess(true);
        setNotifyEmail("");
      } else {
        const data = await res.json();
        setNotifyError(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setNotifyError("Network error. Please try again.");
    } finally {
      setNotifyLoading(false);
    }
  };

  // ── Auto-RSVP from ?rsvp=going|there SMS link ──────────────────
  const handleAutoRsvp = useCallback(async (rsvpParam: string) => {
    try {
      await fetch("/api/proximity/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showId: show.id, status: rsvpParam, anonymous: false }),
      });
      const r = await fetch(`/api/proximity/attendees?showId=${show.id}`);
      if (r.ok) {
        const d = await r.json();
        setAttendees(d.attendees || []);
        setAttendeeListOpen(true);
      }
    } catch { }
  }, [show.id]);

  useEffect(() => {
    if (autoRsvpDoneRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const rsvpParam = params.get("rsvp");
    if (rsvpParam !== "going" && rsvpParam !== "there") return;

    if (isLoggedIn) {
      autoRsvpDoneRef.current = true;
      handleAutoRsvp(rsvpParam);
    } else {
      openModal("login");
    }
  }, [isLoggedIn, show.id, openModal, handleAutoRsvp]);

  const myAttendee = attendees.find((a) => a.profiles?.id === member?.id);
  const isGoing = !!myAttendee;
  const goingCount = attendees.filter((a) => a.status === "going").length;
  const thereCount = attendees.filter((a) => a.status === "there").length;
  const totalCount = goingCount + thereCount;

  const showDate = new Date(show.date + "T12:00:00Z");
  const isPast = showDate < new Date();
  const dateStr = showDate.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC"
  });

  const mapsUrl = show.latitude && show.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${show.latitude},${show.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue_name} ${show.city} ${show.state}`)}`;

  // shareUrl: use a safe default on SSR, update to real URL after hydration
  const shareUrl = useSyncExternalStore(
    () => () => { },
    () => window.location.href,
    () => `https://7thheavenband.com/shows/${show.id}`
  );

  // ── Live feed polling ────────────────────────────────────────────
  const checkLiveFeeds = useCallback(async () => {
    try {
      const feeds: LiveFeed[] = [];
      const seenRooms = new Set<string>();

      // Get active LiveKit rooms
      const activeLkRooms = new Set<string>();
      try {
        const res = await fetch("/api/live-rooms");
        if (res.ok) {
          const data = await res.json();
          if (data.rooms?.length) data.rooms.forEach((r: { name: string }) => activeLkRooms.add(r.name));
        }
      } catch { }

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
      } catch { }

      // Fallback: raw LiveKit rooms not matched in Supabase
      activeLkRooms.forEach((roomName) => {
        if (!seenRooms.has(roomName)) {
          seenRooms.add(roomName);
          const hostName = roomName.replace(/^live_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          feeds.push({ room: roomName, title: "Crew Broadcast", viewers: 0, host: hostName });
        }
      });

      setLiveFeeds(feeds);
    } catch { }
  }, [supabase]);

  useEffect(() => {
    checkLiveFeeds();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') checkLiveFeeds();
    }, 60000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkLiveFeeds();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [checkLiveFeeds]);

  // ── RSVP ────────────────────────────────────────────────────────
  const handleRsvp = async () => {
    if (!isLoggedIn) { openModal("login"); return; }
    setRsvpLoading(true);
    try {
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
        if (res.ok) {
          const data = await res.json();
          setAttendees(data.attendees || []);
          setAttendeeListOpen(true);
        }
      }
    } finally {
      setRsvpLoading(false);
    }
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
        className={`flex items-center gap-4 p-4 border transition-colors ${a.status === "there"
          ? "border-emerald-500/30 bg-emerald-500/[0.03]"
          : isMe
            ? "border-purple-500/40 bg-purple-500/5"
            : `border-white/[0.06] bg-white/[0.02] hover: border-white/10  ${tierGlow[tier] || ""}`
          }`}
      >
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 font-bold border-2 ${isAnon ? " border-white/10  text-white/30" : tierColors[tier] || " border-white/10   text-white "} bg-white/[0.04]`}>
          {!isAnon && a.profiles?.profile_photo_url ? (
            <Image width={200} height={200} unoptimized src={a.profiles.profile_photo_url} alt="7th Heaven Media" className="w-full h-full object-cover rounded-lg" />
          ) : isAnon ? "👤" : initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">
            {isAnon ? "Anonymous Fan" : (a.profiles?.full_name || "Fan")}
            {isMe && <span className="ml-2 text-[var(--font-size-2xs)] uppercase    text-[var(--color-accent)] font-bold">You</span>}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {!isAnon && tier !== "Bronze" && (
              <span className={`text-[var(--font-size-2xs)] font-bold uppercase    ${tierColors[tier]?.split(" ")[1] || "text-white/30"}`}>{tier}</span>
            )}
            {a.status === "there" ? (
              <span className="text-[var(--font-size-2xs)] font-bold uppercase    text-[var(--color-accent)]">✓ Here Now</span>
            ) : (
              <span className="text-[var(--font-size-2xs)] font-bold uppercase    text-white/25">Going</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-[123px]">

      {/* ── LIVE FEED BANNER ─────────────────────────────────────── */}
      {liveFeeds.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/60 via-red-900/40 to-red-950/60 border-b border-red-500/20">
          <div className="site-container py-3">
            {liveFeeds.map((feed) => (
              <Link key={feed.room} href={`/live/${feed.room}`} className="flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-lg h-3 w-3 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  </span>
                  <span className="font-bold text-white uppercase tracking-wide">
                    🎥 {feed.host} is LIVE from the show
                    {feed.title && feed.title !== "Crew Broadcast" ? ` — ${feed.title}` : ""}
                  </span>
                  {feed.viewers > 0 && (
                    <span className="text-red-300/70">{feed.viewers} watching</span>
                  )}
                </div>
                <span className="px-4 py-1.5 bg-red-500 text-white font-bold uppercase    rounded-lg group-hover:bg-white group-hover:text-red-600 transition-colors shrink-0">
                  Watch Now →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-b from-[#0d0718] to-[#050505] border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,10,61,0.2)_0%,_transparent_60%)]" />
        <div className="site-container py-14 md:py-20 relative z-10">
          <Link href="/#tour" className="inline-flex items-center gap-2 uppercase    text-white/30 hover: text-white transition-colors mb-8 font-bold">
            ← All Shows
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              {/* Status badge */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {isPast ? (
                  <SectionBadge label="Past Show" />
                ) : show.status === "live" ? (
                  <SectionBadge className="gap-2 border-purple-500/40 text-purple-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>HAPPENING NOW</span>
                  </SectionBadge>
                ) : (
                  <SectionBadge label="Upcoming Show" isActive />
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-none mb-3">{show.venue_name}</h1>
              <p className="">{show.city}{show.state ? `, ${show.state}` : ""}</p>
              <p className="mt-1">{dateStr}</p>

              {/* Detail pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {show.doors_time && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border  border-white/10  font-bold uppercase    text-white">
                    🚪 Doors {show.doors_time}
                  </span>
                )}
                {show.time && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border  border-white/10  font-bold uppercase    text-white">
                    🎸 Show {show.time}
                  </span>
                )}
                {show.all_ages !== null && (
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 border font-bold uppercase    ${show.all_ages ? "bg-emerald-500/10 border-emerald-500/30 text-[var(--color-accent)]" : "bg-purple-600/10 border-purple-500/30 text-purple-300"}`}>
                    {show.all_ages ? "✅ All Ages" : "🔞 21+"}
                  </span>
                )}
                {show.cover && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border  border-white/10  font-bold uppercase    text-white">
                    💵 Cover: {show.cover}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 shrink-0 min-w-[200px]">
              {!isPast && (
                <>
                  {isGoing ? (
                    <button
                      onClick={handleRsvp}
                      disabled={rsvpLoading}
                      id="rsvp-btn"
                      className="px-8 py-4 font-bold uppercase    transition-colors disabled:opacity-50 cursor-pointer bg-white/10 text-white border  border-white/10  hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
                    >
                      {rsvpLoading ? "…" : "✓ Going (tap to cancel)"}
                    </button>
                  ) : (
                    <CosmicRadialButton
                      onClick={handleRsvp}
                      disabled={rsvpLoading}
                      icon={false}
                      id="rsvp-btn"
                      className="px-8 py-4 font-bold uppercase    disabled:opacity-50"
                    >
                      {rsvpLoading ? "…" : "🎸 I'm Going"}
                    </CosmicRadialButton>
                  )}

                  {/* Anonymous toggle — only before RSVP */}
                  {!isGoing && isLoggedIn && (
                    <div className="flex items-center gap-2 px-3 py-1.5 border  border-white/10  rounded-lg bg-[#00000029]">
                      <GradientToggle
                        id="show-anonymous-toggle"
                        label="Go anonymously"
                        checked={wantAnonymous}
                        onChange={setWantAnonymous}
                      />
                    </div>
                  )}
                </>
              )}
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" id="directions-btn" className="px-6 py-3 font-bold uppercase    border  border-white/10  text-white hover:border-white/30 hover:text-white transition-colors text-center">
                📍 Directions
              </a>
              <button aria-label="Action button" onClick={copyLink} id="share-show-btn" className="px-6 py-3 font-bold uppercase    border  border-white/10  text-white hover:border-white/30 hover:text-white transition-colors">
                {copied ? "✓ Copied!" : "🔗 Share"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ATTENDANCE SECTION ────────────────────────────────────── */}
      <div className="site-container py-14">
        <div className="max-w-[900px] mx-auto">

          {/* Past Show - Notify Me & Video Embed */}
          {isPast && (
            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Notify Me Column */}
              <div className="bg-[var(--color-bg-surface)] border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/5 rounded-lg blur-[40px] pointer-events-none" />
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border  border-white/10  rounded-lg text-[var(--font-size-2xs)] font-bold text-[var(--color-accent)] uppercase    mb-4">
                    Missed this show?
                  </span>
                  <h3 className="font-bold text-white uppercase tracking-wide mb-2">Notify Me Next Time</h3>
                  <p className="leading-relaxed mb-6">
                    Enter your email to receive priority alerts when 7th Heaven schedules a new tour date at <strong className=" text-white ">{show.venue_name}</strong>.
                  </p>
                </div>
                <div>
                  {notifySuccess ? (
                    <div className="p-4 bg-emerald-500/10 border  border-white/10  text-center">
                      <p className="text-emerald-400 font-bold">✓ Successfully subscribed!</p>
                      <p className="mt-1">We will alert you when new dates are announced.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleNotifyMe} className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <InputField
                          type="email"
                          required
                          placeholder="yourname@domain.com"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          containerClassName="flex-1"
                          glow={true}
                          inputClassName="bg-black/40 border  border-white/10  px-4 py-3 text-white placeholder:text-white/20 outline-none transition-colors rounded-xl"
                        />
                        <CosmicRadialButton
                          type="submit"
                          disabled={notifyLoading}
                          icon={false}
                          className="px-6 py-3 text-white font-bold uppercase    disabled:opacity-50 shrink-0 rounded-lg"
                        >
                          {notifyLoading ? "Submitting..." : "Keep Me Posted"}
                        </CosmicRadialButton>
                      </div>
                      {notifyError && <p className="text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20 rounded">{notifyError}</p>}
                    </form>
                  )}
                </div>
              </div>

              {/* Video Embed Column */}
              <div className="bg-[var(--color-bg-surface)] border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-lg blur-[40px] pointer-events-none" />
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-[var(--font-size-2xs)] font-bold text-red-400 uppercase    mb-4">
                    Live Performance
                  </span>
                  <h3 className="font-bold text-white uppercase tracking-wide mb-3">Live Show Clips</h3>
                </div>
                <div className="aspect-video w-full overflow-hidden border  border-white/10  bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/Dnic7xeXrQo?autoplay=0&rel=0&modestbranding=1"
                    title="7th Heaven Live Performance Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-presentation allow-popups allow-forms"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {/* Clickable count summary */}
          <button aria-label="Action button"
            id="attendee-toggle-btn"
            onClick={() => setAttendeeListOpen(!attendeeListOpen)}
            className="w-full flex items-center justify-between p-5 bg-white/[0.02] border border-white/[0.06] hover: border-white/10  transition-colors mb-1 group cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="text-left">
                <p className="uppercase    font-bold mb-1">Fans Going</p>
                <p className="font-bold">{goingCount}</p>
              </div>
              {thereCount > 0 && (
                <>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-left">
                    <p className="uppercase    text-[var(--color-accent)]/60 font-bold mb-1">Here Now</p>
                    <p className="font-bold">{thereCount}</p>
                  </div>
                </>
              )}
              {totalCount === 0 && (
                <p className="font-bold">Be the first to RSVP!</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!isLoggedIn && (
                <span className="font-bold uppercase    text-[var(--color-accent)] border border-purple-500/30 px-3 py-1 bg-purple-500/5">
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
                    <button aria-label="Action button"
                      key={f}
                      onClick={() => setGoingFilter(f)}
                      className={`px-4 py-1.5 font-bold uppercase    transition-colors cursor-pointer ${goingFilter === f ? "bg-white/10 text-white" : "text-white/30 hover: text-white "
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
                  <p className="font-bold">Nobody&apos;s RSVPed yet.</p>
                  <p className="mt-2">Be the first — hit &ldquo;I&apos;m Going&rdquo; above!</p>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <p className="py-8 text-center">No fans in this category yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredAttendees.map(renderAttendee)}
                </div>
              )}

              {/* Anonymous note */}
              <p className="mt-4 text-center">
                Fans who chose to go anonymously appear as &ldquo;Anonymous Fan&rdquo;
              </p>
            </div>
          )}

          {/* Share CTA */}
          {!isPast && (
            <div className="mt-12 p-8 bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="mb-1">Know someone who might be going?</p>
              <p className="font-bold mb-6">Share this show page</p>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-8">
                <div className="p-4 bg-white inline-block shadow-[0_0_40px_rgba(255,10,61,0.25)] mb-3">
                  <QRCode
                    value={shareUrl}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#0a0a0a"
                    level="M"
                  />
                </div>
                <p className="uppercase    font-bold">Scan to open the show page</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <CosmicRadialButton
                  onClick={copyLink}
                  icon={false}
                  className="px-6 py-3 text-white font-bold  rounded-lg"
                >
                  {copied ? "✓ Link Copied!" : "🔗 Copy Link"}
                </CosmicRadialButton>
                <a
                  href={`sms:?body=${encodeURIComponent(`7th Heaven is playing at ${show.venue_name} in ${show.city}! I'm going — see who else is: ${shareUrl}`)}`}
                  className="px-6 py-3 border  border-white/10  text-white/50 font-bold uppercase    hover:border-white/30 hover:text-white transition-colors"
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
