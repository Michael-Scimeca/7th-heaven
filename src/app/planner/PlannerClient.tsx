"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  const { member, isLoggedIn, hydrated, login, signup } = useMember();
  const [mounted, setMounted] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [editField, setEditField] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const memberEmail = member?.email || (() => { try { const s = localStorage.getItem('7h_member'); return s ? JSON.parse(s).email : null; } catch { return null; } })();
    if (!memberEmail) return;
    (async () => {
      try {
        const res = await fetch(`/api/booking?email=${encodeURIComponent(memberEmail)}`);
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
            indoorOutdoor: item.indoorOutdoor || item.indoor_outdoor || '',
            expectedAttendance: item.expectedAttendance || item.expected_attendance || '',
            organization: item.organization || '',
            status: item.status || 'pending',
            soundSystem: item.soundSystem || item.sound_system || '',
            stageAvailable: item.stageAvailable || item.stage_available || '',
            loadInTime: item.loadInTime || item.load_in_time || '',
            notes: item.details || item.notes || '',
          }));
          setAllBookings(mapped);
          const active = mapped.find(b => b.status !== 'cancelled') || mapped[0];
          setBooking(active);
          setNotes(active.notes || '');
        }
      } catch (e) { console.error(e); }
    })();
  }, [isLoggedIn, member?.email]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginErr(''); setLoginLoading(true);
    if (mode === 'signup') {
      if (!name.trim()) { setLoginErr('Name is required.'); setLoginLoading(false); return; }
      const result = await signup(name.trim(), email, password);
      if (!result.success) {
        setLoginErr(result.error || 'Signup failed. Try a different email or stronger password.');
      } else if (result.confirmationRequired) {
        setLoginErr('CONFIRMATION_REQUIRED');
      } else {
        // Success (auto-login or redirect)
        window.location.reload();
      }
      setLoginLoading(false);
      return;
    }
    const ok = await login(email, password);
    if (!ok) setLoginErr('Invalid email or password.');
    setLoginLoading(false);
  };

  if (!mounted || !hydrated) return null;
  const isDevBypass = typeof window !== "undefined" && (process.env.NODE_ENV === 'development' && (localStorage.getItem('7h_dev_bypass') === 'true' || new URLSearchParams(window.location.search).get('bypass') === 'true'));
  const forceLogin = typeof window !== "undefined" && new URLSearchParams(window.location.search).get('login') === 'true';
  // If ?login=true is in the URL, always show the login form — never auto-redirect to dashboard
  const hasAccess = !forceLogin && (isDevBypass || (isLoggedIn && member?.role === 'event_planner'));

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] text-black pt-24 pb-16">
        <div className="site-container max-w-2xl mx-auto">

          {/* Sign In / Create Account Card */}
          <div className="bg-white border border-black/15 overflow-hidden mb-10">
            <div className="h-1 bg-[var(--color-accent)]" />
            <div className="p-8 md:p-10">
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Planner <span className=" text-[var(--color-accent)]">Portal</span></h2>
                <p className="text-sm text-black/60 mt-1.5 font-medium">Sign in to manage your event bookings, contracts, and show logistics</p>
              </div>

              {/* Prominent Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 border border-black/15 mb-6 shadow-inner max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLoginErr(''); }}
                  className={`py-3 text-xs sm:text-sm font-black uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${mode === 'login'
                    ? "bg-[var(--color-accent)] text-white shadow-md scale-[1.02]"
                    : "text-black/60 hover:text-black hover:bg-gray-100"
                    }`}
                >
                  🔑 LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setLoginErr(''); }}
                  className={`py-3 text-xs sm:text-sm font-black uppercase tracking-[0.15em] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${mode === 'signup'
                    ? "bg-[var(--color-accent)] text-white shadow-md scale-[1.02]"
                    : "text-black/60 hover:text-black hover:bg-gray-100"
                    }`}
                >
                  ✨ CREATE ACCOUNT
                </button>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-sm mx-auto">
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs uppercase tracking-[0.15em] text-black/70 mb-1.5 block font-bold">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sarah Mitchell"
                      className="w-full px-4 py-3 bg-white border border-black/15 text-base text-black placeholder:text-black/40 outline-none focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-black/70 mb-1.5 block font-bold">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="planner@company.com"
                    className="w-full px-4 py-3 bg-white border border-black/15 text-base text-black placeholder:text-black/40 outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-black/70 mb-1.5 block font-bold">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border border-black/15 text-base text-black placeholder:text-black/40 outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                {loginErr === 'CONFIRMATION_REQUIRED' ? (
                  <div className="bg-emerald-500/10 border  border-[var(--color-accent)]/30 p-4 text-center">
                    <span className="text-xl block mb-2">📧</span>
                    <p className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-widest mb-1">Check Your Email</p>
                    <p className="text-xs text-black/50 leading-relaxed">We&apos;ve sent a verification link to <strong className="text-black">{email}</strong>. Please confirm to access your dashboard.</p>
                  </div>
                ) : (
                  <>
                    {loginErr && <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 rounded-lg border border-rose-400/20 text-center font-bold">{loginErr}</p>}
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-base uppercase tracking-[0.18em] transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_25px_rgba(255,10,61,0.4)]"
                    >
                      {loginLoading ? 'Authenticating...' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Book Now Hero */}
          <div className="relative bg-white border border-black/10 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-600/10 border border-purple-600/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-3">Book <span className=" text-[var(--color-accent)]">7th Heaven</span></h2>
              <p className="text-black/50 text-sm max-w-md mx-auto mb-8">Ready to bring the show to your next event? Fill out a quick booking form and we&apos;ll get back to you within 24 hours.</p>
              <Link href="/book" className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--color-accent)] hover:bg-[#851de7] text-white font-bold text-sm uppercase tracking-[0.15em] transition-all shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Book Now
              </Link>
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { step: "1", title: "Submit Request", desc: "Fill out event details, venue info, and your preferred date." },
              { step: "2", title: "We Review", desc: "Our team checks availability and confirms logistics." },
              { step: "3", title: "You're Booked", desc: "Get confirmed and manage everything from this dashboard." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-black/10 p-5 text-center">
                <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-xs font-black  text-[var(--color-accent)]">{item.step}</div>
                <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                <p className="text-xs text-black/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  if (!booking) {
    const initials = member?.name ? member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '📋';
    return (
      <div className="min-h-screen bg-[#f0f2f5] text-black pt-24 pb-16">
        <div className="site-container max-w-2xl mx-auto">
          {/* Planner Identity */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center text-lg font-black  text-[var(--color-accent)]">{initials}</div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{member?.name || 'Event Planner'}</h1>
              <p className="text-xs text-black/40">{member?.email || 'Planner Portal'}</p>
            </div>
          </div>

          {/* Book Now Hero */}
          <div className="relative bg-white border border-black/10 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-600/10 border border-purple-600/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-3">Book <span className=" text-[var(--color-accent)]">7th Heaven</span></h2>
              <p className="text-black/50 text-sm max-w-md mx-auto mb-8">Ready to bring the show to your next event? Fill out a quick booking form and we'll get back to you within 24 hours.</p>
              <Link href="/book" className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--color-accent)] hover:bg-[#851de7] text-white font-bold text-sm uppercase tracking-[0.15em] transition-all shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Book Now
              </Link>
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { step: "1", title: "Submit Request", desc: "Fill out event details, venue info, and your preferred date." },
              { step: "2", title: "We Review", desc: "Our team checks availability and confirms logistics." },
              { step: "3", title: "You're Booked", desc: "Get confirmed and manage everything from this dashboard." },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-black/10 p-5 text-center">
                <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-xs font-black  text-[var(--color-accent)]">{item.step}</div>
                <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                <p className="text-xs text-black/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-[#f0f2f5] text-black pt-24 pb-16">
      <div className="site-container max-w-[1400px] mx-auto">
        <div className="flex gap-8">
          {/* LEFT SIDEBAR */}
          <div className="w-[220px] shrink-0 hidden lg:block">
            <div className="bg-white border border-black/10 p-6 sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black/50 mb-8">Booking Status</h3>
              <div className="relative pl-5">
                <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-accent)]/30 to-white/5" />
                <div className="flex flex-col gap-10">
                  {statusSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 relative">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${step.active ? 'bg-purple-600 border-purple-400 shadow-[0_0_12px_rgba(255,10,61,0.5)]' : 'bg-white border-black/10'}`}>
                        {step.active && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm font-semibold ${step.active ? 'text-black' : 'text-black/40'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-black/10">
                <p className="text-xs uppercase tracking-widest text-black/30 font-bold mb-2">Booking ID</p>
                <p className="text-sm font-mono  text-[var(--color-accent)]">{booking.id}</p>
              </div>
              <div className="mt-6">
                <p className="text-xs uppercase tracking-widest text-black/30 font-bold mb-2">Planner</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[var(--font-size-3xs)] font-bold">{initials}</div>
                  <span className="text-xs text-black/70">{member?.name || 'Planner'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div className="flex-1 min-w-0">
            {/* Hero Card */}
            <div className="bg-white border border-black/10 rounded-3xl p-8 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px]" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor}`}>{statusLabel}</span>
                    <span className="text-xs text-black/30 font-mono">{booking.id}</span>
                  </div>
                  <Link href="/book" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-all">+ New Booking</Link>
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black tracking-tight">{booking.eventName}</h1>
                </div>
                <p className=" text-[var(--color-accent)] text-sm font-semibold mb-1">{typeLabels[booking.eventType] || booking.eventType}</p>
                <p className="text-black/40 text-xs mb-6">Booked by <span className="text-black/60 font-semibold">{member?.name}</span></p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Date", value: booking.date },
                    { label: "Time", value: `${booking.startTime} – ${booking.endTime}` },
                    { label: "Venue", value: booking.venueName },
                    { label: "City", value: `${booking.venueCity}, ${booking.venueState}` },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-xs uppercase tracking-widest text-black/40 font-bold mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-black">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3-Column Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Notes */}
              <div className="bg-white border border-black/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><span className="text-base">📝</span><h3 className="text-sm font-bold">Event Notes</h3></div>
                  {notesSaved && <span className="text-xs font-bold text-[var(--color-accent)] bg-emerald-500/10 px-2 py-0.5 rounded-full border  border-[var(--color-accent)]/30">✓ Saved</span>}
                </div>
                <textarea value={notes} onChange={e => { setNotes(e.target.value); setNotesSaved(false); }} placeholder="Parking info, green room needs, AV contact..." rows={5}
                  className="w-full bg-gray-50 border border-black/10 px-3 py-2.5 text-xs text-black placeholder:text-black/30 outline-none focus:border-purple-500/50 resize-none transition-colors" />
                <button onClick={async () => { setNotesSaving(true); try { await fetch('/api/booking', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.id, notes }) }); setNotesSaved(true); setTimeout(() => setNotesSaved(false), 3000); } catch { } setNotesSaving(false); }} disabled={notesSaving}
                  className="mt-3 w-full py-2 bg-purple-600/10 hover:bg-purple-600 border border-purple-600/20 hover:border-transparent  text-[var(--color-accent)] hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-50">
                  {notesSaving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>

              {/* Checklist — editable */}
              <div className="bg-white border border-black/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><span className="text-base">✅</span><h3 className="text-sm font-bold">Readiness</h3></div>
                  <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-400' : 'text-black/50'}`}>{done}/{checklist.length}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-purple-600' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
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
                      <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${item.done ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-gray-50 border-black/10'}`}>
                        <span className="text-xs shrink-0">{item.done ? '✅' : '⬜'}</span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-semibold ${item.done ? 'text-black/70' : 'text-black/40'}`}>{item.label}</span>
                          {isEditing ? (
                            <div className="flex gap-1.5 mt-1">
                              <input
                                type="text"
                                defaultValue={item.val || ''}
                                autoFocus
                                onKeyDown={e => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value; if (v && booking) { setBooking({ ...booking, [fieldKey]: v } as Booking); setEditField(null); } } }}
                                className="flex-1 bg-[#f0f2f5] border border-black/10 px-2 py-1 rounded text-sm text-black focus:border-purple-500 outline-none"
                              />
                              <button type="button" onClick={(e) => { const input = (e.currentTarget.previousElementSibling as HTMLInputElement); if (input?.value && booking) { setBooking({ ...booking, [fieldKey]: input.value } as Booking); setEditField(null); } }} className="text-[var(--font-size-2xs)] text-[var(--color-accent)] font-bold uppercase tracking-wider cursor-pointer px-1.5">Save</button>
                              <button type="button" onClick={() => setEditField(null)} className="text-[var(--font-size-2xs)] text-black/40 font-bold uppercase tracking-wider cursor-pointer px-1">✕</button>
                            </div>
                          ) : (
                            item.done && item.val && <p className="text-xs text-[var(--color-accent)]/60 truncate">{item.val}</p>
                          )}
                        </div>
                        {!isEditing && (
                          item.done ? (
                            <button type="button" onClick={() => setEditField(i)} className="text-[var(--font-size-2xs)] font-bold text-black/30 hover: text-[var(--color-accent)] uppercase tracking-widest cursor-pointer transition-colors shrink-0">Edit</button>
                          ) : (
                            <button type="button" onClick={() => setEditField(i)} className="text-[var(--font-size-2xs)] font-bold text-purple-300/50 bg-purple-600/10 px-1.5 py-0.5 rounded border border-purple-500/15 shrink-0 hover:bg-purple-600/20 cursor-pointer transition-all">NEEDED</button>
                          )
                        )}
                      </div>
                    );
                  })}
                  {done < checklist.length && (
                    <Link href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}`}
                      className="mt-2 text-center py-2 bg-purple-600/5 hover:bg-purple-600/10 border border-purple-500/15 text-purple-300/70 hover:text-purple-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-all">
                      Fill Missing Details →
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-black/10 p-6">
                <div className="flex items-center gap-2 mb-4"><span className="text-base">⚡</span><h3 className="text-sm font-bold">Quick Actions</h3></div>
                <div className="flex flex-col gap-3">
                  <Link href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}&indoorOutdoor=${encodeURIComponent(booking.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(booking.expectedAttendance)}`}
                    className="w-full py-3 px-4 flex items-center gap-3 border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-purple-600/10 border-purple-600/20  text-[var(--color-accent)] hover:bg-purple-600 hover:text-white">
                    <span>🔄</span> Rebook This Event
                  </Link>
                  <Link href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}&startTime=${encodeURIComponent(booking.startTime)}&endTime=${encodeURIComponent(booking.endTime)}&indoorOutdoor=${encodeURIComponent(booking.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(booking.expectedAttendance)}`}
                    className="w-full py-3 px-4 flex items-center gap-3 border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-gray-50 border-black/10 text-black/70 hover:bg-gray-100 hover:text-black">
                    <span>✏️</span> Edit Logistics
                  </Link>
                  <a href={`mailto:7thheaven@gmail.com?subject=${encodeURIComponent(`[Booking ${booking.id}] Question about ${booking.eventName}`)}&body=${encodeURIComponent(`Hi 7th Heaven,\n\nRe: ${booking.eventName}\nBooking ID: ${booking.id}\nDate: ${booking.date}\nVenue: ${booking.venueName}\n\nMy question:\n\n`)}`}
                    className="w-full py-3 px-4 flex items-center gap-3 border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-gray-50 border-black/10 text-black/70 hover:bg-gray-100 hover:text-black">
                    <span>✉️</span> Contact 7th Heaven
                  </a>
                  <button onClick={() => { if (confirm('Cancel this booking?')) { fetch('/api/booking', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.id, status: 'cancelled' }) }).then(() => { setBooking(prev => prev ? { ...prev, status: 'cancelled' } : prev); }); } }}
                    className="w-full py-3 px-4 flex items-center gap-3 border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-rose-500/5 border-rose-500/10 text-rose-400/60 hover:bg-rose-500 hover:text-white">
                    <span>✕</span> Cancel Request
                  </button>
                </div>
              </div>
            </div>

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-base">📜</span>
                  <h3 className="text-sm font-bold">Past Events</h3>
                  <span className="text-xs font-bold text-black/40 bg-white/5 px-2 py-0.5 rounded">{pastBookings.length} events</span>
                </div>
                <div className="flex flex-col gap-3">
                  {pastBookings.map((pb, i) => {
                    const sc = pb.status === 'cancelled'
                      ? { dot: 'bg-rose-500', text: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/15' }
                      : pb.status === 'confirmed'
                        ? { dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/15' }
                        : { dot: 'bg-purple-500', text: ' text-[var(--color-accent)]', bg: 'bg-purple-500/5', border: 'border-purple-500/15' };
                    return (
                      <div key={i} className="bg-white border border-black/10 hover:border-black/10 p-4 flex items-center gap-4 transition-all group">
                        <div className={`w-2.5 h-2.5 rounded-full ${sc.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-black truncate">{pb.eventName}</h4>
                          <div className="flex items-center gap-3 text-xs text-black/40 mt-0.5">
                            <span>📅 {pb.date}</span><span>📍 {pb.venueName}</span><span className="font-mono">{pb.id}</span>
                          </div>
                        </div>
                        <span className={`text-[var(--font-size-2xs)] font-bold uppercase tracking-widest ${sc.text} ${sc.bg} px-2 py-0.5 rounded border ${sc.border}`}>{pb.status}</span>
                        <Link href={`/book?from=rebook&eventType=${encodeURIComponent(pb.eventType)}&venueName=${encodeURIComponent(pb.venueName)}&venueCity=${encodeURIComponent(pb.venueCity)}&venueState=${encodeURIComponent(pb.venueState)}&indoorOutdoor=${encodeURIComponent(pb.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(pb.expectedAttendance)}&organization=${encodeURIComponent(pb.organization)}`}
                          className="px-4 py-2 bg-purple-600/10 hover:bg-purple-600 border border-purple-600/20 hover:border-transparent  text-[var(--color-accent)] hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shrink-0">
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
