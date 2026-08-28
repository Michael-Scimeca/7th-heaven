/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
import Image from 'next/image';

import { useMember } from "@/context/MemberContext";
import { useEffect, useState, useCallback, use, useSyncExternalStore } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProximityPanel from "@/components/ProximityPanel";
import DOMPurify from "dompurify";
import { sanitizeHtml } from "@/lib/sanitize-html";
import CruiseChat from "@/components/CruiseChat";
import dynamic from "next/dynamic";

const FanUploadForm = dynamic(() => import("@/components/FanUploadForm"), {
  ssr: false,
  loading: () => <p className="text-black/40 animate-pulse">Loading upload form...</p>,
});
import ProfilePhotoUploader from "@/components/ProfilePhotoUploader";
import { EmbarkationCountdown, ImportantLinksWidget, BookingManager } from "@/components/CruiseWidgets";
import CosmicRadialButton from "@/components/CosmicRadialButton";

const PIN_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
);

export default function FanAccountPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { member, isLoggedIn, openModal } = useMember();
  const supabase = createClient();
  const [myPhotos, setMyPhotos] = useState<any[]>([]);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [claimedPins, setClaimedPins] = useState<string[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [merch, setMerch] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0, status: 'upcoming' as 'upcoming' | 'live' | 'ended' });
  const [nextShow, setNextShow] = useState<any>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [liveAlertPhone, setLiveAlertPhone] = useState('');
  const [liveAlertStatus, setLiveAlertStatus] = useState<'idle' | 'saving' | 'subscribed' | 'error'>('idle');
  const [liveAlertSubscribed, setLiveAlertSubscribed] = useState(false);
  const [liveAlertsEnabled, setLiveAlertsEnabled] = useState(true);
  const [parkingNoteOpenIdx, setParkingNoteOpenIdx] = useState<number | null>(null);


  // Cruise Community Toggle State
  const [isCruiser, setIsCruiser] = useState(false);
  const [dashboardView, setDashboardView] = useState<'fan' | 'cruise'>('fan');
  const CRUISE_END_DATE = "2026-04-19";
  const isCruiseBannerActive = useSyncExternalStore(
    () => () => { },
    () => ((new Date().getTime() - new Date(CRUISE_END_DATE).getTime()) / (1000 * 60 * 60 * 24)) < 60,
    () => false
  );



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

  const checkCruiser = useCallback(async () => {
    if (!member?.email) return;

    const daysSinceCruise = (new Date().getTime() - new Date(CRUISE_END_DATE).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCruise > 60) {
      setIsCruiser(false);
      setDashboardView('fan');
      return;
    }

    const { data } = await supabase.from('cruise_signups').select('id').eq('email', member.email).single();
    if (data || member?.signup_source === 'cruise_member_signup') {
      setIsCruiser(true);
      if (member?.signup_source === 'cruise_member_signup') {
        setDashboardView('cruise');
      }

      // Load itinerary
      fetch(`/api/cruise/itinerary?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.ok ? res.json() : null)
        .then(raw => {
          let d = raw; let i = 0;
          while (typeof d === 'string' && i < 3) { try { d = JSON.parse(d); } catch { break; } i++; }
          if (Array.isArray(d) && d.length > 0) setCruiseItinerary(d);
        }).catch(() => { });

      // Load announcement
      fetch('/api/cruise/announcement?t=' + Date.now(), { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.message) setCruiseAnnouncement(d.message); else setCruiseAnnouncement(null);
        }).catch(() => { });
    }
  }, [member?.email, member?.signup_source, supabase]);

  useEffect(() => {
    checkCruiser();
  }, [checkCruiser]);



  // Check if fan already subscribed to live alerts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('7h_live_alert_phone');
      if (saved) { setLiveAlertPhone(saved); setLiveAlertSubscribed(true); setLiveAlertStatus('subscribed'); }
    } catch { }
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
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('7h_live_alert_phone', cleaned);
          setLiveAlertSubscribed(true);
          setLiveAlertStatus('subscribed');
        } else {
          setLiveAlertStatus('error');
        }
      } else {
        setLiveAlertStatus('error');
      }
    } catch { setLiveAlertStatus('error'); }
  };

  const referralCode = (member?.name ? member.name.replace(/\s+/g, '').toUpperCase().slice(0, 6) : 'FAN') + (member?.id?.slice(-4) || '7H');

  const loadDashboardData = useCallback(async () => {
    try {
      const tourRes = await fetch("/api/tour");
      if (tourRes.ok) {
        const data = await tourRes.json();
        const upcoming = (data || []).filter((s: any) => s.date && new Date(s.date + 'T23:59:59') >= new Date());
        setShows(upcoming);
        if (upcoming.length > 0) setNextShow(upcoming[0]);
      }
    } catch { }

    try {
      const merchRes = await fetch("/api/merch");
      if (merchRes.ok) {
        const data = await merchRes.json();
        if (data) setMerch(data);
      }
    } catch { }

    try {
      const alertRes = await fetch("/api/admin/settings?key=live_alerts_enabled");
      if (alertRes.ok) {
        const data = await alertRes.json();
        if (data?.value === 'off') setLiveAlertsEnabled(false);
      }
    } catch { }

    try {
      localStorage.removeItem('vip_inbox_messages');
      localStorage.removeItem('7h_vip_inbox');
      Object.keys(localStorage).forEach(k => {
        if (k.includes('is_live') || k.includes('crew_is_live') || k.includes('raffle') || k.includes('pinned')) {
          localStorage.removeItem(k);
        }
      });
    } catch { }

    try {
      const claimed = JSON.parse(localStorage.getItem('claimed_raffle_pins') || '[]');
      setClaimedPins(Array.isArray(claimed) ? claimed : []);
    } catch { }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadMyPhotos = useCallback(async () => {
    if (!member?.name) return;
    try {
      const res = await fetch("/api/fans?all=true");
      if (res.ok) {
        const data = await res.json();
        setMyPhotos(data.filter((p: any) => p.name === member.name));
      }
    } catch { }
  }, [member?.name]);

  useEffect(() => {
    loadMyPhotos();
  }, [loadMyPhotos]);

  // Live stream polling — checks actual crew live status + Supabase broadcasts
  const [liveFeeds, setLiveFeeds] = useState<{ room: string; title: string; viewers: number; host: string }[]>([]);

  const checkLiveFeeds = useCallback(async () => {
    try {
      const feeds: { room: string; title: string; viewers: number; host: string }[] = [];
      const seenRooms = new Set<string>();

      // 1. Get active LiveKit rooms for cross-validation
      const activeLkRooms = new Set<string>();
      try {
        const res = await fetch('/api/live-rooms');
        if (res.ok) {
          const data = await res.json();
          if (data.rooms?.length > 0) {
            for (const room of data.rooms) {
              activeLkRooms.add(room.name);
            }
          }
        }
      } catch { }

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
            supabase.from('live_streams').update({ status: 'ended' }).in('id', staleIds).then(null, () => { });
          }
        }
      } catch { }
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
  }, [supabase]);

  useEffect(() => {
    checkLiveFeeds();
    const interval = setInterval(checkLiveFeeds, 4000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('crew_is_live_') || e.key?.startsWith('7h_crew_is_live_')) checkLiveFeeds();
    };
    window.addEventListener('storage', handleStorage);

    return () => { clearInterval(interval); window.removeEventListener('storage', handleStorage); };
  }, [checkLiveFeeds]);

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


  // devBypass is initialized to false on SSR; updated on client after mount to prevent
  // server/client render mismatch (hydration error).
  const [devBypass, setDevBypass] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDevBypass(localStorage.getItem('7h_dev_bypass') === 'true');
    }
  }, []);

  // Effective member = demo injection (always fan) OR real logged-in user
  const effectiveMember = isDemoMode ? demoMember : member;

  // Specific show notification subscriptions
  const [subscribedShows, setSubscribedShows] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const loadSubscribedShows = useCallback(async () => {
    if (!effectiveMember?.email) return;
    setLoadingAlerts(true);
    try {
      const res = await fetch(`/api/shows/notify-me?email=${encodeURIComponent(effectiveMember.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.subscriptions) {
          setSubscribedShows(data.subscriptions);
        }
      }
    } catch { }
    finally {
      setLoadingAlerts(false);
    }
  }, [effectiveMember?.email]);

  useEffect(() => {
    loadSubscribedShows();
  }, [loadSubscribedShows]);

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
      <section className="site-container py-48 min-h-screen text-[var(--text-color)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl  font-bold     tracking-tight mb-4">Fan <span className="gradient-text">Account</span></h1>
          <p className="mb-8 max-w-sm">Access your VIP dashboard, exclusive deals, and photo submission tools.</p>
          <button aria-label="Action button" onClick={() => openModal('login')} className="px-8 py-3 bg-[var(--color-accent)] text-white text-sm font-bold uppercase tracking-widest hover:brightness-110 shadow-[0_0_15px_rgba(255,10,61,0.3)]">
            Login to Access
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="site-container pt-[88px] min-h-screen text-[var(--text-color)]]">
      <div className="">
        {/* ── DEMO BANNER — DELETE BEFORE GO-LIVE ────────────────────────────── */}
        {isDemoMode && (
          <div className="mb-8 flex items-start gap-3 px-5 py-3 bg-purple-600/10 border border-purple-500/30">
            <span className="text-purple-300 text-sm  font-bold  uppercase tracking-widest shrink-0">⚠ DEMO MODE</span>
            <p className="text-purple-200/60 leading-relaxed">This is a preview of the Fan Dashboard with simulated data. Fans will need to create a free account to access their personal dashboard at <code className="text-purple-200/80">/fans/username</code>.</p>
          </div>
        )}
        {/* ── END DEMO BANNER ─────────────────────────────────────────────── */}


        {/* Account Identity Header */}
        <div className="flex items-center justify-between mb-10 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16  rounded-lg  bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center text-xl  font-bold   text-[var(--color-accent)] overflow-hidden shrink-0">
              {(effectiveMember?.avatar || member?.avatar) && ((effectiveMember?.avatar || member?.avatar).startsWith('http') || (effectiveMember?.avatar || member?.avatar).startsWith('/') || (effectiveMember?.avatar || member?.avatar).startsWith('data:')) ? (
                <Image width={200} height={200} unoptimized
                  src={effectiveMember?.avatar || member?.avatar}
                  alt={effectiveMember?.name || 'Profile'}
                  className="w-full h-full object-cover  rounded-lg "
                />
              ) : (
                effectiveMember?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?'
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl  font-bold     tracking-tight">{effectiveMember?.name}</h1>
                {(() => {
                  const role = effectiveMember?.role;
                  const isCruiseOnly = effectiveMember?.signup_source === 'cruise_member_signup';
                  const showCruise = dashboardView === 'cruise';

                  if (role === 'admin') {
                    return (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border  rounded-lg  bg-purple-500/10 text-purple-300 border-purple-400/30">
                          ADMIN
                        </span>
                        {showCruise && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border  rounded-lg     bg-purple-600/15 text-purple-300 border-purple-500/30">
                            CRUISE
                          </span>
                        )}
                      </>
                    );
                  }

                  if (role === 'crew') {
                    return (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border  rounded-lg  bg-emerald-400/10 text-[var(--color-accent)]  border-[var(--color-accent)]/30">
                          CREW
                        </span>
                        {showCruise && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border  rounded-lg     bg-purple-600/15 text-purple-300 border-purple-500/30">
                            CRUISE
                          </span>
                        )}
                      </>
                    );
                  }

                  if (role === 'event_planner') {
                    return (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border  rounded-lg  bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30">
                          EVENT PLANNER
                        </span>
                        {showCruise && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border  rounded-lg     bg-purple-600/15 text-purple-300 border-purple-500/30">
                            CRUISE
                          </span>
                        )}
                      </>
                    );
                  }

                  if (isCruiseOnly) {
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border  rounded-lg     bg-purple-600/15 text-purple-300 border-purple-500/30">
                        CRUISE MEMBER
                      </span>
                    );
                  }

                  if (showCruise) {
                    return (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em]  text-[var(--color-accent)] border-[var(--color-accent)]/30">
                          FAN
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em] border  rounded-lg     bg-purple-600/15 text-purple-300 border-purple-500/30">
                          CRUISE MEMBER
                        </span>
                      </>
                    );
                  }

                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.15em]   rounded-lg  bg-[var(--color-accent)]/10  text-[var(--color-accent)] border-[var(--color-accent)]/30">
                      FAN
                    </span>
                  );
                })()}
              </div>
              <p className="font-mono mt-1">{effectiveMember?.email}</p>
            </div>
          </div>
        </div>

        {/* Cruise Hub Toggle */}
        {isCruiser && (
          <div className="flex justify-center mb-10 -mt-2">
            <div className=" bg-[#00000029]    border border-white/10  rounded-lg  p-1 inline-flex items-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <button aria-label="Action button"
                onClick={() => setDashboardView('fan')}
                className={`px-6 py-2  rounded-lg  text-xs  font-bold  uppercase tracking-widest transition-colors cursor-pointer ${dashboardView === 'fan' ? 'bg-[var(--color-accent)] text-white shadow-[0_0_15px_rgba(255,10,61,0.4)]' : 'text-white/40 hover:text-white'
                  }`}
              >
                Fan Dashboard
              </button>
              <button aria-label="Action button"
                onClick={() => setDashboardView('cruise')}
                className={`px-6 py-2  rounded-lg  text-xs  font-bold  uppercase tracking-widest transition-colors cursor-pointer ${dashboardView === 'cruise' ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-white/40 hover:text-cyan-400'
                  }`}
              >
                Cruise Hub
              </button>
            </div>
          </div>
        )}

        {dashboardView === 'cruise' ? (
          <div>
            {/* Cruise Header */}
            <header className="mb-8 border-b border-[var(--border-color)] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl  font-bold  uppercase tracking-widest text-[var(--text-color)]">Cruise Hub</h1>
                    <p className="font-bold tracking-widest uppercase mt-1">Passenger Area</p>
                  </div>
                </div>
                <p className="max-w-xl">Welcome aboard, <strong className="text-[var(--text-color)]">{member?.name || 'Guest'}</strong>. Here is your official cruise status and early access portal.</p>
              </div>
              <div className="shrink-0">
                <EmbarkationCountdown />
              </div>
            </header>

            {/* Captain's Log */}
            {cruiseAnnouncement && (
              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-50 to-[#0a0a0f] border border-cyan-500/30 mb-8 shadow-md">
                <div className="absolute top-0 right-0 w-64 h-64     rounded-lg  blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />
                <div className="p-6 md:p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <h3 className="text-lg  font-bold     tracking-wider text-black uppercase">Captain&apos;s Log</h3>
                    <span className="ml-auto text-xs font-bold tracking-[0.2em] uppercase text-cyan-500/60 border border-cyan-500/20 px-2 py-1 rounded">Priority Update</span>
                  </div>
                  <div
                    className="text-black/80 text-sm leading-relaxed space-y-4 [&_a]:text-cyan-400 [&_a]:underline [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_strong]:text-black [&_strong]:font-bold"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(cruiseAnnouncement) }}
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
                    <h2 className="text-xl  font-bold     tracking-wide text-white uppercase mb-6 flex items-center gap-3">
                      Official Itinerary <span className="text-xs font-bold text-white/40 tracking-widest not-   ml-2 uppercase">Subject to Change</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cruiseItinerary.map(day => (
                        <div key={day.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 relative overflow-hidden group transition-colors duration-300 rounded-lg " style={{ '--tw-border-opacity': '0.4', borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)` } as React.CSSProperties}>
                          <div className="absolute top-0 right-0 w-48 h-48  rounded-lg  blur-[50px] -translate-y-1/2 translate-x-1/2 transition-colors duration-500 pointer-events-none opacity-10 group-hover:opacity-20" style={{ backgroundColor: day.colorTheme }} />
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-5">
                              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded border" style={{ color: day.colorTheme, backgroundColor: `color-mix(in srgb, ${day.colorTheme} 10%, transparent)`, borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)` }}>{day.dayLabel}</span>
                              <span className="text-xs font-bold text-white/50 uppercase tracking-widest">{day.location}</span>
                            </div>
                            <h3 className="text-lg  font-bold  uppercase tracking-wide text-white mb-2">{day.theme}</h3>
                            <ul className="space-y-4 mt-5 border-t border-white/10 pt-5">
                              {day.events.map(ev => (
                                <li key={ev.id} className="flex items-start gap-4">
                                  <span className="font-mono text-xs font-bold tracking-wider mt-0.5" style={{ color: day.colorTheme }}>{ev.time}</span>
                                  <div>
                                    <strong className="block text-white text-sm tracking-wide">{ev.title}</strong>
                                    <span className="text-white/50 text-xs">{ev.subtitle}</span>
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
                  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 relative overflow-hidden group rounded-lg ">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/10  rounded-lg  blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-accent)]/20 transition-colors duration-500 pointer-events-none" />
                    <div className="flex justify-between items-end mb-5 relative z-10">
                      <div>
                        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-1">Community</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-white  font-bold  text-2xl    tracking-wide">412</span>
                          <span className=" text-[var(--color-accent)] font-bold uppercase tracking-widest text-xs">Fans Onboard</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center relative z-10 mb-4">
                      <div className="flex -space-x-3">
                        {['JD', 'SL', 'MT', 'AB', 'RC', 'KW'].map((initials, i) => {
                          const colors = ['bg-rose-500/20 text-rose-300', 'bg-purple-500/20 text-purple-300', 'bg-cyan-500/20 text-cyan-300', 'bg-amber-500/20 text-amber-300', 'bg-emerald-500/20 text-emerald-300', 'bg-indigo-500/20 text-indigo-300'];
                          return (
                            <div key={`fan-avatar-${i}-${initials}`} className={`w-10 h-10  rounded-lg  border-2 border-[var(--color-bg-surface)] ${colors[i % colors.length]} flex items-center justify-center overflow-hidden  hover:-translate-y-1 transition-transform cursor-pointer`} style={{ zIndex: 10 - i }}>
                              <span className="font-bold text-xs">{initials}</span>
                            </div>
                          );
                        })}
                        <div className="w-10 h-10  rounded-lg  border-2 border-[var(--color-bg-surface)] bg-[var(--color-accent)]/20 flex items-center justify-center  text-[var(--color-accent)] font-bold text-xs">
                          +406
                        </div>
                      </div>
                    </div>
                    <p className="leading-relaxed relative z-10 border-t border-white/10 pt-4">
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
            {/* Backstage Feed — always visible */}
            <div className="mb-10">
              {isLive && liveFeeds.length > 0 ? (
                <div className="space-y-3">
                  {liveFeeds.map((feed) => (
                    <Link key={feed.room} href={`/live/${feed.room}`} className="block relative overflow-hidden group">
                      <div className="flex items-center justify-between px-6 py-4 bg-red-950/40 border border-red-500/40 hover:border-red-500/60 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full  rounded-lg  bg-red-500 opacity-75" />
                            <span className="relative inline-flex  rounded-lg  h-4 w-4 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                          </span>
                          <div>
                            <p className="font-bold uppercase tracking-wide">{feed.host} is LIVE {feed.title ? `— ${feed.title}` : ''}</p>
                            <p className="text-red-300/80 mt-0.5">
                              {feed.viewers > 0 ? `${feed.viewers} watching · ` : ''}Watch the backstage feed before it ends
                            </p>
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-red-500 text-white text-xs  font-bold  uppercase tracking-widest rounded-lg group-hover:bg-red-400 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]">Watch Now →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Link href="/live" className="block group">
                  <div className="flex items-center justify-between px-4 py-4  bg-[#00000029]    border border-white/10 rounded-lg hover: border-white/10  transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="relative flex h-4 w-4">
                        <span className="relative inline-flex  rounded-lg  h-4 w-4 bg-white/30" />
                      </span>
                      <div>
                        <p className="font-bold uppercase tracking-wide">Backstage is Quiet</p>
                        <p className="mt-0.5">No crew feeds are live right now — check back during the next show</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-white/10 text-white/70 text-xs  font-bold  uppercase tracking-widest rounded-lg group-hover:bg-white/20 group-hover:text-white transition-colors border   border-white/10  ">Live Hub →</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Rewards & Raffle Wins */}
            {inboxMessages.some(m => m.color === 'yellow' || m.title?.includes('Win')) && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  const claimedPinsSet = new Set(claimedPins);
                  return Array.from(inboxMessages, (win, i) => ({ win, i })).flatMap(({ win, i }) => {
                    if (!(win.color === 'yellow' || win.title?.includes('Win'))) return [];
                    const pinMatch = win.desc?.match(/PIN: (\d+)/);
                    const pin = pinMatch ? pinMatch[1] : null;

                    let isClaimed = false;
                    if (pin) {
                      try {
                        isClaimed = claimedPinsSet.has(pin);
                      } catch { }
                    }

                    return [(
                      <div key={i} className={`bg-gradient-to-br from-[#1a1a25] to-[#0a0a0f] border-2 ${isClaimed ? '   border-white/10 opacity-60' : 'border-yellow-500/30'}  p-6 relative overflow-hidden group shadow-md`}>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        </div>
                        <div className="flex items-start justify-between relative z-10">
                          <div>
                            {isClaimed ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border    border-white/10  rounded-lg  text-xs  font-bold  text-[var(--color-accent)] uppercase tracking-widest mb-4">
                                ✓ PRIZE CLAIMED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20  rounded-lg  text-xs  font-bold  text-yellow-500 uppercase tracking-widest mb-4">
                                RAFFLE WINNER
                              </span>
                            )}
                            <h3 className="text-2xl  font-bold  text-white    tracking-tight mb-2">
                              {win.title.replace('You Won the Raffle!', '').trim() || 'Prize Claim'}
                            </h3>
                            <p className="max-w-[280px] leading-relaxed mb-6">
                              {win.desc.split('. Your PIN')[0]}
                            </p>
                          </div>
                          {pin && (
                            <div className="flex flex-col items-center">
                              <div className="bg-white p-3 mb-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                <div className="w-24 h-24   flex flex-wrap gap-1 p-1">
                                  {Array.from({ length: 16 }).map((_, j) => {
                                    // Deterministic pattern seeded by pin+index to avoid re-render flicker
                                    const seed = pin ? (parseInt(pin, 10) * 31 + j * 7) % 97 : j * 17 % 97;
                                    return (
                                      <div key={j} className={`w-5 h-5 ${seed > 48 ? 'bg-white' : 'bg-transparent'}`} />
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="uppercase font-bold tracking-[0.2em] mb-1">Claim PIN</p>
                                <p className={`font-bold ${isClaimed ?'text-emerald-400 line-through' : 'text-yellow-500'} font-mono tracking-[0.3em]`}>{pin}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between relative z-10">
                          <p className="font-bold uppercase tracking-widest">
                            {isClaimed ? 'Prize handed off successfully' : 'Show this at the merch table'}
                          </p>
                          <button aria-label="Action button" className={`text-xs ${isClaimed ? 'text-emerald-400' : 'text-yellow-500'}  font-bold  uppercase tracking-widest hover:text-white transition-colors`}>
                            {isClaimed ? 'Completed ✓' : 'Full Details →'}
                          </button>
                        </div>
                      </div>
                    )];
                  });
                })()}
              </div>
            )}

            {/* Next Show Countdown */}
            {(() => {
              const isHappeningNow = nextShow && countdown.status === 'live';
              const isEnded = nextShow && countdown.status === 'ended';
              return (
                <div className="relative text-white mb-10">
                  <div className="relative z-10">
                    {isHappeningNow ? (
                      <span className="inline-flex items-center gap-2 text-xs  font-bold  uppercase tracking-[0.2em] text-[var(--color-accent)] bg-emerald-500/10 px-3 py-1  rounded-lg  border  border-[var(--color-accent)]/30">
                        <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full  rounded-lg  bg-emerald-400 opacity-75" /><span className="relative inline-flex  rounded-lg  h-1.5 w-1.5 bg-emerald-500" /></span>
                        Happening Now
                      </span>
                    ) : isEnded ? (
                      <span className="text-xs  font-bold  text-white uppercase tracking-[0.2em]  bg-[#00000029]  border  border-white/10  backdrop-blur-[16px] px-3 py-1  rounded-lg ">Show Completed</span>
                    ) : (
                      <span className="text-xs  font-bold  uppercase tracking-[0.2em] text-white bg-[var(--color-accent)]/10 px-3 py-1  rounded-lg  border border-[var(--color-accent)]/20">Next Show</span>
                    )}
                    {nextShow ? (() => {
                      return (
                        <>
                          <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-4 ${isHappeningNow ? 'border    border-white/10 bg-emerald-500/[0.03]  p-4 -mx-1' : ''}`}>
                            <div>
                              <h3 className="text-2xl  font-bold  text-white mb-1">{nextShow.venue}</h3>
                              <p className="">
                                {nextShow.city ? `${nextShow.city}${nextShow.state ? `, ${nextShow.state}` : ''} · ` : nextShow.state ? `${nextShow.state} · ` : ''}
                                {nextShow.date ? new Date(nextShow.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'TBA'}
                                {nextShow.time ? ` · ${nextShow.time}` : ''}
                              </p>
                            </div>
                            {isHappeningNow ? (
                              <div className="flex items-center gap-3 px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full  rounded-lg  bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex  rounded-lg  h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                </span>
                                <span className="text-emerald-400 text-sm  font-bold  uppercase tracking-widest">Happening Now</span>
                              </div>
                            ) : isEnded ? (
                              <div className="flex items-center gap-3 px-5 py-3  bg-[#00000029]  rounded-lg  border border-white/10">
                                <span className="text-white/40 text-sm  font-bold  uppercase tracking-widest">Thanks for coming!</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                {[{ v: countdown.days, l: 'Days' }, { v: countdown.hours, l: 'Hrs' }, { v: countdown.mins, l: 'Min' }, { v: countdown.secs, l: 'Sec' }].map((u, i) => (
                                  <div key={u.l} className="flex flex-col items-center">
                                    <span className="text-2xl md:text-3xl  font-bold  text-white tabular-nums  w-14 h-14 flex items-center justify-center">{String(u.v).padStart(2, '0')}</span>
                                    <span className="text-[var(--font-size-2xs)] uppercase tracking-widest text-white/40 font-bold mt-1">{u.l}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                        </>
                      );
                    })() : (
                      <div className="mt-4 py-8 flex flex-col items-center rounded-lg border border-white/10  bg-[#00000029]    border-dashed">
                        <p className="font-bold">No upcoming shows scheduled yet.</p>
                        <p className="mt-1 uppercase tracking-widest font-bold">Check back soon — new dates drop regularly</p>
                        <Link href="/#tour" className="mt-3 text-xs  text-[var(--color-accent)] font-bold uppercase tracking-widest hover:text-white transition-colors">View Tour Page →</Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Upcoming Shows */}
            <div className="mb-10 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-xs  font-bold  uppercase tracking-widest text-[var(--color-accent)]">Upcoming Shows</span>
                <Link href="/#tour" className="text-xs text-white/40 hover: text-[var(--color-accent)] uppercase tracking-widest font-bold transition-colors">All Dates →</Link>
              </div>
              {shows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Array.from(shows.slice(0, 3), (show: any, i: number) => ({ show, i })).map(({ show, i }) => (
                    <div key={show.id || show.date || show.venue} className="flex items-start gap-4 py-3 pr-4 group border-b border-white/10 last:border-b-0 md:border-b-0 pb-4 md:pb-3">
                      <div className="flex flex-col items-center justify-center w-12 h-12  bg-[#00000029]    border   border-white/10   rounded-lg shrink-0">
                        <span className="text-xs  font-bold  text-white/50 uppercase">{show.date ? new Date(show.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) : ''}</span>
                        <span className="text-lg  font-bold  text-white leading-none">{show.date ? new Date(show.date + 'T12:00:00').getDate() : ''}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{show.venue}</p>
                        {(show.city || show.state) && (
                          <p className="">
                            {show.city ? `${show.city}${show.state ? `, ${show.state}` : ''}` : show.state}
                          </p>
                        )}
                        {(show.doorsTime || show.playTime || show.time) && (
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                            {show.doorsTime && <span className="text-[0.6rem] text-white/35 font-semibold">Doors: {show.doorsTime}</span>}
                            {show.playTime && <span className="text-[0.6rem] text-rose-400 font-extrabold">Show: {show.playTime}</span>}
                            {show.time && (show.doorsTime || show.playTime)
                              ? <span className="text-[0.6rem] text-white/35 font-semibold">Event: {show.time}</span>
                              : show.time && !show.doorsTime && !show.playTime
                                ? <span className="text-[0.6rem] text-white/50 font-semibold">{show.time}</span>
                                : null}
                          </div>
                        )}
                        {/* Directions to event + Parking — shown below time info */}
                        {!show.isSoldOut && (show.venue || show.directionsLink || show.notes) && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {/* Directions to the event itself — always shown if we have venue info */}
                            {(show.venue || show.city) && (() => {
                              const mapsHref = show.mapUrl && !show.mapUrl.includes('maps.apple.com')
                                ? show.mapUrl
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([show.venue, show.city, show.state].filter(Boolean).join(' '))}`;
                              return (
                                <a href={mapsHref} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[0.6rem] text-white rounded-lg  font-bold  uppercase tracking-wider !text-white  bg-[#00000029]  border  border-white/10  backdrop-blur-[16px] px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                                  Directions
                                </a>
                              );
                            })()}
                            {/* Parking — smart button: link-only / note-only / both */}
                            {(show.directionsLink || show.notes) && (() => {
                              const btnClass = "inline-flex items-center gap-1 text-[0.6rem] rounded-lg  font-bold  uppercase tracking-wider !text-white  bg-[#00000029]  border  border-white/10  backdrop-blur-[16px]  px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors";
                              if (show.directionsLink && !show.notes) {
                                return (
                                  <a href={show.directionsLink} target="_blank" rel="noopener noreferrer" className={btnClass}>
                                    {PIN_ICON} Parking
                                  </a>
                                );
                              }
                              if (!show.directionsLink && show.notes) {
                                return (
                                  <div className="relative">
                                    <button aria-label="Action button" onClick={() => setParkingNoteOpenIdx(parkingNoteOpenIdx === i ? null : i)} className={btnClass}>
                                      {PIN_ICON} Parking
                                    </button>
                                    {parkingNoteOpenIdx === i && (
                                      <div className="absolute bottom-full left-0 mb-2 z-50 w-64 bg-[#111] border   border-white/10   rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.7)] p-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-[0.6rem]  font-bold  uppercase tracking-widest text-white/40">Parking Info</span>
                                          <button aria-label="Action button" onClick={() => setParkingNoteOpenIdx(null)} className="text-white/30 hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                          </button>
                                        </div>
                                        <p className="leading-relaxed whitespace-pre-wrap">{show.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              // Both: link button + ⓘ for note popover
                              return (
                                <>
                                  <a href={show.directionsLink} target="_blank" rel="noopener noreferrer" className={btnClass}>
                                    {PIN_ICON} Parking
                                  </a>
                                  <div className="relative">
                                    <button aria-label="Action button" onClick={() => setParkingNoteOpenIdx(parkingNoteOpenIdx === i ? null : i)} className="inline-flex items-center justify-center rounded-lg w-5 h-5 text-white/40  bg-[#00000029]    border border-white/10 rounded hover:bg-white/10 hover:text-white transition-colors" title="Parking notes">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                                    </button>
                                    {parkingNoteOpenIdx === i && (
                                      <div className="absolute bottom-full left-0 mb-2 z-50 w-64 bg-[#111] border   border-white/10   rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.7)] p-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-[0.6rem]  font-bold  uppercase tracking-widest text-white/40">Parking Info</span>
                                          <button aria-label="Action button" onClick={() => setParkingNoteOpenIdx(null)} className="text-white/30 hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                          </button>
                                        </div>
                                        <p className="leading-relaxed whitespace-pre-wrap">{show.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                        {show.isSoldOut && (
                          <span className="inline-block mt-2 text-[0.6rem]  font-bold  uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Sold Out</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center">
                  <p className="font-bold">No shows on the horizon yet.</p>
                  <p className="mt-1">Follow us for announcements on new dates!</p>
                </div>
              )}
            </div>

            {/* Proximity Alerts & Show Alerts — 50/50 Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div>
                <ProximityPanel />
              </div>

              <div className="text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-2 text-xs  font-bold  uppercase tracking-widest  text-[var(--color-accent)]">
                    Subscribed Show Alerts
                  </span>
                  <span className="text-[var(--font-size-2xs)] font-bold text-white/40 uppercase tracking-widest">Specific Tour Dates</span>
                </div>

                {loadingAlerts ? (
                  <div className="py-8 flex flex-col items-center">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent  rounded-lg  animate-spin" />
                  </div>
                ) : subscribedShows.length > 0 ? (
                  <div className="space-y-3">
                    {subscribedShows.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between gap-4 p-4  bg-[#00000029]    border border-white/10 hover:border-purple-500/30 transition-colors group">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="min-w-0">
                            <p className="font-bold truncate">{sub.venueName}</p>
                            <p className="">
                              {sub.showDate ? sub.showDate : "Upcoming Date"}{sub.city ? ` · ${sub.city}, ${sub.state}` : ""}
                            </p>
                          </div>
                        </div>
                        <button aria-label="Action button"
                          onClick={() => handleUnsubscribeShow(sub.showId)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-black border border-rose-500/20 text-[var(--font-size-2xs)]  font-bold  uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel Alert
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center rounded-lg border border-white/10  bg-[#00000029]    border-dashed">
                    <p className="font-bold">You aren&apos;t tracking any specific shows yet.</p>
                    <p className="mt-1">Click the bell icon on the tour page to get date alerts.</p>
                    <Link href="/#tour" className="mt-3 text-xs  text-[var(--color-accent)] font-bold uppercase tracking-widest hover:text-white transition-colors">Find Shows →</Link>
                  </div>
                )}
              </div>
            </div>

            {!isCruiser && isCruiseBannerActive && (
              <Link href="/cruise" className="block mb-10 group">
                <div className="relative overflow-hidden border border-cyan-500/20 p-6 md:p-8 hover:border-cyan-500/40 transition-colors text-white">
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs  font-bold  uppercase tracking-[0.2em] text-purple-400   px-2.5 py-1  rounded-lg  border border-cyan-500/20">Limited Spots</span>
                        </div>
                        <h3 className="text-lg  font-bold  text-white uppercase tracking-wide mb-1">7th Heaven is Setting Sail!</h3>
                        <p className="max-w-lg leading-relaxed">
                          7 nights, 3 islands, 6 live shows. Sign up for the cruise and unlock your <span className="text-cyan-400 font-bold">Cruise Hub</span> right here on your dashboard.
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 px-6 py-3 bg-cyan-500 text-[#0a0a0f] text-xs  font-bold  uppercase tracking-widest group-hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      Learn More →
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Live Alert SMS Opt-In */}
            {liveAlertsEnabled && (
              <div className="mb-8 relative text-white">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs  font-bold  uppercase tracking-[0.2em] text-white px-3 py-1  rounded-lg   bg-[#00000029]  border  border-white/10  backdrop-blur-[16px]">Live Stream Alerts</span>
                  </div>
                  <h3 className="text-xl  font-bold  text-white mb-1">Never Miss a Live Feed</h3>
                  <p className="mb-5 w-full">Get a text the moment 7th Heaven goes live — backstage content, surprise streams, live Q&As, and more.</p>

                  {liveAlertSubscribed ? (
                    <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border   border-white/10 w-full">
                      <div>
                        <p className="font-bold">Live Alerts Active</p>
                        <p className="">We&apos;ll text <span className="text-white font-mono">({liveAlertPhone.slice(0, 3)}) ***-{liveAlertPhone.slice(-4)}</span> when a stream starts</p>
                      </div>
                      <button aria-label="Action button"
                        onClick={() => { localStorage.removeItem('7h_live_alert_phone'); setLiveAlertSubscribed(false); setLiveAlertStatus('idle'); setLiveAlertPhone(''); }}
                        className="ml-auto text-xs text-white/40 hover:text-red-400 uppercase tracking-widest font-bold transition-colors cursor-pointer"
                      >Unsubscribe</button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                      <div className="w-full sm:max-w-[300px] flex items-center">
                        <input aria-label="Input field"
                          type="tel"
                          placeholder="(312) 555-0199"
                          value={liveAlertPhone}
                          onChange={(e) => setLiveAlertPhone(e.target.value)}
                          className=" bg-[#00000029]    border   border-white/10   rounded-lg px-4 py-3.5 outline-none text-white text-sm w-full placeholder:text-white/30 font-mono focus:border-purple-400 transition-colors"
                        />
                      </div>
                      <CosmicRadialButton
                        onClick={handleLiveAlertSubscribe}
                        disabled={liveAlertStatus === 'saving'}
                        icon={false}
                        className="w-full sm:w-auto px-6 py-3.5 whitespace-nowrap shrink-0 text-white text-xs  font-bold  uppercase tracking-widest cursor-pointer text-center justify-center"
                      >
                        {liveAlertStatus === 'saving' ? 'Saving...' : 'Alert Me'}
                      </CosmicRadialButton>
                    </div>
                  )}
                  {liveAlertStatus === 'error' && (
                    <p className="text-red-400 mt-3 font-bold">Something went wrong — please try again.</p>
                  )}
                  <p className="mt-4">Standard messaging rates apply. Reply STOP to unsubscribe at any time.</p>
                </div>
              </div>
            )}





            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">

              {/* Main Column */}
              <div className="lg:col-span-2 space-y-0">

                {/* Tour Memories Gallery & Upload */}
                <div className="space-y-6 pt-4 border-t border-black/10">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl  font-bold     tracking-tight">Tour Memories</h3>
                    <Link href="/fan-photo-wall" className="text-xs  text-[var(--color-accent)] font-bold uppercase tracking-widest hover:text-black transition-colors">Global Fan Wall →</Link>
                  </div>

                  {/* Photo Gallery Grid */}
                  {myPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                      {myPhotos.map(photo => {
                        const isVideo = photo.type === "video" || photo.src.endsWith(".mp4") || photo.src.endsWith(".mov");
                        return (
                          <div key={photo.id} className={`relative aspect-square  overflow-hidden group border  ${photo.rejected ? 'border-red-500/40' : 'border-black/10'}`}>
                            {isVideo ? (
                              <video src={photo.src} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                            ) : (
                              <Image width={200} height={200} unoptimized src={photo.src} alt={photo.venue} className="w-full h-full object-cover" />
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-2 right-2 z-10">
                              {photo.approved ? (
                                <span className="px-2 py-0.5 bg-emerald-500 text-black font-mono text-[0.6rem] uppercase tracking-widest rounded font-bold shadow-md">
                                  Live
                                </span>
                              ) : photo.rejected ? (
                                <span className="px-2 py-0.5 bg-red-500 text-black font-mono text-[0.6rem] uppercase tracking-widest rounded font-bold shadow-md">
                                  Declined
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-yellow-500 text-black font-mono text-[0.6rem] uppercase tracking-widest rounded  font-bold  shadow-md">
                                  Review
                                </span>
                              )}
                            </div>

                            {/* Rejected overlay details */}
                            {photo.rejected ? (
                              <div className="absolute inset-0 bg-red-950/80 backdrop-blur-2xs flex flex-col justify-between p-3.5 text-left z-20">
                                <div>
                                  <p className="font-bold text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                    <span>⚠️</span> Declined
                                  </p>
                                  <div className="p-2 bg-red-900/20 border border-red-500/10 rounded">
                                    <p className="text-red-100/90 font-medium leading-normal line-clamp-4">
                                      {photo.rejection_reason || 'Content does not meet community guidelines.'}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-mono text-black/30 truncate mt-auto">{photo.venue || 'Live Event'}</p>
                              </div>
                            ) : (
                              /* Hover overlay for approved/pending */
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                <p className="font-bold text-black truncate">{photo.venue || 'Live Event'}</p>
                                <p className={`font-bold uppercase tracking-widest mt-0.5 ${photo.approved ?'text-emerald-400' : 'text-purple-300'}`}>
                                  {photo.approved ? 'Live on wall' : 'In Review'}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <FanUploadForm />
                </div>

              </div>

              {/* Right Column / Sidebar */}
              <div className="space-y-8">



                {/* VIP Inbox */}
                <div className="pt-4 text-white flex flex-col justify-between">
                  <div className="border-b border-white/10 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                        VIP Inbox
                      </span>
                      {inboxMessages.filter(m => m.isNew).length > 0 && (
                        <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs uppercase tracking-widest font-bold  rounded-lg  animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.2)]">{inboxMessages.filter(m => m.isNew).length} New</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {inboxMessages.map((msg) => (
                      <div key={msg.id || msg.title} className={`group cursor-pointer p-3 -mx-3  hover: bg-[#00000029]    transition-colors border border-transparent hover:border-white/10 ${msg.isNew ? 'bg-white/[0.02]' : 'opacity-60'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8  rounded-lg  ${msg.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-emerald-500/20 border-emerald-500/30'} flex items-center justify-center shrink-0`}>
                            <span className="text-[var(--font-size-3xs)]">{msg.icon}</span>
                          </div>
                          <div>
                            <p className={`font-bold transition-colors ${msg.color ==='yellow' ? 'group-hover:text-yellow-400' : 'group-hover:text-blue-400'}`}>{msg.title}</p>
                            <p className="leading-relaxed mt-1">{msg.desc}</p>
                            <p className={`font-bold tracking-widest uppercase mt-2 ${msg.isNew ?' text-[var(--color-accent)]' : 'text-white/40'}`}>{msg.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty state */}
                    {inboxMessages.length === 0 && (
                      <div className="py-8 flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="font-bold">No messages yet.</p>
                        <p className="mt-1">Raffle wins, alerts & updates will appear here.</p>
                      </div>
                    )}
                  </div>
                </div>


              </div>

            </div>

            {/* 🛍️ Merch Quick Shop */}
            {merch.length > 0 && (
              <div className="mt-8 text-white">
                <div className="flex items-center justify-between mb-5">
                  <span className="flex items-center gap-2 text-xs  font-bold  uppercase tracking-widest text-fuchsia-400">🛍️ Quick Shop</span>
                  <Link href="/merch" className="text-xs text-white/40 hover: text-[var(--color-accent)] uppercase tracking-widest font-bold transition-colors">Full Store →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {merch.map((item: any) => (
                    <div key={item.id} className=" bg-[#00000029]    border border-white/10 overflow-hidden hover:border-fuchsia-500/30 transition-colors group">
                      {item.image && (
                        <div className="aspect-square bg-black/40 overflow-hidden">
                          <Image width={200} height={200} unoptimized src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-colors duration-500" />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="font-bold truncate">{item.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg  font-bold  text-fuchsia-400">${parseFloat(item.price).toFixed(0)}</span>
                          <Link href={`/merch`} className="text-xs  font-bold  uppercase tracking-widest text-white/70 bg-white/10 px-3 py-1.5 rounded border   border-white/10   hover:bg-fuchsia-500 hover:text-black hover:border-fuchsia-500 transition-colors">Buy Now</Link>
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
