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
  const [mode, setMode] = useState<'login'|'signup'>('login');

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
      const ok = await signup(name.trim(), email, password);
      if (!ok) setLoginErr('Signup failed. Try a different email or stronger password (6+ chars).');
      setLoginLoading(false);
      return;
    }
    const ok = await login(email, password);
    if (!ok) setLoginErr('Invalid email or password.');
    setLoginLoading(false);
  };

  if (!mounted || !hydrated) return null;
  const isDevBypass = typeof window !== "undefined" && process.env.NODE_ENV === 'development' && localStorage.getItem('7h_dev_bypass') === 'true';
  const forceLogin = typeof window !== "undefined" && new URLSearchParams(window.location.search).get('login') === 'true';
  const hasAccess = (!forceLogin && isDevBypass) || (isLoggedIn && member?.role === 'event_planner');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#050508] text-white pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">

          {/* Sign In / Create Account */}
          <div className="bg-[#0c0c18] border border-white/10 rounded-2xl overflow-hidden mb-10">
            <div className="h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500" />
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-black">Planner <span className="text-purple-400">Portal</span></h2>
                <p className="text-[0.7rem] text-white/30 mt-1">Sign in to manage your bookings, or book a show below</p>
              </div>
              <form onSubmit={handleLogin} className="flex flex-col gap-3 max-w-sm mx-auto">
                {mode === 'signup' && <div><label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block font-bold">Full Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sarah Mitchell" className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/50" required /></div>}
                <div><label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block font-bold">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="planner@company.com" className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/50" required /></div>
                <div><label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-1 block font-bold">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/50" required /></div>
                {loginErr && <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 rounded-lg border border-rose-400/20">{loginErr}</p>}
                <button type="submit" disabled={loginLoading} className="w-full py-3 bg-purple-600 text-white font-bold text-sm uppercase tracking-[0.15em] rounded-lg hover:bg-purple-500 disabled:opacity-50 cursor-pointer">{loginLoading ? 'Authenticating...' : mode === 'signup' ? 'Create Account' : 'Sign In'}</button>
                <button type="button" onClick={()=>{setMode(m=>m==='login'?'signup':'login');setLoginErr('');}} className="text-[0.65rem] text-purple-400/60 hover:text-purple-400 uppercase tracking-[0.15em] font-bold cursor-pointer text-center">{mode==='login'?'Need an account? Create one':'Already have one? Sign in'}</button>
              </form>
            </div>
          </div>

          {/* Book Now Hero */}
          <div className="relative bg-gradient-to-br from-[#12101f] to-[#0a0a12] border border-white/5 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-3">Book <span className="text-purple-400">7th Heaven</span></h2>
              <p className="text-white/40 text-sm max-w-md mx-auto mb-8">Ready to bring the show to your next event? Fill out a quick booking form and we&apos;ll get back to you within 24 hours.</p>
              <Link href="/book" className="inline-flex items-center gap-2 px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm uppercase tracking-[0.15em] rounded-2xl transition-all shadow-[0_0_40px_rgba(147,51,234,0.3)] hover:shadow-[0_0_60px_rgba(147,51,234,0.5)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
              <div key={i} className="bg-[#0a0a12] border border-white/5 rounded-2xl p-5 text-center">
                <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-xs font-black text-purple-400">{item.step}</div>
                <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                <p className="text-[0.65rem] text-white/30 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  if (!booking) {
    const initials = member?.name ? member.name.split(' ').map((n:string)=>n[0]).join('').substring(0,2).toUpperCase() : '📋';
    return (
      <div className="min-h-screen bg-[#050508] text-white pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          {/* Planner Identity */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center text-lg font-black text-purple-400">{initials}</div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{member?.name || 'Event Planner'}</h1>
              <p className="text-xs text-white/30">{member?.email || 'Planner Portal'}</p>
            </div>
          </div>

          {/* Book Now Hero */}
          <div className="relative bg-gradient-to-br from-[#12101f] to-[#0a0a12] border border-white/5 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-3">Book <span className="text-purple-400">7th Heaven</span></h2>
              <p className="text-white/40 text-sm max-w-md mx-auto mb-8">Ready to bring the show to your next event? Fill out a quick booking form and we'll get back to you within 24 hours.</p>
              <Link href="/book" className="inline-flex items-center gap-2 px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm uppercase tracking-[0.15em] rounded-2xl transition-all shadow-[0_0_40px_rgba(147,51,234,0.3)] hover:shadow-[0_0_60px_rgba(147,51,234,0.5)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
              <div key={i} className="bg-[#0a0a12] border border-white/5 rounded-2xl p-5 text-center">
                <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-xs font-black text-purple-400">{item.step}</div>
                <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                <p className="text-[0.65rem] text-white/30 leading-relaxed">{item.desc}</p>
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
  const statusColor = st === 'pending' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : st === 'confirmed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  const initials = member?.name ? member.name.split(' ').map((n:string)=>n[0]).join('').substring(0,2).toUpperCase() : 'PL';

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex gap-8">
          {/* LEFT SIDEBAR */}
          <div className="w-[220px] shrink-0 hidden lg:block">
            <div className="bg-[#0a0a12] border border-white/5 rounded-2xl p-6 sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-8">Booking Status</h3>
              <div className="relative pl-5">
                <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-purple-500 via-purple-500/30 to-white/5" />
                <div className="flex flex-col gap-10">
                  {statusSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 relative">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${step.active ? 'bg-purple-600 border-purple-400 shadow-[0_0_12px_rgba(147,51,234,0.5)]' : 'bg-[#0a0a12] border-white/10'}`}>
                        {step.active && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm font-semibold ${step.active ? 'text-white' : 'text-white/25'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-white/5">
                <p className="text-[0.6rem] uppercase tracking-widest text-white/20 font-bold mb-2">Booking ID</p>
                <p className="text-sm font-mono text-purple-400">{booking.id}</p>
              </div>
              <div className="mt-6">
                <p className="text-[0.6rem] uppercase tracking-widest text-white/20 font-bold mb-2">Planner</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold">{initials}</div>
                  <span className="text-xs text-white/60">{member?.name || 'Planner'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div className="flex-1 min-w-0">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-[#12101f] to-[#0a0a12] border border-white/5 rounded-3xl p-8 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px]" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`text-[0.6rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor}`}>{statusLabel}</span>
                    <span className="text-[0.6rem] text-white/20 font-mono">{booking.id}</span>
                  </div>
                  <Link href="/book" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all">+ New Booking</Link>
                </div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black tracking-tight">{booking.eventName}</h1>
                </div>
                <p className="text-purple-400 text-sm font-semibold mb-1">{typeLabels[booking.eventType] || booking.eventType}</p>
                <p className="text-white/25 text-xs mb-6">Booked by <span className="text-white/50 font-semibold">{member?.name}</span></p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Date", value: booking.date },
                    { label: "Time", value: `${booking.startTime} – ${booking.endTime}` },
                    { label: "Venue", value: booking.venueName },
                    { label: "City", value: `${booking.venueCity}, ${booking.venueState}` },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-[0.55rem] uppercase tracking-widest text-white/25 font-bold mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3-Column Tools */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Notes */}
              <div className="bg-[#0a0a12] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><span className="text-base">📝</span><h3 className="text-sm font-bold">Event Notes</h3></div>
                  {notesSaved && <span className="text-[0.55rem] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">✓ Saved</span>}
                </div>
                <textarea value={notes} onChange={e=>{setNotes(e.target.value);setNotesSaved(false);}} placeholder="Parking info, green room needs, AV contact..." rows={5}
                  className="w-full bg-white/[0.03] border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white placeholder:text-white/15 outline-none focus:border-purple-500/50 resize-none transition-colors" />
                <button onClick={async()=>{setNotesSaving(true);try{await fetch('/api/booking',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({bookingId:booking.id,notes})});setNotesSaved(true);setTimeout(()=>setNotesSaved(false),3000);}catch{}setNotesSaving(false);}} disabled={notesSaving}
                  className="mt-3 w-full py-2 bg-purple-600/10 hover:bg-purple-600 border border-purple-600/20 hover:border-transparent text-purple-400 hover:text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-50">
                  {notesSaving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>

              {/* Checklist — editable */}
              <div className="bg-[#0a0a12] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><span className="text-base">✅</span><h3 className="text-sm font-bold">Readiness</h3></div>
                  <span className={`text-[0.6rem] font-bold ${pct===100?'text-emerald-400':'text-white/40'}`}>{done}/{checklist.length}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full transition-all ${pct===100?'bg-emerald-500':pct>=50?'bg-amber-500':'bg-rose-500'}`} style={{width:`${pct}%`}} />
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
                    <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${item.done?'bg-emerald-500/5 border-emerald-500/10':'bg-white/[0.01] border-white/5'}`}>
                      <span className="text-xs shrink-0">{item.done ? '✅' : '⬜'}</span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[0.65rem] font-semibold ${item.done?'text-white/60':'text-white/30'}`}>{item.label}</span>
                        {isEditing ? (
                          <div className="flex gap-1.5 mt-1">
                            <input
                              type="text"
                              defaultValue={item.val || ''}
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value; if (v && booking) { setBooking({...booking, [fieldKey]: v} as Booking); setEditField(null); } }}}
                              className="flex-1 bg-[#050508] border border-white/10 px-2 py-1 rounded text-[0.7rem] text-white focus:border-purple-500 outline-none"
                            />
                            <button type="button" onClick={(e) => { const input = (e.currentTarget.previousElementSibling as HTMLInputElement); if (input?.value && booking) { setBooking({...booking, [fieldKey]: input.value} as Booking); setEditField(null); } }} className="text-[0.5rem] text-emerald-400 font-bold uppercase tracking-wider cursor-pointer px-1.5">Save</button>
                            <button type="button" onClick={() => setEditField(null)} className="text-[0.5rem] text-white/30 font-bold uppercase tracking-wider cursor-pointer px-1">✕</button>
                          </div>
                        ) : (
                          item.done && item.val && <p className="text-[0.55rem] text-emerald-400/60 truncate">{item.val}</p>
                        )}
                      </div>
                      {!isEditing && (
                        item.done ? (
                          <button type="button" onClick={() => setEditField(i)} className="text-[0.45rem] font-bold text-white/20 hover:text-purple-400 uppercase tracking-widest cursor-pointer transition-colors shrink-0">Edit</button>
                        ) : (
                          <button type="button" onClick={() => setEditField(i)} className="text-[0.45rem] font-bold text-amber-400/50 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/15 shrink-0 hover:bg-amber-500/20 cursor-pointer transition-all">NEEDED</button>
                        )
                      )}
                    </div>
                    );
                  })}
                  {done < checklist.length && (
                    <Link href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}`}
                      className="mt-2 text-center py-2 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 text-amber-400/70 hover:text-amber-400 text-[0.6rem] font-bold uppercase tracking-wider rounded-lg transition-all">
                      Fill Missing Details →
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#0a0a12] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4"><span className="text-base">⚡</span><h3 className="text-sm font-bold">Quick Actions</h3></div>
                <div className="flex flex-col gap-3">
                  <Link href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}&indoorOutdoor=${encodeURIComponent(booking.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(booking.expectedAttendance)}`}
                    className="w-full py-3 px-4 flex items-center gap-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-purple-600/10 border-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white">
                    <span>🔄</span> Rebook This Event
                  </Link>
                  <Link href={`/book?from=rebook&eventType=${encodeURIComponent(booking.eventType)}&venueName=${encodeURIComponent(booking.venueName)}&venueCity=${encodeURIComponent(booking.venueCity)}&venueState=${encodeURIComponent(booking.venueState)}&startTime=${encodeURIComponent(booking.startTime)}&endTime=${encodeURIComponent(booking.endTime)}&indoorOutdoor=${encodeURIComponent(booking.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(booking.expectedAttendance)}`}
                    className="w-full py-3 px-4 flex items-center gap-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/10 hover:text-white">
                    <span>✏️</span> Edit Logistics
                  </Link>
                  <a href={`mailto:7thheaven@gmail.com?subject=${encodeURIComponent(`[Booking ${booking.id}] Question about ${booking.eventName}`)}&body=${encodeURIComponent(`Hi 7th Heaven,\n\nRe: ${booking.eventName}\nBooking ID: ${booking.id}\nDate: ${booking.date}\nVenue: ${booking.venueName}\n\nMy question:\n\n`)}`}
                    className="w-full py-3 px-4 flex items-center gap-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/10 hover:text-white">
                    <span>✉️</span> Contact 7th Heaven
                  </a>
                  <button onClick={()=>{if(confirm('Cancel this booking?')){fetch('/api/booking',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({bookingId:booking.id,status:'cancelled'})}).then(()=>{setBooking(prev=>prev?{...prev,status:'cancelled'}:prev);});}}}
                    className="w-full py-3 px-4 flex items-center gap-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-rose-500/5 border-rose-500/10 text-rose-400/60 hover:bg-rose-500 hover:text-white">
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
                  <span className="text-[0.55rem] font-bold text-white/25 bg-white/5 px-2 py-0.5 rounded">{pastBookings.length} events</span>
                </div>
                <div className="flex flex-col gap-3">
                  {pastBookings.map((pb, i) => {
                    const sc = pb.status === 'cancelled'
                      ? { dot:'bg-rose-500', text:'text-rose-400', bg:'bg-rose-500/5', border:'border-rose-500/15' }
                      : pb.status === 'confirmed'
                      ? { dot:'bg-emerald-500', text:'text-emerald-400', bg:'bg-emerald-500/5', border:'border-emerald-500/15' }
                      : { dot:'bg-purple-500', text:'text-purple-400', bg:'bg-purple-500/5', border:'border-purple-500/15' };
                    return (
                      <div key={i} className="bg-[#0a0a12] border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all group">
                        <div className={`w-2.5 h-2.5 rounded-full ${sc.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white/80 truncate">{pb.eventName}</h4>
                          <div className="flex items-center gap-3 text-[0.6rem] text-white/30 mt-0.5">
                            <span>📅 {pb.date}</span><span>📍 {pb.venueName}</span><span className="font-mono">{pb.id}</span>
                          </div>
                        </div>
                        <span className={`text-[0.5rem] font-bold uppercase tracking-widest ${sc.text} ${sc.bg} px-2 py-0.5 rounded border ${sc.border}`}>{pb.status}</span>
                        <Link href={`/book?from=rebook&eventType=${encodeURIComponent(pb.eventType)}&venueName=${encodeURIComponent(pb.venueName)}&venueCity=${encodeURIComponent(pb.venueCity)}&venueState=${encodeURIComponent(pb.venueState)}&indoorOutdoor=${encodeURIComponent(pb.indoorOutdoor)}&expectedAttendance=${encodeURIComponent(pb.expectedAttendance)}&organization=${encodeURIComponent(pb.organization)}`}
                          className="px-4 py-2 bg-purple-600/10 hover:bg-purple-600 border border-purple-600/20 hover:border-transparent text-purple-400 hover:text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer shrink-0">
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
