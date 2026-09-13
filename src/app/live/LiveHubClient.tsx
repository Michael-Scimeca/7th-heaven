/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/three-prefer-set-animation-loop */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Guitar, Piano, Drum, Mic, Eye, Ban, VolumeX, Siren, Radio, Users, ScrollText } from "lucide-react";
import PushSubscribeModal from "@/components/PushSubscribeModal";
import { SectionBadge } from "@/components/SectionBadge";

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
  { id: "fan-jess", name: "Jess_M", avatar: "JM", color: "#a78bfa", tier: "💎 Platinum", msgs: 8 },
  { id: "fan-jake", name: "Jake7H", avatar: "J7", color: "#60a5fa", tier: "🥇 Gold", msgs: 5 },
  { id: "fan-chicago", name: "ChicagoLou", avatar: "CL", color: "#34d399", tier: "🥈 Silver", msgs: 3 },
  { id: "fan-rock", name: "rockerdan92", avatar: "RD", color: "#f87171", tier: "Fan", msgs: 12 },
  { id: "fan-mel", name: "MelM", avatar: "MM", color: "#fb923c", tier: "💎 Platinum", msgs: 6 },
  { id: "fan-lena", name: "Lena_Music", avatar: "LM", color: "#e879f9", tier: "🥇 Gold", msgs: 4 },
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
    { name: "live_michael", title: "Mike S — Backstage Cam", numParticipants: 1247, creationTime: now - 2340, color: "#a855f7", gradient: "linear-gradient(135deg,#8a1cfc,#ec4899)", Icon: Guitar, member: "MS", image: "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg" },
    { name: "live_ryan", title: "Ryan K — Keys & Soundcheck", numParticipants: 412, creationTime: now - 900, color: "#06b6d4", gradient: "linear-gradient(135deg,#06b6d4,#8a1cfc)", Icon: Piano, member: "RK", image: "https://img.youtube.com/vi/C0PQYmyaTFk/hq720.jpg" },
    { name: "live_sammy", title: "Sammy D — Drum Warm-Up", numParticipants: 84, creationTime: now - 420, color: "#ec4899", gradient: "linear-gradient(135deg,#ec4899,#f97316)", Icon: Drum, member: "SD", image: "https://img.youtube.com/vi/UQBvl_wZ0ak/hq720.jpg" },
    { name: "live_tony", title: "Tony M — Vocal Check", numParticipants: 18, creationTime: now - 180, color: "#f97316", gradient: "linear-gradient(135deg,#f97316,#ef4444)", Icon: Mic, member: "TM", image: "https://img.youtube.com/vi/BzHUNTZ66zY/hq720.jpg" },
  ];
};

