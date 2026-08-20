/* eslint-disable react-doctor/no-giant-component */
"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, FileText, Check, CheckSquare, Square, PartyPopper, Lightbulb, History, Calendar, MapPin, Clock, Navigation } from "lucide-react";
import Link from "next/link";
import { useMember } from "@/context/MemberContext";
import { SquishyToggle } from "@/components/SquishyToggle";

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
  soundSystem?: string;
  stageAvailable?: string;
  loadInTime?: string;
  parkingAddress?: string;
  parkingNotes?: string;
  notes?: string;
}

const defaultBooking: BookingData = {
  id: "7H-BK-8921",
  eventName: "Mainstage Festival Event",
  eventType: "unplugged",
  date: "Thu, Aug 6, 2026",
  startTime: "7:00 PM",
  endTime: "10:30 PM",
  venueName: "Bridges Scoreboard",
  venueCity: "Chicago",
  venueState: "IL",
  indoorOutdoor: "Outdoor",
  expectedAttendance: "250",
  organization: "Scoreboard Entertainment",
  status: "confirmed",
  soundSystem: "Yes — full PA system",
  stageAvailable: "Yes",
  loadInTime: "3:00 PM",
  parkingAddress: "980 S Bartlett Rd, Lot B",
  parkingNotes: "Band bus & crew truck park in West Lot behind stage. Enter through Gate 4 off Bartlett Rd.",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; text: string; bar: string }> = {
  pending: { label: "Pending Review", color: "purple", bg: "bg-purple-600/10", border: "border-purple-500/20", text: " text-[var(--color-accent)]", bar: "bg-purple-600" },
  confirmed: { label: "Confirmed", color: "emerald", bg: "bg-emerald-500/10", border: " border-[var(--color-accent)]/30", text: "text-emerald-500", bar: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "rose", bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-500", bar: "bg-rose-500" },
};

const rebookUrl = (b: BookingData) => {
  const p = new URLSearchParams();
  p.set("from", "rebook"); p.set("organization", b.organization);
  p.set("venueName", b.venueName); p.set("venueCity", b.venueCity);
  p.set("venueState", b.venueState); p.set("eventType", b.eventType);
  p.set("startTime", b.startTime); p.set("endTime", b.endTime);
  p.set("indoorOutdoor", b.indoorOutdoor); p.set("expectedAttendance", b.expectedAttendance);
  return `/book?${p.toString()}`;
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
  const [allBookings, setAllBookings] = useState<BookingData[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<BookingData>(defaultBooking);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reviveTimeLeft, setReviveTimeLeft] = useState<string | null>(null);
  const [plannerNotes, setPlannerNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const REVIVE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

  // Planner login state
  const [plannerEmail, setPlannerEmail] = useState('');
  const [plannerPassword, setPlannerPassword] = useState('');
  const [plannerName, setPlannerName] = useState('');
  const [plannerLoginError, setPlannerLoginError] = useState('');
  const [plannerLoginLoading, setPlannerLoginLoading] = useState(false);
  const [plannerAgeConfirmed, setPlannerAgeConfirmed] = useState(false);
  const [plannerMode, setPlannerMode] = useState<'login' | 'signup'>('login');

  const handlePlannerLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setPlannerLoginError(''); setPlannerLoginLoading(true);
    try {
      const storedAccountsStr = localStorage.getItem('7h_accounts_v1') || localStorage.getItem('7h_accounts');
      const accounts = JSON.parse(storedAccountsStr || '{}');
      if (plannerMode === 'signup') {
        // Create planner account in localStorage
        if (!plannerName.trim()) { setPlannerLoginError('Name is required.'); return; }
        if (!plannerAgeConfirmed) { setPlannerLoginError('You must confirm you are over 18 years old to sign up.'); return; }
        if (accounts[plannerEmail.toLowerCase()]) {
          setPlannerLoginError('An account with this email already exists. Try signing in.');
          return;
        }
        accounts[plannerEmail.toLowerCase()] = {
          id: crypto.randomUUID(), name: plannerName.trim(), email: plannerEmail.toLowerCase(),
          joinDate: new Date().toISOString(), avatar: plannerName.trim().split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
          points: 0, tier: 'Bronze', showsAttended: 0, favoriteVenues: [], notificationsEnabled: false, notificationRadius: 25, role: 'event_planner',
        };
        localStorage.setItem('7h_accounts_v1', JSON.stringify(accounts));
      }

      const ok = await login(plannerEmail, plannerPassword);
      if (!ok) {
        setPlannerLoginError(plannerMode === 'signup' ? 'Account created but login failed. Try signing in.' : 'No account found. Create one below.');
      } else {
        // Verify they have the right role
        const acct = accounts[plannerEmail.toLowerCase()];
        if (acct && acct.role !== 'event_planner') {
          setPlannerLoginError('This account is not an Event Planner account.');
        }
      }
    } finally {
      setPlannerLoginLoading(false);
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      const stored = localStorage.getItem('7h_member_v1') || localStorage.getItem('7h_member');
      const email = stored ? JSON.parse(stored).email : null;
      if (!email) return;
      const res = await fetch(`/api/booking?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: BookingData[] = data.map((item: any) => ({
            id: item.bookingId || item.booking_id || defaultBooking.id,
            eventName: item.eventType ? (eventTypeLabels[item.eventType] || item.eventType) : defaultBooking.eventName,
            eventType: item.eventType || defaultBooking.eventType,
            date: item.eventDate || item.event_date || defaultBooking.date,
            startTime: item.startTime || item.start_time || defaultBooking.startTime,
            endTime: item.endTime || item.end_time || defaultBooking.endTime,
            venueName: item.venueName || item.venue_name || defaultBooking.venueName,
            venueCity: item.venueCity || item.venue_city || defaultBooking.venueCity,
            venueState: item.venueState || item.venue_state || defaultBooking.venueState,
            indoorOutdoor: item.indoorOutdoor || item.indoor_outdoor || defaultBooking.indoorOutdoor,
            expectedAttendance: item.expectedAttendance || item.expected_attendance || defaultBooking.expectedAttendance,
            organization: item.organization || defaultBooking.organization,
            status: item.status || defaultBooking.status,
            cancelledAt: item.cancelledAt || item.cancelled_at,
            soundSystem: item.soundSystem || item.sound_system || '',
            stageAvailable: item.stageAvailable || item.stage_available || '',
            loadInTime: item.loadInTime || item.load_in_time || '',
            notes: item.details || item.notes || '',
          }));
          setAllBookings(mapped);
          // Active booking = most recent non-cancelled, or just the first
          const active = mapped.find(b => b.status !== 'cancelled') || mapped[0];
          setBooking(active);
          setEditDraft(active);
          setPlannerNotes(active.notes || '');
        }
      }
    } catch (e) {
      console.error('Failed to fetch bookings:', e);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchBookings();
  }, [fetchBookings]);

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
  const isDevBypass = typeof window !== "undefined" && process.env.NODE_ENV === 'development' && localStorage.getItem('7h_dev_bypass') === 'true';
  // Footer link uses ?login=true to force showing the login form
  const forceLogin = typeof window !== "undefined" && new URLSearchParams(window.location.search).get('login') === 'true';
  const hasAccess = (!forceLogin && isDevBypass) || (isLoggedIn && member?.role === "event_planner");
  const isSignedInPlanner = hasAccess;

  if (!mounted || !hydrated) return null;

  if (!hasAccess) {
    return (
      <div className="min-h-screen   text-white flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--color-accent)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[var(--color-bg-surface)] border border-white/10 overflow-hidden">
            <div className="h-px bg-[var(--color-accent)]/40" />

            <div className="p-10">
              <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto mb-5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                  Planner <span className=" text-[var(--color-accent)]">Portal</span>
                </h1>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30 mt-2">
                  Event planner accounts only
                </p>
              </div>

              <form onSubmit={handlePlannerLogin} className="flex flex-col gap-4">
                {plannerMode === 'signup' && (
                  <div>
                    <label htmlFor="planner-full-name" className="text-xs uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Full Name</label>
                    <input aria-label="Input field" id="planner-full-name" type="text" value={plannerName} onChange={e => setPlannerName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell" className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)]/50 transition-colors" required />
                  </div>
                )}
                <div>
                  <label htmlFor="planner-login-email" className="text-xs uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email</label>
                  <input aria-label="Input field" id="planner-login-email" type="email" value={plannerEmail} onChange={e => setPlannerEmail(e.target.value)}
                    placeholder="planner@company.com" className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)]/50 transition-colors" required />
                </div>
                <div>
                  <label htmlFor="planner-login-password" className="text-xs uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Password</label>
                  <input aria-label="Input field" id="planner-login-password" type="password" value={plannerPassword} onChange={e => setPlannerPassword(e.target.value)}
                    placeholder="••••••••" className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)]/50 transition-colors" required />
                </div>

                {plannerMode === 'signup' && (
                  <div className="flex items-center gap-2.5 my-1.5 select-none cursor-pointer" onClick={() => setPlannerAgeConfirmed(!plannerAgeConfirmed)}>
                    <SquishyToggle
                      id="planner-age-confirm-toggle"
                      label="I confirm that I am 18 years of age or older"
                      checked={plannerAgeConfirmed}
                      onChange={setPlannerAgeConfirmed}
                    />
                    <span className="text-[var(--font-size-2xs)] font-semibold text-white/70 leading-tight">
                      I confirm that I am <span className="text-white font-bold">18 years of age or older</span>
                    </span>
                  </div>
                )}

                {plannerLoginError && (
                  <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20">{plannerLoginError}</p>
                )}

                <button aria-label="Action button" type="submit" disabled={plannerLoginLoading}
                  className="w-full py-3.5 bg-[var(--color-accent)] text-white font-bold text-sm uppercase tracking-[0.15em] hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(217,70,239,0.2)]">
                  {plannerLoginLoading ? 'Authenticating...' : plannerMode === 'signup' ? 'Create Planner Account' : 'Sign In as Planner'}
                </button>

                <button aria-label="Action button" type="button" onClick={() => { setPlannerMode(m => m === 'login' ? 'signup' : 'login'); setPlannerLoginError(''); }}
                  className="text-xs  text-[var(--color-accent)]/60 hover: text-[var(--color-accent)] uppercase tracking-[0.15em] font-bold transition-colors cursor-pointer">
                  {plannerMode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
                </button>
              </form>

              <p className="mt-8 text-center text-xs text-white/15 uppercase tracking-[0.2em]">
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
    } catch { }
  };

  const s = STATUS_CONFIG[booking.status];

  return (
    <section className="min-h-screen font-sans pb-16">
      <div className="">



        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-default" onClick={() => setShowCancelConfirm(false)}>
            <div className="bg-[var(--color-bg-surface)] border border-rose-500/30 p-8 rounded-3xl shadow-[0_0_60px_rgba(244,63,94,0.15)] max-w-md w-full text-left cursor-auto" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
                <History className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Cancel This Booking?</h3>
              <p className="text-white/40 text-base text-center mb-2">{booking.eventName}</p>
              <p className="text-white/30 text-sm text-center mb-8">This will send a cancellation request to 7th Heaven. You can always rebook later.</p>
              <div className="flex gap-3">
                <button aria-label="Action button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  Keep Booking
                </button>
                <button aria-label="Action button"
                  onClick={handleCancelRequest}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOOKING CARDS */}
        <div className="grid grid-cols-1 gap-6">
          <div className={`bg-[var(--color-bg-surface)] border ${booking.status === 'cancelled' ? 'border-rose-500/10 opacity-60' : 'border-white/5'} p-6 md:p-8 rounded-3xl shadow-xl flex flex-col lg:flex-row gap-8 relative overflow-hidden group transition-colors`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${s.bar}`} />

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold ${s.text} uppercase tracking-widest px-3 py-1 ${s.bg} ${s.border} border rounded-full`}>{s.label}</span>
                <span className="text-xs text-white/40 tracking-widest uppercase">ID: {booking.id}</span>
              </div>

              {/* View Mode */}
              {!isEditing ? (
                <>
                  <h2 className={`text-2xl font-bold text-white mb-2 tracking-tight ${booking.status === 'cancelled' ? 'line-through opacity-50' : ''}`}>{booking.eventName}</h2>
                  <p className="text-sm  text-[var(--color-accent)] font-medium mb-6">{eventTypeLabels[booking.eventType] || booking.eventType}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-[0.1em] font-bold mb-1">Date</p>
                      <p className="text-sm text-white font-bold">{booking.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-[0.1em] font-bold mb-1">Time Window</p>
                      <p className="text-sm text-white font-bold">{booking.startTime} - {booking.endTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-[0.1em] font-bold mb-1">Venue</p>
                      <p className="text-sm text-white font-bold truncate">{booking.venueName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-[0.1em] font-bold mb-1">City</p>
                      <p className="text-sm text-white font-bold truncate">{booking.venueCity}, {booking.venueState}</p>
                    </div>
                  </div>
                </>
              ) : (
                /* Edit Mode */
                <div className="space-y-4">
                  <div>
                    <label htmlFor="planner-edit-event-name" className="text-xs text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">Event Name</label>
                    <input aria-label="Input field" id="planner-edit-event-name" value={editDraft.eventName} onChange={e => setEditDraft(d => ({ ...d, eventName: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-base text-white focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="planner-edit-start-time" className="text-xs text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">Start Time</label>
                      <input aria-label="Input field" id="planner-edit-start-time" value={editDraft.startTime} onChange={e => setEditDraft(d => ({ ...d, startTime: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 text-base text-white focus:border-[var(--color-accent)] outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="planner-edit-end-time" className="text-xs text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">End Time</label>
                      <input aria-label="Input field" id="planner-edit-end-time" value={editDraft.endTime} onChange={e => setEditDraft(d => ({ ...d, endTime: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 text-base text-white focus:border-[var(--color-accent)] outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="planner-edit-venue" className="text-xs text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">Venue</label>
                      <input aria-label="Input field" id="planner-edit-venue" value={editDraft.venueName} onChange={e => setEditDraft(d => ({ ...d, venueName: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 text-base text-white focus:border-[var(--color-accent)] outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="planner-edit-attendance" className="text-xs text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">Attendance</label>
                      <input aria-label="Input field" id="planner-edit-attendance" value={editDraft.expectedAttendance} onChange={e => setEditDraft(d => ({ ...d, expectedAttendance: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 text-base text-white focus:border-[var(--color-accent)] outline-none transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="planner-edit-city" className="text-xs text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">City</label>
                      <input aria-label="Input field" id="planner-edit-city" value={editDraft.venueCity} onChange={e => setEditDraft(d => ({ ...d, venueCity: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 text-base text-white focus:border-[var(--color-accent)] outline-none transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="planner-edit-state" className="text-xs text-white/30 uppercase tracking-[0.15em] font-bold block mb-1">State</label>
                      <input aria-label="Input field" id="planner-edit-state" value={editDraft.venueState} onChange={e => setEditDraft(d => ({ ...d, venueState: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 text-base text-white focus:border-[var(--color-accent)] outline-none transition-colors" />
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
                      <button aria-label="Action button" onClick={handleEditSave}
                        className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-transparent text-[var(--color-accent)] hover:text-white font-bold text-sm uppercase tracking-wider transition-colors">
                        Save Changes
                      </button>
                      <button aria-label="Action button" onClick={handleEditCancel}
                        className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white/60 font-bold text-sm uppercase tracking-wider transition-colors border border-white/5">
                        Discard
                      </button>
                    </>
                  ) : booking.status === "cancelled" ? (
                    /* Cancelled state — rebook or revive */
                    <>
                      <a
                        href={rebookUrl(booking)}
                        className="w-full py-3 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:border-transparent  text-[var(--color-accent)] hover:text-white font-bold text-sm uppercase tracking-wider transition-colors text-center"
                      >
                        Rebook This Event
                      </a>
                      {reviveTimeLeft && (
                        <>
                          <button aria-label="Previous" onClick={() => setBooking(prev => ({ ...prev, status: "pending", cancelledAt: undefined }))}
                            className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-transparent text-[var(--color-accent)] hover:text-white font-bold text-sm uppercase tracking-wider transition-colors">
                            Revive Booking
                          </button>
                          <p className="text-center text-white/30 text-xs font-mono">
                            ⏱ Revive expires in <span className="text-purple-300 font-bold">{reviveTimeLeft}</span>
                          </p>
                        </>
                      )}
                    </>
                  ) : (
                    /* Normal actions */
                    <>
                      <a
                        href={rebookUrl(booking)}
                        className="w-full py-3 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:border-transparent  text-[var(--color-accent)] hover:text-white font-bold text-sm uppercase tracking-wider transition-colors text-center"
                      >
                        Rebook This Event
                      </a>
                      <button aria-label="Action button" onClick={handleEditStart}
                        className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white font-bold text-sm uppercase tracking-wider transition-colors border border-white/5">
                        Edit Logistics
                      </button>
                      <button aria-label="Action button" onClick={() => setShowCancelConfirm(true)}
                        className="w-full py-3 text-rose-400 font-bold text-sm uppercase tracking-wider hover:bg-rose-500/10 transition-colors">
                        Cancel Request
                      </button>
                    </>
                  )}
                </>
              ) : (
                <Link
                  href="/planner"
                  className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white font-bold text-sm uppercase tracking-wider transition-colors border border-white/10 flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4" />
                  Sign in to manage
                </Link>
              )}
              <a
                href={`mailto:7thheaven@gmail.com?subject=${encodeURIComponent(`[Booking Dashboard] Issue with Event — ${booking.id}`)}&body=${encodeURIComponent(`Hi 7th Heaven,\n\nI'm reaching out from my Booking Dashboard regarding the following event:\n\n────────────────────────\nBooking ID: ${booking.id}\nEvent: ${booking.eventName}\nType: ${eventTypeLabels[booking.eventType] || booking.eventType}\nDate: ${booking.date}\nTime: ${booking.startTime} – ${booking.endTime}\nVenue: ${booking.venueName}\nCity: ${booking.venueCity}, ${booking.venueState}\nStatus: ${s.label}\n────────────────────────\n\nEvent Planner Message:\n\n`)}`}
                className="w-full py-3 flex items-center justify-center gap-2 text-white/40 hover: text-[var(--color-accent)] font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-accent)]/5 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Contact 7th Heaven
              </a>
            </div>
          </div>

        </div>

        {/* ── Planner Notes ── */}
        <div className="mt-8">
          <div className="">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">

                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Event Notes</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-bold mt-0.5">Private notes for your event — visible to you and the 7th Heaven team</p>
                </div>
              </div>
              {notesSaved && (
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] bg-emerald-500/10 px-3 py-1 rounded-full border border-[var(--color-accent)]/30 animate-[fade-in-up_0.3s_ease-out] flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved</span>
              )}
            </div>
            <textarea aria-label="Text input"
              value={plannerNotes}
              onChange={e => { setPlannerNotes(e.target.value); setNotesSaved(false); }}
              placeholder="Add notes about your event... (e.g. parking instructions, green room needs, special requests, AV contact info)"
              rows={4}
              className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 text-base text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-colors resize-none mb-3"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/20">{plannerNotes.length}/2000 characters</p>
              <button aria-label="Action button"
                onClick={async () => {
                  setNotesSaving(true);
                  try {
                    await fetch('/api/booking', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ bookingId: booking.id, notes: plannerNotes }),
                    });
                    setNotesSaved(true);
                    setTimeout(() => setNotesSaved(false), 3000);
                  } catch { }
                  setNotesSaving(false);
                }}
                disabled={notesSaving}
                className="px-5 py-2 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)] border border-[var(--color-accent)]/30 hover:border-transparent  text-[var(--color-accent)] hover:text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                {notesSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Day-of Checklist ── */}
        {booking.status !== 'cancelled' && (
          <div className="mt-8">
            <div className="relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-[var(--color-accent)]/30 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Event Readiness Checklist</h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-bold mt-0.5">Auto-generated from your booking details</p>
                  </div>
                </div>
                {(() => {
                  const items = [
                    { done: !!booking.date },
                    { done: !!booking.startTime && !!booking.endTime },
                    { done: !!booking.venueName },
                    { done: !!booking.indoorOutdoor },
                    { done: !!booking.soundSystem },
                    { done: !!booking.stageAvailable },
                    { done: !!booking.loadInTime },
                    { done: !!booking.expectedAttendance },
                  ];
                  const done = items.filter(i => i.done).length;
                  const pct = Math.round((done / items.length) * 100);
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/5 rounded-lg overflow-hidden">
                        <div className={`h-full rounded-lg transition-colors duration-500 ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-purple-600' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-widest ${pct === 100 ? 'text-emerald-400' : 'text-white/40'}`}>
                        {done}/{items.length}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Event date confirmed', done: !!booking.date, detail: booking.date || 'Not set' },
                  { label: 'Show time set', done: !!booking.startTime && !!booking.endTime, detail: booking.startTime && booking.endTime ? `${booking.startTime} – ${booking.endTime}` : 'Not set' },
                  { label: 'Venue details provided', done: !!booking.venueName, detail: booking.venueName || 'Not set' },
                  { label: 'Indoor/Outdoor specified', done: !!booking.indoorOutdoor, detail: booking.indoorOutdoor || 'Not set' },
                  { label: 'Sound system confirmed', done: !!booking.soundSystem, detail: booking.soundSystem || 'Not confirmed' },
                  { label: 'Stage availability confirmed', done: !!booking.stageAvailable, detail: booking.stageAvailable || 'Not confirmed' },
                  { label: 'Load-in / setup time', done: !!booking.loadInTime, detail: booking.loadInTime || 'Not set' },
                  { label: 'Expected attendance', done: !!booking.expectedAttendance, detail: booking.expectedAttendance ? `~${booking.expectedAttendance} guests` : 'Not set' },
                  { label: 'Parking & Directions', done: !!booking.parkingNotes || !!booking.parkingAddress, detail: booking.parkingNotes || booking.parkingAddress || 'Not set' },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${item.done
                      ? 'bg-emerald-500/5 border-emerald-500/15'
                      : 'bg-white/[0.02] border-white/5 hover:border-purple-500/20'
                      }`}
                  >
                    <div className="shrink-0">{item.done ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5 text-white/15" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${item.done ? 'text-white/80' : 'text-white/40'}`}>{item.label}</p>
                      <p className={`text-xs truncate ${item.done ? 'text-emerald-400/70' : 'text-purple-300/60'}`}>
                        {item.detail}
                      </p>
                    </div>
                    {!item.done && (
                      <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-widest text-purple-300 bg-purple-600/10 px-2 py-0.5 rounded border border-purple-500/20 shrink-0">
                        Needed
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Google Maps Parking Setup & Directions Card ── */}
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">Venue Location & Parking Setup</h4>
                  </div>
                  {booking.venueName && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        [booking.parkingAddress || booking.venueName, booking.venueCity, booking.venueState].filter(Boolean).join(", ")
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/40 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors w-fit"
                    >
                      <Navigation className="w-3.5 h-3.5 text-cyan-300" /> Open Google Maps Directions
                    </a>
                  )}
                </div>

                {booking.parkingNotes ? (
                  <div className="bg-black/40 border border-white/10 p-3 rounded-lg text-xs text-white/80">
                    <span className="font-bold text-purple-400uppercase tracking-widest block mb-1 text-[10px]">Parking Instructions & Notes:</span>
                    <p className="whitespace-pre-wrap">{booking.parkingNotes}</p>
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">No custom parking notes added yet.</p>
                )}
              </div>

              {(() => {
                const missing = [
                  !!booking.date, !!booking.startTime, !!booking.venueName,
                  !!booking.indoorOutdoor, !!booking.soundSystem,
                  !!booking.stageAvailable, !!booking.loadInTime, !!booking.expectedAttendance,
                ].filter(i => !i).length;
                if (missing === 0) return (
                  <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-[var(--color-accent)]/30">
                    <PartyPopper className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-sm font-bold text-[var(--color-accent)]">All set! Your event details are complete.</p>
                  </div>
                );
                return (
                  <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-purple-600/5 border border-purple-500/15">
                    <Lightbulb className="w-4 h-4 text-purple-300 shrink-0" />
                    <p className="text-sm text-white/40">
                      {missing} item{missing !== 1 ? 's' : ''} still needed.{' '}
                      <button aria-label="Action button" onClick={handleEditStart} className=" text-[var(--color-accent)] hover:text-white font-bold underline transition-colors cursor-pointer">
                        Edit logistics
                      </button>{' '}
                      to fill them in, or contact us for help.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── Booking History Timeline ── */}
        {allBookings.length > 1 && (
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                <History className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Booking History</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-white/30 font-bold mt-0.5">{allBookings.length} total booking{allBookings.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-0 bottom-0 left-[19px] w-[2px] bg-white/5" />

              <div className="flex flex-col gap-4">
                {allBookings.map((b, i) => {
                  const isActive = b.id === booking.id;
                  const sc = b.status === 'confirmed'
                    ? { dot: 'bg-emerald-500', border: ' border-[var(--color-accent)]/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', label: 'Confirmed' }
                    : b.status === 'cancelled'
                      ? { dot: 'bg-rose-500', border: 'border-rose-500/20', bg: 'bg-rose-500/5', text: 'text-rose-400', label: 'Cancelled' }
                      : { dot: 'bg-purple-600', border: 'border-purple-500/20', bg: 'bg-purple-600/5', text: 'text-purple-300', label: 'Pending' };

                  return (
                    <div key={b.id} className="flex gap-4 relative">
                      {/* Timeline dot */}
                      <div className="shrink-0 mt-5 z-10">
                        <div className={`w-[10px] h-[10px] rounded-full ${sc.dot} ring-4 ring-[#050508]`} />
                      </div>

                      {/* Card */}
                      <button aria-label="Action button"
                        onClick={() => { setBooking(b); setEditDraft(b); }}
                        className={`flex-1 text-left px-5 py-4  border transition-colors cursor-pointer ${isActive
                          ? `${sc.bg} ${sc.border} border `
                          : 'bg-[var(--color-bg-surface)] border-white/5 hover:border-white/10'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold uppercase tracking-widest ${sc.text} px-2 py-0.5 ${sc.bg} ${sc.border} border rounded-full`}>
                              {sc.label}
                            </span>
                            <span className="text-xs text-white/30 font-mono">{b.id}</span>
                            {isActive && (
                              <span className="text-[var(--font-size-2xs)] font-bold uppercase tracking-widest  text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded border border-[var(--color-accent)]/20">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                        <h4 className={`text-sm font-bold tracking-tight mb-0.5 ${b.status === 'cancelled' ? 'text-white/30 line-through' : 'text-white'}`}>
                          {b.eventName}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.date}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {b.venueName}, {b.venueCity}</span>
                          {b.startTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.startTime}</span>}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
