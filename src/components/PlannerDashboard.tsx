"use client";

import { useState, useEffect } from "react";
import { useMember } from "@/context/MemberContext";

interface BookingData {
  id: string;
  eventName: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  indoorOutdoor: string;
  expectedAttendance: string;
  organization: string;
  status: "pending" | "confirmed" | "cancelled";
  cancelledAt?: string;
}

const defaultBooking: BookingData = {
  id: "7H-BK-8921",
  eventName: "Mainstage Festival Event",
  eventType: "unplugged",
  date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
  startTime: "7:00 PM",
  endTime: "10:00 PM",
  venueName: "Soldier Field Outdoor Grid",
  venueCity: "Chicago",
  venueState: "IL",
  indoorOutdoor: "Outdoor",
  expectedAttendance: "500",
  organization: "Lakefront Entertainment Group",
  status: "pending",
};

const eventTypeLabels: Record<string, string> = {
  full_band: "Full Band Show",
  unplugged: "Unplugged Acoustic Set",
  private: "Private Event",
  custom: "Custom Booking",
};

export default function PlannerDashboard() {
  const { member, isLoggedIn, hydrated, openModal, login } = useMember();
  const [mounted, setMounted] = useState(false);
  const [booking, setBooking] = useState<BookingData>(defaultBooking);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<BookingData>(defaultBooking);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reviveTimeLeft, setReviveTimeLeft] = useState<string | null>(null);
  const REVIVE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

  // Planner login state
  const [plannerEmail, setPlannerEmail] = useState('');
  const [plannerPassword, setPlannerPassword] = useState('');
  const [plannerName, setPlannerName] = useState('');
  const [plannerLoginError, setPlannerLoginError] = useState('');
  const [plannerLoginLoading, setPlannerLoginLoading] = useState(false);
  const [plannerMode, setPlannerMode] = useState<'login' | 'signup'>('login');

  const handlePlannerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlannerLoginError('');
    setPlannerLoginLoading(true);

    if (plannerMode === 'signup') {
      // Create planner account in localStorage
      if (!plannerName.trim()) { setPlannerLoginError('Name is required.'); setPlannerLoginLoading(false); return; }
      const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
      if (accounts[plannerEmail.toLowerCase()]) {
        setPlannerLoginError('An account with this email already exists. Try signing in.');
        setPlannerLoginLoading(false);
        return;
      }
      accounts[plannerEmail.toLowerCase()] = {
        id: crypto.randomUUID(), name: plannerName.trim(), email: plannerEmail.toLowerCase(),
        joinDate: new Date().toISOString(), avatar: plannerName.trim().split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
        points: 0, tier: 'Bronze', showsAttended: 0, favoriteVenues: [], notificationsEnabled: false, notificationRadius: 25, role: 'event_planner',
      };
      localStorage.setItem('7h_accounts', JSON.stringify(accounts));
    }

    const ok = await login(plannerEmail, plannerPassword);
    if (!ok) {
      setPlannerLoginError(plannerMode === 'signup' ? 'Account created but login failed. Try signing in.' : 'No account found. Create one below.');
    } else {
      // Verify they have the right role
      const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
      const acct = accounts[plannerEmail.toLowerCase()];
      if (acct && acct.role !== 'event_planner') {
        setPlannerLoginError('This account is not an Event Planner account.');
      }
    }
    setPlannerLoginLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    // Fetch bookings from Supabase via API
    const fetchBookings = async () => {
      try {
        const stored = localStorage.getItem('7h_member');
        const email = stored ? JSON.parse(stored).email : null;
        if (!email) return;
        const res = await fetch(`/api/booking?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0]; // most recent booking
          const mapped: BookingData = {
            id: latest.bookingId || latest.booking_id || defaultBooking.id,
            eventName: latest.eventType ? (eventTypeLabels[latest.eventType] || latest.eventType) : defaultBooking.eventName,
            eventType: latest.eventType || defaultBooking.eventType,
            date: latest.eventDate || latest.event_date || defaultBooking.date,
            startTime: latest.startTime || latest.start_time || defaultBooking.startTime,
            endTime: latest.endTime || latest.end_time || defaultBooking.endTime,
            venueName: latest.venueName || latest.venue_name || defaultBooking.venueName,
            venueCity: latest.venueCity || latest.venue_city || defaultBooking.venueCity,
            venueState: latest.venueState || latest.venue_state || defaultBooking.venueState,
            indoorOutdoor: latest.indoorOutdoor || latest.indoor_outdoor || defaultBooking.indoorOutdoor,
            expectedAttendance: latest.expectedAttendance || latest.expected_attendance || defaultBooking.expectedAttendance,
            organization: latest.organization || defaultBooking.organization,
            status: latest.status || defaultBooking.status,
            cancelledAt: latest.cancelledAt || latest.cancelled_at,
          };
          setBooking(mapped);
          setEditDraft(mapped);
        }
      } catch (e) {
        console.error('Failed to fetch bookings:', e);
      }
    };
    fetchBookings();
  }, []);

  // Revive countdown timer
  useEffect(() => {
    if (booking.status !== 'cancelled') {
      setReviveTimeLeft(null);
      return;
    }

    // Backfill cancelledAt for legacy cancelled bookings
    if (!booking.cancelledAt) {
      setBooking(prev => ({ ...prev, cancelledAt: new Date().toISOString() }));
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - new Date(booking.cancelledAt!).getTime();
      const remaining = REVIVE_WINDOW_MS - elapsed;
      if (remaining <= 0) {
        setReviveTimeLeft(null);
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setReviveTimeLeft(`${mins}m ${secs.toString().padStart(2, '0')}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [booking.status, booking.cancelledAt, REVIVE_WINDOW_MS]);

  // Developer Bypass Check — allows viewing the dashboard UI for dev work
  const isDevBypass = typeof window !== "undefined" && localStorage.getItem('7h_dev_bypass') === 'true';
  // Footer link uses ?login=true to force showing the login form
  const forceLogin = typeof window !== "undefined" && new URLSearchParams(window.location.search).get('login') === 'true';
  const hasAccess = (!forceLogin && isDevBypass) || (isLoggedIn && member?.role === "event_planner");
  const isSignedInPlanner = hasAccess;

  if (!mounted || !hydrated) return null;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-500 opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#0c0c18] border border-white/10 overflow-hidden shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-fuchsia-500" />

            <div className="p-10">
              <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                  Planner <span className="text-fuchsia-400">Portal</span>
                </h1>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/30 mt-2">
                  Event planner accounts only
                </p>
              </div>

              <form onSubmit={handlePlannerLogin} className="flex flex-col gap-4">
                {plannerMode === 'signup' && (
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Full Name</label>
                    <input type="text" value={plannerName} onChange={e => setPlannerName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell" className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-fuchsia-500/50 transition-colors" required />
                  </div>
                )}
                <div>
                  <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email</label>
                  <input type="email" value={plannerEmail} onChange={e => setPlannerEmail(e.target.value)}
                    placeholder="planner@company.com" className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-fuchsia-500/50 transition-colors" required />
                </div>
                <div>
                  <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Password</label>
                  <input type="password" value={plannerPassword} onChange={e => setPlannerPassword(e.target.value)}
                    placeholder="••••••••" className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-fuchsia-500/50 transition-colors" required />
                </div>

                {plannerLoginError && (
                  <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20">{plannerLoginError}</p>
                )}

                <button type="submit" disabled={plannerLoginLoading}
                  className="w-full py-3.5 bg-fuchsia-600 text-white font-bold text-sm uppercase tracking-[0.15em] hover:bg-fuchsia-500 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(217,70,239,0.2)]">
                  {plannerLoginLoading ? 'Authenticating...' : plannerMode === 'signup' ? 'Create Planner Account' : 'Sign In as Planner'}
                </button>

                <button type="button" onClick={() => { setPlannerMode(m => m === 'login' ? 'signup' : 'login'); setPlannerLoginError(''); }}
                  className="text-[0.65rem] text-fuchsia-400/60 hover:text-fuchsia-400 uppercase tracking-[0.15em] font-bold transition-colors cursor-pointer">
                  {plannerMode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
                </button>
              </form>

              <p className="mt-8 text-center text-[0.55rem] text-white/15 uppercase tracking-[0.2em]">
                7th Heaven · Event Planning Portal
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleEditStart = () => {
    setEditDraft({ ...booking });
    setIsEditing(true);
  };

  const handleEditSave = () => {
    setBooking({ ...editDraft });
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleCancelRequest = async () => {
    setBooking(prev => ({ ...prev, status: "cancelled", cancelledAt: new Date().toISOString() }));
    setShowCancelConfirm(false);
    // Persist to Supabase
    try {
      await fetch('/api/booking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, status: 'cancelled' }),
      });
    } catch {}
  };

  const statusConfig = {
    pending: { label: "Pending Review", color: "amber", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500", bar: "bg-amber-500" },
    confirmed: { label: "Confirmed", color: "emerald", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-500", bar: "bg-emerald-500" },
    cancelled: { label: "Cancelled", color: "rose", bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-500", bar: "bg-rose-500" },
  };

  const s = statusConfig[booking.status];

  return (
    <section className="py-24 bg-[#050508] min-h-screen font-sans">
      <div className="site-container">
        

        {/* Account Identity Header — matches fan/crew layout */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-fuchsia-500/20 border-2 border-fuchsia-500 flex items-center justify-center text-xl font-black text-fuchsia-400">
              {isSignedInPlanner && member?.name
                ? member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                : '📋'}
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-fuchsia-500 border-2 border-[#050508] flex items-center justify-center">
                <span className="text-[10px]">📋</span>
              </span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black italic tracking-tight">{isSignedInPlanner && member?.name ? member.name : 'Event Planner'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.15em] border rounded-full bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30">
                  📋 Event Planner
                </span>
              </div>
              <p className="text-[0.85rem] text-white/40 font-mono mt-1">{isSignedInPlanner && member?.email ? member.email : 'Sign in to manage bookings'}</p>
            </div>
          </div>
          <div className="flex gap-4">
            {(() => {
              const params = new URLSearchParams();
              params.set("organization", booking.organization);
              params.set("from", "planner");
              return (
                <a href={isSignedInPlanner ? `/book?${params.toString()}` : "#"} 
                   onClick={(e) => { if (!isSignedInPlanner) { e.preventDefault(); window.location.href = '/planner'; } }}
                   className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold text-[0.75rem] uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] hover:shadow-[0_0_30px_rgba(133,29,239,0.5)] flex items-center gap-2">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                   New Booking
                </a>
              );
            })()}
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCancelConfirm(false)}>
            <div className="bg-[#0c0c18] border border-rose-500/30 p-8 rounded-3xl shadow-[0_0_60px_rgba(244,63,94,0.15)] max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Cancel This Booking?</h3>
              <p className="text-white/40 text-[0.85rem] text-center mb-2">{booking.eventName}</p>
              <p className="text-white/30 text-[0.75rem] text-center mb-8">This will send a cancellation request to 7th Heaven. You can always rebook later.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-[0.7rem] uppercase tracking-wider rounded-xl transition-all"
                >
                  Keep Booking
                </button>
                <button 
                  onClick={handleCancelRequest}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[0.7rem] uppercase tracking-wider rounded-xl transition-all"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOOKING CARDS */}
        <div className="grid grid-cols-1 gap-6">
           <div className={`bg-[#0b0b12] border ${booking.status === 'cancelled' ? 'border-rose-500/10 opacity-60' : 'border-white/5'} p-6 md:p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row gap-8 relative overflow-hidden group transition-all`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${s.bar}`} />
              
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-4">
                    <span className={`text-[0.65rem] font-bold ${s.text} uppercase tracking-widest px-3 py-1 ${s.bg} ${s.border} border rounded-full`}>{s.label}</span>
                    <span className="text-[0.65rem] text-white/40 tracking-widest uppercase">ID: {booking.id}</span>
                 </div>

                 {/* View Mode */}
                 {!isEditing ? (
                   <>
                     <h2 className={`text-2xl font-bold text-white mb-2 tracking-tight ${booking.status === 'cancelled' ? 'line-through opacity-50' : ''}`}>{booking.eventName}</h2>
                     <p className="text-sm text-[var(--color-accent)] font-medium mb-6">{eventTypeLabels[booking.eventType] || booking.eventType}</p>
                     
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[0.65rem] text-white/30 uppercase tracking-[0.1em] font-bold mb-1">Date</p>
                          <p className="text-[0.8rem] text-white font-bold">{booking.date}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] text-white/30 uppercase tracking-[0.1em] font-bold mb-1">Time Window</p>
                          <p className="text-[0.8rem] text-white font-bold">{booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] text-white/30 uppercase tracking-[0.1em] font-bold mb-1">Venue</p>
                          <p className="text-[0.8rem] text-white font-bold truncate">{booking.venueName}</p>
                        </div>
                        <div>
                          <p className="text-[0.65rem] text-white/30 uppercase tracking-[0.1em] font-bold mb-1">City</p>
                          <p className="text-[0.8rem] text-white font-bold truncate">{booking.venueCity}, {booking.venueState}</p>
                        </div>
                     </div>
                   </>
                 ) : (
                   /* Edit Mode */
                   <div className="space-y-4">
                     <div>
                       <label className="text-[0.6rem] text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">Event Name</label>
                       <input value={editDraft.eventName} onChange={e => setEditDraft(d => ({...d, eventName: e.target.value}))}
                         className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-[0.85rem] text-white focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all" />
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div>
                         <label className="text-[0.6rem] text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">Start Time</label>
                         <input value={editDraft.startTime} onChange={e => setEditDraft(d => ({...d, startTime: e.target.value}))}
                           className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 rounded-xl text-[0.85rem] text-white focus:border-[var(--color-accent)] outline-none transition-all" />
                       </div>
                       <div>
                         <label className="text-[0.6rem] text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">End Time</label>
                         <input value={editDraft.endTime} onChange={e => setEditDraft(d => ({...d, endTime: e.target.value}))}
                           className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 rounded-xl text-[0.85rem] text-white focus:border-[var(--color-accent)] outline-none transition-all" />
                       </div>
                       <div>
                         <label className="text-[0.6rem] text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">Venue</label>
                         <input value={editDraft.venueName} onChange={e => setEditDraft(d => ({...d, venueName: e.target.value}))}
                           className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 rounded-xl text-[0.85rem] text-white focus:border-[var(--color-accent)] outline-none transition-all" />
                       </div>
                       <div>
                         <label className="text-[0.6rem] text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">Attendance</label>
                         <input value={editDraft.expectedAttendance} onChange={e => setEditDraft(d => ({...d, expectedAttendance: e.target.value}))}
                           className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 rounded-xl text-[0.85rem] text-white focus:border-[var(--color-accent)] outline-none transition-all" />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-[0.6rem] text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">City</label>
                         <input value={editDraft.venueCity} onChange={e => setEditDraft(d => ({...d, venueCity: e.target.value}))}
                           className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 rounded-xl text-[0.85rem] text-white focus:border-[var(--color-accent)] outline-none transition-all" />
                       </div>
                       <div>
                         <label className="text-[0.6rem] text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">State</label>
                         <input value={editDraft.venueState} onChange={e => setEditDraft(d => ({...d, venueState: e.target.value}))}
                           className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 rounded-xl text-[0.85rem] text-white focus:border-[var(--color-accent)] outline-none transition-all" />
                       </div>
                     </div>
                   </div>
                 )}
              </div>

              {/* Actions — require real sign-in */}
              <div className="lg:w-64 flex flex-col justify-center gap-3 lg:border-l border-white/5 lg:pl-8">
                 {isSignedInPlanner ? (
                   <>
                     {isEditing ? (
                       /* Edit mode actions */
                       <>
                         <button onClick={handleEditSave}
                           className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-transparent text-emerald-400 hover:text-white font-bold text-[0.7rem] uppercase tracking-wider rounded-xl transition-all">
                           Save Changes
                         </button>
                         <button onClick={handleEditCancel}
                           className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white/60 font-bold text-[0.7rem] uppercase tracking-wider rounded-xl transition-all border border-white/5">
                           Discard
                         </button>
                       </>
                     ) : booking.status === "cancelled" ? (
                       /* Cancelled state — rebook or revive */
                       <>
                         <a 
                           href={(() => {
                             const p = new URLSearchParams();
                             p.set("from", "rebook");
                             p.set("organization", booking.organization);
                             p.set("venueName", booking.venueName);
                             p.set("venueCity", booking.venueCity);
                             p.set("venueState", booking.venueState);
                             p.set("eventType", booking.eventType);
                             p.set("startTime", booking.startTime);
                             p.set("endTime", booking.endTime);
                             p.set("indoorOutdoor", booking.indoorOutdoor);
                             p.set("expectedAttendance", booking.expectedAttendance);
                             return `/book?${p.toString()}`;
                           })()}
                           className="w-full py-3 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:border-transparent text-[var(--color-accent)] hover:text-white font-bold text-[0.7rem] uppercase tracking-wider rounded-xl transition-all text-center"
                         >
                           Rebook This Event
                         </a>
                         {reviveTimeLeft && (
                           <>
                             <button onClick={() => setBooking(prev => ({ ...prev, status: "pending", cancelledAt: undefined }))}
                               className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-transparent text-emerald-400 hover:text-white font-bold text-[0.7rem] uppercase tracking-wider rounded-xl transition-all">
                               Revive Booking
                             </button>
                             <p className="text-center text-white/30 text-[0.65rem] font-mono">
                               ⏱ Revive expires in <span className="text-amber-400 font-bold">{reviveTimeLeft}</span>
                             </p>
                           </>
                         )}
                       </>
                     ) : (
                       /* Normal actions */
                       <>
                         <a 
                           href={(() => {
                             const p = new URLSearchParams();
                             p.set("from", "rebook");
                             p.set("organization", booking.organization);
                             p.set("venueName", booking.venueName);
                             p.set("venueCity", booking.venueCity);
                             p.set("venueState", booking.venueState);
                             p.set("eventType", booking.eventType);
                             p.set("startTime", booking.startTime);
                             p.set("endTime", booking.endTime);
                             p.set("indoorOutdoor", booking.indoorOutdoor);
                             p.set("expectedAttendance", booking.expectedAttendance);
                             return `/book?${p.toString()}`;
                           })()}
                           className="w-full py-3 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:border-transparent text-[var(--color-accent)] hover:text-white font-bold text-[0.7rem] uppercase tracking-wider rounded-xl transition-all text-center"
                         >
                           Rebook This Event
                         </a>
                         <button onClick={handleEditStart}
                           className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white font-bold text-[0.7rem] uppercase tracking-wider rounded-xl transition-all border border-white/5">
                           Edit Logistics
                         </button>
                         <button onClick={() => setShowCancelConfirm(true)}
                           className="w-full py-3 text-rose-400 font-bold text-[0.7rem] uppercase tracking-wider hover:bg-rose-500/10 rounded-xl transition-all">
                           Cancel Request
                         </button>
                       </>
                     )}
                   </>
                 ) : (
                   <a 
                     href="/planner"
                     className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white font-bold text-[0.7rem] uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                   >
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                     Sign in to manage
                   </a>
                 )}
                 <a 
                   href={`mailto:7thheaven@gmail.com?subject=${encodeURIComponent(`[Booking Dashboard] Issue with Event — ${booking.id}`)}&body=${encodeURIComponent(`Hi 7th Heaven,\n\nI'm reaching out from my Booking Dashboard regarding the following event:\n\n────────────────────────\nBooking ID: ${booking.id}\nEvent: ${booking.eventName}\nType: ${eventTypeLabels[booking.eventType] || booking.eventType}\nDate: ${booking.date}\nTime: ${booking.startTime} – ${booking.endTime}\nVenue: ${booking.venueName}\nCity: ${booking.venueCity}, ${booking.venueState}\nStatus: ${s.label}\n────────────────────────\n\nEvent Planner Message:\n\n`)}`}
                   className="w-full py-3 flex items-center justify-center gap-2 text-white/40 hover:text-[var(--color-accent)] font-bold text-[0.7rem] uppercase tracking-wider hover:bg-[var(--color-accent)]/5 rounded-xl transition-all"
                 >
                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                   Contact 7th Heaven
                 </a>
              </div>
           </div>

        </div>

      </div>
    </section>
  );
}