export default function LiveHubClient({ sanityContent }: { sanityContent?: any }) {
  const [rooms, setRooms] = useState<LiveRoom[]>(getDemoRooms);
  const [viewers, setViewers] = useState<Record<string, number>>(() =>
    Object.fromEntries(getDemoRooms().map(r => [r.name, r.numParticipants]))
  );
  const [showAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<"streams" | "users" | "policy">("streams");
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [warnedUsers, setWarnedUsers] = useState<Set<string>>(new Set());
  const [modLog, setModLog] = useState<{ id: string; action: string; user: string; time: number }[]>([]);
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
        try { document.execCommand("copy"); } catch { }
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
      try { document.execCommand("copy"); } catch { }
      document.body.removeChild(textarea);
    }

    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  // Fluctuate viewer counts (throttled for mobile performance & paused when tab hidden)
  useEffect(() => {
    const t = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setViewers(prev => {
        const next = { ...prev };
        getDemoRooms().forEach(r => {
          const delta = Math.floor(Math.random() * 9) - 3;
          next[r.name] = Math.max(10, (next[r.name] ?? r.numParticipants) + delta);
        });
        return next;
      });
    }, 8000);
    return () => clearInterval(t);
  }, []);

  // Simulate occasional flagged messages appearing
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() < 0.25) setFlaggedCount(c => c + 1);
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
    setModLog(prev => [{ id: `mod-${Date.now()}`, action, user, time: Date.now() }, ...prev.slice(0, 49)]);
  }, []);

  const totalViewers = Object.values(viewers).reduce((a, b) => a + b, 0);

  return (
    <section className="min-h-screen pt-[100px] w-full px-0">
      {/* ── HERO HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-5xl mb-10 relative z-10 site-container">
        <div className="text-left">
          <h1>
            {sanityContent?.heroHeading || (
              <>LIVE <span className="inline-block pr-[0.15em]">STREAM HUB</span></>
            )}
          </h1>
          <p className="mt-3 max-w-2xl">
            {sanityContent?.heroSubheading || `${rooms.length} active crew streams · ${totalViewers.toLocaleString()} viewers watching live right now.`}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
            ADMIN OVERLAY
        ══════════════════════════════════════════════════ */}
      {
        showAdmin && (
          <div className="max-w-[1440px] mx-auto mb-12 overflow-hidden" style={{ background: "#08080c", border: "1px solid rgba(239,68,68,0.2)" }}>
            {/* Admin header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: "rgba(239,68,68,0.06)", borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span className="uppercase" style={{ color: "#f87171" }}>Moderation Dashboard</span>
                <span className="px-2 py-0.5 rounded-lg" style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}>LIVE SHOW</span>
              </div>
              <div className="flex items-center gap-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-white/50" /> {totalViewers.toLocaleString()} watching</span>
                <span className="flex items-center gap-1" style={{ color: bannedUsers.size > 0 ? "#f87171" : undefined }}><Ban className="w-3.5 h-3.5" /> {bannedUsers.size} banned</span>
                <span className="flex items-center gap-1" style={{ color: mutedUsers.size > 0 ? "#c084fc" : undefined }}><VolumeX className="w-3.5 h-3.5" /> {mutedUsers.size} muted</span>
                {flaggedCount > 0 && <span className="flex items-center gap-1" style={{ color: "#fca5a5" }}><Siren className="w-3.5 h-3.5" /> {flaggedCount} flagged</span>}
              </div>
            </div>

            {/* Admin tabs */}
            <div className="px-6 pt-3 pb-0 flex gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {(["streams", "users", "policy"] as const).map(tab => (
                <button key={tab} onClick={() => setAdminTab(tab)}
                  className="px-4 py-2 uppercase rounded-t-lg transition-colors"
                  style={{
                    background: adminTab === tab ? "rgba(255,10,61,0.15)" : "transparent",
                    color: adminTab === tab ? "#c084fc" : "rgba(255,255,255,0.35)",
                    borderBottom: adminTab === tab ? "2px solid #a855f7" : "2px solid transparent",
                  }}>
                  {tab === "streams" && <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 inline" /> Streams ({rooms.length})</span>}
                  {tab === "users" && <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 inline" /> Chat Users</span>}
                  {tab === "policy" && <span className="flex items-center gap-1.5"><ScrollText className="w-3.5 h-3.5 inline" /> Policy</span>}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {/* ── STREAMS TAB ── */}
              {adminTab === "streams" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {rooms.map(room => (
                    <div key={room.name} className="overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      {/* Mini feed */}
                      <div className="aspect-video relative">
                        <Image
 src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
 alt={room.title}
 fill
 priority
 sizes="(max-width: 768px) 100vw, 400px"
 className="object-cover"
 />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "#dc2626" }}>
                          <span className="w-1.5 h-1.5 rounded-lg bg-white animate-pulse" />
                          LIVE
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.7)" }}>
                          👁 {(viewers[room.name] ?? room.numParticipants).toLocaleString()}
                        </div>
                      </div>
                      {/* Card info */}
                      <div className="p-3">
                        <p className=" ">{room.title}</p>
                        <p style={{ color: "rgba(255,255,255,0.3)" }}>{getElapsed(room.creationTime)}</p>
                        <div className="flex gap-1.5 mt-3">
                          <Link href={`/live/${room.name.replace(/^live_/, "")}`}
 className="flex-1 text-center py-1.5 rounded-lg transition-colors"
 style={{ background: `rgba(${parseInt(room.color.slice(1, 3), 16)},${parseInt(room.color.slice(3, 5), 16)},${parseInt(room.color.slice(5, 7), 16)},0.15)`, color: room.color, border: `1px solid ${room.color}40` }}>
                            👁 Watch
                          </Link>
                          <button aria-label="Previous"
 onClick={() => { setRooms(prev => prev.filter(r => r.name !== room.name)); addLog("🛑 Ended stream", room.title); }}
                            className="py-1.5 px-3 rounded-lg transition-colors"
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {FAKE_FANS.map(fan => {
                    const isBanned = bannedUsers.has(fan.id);
                    const isMuted = mutedUsers.has(fan.id);
                    const isWarned = warnedUsers.has(fan.id);
                    return (
                      <div key={fan.id} className="flex items-center justify-between gap-3 p-4"
 style={{
 background: isBanned ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)",
 border: isBanned ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.07)",
 opacity: isBanned ? 0.65 : 1,
 }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: fan.color }}>
                            {fan.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="truncate" style={{ color: fan.color }}>{fan.name}</span>
                              {isBanned && <span className="px-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", fontSize: 9 }}>BANNED</span>}
                              {isMuted && !isBanned && <span className="px-1.5 rounded-lg" style={{ background: "rgba(156,163,175,0.15)", color: "#9ca3af", fontSize: 9 }}>MUTED</span>}
                              {isWarned && !isBanned && <span className="px-1.5 rounded-lg" style={{ background: "rgba(192, 132, 252,0.15)", color: "#c084fc", fontSize: 9 }}>WARNED</span>}
                            </div>
                            <p style={{ color: "rgba(255,255,255,0.25)" }}>{fan.tier} · {fan.msgs} msgs</p>
                          </div>
                        </div>
                        {!isBanned && (
                          <div className="flex items-center gap-1 shrink-0">
                            {!isWarned && (
                              <button onClick={() => { setWarnedUsers(s => new Set(s).add(fan.id)); addLog("⚠️ Warned", fan.name); }} title="Warn"
                                className="w-8 h-8 rounded-lg flex items-center justify-center "
                                style={{ background: "rgba(192, 132, 252,0.1)" }}>⚠️</button>
                            )}
                            {!isMuted && (
                              <button onClick={() => { setMutedUsers(s => new Set(s).add(fan.id)); addLog("🔇 Muted", fan.name); }} title="Mute"
                                className="w-8 h-8 rounded-lg flex items-center justify-center "
                                style={{ background: "rgba(156,163,175,0.08)" }}>🔇</button>
                            )}
                            <button onClick={() => { setBannedUsers(s => new Set(s).add(fan.id)); addLog("🚫 Banned", fan.name); }} title="Ban"
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: "rgba(239,68,68,0.12)" }}>🚫</button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Mod log */}
                  {modLog.length > 0 && (
                    <div className="col-span-full mt-4 p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="uppercase mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>📋 Recent Actions</p>
                      <div className="space-y-1">
                        {modLog.slice(0, 5).map(e => (
                          <div key={e.id} className="flex items-center justify-between" style={{ color: "rgba(255,255,255,0.4)" }}>
                            <span>{e.action} — <span style={{ color: "#c084fc" }}>{e.user}</span></span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                  <div>
                    <p className="uppercase mb-3" style={{ color: "#f87171" }}>🚫 Zero-Tolerance — Instant Ban</p>
                    {[
                      { icon: "🔞", rule: "Adult / pornographic content", desc: "Explicit content, NSFW links, or adult platform promotion." },
                      { icon: "⚠️", rule: "Hate speech & slurs", desc: "Racist, homophobic, or discriminatory language." },
                      { icon: "🚨", rule: "Threats & violence", desc: "Any threats toward people, band, or venue staff." },
                    ].map(({ icon, rule, desc }) => (
                      <div key={rule} className="mb-2 p-3" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                        <p>{icon} {rule}</p>
                        <p className="mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="uppercase mb-3" style={{ color: "#c084fc" }}>⚠️ Warn First — Then Mute/Kick</p>
                    {[
                      { icon: "🏛️", rule: "Political commentary", desc: "No political debate, parties, or electoral content." },
                      { icon: "📢", rule: "Spam & self-promotion", desc: "Links, social handles, or money solicitation." },
                      { icon: "🔄", rule: "Excessive repetition", desc: "Flooding chat with same message or emoji spam." },
                      { icon: "💊", rule: "Drug references", desc: "Discussion of illegal substances during the event." },
                    ].map(({ icon, rule, desc }) => (
                      <div key={rule} className="mb-2 p-3" style={{ background: "rgba(192, 132, 252,0.06)", border: "1px solid rgba(192, 132, 252,0.15)" }}>
                        <p>{icon} {rule}</p>
                        <p className="mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
                      </div>
                    ))}
                    <div className="mt-2 p-3" style={{ background: "rgba(255,10,61,0.08)", border: "1px solid rgba(255,10,61,0.2)" }}>
                      <p className="mb-1">✅ Keep It Positive</p>
                      <p style={{ color: "rgba(255,255,255,0.35)" }}>This is a fan space for music lovers — keep the energy high! 🎸</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* ══════════════════════════════════════════════════
            STREAM CARDS GRID WITH MATCHING PAGE PADDING
        ══════════════════════════════════════════════════ */}
      <div className="site-container grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
        {rooms.map((room, i) => (
          <div
 key={room.name}
 className="group rounded-lg overflow-hidden"
 style={{ "--room-color": room.color } as React.CSSProperties}>
            <Link href={`/live/${room.name.replace(/^live_/, "")}`}>
              {/* Thumbnail with video concert image */}
              <div className="aspect-video bg-black/60 relative overflow-hidden">
                <Image
 src={room.image || "https://img.youtube.com/vi/wDEXG3kHjqk/hq720.jpg"}
 alt={room.title}
 fill
 priority={i < 2}
 sizes="(max-width: 768px) 100vw, 50vw"
 className="object-cover"
 />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* LIVE badge */}
                <div className="absolute top-4 left-4 z-10">
                  <SectionBadge className="gap-1.5 backdrop-blur-[10px]">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Live Now</span>
                  </SectionBadge>
                </div>

                {/* Viewer + time pills */}
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", color: "#d1fae5" }}>
                    <span className="w-1.5 h-1.5 rounded-lg bg-emerald-400" />
                    {(viewers[room.name] ?? room.numParticipants).toLocaleString()} viewers
                  </div>
                  <div className="px-2.5 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                    {getElapsed(room.creationTime)}
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.3)" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: room.color + "33", border: `2px solid ${room.color}66` }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={room.color}><polygon points="5 3 19 12 5 21 5 3" /></svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Card meta */}
            <div className="p-6 flex items-center justify-between relative bg-black/40 backdrop-blur-[45px] text-white">
              {/* Avatar badge */}
              <div
 className="absolute -top-5 right-6 w-11 h-11 rounded-full flex items-center justify-center text-white ring-4 ring-white/20 pointer-events-none select-none z-10"
 style={{ background: room.gradient }}>
                {room.member}
              </div>

              <div className="min-w-0 flex-1 pr-2">
                <h3 className="text-white mb-1 truncate text-base md:text-lg">{room.title}</h3>
                <p className="font-medium text-xs md:text-sm text-white/60">LiveKit Stream · Started {getElapsed(room.creationTime)}</p>
              </div>

              <button
 type="button"
 aria-label="Copy stream link"
 onClick={(e) => handleCopyLink(e, room.name.replace(/^live_/, ""))}
                className={`ml-2 md:ml-4 shrink-0 px-3 md:px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border cursor-pointer whitespace-nowrap z-20 ${copiedSlug === room.name.replace(/^live_/, "")
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "bg-white/10 hover:bg-white/20 border-white/10 text-white active:scale-95"
                  }`}>
                {copiedSlug === room.name.replace(/^live_/, "") ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Stream Push Alert & Fan Signup Modal */}
      <PushSubscribeModal
 isOpen={showSubscribeModal}
 onClose={() => setShowSubscribeModal(false)}
        group="fans"
      />
    </section>
  );
}
