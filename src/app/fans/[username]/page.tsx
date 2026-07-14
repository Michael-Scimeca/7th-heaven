"use client";

import { useMember } from "@/context/MemberContext";
import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProximityPanel from "@/components/ProximityPanel";
import DOMPurify from "dompurify";
import CruiseChat from "@/components/CruiseChat";
import dynamic from "next/dynamic";

const FanUploadForm = dynamic(() => import("@/components/FanUploadForm"), {
  ssr: false,
  loading: () => <p className="text-white/40 animate-pulse">Loading upload form...</p>,
});
import PickAwardsSection from "@/components/PickAwardsSection";
import { EmbarkationCountdown, ImportantLinksWidget, BookingManager } from "@/components/CruiseWidgets";

export default function FanAccountPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { member, isLoggedIn, openModal } = useMember();
  const supabase = createClient();
  const [myPhotos, setMyPhotos] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [merch, setMerch] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0, status: 'upcoming' as 'upcoming' | 'live' | 'ended' });
  const [nextShow, setNextShow] = useState<any>(null);
  const [lastShow, setLastShow] = useState<any>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [liveAlertPhone, setLiveAlertPhone] = useState('');
  const [liveAlertStatus, setLiveAlertStatus] = useState<'idle' | 'saving' | 'subscribed' | 'error'>('idle');
  const [liveAlertSubscribed, setLiveAlertSubscribed] = useState(false);
  const [liveAlertsEnabled, setLiveAlertsEnabled] = useState(true);
  const [memoryText, setMemoryText] = useState('');
  const [memorySubmitting, setMemorySubmitting] = useState(false);
  const [memorySubmitted, setMemorySubmitted] = useState(false);

  // Cruise Community Toggle State
  const [isCruiser, setIsCruiser] = useState(false);
  const [dashboardView, setDashboardView] = useState<'fan' | 'cruise'>('fan');
  const CRUISE_END_DATE = "2026-04-19";

  // Referral Program (admin-controlled)
  const [referralEnabled, setReferralEnabled] = useState(false);
  const [referralMilestones, setReferralMilestones] = useState<{threshold: number; reward: string; emoji: string}[]>([]);

  // Cruise dashboard data
  const [cruiseAnnouncement, setCruiseAnnouncement] = useState<string | null>(null);
  type CruiseItineraryEvent = { id: string; time: string; title: string; subtitle: string };
  type CruiseItineraryDay = { id: string; dayLabel: string; location: string; theme: string; events: CruiseItineraryEvent[]; colorTheme: string };
  const [cruiseItinerary, setCruiseItinerary] = useState<CruiseItineraryDay[]>([]);

  // ── DEMO MODE — DELETE BEFORE GO-LIVE ─────────────────────────────────────
  // When the URL username is 'demo', bypass login and inject a fake fan profile
  // so the client can see the full dashboard without creating an account.
  const isDemoMode = username === 'demo';
  const demoMember = isDemoMode ? ({
    id: 'demo-fan-001', name: 'Demo Fan', email: 'demo@7thheavenband.com',
    role: 'fan' as const,
  } as any) : null;
  // ── END DEMO MODE ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!member?.email) return;
    
    // 1. Check if 60 days have passed since the cruise ended
    const daysSinceCruise = (new Date().getTime() - new Date(CRUISE_END_DATE).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCruise > 60) {
      setIsCruiser(false);
      setDashboardView('fan');
      return;
    }

    // 2. Check if the fan is on the Cruise manifest
    const checkCruiser = async () => {
      const { data } = await supabase.from('cruise_signups').select('id').eq('email', member.email).single();
      if (data || member?.signup_source === 'cruise_member_signup') {
        setIsCruiser(true);
        if (member?.signup_source === 'cruise_member_signup') {
          setDashboardView('cruise');
        }
        // Load cruise data
        fetch(`/api/cruise/itinerary?t=${Date.now()}`, { cache: 'no-store' })
          .then(res => res.json())
          .then(raw => {
            let d = raw; let i = 0;
            while (typeof d === 'string' && i < 3) { try { d = JSON.parse(d); } catch { break; } i++; }
            if (Array.isArray(d) && d.length > 0) setCruiseItinerary(d);
          }).catch(() => {});
        fetch(`/api/cruise/announcement?t=${Date.now()}`, { cache: 'no-store' })
          .then(res => res.json())
          .then(raw => {
            let d = raw; let i = 0;
            while (typeof d === 'string' && i < 3) { try { d = JSON.parse(d); } catch { break; } i++; }
            if (d?.message) setCruiseAnnouncement(d.message); else setCruiseAnnouncement(null);
          }).catch(() => {});
      }
    };
    checkCruiser();
  }, [member?.email, member?.signup_source]);

  // Check if show has already passed (using lastShow, prompt stays active for 3 days after show)
  const showHasPassed = lastShow?.date
    ? (Date.now() - new Date(lastShow.date + 'T00:00:00').getTime()) < (3 * 24 * 60 * 60 * 1000)
    : false;

  // Check if fan already subscribed to live alerts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('7h_live_alert_phone');
      if (saved) { setLiveAlertPhone(saved); setLiveAlertSubscribed(true); setLiveAlertStatus('subscribed'); }
    } catch {}
  }, []);

  const handleLiveAlertSubscribe = async () => {
    const cleaned = liveAlertPhone.replace(/\D/g, '');
    if (cleaned.length < 10) { alert('Please enter a valid 10-digit phone number.'); return; }
    setLiveAlertStatus('saving');
    try {
      const res = await fetch('/api/sms/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned, name: member?.name || 'Fan', zipCode: '00000', source: 'live_alert' }),
      });
      const data = await res.json();
      if (data.success || res.ok) {
        localStorage.setItem('7h_live_alert_phone', cleaned);
        setLiveAlertSubscribed(true);
        setLiveAlertStatus('subscribed');
      } else {
        setLiveAlertStatus('error');
      }
    } catch { setLiveAlertStatus('error'); }
  };

  const referralCode = (member?.name ? member.name.replace(/\s+/g, '').toUpperCase().slice(0, 6) : 'FAN') + (member?.id?.slice(-4) || '7H');

  // Fetch all data
  useEffect(() => {
    fetch("/api/tour").then(r => r.json()).then(data => {
      const upcoming = (data || []).filter((s: any) => s.date && new Date(s.date + 'T23:59:59') >= new Date());
      const past = (data || []).filter((s: any) => s.date && new Date(s.date + 'T23:59:59') < new Date()).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setShows(upcoming);
      if (upcoming.length > 0) setNextShow(upcoming[0]);
      if (past.length > 0) setLastShow(past[0]);
    }).catch(() => {});
    fetch("/api/merch").then(r => r.json()).then(data => setMerch(data || [])).catch(() => {});
    // Load referral program config
    fetch("/api/admin/referral-config").then(r => r.json()).then(data => {
      setReferralEnabled(data.enabled ?? false);
      if (data.milestones?.length) setReferralMilestones(data.milestones);
    }).catch(() => {});
    // Load live alerts visibility toggle
    fetch("/api/admin/settings?key=live_alerts_enabled").then(r => r.json()).then(data => {
      if (data.value === 'off') setLiveAlertsEnabled(false);
    }).catch(() => {});
    // Clear stale session data so dashboard starts fresh
    try {
      localStorage.removeItem('vip_inbox_messages');
      localStorage.removeItem('7h_vip_inbox');
      Object.keys(localStorage).filter(k => k.includes('is_live') || k.includes('crew_is_live') || k.includes('raffle') || k.includes('pinned')).forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }, []);

  // Fetch member-specific data when logged in
  useEffect(() => {
    if (!member?.name) return;
    fetch("/api/fans").then(r => r.json()).then(data => setMyPhotos(data.filter((p: any) => p.name === member.name))).catch(() => {});
  }, [member?.name]);

  // Live stream polling — checks actual crew live status + Supabase broadcasts
  const [liveFeeds, setLiveFeeds] = useState<{room: string; title: string; viewers: number; host: string}[]>([]);

  useEffect(() => {
    const check = async () => {
      try {
        const feeds: {room: string; title: string; viewers: number; host: string}[] = [];
        const seenRooms = new Set<string>();

        // 1. Get active LiveKit rooms for cross-validation
        const activeLkRooms = new Set<string>();
        try {
          const res = await fetch('/api/live-rooms');
          const data = await res.json();
          if (data.rooms?.length > 0) {
            for (const room of data.rooms) {
              activeLkRooms.add(room.name);
            }
          }
        } catch {}

        // 2. Query Supabase live_streams — only show LiveKit-confirmed streams
        try {
          const { data: streams } = await supabase
            .from('live_streams')
            .select('*')
            .eq('status', 'live');
          if (streams?.length) {
            const seenUsers = new Set<string>();
            const staleIds: string[] = [];
            
            for (const st of streams) {
              const roomName = st.stream_url || `live_${st.user_id}`;
              
              // Only show if LiveKit confirms it's actually live
              if (activeLkRooms.has(roomName) && !seenUsers.has(st.user_id) && !seenRooms.has(roomName)) {
                seenUsers.add(st.user_id);
                seenRooms.add(roomName);
                feeds.push({
                  room: roomName,
                  title: st.title || 'Crew Broadcast',
                  viewers: st.viewer_count || 0,
                  host: st.title?.split(' — ')[0] || 'Crew Member',
                });
              } else if (!activeLkRooms.has(roomName)) {
                staleIds.push(st.id);
              }
            }
            
            // Auto-clean stale entries
            if (staleIds.length > 0) {
              supabase.from('live_streams').update({ status: 'ended' }).in('id', staleIds).then(null, () => {});
            }
          }
        } catch {}
        // 3. FALLBACK: Show LiveKit rooms not matched to Supabase entries
        activeLkRooms.forEach((roomName: string) => {
          if (!seenRooms.has(roomName)) {
            seenRooms.add(roomName);
            const hostName = roomName.replace(/^live_/, '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            feeds.push({ room: roomName, title: 'Crew Broadcast', viewers: 0, host: hostName });
          }
        });

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
      const targetTime = target.getTime();
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      
      let status: 'upcoming' | 'live' | 'ended' = 'upcoming';
      if (now >= targetTime) {
        if (now < targetTime + (3.5 * 60 * 60 * 1000)) { // 3.5 hours for the show
          status = 'live';
        } else {
          status = 'ended';
        }
      }

      setCountdown({ 
        days: Math.floor(diff / 86400000), 
        hours: Math.floor((diff % 86400000) / 3600000), 
        mins: Math.floor((diff % 3600000) / 60000), 
        secs: Math.floor((diff % 60000) / 1000),
        status
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextShow]);


  const devBypass = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && localStorage.getItem('7h_dev_bypass') === 'true';

  // Effective member = demo injection (always fan) OR real logged-in user
  const effectiveMember = isDemoMode ? demoMember : member;

  // Specific show notification subscriptions
  const [subscribedShows, setSubscribedShows] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  useEffect(() => {
    if (!effectiveMember?.email) return;
    setLoadingAlerts(true);
    fetch(`/api/shows/notify-me?email=${encodeURIComponent(effectiveMember.email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.subscriptions) {
          setSubscribedShows(data.subscriptions);
        }
      })
      .catch(err => console.error("Error loading show alerts:", err))
      .finally(() => setLoadingAlerts(false));
  }, [effectiveMember?.email]);

  const handleUnsubscribeShow = async (showId: string) => {
    if (!effectiveMember?.email) return;
    try {
      const res = await fetch(`/api/shows/notify-me?email=${encodeURIComponent(effectiveMember.email)}&showId=${encodeURIComponent(showId)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSubscribedShows(prev => prev.filter(s => s.showId !== showId));
      } else {
        alert("Failed to cancel alert subscription. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  if (!isLoggedIn && !devBypass && !isDemoMode) {
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
        {/* ── DEMO BANNER — DELETE BEFORE GO-LIVE ────────────────────────────── */}
        {isDemoMode && (
          <div className="mb-8 flex items-start gap-3 px-5 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <span className="text-amber-400 text-sm font-black uppercase tracking-widest shrink-0">⚠ DEMO MODE</span>
            <p className="text-amber-300/60 text-xs leading-relaxed">This is a preview of the Fan Dashboard with simulated data. Fans will need to create a free account to access their personal dashboard at <code className="text-amber-300/80">/fans/username</code>.</p>
          </div>
        )}
        {/* ── END DEMO BANNER ─────────────────────────────────────────────── */}


        {/* Account Identity Header */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center text-xl font-black text-[var(--color-accent)]">
              {effectiveMember?.name?.split(' ').map((n: string)=>n[0]).join('').substring(0,2).toUpperCase() || '?'}
              <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${
                effectiveMember?.role === 'admin' ? 'bg-amber-400' :
                effectiveMember?.role === 'crew' ? 'bg-emerald-400' :
                effectiveMember?.role === 'event_planner' ? 'bg-fuchsia-500' :
                ((dashboardView === 'cruise' || effectiveMember?.signup_source === 'cruise_member_signup') ? 'bg-cyan-400 text-black' : 'bg-[var(--color-accent)]')
              } border-2 border-[var(--color-bg-primary)] flex items-center justify-center`}>
                <span className="text-[10px]">
                  {effectiveMember?.role === 'admin' ? '🛡️' :
                   effectiveMember?.role === 'crew' ? '🛡️' :
                   effectiveMember?.role === 'event_planner' ? '📋' :
                   ((dashboardView === 'cruise' || effectiveMember?.signup_source === 'cruise_member_signup') ? '🚢' : '★')}
                </span>
              </span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black italic tracking-tight">{effectiveMember?.name}</h1>
                {(() => {
                  const role = effectiveMember?.role;
                  const isCruiseOnly = effectiveMember?.signup_source === 'cruise_member_signup';
                  const showCruise = dashboardView === 'cruise';

                  if (role === 'admin') {
                    return (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-amber-400/10 text-amber-400 border-amber-400/30">
                          🛡️ ADMIN
                        </span>
                        {showCruise && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                            🚢 CRUISE
                          </span>
                        )}
                      </>
                    );
                  }

                  if (role === 'crew') {
                    return (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-emerald-400/10 text-emerald-400 border-emerald-400/30">
                          🛡️ CREW
                        </span>
                        {showCruise && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                            🚢 CRUISE
                          </span>
                        )}
                      </>
                    );
                  }

                  if (role === 'event_planner') {
                    return (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30">
                          📋 EVENT PLANNER
                        </span>
                        {showCruise && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                            🚢 CRUISE
                          </span>
                        )}
                      </>
                    );
                  }

                  if (isCruiseOnly) {
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                        🚢 CRUISE MEMBER
                      </span>
                    );
                  }

                  if (showCruise) {
                    return (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30">
                          ★ FAN
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                          🚢 CRUISE MEMBER
                        </span>
                      </>
                    );
                  }

                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30">
                      ★ FAN
                    </span>
                  );
                })()}
              </div>
              <p className="text-base text-white/40 font-mono mt-1">{effectiveMember?.email}</p>
            </div>
          </div>
          <Link href="/fan-photo-wall" className="hidden md:flex flex-col items-end px-6 py-3 bg-white/[0.02] hover:bg-white/5 border border-white/10 transition-colors">
            <span className="text-white text-sm font-bold uppercase tracking-widest leading-none">View Public Gallery</span>
            <span className="text-[var(--color-accent)] text-xs uppercase tracking-widest mt-1">Global Fan Wall →</span>
          </Link>
        </div>

        {/* Cruise Hub Toggle */}
        {isCruiser && (
          <div className="flex justify-center mb-8 -mt-2">
            <div className="bg-white/[0.03] border border-white/10 rounded-full p-1 inline-flex items-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <button
                onClick={() => setDashboardView('fan')}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  dashboardView === 'fan' ? 'bg-[var(--color-accent)] text-white shadow-[0_0_15px_rgba(133,29,239,0.4)]' : 'text-white/40 hover:text-white'
                }`}
              >
                Fan Dashboard
              </button>
              <button
                onClick={() => setDashboardView('cruise')}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  dashboardView === 'cruise' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/40 hover:text-cyan-400'
                }`}
              >
                🚢 Cruise Hub
              </button>
            </div>
          </div>
        )}

        {dashboardView === 'cruise' ? (
          <div>
            {/* Cruise Header */}
            <header className="mb-8 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">🚢</span>
                  <div>
                    <h1 className="text-3xl font-black uppercase tracking-widest text-white">Cruise Hub</h1>
                    <p className="text-[var(--color-accent)] font-bold text-sm tracking-widest uppercase mt-1">Passenger Area</p>
                  </div>
                </div>
                <p className="text-white/60 text-lg max-w-xl">Welcome aboard, <strong className="text-white">{member?.name || 'Guest'}</strong>. Here is your official cruise status and early access portal.</p>
              </div>
              <div className="shrink-0">
                <EmbarkationCountdown />
              </div>
            </header>

            {/* Captain's Log */}
            {cruiseAnnouncement && (
              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-950/40 to-[#0a0a0f] border border-cyan-500/30 rounded-2xl mb-8 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />
                <div className="p-6 md:p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      <span className="animate-pulse">🔔</span>
                    </div>
                    <h3 className="text-lg font-black italic tracking-wider text-white uppercase">Captain&apos;s Log</h3>
                    <span className="ml-auto text-xs font-bold tracking-[0.2em] uppercase text-cyan-500/60 border border-cyan-500/20 px-2 py-1 rounded">Priority Update</span>
                  </div>
                  <div
                    className="text-white/80 text-sm leading-relaxed space-y-4 [&_a]:text-cyan-400 [&_a]:underline [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_strong]:text-white [&_strong]:font-bold"
                    dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(cruiseAnnouncement) : cruiseAnnouncement }}
                  />
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <BookingManager email={member?.email} />
                  <ImportantLinksWidget />
                </div>

                {cruiseItinerary.length > 0 && (
                  <div>
                    <h2 className="text-xl font-black italic tracking-wide text-white uppercase mb-6 flex items-center gap-3">
                      <span className="text-[var(--color-accent)]">⚓</span> Official Itinerary <span className="text-xs font-bold text-white/30 tracking-widest not-italic ml-2 uppercase">Subject to Change</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cruiseItinerary.map(day => (
                        <div key={day.id} className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300" style={{ '--tw-border-opacity': '0.4', borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)` } as React.CSSProperties}>
                          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 transition-all duration-500 pointer-events-none opacity-10 group-hover:opacity-20" style={{ backgroundColor: day.colorTheme }} />
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded border" style={{ color: day.colorTheme, backgroundColor: `color-mix(in srgb, ${day.colorTheme} 10%, transparent)`, borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)` }}>{day.dayLabel}</span>
                              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{day.location}</span>
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">{day.theme}</h3>
                            <ul className="space-y-4 mt-5 border-t border-white/5 pt-5">
                              {day.events.map(ev => (
                                <li key={ev.id} className="flex items-start gap-4">
                                  <span className="font-mono text-xs font-bold tracking-wider mt-0.5" style={{ color: day.colorTheme }}>{ev.time}</span>
                                  <div>
                                    <strong className="block text-white text-sm tracking-wide">{ev.title}</strong>
                                    <span className="text-white/40 text-xs">{ev.subtitle}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 flex flex-col gap-6">
                  {/* Passengers Widget */}
                  <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-accent)]/20 transition-all duration-500 pointer-events-none" />
                    <div className="flex justify-between items-end mb-5 relative z-10">
                      <div>
                        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-1">Community</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-black text-2xl italic tracking-wide">412</span>
                          <span className="text-[var(--color-accent)] font-bold uppercase tracking-widest text-xs">Fans Onboard</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center relative z-10 mb-4">
                      <div className="flex -space-x-3">
                        {['JD', 'SL', 'MT', 'AB', 'RC', 'KW'].map((initials, i) => {
                          const colors = ['bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-pink-500'];
                          return (
                            <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0b0b12] ${colors[i % colors.length]} flex items-center justify-center overflow-hidden shadow-lg hover:-translate-y-1 transition-transform cursor-pointer`} style={{ zIndex: 10 - i }}>
                              <span className="text-xs font-black text-white/90 tracking-widest">{initials}</span>
                            </div>
                          );
                        })}
                        <div className="w-10 h-10 rounded-full border-2 border-[#0b0b12] bg-[var(--color-accent)]/20 flex items-center justify-center shadow-lg text-[var(--color-accent)] font-bold text-xs">
                          +406
                        </div>
                      </div>
                    </div>
                    <p className="text-white/30 text-xs leading-relaxed relative z-10 border-t border-white/5 pt-4">
                      Join the official 7th Heaven cruise community. See who else is sailing, coordinate shore excursions, and make new friends!
                    </p>
                  </div>
                  <CruiseChat />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
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
                        <p className="text-xs text-red-300/70 mt-0.5">
                          {feed.viewers > 0 ? `${feed.viewers} watching · ` : ''}Watch the backstage feed before it ends
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-lg group-hover:bg-white group-hover:text-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]">Watch Now →</span>
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
                    <p className="text-xs text-white/20 mt-0.5">No crew feeds are live right now — check back during the next show</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-white/5 text-white/30 text-xs font-black uppercase tracking-widest rounded-lg group-hover:bg-white/10 group-hover:text-white/50 transition-all border border-white/5">Live Hub →</span>
              </div>
            </Link>
          )}
        </div>

        {/* 🏆 Rewards & Raffle Wins */}
        {inboxMessages.some(m => m.color === 'yellow' || m.title?.includes('Win')) && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {inboxMessages.filter(m => m.color === 'yellow' || m.title?.includes('Win')).map((win, i) => {
              const pinMatch = win.desc?.match(/PIN: (\d+)/);
              const pin = pinMatch ? pinMatch[1] : null;
              
              let isClaimed = false;
              if (typeof window !== 'undefined' && pin) {
                try {
                  const claimed = JSON.parse(localStorage.getItem('claimed_raffle_pins') || '[]');
                  isClaimed = claimed.includes(pin);
                } catch {}
              }

              return (
                <div key={i} className={`bg-gradient-to-br from-[#1a1a25] to-[#0a0a0f] border-2 ${isClaimed ? 'border-emerald-500/20 opacity-60' : 'border-yellow-500/30'} rounded-2xl p-6 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-8xl">🏆</span>
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">
                          ✓ PRIZE CLAIMED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs font-black text-yellow-500 uppercase tracking-widest mb-4">
                          RAFFLE WINNER
                        </span>
                      )}
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
                          <div className="w-24 h-24 bg-black flex flex-wrap gap-1 p-1">
                            {Array.from({length: 16}).map((_, j) => (
                              <div key={j} className={`w-5 h-5 ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-white/40 uppercase font-black tracking-[0.2em] mb-1">Claim PIN</p>
                          <p className={`text-3xl font-black ${isClaimed ? 'text-emerald-400 line-through' : 'text-yellow-500'} font-mono tracking-[0.3em]`}>{pin}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest">
                      {isClaimed ? 'Prize handed off successfully' : 'Show this at the merch table'}
                    </p>
                    <button className={`text-xs ${isClaimed ? 'text-emerald-400' : 'text-yellow-500'} font-black uppercase tracking-widest hover:text-white transition-colors`}>
                      {isClaimed ? 'Completed ✓' : 'Full Details →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 🎵 Next Show Countdown */}
        {(() => {
          const isHappeningNow = nextShow && countdown.status === 'live';
          const isEnded = nextShow && countdown.status === 'ended';
          return (
        <div className={`mb-8 p-6 bg-gradient-to-br from-[#0c0c1a] to-[#0a0a14] border ${isHappeningNow ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-[var(--color-accent)]/20'} rounded-2xl relative overflow-hidden`}>
          <div className={`absolute -right-16 -top-16 w-48 h-48 ${isHappeningNow ? 'bg-emerald-500/8' : 'bg-[var(--color-accent)]/5'} blur-[80px] rounded-full`} />
          <div className="relative z-10">
            {isHappeningNow ? (
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
                Happening Now
              </span>
            ) : isEnded ? (
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">🎵 Show Completed</span>
            ) : (
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1 rounded-full border border-[var(--color-accent)]/20">🎵 Next Show</span>
            )}
            {nextShow ? (() => {
              return (
              <>
                <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-4 ${isHappeningNow ? 'border border-emerald-500/20 bg-emerald-500/[0.03] rounded-xl p-4 -mx-1' : ''}`}>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">{nextShow.venue}</h3>
                    <p className="text-white/40 text-sm">{nextShow.city}, {nextShow.state} · {nextShow.date ? new Date(nextShow.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'TBA'}{nextShow.time ? ` · ${nextShow.time}` : ''}</p>
                  </div>
                  {isHappeningNow ? (
                    <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      </span>
                      <span className="text-emerald-400 text-sm font-black uppercase tracking-widest">Happening Now</span>
                    </div>
                  ) : isEnded ? (
                    <div className="flex items-center gap-3 px-5 py-3 bg-white/[0.02] border border-white/10 rounded-xl">
                      <span className="text-white/40 text-sm font-black uppercase tracking-widest">Thanks for coming!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {[{ v: countdown.days, l: 'Days' }, { v: countdown.hours, l: 'Hrs' }, { v: countdown.mins, l: 'Min' }, { v: countdown.secs, l: 'Sec' }].map((u, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <span className="text-2xl md:text-3xl font-black text-white tabular-nums bg-white/[0.04] border border-white/10 rounded-lg w-14 h-14 flex items-center justify-center">{String(u.v).padStart(2, '0')}</span>
                          <span className="text-2xs uppercase tracking-widest text-white/30 font-bold mt-1">{u.l}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {nextShow.ticketLink && !isHappeningNow && !isEnded && (
                  <a href={nextShow.ticketLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 px-6 py-2.5 bg-[var(--color-accent)] text-white text-xs font-black uppercase tracking-widest rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(133,29,239,0.3)]">Get Tickets →</a>
                )}
              </>
              );
            })() : (
              <div className="mt-4 py-8 flex flex-col items-center border border-white/5 bg-white/[0.02] rounded-xl border-dashed">
                <span className="text-3xl mb-2 opacity-30">🎸</span>
                <p className="text-sm text-white/50 font-bold">No upcoming shows scheduled yet.</p>
                <p className="text-xs text-white/25 mt-1 uppercase tracking-widest font-bold">Check back soon — new dates drop regularly</p>
                <Link href="/#tour" className="mt-3 text-xs text-[var(--color-accent)] font-bold uppercase tracking-widest hover:text-white transition-colors">View Tour Page →</Link>
              </div>
            )}
          </div>
        </div>
          );
        })()}

        {/* 📍 Upcoming Shows */}
        <div className="mb-8 p-6 bg-[#0a0a0f]/80 border border-white/5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">📍 Upcoming Shows</span>
              <Link href="/#tour" className="text-xs text-white/30 hover:text-[var(--color-accent)] uppercase tracking-widest font-bold transition-colors">All Dates →</Link>
            </div>
            {shows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {shows.slice(0, 3).map((show: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-emerald-500/30 transition-all group">
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0">
                    <span className="text-xs font-black text-emerald-400 uppercase">{show.date ? new Date(show.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' }) : ''}</span>
                    <span className="text-lg font-black text-white leading-none">{show.date ? new Date(show.date + 'T12:00:00').getDate() : ''}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{show.venue}</p>
                    <p className="text-xs text-white/40">{show.city}, {show.state}</p>
                  </div>
                  {show.isSoldOut ? (
                    <span className="text-2xs font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Sold Out</span>
                  ) : show.ticketLink ? (
                    <a href={show.ticketLink} target="_blank" rel="noopener noreferrer" className="text-2xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all">Tickets</a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center border border-white/5 bg-white/[0.02] rounded-xl border-dashed">
              <span className="text-2xl mb-2 opacity-20">📍</span>
              <p className="text-sm text-white/40 font-bold">No shows on the horizon yet.</p>
              <p className="text-xs text-white/20 mt-1">Follow us for announcements on new dates!</p>
            </div>
          )}
        </div>

        {/* 📍 Proximity Alerts & Who's Going */}
        <div className="mb-8">
          <ProximityPanel />
        </div>

        {/* 🔔 Specific Show Alerts */}
        <div className="mb-8 p-6 bg-[#0a0a0f]/80 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-400">
              🔔 Subscribed Show Alerts
            </span>
            <span className="text-2xs font-bold text-white/30 uppercase tracking-widest">Specific Tour Dates</span>
          </div>

          {loadingAlerts ? (
            <div className="py-8 flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : subscribedShows.length > 0 ? (
            <div className="space-y-3">
              {subscribedShows.map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-purple-500/30 transition-all group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg shrink-0 text-purple-400 font-bold text-xs uppercase">
                      🔔
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{sub.venueName}</p>
                      <p className="text-xs text-white/40">
                        {sub.showDate ? sub.showDate : "Upcoming Date"}{sub.city ? ` · ${sub.city}, ${sub.state}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsubscribeShow(sub.showId)}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-2xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                  >
                    Cancel Alert
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center border border-white/5 bg-white/[0.02] rounded-xl border-dashed">
              <span className="text-2xl mb-2 opacity-20">🔔</span>
              <p className="text-sm text-white/40 font-bold">You aren&apos;t tracking any specific shows yet.</p>
              <p className="text-xs text-white/20 mt-1">Click the bell icon on the tour page to get date alerts.</p>
              <Link href="/#tour" className="mt-3 text-xs text-[var(--color-accent)] font-bold uppercase tracking-widest hover:text-white transition-colors">Find Shows →</Link>
            </div>
          )}
        </div>

        {/* 🚢 Cruise Promo Banner — only if cruise window is active and user hasn't signed up */}
        {!isCruiser && ((new Date().getTime() - new Date(CRUISE_END_DATE).getTime()) / (1000 * 60 * 60 * 24)) < 60 && (
          <Link href="/cruise" className="block mb-8 group">
            <div className="relative overflow-hidden bg-gradient-to-r from-[#0a1628] via-[#0c1a2e] to-[#0a1628] border border-cyan-500/20 rounded-2xl p-6 md:p-8 hover:border-cyan-500/40 transition-all shadow-[0_0_30px_rgba(6,182,212,0.05)] hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]">
              <div className="absolute -right-24 -top-24 w-64 h-64 bg-cyan-500/8 rounded-full blur-[80px] group-hover:bg-cyan-500/15 transition-all duration-700" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[var(--color-accent)]/5 rounded-full blur-[60px]" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🚢</span>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">Limited Spots</span>
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wide mb-1">7th Heaven is Setting Sail!</h3>
                    <p className="text-white/40 text-sm max-w-lg leading-relaxed">
                      7 nights, 3 islands, 6 live shows. Sign up for the cruise and unlock your <span className="text-cyan-400 font-bold">Cruise Hub</span> right here on your dashboard.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 px-6 py-3 bg-cyan-500 text-[#0a0a0f] text-xs font-black uppercase tracking-widest rounded-xl group-hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                  Learn More →
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* 📲 Live Alert SMS Opt-In */}
        {liveAlertsEnabled && (
        <div className="mb-8 p-6 bg-gradient-to-br from-[#0c0c1a] to-[#0a0a14] border border-rose-500/20 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-56 h-56 bg-rose-500/5 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">📲 Live Stream Alerts</span>
            </div>
            <h3 className="text-xl font-black text-white mb-1">Never Miss a Live Feed</h3>
            <p className="text-white/40 text-sm mb-5 max-w-md">Get a text the moment 7th Heaven goes live — backstage content, surprise streams, live Q&As, and more.</p>

            {liveAlertSubscribed ? (
              <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-sm font-bold text-emerald-400">Live Alerts Active</p>
                  <p className="text-sm text-white/40">We&apos;ll text <span className="text-white/60 font-mono">({liveAlertPhone.slice(0,3)}) ***-{liveAlertPhone.slice(-4)}</span> when a stream starts</p>
                </div>
                <button
                  onClick={() => { localStorage.removeItem('7h_live_alert_phone'); setLiveAlertSubscribed(false); setLiveAlertStatus('idle'); setLiveAlertPhone(''); }}
                  className="ml-auto text-xs text-white/30 hover:text-red-400 uppercase tracking-widest font-bold transition-colors cursor-pointer"
                >Unsubscribe</button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 flex items-center bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 focus-within:border-rose-500/40 transition-all">
                  <span className="text-white/30 text-sm mr-2">📱</span>
                  <input
                    type="tel"
                    placeholder="(312) 555-0199"
                    value={liveAlertPhone}
                    onChange={(e) => setLiveAlertPhone(e.target.value)}
                    className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-white/20 font-mono"
                  />
                </div>
                <button
                  onClick={handleLiveAlertSubscribe}
                  disabled={liveAlertStatus === 'saving'}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] cursor-pointer"
                >
                  {liveAlertStatus === 'saving' ? 'Saving...' : 'Alert Me 🔔'}
                </button>
              </div>
            )}
            {liveAlertStatus === 'error' && (
              <p className="text-red-400 text-sm mt-3 font-bold">Something went wrong — please try again.</p>
            )}
            <p className="text-white/15 text-xs mt-4">Standard messaging rates apply. Reply STOP to unsubscribe at any time.</p>
          </div>
        </div>
        )}

        {/* 🎸 Post-Show Memory Prompt */}
        {showHasPassed && !memorySubmitted && (
          <div className="mb-8 bg-[#0f0f17] border border-white/[0.06] overflow-hidden">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <span className="text-3xl">🎸</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-purple-400 font-bold mb-0.5">Post-Show</p>
                  <h3 className="text-white font-black text-base">
                    How was {nextShow?.venue}?
                  </h3>
                  <p className="text-white/30 text-xs mt-0.5">
                    {nextShow?.date ? new Date(nextShow.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
                  </p>
                </div>
              </div>

              <textarea
                value={memoryText}
                onChange={(e) => setMemoryText(e.target.value.slice(0, 280))}
                placeholder="Share a memory from the show…"
                rows={3}
                className="w-full bg-white/[0.03] border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-purple-500/50 placeholder:text-white/20 resize-none mb-2"
              />
              <div className="flex items-center justify-between">
                <p className="text-2xs text-white/20 font-bold">{memoryText.length}/280</p>
                <button
                  onClick={async () => {
                    if (!memoryText.trim()) return;
                    setMemorySubmitting(true);
                    try {
                      await fetch('/api/fans/memories', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          show_id: nextShow?._id,
                          memory_text: memoryText,
                          display_name: member?.name || 'Fan',
                        }),
                      });
                    } catch {}
                    setMemorySubmitting(false);
                    setMemorySubmitted(true);
                  }}
                  disabled={memorySubmitting || !memoryText.trim()}
                  className="px-6 py-2.5 bg-purple-600 text-white text-xs font-black uppercase tracking-widest hover:bg-purple-500 transition-all disabled:opacity-40"
                >
                  {memorySubmitting ? 'Saving…' : '✍ Share Memory'}
                </button>
              </div>
            </div>
          </div>
        )}

        {memorySubmitted && (
          <div className="mb-8 p-5 border border-emerald-500/20 bg-emerald-500/[0.04] text-center">
            <p className="text-emerald-400 font-bold text-sm">🎶 Memory submitted for review! It will appear once approved. See you at the next show.</p>
          </div>
        )}

        {/* 🔗 Referral Code with QR */}
        {referralEnabled && (
        <div className="mb-8 p-6 bg-gradient-to-br from-[#0c0c1a] to-[#0a0a14] border border-amber-500/20 rounded-2xl relative overflow-hidden">
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-amber-500/5 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">🔗 Referral Program</span>
            </div>
            <p className="text-white/50 text-sm mb-5 max-w-md">Share your code with friends — when they sign up, you both earn picks and climb the leaderboard!</p>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 p-4 bg-black/40 border border-amber-500/20 rounded-xl">
                  <span className="font-mono text-xl font-black text-amber-400 tracking-[0.15em] flex-1">{referralCode}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(`https://7thheavenband.com/join?ref=${referralCode}`); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer ${referralCopied ? 'bg-emerald-500 text-white' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black'}`}
                  >
                    {referralCopied ? '✓ Copied!' : 'Copy Link'}
                  </button>
                </div>
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
                <span className="text-2xs uppercase tracking-widest text-white/20 font-bold">Scan to Join</span>
              </div>
            </div>
            {/* Milestone tracker */}
            {referralMilestones.length > 0 && (
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white/30">Referral Milestones</span>
              </div>
              <div className="flex items-center gap-2">
                {referralMilestones.map((m, i) => {
                  const colors = ['text-blue-400', 'text-amber-400', 'text-fuchsia-400', 'text-yellow-400', 'text-emerald-400', 'text-cyan-400'];
                  return (
                  <div key={i} className="flex-1 text-center p-2 bg-white/[0.02] border border-white/5 rounded-lg">
                    <p className={`text-lg font-black ${colors[i % colors.length]}`}>{m.threshold}</p>
                    <p className="text-2xs text-white/30 font-bold uppercase tracking-widest mt-0.5">{m.emoji} {m.reward}</p>
                  </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>
        </div>
        )}

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
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-accent)]/80 bg-[var(--color-accent)]/10 px-3 py-1 rounded-full border border-[var(--color-accent)]/20">Claim PINs</span>
         </div>
         <div className="relative z-10">
          {(() => {
           const stored = typeof window !== "undefined" ? localStorage.getItem("vip_inbox_messages") : null;
           const messages = stored ? JSON.parse(stored) : [];
           if (messages.length === 0) {
            return (
             <div className="py-6 flex flex-col items-center border border-white/5 bg-white/5 rounded-xl border-dashed">
              <p className="text-sm text-white/50 font-bold">Your wallet is currently empty.</p>
              <p className="text-xs text-white/30 mt-1 uppercase tracking-widest font-bold">Keep participating in live streams for a chance to win</p>
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
                   <h4 className="font-bold text-base text-white tracking-wide">{msg.title}</h4>
                   {msg.isNew && <span className="text-2xs font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-yellow-500 text-black rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]">New</span>}
                  </div>
                  <p className="text-xs text-white/60 max-w-sm">{msg.desc.replace(/Your PIN: \d+\.\s*/, '')}</p>
                  <p className="text-2xs uppercase tracking-widest font-bold text-white/20 mt-1">{msg.time}</p>
                 </div>
                </div>
                {pin && (
                 <div className="flex flex-col sm:flex-row items-center gap-3 px-5 py-2 border border-dashed border-yellow-400/50 rounded-xl bg-yellow-400/5 w-full sm:w-auto mt-2 sm:mt-0">
                  <span className="text-2xs uppercase tracking-[0.2em] text-yellow-500/80 font-bold whitespace-nowrap">Show this PIN</span>
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

            {/* Tour Memories Gallery & Upload */}
            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black italic tracking-tight">Tour Memories</h3>
                <Link href="/fan-photo-wall" className="text-xs text-[var(--color-accent)] font-bold uppercase tracking-widest hover:text-white transition-colors">Global Fan Wall →</Link>
              </div>
              
              {/* Photo Gallery Grid */}
              {myPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {myPhotos.map(photo => {
                    const isVideo = photo.type === "video" || photo.src.endsWith(".mp4") || photo.src.endsWith(".mov");
                    return (
                      <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10 bg-black/20">
                        {isVideo ? (
                          <video src={photo.src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" autoPlay loop muted playsInline />
                        ) : (
                          <img src={photo.src} alt={photo.venue} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <p className="text-sm font-bold text-white truncate">{photo.venue || 'Live Event'}</p>
                          <p className={`text-xs font-black uppercase tracking-widest mt-0.5 ${photo.approved ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {photo.approved ? 'Live on wall' : 'In Review'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <FanUploadForm />
            </div>

            {/* Pick Awards (LIVE from Supabase) */}
            <PickAwardsSection userId={effectiveMember?.id} />

          </div>

          {/* Right Column / Sidebar */}
          <div className="space-y-8">
            
            {/* VIP Inbox */}
            <div className="bg-[#0a0a0f]/80 border border-white/5 p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#3b82f6]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    VIP Inbox
                  </span>
                  {inboxMessages.filter(m => m.isNew).length > 0 && (
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs uppercase tracking-widest font-bold rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.2)]">{inboxMessages.filter(m => m.isNew).length} New</span>
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
                        <p className={`text-sm font-bold text-white transition-colors ${msg.color === 'yellow' ? 'group-hover:text-yellow-400' : 'group-hover:text-blue-400'}`}>{msg.title}</p>
                        <p className="text-sm text-white/50 leading-relaxed mt-1">{msg.desc}</p>
                        <p className={`text-xs font-bold tracking-widest uppercase mt-2 ${msg.isNew ? 'text-[var(--color-accent)]' : 'text-white/30'}`}>{msg.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty state */}
                {inboxMessages.length === 0 && (
                  <div className="py-8 flex flex-col items-center">
                    <span className="text-2xl opacity-20 mb-2">📬</span>
                    <p className="text-white/30 text-sm font-bold">No messages yet.</p>
                    <p className="text-white/20 text-xs mt-1">Raffle wins, alerts & updates will appear here.</p>
                  </div>
                )}
              </div>
            </div>


          </div>

        </div>

        {/* 🛍️ Merch Quick Shop */}
        {merch.length > 0 && (
          <div className="mt-8 p-6 bg-[#0a0a0f]/80 border border-white/5 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-fuchsia-400">🛍️ Quick Shop</span>
              <Link href="/store" className="text-xs text-white/30 hover:text-[var(--color-accent)] uppercase tracking-widest font-bold transition-colors">Full Store →</Link>
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
                    <p className="text-sm font-bold text-white truncate">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-black text-fuchsia-400">${parseFloat(item.price).toFixed(0)}</span>
                      <Link href={`/store`} className="text-xs font-black uppercase tracking-widest text-white/50 bg-white/5 px-3 py-1.5 rounded border border-white/10 hover:bg-fuchsia-500 hover:text-white hover:border-fuchsia-500 transition-all">Buy Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


          </>
        )}

      </div>
    </section>
  );
}
