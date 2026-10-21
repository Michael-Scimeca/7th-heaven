/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/three-prefer-set-animation-loop */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Guitar,
  Piano,
  Drum,
  Mic,
  Eye,
  Ban,
  VolumeX,
  Siren,
  Radio,
  Users,
  ScrollText,
  Bell,
  Headphones,
  MessageSquare,
  Video,
  Sparkles,
  Zap,
  ShieldCheck,
  LayoutGrid,
  Columns,
  MonitorPlay,
  Volume2,
  Activity,
  Layers,
  Check,
  Play,
} from "lucide-react";
import PushSubscribeModal from "@/components/PushSubscribeModal";
import { SectionBadge } from "@/components/SectionBadge";
import GlassPlayButton from "@/components/GlassPlayButton";
import PageHero from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */

interface LiveRoom {
  name: string;
  title: string;
  numParticipants: number;
  creationTime: number;
  color: string;
  gradient: string;
  Icon: React.ElementType;
  member: string;
  image?: string;
}

/* ═══════════════════════════════════════════════════════
   FAKE CHAT USERS for admin panel
═══════════════════════════════════════════════════════ */

const FAKE_FANS = [
  {
    id: "fan-jess",
    name: "Jess_M",
    avatar: "JM",
    color: "#a78bfa",
    tier: "💎 Platinum",
    msgs: 8,
  },
  {
    id: "fan-jake",
    name: "Jake7H",
    avatar: "J7",
    color: "#60a5fa",
    tier: "🥇 Gold",
    msgs: 5,
  },
  {
    id: "fan-chicago",
    name: "ChicagoLou",
    avatar: "CL",
    color: "#34d399",
    tier: "🥈 Silver",
    msgs: 3,
  },
  {
    id: "fan-rock",
    name: "rockerdan92",
    avatar: "RD",
    color: "#f87171",
    tier: "Fan",
    msgs: 12,
  },
  {
    id: "fan-mel",
    name: "MelM",
    avatar: "MM",
    color: "#fb923c",
    tier: "💎 Platinum",
    msgs: 6,
  },
  {
    id: "fan-lena",
    name: "Lena_Music",
    avatar: "LM",
    color: "#e879f9",
    tier: "🥇 Gold",
    msgs: 4,
  },
];

const getElapsed = (creationTime: number) => {
  const s = Math.floor(Date.now() / 1000 - creationTime);
  if (s < 60) return "Just started";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
};

const getDemoRooms = (): LiveRoom[] => {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      name: "live_michael",
      title: "Mike S — Backstage Cam",
      numParticipants: 1247,
      creationTime: now - 2340,
      color: "#a855f7",
      gradient: "linear-gradient(135deg,#8a1cfc,#ec4899)",
      Icon: Guitar,
      member: "MS",
      image: "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg",
    },
    {
      name: "live_ryan",
      title: "Ryan K — Keys & Soundcheck",
      numParticipants: 412,
      creationTime: now - 900,
      color: "#06b6d4",
      gradient: "linear-gradient(135deg,#06b6d4,#8a1cfc)",
      Icon: Piano,
      member: "RK",
      image: "https://img.youtube.com/vi/C0PQYmyaTFk/hq720.jpg",
    },
    {
      name: "live_sammy",
      title: "Sammy D — Drum Warm-Up",
      numParticipants: 84,
      creationTime: now - 420,
      color: "#ec4899",
      gradient: "linear-gradient(135deg,#ec4899,#f97316)",
      Icon: Drum,
      member: "SD",
      image: "https://img.youtube.com/vi/UQBvl_wZ0ak/hq720.jpg",
    },
    {
      name: "live_tony",
      title: "Tony M — Vocal Check",
      numParticipants: 18,
      creationTime: now - 180,
      color: "#f97316",
      gradient: "linear-gradient(135deg,#f97316,#ef4444)",
      Icon: Mic,
      member: "TM",
      image: "https://img.youtube.com/vi/BzHUNTZ66zY/hq720.jpg",
    },
  ];
};

