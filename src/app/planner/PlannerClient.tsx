/* eslint-disable react-doctor/no-giant-component */
"use client";
import Link from "next/link";
import { useState, useEffect, useSyncExternalStore, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { useMember } from "@/context/MemberContext";

interface Booking {
  id: string; eventName: string; eventType: string; date: string;
  startTime: string; endTime: string; venueName: string;
  venueCity: string; venueState: string; indoorOutdoor: string;
  expectedAttendance: string; organization: string;
  status: "pending" | "confirmed" | "cancelled";
  soundSystem?: string; stageAvailable?: string; loadInTime?: string; notes?: string;
}

const typeLabels: Record<string, string> = {
  full_band: "Full Band Show", unplugged: "Unplugged Acoustic Set",
  private: "Private Event", custom: "Custom Booking",
};

export default function PlannerClient() {
  const { member, isLoggedIn, hydrated, login, signup, openModal, closeModal, isModalOpen } = useMember();
  const mounted = useSyncExternalStore(() => () => { }, () => true, () => false);

  const handleCloseModal = useCallback(() => {
    closeModal();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, [closeModal]);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [editField, setEditField] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'fan' | 'crew' | 'planner' | 'cruise'>('planner');

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isDevBypass = urlParams?.get('bypass') === 'true' || urlParams?.get('demo') === 'true';
  const forceLogin = urlParams?.get('login') === 'true';
  const hasAccess = !forceLogin && (isDevBypass || (isLoggedIn && member?.role === 'event_planner'));

  const hasAutoOpenedRef = useRef(false);

  useEffect(() => {
    if (hydrated && !hasAccess && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      openModal("login", "planner");
    }
  }, [hydrated, hasAccess, openModal]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr('');
    setLoginLoading(true);
    try {
      if (mode === 'signup') {
        const res = await signup(name, email, password, undefined, undefined);
        if (!res.success) {
          setLoginErr(res.error || 'Signup failed');
        } else if (res.confirmationRequired) {
          setLoginErr('CONFIRMATION_REQUIRED');
        }
      } else {
        const ok = await login(email, password);
        if (!ok) {
          setLoginErr('Invalid email or password');
        }
      }
    } catch (err: any) {
      setLoginErr(err.message || 'Authentication error');
    } finally {
      setLoginLoading(false);
    }
  };

  const isCancellingRef = useRef(false);

  const handleCancelBooking = async () => {
    if (isCancellingRef.current || !booking) return;
    isCancellingRef.current = true;
    setIsCancelling(true);
    if (!confirm('Cancel this booking?')) {
      isCancellingRef.current = false;
      setIsCancelling(false);
      return;
    }
    try {
      const res = await fetch('/api/booking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, status: 'cancelled' })
      });
      if (res.ok) {
        setBooking(prev => prev ? { ...prev, status: 'cancelled' } : prev);
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    } finally {
      isCancellingRef.current = false;
      setIsCancelling(false);
    }
  };

  const loadPlannerBookings = useCallback(async () => {
    const memberEmail = member?.email || (() => { try { const s = localStorage.getItem('7h_member'); return s ? JSON.parse(s).email : null; } catch { return null; } })();
    if (!memberEmail) return;
    try {
      const res = await fetch(`/api/booking?email=${encodeURIComponent(memberEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Booking[] = data.map((item: any) => ({
            id: item.bookingId || item.booking_id || '',
            eventName: item.eventType ? (typeLabels[item.eventType] || item.eventType) : '',
            eventType: item.eventType || '',
            date: item.eventDate || item.event_date || '',
            startTime: item.startTime || item.start_time || '',
            endTime: item.endTime || item.end_time || '',
            venueName: item.venueName || item.venue_name || '',
            venueCity: item.venueCity || item.venue_city || '',
            venueState: item.venueState || item.venue_state || '',
            indoorOutdoor: item.indoorOutdoor || item.indoor_outdoor || 'indoor',
            expectedAttendance: item.expectedAttendance || item.expected_attendance || '250',
            organization: item.organization || '',
            status: item.status || 'pending',
            soundSystem: item.soundSystem || item.sound_system || '',
            stageAvailable: item.stageAvailable || item.stage_available || '',
            loadInTime: item.loadInTime || item.load_in_time || '',
            notes: item.notes || '',
          }));
          setAllBookings(mapped);
          setBooking(mapped[0]);
          setNotes(mapped[0].notes || '');
        }
      }
    } catch { }
  }, [member?.email]);

  useEffect(() => {
    loadPlannerBookings();
  }, [loadPlannerBookings]);

  if (!mounted || !hydrated) return null;

  if (!hasAccess) {
    return (
      <div className="min-h-screen text-[var(--text-color)] pt-24 pb-16 relative">
        <div className="site-container max-w-4xl mx-auto px-4 space-y-12">
          {/* Hero Header */}
          <div className="relative  rounded-lg p-8 sm:p-12 text-center overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h1 className="text-3xl sm:text-5xl  font-bold  tracking-tight text-white">
                Planner <span className="text-[#c27aff]">Portal</span>
              </h1>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                Manage your event bookings, view contracts, coordinate load-in setup times, and communicate directly with 7th Heaven management.
              </p>
              <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={() => openModal("login", "planner")}
                  className="px-8 py-3.5  bg-[var(--color-accent)] hover:bg-purple-500 text-white  font-bold  text-xs uppercase tracking-[0.18em] transition-all duration-200 shadow-[0_0_30px_rgba(194,122,255,0.4)] hover:shadow-[0_0_40px_rgba(194,122,255,0.6)]  rounded-lg cursor-pointer"
                >
                  Sign In to Planner Portal
                </button>
                <button
                  type="button"
                  onClick={() => openModal("signup", "planner")}
                  className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs uppercase tracking-[0.18em] transition-colors  rounded-lg cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Submit Request", desc: "Fill out event details, venue info, and your preferred date." },
              { step: "2", title: "We Review", desc: "Our team checks availability and confirms logistics." },
              { step: "3", title: "You're Booked", desc: "Get confirmed and manage everything from this dashboard." },
            ].map((item) => (
              <div key={`step-anon-${item.step}`} className="p-6 text-center rounded-lg ">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm  font-bold  text-[#c27aff]">{item.step}</div>
                <h4 className="text-base font-bold mb-1 text-white">{item.title}</h4>
                <p className="text-xs  text-white  leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    if (typeof window !== 'undefined' && mounted && hydrated) {
      window.location.href = '/book';
    }
    return null;
  }

  const st = booking.status;
  const statusSteps = [
    { label: "Pending", active: st === "pending" || st === "confirmed" },
    { label: "Confirmed", active: st === "confirmed" },
    { label: "Completed", active: false },
  ];
  const checklist = [
    { label: "Event date confirmed", done: !!booking.date, val: booking.date },
    { label: "Show time set", done: !!(booking.startTime && booking.endTime), val: booking.startTime && booking.endTime ? `${booking.startTime} – ${booking.endTime}` : '' },
    { label: "Venue details", done: !!booking.venueName, val: booking.venueName },
    { label: "Indoor/Outdoor", done: !!booking.indoorOutdoor, val: booking.indoorOutdoor },
    { label: "Load-in time", done: !!booking.loadInTime, val: booking.loadInTime || '' },
    { label: "Attendance", done: !!booking.expectedAttendance, val: booking.expectedAttendance ? `~${booking.expectedAttendance}` : '' },
  ];
  const done = checklist.filter(i => i.done).length;
  const pct = Math.round((done / checklist.length) * 100);
  const pastBookings = allBookings.filter(b => b.id !== booking.id);
  const statusLabel = st === 'pending' ? '⏳ Pending Review' : st === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled';
  const statusColor = st === 'pending' ? 'text-purple-300 bg-purple-600/10 border-purple-500/20' : st === 'confirmed' ? 'text-emerald-400 bg-emerald-500/10  border-[var(--color-accent)]/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  const initials = member?.name ? member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'PL';

  return (
    <div className="min-h-screen    text-[var(--text-color)] pt-24 pb-16">
      <div className="site-container max-w-[1400px] mx-auto">
        <div className="flex gap-8">
          {/* LEFT SIDEBAR */}
          <div className="w-[220px] shrink-0 hidden lg:block">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sticky top-24 rounded-lg ">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-8">Booking Status</h3>
              <div className="relative pl-5">
                <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent)]/30 to-white/5" />
                <div className="flex flex-col gap-10">
                  {statusSteps.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-4 relative">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${step.active ? 'bg-purple-600 border-purple-400 shadow-[0_0_12px_rgba(255,10,61,0.5)]' : 'bg-white/10 border-white/20'}`}>
                        {step.active && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm font-semibold ${step.active ? 'text-white' : 'text-white/40'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-white/10">
                <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Booking ID</p>
                <p className="text-sm font-mono  text-[var(--color-accent)]">{booking.id}</p>
              </div>
              <div className="mt-6">
                <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Planner</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[var(--font-size-3xs)] font-bold text-white">{initials}</div>
                  <span className="text-xs text-white/80">{member?.name || 'Planner'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div className="flex-1 min-w-0">
            {/* Hero Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)]  rounded-lg p-8 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px]" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor}`}>{statusLabel}</span>
                    <span className="text-xs text-white/40 font-mono">{booking.id}</span>
                  </div>
                  <Link href="/book" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-lg">+ New Booking</Link>
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl  font-bold  tracking-tight text-white">{booking.eventName}</h1>
                </div>
                <p className=" text-[var(--color-accent)] text-sm font-semibold mb-1">{typeLabels[booking.eventType] || booking.eventType}</p>
                <p className="text-white/40 text-xs mb-6">Booked by <span className="text-white/80 font-semibold">{member?.name}</span></p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Date", value: booking.date },
                    { label: "Time", value: `${booking.startTime} – ${booking.endTime}` },
                    { label: "Venue", value: booking.venueName },
                    { label: "City", value: `${booking.venueCity}, ${booking.venueState}` },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3-Column Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Notes */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-lg ">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><span className="text-base">📝</span><h3 className="text-sm font-bold text-white">Event Notes</h3></div>
                  {notesSaved && <span className="text-xs font-bold text-[var(--color-accent)] bg-emerald-500/10 px-2 py-0.5 rounded-full border  border-[var(--color-accent)]/30">✓ Saved</span>}
                </div>
                <div className="input-glow-border rounded-xl">
                  <textarea aria-label="Text input" value={notes} onChange={e => { setNotes(e.target.value); setNotesSaved(false); }} placeholder="Parking info, green room needs, AV contact..." rows={5}
                    className="w-full bg-[#e1e6ff29]   border border-white/15 px-3 py-2.5 text-xs text-white placeholder:text-white/30 outline-none focus:outline-none resize-none transition-colors rounded-lg" />
                </div>
                <button aria-label="Action button" onClick={async () => { setNotesSaving(true); try { await fetch('/api/booking', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.id, notes }) }); setNotesSaved(true); setTimeout(() => setNotesSaved(false), 3000); } catch { } setNotesSaving(false); }} disabled={notesSaving}
                  className="mt-3 w-full py-2 bg-purple-600/10 hover:bg-purple-600 border border-purple-600/20 hover:border-transparent  text-[var(--color-accent)] hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                  {notesSaving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>

              {/* Checklist — editable */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-lg ">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><span className="text-base">✅</span><h3 className="text-sm font-bold text-white">Readiness</h3></div>
                  <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-400' : 'text-white/50'}`}>{done}/{checklist.length}</span>
                </div>
                <div className="w-full h-2 bg-[#e1e6ff29]   rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full transition-colors ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-purple-600' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex flex-col gap-2">
                  {checklist.map((item, i) => {
                    const fieldMap: Record<string, string> = {
                      'Event date confirmed': 'date', 'Show time set': 'startTime', 'Venue details': 'venueName',
                      'Indoor/Outdoor': 'indoorOutdoor', 'Sound system': 'soundSystem',
                      'Stage availability': 'stageAvailable', 'Load-in time': 'loadInTime', 'Attendance': 'expectedAttendance',
                    };
                    const fieldKey = fieldMap[item.label] || '';
                    const isEditing = editField === i;
                    return (
                      <div key={item.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${item.done ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-[#e1e6ff29]   border-white/10'}`}>
                        <span className="text-xs shrink-0">{item.done ? '✅' : '⬜'}</span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-semibold ${item.done ? 'text-white/80' : 'text-white/40'}`}>{item.label}</span>
                          {isEditing ? (
                            <div className="flex gap-1.5 mt-1">
                              <input aria-label="Input field"
                                type="text"
                                defaultValue={item.val || ''}
                                autoFocus
                                onKeyDown={e => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value; if (v && booking) { setBooking({ ...booking, [fieldKey]: v } as Booking); setEditField(null); } } }}
                                className="flex-1 bg-white/10 border border-white/20 px-2 py-1 rounded text-sm text-white focus:border-purple-500 outline-none"
                              />
                              <button aria-label="Previous" type="button" onClick={(e) => { const input = (e.currentTarget.previousElementSibling as HTMLInputElement); if (input?.value && booking) { setBooking({ ...booking, [fieldKey]: input.value } as Booking); setEditField(null); } }} className="text-[var(--font-size-2xs)] text-[var(--color-accent)] font-bold uppercase tracking-wider cursor-pointer px-1.5">Save</button>
                              <button aria-label="Action button" type="button" onClick={() => setEditField(null)} className="text-[var(--font-size-2xs)] text-white/40 font-bold uppercase tracking-wider cursor-pointer px-1">✕</button>
                            </div>
                          ) : (
                            item.done && item.val && <p className="text-xs text-[var(--color-accent)]/60 truncate">{item.val}</p>
                          )}
                        </div>
                        {!isEditing && (
                          item.done ? (
                            <button aria-label="Action button" type="button" onClick={() => setEditField(i)} className="text-[var(--font-size-2xs)] font-bold text-white/40 hover: text-[var(--color-accent)] uppercase tracking-widest cursor-pointer transition-colors shrink-0">Edit</button>
                          ) : (
                            <button aria-label="Action button" type="button" onClick={() => setEditField(i)} className="text-[var(--font-size-2xs)] font-bold text-purple-300/50 bg-purple-600/10 px-1.5 py-0.5 rounded border border-purple-500/15 shrink-0 hover:bg-purple-600/20 cursor-pointer transition-colors">NEEDED</button>
                          )
                        )}
                      </div>
                    );
                  })}
                  {done < checklist.length && (
                    <Link href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}`}
                      className="mt-2 text-center py-2 bg-purple-600/5 hover:bg-purple-600/10 border border-purple-500/15 text-purple-300/70 hover:text-purple-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors">
                      Fill Missing Details →
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-lg ">
                <div className="flex items-center gap-2 mb-4"><span className="text-base">⚡</span><h3 className="text-sm font-bold text-white">Quick Actions</h3></div>
                <div className="flex flex-col gap-3">
                  <Link href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}&indoorOutdoor=${encodeURIComponent(booking.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(booking.expectedAttendance)}`}
                    className="w-full py-3 px-4 flex items-center gap-3 border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-purple-600/10 border-purple-600/20  text-[var(--color-accent)] hover:bg-purple-600 hover:text-white rounded-lg">
                    <span>🔄</span> Rebook This Event
                  </Link>
                  <Link href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}&indoorOutdoor=${encodeURIComponent(booking.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(booking.expectedAttendance)}`}
                    className="w-full py-3 px-4 flex items-center gap-3 border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-[#e1e6ff29]   border-white/10 text-white/80 hover:bg-white/10 hover:text-white rounded-lg">
                    <span>✏️</span> Edit Logistics
                  </Link>
                  <a href={`mailto:7thheaven@gmail.com?subject=${encodeURIComponent(`[Booking ${booking.id}] Question about ${booking.eventName}`)}&body=${encodeURIComponent(`Hi 7th Heaven,\n\nRe: ${booking.eventName}\nBooking ID: ${booking.id}\nDate: ${booking.date}\nVenue: ${booking.venueName}\n\nMy question:\n\n`)}`}
                    className="w-full py-3 px-4 flex items-center gap-3 border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-[#e1e6ff29]   border-white/10 text-white/80 hover:bg-white/10 hover:text-white rounded-lg">
                    <span>✉️</span> Contact 7th Heaven
                  </a>
                  <button aria-label="Cancel request" onClick={handleCancelBooking} disabled={isCancelling}
                    className="w-full py-3 px-4 flex items-center gap-3 border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-rose-500/5 border-rose-500/10 text-rose-400/60 hover:bg-rose-500 hover:text-white disabled:opacity-50 rounded-lg">
                    <span>✕</span> {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                </div>
              </div>
            </div>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-base">📜</span>
                  <h3 className="text-sm font-bold text-white">Past Events</h3>
                  <span className="text-xs font-bold text-white/50 bg-[#e1e6ff29]   px-2 py-0.5 rounded">{pastBookings.length} events</span>
                </div>
                <div className="flex flex-col gap-3">
                  {pastBookings.map((pb, i) => {
                    const sc = pb.status === 'cancelled'
                      ? { dot: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/15' }
                      : pb.status === 'confirmed'
                        ? { dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/15' }
                        : { dot: 'bg-purple-500', text: ' text-[var(--color-accent)]', bg: 'bg-purple-500/5', border: 'border-purple-500/15' };
                    return (
                      <div key={pb.id || pb.eventName || pb.date} className="bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-purple-500/30 p-4 flex items-center gap-4 transition-colors group rounded-lg ">
                        <div className={`w-2.5 h-2.5 rounded-full ${sc.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{pb.eventName}</h4>
                          <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
                            <span>📅 {pb.date}</span><span>📍 {pb.venueName}</span><span className="font-mono">{pb.id}</span>
                          </div>
                        </div>
                        <span className={`text-[var(--font-size-2xs)] font-bold uppercase tracking-widest ${sc.text} ${sc.bg} px-2 py-0.5 rounded border ${sc.border}`}>{pb.status}</span>
                        <Link href={`/book?from=rebook&eventType=${encodeURIComponent(pb.eventType)}&venueName=${encodeURIComponent(pb.venueName)}&venueCity=${encodeURIComponent(pb.venueCity)}&venueState=${encodeURIComponent(pb.venueState)}&indoorOutdoor=${encodeURIComponent(pb.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(pb.expectedAttendance)}&organization=${encodeURIComponent(pb.organization)}`}
                          className="px-4 py-2 bg-purple-600/10 hover:bg-purple-600 border border-purple-600/20 hover:border-transparent  text-[var(--color-accent)] hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0">
                          Rebook →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
