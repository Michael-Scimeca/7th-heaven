"use client";

import { useMember } from "@/context/MemberContext";
import { useEffect, useState, useCallback } from "react";
import FanUploadForm from "@/components/FanUploadForm";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function FanAccountPage() {
  const { member, isLoggedIn, openModal } = useMember();
  const supabase = createClient();
  const [myPhotos, setMyPhotos] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [merch, setMerch] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [nextShow, setNextShow] = useState<any>(null);
  const [referralCopied, setReferralCopied] = useState(false);

  const referralCode = member?.name?.replace(/\s+/g, '').toUpperCase().slice(0, 6) + (member?.id?.slice(-4) || '7H');

  // Fetch all data
  useEffect(() => {
    if (!member?.name) return;
    fetch("/api/fans").then(r => r.json()).then(data => setMyPhotos(data.filter((p: any) => p.name === member.name))).catch(() => {});
    fetch("/api/tour").then(r => r.json()).then(data => {
      const upcoming = (data || []).filter((s: any) => s.date && new Date(s.date + 'T23:59:59') >= new Date());
      setShows(upcoming);
      if (upcoming.length > 0) setNextShow(upcoming[0]);
    }).catch(() => {});
    fetch("/api/merch").then(r => r.json()).then(data => setMerch(data || [])).catch(() => {});
    try {
      const stored = localStorage.getItem('vip_inbox_messages');
      if (stored) setInboxMessages(JSON.parse(stored));
    } catch (e) {}
  }, [member?.name]);

  // Live stream polling — checks actual crew live status + Supabase broadcasts
  const [liveFeeds, setLiveFeeds] = useState<{room: string; title: string; viewers: number; host: string}[]>([]);

  useEffect(() => {
    const check = async () => {
      try {
        const feeds: {room: string; title: string; viewers: number}[] = [];
        const seenRooms = new Set<string>();

        // 1. PRIMARY: Query Supabase live_streams table
        try {
          const { data: streams } = await supabase
            .from('live_streams')
            .select('*')
            .eq('status', 'live');
          if (streams?.length) {
            for (const st of streams) {
              // Route to /live/live_michael for the crew feed
              const roomName = 'live_michael';
              seenRooms.add(roomName);
              feeds.push({
                room: roomName,
                title: st.title || 'Crew Broadcast',
                viewers: st.viewer_count || 0,
                host: st.title?.split(' — ')[0] || 'Crew Member',
              });
            }
          }
        } catch {}

        // 2. FALLBACK: Query LiveKit for active rooms not already found
        try {
          const res = await fetch('/api/live-rooms');
          const data = await res.json();
          if (data.rooms?.length > 0) {
            for (const room of data.rooms) {
              if (!seenRooms.has(room.name)) {
                seenRooms.add(room.name);
                feeds.push({ room: room.name, title: 'Live Stream', viewers: room.numParticipants || 0, host: 'Crew' });
              }
            }
          }
        } catch {}

        // 3. FALLBACK: Scan localStorage for local crew broadcasts
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;
          let crewId = '';
          if (key.startsWith('crew_is_live_') && localStorage.getItem(key) === 'true') {
            crewId = key.replace('crew_is_live_', '');
          } else if (key.startsWith('7h_crew_is_live_') && localStorage.getItem(key) === 'true') {
            crewId = key.replace('7h_crew_is_live_', '');
          }
          if (crewId && !seenRooms.has(`live_${crewId}`)) {
            seenRooms.add(`live_${crewId}`);
            const title = localStorage.getItem(`stream_title_${crewId}`) || 'Crew Broadcast';
            const viewers = parseInt(localStorage.getItem(`live_viewer_count_${crewId}`) || '0');
            const host = crewId.charAt(0).toUpperCase() + crewId.slice(1);
            feeds.push({ room: `live_${crewId}`, title, viewers, host });
          }
        }

        setLiveFeeds(feeds);
        setIsLive(feeds.length > 0);
      } catch { setIsLive(false); setLiveFeeds([]); }
    };
    check();
    const interval = setInterval(check, 4000);

    // Also listen for Supabase realtime + storage events
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('crew_is_live_') || e.key?.startsWith('7h_crew_is_live_')) check();
    };
    window.addEventListener('storage', handleStorage);

    return () => { clearInterval(interval); window.removeEventListener('storage', handleStorage); };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!nextShow?.date) return;
    const buildTarget = () => {
      // Sanity dates are ISO: '2026-04-24'
      const d = new Date(nextShow.date + 'T20:00:00');
      if (nextShow.time) {
        const match = nextShow.time.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
        if (match) {
          let h = parseInt(match[1]);
          const m = parseInt(match[2] || '0');
          if (match[3].toLowerCase() === 'pm' && h !== 12) h += 12;
          if (match[3].toLowerCase() === 'am' && h === 12) h = 0;
          d.setHours(h, m, 0, 0);
        }
      }
      return d;
    };
    const target = buildTarget();
    if (isNaN(target.getTime())) return;
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setCountdown({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000), secs: Math.floor((diff % 60000) / 1000) });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextShow]);


  if (!isLoggedIn) {
    return (
      <section className="py-48 min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black italic tracking-tight mb-4">Fan <span className="gradient-text">Account</span></h1>
          <p className="text-white/40 mb-8 max-w-sm">Access your VIP dashboard, exclusive deals, and photo submission tools.</p>
          <button onClick={() => openModal('login')} className="px-8 py-3 bg-[var(--color-accent)] text-white text-sm font-bold uppercase tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(133,29,239,0.3)]">
            Login to Access
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 min-h-screen bg-[#050505] border-t border-white/5">
      <div className="site-container">
        
        {/* 🏆 Rewards & Raffle Wins (Dedicated Section) */}
        {inboxMessages.some(m => m.color === 'yellow' || m.title?.includes('Win')) && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {inboxMessages.filter(m => m.color === 'yellow' || m.title?.includes('Win')).map((win, i) => {
              const pinMatch = win.desc?.match(/PIN: (\d+)/);
              const pin = pinMatch ? pinMatch[1] : null;
              return (
                <div key={i} className="bg-gradient-to-br from-[#1a1a25] to-[#0a0a0f] border-2 border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-8xl">🏆</span>
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[0.6rem] font-black text-yellow-500 uppercase tracking-widest mb-4">
                        RAFFLE WINNER
                      </span>
                      <h3 className="text-2xl font-black text-white italic tracking-tight mb-2">
                        {win.title.replace('You Won the Raffle!', '').trim() || 'Prize Claim'}
                      </h3>
                      <p className="text-white/50 text-sm max-w-[280px] leading-relaxed mb-6">
                        {win.desc.split('. Your PIN')[0]}
                      </p>
                    </div>
                    {pin && (
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-3 rounded-xl mb-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                          {/* Simple QR Mockup */}
                          <div className="w-24 h-24 bg-black flex flex-wrap gap-1 p-1">
                            {Array.from({length: 16}).map((_, j) => (
                              <div key={j} className={`w-5 h-5 ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[0.55rem] text-white/40 uppercase font-black tracking-[0.2em] mb-1">Claim PIN</p>
                          <p className="text-3xl font-black text-yellow-500 font-mono tracking-[0.3em]">{pin}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                    <p className="text-[0.6rem] text-white/30 font-bold uppercase tracking-widest">Show this at the merch table</p>
                    <button className="text-[0.65rem] text-yellow-500 font-black uppercase tracking-widest hover:text-white transition-colors">
                      Full Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Account Identity Header */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center text-xl font-black text-[var(--color-accent)]">
              {member?.name?.split(' ').map((n: string)=>n[0]).join('').substring(0,2).toUpperCase() || '?'}
              <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${member?.role === 'admin' ? 'bg-amber-400' : member?.role === 'crew' ? 'bg-emerald-400' : member?.role === 'event_planner' ? 'bg-fuchsia-500' : 'bg-[var(--color-accent)]'} border-2 border-[var(--color-bg-primary)] flex items-center justify-center`}>
                <span className="text-[10px]">
                  {member?.role === 'admin' ? '🛡️' : member?.role === 'crew' ? '🛡️' : member?.role === 'event_planner' ? '📋' : '★'}
                </span>
              </span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black italic tracking-tight">{member?.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.15em] border rounded-full ${
                  member?.role === 'admin' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' :
                  member?.role === 'crew' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' :
                  member?.role === 'event_planner' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' :
                  'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                }`}>
                  {member?.role === 'admin' ? '🛡️ ADMIN' : member?.role === 'crew' ? '🛡️ CREW' : member?.role === 'event_planner' ? '📋 EVENT PLANNER' : '★ FAN'}
                </span>
              </div>
              <p className="text-[0.85rem] text-white/40 font-mono mt-1">{member?.email}</p>
            </div>
          </div>
          <Link href="/fan-photo-wall" className="hidden md:flex flex-col items-end px-6 py-3 bg-white/[0.02] hover:bg-white/5 border border-white/10 transition-colors">
            <span className="text-white text-[0.7rem] font-bold uppercase tracking-widest leading-none">View Public Gallery</span>
            <span className="text-[var(--color-accent)] text-[0.55rem] uppercase tracking-widest mt-1">Global Fan Wall →</span>
          </Link>
        </div>

        {/* 🔴 Backstage Feed — always visible */}
        <div className="mb-6">
          {isLive && liveFeeds.length > 0 ? (
            <div className="space-y-3">
              {liveFeeds.map((feed) => (
                <Link key={feed.room} href={`/live/${feed.room}`} className="block relative overflow-hidden group">
                  <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600/20 via-red-500/10 to-red-600/20 border border-red-500/40 rounded-xl hover:border-red-500/60 transition-all">
                    <div className="flex items-center gap-4">
                      <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                      </span>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-wide">🎥 {feed.host} is LIVE {feed.title ? `— ${feed.title}` : ''}</p>
                        <p className="text-[0.65rem] text-red-300/70 mt-0.5">
                          {feed.viewers > 0 ? `${feed.viewers} watching · ` : ''}Watch the backstage feed before it ends
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-red-500 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-lg group-hover:bg-white group-hover:text-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">Watch Now →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Link href="/live" className="block group">
              <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <span className="relative flex h-4 w-4">
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-white/20" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white/40 uppercase tracking-wide">📡 Backstage is Quiet</p>
                    <p className="text-[0.65rem] text-white/20 mt-0.5">No crew feeds are live right now — check back during the next show</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-white/5 text-white/30 text-[0.65rem] font-black uppercase tracking-widest rounded-lg group-hover:bg-white/10 group-hover:text-white/50 transition-all border border-white/5">Live Hub →</span>
              </div>
            </Link>
          )}
        </div>

        {/* 🔗 Referral Code with QR */}
        <div className="mb-8 p-6 bg-gradient-to-br from-[#0c0c1a] to-[#0a0a14] border border-amber-500/20 rounded-2xl relative overflow-hidden">
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-amber-500/5 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">🔗 Referral Program</span>
            </div>
            <p className="text-white/50 text-sm mb-5 max-w-md">Share your code with friends — when they sign up, you both earn picks and climb the leaderboard!</p>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 p-4 bg-black/40 border border-amber-500/20 rounded-xl">
                  <span className="font-mono text-xl font-black text-amber-400 tracking-[0.15em] flex-1">{referralCode}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(`https://7thheavenband.com/join?ref=${referralCode}`); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
                    className={`px-4 py-2 text-[0.6rem] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${referralCopied ? 'bg-emerald-500 text-white' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black'}`}
                  >
                    {referralCopied ? '✓ Copied!' : 'Copy Link'}
                  </button>
                </div>
                <p className="text-[0.6rem] text-white/25 mt-2 font-mono">7thheavenband.com/join?ref={referralCode}</p>
              </div>
              {/* QR Code via API */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-28 h-28 bg-white rounded-lg p-1.5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://7thheavenband.com/join?ref=${referralCode}`)}&bgcolor=ffffff&color=000000`}
                    alt="Referral QR Code"
                    className="w-full h-full"
                  />
                </div>
                <span className="text-[0.5rem] uppercase tracking-widest text-white/20 font-bold">Scan to Join</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🎵 Next Show Countdown */}
        <div className="mb-8 p-6 bg-gradient-to-br from-[#0c0c1a] to-[#0a0a14] border border-[var(--color-accent)]/20 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-[var(--color-accent)]/5 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1 rounded-full border border-[var(--color-accent)]/20">🎵 Next Show</span>
            {nextShow ? (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-4">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">{nextShow.venue}</h3>
                    <p className="text-white/40 text-sm">{nextShow.city}, {nextShow.state} · {nextShow.date ? new Date(nextShow.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'TBA'}{nextShow.time ? ` · ${nextShow.time}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {[{ v: countdown.days, l: 'Days' }, { v: countdown.hours, l: 'Hrs' }, { v: countdown.mins, l: 'Min' }, { v: countdown.secs, l: 'Sec' }].map((u, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-2xl md:text-3xl font-black text-white tabular-nums bg-white/[0.04] border border-white/10 rounded-lg w-14 h-14 flex items-center justify-center">{String(u.v).padStart(2, '0')}</span>
                        <span className="text-[0.5rem] uppercase tracking-widest text-white/30 font-bold mt-1">{u.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {nextShow.ticketLink && (
                  <a href={nextShow.ticketLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-6 py-2.5 bg-[var(--color-accent)] text-white text-[0.65rem] font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(133,29,239,0.3)]">Get Tickets →</a>
                )}
              </>
            ) : (
              <div className="mt-4 py-8 flex flex-col items-center border border-white/5 bg-white/[0.02] rounded-xl border-dashed">
                <span className="text-3xl mb-2 opacity-30">🎸</span>
                <p className="text-sm text-white/50 font-bold">No upcoming shows scheduled yet.</p>
                <p className="text-[0.6rem] text-white/25 mt-1 uppercase tracking-widest font-bold">Check back soon — new dates drop regularly</p>
                <Link href="/tour" className="mt-3 text-[0.6rem] text-[var(--color-accent)] font-bold uppercase tracking-widest hover:text-white transition-colors">View Tour Page →</Link>
              </div>
            )}
          </div>
        </div>

        {/* 📍 Upcoming Shows */}
        <div className="mb-8 p-6 bg-[#0a0a0f]/80 border border-white/5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-emerald-400">📍 Upcoming Shows</span>
              <Link href="/tour" className="text-[0.6rem] text-white/30 hover:text-[var(--color-accent)] uppercase tracking-widest font-bold transition-colors">All Dates →</Link>
            </div>
            {shows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {shows.slice(0, 3).map((show: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all group">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0">
                    <span className="text-[0.6rem] font-black text-emerald-400 uppercase">{show.date ? new Date(show.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }) : ''}</span>
                    <span className="text-lg font-black text-white leading-none">{show.date ? new Date(show.date + 'T12:00:00').getDate() : ''}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.8rem] font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{show.venue}</p>
                    <p className="text-[0.65rem] text-white/40">{show.city}, {show.state}</p>
                  </div>
                  {show.isSoldOut ? (
                    <span className="text-[0.5rem] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Sold Out</span>
                  ) : show.ticketLink ? (
                    <a href={show.ticketLink} target="_blank" rel="noopener noreferrer" className="text-[0.5rem] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all">Tickets</a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center border border-white/5 bg-white/[0.02] rounded-xl border-dashed">
              <span className="text-2xl mb-2 opacity-20">📍</span>
              <p className="text-sm text-white/40 font-bold">No shows on the horizon yet.</p>
              <p className="text-[0.6rem] text-white/20 mt-1">Follow us for announcements on new dates!</p>
            </div>
          )}
        </div>

        {/* Prize Wallet */}
        <div className="mb-8 p-6 bg-[url('/images/card-glow.jpg')] bg-cover bg-center border border-[var(--color-accent)]/30 rounded-2xl relative overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.15)] group">
         <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-[#0a0a14]/90 to-black/80" />
         <div className="relative z-10 flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
           <span className="text-2xl">🎟️</span>
           <h2 className="text-xl font-black italic tracking-tight">
            Prize <span className="gradient-text">Wallet</span>
           </h2>
          </div>
          <span className="text-[0.55rem] uppercase tracking-[0.2em] font-bold text-[var(--color-accent)]/80 bg-[var(--color-accent)]/10 px-3 py-1 rounded-full border border-[var(--color-accent)]/20">Claim PINs</span>
         </div>
         <div className="relative z-10">
          {(() => {
           const stored = typeof window !== "undefined" ? localStorage.getItem("vip_inbox_messages") : null;
           const messages = stored ? JSON.parse(stored) : [];
           if (messages.length === 0) {
            return (
             <div className="py-6 flex flex-col items-center border border-white/5 bg-white/5 rounded-xl border-dashed">
              <p className="text-sm text-white/50 font-bold">Your wallet is currently empty.</p>
              <p className="text-[0.6rem] text-white/30 mt-1 uppercase tracking-widest font-bold">Keep participating in live streams for a chance to win</p>
             </div>
            );
           }
           return (
            <div className="flex flex-col gap-3">
             {messages.map((msg: any) => {
              const pinMatch = msg.desc.match(/PIN:\s*(\d+)/i);
              const pin = pinMatch ? pinMatch[1] : null;
              return (
               <div key={msg.id} className={`p-4 rounded-xl border bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md ${msg.color === 'yellow' ? 'border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.1)]' : 'border-white/10'}`}>
                <div className="flex items-center gap-4 w-full">
                 <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg text-xl shadow-inner ${msg.color === 'yellow' ? 'bg-gradient-to-br from-yellow-400/20 to-amber-500/10 text-yellow-500 border border-yellow-400/30' : 'bg-white/5 border border-white/10'}`}>{msg.icon}</div>
                 <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                   <h4 className="font-bold text-[0.85rem] text-white tracking-wide">{msg.title}</h4>
                   {msg.isNew && <span className="text-[0.45rem] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-yellow-500 text-black rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]">New</span>}
                  </div>
                  <p className="text-[0.65rem] text-white/60 max-w-sm">{msg.desc.replace(/Your PIN: \d+\.\s*/, '')}</p>
                  <p className="text-[0.5rem] uppercase tracking-widest font-bold text-white/20 mt-1">{msg.time}</p>
                 </div>
                </div>
                {pin && (
                 <div className="flex flex-col sm:flex-row items-center gap-3 px-5 py-2 border border-dashed border-yellow-400/50 rounded-xl bg-yellow-400/5 w-full sm:w-auto mt-2 sm:mt-0">
                  <span className="text-[0.45rem] uppercase tracking-[0.2em] text-yellow-500/80 font-bold whitespace-nowrap">Show this PIN</span>
                  <span className="font-mono text-2xl font-black text-yellow-400 tracking-[0.25em] drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]">{pin}</span>
                 </div>
                )}
               </div>
              );
             })}
            </div>
           );
          })()}
         </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Upload Module */}
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold italic tracking-tight">Photo Submissions</h3>
              </div>
              <FanUploadForm />
            </div>

            {/* Pick Awards */}
            <div className="p-6 bg-white/[0.02] border border-white/10">
             <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
               Pick <span className="gradient-text">Awards</span>
              </h2>
              <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25">Collect Picks · Enter Lotteries</span>
             </div>
             {(() => {
              const pickTypes = [
               { id: "purple", name: "Classic Purple", rarity: "Common", img: "/images/picks/purple.png", color: "#a855f7", owned: 0 },
               { id: "red", name: "Crimson Fire", rarity: "Uncommon", img: "/images/picks/red.png", color: "#ef4444", owned: 0 },
               { id: "black", name: "Stealth Black", rarity: "Uncommon", img: "/images/picks/black.png", color: "#6b7280", owned: 0 },
               { id: "silver", name: "Chrome Silver", rarity: "Rare", img: "/images/picks/silver.png", color: "#c0c0c0", owned: 0 },
               { id: "gold", name: "24K Gold", rarity: "Epic", img: "/images/picks/gold.png", color: "#fbbf24", owned: 0 },
               { id: "holographic", name: "Holographic", rarity: "Legendary", img: "/images/picks/holographic.png", color: "#ec4899", owned: 0 },
              ];
              const totalOwned = pickTypes.reduce((s, p) => s + p.owned, 0);
              const rarityColors: Record<string, string> = {
               Common: "text-white/40", Uncommon: "text-green-400", Rare: "text-blue-400", Epic: "text-yellow-400", Legendary: "text-pink-400",
              };
              return (
               <>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                 {pickTypes.map((pick) => (
                  <div key={pick.id} className={`relative p-3 border text-center transition-all ${pick.owned > 0 ? "border-white/10 bg-white/[0.02]" : "border-white/5 opacity-30 grayscale"}`}>
                   <div className="relative mx-auto w-16 h-16 mb-2">
                    <img src={pick.img} alt={pick.name} className="w-full h-full object-contain" />
                    {pick.owned > 1 && (
                     <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[0.55rem] font-bold bg-[var(--color-accent)] text-white">×{pick.owned}</span>
                    )}
                   </div>
                   <p className="text-[0.6rem] font-bold text-white/70 truncate">{pick.name}</p>
                   <p className={`text-[0.5rem] font-bold uppercase tracking-[0.1em] ${rarityColors[pick.rarity]}`}>{pick.rarity}</p>
                   {pick.owned === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-[0.6rem] font-bold text-white/30 uppercase tracking-[0.15em] bg-black/60 px-2 py-1">Locked</span>
                    </div>
                   )}
                  </div>
                 ))}
                </div>
                <div className="flex items-center gap-6 p-3 bg-white/[0.03] border border-white/5">
                 <div>
                  <p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25">Total Picks</p>
                  <p className="text-xl font-bold text-[var(--color-accent)]">{totalOwned}</p>
                 </div>
                 <div>
                  <p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25">Unique Types</p>
                  <p className="text-xl font-bold text-white">{pickTypes.filter(p => p.owned > 0).length}/{pickTypes.length}</p>
                 </div>
                 <div className="ml-auto text-right">
                  <p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/25">How to earn</p>
                  <p className="text-[0.6rem] text-white/40">Attend shows · Merch purchases · Social shares · Referrals</p>
                 </div>
                </div>
               </>
              );
             })()}
            </div>

          </div>

          {/* Right Column / Sidebar */}
          <div className="space-y-8">
            
            {/* VIP Inbox */}
            <div className="bg-[#0a0a0f]/80 border border-white/5 p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-[#3b82f6]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    VIP Inbox
                  </span>
                  {inboxMessages.filter(m => m.isNew).length > 0 && (
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[0.6rem] uppercase tracking-widest font-bold rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.2)]">{inboxMessages.filter(m => m.isNew).length} New</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {inboxMessages.map((msg, i) => (
                  <div key={msg.id || i} className={`group cursor-pointer p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 ${msg.isNew ? 'bg-white/[0.02]' : 'opacity-60'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${msg.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-emerald-500/20 border-emerald-500/30'} flex items-center justify-center shrink-0`}>
                        <span className="text-[10px]">{msg.icon}</span>
                      </div>
                      <div>
                        <p className={`text-[0.75rem] font-bold text-white transition-colors ${msg.color === 'yellow' ? 'group-hover:text-yellow-400' : 'group-hover:text-blue-400'}`}>{msg.title}</p>
                        <p className="text-[0.7rem] text-white/50 leading-relaxed mt-1">{msg.desc}</p>
                        <p className={`text-[0.6rem] font-bold tracking-widest uppercase mt-2 ${msg.isNew ? 'text-[var(--color-accent)]' : 'text-white/30'}`}>{msg.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty state */}
                {inboxMessages.length === 0 && (
                  <div className="py-8 flex flex-col items-center">
                    <span className="text-2xl opacity-20 mb-2">📬</span>
                    <p className="text-white/30 text-[0.75rem] font-bold">No messages yet.</p>
                    <p className="text-white/20 text-[0.6rem] mt-1">Raffle wins, alerts & updates will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Submissions Track */}
            <div className="bg-[#0a0a0f]/80 border border-white/5 p-6 hover:border-white/10 transition-colors overflow-hidden">
              <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                <span className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-emerald-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  My Submissions
                </span>
                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 leading-none">{myPhotos.length} <span className="text-[0.65rem] text-white/40 font-bold uppercase">Total</span></p>
              </div>
              
              <div className="space-y-3">
                {myPhotos.slice(0, 4).map(photo => (
                  <div key={photo.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-white/10 rounded overflow-hidden shrink-0 border border-white/5 group-hover:border-[var(--color-accent)]/50">
                        <img src={photo.src} alt="thumb" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <p className="text-[0.75rem] font-bold text-white truncate max-w-[150px]">{photo.venue || 'Live Event'}</p>
                        <p className={`text-[0.6rem] font-bold uppercase tracking-widest mt-0.5 ${photo.approved ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {photo.approved ? 'Live on wall' : 'In Review'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {myPhotos.length === 0 && (
                  <div className="py-6 flex flex-col items-center">
                    <span className="text-2xl opacity-20 mb-2">📸</span>
                    <p className="text-white/30 text-[0.75rem]">No submissions yet.</p>
                  </div>
                )}
              </div>
              {myPhotos.length > 4 && (
                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                   <Link href="/fan-photo-wall" className="text-[0.65rem] text-white/40 font-bold uppercase hover:text-[var(--color-accent)] tracking-widest">See on Fan Wall →</Link>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* 🛍️ Merch Quick Shop */}
        {merch.length > 0 && (
          <div className="mt-8 p-6 bg-[#0a0a0f]/80 border border-white/5 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <span className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-fuchsia-400">🛍️ Quick Shop</span>
              <Link href="/store" className="text-[0.6rem] text-white/30 hover:text-[var(--color-accent)] uppercase tracking-widest font-bold transition-colors">Full Store →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {merch.map((item: any) => (
                <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-fuchsia-500/30 transition-all group">
                  {item.image && (
                    <div className="aspect-square bg-black/40 overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-[0.8rem] font-bold text-white truncate">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-black text-fuchsia-400">${parseFloat(item.price).toFixed(0)}</span>
                      <Link href={`/store`} className="text-[0.55rem] font-black uppercase tracking-widest text-white/50 bg-white/5 px-3 py-1.5 rounded border border-white/10 hover:bg-fuchsia-500 hover:text-white hover:border-fuchsia-500 transition-all">Buy Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



      </div>
    </section>
  );
}