export default function LiveHubClient({
  sanityContent,
}: {
  sanityContent?: any;
}) {
  const [rooms, setRooms] = useState<LiveRoom[]>(getDemoRooms);
  const [viewers, setViewers] = useState<Record<string, number>>(() =>
    Object.fromEntries(getDemoRooms().map((r) => [r.name, r.numParticipants])),
  );
  const [showAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<"streams" | "users" | "policy">(
    "streams",
  );
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [warnedUsers, setWarnedUsers] = useState<Set<string>>(new Set());
  const [modLog, setModLog] = useState<
    { id: string; action: string; user: string; time: number }[]
  >([]);
  const [layoutMode, setLayoutMode] = useState<number>(2);
  const [sortBy, setSortBy] = useState<"viewers" | "recent" | "alpha">("viewers");
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [flaggedCount, setFlaggedCount] = useState<number>(2);
  const [liveAlertsEnabled, setLiveAlertsEnabled] = useState<boolean>(true);

  // Sync layout preset from URL query parameter (?layout=1..10) if present
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const param = urlParams.get("layout");
    if (param) {
      const parsed = parseInt(param, 10);
      if (parsed >= 1 && parsed <= 10) setLayoutMode(parsed);
    }
  }, []);

  const sortedRooms = [...rooms].sort((a, b) => {
    if (sortBy === "viewers") {
      return (viewers[b.name] ?? b.numParticipants) - (viewers[a.name] ?? a.numParticipants);
    }
    if (sortBy === "recent") {
      return b.creationTime - a.creationTime;
    }
    return a.title.localeCompare(b.title);
  });

  // Fluctuate viewer counts (throttled for mobile performance & paused when tab hidden)
  useEffect(() => {
    const t = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setViewers((prev) => {
        const next = { ...prev };
        getDemoRooms().forEach((r) => {
          const delta = Math.floor(Math.random() * 9) - 3;
          next[r.name] = Math.max(
            10,
            (next[r.name] ?? r.numParticipants) + delta,
          );
        });
        return next;
      });
    }, 8000);
    return () => clearInterval(t);
  }, []);

  // Simulate occasional flagged messages appearing
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() < 0.25) setFlaggedCount((c) => c + 1);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const fetchAlertsSetting = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/settings?key=live_alerts_enabled");
      if (r.ok) {
        const d = await r.json();
        if (d.value === "off") setLiveAlertsEnabled(false);
      }
    } catch { }
  }, []);

  useEffect(() => {
    fetchAlertsSetting();
  }, [fetchAlertsSetting]);

  const addLog = useCallback((action: string, user: string) => {
    setModLog((prev) => [
      { id: `mod-${Date.now()}`, action, user, time: Date.now() },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const totalViewers = Object.values(viewers).reduce((a, b) => a + b, 0);

  return (
    <main className="site-container page-container page-stack w-full md:pb-0" id="live-hub-page">

      {/* ══════════════════════════════════════════════════
            ADMIN OVERLAY
        ══════════════════════════════════════════════════ */}
      {showAdmin && (
        <section
          id="moderation-dashboard"
          aria-labelledby="moderation-dashboard-heading"
          className="section"
        >
          <SectionHeader id="moderation-dashboard-heading" title="Moderation Dashboard" visuallyHidden />
          <div className="mx-auto mb-12 max-w-[1440px] overflow-hidden bg-[#08080c] border border-red-500/20">
            {/* Admin header */}
            <div className="flex items-center justify-between px-6 py-4 bg-red-500/[0.06] border-b border-red-500/15">
              <div className="flex items-center gap-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-red-400">Moderation Dashboard</span>
                <span className="rounded-lg px-2 py-0.5 bg-red-500/15 text-red-300">
                  LIVE SHOW
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/35">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-white/50" />{" "}
                  {totalViewers.toLocaleString()} watching
                </span>
                <span
                  className={`flex items-center gap-1 ${bannedUsers.size > 0 ? "text-red-400" : ""}`}
                >
                  <Ban className="h-3.5 w-3.5" /> {bannedUsers.size} banned
                </span>
                <span
                  className={`flex items-center gap-1 ${mutedUsers.size > 0 ? "text-purple-400" : ""}`}
                >
                  <VolumeX className="h-3.5 w-3.5" /> {mutedUsers.size} muted
                </span>
                {flaggedCount > 0 && (
                  <span
                    className="flex items-center gap-1 text-red-300"
                  >
                    <Siren className="h-3.5 w-3.5" /> {flaggedCount} flagged
                  </span>
                )}
              </div>
            </div>

            {/* Admin tabs */}
            <div className="flex gap-2 border-b border-white/[0.06] px-6 pt-3 pb-0">
              {(["streams", "users", "policy"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAdminTab(tab)}
                  className={`rounded-[var(--radius-box)] px-4 py-2 border-b-2 transition-colors ${adminTab === tab
                    ? "bg-red-500/15 text-purple-400 border-purple-500"
                    : "bg-transparent text-white/35 border-transparent hover:text-white/60"
                    }`}
                >
                  {tab === "streams" && (
                    <span className="flex items-center gap-1.5">
                      <Radio className="inline h-3.5 w-3.5" /> Streams (
                      {rooms.length})
                    </span>
                  )}
                  {tab === "users" && (
                    <span className="flex items-center gap-1.5">
                      <Users className="inline h-3.5 w-3.5" /> Chat Users
                    </span>
                  )}
                  {tab === "policy" && (
                    <span className="flex items-center gap-1.5">
                      <ScrollText className="inline h-3.5 w-3.5" /> Policy
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {/* ── STREAMS TAB ── */}
              {adminTab === "streams" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {rooms.map((room) => (
                    <div key={room.name} className="overflow-hidden bg-white/[0.03] border border-white/[0.07]">
                      {/* Mini feed */}
                      <div className="relative aspect-video">
                        <Image
                          src={
                            room.image ||
                            "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"
                          }
                          alt={room.title}
                          fill
                          priority
                          sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-red-600 rounded-[9px]">
                          <span className="h-1.5 w-1.5 animate-pulse bg-white rounded-full" />
                          LIVE
                        </div>
                        <div className="absolute right-2 bottom-2 rounded-[9px] px-2 py-0.5 bg-black/70 text-white/70">
                          👁{" "}
                          {(
                            viewers[room.name] ?? room.numParticipants
                          ).toLocaleString()}
                        </div>
                      </div>
                      {/* Card info */}
                      <div className="p-3">
                        <p>{room.title}</p>
                        <p className="text-white/30">
                          {getElapsed(room.creationTime)}
                        </p>
                        <div className="mt-3 flex gap-1.5">
                          <Link
                            href={`/live/${room.name.replace(/^live_/, "")}`}
                            className="flex-1 py-1.5 text-center"
                            style={{
                              background: `rgba(${parseInt(room.color.slice(1, 3), 16)},${parseInt(room.color.slice(3, 5), 16)},${parseInt(room.color.slice(5, 7), 16)},0.15)`,
                              color: room.color,
                              border: `1px solid ${room.color}40`,
                            }}
                          >
                            👁 Watch
                          </Link>
                          <button
                            type="button"
                            aria-label={`End ${room.title} stream`}
                            onClick={() => {
                              setRooms((prev) =>
                                prev.filter((r) => r.name !== room.name),
                              );
                              addLog("🛑 Ended stream", room.title);
                            }}
                            className="cursor-pointer px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400"
                          >
                            🛑 End
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── USERS TAB ── */}
              {adminTab === "users" && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {FAKE_FANS.map((fan) => {
                    const isBanned = bannedUsers.has(fan.id);
                    const isMuted = mutedUsers.has(fan.id);
                    const isWarned = warnedUsers.has(fan.id);
                    return (
                      <div
                        key={fan.id}
                        className={`flex items-center justify-between gap-3 p-4 rounded-[var(--radius-box)] border ${isBanned
                          ? "bg-red-500/[0.06] border-red-500/20 opacity-65"
                          : "bg-white/[0.03] border-white/[0.07] opacity-100"
                          }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center"
                            style={{ background: fan.color }}
                          >
                            {fan.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span style={{ color: fan.color }}>{fan.name}</span>
                              {isBanned && (
                                <span className="rounded-lg px-1.5 bg-red-500/20 text-red-400 text-[9px]">
                                  BANNED
                                </span>
                              )}
                              {isMuted && !isBanned && (
                                <span className="rounded-lg px-1.5 bg-gray-400/15 text-gray-400 text-[9px]">
                                  MUTED
                                </span>
                              )}
                              {isWarned && !isBanned && (
                                <span className="rounded-lg px-1.5 bg-purple-400/15 text-purple-400 text-[9px]">
                                  WARNED
                                </span>
                              )}
                            </div>
                            <p className="text-white/25">
                              {fan.tier} · {fan.msgs} msgs
                            </p>
                          </div>
                        </div>
                        {!isBanned && (
                          <div className="flex shrink-0 items-center gap-1">
                            {!isWarned && (
                              <button
                                onClick={() => {
                                  setWarnedUsers((s) => new Set(s).add(fan.id));
                                  addLog("⚠️ Warned", fan.name);
                                }}
                                title="Warn"
                                className="flex h-8 w-8 items-center justify-center bg-purple-400/10"
                              >
                                ⚠️
                              </button>
                            )}
                            {!isMuted && (
                              <button
                                onClick={() => {
                                  setMutedUsers((s) => new Set(s).add(fan.id));
                                  addLog("🔇 Muted", fan.name);
                                }}
                                title="Mute"
                                className="flex h-8 w-8 items-center justify-center bg-gray-400/[0.08]"
                              >
                                🔇
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setBannedUsers((s) => new Set(s).add(fan.id));
                                addLog("🚫 Banned", fan.name);
                              }}
                              title="Ban"
                              className="flex h-8 w-8 items-center justify-center bg-red-500/12"
                            >
                              🚫
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Mod log */}
                  {modLog.length > 0 && (
                    <div className="col-span-full mt-4 p-4 bg-white/[0.02] border border-white/[0.06]">
                      <p className="mb-3 text-white/30">
                        📋 Recent Actions
                      </p>
                      <div className="flex flex-col gap-1">
                        {modLog.slice(0, 5).map((e) => (
                          <div key={e.id} className="flex items-center justify-between text-white/40">
                            <span>
                              {e.action} —{" "}
                              <span className="text-purple-400">{e.user}</span>
                            </span>
                            <span>{new Date(e.time).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── POLICY TAB ── */}
              {adminTab === "policy" && (
                <div className="grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-3 text-red-400">
                      🚫 Zero-Tolerance — Instant Ban
                    </p>
                    {[
                      {
                        icon: "🔞",
                        rule: "Adult / pornographic content",
                        desc: "Explicit content, NSFW links, or adult platform promotion.",
                      },
                      {
                        icon: "⚠️",
                        rule: "Hate speech & slurs",
                        desc: "Racist, homophobic, or discriminatory language.",
                      },
                      {
                        icon: "🚨",
                        rule: "Threats & violence",
                        desc: "Any threats toward people, band, or venue staff.",
                      },
                    ].map(({ icon, rule, desc }) => (
                      <div key={rule} className="mb-2 p-3 bg-red-500/[0.07] border border-red-500/[0.18]">
                        <p>
                          {icon} {rule}
                        </p>
                        <p className="mt-0.5 text-white/35">
                          {desc}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="mb-3 text-purple-400">
                      ⚠️ Warn First — Then Mute/Kick
                    </p>
                    {[
                      {
                        icon: "🏛️",
                        rule: "Political commentary",
                        desc: "No political debate, parties, or electoral content.",
                      },
                      {
                        icon: "📢",
                        rule: "Spam & self-promotion",
                        desc: "Links, social handles, or money solicitation.",
                      },
                      {
                        icon: "🔄",
                        rule: "Excessive repetition",
                        desc: "Flooding chat with same message or emoji spam.",
                      },
                      {
                        icon: "💊",
                        rule: "Drug references",
                        desc: "Discussion of illegal substances during the event.",
                      },
                    ].map(({ icon, rule, desc }) => (
                      <div key={rule} className="mb-2 p-3 bg-purple-400/[0.06] border border-purple-400/15">
                        <p>
                          {icon} {rule}
                        </p>
                        <p className="mt-0.5 text-white/35">
                          {desc}
                        </p>
                      </div>
                    ))}
                    <div className="mt-2 p-3 bg-[#ff0a3d]/[0.08] border border-[#ff0a3d]/20">
                      <p className="mb-1">✅ Keep It Positive</p>
                      <p className="text-white/35">
                        This is a fan space for music lovers — keep the energy
                        high! 🎸
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
            LAYOUT EXPLORER CONTROLS & STREAM CARDS (10 LAYOUT MODES)
        ══════════════════════════════════════════════════ */}
      <section
        id="live-streams"
        aria-labelledby="live-streams-heading"
        className="section pt-0"
      >
        <SectionHeader id="live-streams-heading" title="Live Streams" visuallyHidden />

        {/* ── LAYOUT 1: GOLDEN BROADCAST (1 Dominant Stream + 3 Golden Ratio Sidebar Feeds) ── */}
        {layoutMode === 1 && (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Primary Dominant Stream (Golden Ratio ~62% width on desktop) */}
            {sortedRooms[0] && (
              <div className="lg:col-span-8">
                <Link
                  href={`/live/${sortedRooms[0].name.replace(/^live_/, "")}`}
                  className="group relative block overflow-hidden rounded-[var(--radius-box)] border border-purple-500/30 bg-black/60 transition-all hover:border-purple-400 shadow-2xl"
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={sortedRooms[0].image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                      alt={sortedRooms[0].title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      FEATURED STAGE FEED
                    </div>
                    <div className="overlay-center-hover z-10">
                      <GlassPlayButton size="lg" as="div" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/30 bg-gradient-to-br from-purple-600/50 to-indigo-900 text-sm font-bold text-white">
                          {sortedRooms[0].member}
                        </div>
                        <div>
                          <h3 className="font-bold text-white tracking-tight">{sortedRooms[0].title}</h3>
                          <p className="text-xs text-white/60">Primary Soundboard Mix · 1080p60 Low-Latency</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          {(viewers[sortedRooms[0].name] ?? sortedRooms[0].numParticipants).toLocaleString()} Live Viewers
                        </span>
                        <span className="text-white/50">{getElapsed(sortedRooms[0].creationTime)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Sidebar Secondary Channels (Golden Ratio ~38% width on desktop) */}
            <div className="flex flex-col gap-4 lg:col-span-4">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Alternate Stage Feeds</span>
                <span className="text-xs text-purple-400 font-medium">{sortedRooms.length - 1} More Angles</span>
              </div>
              {sortedRooms.slice(1).map((room) => (
                <Link
                  key={room.name}
                  href={`/live/${room.name.replace(/^live_/, "")}`}
                  className="group flex gap-4 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-3 transition-all hover:border-purple-500/40 hover:bg-white/[0.05]"
                >
                  <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-black/60">
                    <Image
                      src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                      alt={room.title}
                      fill
                      sizes="144px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="overlay-center-hover z-10">
                      <GlassPlayButton size="sm" as="div" />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div>
                      <h4 className="font-semibold text-white truncate">{room.title}</h4>
                      <p className="mt-0.5 text-xs text-white/50 truncate">LiveKit Soundboard Feed</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {(viewers[room.name] ?? room.numParticipants).toLocaleString()}
                      </span>
                      <span>{getElapsed(room.creationTime)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── LAYOUT 2: CINEMA SPOTLIGHT (Master Theater Stage + 3-Camera Channel Strip) ── */}
        {layoutMode === 2 && (
          <div className="space-y-6">
            {sortedRooms[0] && (
              <div className="relative overflow-hidden rounded-[var(--radius-box)] border border-purple-500/25 bg-black shadow-2xl shadow-purple-950/40">
                <div className="relative aspect-[21/9] w-full min-h-[380px] sm:min-h-[460px] overflow-hidden">
                  <Image
                    src={sortedRooms[0].image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                    alt={sortedRooms[0].title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/80" />

                  {/* Top Theater Header Badges */}
                  <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/40">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        DIRECT 4K MASTER FEED
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                        <Volume2 className="h-3.5 w-3.5 text-purple-400" /> Soundboard Master Mix (24-bit/48kHz)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        {(viewers[sortedRooms[0].name] ?? sortedRooms[0].numParticipants).toLocaleString()} Fans Watching Live
                      </span>
                    </div>
                  </div>

                  {/* Center Theater Quick Play Overlay */}
                  <div className="overlay-center-hover z-20">
                    <Link
                      href={`/live/${sortedRooms[0].name.replace(/^live_/, "")}`}
                      aria-label="Enter live theater stream"
                      className="group/play flex h-24 w-24 items-center justify-center rounded-full bg-purple-600/90 text-white shadow-2xl shadow-purple-600/50 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-purple-500"
                    >
                      <Play className="h-10 w-10 fill-current ml-1" />
                    </Link>
                  </div>

                  {/* Bottom Cinema Controls & Metadata */}
                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 flex flex-col justify-end">
                    <div className="max-w-3xl">
                      <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                        Camera Angle 01 · Center Stage Spotlight
                      </span>
                      <h3 className="mt-1 font-extrabold text-white tracking-tight">
                        {sortedRooms[0].title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-white/80 leading-relaxed max-w-2xl sm:text-base">
                        Direct optical feed from the main center-stage rig with synchronized multi-track audio direct from the board. Full stereo sound and low-latency interaction.
                      </p>

                      <div className="mt-6 flex flex-wrap items-center gap-4">
                        <Link
                          href={`/live/${sortedRooms[0].name.replace(/^live_/, "")}`}
                          className="btn-accent inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-600/30 hover:scale-105 transition-transform"
                        >
                          <MonitorPlay className="h-4 w-4" />
                          Launch Fullscreen Cinema Stage
                        </Link>
                        <span className="text-xs text-white/60">
                          Broadcast started {getElapsed(sortedRooms[0].creationTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3-Channel Secondary Stage Camera Strip */}
            <div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {sortedRooms.slice(1).map((room, idx) => (
                  <Link
                    key={room.name}
                    href={`/live/${room.name.replace(/^live_/, "")}`}
                    className="group relative overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-purple-500/50 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-purple-900/20"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/60 mb-3">
                      <Image
                        src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                        alt={room.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-300 backdrop-blur-md">
                        CAM 0{idx + 2}
                      </div>
                      <div className="overlay-center-hover z-10">
                        <GlassPlayButton size="sm" as="div" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {room.title}
                    </h4>
                    <div className="mt-1 flex items-center justify-between text-xs text-white/60">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {(viewers[room.name] ?? room.numParticipants).toLocaleString()} viewers
                      </span>
                      <span>{getElapsed(room.creationTime)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LAYOUT 3: BROADCAST MATRIX (4-Way Synchronized Quad Grid) ── */}
        {layoutMode === 3 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {sortedRooms.map((room, idx) => (
              <Link
                key={room.name}
                href={`/live/${room.name.replace(/^live_/, "")}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/15 bg-black/50 transition-all hover:border-purple-500/60 shadow-xl"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black/80">
                  <Image
                    src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                    alt={room.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-black/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                    <span className="font-mono text-purple-400">CAM {idx + 1}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="absolute top-3 right-3 rounded-md bg-black/70 px-2.5 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
                    {(viewers[room.name] ?? room.numParticipants).toLocaleString()} viewers
                  </div>
                  <div className="overlay-center-hover z-10">
                    <GlassPlayButton size="md" as="div" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-bold text-white">{room.title}</h3>
                    <p className="text-xs text-white/60">LiveKit Stream · {getElapsed(room.creationTime)}</p>
                  </div>
                  <span className="rounded-lg border border-purple-500/30 bg-purple-600/20 px-3 py-1.5 text-xs font-semibold text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    Switch Angle
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── LAYOUT 4: EDITORIAL FEED (Horizontal Panoramic Rows) ── */}
        {layoutMode === 4 && (
          <div className="space-y-4">
            {sortedRooms.map((room, idx) => (
              <Link
                key={room.name}
                href={`/live/${room.name.replace(/^live_/, "")}`}
                className="group flex flex-col gap-6 overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-purple-500/40 hover:bg-white/[0.05] sm:flex-row sm:items-center"
              >
                <div className="relative aspect-video w-full sm:w-72 shrink-0 overflow-hidden rounded-xl bg-black">
                  <Image
                    src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                    alt={room.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 288px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="overlay-center-hover z-10">
                    <GlassPlayButton size="sm" as="div" />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between py-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300">
                        CHANNEL {idx + 1}
                      </span>
                      <span className="text-xs text-white/50">{getElapsed(room.creationTime)}</span>
                    </div>
                    <h3 className="font-bold text-white">{room.title}</h3>
                    <p className="mt-1 text-sm text-white/70 line-clamp-2">
                      Direct live feed from the stage with full soundboard audio mixing, backstage audio clarity, and zero buffering.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      {(viewers[room.name] ?? room.numParticipants).toLocaleString()} Watching Now
                    </span>
                    <span className="text-xs font-medium text-purple-400 group-hover:underline">
                      Enter Stream Room &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── LAYOUT 5: CONTROL DECK (Master Audio Visualizer Bar + Multi-Camera Array) ── */}
        {layoutMode === 5 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between rounded-[var(--radius-box)] border border-white/10 bg-gradient-to-r from-purple-950/40 to-indigo-950/40 p-5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/30 text-purple-400">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Live Broadcast Soundboard Console</h4>
                  <p className="text-xs text-white/60">LiveKit Infrastructure · 4 Synchronized Low-Latency Streams</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-white/80">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  AUDIO FEED: STEREO SOUNDBOARD
                </span>
                <span className="rounded bg-white/10 px-2 py-1">TOTAL VIEWERS: {totalViewers.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sortedRooms.map((room) => (
                <Link
                  key={room.name}
                  href={`/live/${room.name.replace(/^live_/, "")}`}
                  className="group flex flex-col justify-between rounded-[var(--radius-box)] border border-white/10 bg-black/60 p-3 transition-all hover:border-purple-500/50"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black mb-3">
                    <Image
                      src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                      alt={room.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="overlay-center-hover z-10">
                      <GlassPlayButton size="sm" as="div" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white truncate">{room.title}</h4>
                    <div className="mt-2 flex items-center justify-between text-xs text-white/50 border-t border-white/5 pt-2">
                      <span className="text-emerald-400">{(viewers[room.name] ?? room.numParticipants).toLocaleString()} fans</span>
                      <span>{room.member}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── LAYOUT 6: MINIMALIST CARDS (Floating Glass Pills with Member Badges) ── */}
        {layoutMode === 6 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {sortedRooms.map((room) => (
              <Link
                key={room.name}
                href={`/live/${room.name.replace(/^live_/, "")}`}
                className="group relative flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/30 bg-purple-600/20 text-xs font-bold text-white">
                      {room.member}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{room.title}</h3>
                      <p className="text-xs text-white/50">{getElapsed(room.creationTime)}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {(viewers[room.name] ?? room.numParticipants).toLocaleString()} Viewers
                  </span>
                </div>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                  <Image
                    src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                    alt={room.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="overlay-center-hover z-10">
                    <GlassPlayButton size="md" as="div" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── LAYOUT 7: LIVE STAGE FOCUS (Single Dominant Feed with Instant Angle Tabs) ── */}
        {layoutMode === 7 && (
          <div className="space-y-4">
            {sortedRooms[0] && (
              <div className="overflow-hidden rounded-[var(--radius-box)] border border-white/15 bg-black">
                <div className="relative aspect-video w-full max-h-[600px] overflow-hidden">
                  <Image
                    src={sortedRooms[0].image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                    alt={sortedRooms[0].title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                  <div className="absolute top-6 left-6 flex items-center gap-3">
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-black">
                      ACTIVE BROADCAST
                    </span>
                    <span className="text-sm font-semibold text-white">{sortedRooms[0].title}</span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">{sortedRooms[0].title}</h3>
                      <p className="text-xs text-white/70">Soundboard Stereo Mix · Switch cameras instantly below</p>
                    </div>
                    <Link
                      href={`/live/${sortedRooms[0].name.replace(/^live_/, "")}`}
                      className="btn-accent rounded-full px-6 py-2.5 text-xs font-semibold text-white"
                    >
                      Join Stream Room
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {sortedRooms.map((room, idx) => (
                <Link
                  key={room.name}
                  href={`/live/${room.name.replace(/^live_/, "")}`}
                  className="flex items-center gap-3 rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-3 hover:border-purple-500/50 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600/30 text-xs font-bold text-purple-300">
                    C{idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-semibold text-white truncate">{room.title}</h5>
                    <p className="text-[10px] text-emerald-400">{(viewers[room.name] ?? room.numParticipants).toLocaleString()} viewers</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── LAYOUT 8: BENTO HIERARCHY (Golden Ratio Bento Grid with Live Stat Pills) ── */}
        {layoutMode === 8 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-6 lg:grid-cols-12">
            {sortedRooms[0] && (
              <div className="sm:col-span-6 lg:col-span-8">
                <Link
                  href={`/live/${sortedRooms[0].name.replace(/^live_/, "")}`}
                  className="group relative flex aspect-video w-full flex-col justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/15 bg-black p-6 hover:border-purple-500/50 transition-all"
                >
                  <Image
                    src={sortedRooms[0].image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                    alt={sortedRooms[0].title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="rounded-full bg-purple-600/90 px-3 py-1 text-xs font-bold text-white">
                      BENTO LEAD
                    </span>
                    <span className="text-xs font-medium text-emerald-400">
                      {(viewers[sortedRooms[0].name] ?? sortedRooms[0].numParticipants).toLocaleString()} viewers
                    </span>
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-white">{sortedRooms[0].title}</h3>
                    <p className="text-xs text-white/70">Master Stage Audio &amp; Performance Angle</p>
                  </div>
                </Link>
              </div>
            )}
            {sortedRooms[1] && (
              <div className="sm:col-span-6 lg:col-span-4">
                <Link
                  href={`/live/${sortedRooms[1].name.replace(/^live_/, "")}`}
                  className="group relative flex aspect-video lg:aspect-auto lg:h-full w-full flex-col justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/15 bg-black p-6 hover:border-purple-500/50 transition-all"
                >
                  <Image
                    src={sortedRooms[1].image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                    alt={sortedRooms[1].title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="relative z-10">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">BENTO SECONDARY</span>
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-bold text-white">{sortedRooms[1].title}</h4>
                    <p className="text-xs text-emerald-400">{(viewers[sortedRooms[1].name] ?? sortedRooms[1].numParticipants).toLocaleString()} watching</p>
                  </div>
                </Link>
              </div>
            )}
            {sortedRooms.slice(2).map((room) => (
              <div key={room.name} className="sm:col-span-3 lg:col-span-6">
                <Link
                  href={`/live/${room.name.replace(/^live_/, "")}`}
                  className="group relative flex aspect-[16/9] w-full flex-col justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black p-4 hover:border-purple-500/40 transition-all"
                >
                  <Image
                    src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                    alt={room.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="relative z-10">
                    <h4 className="font-bold text-white">{room.title}</h4>
                    <span className="text-xs text-emerald-400">{(viewers[room.name] ?? room.numParticipants).toLocaleString()} viewers</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ── LAYOUT 9: COMPACT CHANNEL GUIDE (High-Density Multi-Room Switcher Table) ── */}
        {layoutMode === 9 && (
          <div className="overflow-hidden rounded-[var(--radius-box)] border border-white/15 bg-black/60 backdrop-blur-md">
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Live Stage Channel Guide</span>
              <span className="text-xs text-white/50">{sortedRooms.length} Active Video Feeds</span>
            </div>
            <div className="divide-y divide-white/5">
              {sortedRooms.map((room, idx) => (
                <div
                  key={room.name}
                  className="flex flex-col gap-4 p-4 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-purple-400">CH 0{idx + 1}</span>
                    <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-black">
                      <Image
                        src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                        alt={room.title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{room.title}</h4>
                      <p className="text-xs text-white/60">LiveKit Dedicated Soundboard · {getElapsed(room.creationTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {(viewers[room.name] ?? room.numParticipants).toLocaleString()} viewers
                    </span>
                    <Link
                      href={`/live/${room.name.replace(/^live_/, "")}`}
                      className="btn-accent rounded-full px-5 py-2 text-xs font-semibold text-white"
                    >
                      Tune In
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LAYOUT 10: SOUNDBOARD STRIP (Full-Width Immersive Concert Ribbons) ── */}
        {layoutMode === 10 && (
          <div className="grid grid-cols-1 gap-4">
            {sortedRooms.map((room) => (
              <Link
                key={room.name}
                href={`/live/${room.name.replace(/^live_/, "")}`}
                className="group relative flex min-h-[140px] items-center justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-black/80 px-8 py-6 transition-all hover:border-purple-400 hover:bg-black/90 shadow-xl"
              >
                <div className="absolute inset-0 opacity-20">
                  <Image
                    src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
                    alt={room.title}
                    fill
                    sizes="100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-600/30 text-white font-bold text-lg">
                    {room.member}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">LIVE AUDIO FEED</span>
                    </div>
                    <h3 className="font-black text-white tracking-tight">{room.title}</h3>
                    <p className="text-xs text-white/60">Stereo Master Soundboard · {getElapsed(room.creationTime)}</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-6">
                  <span className="text-sm font-semibold text-white/80">
                    {(viewers[room.name] ?? room.numParticipants).toLocaleString()} Viewers
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white group-hover:bg-purple-600 transition-colors">
                    <GlassPlayButton size="sm" as="div" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── ABOUT THE LIVE STREAM HUB ── */}
      <section
        id="live-about"
        aria-labelledby="live-about-heading"
        className="section"
      >
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Anchored context, badge, and quick tech highlights */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="mb-3">
              <SectionBadge label="DIGITAL CONCERT PASS" />
            </div>
            <h2
              id="live-about-heading"
              className="text-primary font-bold tracking-tight"
            >
              About the 7th Heaven Live Stream Hub
            </h2>
            <p className="mt-3 text-secondary text-base leading-relaxed">
              Your front-row digital pass to live concerts, soundchecks, and backstage streams — broadcast direct from the stage to your screen.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                <Zap className="h-3.5 w-3.5 text-purple-400" />
                LiveKit Low-Latency
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                <Headphones className="h-3.5 w-3.5 text-pink-400" />
                Direct Board Mix
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                <Video className="h-3.5 w-3.5 text-cyan-400" />
                Multi-Angle 1080p
              </span>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs text-white/50">
                Can&apos;t make the tour stop in person? Experience the camaraderie and energy of 7th Heaven from anywhere in the country.
              </p>
            </div>
          </div>

          {/* Right Column: Scannable Value Pillars */}
          <div className="space-y-4 lg:col-span-7">
            <article className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.05]">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-600/20 text-purple-400">
                  <Video className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">All-Access Stage & Backstage Perspective</h3>
                  <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
                    Built specifically for fans who want an up-close concert experience. Tune into real-time concert broadcasts, backstage soundchecks, and pre-show rehearsal sessions with zero discovery delay.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.05]">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-pink-500/30 bg-pink-600/20 text-pink-400">
                  <Headphones className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">Direct Soundboard Mix & Angle Switching</h3>
                  <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
                    Powered by high-efficiency, low-latency LiveKit infrastructure with dedicated direct-line soundboard audio. Switch effortlessly between individual band member camera feeds — from blistering guitar solos to powerhouse drum warm-ups.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[var(--radius-box)] border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.05]">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-600/20 text-cyan-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white">Interactive Fan Community & Live Requests</h3>
                  <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
                    Join thousands of active viewers in the real-time live chat room. Request classic rock favorites, participate in digital concert raffles, and celebrate with 7th Heaven fans across the nation.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Live Stream Push Alert & Fan Signup Modal */}
      <PushSubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        group="fans"
      />
    </main>
  );
}
