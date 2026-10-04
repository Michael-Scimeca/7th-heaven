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
} from "lucide-react";
import PushSubscribeModal from "@/components/PushSubscribeModal";
import { SectionBadge } from "@/components/SectionBadge";
import Button from "@/components/Button";
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
  const [, setLiveAlertsEnabled] = useState(true);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Mobile-safe link copying with visual toast feedback & propagation stop
  const handleCopyLink = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/live/${slug}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
          document.execCommand("copy");
        } catch { }
        document.body.removeChild(textarea);
      });
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } catch { }
      document.body.removeChild(textarea);
    }

    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

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
      {/* ── HERO HEADER ── */}
      <PageHero

        title={
          sanityContent?.heroHeading || (
            <>
              LIVE{" "}
              <span className="inline-block pr-[0.15em]">STREAM HUB</span>
            </>
          )
        }
        titleId="live-hub-heading"
        subtitle={
          sanityContent?.heroSubheading ||
          `${rooms.length} active crew streams · ${totalViewers.toLocaleString()} viewers watching live right now.`
        }
        align="left"
        className="relative z-10 max-w-5xl"
      />

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
                  className={`rounded-[var(--radius-box)] px-4 py-2 border-b-2 transition-colors ${
                    adminTab === tab
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
                        className={`flex items-center justify-between gap-3 p-4 rounded-[var(--radius-box)] border ${
                          isBanned
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
                      <div className="space-y-1">
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
            STREAM CARDS GRID WITH MATCHING PAGE PADDING
        ══════════════════════════════════════════════════ */}
      <section
        id="live-streams"
        aria-labelledby="live-streams-heading"
        className="section md:pb-0 md:mb-0"
      >
        <SectionHeader id="live-streams-heading" title="Live Streams" visuallyHidden />
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-4">
          {rooms.map((room, i) => (
            <Link
              key={room.name}
              href={`/live/${room.name.replace(/^live_/, "")}`}
              className="group flex flex-col justify-between overflow-hidden rounded-[var(--radius-box)] border border-white/10 bg-purple-900/30 cursor-pointer transition-[colors,border-color,transform] hover:bg-[#0b041a]/90 hover:border-purple-500/40 select-none"
              style={{ "--room-color": room.color } as React.CSSProperties}
            >
              {/* Card Header Bar */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/[0.02] p-3 sm:p-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex aspect-square h-9 w-9 min-w-8 shrink-0 items-center justify-center rounded-full border border-purple-500/20 bg-gradient-to-br from-purple-600/40 to-indigo-900/90 text-xs font-semibold text-white">
                    {room.member}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-white leading-tight truncate">{room.title}</h3>
                    <p className="mt-0.5 text-xs text-white/60 leading-tight truncate">
                      LiveKit Stream · Started {getElapsed(room.creationTime)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <SectionBadge className="gap-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    <span>Live Now</span>
                  </SectionBadge>
                </div>
              </div>

              {/* Middle Video Thumbnail */}
              <div className="relative block aspect-video w-full overflow-hidden bg-black/60">
                <Image
                  src={
                    room.image ||
                    "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"
                  }
                  alt={room.title}
                  fill
                  priority={i < 2}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Viewer + time pills */}
                <div className="absolute right-3 bottom-3 z-10 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-box)] border border-white/10 bg-black/75 backdrop-blur-md text-xs text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {(
                      viewers[room.name] ?? room.numParticipants
                    ).toLocaleString()}{" "}
                    viewers
                  </div>
                  <div className="px-2.5 py-1 rounded-[var(--radius-box)] border border-white/10 bg-black/75 backdrop-blur-md text-xs text-white/60">
                    {getElapsed(room.creationTime)}
                  </div>
                </div>

                {/* Hover overlay with official 7th Heaven Glass Play Button */}
                <div className="overlay-center-hover z-10">
                  <GlassPlayButton size="lg" as="div" />
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/[0.02] p-3 sm:p-3.5">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span>Broadcasting Live</span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Copy stream link"
                  onClick={(e) =>
                    handleCopyLink(e as any, room.name.replace(/^live_/, ""))
                  }
                  className="shrink-0 whitespace-nowrap relative z-20"
                >
                  {copiedSlug === room.name.replace(/^live_/, "")
                    ? "✓ Copied!"
                    : "Copy Link"}
                </Button>
              </div>
            </Link>
          ))}
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
