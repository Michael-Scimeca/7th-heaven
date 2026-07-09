"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const MEMBER_SEEDS: Record<string, { id: string; name: string; email: string; avatar: string; role: string }> = {
  sammy:   { id: "sammy",   name: "Sammy D",        email: "sammy@7thheaven.com",   avatar: "SD", role: "Vocalist" },
  michael: { id: "michael", name: "Michael Scimeca", email: "michael@7thheaven.com", avatar: "MS", role: "Lead Guitar" },
  ryan:    { id: "ryan",    name: "Ryan K",          email: "ryan@7thheaven.com",    avatar: "RK", role: "Bass" },
  tony:    { id: "tony",    name: "Tony M",          email: "tony@7thheaven.com",    avatar: "TM", role: "Drums" },
};

// All known chat rooms on the platform
const KNOWN_ROOMS = [
  { id: "live_michael", label: "Michael Live",  color: "#6366f1", icon: "🎸" },
  { id: "live_sammy",   label: "Sammy Live",    color: "#ec4899", icon: "🎤" },
  { id: "live_ryan",    label: "Ryan Live",     color: "#0ea5e9", icon: "🎵" },
  { id: "live_tony",    label: "Tony Live",     color: "#10b981", icon: "🥁" },
  { id: "cruise_dashboard", label: "Cruise Lounge", color: "#f59e0b", icon: "🛳️" },
];

interface SiteChatMsg {
  id: string;
  room: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string;
  content: string;
  created_at: string;
}

