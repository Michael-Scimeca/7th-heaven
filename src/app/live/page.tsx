/* eslint-disable react-doctor/no-giant-component */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

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
  emoji: string;
  member: string;
}

/* ═══════════════════════════════════════════════════════
   MINI CANVAS FEED — per-card live preview
═══════════════════════════════════════════════════════ */

function MiniCanvasFeed({ color, index }: { color: string; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const hex = color.startsWith("#") ? color : "#a855f7";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) { canvas.width = rect.width; canvas.height = rect.height; }
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Stagger phase per card
    const phaseOffset = index * 1.3;
    let lastTs = 0;
    const FRAME_INTERVAL = 1000 / 24; // cap at 24fps — 4 canvases × 60fps was too heavy

    const draw = (ts: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (ts - lastTs < FRAME_INTERVAL) return; // throttle
      lastTs = ts;
      const t = ts / 1000 + phaseOffset;
      const W = canvas.width, H = canvas.height;
      if (!W || !H) return;

      ctx.fillStyle = "#030305";
      ctx.fillRect(0, 0, W, H);

      // Stage ambient
      const amb = ctx.createLinearGradient(0, H * 0.4, 0, H);
      amb.addColorStop(0, `rgba(${r},${g},${b},0)`);
      amb.addColorStop(0.6, `rgba(${r},${g},${b},0.08)`);
      amb.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = amb;
      ctx.fillRect(0, H * 0.4, W, H * 0.6);

      // Beams
      [0.2, 0.5, 0.78].forEach((xf, i) => {
        const bx = W * xf + Math.sin(t * 0.6 + i * 1.2) * W * 0.04;
        const colorH = ((t * 35 + i * 120) % 360);
        const g2 = ctx.createLinearGradient(bx, 0, bx, H * 0.7);
        g2.addColorStop(0, `hsla(${colorH},100%,70%,0.3)`);
        g2.addColorStop(1, `hsla(${colorH},100%,60%,0)`);
        ctx.beginPath();
        ctx.moveTo(bx - 3, 0);
        ctx.lineTo(bx + 3, 0);
        ctx.lineTo(bx + 50, H * 0.7);
        ctx.lineTo(bx - 50, H * 0.7);
        ctx.closePath();
        ctx.fillStyle = g2;
        ctx.fill();
      });

      // Performer
      const px = W / 2 + Math.sin(t * 0.35) * W * 0.02;
      const py = H * 0.78;
      const sc = H * 0.002;
      ctx.save();
      ctx.translate(px, py);
      ctx.fillStyle = "rgba(0,0,0,0.9)";
      // legs
      [[- 15, 0, -20, -90, -5, -90, 0, 0], [15, 0, 20, -90, 5, -90, 0, 0]].forEach(pts => {
        ctx.beginPath();
        ctx.moveTo((pts[0] as number) * sc, 0);
        ctx.lineTo((pts[2] as number) * sc, (pts[3] as number) * sc);
        ctx.lineTo((pts[4] as number) * sc, (pts[5] as number) * sc);
        ctx.lineTo(0, 0);
        ctx.fill();
      });
      ctx.fillRect(-20 * sc, -160 * sc, 40 * sc, 70 * sc);
      ctx.beginPath();
      ctx.arc(0, -175 * sc, 17 * sc, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Crowd
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let i = 0; i <= 20; i++) {
        const cx = (i / 20) * W;
        const cy = H * (0.84 + 0.04 * Math.sin(i * 0.8)) + Math.sin(t * 1.5 + i) * H * 0.006;
        ctx.lineTo(cx, cy);
      }
      ctx.lineTo(W, H);
      ctx.fill();

      // Vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.8);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [color, index]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* CSS grain + scanlines — much cheaper than pixel-level getImageData */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
        backgroundSize: "150px 150px",
        opacity: 0.35,
        mixBlendMode: "overlay",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
      }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   FAKE CHAT USERS for admin panel
═══════════════════════════════════════════════════════ */

const FAKE_FANS = [
  { id: "fan-jess",    name: "Jess_M",      avatar: "JM", color: "#a78bfa", tier: "💎 Platinum", msgs: 8 },
  { id: "fan-jake",    name: "Jake7H",       avatar: "J7", color: "#60a5fa", tier: "🥇 Gold",    msgs: 5 },
  { id: "fan-chicago", name: "ChicagoLou",   avatar: "CL", color: "#34d399", tier: "🥈 Silver",  msgs: 3 },
  { id: "fan-rock",    name: "rockerdan92",  avatar: "RD", color: "#f87171", tier: "Fan",        msgs: 12 },
  { id: "fan-mel",     name: "MelM",         avatar: "MM", color: "#fb923c", tier: "💎 Platinum", msgs: 6 },
  { id: "fan-lena",    name: "Lena_Music",   avatar: "LM", color: "#e879f9", tier: "🥇 Gold",    msgs: 4 },
];

const getElapsed = (creationTime: number) => {
  const s = Math.floor(Date.now() / 1000 - creationTime);
  if (s < 60) return "Just started";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */

const getDemoRooms = (): LiveRoom[] => {
  const now = Math.floor(Date.now() / 1000);
  return [
    { name: "live_michael", title: "🎸 Mike S — Backstage Cam",     numParticipants: 1247, creationTime: now - 2340, color: "#a855f7", gradient: "linear-gradient(135deg,#8a1cfc,#ec4899)", emoji: "🎸", member: "MS" },
    { name: "live_ryan",    title: "🎹 Ryan K — Keys & Soundcheck",  numParticipants: 412,  creationTime: now - 900,  color: "#06b6d4", gradient: "linear-gradient(135deg,#06b6d4,#8a1cfc)", emoji: "🎹", member: "RK" },
    { name: "live_sammy",   title: "🥁 Sammy D — Drum Warm-Up",      numParticipants: 84,   creationTime: now - 420,  color: "#ec4899", gradient: "linear-gradient(135deg,#ec4899,#f97316)", emoji: "🥁", member: "SD" },
    { name: "live_tony",    title: "🎤 Tony M — Vocal Check",        numParticipants: 18,   creationTime: now - 180,  color: "#f97316", gradient: "linear-gradient(135deg,#f97316,#ef4444)", emoji: "🎤", member: "TM" },
  ];
};

export default function LiveHubPage() {
  const [rooms, setRooms] = useState<LiveRoom[]>(getDemoRooms);
  const [viewers, setViewers] = useState<Record<string, number>>(() =>
    Object.fromEntries(getDemoRooms().map(r => [r.name, r.numParticipants]))
  );
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<"streams" | "users" | "policy">("streams");
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [warnedUsers, setWarnedUsers] = useState<Set<string>>(new Set());
  const [modLog, setModLog] = useState<{ id: string; action: string; user: string; time: number }[]>([]);
  const [liveAlertsEnabled, setLiveAlertsEnabled] = useState(true);
  const [flaggedCount, setFlaggedCount] = useState(0);

  // Fluctuate viewer counts
  useEffect(() => {
    const t = setInterval(() => {
      setViewers(prev => {
        const next = { ...prev };
        getDemoRooms().forEach(r => {
          const delta = Math.floor(Math.random() * 9) - 3;
          next[r.name] = Math.max(10, (next[r.name] ?? r.numParticipants) + delta);
        });
        return next;
      });
    }, 3000);
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
    <section className="min-h-screen pt-[88px] pb-24 w-full" style={{ background: "var(--color-bg-primary)" }}>
      <div className="w-full px-0">


        {/* ── HEADER ── */}
        <div className="w-full px-6 md:px-12 pt-[21px] mb-10">

          {/* Title row */}
          <div className="text-left mb-10">
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight text-left leading-none">
              Live <span className="gradient-text">Stream Hub</span>
            </h1>
            <p className="text-white/40 mt-3 text-lg text-left">
              {rooms.length} active crew streams · {totalViewers.toLocaleString()} viewers watching now
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ADMIN OVERLAY
        ══════════════════════════════════════════════════ */}
        {showAdmin && (
          <div className="max-w-[1440px] mx-auto mb-12 overflow-hidden" style={{ background: "#08080c", border: "1px solid rgba(239,68,68,0.2)" }}>
            {/* Admin header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: "rgba(239,68,68,0.06)", borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span className="font-black uppercase tracking-widest text-sm" style={{ color: "#f87171" }}>Moderation Dashboard</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}>LIVE SHOW</span>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                <span>👁 {totalViewers.toLocaleString()} watching</span>
                <span style={{ color: bannedUsers.size > 0 ? "#f87171" : undefined }}>🚫 {bannedUsers.size} banned</span>
                <span style={{ color: mutedUsers.size > 0 ? "#c084fc" : undefined }}>🔇 {mutedUsers.size} muted</span>
                {flaggedCount > 0 && <span style={{ color: "#fca5a5" }}>🚨 {flaggedCount} flagged</span>}
              </div>
            </div>

            {/* Admin tabs */}
            <div className="px-6 pt-3 pb-0 flex gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {(["streams", "users", "policy"] as const).map(tab => (
                <button aria-label="Action button" key={tab} onClick={() => setAdminTab(tab)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors"
                  style={{
                    background: adminTab === tab ? "rgba(255,10,61,0.15)" : "transparent",
                    color: adminTab === tab ? "#c084fc" : "rgba(255,255,255,0.35)",
                    borderBottom: adminTab === tab ? "2px solid #a855f7" : "2px solid transparent",
                  }}
                >
                  {tab === "streams" && `📡 Streams (${rooms.length})`}
                  {tab === "users" && `👥 Chat Users`}
                  {tab === "policy" && `📜 Policy`}
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
                        <MiniCanvasFeed color={room.color} index={rooms.indexOf(room)} />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold" style={{ background: "#dc2626" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          LIVE
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-bold" style={{ background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.7)" }}>
                          👁 {(viewers[room.name] ?? room.numParticipants).toLocaleString()}
                        </div>
                      </div>
                      {/* Card info */}
                      <div className="p-3">
                        <p className="text-xs font-bold text-white/80 mb-0.5">{room.title}</p>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{getElapsed(room.creationTime)}</p>
                        <div className="flex gap-1.5 mt-3">
                          <Link href={`/live/${room.name.replace(/^live_/, "")}`}
                            className="flex-1 text-center py-1.5 rounded-lg text-xs font-bold transition-colors hover:scale-105"
                            style={{ background: `rgba(${parseInt(room.color.slice(1,3),16)},${parseInt(room.color.slice(3,5),16)},${parseInt(room.color.slice(5,7),16)},0.15)`, color: room.color, border: `1px solid ${room.color}40` }}>
                            👁 Watch
                          </Link>
                          <button aria-label="Previous"
                            onClick={() => { setRooms(prev => prev.filter(r => r.name !== room.name)); addLog("🛑 Ended stream", room.title); }}
                            className="py-1.5 px-3 rounded-lg text-xs font-bold transition-colors hover:scale-105"
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
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0" style={{ background: fan.color }}>
                            {fan.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold truncate" style={{ color: fan.color }}>{fan.name}</span>
                              {isBanned && <span className="px-1.5 rounded-full text-xs" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", fontSize: 9 }}>BANNED</span>}
                              {isMuted && !isBanned && <span className="px-1.5 rounded-full text-xs" style={{ background: "rgba(156,163,175,0.15)", color: "#9ca3af", fontSize: 9 }}>MUTED</span>}
                              {isWarned && !isBanned && <span className="px-1.5 rounded-full text-xs" style={{ background: "rgba(192, 132, 252,0.15)", color: "#c084fc", fontSize: 9 }}>WARNED</span>}
                            </div>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{fan.tier} · {fan.msgs} msgs</p>
                          </div>
                        </div>
                        {!isBanned && (
                          <div className="flex items-center gap-1 shrink-0">
                            {!isWarned && (
                              <button aria-label="Action button" onClick={() => { setWarnedUsers(s => new Set(s).add(fan.id)); addLog("⚠️ Warned", fan.name); }} title="Warn"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:scale-110 transition-transform"
                                style={{ background: "rgba(192, 132, 252,0.1)" }}>⚠️</button>
                            )}
                            {!isMuted && (
                              <button aria-label="Action button" onClick={() => { setMutedUsers(s => new Set(s).add(fan.id)); addLog("🔇 Muted", fan.name); }} title="Mute"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:scale-110 transition-transform"
                                style={{ background: "rgba(156,163,175,0.08)" }}>🔇</button>
                            )}
                            <button aria-label="Action button" onClick={() => { setBannedUsers(s => new Set(s).add(fan.id)); addLog("🚫 Banned", fan.name); }} title="Ban"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:scale-110 transition-transform"
                              style={{ background: "rgba(239,68,68,0.12)" }}>🚫</button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Mod log */}
                  {modLog.length > 0 && (
                    <div className="col-span-full mt-4 p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>📋 Recent Actions</p>
                      <div className="space-y-1">
                        {modLog.slice(0, 5).map(e => (
                          <div key={e.id} className="flex items-center justify-between text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
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
                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#f87171" }}>🚫 Zero-Tolerance — Instant Ban</p>
                    {[
                      { icon: "🔞", rule: "Adult / pornographic content", desc: "Explicit content, NSFW links, or adult platform promotion." },
                      { icon: "⚠️", rule: "Hate speech & slurs", desc: "Racist, homophobic, or discriminatory language." },
                      { icon: "🚨", rule: "Threats & violence", desc: "Any threats toward people, band, or venue staff." },
                    ].map(({ icon, rule, desc }) => (
                      <div key={rule} className="mb-2 p-3" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                        <p className="text-xs font-bold text-white/80">{icon} {rule}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#c084fc" }}>⚠️ Warn First — Then Mute/Kick</p>
                    {[
                      { icon: "🏛️", rule: "Political commentary", desc: "No political debate, parties, or electoral content." },
                      { icon: "📢", rule: "Spam & self-promotion", desc: "Links, social handles, or money solicitation." },
                      { icon: "🔄", rule: "Excessive repetition", desc: "Flooding chat with same message or emoji spam." },
                      { icon: "💊", rule: "Drug references", desc: "Discussion of illegal substances during the event." },
                    ].map(({ icon, rule, desc }) => (
                      <div key={rule} className="mb-2 p-3" style={{ background: "rgba(192, 132, 252,0.06)", border: "1px solid rgba(192, 132, 252,0.15)" }}>
                        <p className="text-xs font-bold text-white/80">{icon} {rule}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>
                      </div>
                    ))}
                    <div className="mt-2 p-3" style={{ background: "rgba(255,10,61,0.08)", border: "1px solid rgba(255,10,61,0.2)" }}>
                      <p className="text-xs font-black text-white/60 mb-1">✅ Keep It Positive</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>This is a fan space for music lovers — keep the energy high! 🎸</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STREAM CARDS GRID (FULL BLEED — FRAMELESS)
        ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full border-none">
          {rooms.map((room, i) => (
            <div
              key={room.name}
              className="group bg-black/40 border-none rounded-none overflow-hidden transition-colors duration-300"
              style={{ "--room-color": room.color } as React.CSSProperties}
            >
              <Link href={`/live/${room.name.replace(/^live_/, "")}`}>
                {/* Thumbnail with canvas feed */}
                <div className="aspect-video bg-[var(--color-bg-primary)] relative overflow-hidden">
                  <MiniCanvasFeed color={room.color} index={i} />

                  {/* LIVE badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md" style={{ background: "#dc2626", boxShadow: "0 0 16px rgba(220,38,38,0.5)" }}>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-xs font-bold uppercase tracking-widest">LIVE NOW</span>
                  </div>

                  {/* Viewer + time pills */}
                  <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", color: "#d1fae5" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {(viewers[room.name] ?? room.numParticipants).toLocaleString()} viewers
                    </div>
                    <div className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                      {getElapsed(room.creationTime)}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: room.color + "33", border: `2px solid ${room.color}66` }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill={room.color}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card meta */}
              <div className="p-6 flex items-center justify-between relative bg-white border-b border-black/10 text-black">
                {/* Avatar badge */}
                <div
                  className="absolute -top-5 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black ring-4 ring-white shadow-md"
                  style={{ background: room.gradient }}
                >
                  {room.member}
                </div>

                <div>
                  <h3 className="text-lg font-black text-black mb-1">{room.title}</h3>
                  <p className="text-sm text-black/60 font-medium">LiveKit Stream · Started {getElapsed(room.creationTime)}</p>
                </div>

                <button aria-label="Action button"
                  onClick={() => {
                    const slug = room.name.replace(/^live_/, "");
                    navigator.clipboard.writeText(`${window.location.origin}/live/${slug}`);
                  }}
                  className="ml-4 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors hover:scale-105 bg-black/5 border border-black/15 text-black hover:bg-black/10 cursor-pointer"
                >
                  COPY LINK
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── SMS ALERTS BANNER (FRAMELESS) ── */}
        {liveAlertsEnabled && (
          <div className="px-6 md:px-12 mt-16 mb-10 relative overflow-hidden bg-transparent border-none">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="text-xs">📲</span>
                <span className="text-xs font-black uppercase tracking-widest text-[var(--color-accent-pink)]">Live Stream Alerts</span>
              </div>
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-black text-black italic tracking-tight mb-3">Never Miss a Live Feed</h2>
                <p className="text-sm text-black/50 mb-8 leading-relaxed">
                  Get a text the moment 7th Heaven goes live — backstage content, surprise streams, live Q&As, and more.
                </p>
                <form action={() => alert("You are now subscribed to Live Stream Alerts!")}
                  className="flex flex-col sm:flex-row gap-3 items-center w-full">
                  <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-black/30 text-sm">📱</span>
                    </div>
                    <input aria-label="Input field" type="tel" placeholder="(312) 555-0199"
                      className="w-full bg-white border border-black/10 py-3.5 pl-12 pr-4 text-black placeholder:text-black/30 text-sm font-mono focus:outline-none focus:border-[#ec4899]/50 transition-colors"
                    />
                  </div>
                  <button aria-label="Action button" type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-accent-pink)] hover:bg-[#db2777] text-white text-sm font-black uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] whitespace-nowrap flex-shrink-0">
                    ALERT ME 🔔
                  </button>
                </form>
                <p className="text-xs text-black/30 mt-4">Standard messaging rates apply. Reply STOP to unsubscribe at any time.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
