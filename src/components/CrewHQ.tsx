/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import SearchInput from "@/components/SearchInput";
import { useTransition } from "@/context/TransitionContext";

const MEMBER_SEEDS: Record<string, { id: string; name: string; email: string; avatar: string; role: string }> = {
  sammy: { id: "sammy", name: "Sammy D", email: "sammy@7thheaven.com", avatar: "SD", role: "Vocalist" },
  michael: { id: "michael", name: "Michael Scimeca", email: "michael@7thheaven.com", avatar: "MS", role: "Lead Guitar" },
  ryan: { id: "ryan", name: "Ryan K", email: "ryan@7thheaven.com", avatar: "RK", role: "Bass" },
  tony: { id: "tony", name: "Tony M", email: "tony@7thheaven.com", avatar: "TM", role: "Drums" },
};

// All known chat rooms on the platform
const KNOWN_ROOMS = [
  { id: "live_michael", label: "Michael Live", color: "#6366f1", icon: "🎸" },
  { id: "live_sammy", label: "Sammy Live", color: "#ec4899", icon: "🎤" },
  { id: "live_ryan", label: "Ryan Live", color: "#0ea5e9", icon: "🎵" },
  { id: "live_tony", label: "Tony Live", color: "#10b981", icon: "🥁" },
  { id: "cruise_dashboard", label: "Cruise Lounge", color: "#9333ea", icon: "🛳️" },
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

const fmt = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sc = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sc).padStart(2, "0")}`;
  return `${m}:${String(sc).padStart(2, "0")}`;
};

const getRoomMeta = (room: string) =>
  KNOWN_ROOMS.find(r => r.id === room) || { label: room, color: "rgba(255,255,255,0.3)", icon: "💬" };

const getRoleColor = (role: string) => {
  if (role === "crew") return "#f97316";
  if (role === "admin") return "#9333ea";
  if (role === "cruise") return "#0ea5e9";
  return "#8b5cf6";
};

export function CrewHQ({ defaultMemberId }: { defaultMemberId?: string }) {
  const { requestTransition } = useTransition();
  const slug = (defaultMemberId || "michael").toLowerCase().trim();
  const LS = useCallback((key: string) => `${key}_${slug}`, [slug]);

  // ─── Auth ───────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  // ─── Live status (read-only; Studio writes these) ─────────────────
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [liveDuration, setLiveDuration] = useState(0);
  const [chatRate, setChatRate] = useState(0);

  // ─── Analytics ────────────────────────────────────────────────────
  const [salesRevenue, setSalesRevenue] = useState(0);
  const [salesCount, setSalesCount] = useState(0);
  const [moderationCount, setModerationCount] = useState(0);

  // ─── Site-wide chat feed ───────────────────────────────────────────
  const [msgs, setMsgs] = useState<SiteChatMsg[]>([]);
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [banned, setBanned] = useState<Set<string>>(new Set());
  const [warned, setWarned] = useState<Set<string>>(new Set());
  const [simActive, setSimActive] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // ─── Custom Flagged Keywords State ────────────────────────────────
  const [customWords, setCustomWords] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('7h_custom_flagged_words_v1') || localStorage.getItem('7h_custom_flagged_words');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [newCustomWord, setNewCustomWord] = useState('');

  // ─── Notes ────────────────────────────────────────────────────────
  const [crewNotes, setCrewNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // ─── Auth ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    if (defaultMemberId && MEMBER_SEEDS[defaultMemberId]) {
      const seed = MEMBER_SEEDS[defaultMemberId];
      localStorage.setItem("7h_dev_bypass_v1", "true");
      localStorage.setItem("7h_member_v1", JSON.stringify({
        ...seed, role: "crew",
        joinDate: new Date().toISOString(), points: 0, tier: "Bronze",
        showsAttended: 0, favoriteVenues: [], notificationsEnabled: false, notificationRadius: 25,
      }));
    }
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session) {
          setUserId(session.user.id);
          setDisplayName(session.user.user_metadata?.full_name || "Crew");
          setEmail(session.user.email || "");
          setIsLoading(false); return;
        }
      } catch { }
      if (cancelled) return;
      const stored = localStorage.getItem("7h_member");
      if (stored) {
        try {
          const p = JSON.parse(stored);
          if (p.role === "crew" || p.role === "admin") {
            setUserId(p.id || slug); setDisplayName(p.name || "Crew");
            setEmail(p.email || ""); setIsLoading(false); return;
          }
        } catch { }
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
    return () => { cancelled = true; };
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
  const loadSimAndSales = useCallback(async () => {
    if (!userId) return;
    try {
      const f = localStorage.getItem("7h_flagged_msgs_v1") || localStorage.getItem("7h_flagged_msgs");
      if (f) setFlagged(new Set(JSON.parse(f)));
      const b = localStorage.getItem("7h_banned_users_v1") || localStorage.getItem("7h_banned_users");
      if (b) setBanned(new Set(JSON.parse(b)));
      const w = localStorage.getItem("7h_warned_users_v1") || localStorage.getItem("7h_warned_users");
      if (w) setWarned(new Set(JSON.parse(w)));
      const n = localStorage.getItem(`7h_crew_notes_${slug}`);
      if (n) setCrewNotes(n);
      setModerationCount(parseInt(localStorage.getItem(`7h_mod_count_${slug}`) || "0"));
    } catch { }

    try {
      const res = await fetch("/api/chat/simulate");
      if (res.ok) {
        const d = await res.json();
        setSimActive(d.active);
      }
    } catch { }

    try {
      const res = await fetch("/api/shopify/orders?days=365");
      if (res.ok) {
        const d = await res.json();
        if (d.orders) {
          setSalesRevenue(d.orders.reduce((s: number, o: any) => s + (o.total || 0), 0));
          setSalesCount(d.orders.length);
        }
      }
    } catch { }
  }, [userId, slug]);

  useEffect(() => {
    loadSimAndSales();
  }, [loadSimAndSales]);

  // ─── Load historical messages from all rooms ───────────────────────
  useEffect(() => {
    if (!userId) return;

    // Seed with recent history from DB
    supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }: any) => {
        if (data) setMsgs(data.reverse() as SiteChatMsg[]);
      });

    // Real-time: ALL new inserts to chat_messages
    const channel = supabase
      .channel(`crew_hq_allfeeds_${userId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages"
      }, (payload: any) => {
        const m = payload.new as SiteChatMsg;
        setMsgs(prev => {
          if (prev.find(x => x.id === m.id)) return prev;
          return [...prev, m].slice(-300);
        });
      })
      // Also listen for DELETEs (kick/delete)
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "chat_messages"
      }, (payload: any) => {
        const old = payload.old as { id: string };
        if (old?.id) setMsgs(prev => prev.filter(m => m.id !== old.id));
      })
      .subscribe();

    // Also subscribe to custom words sync events
    const liveEventsChannel = supabase.channel('live_events')
      .on('broadcast', { event: 'custom_words_sync' }, ({ payload }: { payload: any }) => {
        if (payload?.words) {
          setCustomWords(payload.words);
          try { localStorage.setItem('7h_custom_flagged_words_v1', JSON.stringify(payload.words)); } catch { }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(liveEventsChannel);
    };
  }, [userId]);

  // Auto-scroll feed to bottom on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [msgs]);

  // ─── Moderation actions ───────────────────────────────────────────
  const bumpMod = () => {
    const v = moderationCount + 1;
    setModerationCount(v);
    try { localStorage.setItem(`7h_mod_count_${slug}`, v.toString()); } catch { }
  };

  const handleAddCustomWord = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = newCustomWord.trim().toLowerCase();
    if (!w || customWords.includes(w)) return;
    const next = [...customWords, w];
    setCustomWords(next);
    setNewCustomWord('');
    try {
      localStorage.setItem('7h_custom_flagged_words_v1', JSON.stringify(next));
      // Broadcast via Supabase Realtime so other dashboards and fans get the update!
      await supabase.channel('live_events').send({
        type: 'broadcast',
        event: 'custom_words_sync',
        payload: { words: next }
      });
    } catch { }
  };

  const handleRemoveCustomWord = async (word: string) => {
    const next = customWords.filter(w => w !== word);
    setCustomWords(next);
    try {
      localStorage.setItem('7h_custom_flagged_words_v1', JSON.stringify(next));
      await supabase.channel('live_events').send({
        type: 'broadcast',
        event: 'custom_words_sync',
        payload: { words: next }
      });
    } catch { }
  };

  const handleFlag = (msgId: string) => {
    const next = new Set(flagged);
    if (next.has(msgId)) next.delete(msgId); else next.add(msgId);
    setFlagged(next);
    try { localStorage.setItem("7h_flagged_msgs_v1", JSON.stringify([...next])); } catch { }
    bumpMod();
  };

  const handleWarn = async (senderName: string, room: string) => {
    if (!senderName || senderName === displayName) return;
    const currentlyWarned = warned.has(senderName);
    const action = currentlyWarned ? 'unwarn' : 'warn';

    const next = new Set(warned);
    if (next.has(senderName)) next.delete(senderName); else next.add(senderName);
    setWarned(next);
    try { localStorage.setItem("7h_warned_users_v1", JSON.stringify([...next])); } catch { }
    bumpMod();

    try {
      const res = await fetch('/api/moderation/warn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: senderName, room, action, reason: 'Inappropriate behavior' })
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Failed to update warning in database:', err.error);
      }
    } catch (e) {
      console.error('Failed to call moderation warn API:', e);
    }
  };

  const handleBan = async (senderName: string, room: string) => {
    if (!senderName || senderName === displayName) return;
    const currentlyBanned = banned.has(senderName);
    const action = currentlyBanned ? 'unban' : 'ban';

    const next = new Set(banned);
    if (next.has(senderName)) next.delete(senderName); else next.add(senderName);
    setBanned(next);
    try { localStorage.setItem("7h_banned_users_v1", JSON.stringify([...next])); } catch { }
    bumpMod();

    try {
      const res = await fetch('/api/moderation/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: senderName, action, room })
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Failed to update ban in database:', err.error);
      }

      if (action === 'ban') {
        await fetch('/api/chat/ban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room, banned_name: senderName, reason: 'Moderator action' })
        });
      } else {
        await fetch('/api/chat/unban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room, banned_name: senderName })
        });
      }
    } catch (e) {
      console.error('Failed to call moderation ban API:', e);
    }
  };

  const handleKick = async (msgId: string, senderName: string, room: string) => {
    if (!senderName) return;
    if (!confirm(`WARNING: This will permanently remove ${senderName} from the site, delete their account and profile, and email them a notification. Are you sure you want to do this?`)) return;

    try {
      // 1. Delete the message
      await supabase.from("chat_messages").delete().eq("id", msgId);
      setMsgs(prev => prev.filter(m => m.id !== msgId));

      // 2. Call the site-wide kick API
      const res = await fetch('/api/moderation/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: senderName, room })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to remove user: ${err.error}`);
      } else {
        alert(`${senderName} has been successfully removed from the site.`);
      }
    } catch (e) {
      console.error(e);
      alert('Error removing user');
    }
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
        crew_name: displayName,
        content: crewNotes, updated_at: new Date().toISOString(),
      });
    } catch { }
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const toggleSimulator = async () => {
    const nextState = !simActive;
    try {
      const res = await fetch("/api/chat/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextState ? "start" : "stop", room: roomFilter === "all" ? "cruise_dashboard" : roomFilter })
      });
      if (res.ok) {
        setSimActive(nextState);
      }
    } catch { }
  };



  // Derived filtered feed
  const filteredMsgs = msgs.filter(m => {
    if (roomFilter !== "all" && m.room !== roomFilter) return false;
    if (roleFilter === "flagged" && !flagged.has(m.id)) return false;
    if (roleFilter === "banned" && !banned.has(m.sender_name)) return false;
    if (roleFilter === "warned" && !warned.has(m.sender_name)) return false;
    if (search && !m.content.toLowerCase().includes(search.toLowerCase()) &&
      !m.sender_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Room counts
  const roomCounts = KNOWN_ROOMS.reduce((acc, r) => {
    acc[r.id] = msgs.filter(m => m.room === r.id).length;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) return <div className="min-h-screen  " />;

  const member = MEMBER_SEEDS[slug];
  const studioPath = `/crew-${defaultMemberId || slug}/studio`;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white font-sans pt-20">

      {/* ─── STICKY HEADER ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
        <div className="site-container py-3 flex items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-xs  font-bold  border border-emerald-500/30">
                {member?.avatar || displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#030303] ${isLive ? "bg-red-500 shadow-[0_0_6px_#ef4444]" : "bg-slate-600"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className=" font-bold  text-sm">{displayName}</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-[var(--color-accent)] text-[var(--font-size-4xs)]  font-bold  uppercase tracking-widest rounded">Crew HQ</span>
                {isLive && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 text-[var(--font-size-4xs)]  font-bold  uppercase tracking-widest rounded"><span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />LIVE</span>}
              </div>
              <span className="text-[var(--font-size-3xs)] text-white/25">{email}</span>
            </div>
          </div>

          {/* Centre — live stats when live */}
          {isLive && (
            <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-red-950/30 border border-red-500/20">
              <div className="text-center">
                <p className="text-lg  font-bold  text-red-400">{viewerCount.toLocaleString()}</p>
                <p className="text-[var(--font-size-4xs)] text-white/30 uppercase tracking-widest">Viewers</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-lg  font-bold  text-white">{fmt(liveDuration)}</p>
                <p className="text-[var(--font-size-4xs)] text-white/30 uppercase tracking-widest">Duration</p>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="text-center">
                <p className="text-lg  font-bold  text-yellow-400">{chatRate}/min</p>
                <p className="text-[var(--font-size-4xs)] text-white/30 uppercase tracking-widest">Chat Rate</p>
              </div>
            </div>
          )}

          {/* Right — Switch + CTA */}
          <div className="flex items-center gap-3">
            <select aria-label="Select option"
              className="bg-[var(--color-bg-card)] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[var(--color-accent)]/40 cursor-pointer"
              onChange={e => { if (e.target.value) requestTransition(e.target.value); }}
              value={`/crew-${defaultMemberId || slug}`}
            >
              {Object.values(MEMBER_SEEDS).map(m => (
                <option key={m.id} value={`/crew-${m.id}`}>{m.name}</option>
              ))}
            </select>

            <Link
              href={studioPath}
              className={`flex items-center gap-2 px-5 py-2   font-bold  text-xs uppercase tracking-widest transition-colors  ${isLive
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
        <div className="relative overflow-hidden border border-white/[0.07] bg-gradient-to-r from-[#0d0d18] via-[#0a0a14] to-[#080810] p-6">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(white 1px,transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            {/* Profile */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-emerald-800 flex items-center justify-center text-2xl  font-bold  border border-emerald-500/25">
                {member?.avatar || displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-2xl  font-bold  tracking-tight">{displayName}</p>
                <p className="text-sm text-[var(--color-accent)] font-semibold">{member?.role || "Crew"}</p>
                <p className="text-xs text-white/30 mt-0.5">{email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-[var(--color-accent)] text-[var(--font-size-3xs)]  font-bold  uppercase tracking-wider rounded">7th Heaven</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-[var(--color-accent)] text-[var(--font-size-3xs)]  font-bold  uppercase tracking-wider rounded">Active Crew</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { label: "Revenue", value: `$${salesRevenue.toLocaleString("en", { minimumFractionDigits: 0 })}`, icon: "💰", color: "#10b981" },
                { label: "Orders", value: salesCount.toString(), icon: "🛒", color: "#6366f1" },
                { label: "Mod Actions", value: moderationCount.toString(), icon: "🛡️", color: "#ec4899" },
                { label: "Chat Msgs", value: msgs.filter(m => m.room.includes(slug)).length.toString(), icon: "💬", color: "#9333ea" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="text-center px-5 py-3 bg-white/[0.03] border border-white/[0.06] min-w-[80px]">
                  <p className="text-xl  font-bold " style={{ color }}>{value}</p>
                  <p className="text-[var(--font-size-3xs)] text-white/25 mt-0.5">{icon} {label}</p>
                </div>
              ))}
            </div>

            {/* Launch CTA */}
            <Link
              href={studioPath}
              className={`shrink-0 flex flex-col items-center justify-center gap-1 w-32 h-24   font-bold  text-xs uppercase tracking-widest text-center transition-colors border ${isLive
                ? "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                : "bg-white/[0.04] border-white/10  text-white  hover:bg-white/[0.08] hover:text-white hover:border-white/20"
                }`}
            >
              <span className="text-3xl">{isLive ? "📡" : "🎥"}</span>
              <span className="leading-tight">{isLive ? "Live\nStudio" : "Create\nLive Feed"}</span>
            </Link>
          </div>
        </div>



        {/* ─── MAIN GRID: Chat Feed (wide) + Notes (narrow) ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

          {/* ── LEFT COLUMN: SITE-WIDE MONITOR & POLICIES ─────── */}
          <div className="flex flex-col gap-5 flex-1 min-w-0">
            <div className="  border border-white/[0.07] overflow-hidden flex flex-col" style={{ height: "calc(100vh - 340px)", minHeight: "480px" }}>

              {/* Feed header */}
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className=" font-bold  text-sm">📡 Site-Wide Chat Monitor</span>
                    <span className="px-2 py-0.5 bg-white/[0.05] rounded-lg text-[var(--font-size-3xs)] text-white/30 font-mono">{msgs.length} msgs</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live" />
                    <button aria-label="Action button"
                      onClick={toggleSimulator}
                      className={`ml-2 px-2.5 py-1 rounded-lg  font-bold  text-[var(--font-size-4xs)] uppercase tracking-widest transition-colors cursor-pointer border ${simActive
                        ? "bg-purple-600 text-white border-purple-500 shadow-[0_0_12px_rgba(147, 51, 234,0.35)] animate-pulse"
                        : "bg-[#e1e6ff29]   border border-white/10 text-white/40 hover: text-white "
                        }`}
                    >
                      {simActive ? "⚡ Sim Active" : "Start Sim"}
                    </button>
                  </div>

                  {/* Search */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <SearchInput
                      value={search}
                      onChange={setSearch}
                      placeholder="Search messages…"
                      containerClassName="max-w-[300px]"
                      ariaLabel="Search messages"
                    />
                    <select aria-label="Select option"
                      value={roleFilter}
                      onChange={e => setRoleFilter(e.target.value)}
                      className="bg-[var(--color-bg-surface)] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-[var(--color-accent)]/40 cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="flagged">🚩 Flagged</option>
                      <option value="warned">⚠️ Warned</option>
                      <option value="banned">🚫 Banned</option>
                    </select>
                  </div>
                </div>

                {/* Room filter pills */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button aria-label="Action button"
                    onClick={() => setRoomFilter("all")}
                    className={`px-3 py-1 rounded-full text-[var(--font-size-3xs)]  font-bold  uppercase tracking-widest transition-colors cursor-pointer border ${roomFilter === "all" ? "bg-white text-black border-white" : "border-white/[0.1] text-white/35 hover: text-white "
                      }`}
                  >
                    All Rooms ({msgs.length})
                  </button>
                  {KNOWN_ROOMS.map(room => (
                    <button aria-label="Action button"
                      key={room.id}
                      onClick={() => setRoomFilter(roomFilter === room.id ? "all" : room.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-[var(--font-size-3xs)]  font-bold  uppercase tracking-widest transition-colors cursor-pointer border ${roomFilter === room.id
                        ? "text-white border-opacity-100"
                        : "border-white/[0.08] text-white/30 hover: text-white "
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
                        className={`flex items-start gap-3 px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors group ${isFlagged ? "bg-yellow-500/[0.04]" : ""
                          } ${isBanned ? "opacity-30" : ""}`}
                      >
                        {/* Avatar */}
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--font-size-4xs)]  font-bold  shrink-0 mt-0.5"
                          style={{ background: roleColor + "22", color: roleColor }}
                        >
                          {(msg.sender_avatar || msg.sender_name || "??").slice(0, 2).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-[var(--font-size-2xs)]  font-bold " style={{ color: roleColor }}>
                              {msg.sender_name}
                            </span>
                            <span
                              className="text-[var(--font-size-4xs)] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: room.color + "20", color: room.color, border: `1px solid ${room.color}40` }}
                            >
                              {room.icon} {room.label}
                            </span>
                            <span className="text-[var(--font-size-4xs)] text-white/20 font-mono">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isFlagged && <span className="text-[var(--font-size-4xs)] text-yellow-400 font-bold">🚩 flagged</span>}
                            {warned.has(msg.sender_name) && <span className="text-[var(--font-size-4xs)] text-purple-300 font-bold">⚠️ warned</span>}
                            {isBanned && <span className="text-[var(--font-size-4xs)] text-red-400 font-bold">🚫 banned</span>}
                          </div>
                          <p className="text-sm text-white/75 break-words">{msg.content}</p>
                        </div>

                        {/* Action buttons — appear on hover */}
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                          <button aria-label="Action button"
                            onClick={() => handleFlag(msg.id)}
                            title="Flag message"
                            className={`px-2 py-1 rounded-lg text-[var(--font-size-3xs)] border transition-colors cursor-pointer ${isFlagged ? "border-yellow-500/50 bg-yellow-500/15 text-yellow-400" : "border-yellow-500/25 text-yellow-500/70 hover:bg-yellow-500/10"
                              }`}
                          >🚩</button>
                          <button aria-label="Action button"
                            onClick={() => handleWarn(msg.sender_name, msg.room)}
                            title={warned.has(msg.sender_name) ? "Unwarn user" : "Warn user"}
                            className={`px-2 py-1 rounded-lg text-[var(--font-size-3xs)] border transition-colors cursor-pointer ${warned.has(msg.sender_name) ? "border-[var(--color-border-purple)] bg-[var(--color-purple-glow)] text-[var(--color-purple-light)]" : "border-[var(--color-border-purple)] text-[var(--color-purple-light)] hover:bg-[var(--color-purple-glow)]"
                              }`}
                          >⚠️</button>
                          <button aria-label="Action button"
                            onClick={() => handleBan(msg.sender_name, msg.room)}
                            title={isBanned ? "Unban user" : "Ban user"}
                            className={`px-2 py-1 rounded-lg text-[var(--font-size-3xs)] border transition-colors cursor-pointer ${isBanned ? "border-red-500/50 bg-red-500/15 text-red-400" : "border-red-500/25 text-red-500/70 hover:bg-red-500/10"
                              }`}
                          >🚫</button>
                          <button aria-label="Action button"
                            onClick={() => handleKick(msg.id, msg.sender_name, msg.room)}
                            title="Remove Fan Completely"
                            className="px-2 py-1 rounded-lg text-[var(--font-size-3xs)] border border-red-500/25 text-red-500/70 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >🚪</button>
                          <button aria-label="Action button"
                            onClick={() => handleDeleteMsg(msg.id)}
                            title="Delete message"
                            className="px-2 py-1 rounded-lg text-[var(--font-size-3xs)] border border-white/[0.08] text-white/30 hover:bg-[#e1e6ff29]   transition-colors cursor-pointer"
                          >🗑</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Feed footer stats */}
              <div className="px-5 py-2.5 border-t border-white/[0.05] flex items-center justify-between text-[var(--font-size-3xs)] text-white/25 flex-shrink-0">
                <span>Showing {filteredMsgs.length} of {msgs.length} messages</span>
                <span className="flex items-center gap-3">
                  <span>🚩 {flagged.size} flagged</span>
                  <span>⚠️ {warned.size} warned</span>
                  <span>🚫 {banned.size} banned</span>
                  <span>🛡️ {moderationCount} actions taken</span>
                </span>
              </div>

              {/* Chat Moderation Panel */}
              <div className="  border border-white/[0.07] overflow-hidden">
                <div className="p-4 border-b border-white/[0.05] flex items-center gap-3 bg-[var(--color-bg-elevated)]">
                  <div className="w-10 h-10 bg-[var(--color-accent-pink)]/20 border border-[#ec4899]/30 flex items-center justify-center text-xl">🛡️</div>
                  <div>
                    <h3 className="text-sm  font-bold  italic tracking-wide text-white">Chat Moderation & Policies</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Custom Flagged Keywords & Filters</p>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="flex-1 min-w-0 w-full space-y-2">
                      <h4 className="text-xs  font-bold  uppercase tracking-widest text-[var(--color-accent-pink)]">🔍 Custom Flagged Keywords</h4>
                      <p className="text-white/40 text-xs leading-relaxed font-sans font-semibold">
                        Add specific keywords, slurs, or phrases. Any message containing these (case-insensitive substring match) will be automatically flagged on all live feeds.
                      </p>

                      <form onSubmit={handleAddCustomWord} className="flex gap-2 max-w-md mt-2">
                        <input aria-label="Input field"
                          type="text"
                          value={newCustomWord}
                          onChange={e => setNewCustomWord(e.target.value)}
                          placeholder="e.g. ticket-scalper"
                          className="flex-1 bg-black/60 border border-white/10 px-4 py-2.5 text-xs text-white outline-none focus:border-[#ec4899]/50 font-bold"
                        />
                        <button aria-label="Action button"
                          type="submit"
                          className="px-5 py-2.5 bg-[var(--color-accent-pink)] hover:bg-[var(--color-accent-pink)] text-black  font-bold  text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Add Keyword
                        </button>
                      </form>
                    </div>

                    <div className="w-full lg:w-[450px] shrink-0 space-y-2">
                      <p className="text-xs  font-bold  uppercase tracking-widest text-white/40">Active Custom Filters</p>
                      {customWords.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-white/5 bg-white/[0.01]">
                          <p className="text-white/20 text-xs italic">No custom keywords configured.</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                          {customWords.map(word => (
                            <span
                              key={word}
                              className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-[#e1e6ff29]   border border-white/10 text-xs font-bold text-white/80"
                            >
                              <span>{word}</span>
                              <button aria-label="Action button"
                                type="button"
                                onClick={() => handleRemoveCustomWord(word)}
                                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Live Stream Status Card */}
            <div className={` border overflow-hidden transition-colors ${isLive
              ? "border-red-500/35 bg-gradient-to-b from-red-950/40 to-[#080810] shadow-[0_0_30px_rgba(239,68,68,0.1)]"
              : "border-white/[0.07]  "
              }`}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base  font-bold ">🎥 Broadcast Studio</span>
                  {isLive && <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-[var(--font-size-4xs)] text-red-400  font-bold  uppercase"><span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />LIVE</span>}
                </div>

                {isLive ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center p-2.5 bg-white/[0.03] rounded-lg">
                      <span className="text-xs text-white/40">Viewers</span>
                      <span className="text-sm  font-bold  text-red-400">{viewerCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white/[0.03] rounded-lg">
                      <span className="text-xs text-white/40">Duration</span>
                      <span className="text-sm  font-bold  font-mono">{fmt(liveDuration)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-white/[0.03] rounded-lg">
                      <span className="text-xs text-white/40">Chat Rate</span>
                      <span className="text-sm  font-bold  text-yellow-400">{chatRate}/min</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-white/30 mb-4 leading-relaxed">
                    Launch your broadcast studio to go live, manage chat, run raffles, and drop merch in real-time.
                  </p>
                )}

                <Link
                  href={studioPath}
                  className={`w-full flex items-center justify-center gap-2 py-3   font-bold  text-sm uppercase tracking-widest transition-colors ${isLive
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
                    className="w-full mt-2 flex items-center justify-center gap-1 py-2 text-xs font-bold border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors"
                  >
                    👁 View Fan Feed ↗
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Analytics */}
            <div className="  border border-white/[0.07] p-5">
              <h3 className=" font-bold  text-xs uppercase tracking-widest text-white/25 mb-4">My Analytics</h3>
              <div className="space-y-3">
                {[
                  { label: "All-Time Revenue", value: `$${salesRevenue.toLocaleString("en", { minimumFractionDigits: 0 })}`, color: "#10b981" },
                  { label: "Total Orders", value: salesCount.toString(), color: "#6366f1" },
                  { label: "Messages in My Rooms", value: msgs.filter(m => m.room.includes(slug)).length.toString(), color: "#9333ea" },
                  { label: "Moderation Actions", value: moderationCount.toString(), color: "#ec4899" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-white/[0.025]">
                    <span className="text-xs text-white/40">{label}</span>
                    <span className="text-sm  font-bold " style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Crew Notes */}
            <div className="  border border-white/[0.07] p-5 flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className=" font-bold  text-sm">📝 Notes for Admin</h3>
                  <p className="text-[var(--font-size-3xs)] text-white/25 mt-0.5">Saved to Supabase</p>
                </div>
                <button aria-label="Action button"
                  onClick={handleSaveNotes}
                  className={`px-4 py-1.5 rounded-lg text-[var(--font-size-3xs)]  font-bold  uppercase tracking-widest cursor-pointer transition-colors ${notesSaved ? "bg-emerald-500/15 text-[var(--color-accent)] border border-emerald-500/25" : "bg-[#e1e6ff29]   text-white/40 border border-white/[0.08] hover:text-white"
                    }`}
                >
                  {notesSaved ? "✓ Saved" : "Save"}
                </button>
              </div>
              <textarea aria-label="Text input"
                value={crewNotes}
                onChange={e => setCrewNotes(e.target.value)}
                placeholder="Stream notes, incidents, requests for admin…"
                className="w-full h-32 bg-[#040408] border border-white/[0.07] p-3 text-xs text-white/70 placeholder:text-white/15 resize-none outline-none focus:border-[var(--color-accent)]/35 transition-colors font-mono"
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
                  className="flex items-center gap-2 p-3   border border-white/[0.07] hover: border-white/20  hover:bg-white/[0.02] transition-colors group"
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