export function CrewHQ({ defaultMemberId }: { defaultMemberId?: string }) {
  const slug = (defaultMemberId || "michael").toLowerCase().trim();
  const LS = useCallback((key: string) => `${key}_${slug}`, [slug]);

  // ─── Auth ───────────────────────────────────────────────────────────
  const [isLoading, setIsLoading]   = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId]         = useState("");
  const [email, setEmail]           = useState("");

  // ─── Live status (read-only; Studio writes these) ─────────────────
  const [isLive, setIsLive]           = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [liveDuration, setLiveDuration] = useState(0);
  const [chatRate, setChatRate]       = useState(0);

  // ─── Analytics ────────────────────────────────────────────────────
  const [salesRevenue, setSalesRevenue] = useState(0);
  const [salesCount, setSalesCount]     = useState(0);
  const [moderationCount, setModerationCount] = useState(0);

  // ─── Site-wide chat feed ───────────────────────────────────────────
  const [msgs, setMsgs]               = useState<SiteChatMsg[]>([]);
  const [roomFilter, setRoomFilter]   = useState<string>("all");
  const [roleFilter, setRoleFilter]   = useState<string>("all");
  const [search, setSearch]           = useState("");
  const [flagged, setFlagged]         = useState<Set<string>>(new Set());
  const [banned, setBanned]           = useState<Set<string>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);

  // ─── Notes ────────────────────────────────────────────────────────
  const [crewNotes, setCrewNotes]   = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // ─── Auth ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (defaultMemberId && MEMBER_SEEDS[defaultMemberId]) {
      const seed = MEMBER_SEEDS[defaultMemberId];
      localStorage.setItem("7h_dev_bypass", "true");
      localStorage.setItem("7h_member", JSON.stringify({
        ...seed, role: "crew",
        joinDate: new Date().toISOString(), points: 0, tier: "Bronze",
        showsAttended: 0, favoriteVenues: [], notificationsEnabled: false, notificationRadius: 25,
      }));
    }
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUserId(session.user.id);
          setDisplayName(session.user.user_metadata?.full_name || "Crew");
          setEmail(session.user.email || "");
          setIsLoading(false); return;
        }
      } catch {}
      const stored = localStorage.getItem("7h_member");
      if (stored) {
        try {
          const p = JSON.parse(stored);
          if (p.role === "crew" || p.role === "admin") {
            setUserId(p.id || slug); setDisplayName(p.name || "Crew");
            setEmail(p.email || ""); setIsLoading(false); return;
          }
        } catch {}
      }
      const bypass = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("bypass") === "true";
      if (localStorage.getItem("7h_dev_bypass") === "true" || bypass) {
        setUserId(slug);
        setDisplayName(MEMBER_SEEDS[slug]?.name || "Crew");
        setEmail(MEMBER_SEEDS[slug]?.email || "");
        setIsLoading(false); return;
      }
      setIsLoading(false);
    };
    check();
  }, [defaultMemberId, slug]);

  // ─── Poll live status (Studio writes localStorage) ────────────────
  useEffect(() => {
    const poll = () => {
      const live = localStorage.getItem(LS("is_live")) === "true" || localStorage.getItem(`is_live_${slug}`) === "true";
      setIsLive(live);
      setViewerCount(parseInt(localStorage.getItem(`live_viewer_count_${slug}`) || "0"));
      const startStr = localStorage.getItem(LS("live_stream_start"));
      setLiveDuration(startStr && live ? Math.floor((Date.now() - parseInt(startStr)) / 1000) : 0);
      setChatRate(parseInt(localStorage.getItem(`live_chat_rate_${slug}`) || "0"));
    };
    poll();
    const t = setInterval(poll, 2000);
    return () => clearInterval(t);
  }, [slug, LS]);

  // ─── Load moderation state + sales + notes ─────────────────────────
  useEffect(() => {
    if (!userId) return;
    try {
      const f = localStorage.getItem("7h_flagged_msgs");
      if (f) setFlagged(new Set(JSON.parse(f)));
      const b = localStorage.getItem("7h_banned_users");
      if (b) setBanned(new Set(JSON.parse(b)));
      const n = localStorage.getItem(`7h_crew_notes_${slug}`);
      if (n) setCrewNotes(n);
      setModerationCount(parseInt(localStorage.getItem(`7h_mod_count_${slug}`) || "0"));
    } catch {}

    fetch("/api/shopify/orders?days=365").then(r => r.json()).then(d => {
      if (d.orders) {
        setSalesRevenue(d.orders.reduce((s: number, o: any) => s + (o.total || 0), 0));
        setSalesCount(d.orders.length);
      }
    }).catch(() => {});
  }, [userId, slug]);

  // ─── Load historical messages from all rooms ───────────────────────
  useEffect(() => {
    if (!userId) return;

    // Seed with recent history from DB
    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (data) setMsgs(data.reverse() as SiteChatMsg[]);
      });

    // Real-time: ALL new inserts to chat_messages
    const channel = supabase
      .channel(`crew_hq_allfeeds_${userId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages"
      }, (payload) => {
        const m = payload.new as SiteChatMsg;
        setMsgs(prev => {
          if (prev.find(x => x.id === m.id)) return prev;
          return [...prev, m].slice(-300);
        });
      })
      // Also listen for DELETEs (kick/delete)
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "chat_messages"
      }, (payload) => {
        const old = payload.old as { id: string };
        if (old?.id) setMsgs(prev => prev.filter(m => m.id !== old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Auto-scroll feed to bottom on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [msgs]);

  // ─── Moderation actions ───────────────────────────────────────────
  const bumpMod = () => setModerationCount(c => {
    const v = c + 1;
    localStorage.setItem(`7h_mod_count_${slug}`, v.toString());
    return v;
  });

  const handleFlag = (msgId: string) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId); else next.add(msgId);
      try { localStorage.setItem("7h_flagged_msgs", JSON.stringify([...next])); } catch {}
      return next;
    });
    bumpMod();
  };

  const handleBan = (senderName: string) => {
    if (!senderName || senderName === displayName) return;
    setBanned(prev => {
      const next = new Set(prev);
      if (next.has(senderName)) next.delete(senderName); else next.add(senderName);
      try { localStorage.setItem("7h_banned_users", JSON.stringify([...next])); } catch {}
      return next;
    });
    bumpMod();
  };

  const handleKick = async (msgId: string, senderName: string) => {
    // Delete the message from DB (kick = remove message + temp ban)
    await supabase.from("chat_messages").delete().eq("id", msgId);
    setMsgs(prev => prev.filter(m => m.id !== msgId));
    handleBan(senderName);
  };

  const handleDeleteMsg = async (msgId: string) => {
    await supabase.from("chat_messages").delete().eq("id", msgId);
    setMsgs(prev => prev.filter(m => m.id !== msgId));
    bumpMod();
  };

  const handleSaveNotes = async () => {
    try {
      localStorage.setItem(`7h_crew_notes_${slug}`, crewNotes);
      await supabase.from("crew_notes").upsert({
        crew_id: userId, crew_name: displayName,
        content: crewNotes, updated_at: new Date().toISOString(),
      }, { onConflict: "crew_id" });
    } catch {}
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  // ─── Helpers ─────────────────────────────────────────────────────
  const fmt = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`;
    return `${m}:${String(sc).padStart(2,"0")}`;
  };

  const getRoomMeta = (room: string) =>
    KNOWN_ROOMS.find(r => r.id === room) || { label: room, color: "rgba(255,255,255,0.3)", icon: "💬" };

  const getRoleColor = (role: string) => {
    if (role === "crew") return "#f97316";
    if (role === "admin") return "#f59e0b";
    if (role === "cruise") return "#0ea5e9";
    return "#8b5cf6";
  };

  // Derived filtered feed
  const filteredMsgs = msgs.filter(m => {
    if (roomFilter !== "all" && m.room !== roomFilter) return false;
    if (roleFilter === "flagged" && !flagged.has(m.id)) return false;
    if (roleFilter === "banned" && !banned.has(m.sender_name)) return false;
    if (search && !m.content.toLowerCase().includes(search.toLowerCase()) &&
        !m.sender_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Room counts
  const roomCounts = KNOWN_ROOMS.reduce((acc, r) => {
    acc[r.id] = msgs.filter(m => m.room === r.id).length;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) return <div className="min-h-screen bg-[#050508]" />;

  const member = MEMBER_SEEDS[slug];
  const studioPath = `/crew-${defaultMemberId || slug}/studio`;

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans pt-20">

      {/* ─── STICKY HEADER ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#030303]/80 backdrop-blur-xl">
        <div className="site-container py-3 flex items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-xs font-black border border-purple-500/30 shadow-lg">
                {member?.avatar || displayName.slice(0,2).toUpperCase()}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#030303] ${isLive ? "bg-red-500 shadow-[0_0_6px_#ef4444]" : "bg-slate-600"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm">{displayName}</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded">Crew HQ</span>
                {isLive && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest rounded"><span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"/>LIVE</span>}
              </div>
              <span className="text-[10px] text-white/25">{email}</span>
            </div>
          </div>

          {/* Centre — live stats when live */}
          {isLive && (
            <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-red-950/30 border border-red-500/20 rounded-xl">
              <div className="text-center">
                <p className="text-lg font-black text-red-400">{viewerCount.toLocaleString()}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest">Viewers</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-lg font-black text-white">{fmt(liveDuration)}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest">Duration</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-lg font-black text-yellow-400">{chatRate}/min</p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest">Chat Rate</p>
              </div>
            </div>
          )}

          {/* Right — Switch + CTA */}
          <div className="flex items-center gap-3">
            <select
              className="bg-[#111118] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500/40 cursor-pointer"
              onChange={e => { if (e.target.value) window.location.href = e.target.value; }}
              value={`/crew-${defaultMemberId || slug}`}
            >
              {Object.values(MEMBER_SEEDS).map(m => (
                <option key={m.id} value={`/crew-${m.id}`}>{m.name}</option>
              ))}
            </select>

            <Link
              href={studioPath}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                isLive
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_28px_rgba(239,68,68,0.55)]"
                  : "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
              }`}
            >
              <span>{isLive ? "🔴" : "🎥"}</span>
              {isLive ? "Manage Stream" : "Create Live Feed"}
            </Link>
          </div>
        </div>
      </header>

      <div className="site-container py-6 space-y-5">

        {/* ─── CREW MEMBER PROFILE CARD ──────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r from-[#0d0d18] via-[#0a0a14] to-[#080810] p-6">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(white 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            {/* Profile */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center text-2xl font-black border border-purple-500/25 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                {member?.avatar || displayName.slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">{displayName}</p>
                <p className="text-sm text-purple-400 font-semibold">{member?.role || "Crew"}</p>
                <p className="text-xs text-white/30 mt-0.5">{email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[10px] font-black uppercase tracking-wider rounded">7th Heaven</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded">Active Crew</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { label: "Revenue", value: `$${salesRevenue.toLocaleString("en", { minimumFractionDigits: 0 })}`, icon: "💰", color: "#10b981" },
                { label: "Orders", value: salesCount.toString(), icon: "🛒", color: "#6366f1" },
                { label: "Mod Actions", value: moderationCount.toString(), icon: "🛡️", color: "#ec4899" },
                { label: "Chat Msgs", value: msgs.filter(m => m.room.includes(slug)).length.toString(), icon: "💬", color: "#f59e0b" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="text-center px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl min-w-[80px]">
                  <p className="text-xl font-black" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{icon} {label}</p>
                </div>
              ))}
            </div>

            {/* Launch CTA */}
            <Link
              href={studioPath}
              className={`shrink-0 flex flex-col items-center justify-center gap-1 w-32 h-24 rounded-2xl font-black text-xs uppercase tracking-widest text-center transition-all border ${
                isLive
                  ? "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                  : "bg-white/[0.04] border-white/10 text-white/60 hover:bg-white/[0.08] hover:text-white hover:border-white/20"
              }`}
            >
              <span className="text-3xl">{isLive ? "📡" : "🎥"}</span>
              <span className="leading-tight">{isLive ? "Live\nStudio" : "Create\nLive Feed"}</span>
            </Link>
          </div>
        </div>

        {/* ─── MAIN GRID: Chat Feed (wide) + Notes (narrow) ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

          {/* ── SITE-WIDE CHAT FEEDS ──────────────────────────── */}
          <div className="bg-[#080810] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 340px)", minHeight: "480px" }}>

            {/* Feed header */}
            <div className="px-5 py-3.5 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">📡 Site-Wide Chat Monitor</span>
                  <span className="px-2 py-0.5 bg-white/[0.05] rounded-lg text-[10px] text-white/30 font-mono">{msgs.length} msgs</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live"/>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search messages…"
                    className="bg-[#0f0f1a] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus:border-purple-500/40 w-44"
                  />
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="bg-[#0f0f1a] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500/40 cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="flagged">🚩 Flagged</option>
                    <option value="banned">🚫 Banned</option>
                  </select>
                </div>
              </div>

              {/* Room filter pills */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => setRoomFilter("all")}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                    roomFilter === "all" ? "bg-white text-black border-white" : "border-white/[0.1] text-white/35 hover:text-white/60"
                  }`}
                >
                  All Rooms ({msgs.length})
                </button>
                {KNOWN_ROOMS.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setRoomFilter(roomFilter === room.id ? "all" : room.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                      roomFilter === room.id
                        ? "text-white border-opacity-100"
                        : "border-white/[0.08] text-white/30 hover:text-white/60"
                    }`}
                    style={roomFilter === room.id ? { borderColor: room.color, background: room.color + "20", color: room.color } : {}}
                  >
                    {room.icon} {room.label} {roomCounts[room.id] ? `(${roomCounts[room.id]})` : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed messages */}
            <div ref={feedRef} className="flex-1 overflow-y-auto">
              {filteredMsgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
                  <span className="text-4xl">📭</span>
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                filteredMsgs.map((msg) => {
                  const room = getRoomMeta(msg.room);
                  const roleColor = getRoleColor(msg.sender_role);
                  const isBanned = banned.has(msg.sender_name);
                  const isFlagged = flagged.has(msg.id);
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group ${
                        isFlagged ? "bg-yellow-500/[0.04]" : ""
                      } ${isBanned ? "opacity-30" : ""}`}
                    >
                      {/* Avatar */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                        style={{ background: roleColor + "22", color: roleColor }}
                      >
                        {(msg.sender_avatar || msg.sender_name || "??").slice(0,2).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-[11px] font-black" style={{ color: roleColor }}>
                            {msg.sender_name}
                          </span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: room.color + "20", color: room.color, border: `1px solid ${room.color}40` }}
                          >
                            {room.icon} {room.label}
                          </span>
                          <span className="text-[9px] text-white/20 font-mono">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isFlagged && <span className="text-[9px] text-yellow-400 font-bold">🚩 flagged</span>}
                          {isBanned && <span className="text-[9px] text-red-400 font-bold">🚫 banned</span>}
                        </div>
                        <p className="text-sm text-white/75 break-words">{msg.content}</p>
                      </div>

                      {/* Action buttons — appear on hover */}
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                        <button
                          onClick={() => handleFlag(msg.id)}
                          title="Flag message"
                          className={`px-2 py-1 rounded-lg text-[10px] border transition-colors cursor-pointer ${
                            isFlagged ? "border-yellow-500/50 bg-yellow-500/15 text-yellow-400" : "border-yellow-500/25 text-yellow-500/70 hover:bg-yellow-500/10"
                          }`}
                        >🚩</button>
                        <button
                          onClick={() => handleBan(msg.sender_name)}
                          title={isBanned ? "Unban user" : "Ban user"}
                          className={`px-2 py-1 rounded-lg text-[10px] border transition-colors cursor-pointer ${
                            isBanned ? "border-red-500/50 bg-red-500/15 text-red-400" : "border-red-500/25 text-red-500/70 hover:bg-red-500/10"
                          }`}
                        >🚫</button>
                        <button
                          onClick={() => handleKick(msg.id, msg.sender_name)}
                          title="Kick & delete message"
                          className="px-2 py-1 rounded-lg text-[10px] border border-orange-500/25 text-orange-500/70 hover:bg-orange-500/10 transition-colors cursor-pointer"
                        >👢</button>
                        <button
                          onClick={() => handleDeleteMsg(msg.id)}
                          title="Delete message"
                          className="px-2 py-1 rounded-lg text-[10px] border border-white/[0.08] text-white/30 hover:bg-white/5 transition-colors cursor-pointer"
                        >🗑</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Feed footer stats */}
            <div className="px-5 py-2.5 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-white/25 flex-shrink-0">
              <span>Showing {filteredMsgs.length} of {msgs.length} messages</span>
              <span className="flex items-center gap-3">
                <span>🚩 {flagged.size} flagged</span>
                <span>🚫 {banned.size} banned</span>
                <span>🛡️ {moderationCount} actions taken</span>
              </span>
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Live Stream Status Card */}
            <div className={`rounded-2xl border overflow-hidden transition-all ${
              isLive
                ? "border-red-500/35 bg-gradient-to-b from-red-950/40 to-[#080810] shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                : "border-white/[0.07] bg-[#080810]"
            }`}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base font-black">🎥 Broadcast Studio</span>
                  {isLive && <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-[9px] text-red-400 font-black uppercase"><span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"/>LIVE</span>}
                </div>

                {isLive ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center p-2.5 bg-white/[0.03] rounded-lg">
                      <span className="text-xs text-white/40">Viewers</span>
                      <span className="text-sm font-black text-red-400">{viewerCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white/[0.03] rounded-lg">
                      <span className="text-xs text-white/40">Duration</span>
                      <span className="text-sm font-black font-mono">{fmt(liveDuration)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white/[0.03] rounded-lg">
                      <span className="text-xs text-white/40">Chat Rate</span>
                      <span className="text-sm font-black text-yellow-400">{chatRate}/min</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white/30 mb-4 leading-relaxed">
                    Launch your broadcast studio to go live, manage chat, run raffles, and drop merch in real-time.
                  </p>
                )}

                <Link
                  href={studioPath}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                    isLive
                      ? "bg-red-500 hover:bg-red-400 text-white shadow-[0_0_16px_rgba(239,68,68,0.35)]"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  {isLive ? "🔴 Manage Live Stream" : "🎥 Create Live Feed"}
                </Link>

                {isLive && (
                  <Link
                    href={`/live/${defaultMemberId || slug}`}
                    target="_blank"
                    className="w-full mt-2 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all"
                  >
                    👁 View Fan Feed ↗
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Analytics */}
            <div className="bg-[#080810] border border-white/[0.07] rounded-2xl p-5">
              <h3 className="font-black text-xs uppercase tracking-widest text-white/25 mb-4">My Analytics</h3>
              <div className="space-y-3">
                {[
                  { label: "All-Time Revenue", value: `$${salesRevenue.toLocaleString("en", { minimumFractionDigits: 0 })}`, color: "#10b981" },
                  { label: "Total Orders", value: salesCount.toString(), color: "#6366f1" },
                  { label: "Messages in My Rooms", value: msgs.filter(m => m.room.includes(slug)).length.toString(), color: "#f59e0b" },
                  { label: "Moderation Actions", value: moderationCount.toString(), color: "#ec4899" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-white/[0.025] rounded-xl">
                    <span className="text-xs text-white/40">{label}</span>
                    <span className="text-sm font-black" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Crew Notes */}
            <div className="bg-[#080810] border border-white/[0.07] rounded-2xl p-5 flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-black text-sm">📝 Notes for Admin</h3>
                  <p className="text-[10px] text-white/25 mt-0.5">Saved to Supabase</p>
                </div>
                <button
                  onClick={handleSaveNotes}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                    notesSaved ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-white/5 text-white/40 border border-white/[0.08] hover:text-white"
                  }`}
                >
                  {notesSaved ? "✓ Saved" : "Save"}
                </button>
              </div>
              <textarea
                value={crewNotes}
                onChange={e => setCrewNotes(e.target.value)}
                placeholder="Stream notes, incidents, requests for admin…"
                className="w-full h-32 bg-[#040408] border border-white/[0.07] rounded-xl p-3 text-xs text-white/70 placeholder:text-white/15 resize-none outline-none focus:border-purple-500/35 transition-colors font-mono"
              />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Live Studio", href: studioPath, icon: "🎥" },
                { label: "Fan Feed", href: `/live/${slug}`, icon: "📺", external: true },
                { label: "Admin Panel", href: "/admin", icon: "👑", external: true },
                { label: "Fan Wall", href: "/fan-photo-wall", icon: "📸", external: true },
              ].map(({ label, href, icon, external }) => (
                <Link
                  key={label}
                  href={href}
                  target={external ? "_blank" : undefined}
                  className="flex items-center gap-2 p-3 bg-[#080810] border border-white/[0.07] rounded-xl hover:border-white/15 hover:bg-white/[0.02] transition-all group"
                >
                  <span className="text-lg">{icon}</span>
                  <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">{label}</span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
