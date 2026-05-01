"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CalendarPicker } from "@/components/CalendarPicker";
import { useMember } from "@/context/MemberContext";

const eventTypes = [
  { id: "full_band", label: "Full Band", icon: "🎸", desc: "High energy, full 5-piece concert setup" },
  { id: "unplugged", label: "Unplugged", icon: "🎤", desc: "Acoustic, intimate stripped-down set" },
  { id: "private", label: "Private Event", icon: "🎉", desc: "Birthdays, corporate events, weddings" },
  { id: "custom", label: "Custom Booking", icon: "✨", desc: "Special requests, festivals, hybrid shows" },
];

const budgetRanges = [
  "Under $2,000",
  "$2,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000 – $20,000",
  "$20,000+",
  "Prefer not to say",
];



export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg-primary)]" />}>
      <BookPageContent />
    </Suspense>
  );
}

function MiniDatePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [showCal, setShowCal] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const [showMonthGrid, setShowMonthGrid] = useState(false);
  const minDate = new Date(Date.now() + 86400000);
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="relative">
      <label className="text-[0.875rem] font-bold uppercase tracking-widest text-white/40 block mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setShowCal(!showCal)}
        className={`w-full bg-white/[0.03] border ${value ? 'border-[var(--color-accent)]/40' : 'border-white/10'} px-4 py-3 rounded-xl text-[1.05rem] text-left transition-all hover:border-[var(--color-accent)]/50 cursor-pointer flex items-center justify-between ${value ? 'text-white' : 'text-white/30'}`}
      >
        {value ? new Date(value + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick a date…'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </button>
      {showCal && (
        <div className="absolute z-50 top-full mt-2 left-0 w-72 bg-[#0c0c18] border border-white/10 rounded-2xl shadow-2xl p-4 animate-[fade-in-up_0.15s_ease-out_both]">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setCalMonth(new Date(year, month - 1, 1))} className="text-white/50 hover:text-white p-1 cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
            <button type="button" onClick={() => setShowMonthGrid(!showMonthGrid)} className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-[var(--color-accent)] transition-colors cursor-pointer">{calMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</button>
            <button type="button" onClick={() => setCalMonth(new Date(year, month + 1, 1))} className="text-white/50 hover:text-white p-1 cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
          {showMonthGrid ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={() => setCalMonth(new Date(year - 1, month, 1))} className="text-white/40 hover:text-white text-[1rem] font-bold cursor-pointer">← {year - 1}</button>
                <span className="text-xs font-bold text-white">{year}</span>
                <button type="button" onClick={() => setCalMonth(new Date(year + 1, month, 1))} className="text-white/40 hover:text-white text-[1rem] font-bold cursor-pointer">{year + 1} →</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {mNames.map((m, i) => {
                  const isCur = month === i;
                  const isPast = new Date(year, i + 1, 0) < new Date();
                  return (
                    <button key={m} type="button" disabled={isPast} onClick={() => { setCalMonth(new Date(year, i, 1)); setShowMonthGrid(false); }}
                      className={`py-2 rounded-lg text-[1rem] font-bold uppercase tracking-wider transition-all ${isPast ? 'text-white/10 cursor-not-allowed' : isCur ? 'bg-[var(--color-accent)] text-white' : 'text-white/50 hover:bg-white/10 cursor-pointer'}`}
                    >{m}</button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-7 mb-1">
            {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="text-center text-[1.05rem] font-bold text-white/25 uppercase">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysCount }).map((_, i) => {
              const d = new Date(year, month, i + 1);
              const ds = d.toISOString().split('T')[0];
              const isPast = d < minDate;
              const isSel = value === ds;
              return (
                <button
                  key={ds} type="button" disabled={isPast}
                  onClick={() => { onChange(ds); setShowCal(false); }}
                  className={`h-8 w-full rounded-lg text-xs font-bold transition-all ${isPast ? 'text-white/15 cursor-not-allowed' : isSel ? 'bg-[var(--color-accent)] text-white shadow-[0_0_12px_rgba(133,29,239,0.4)]' : 'text-white/70 hover:bg-white/10 cursor-pointer'}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          {value && (
            <button type="button" onClick={() => { onChange(''); setShowCal(false); }} className="mt-2 w-full text-[1rem] text-rose-400/60 hover:text-rose-400 uppercase tracking-widest font-bold cursor-pointer">Clear</button>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
}

function BookPageContent() {
  const { member, isLoggedIn, openModal, signup } = useMember();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const isFromPlanner = fromParam === "planner" || fromParam === "rebook";
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    customEventType: "",
    venueName: "",
    venueCity: "",
    venueState: "",
    indoorOutdoor: "",
    expectedAttendance: "",
    budget: "",
    setLength: "Full Show (3-4 hours)",
    soundSystem: "",
    stageAvailable: "",
    backlineProvided: "",
    ageRestriction: "",
    loadInTime: "",
    details: "",
    hearAbout: "",
    website: "", // Honeypot
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [addOns, setAddOns] = useState<string[]>([]);

  // Blocked dates from confirmed bookings
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  // Alternate dates (multi-date hold)
  const [altDate1, setAltDate1] = useState("");
  const [altDate2, setAltDate2] = useState("");

  // Fetch blocked dates on mount
  useEffect(() => {
    fetch('/api/booking/availability')
      .then(r => r.json())
      .then(d => setBlockedDates(d.blockedDates || []))
      .catch(() => {});
  }, []);

  // Auto-fill from planner dashboard or rebook — pull saved form data from localStorage first
  useEffect(() => {
    if (isFromPlanner) {
      // Try to restore full form data from last booking
      try {
        const savedForm = localStorage.getItem('7h_planner_last_form');
        if (savedForm) {
          const parsed = JSON.parse(savedForm);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            // Clear date/time so user picks new ones
            eventDate: '',
            startTime: '',
            endTime: '',
          }));
          if (parsed.eventType) setSelectedType(parsed.eventType);
        }
      } catch {}

      // URL params override localStorage (for specific field overrides)
      const allFields = ["name", "email", "phone", "organization", "venueName", "venueCity", "venueState", "startTime", "endTime", "indoorOutdoor", "expectedAttendance", "budget", "soundSystem", "stageAvailable", "backlineProvided", "ageRestriction", "loadInTime", "details"] as const;
      setFormData(prev => {
        const updated = { ...prev };
        allFields.forEach(f => {
          const val = searchParams.get(f);
          if (val) (updated as any)[f] = val;
        });
        return updated;
      });
      const eventType = searchParams.get("eventType");
      if (eventType) setSelectedType(eventType);
    }
  }, [isFromPlanner, searchParams]);

  // Auto-fill details if user is already logged in
  useEffect(() => {
    if (member && !isFromPlanner) {
      setFormData(prev => ({
        ...prev,
        name: member.name || prev.name,
        email: member.email || prev.email,
        phone: member.phone || prev.phone,
      }));
    }
  }, [member, isFromPlanner]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear validation errors when user edits
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateBooking = (): string[] => {
    const errors: string[] = [];

    // Required fields
    if (!selectedType) errors.push("Please select an event type.");
    if (!formData.name.trim()) errors.push("Full name is required.");
    if (!formData.email.trim()) errors.push("Email is required.");
    if (!formData.eventDate) errors.push("Please select an event date.");
    if (!formData.startTime) errors.push("Start time is required.");
    if (!formData.venueName.trim()) errors.push("Venue name is required.");
    if (!formData.venueCity.trim()) errors.push("Venue city is required.");

    // Email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address.");
    }

    // Phone format (if provided)
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      errors.push("Phone number must be at least 10 digits.");
    }

    // Date validation — must be at least 7 days out
    if (formData.eventDate) {
      const eventDate = new Date(formData.eventDate + 'T12:00:00');
      const now = new Date();
      const daysOut = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOut < 0) {
        errors.push("Cannot book a date in the past.");
      } else if (daysOut > 365) {
        errors.push("Bookings cannot be made more than 1 year in advance.");
      }
    }

    // Time validation — end time after start time (if both provided)
    if (formData.startTime && formData.endTime) {
      const parseTime = (t: string) => {
        const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return 0;
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
        if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + m;
      };
      if (parseTime(formData.endTime) <= parseTime(formData.startTime)) {
        errors.push("End time must be after start time.");
      }
    }



    // Rate limiting — max 3 submissions per hour
    try {
      const timestamps: number[] = JSON.parse(localStorage.getItem('7h_booking_timestamps') || '[]');
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recent = timestamps.filter(t => t > oneHourAgo);
      if (recent.length >= 3) {
        errors.push("Too many booking requests. Please wait before submitting another.");
      }
    } catch {}

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Run validation
    const errors = validateBooking();
    if (errors.length > 0) {
      setValidationErrors(errors);
      // Scroll to top of form to show errors
      document.getElementById('book-event')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventType: selectedType, altDate1, altDate2, addOns, website: formData.website }),
      });
      if (res.ok) {


        // Save full form data for rebook auto-fill
        localStorage.setItem('7h_planner_last_form', JSON.stringify({ ...formData, eventType: selectedType }));

        // Track submission timestamp for rate limiting
        try {
          const timestamps: number[] = JSON.parse(localStorage.getItem('7h_booking_timestamps') || '[]');
          timestamps.push(Date.now());
          // Keep only last hour
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          localStorage.setItem('7h_booking_timestamps', JSON.stringify(timestamps.filter(t => t > oneHourAgo)));
        } catch {}

        // Persist phone number to user account if logged in
        if (isLoggedIn && member && formData.phone) {
          const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
          if (accounts[member.email]) {
            accounts[member.email].phone = formData.phone;
            localStorage.setItem('7h_accounts', JSON.stringify(accounts));
          }
        }

        setSubmitted(true);
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="text-[1rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">{label}{required && " *"}</label>
      <input {...props} required={required}
        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 rounded-xl text-[1.05rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all"
      />
    </div>
  );

  const SelectField = ({ label, options, required, ...props }: { label: string; options: string[]; required?: boolean } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div>
      <label className="text-[1rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">{label}{required && " *"}</label>
      <select {...props} required={required}
        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 rounded-xl text-[1.05rem] text-white focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all appearance-none cursor-pointer"
      >
        <option value="" className="bg-[#0a0a0f]">Select</option>
        {options.map(o => <option key={o} value={o} className="bg-[#0a0a0f]">{o}</option>)}
      </select>
    </div>
  );

  const RadioPillField = ({ label, name, options, value, onChange, required }: { label: string; name: string, options: string[], value: string, onChange: any, required?: boolean }) => (
    <div className="mb-2">
      <label className="text-[1rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-3">{label}{required && " *"}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() => onChange({ target: { name, value: o } } as any)}
            className={`py-2 px-4 rounded-xl text-[1.05rem] font-bold tracking-wide transition-all border
              ${value === o 
                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_0_15px_rgba(133,29,239,0.3)]" 
                : "bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/10 hover:border-white/30 hover:text-white"
              }
            `}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  const [setlistSongs, setSetlistSongs] = useState<string[]>(['', '', '']);
  const [setlistNotes, setSetlistNotes] = useState('');
  const [setlistSubmitted, setSetlistSubmitted] = useState(false);
  const [setlistSubmitting, setSetlistSubmitting] = useState(false);

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#050508] px-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-accent)] opacity-[0.05] rounded-full blur-[150px] pointer-events-none" />

        <div className="text-center max-w-lg relative z-10 w-full animate-[fade-in-up_0.6s_ease-out_both] bg-[#0b0b12]/80 border border-white/5 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 bg-[var(--color-accent)]/20 border border-[var(--color-accent)] rounded-2xl flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">Request Received</h1>
          <p className="text-white/50 text-[1.05rem] leading-relaxed mb-8">
            Thank you for your interest in booking 7th Heaven! We&apos;ve sent a confirmation email to <strong className="text-white">{formData.email}</strong>. Please check your inbox to verify your request.
            <br /><span className="text-[1rem] text-emerald-400/70 mt-2 inline-block">✓ Notification sent to band management</span>
          </p>

          <div className="flex flex-col gap-3 w-full">
            <a href="/book" className="inline-flex items-center justify-center w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-wider text-[0.875rem] py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] hover:shadow-[0_0_30px_rgba(133,29,239,0.5)]">
              Book Another Show
            </a>
            {!isLoggedIn && (
              creatingAccount ? (
                <div className="bg-white/[0.03] border border-[var(--color-accent)]/30 rounded-xl p-5">
                  <div className="mb-3">
                    <span className="text-[0.875rem] text-white/30 uppercase tracking-widest font-bold block mb-1.5">Account Email</span>
                    {editingEmail ? (
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={accountEmail}
                          onChange={e => setAccountEmail(e.target.value)}
                          autoFocus
                          className="flex-1 bg-[#050508] border border-white/10 px-4 py-2.5 rounded-lg text-[1.05rem] text-white focus:border-[var(--color-accent)] outline-none transition-all"
                        />
                        <button type="button" onClick={() => setEditingEmail(false)} className="text-[1rem] text-[var(--color-accent)] font-bold uppercase tracking-wider cursor-pointer px-3">Done</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[1.05rem] text-white font-bold">{accountEmail}</span>
                        <button type="button" onClick={() => setEditingEmail(true)} className="text-[0.875rem] text-white/30 hover:text-[var(--color-accent)] uppercase tracking-widest font-bold cursor-pointer transition-colors">Edit</button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Set a password (6+ chars)"
                      value={accountPassword}
                      onChange={e => setAccountPassword(e.target.value)}
                      className="flex-1 bg-[#050508] border border-white/10 px-4 py-3 rounded-xl text-[1.05rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] outline-none transition-all"
                    />
                    <button
                      type="button"
                      disabled={!accountPassword || accountPassword.length < 6 || !accountEmail}
                      onClick={async () => {
                        const result = await signup(formData.name, accountEmail, accountPassword, formData.phone);
                        if (result.success) {
                          if (result.confirmationRequired) {
                            alert(`Account created! Please check ${accountEmail} to verify your account before logging in.`);
                            window.location.href = '/';
                          } else {
                            window.location.href = '/planner';
                          }
                        }
                      }}
                      className="px-5 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white text-[1.05rem] font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    >
                      Go →
                    </button>
                  </div>
                  <button type="button" onClick={() => { setCreatingAccount(false); setEditingEmail(false); }} className="text-[1rem] text-white/30 hover:text-white/50 mt-2 cursor-pointer transition-colors">Cancel</button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <span className="text-[1.05rem] text-white/40">{formData.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setCreatingAccount(true); setAccountEmail(accountEmail || formData.email); }}
                    className="inline-flex items-center justify-center w-full bg-white/[0.05] hover:bg-white/[0.1] text-white font-bold uppercase tracking-wider text-[0.875rem] py-4 px-8 rounded-xl transition-all border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/60 cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              )
            )}
            <a href="/" className="inline-flex items-center justify-center w-full bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-bold uppercase tracking-wider text-[0.875rem] py-4 px-8 rounded-xl transition-all border border-white/5">
              Return to Homepage
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-[#050508] min-h-screen relative overflow-clip">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[var(--color-accent)] opacity-[0.07] blur-[120px] pointer-events-none" />
      
      <section className="pt-32 pb-24 relative z-10" id="book-event">
        <div className="site-container">

        {/* Signed-in Identity Block */}
        {isLoggedIn && member && (
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center text-lg font-black text-[var(--color-accent)]">
                {member.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${
                  member.role === 'event_planner' ? 'bg-fuchsia-500' : 'bg-[var(--color-accent)]'
                } border-2 border-[#050508] flex items-center justify-center`}>
                  <span className="text-[9px]">{member.role === 'event_planner' ? '📋' : '★'}</span>
                </span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black italic tracking-tight text-white">{member.name}</h2>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.875rem] font-bold uppercase tracking-[0.15em] border rounded-full ${
                    member.role === 'event_planner' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                  }`}>
                    {member.role === 'event_planner' ? '📋 Event Planner' : member.role === 'admin' ? '🛡️ Admin' : member.role === 'crew' ? '🛡️ Crew' : '★ Fan'}
                  </span>
                </div>
                <p className="text-[1rem] text-white/40 font-mono mt-0.5">{member.email}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[1rem] text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Account data auto-filled
            </div>
          </div>
        )}


        {/* Planner Account CTA */}
        {!isFromPlanner && (
          member?.role === 'event_planner' ? (
            <div className="relative bg-gradient-to-r from-purple-600/10 via-fuchsia-500/10 to-purple-600/10 border border-purple-500/25 rounded-2xl px-8 py-6 flex items-center justify-between gap-6 overflow-hidden mb-8">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(147,51,234,0.08),_transparent_60%)]" />
              <div className="flex items-center gap-5 relative">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(147,51,234,0.15)]">
                  <span className="text-lg font-black text-purple-400">{member?.name?.split(' ').map((n:string)=>n[0]).join('').substring(0,2).toUpperCase() || '👋'}</span>
                </div>
                <div>
                  <p className="text-white text-base font-black tracking-tight mb-0.5">Welcome back, <span className="text-purple-400">{member?.name?.split(' ')[0]}</span></p>
                  <p className="text-white/40 text-[0.875rem]">This booking will be saved to your planner dashboard for easy management and rebooking.</p>
                </div>
              </div>
              <Link href="/planner" className="relative px-7 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_50px_rgba(147,51,234,0.5)] shrink-0">
                My Dashboard →
              </Link>
            </div>
          ) : (
            <div className="relative bg-gradient-to-r from-purple-600/10 via-fuchsia-500/10 to-purple-600/10 border border-purple-500/25 rounded-2xl px-8 py-6 flex items-center justify-between gap-6 overflow-hidden mb-8">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(147,51,234,0.08),_transparent_60%)]" />
              <div className="flex items-center gap-5 relative">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(147,51,234,0.15)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <p className="text-white text-base font-black tracking-tight mb-0.5">Event Planner? <span className="text-purple-400">Get Your Own Dashboard</span></p>
                  <p className="text-white/40 text-[0.875rem]">Sign in or create a free planner account — save your details, rebook past events instantly, and track every booking.</p>
                </div>
              </div>
              <Link href="/planner?login=true" className="relative px-7 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_50px_rgba(147,51,234,0.5)] shrink-0">
                Planner Portal →
              </Link>
            </div>
          )
        )}

        {/* DEV: Auto-fill Test Button */}
        {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && localStorage.getItem('7h_dev_bypass') === 'true' && (
          <button
            type="button"
            onClick={() => {
              setSelectedType('full_band');
              setFormData({
                name: 'Marcus Rivera',
                email: 'marcus@riveraentertainment.com',
                phone: '(312) 555-0187',
                organization: 'Rivera Entertainment',
                eventDate: '2026-06-14',
                startTime: '7:00 PM',
                endTime: '10:00 PM',
                customEventType: '',
                venueName: 'The Chicago Theatre',
                venueCity: 'Chicago',
                venueState: 'IL',
                indoorOutdoor: 'Indoor',
                expectedAttendance: '500',
                budget: '$5,000 – $10,000',
                setLength: 'Full Show (3-4 hours)',
                soundSystem: 'Yes — full PA provided',
                stageAvailable: 'Yes',
                backlineProvided: 'No — band brings everything',
                ageRestriction: '21+',
                loadInTime: '3:00 PM',
                details: 'Annual summer gala fundraiser. We need high-energy rock covers mixed with originals. VIP section stage-left. Green room required for band.',
                hearAbout: 'Referred by a friend',
                website: '',
              });
            }}
            className="mb-6 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[1rem] font-bold uppercase tracking-widest rounded-lg hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            ⚡ Dev: Auto-Fill Form
          </button>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="flex flex-col gap-8">

            {isFromPlanner && (
              <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 px-6 py-4 rounded-2xl flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <p className="text-fuchsia-300 text-[1rem] font-bold">{fromParam === "rebook" ? "Rebooking previous event" : "Profile details pre-loaded"}</p>
                  <p className="text-white/40 text-[1.05rem]">{fromParam === "rebook" ? "All your previous event details have been copied over. Just pick a new date and tweak anything you need." : "Your contact & venue info has been filled in. Just pick your date and event type."}</p>
                </div>
              </div>
            )}

            {/* Step 1: Calendar & Format */}
            <div className="bg-[#0b0b12] border border-white/5 p-8 rounded-3xl shadow-2xl relative">
            <h2 className="text-[1.05rem] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
              1 — Event Schedule & Format
            </h2>
            <div className="mb-6">
              <CalendarPicker 
                label="Primary Event Schedule"
                required
                selectedDate={formData.eventDate}
                onSelectDate={(d) => setFormData(p => ({ ...p, eventDate: d }))}
                startTime={formData.startTime}
                onStartTimeChange={(t) => setFormData(p => ({ ...p, startTime: t }))}
                endTime={formData.endTime}
                onEndTimeChange={(t) => setFormData(p => ({ ...p, endTime: t }))}
                selectedType={selectedType || undefined}
                onSelectType={(t) => setSelectedType(t)}
                customDetails={formData.customEventType}
                onCustomDetailsChange={(d) => setFormData(p => ({ ...p, customEventType: d }))}
                blockedDates={blockedDates}
              />

              {/* Alternate Dates */}
              <div className="mt-6 p-5 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg">📅</span>
                  <div>
                    <h4 className="text-[0.875rem] font-bold uppercase tracking-widest text-white">Flexible? Add Backup Dates</h4>
                    <p className="text-[1rem] text-white/30">Increase your chances — we&apos;ll try your preferred date first</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MiniDatePicker label="2nd Choice" value={altDate1} onChange={setAltDate1} />
                  <MiniDatePicker label="3rd Choice" value={altDate2} onChange={setAltDate2} />
                </div>
                {(altDate1 || altDate2) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-[1rem] text-white/30 uppercase tracking-widest font-bold">Priority:</span>
                    <span className="text-[1rem] bg-[var(--color-accent)]/20 text-[var(--color-accent)] px-2 py-0.5 rounded font-bold">1st: {formData.eventDate ? new Date(formData.eventDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}</span>
                    {altDate1 && <span className="text-[1rem] bg-white/5 text-white/50 px-2 py-0.5 rounded font-bold">2nd: {new Date(altDate1 + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                    {altDate2 && <span className="text-[1rem] bg-white/5 text-white/50 px-2 py-0.5 rounded font-bold">3rd: {new Date(altDate2 + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                  </div>
                )}
              </div>
            </div>
            {/* Pricing hint per type */}
            {selectedType && (
              <div className="px-5 py-3 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 text-[0.875rem] text-white/50 rounded-xl mb-4">
                <span className="text-[var(--color-accent)] font-bold">Pricing Guide:</span>{" "}
                {selectedType === "full_band" && "Full band performances typically start at $3,000 depending on stage scale and production requirements."}
                {selectedType === "unplugged" && "Unplugged acoustic sets start at $1,500. Perfect for smaller rooms or cocktail setups."}
                {selectedType === "private" && "Private events start at $4,000. Includes custom setlist and dedicated coordination."}
                {selectedType === "custom" && "Custom package pricing depends entirely on requirements. We'll be in touch to quote you directly."}
              </div>
            )}
            </div>

            {/* Step 2: Contact Information */}
            <div className="bg-[#0b0b12] border border-white/5 p-8 rounded-3xl shadow-2xl relative">
              <h2 className="text-[1.05rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.875rem]">2</span>
                Contact Information
              </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Smith" />
              <InputField label="Organization" name="organization" value={formData.organization} onChange={handleChange} placeholder="Venue or company name" />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@email.com" />
              <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" />
            </div>
            </div>

            {/* Step 3: Venue Details */}
            <div className="bg-[#0b0b12] border border-white/5 p-8 rounded-3xl shadow-2xl relative">
              <h2 className="text-[1.05rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.875rem]">3</span>
                Venue Details
              </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Load-in / Setup Time" name="loadInTime" value={formData.loadInTime} onChange={handleChange} placeholder="e.g. 3:00 PM, 2 hours before" />
              <InputField label="Venue Name" name="venueName" value={formData.venueName} onChange={handleChange} placeholder="Venue name" />
              <InputField label="City" name="venueCity" value={formData.venueCity} onChange={handleChange} required placeholder="Chicago" />
              <InputField label="State" name="venueState" value={formData.venueState} onChange={handleChange} required placeholder="IL" />
            </div>
            </div>

            {/* Step 4: Technical & Logistics */}
            <div className="bg-[#0b0b12] border border-white/5 p-8 rounded-3xl shadow-2xl relative">
              <h2 className="text-[1.05rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.875rem]">4</span>
                Technical & Logistics
              </h2>
            <div className="flex flex-col gap-8">
              <RadioPillField label="Indoor / Outdoor" name="indoorOutdoor" value={formData.indoorOutdoor} onChange={handleChange} options={["Indoor", "Outdoor", "Both / Hybrid", "TBD"]} />
              <RadioPillField label="Sound System Available?" name="soundSystem" value={formData.soundSystem} onChange={handleChange} options={["Yes — full PA system", "Partial — need supplemental", "No — band needs to provide", "Not sure"]} />
              <RadioPillField label="Stage Available?" name="stageAvailable" value={formData.stageAvailable} onChange={handleChange} options={["Yes", "No — performing at floor level", "Portable / riser can be arranged", "Not sure"]} />
              <RadioPillField label="Backline Provided?" name="backlineProvided" value={formData.backlineProvided} onChange={handleChange} options={["Yes — amps, drums, etc.", "Partial", "No — band brings everything", "Not sure"]} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2 border-t border-white/5 pt-8">
                <div>
                   <InputField label="Expected Attendance" name="expectedAttendance" value={formData.expectedAttendance} onChange={handleChange} placeholder="~200 people" />
                </div>
              </div>
            </div>
            </div>

            {/* Step 5: Additional Options */}
            <div className="bg-[#0b0b12] border border-white/5 p-8 rounded-3xl shadow-2xl relative">
              <h2 className="text-[1.05rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-2 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.875rem]">5</span>
                Production & Extras
              </h2>
              <p className="text-white/30 text-[1.05rem] mb-6">Select any features you&apos;d like the band to bring to your event. Pricing discussed with your band manager.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([] as { id: string; icon: string; label: string; desc: string }[]).map(option => {
                  const isActive = addOns.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setAddOns(prev => isActive ? prev.filter(a => a !== option.id) : [...prev, option.id])}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group
                        ${isActive
                          ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 shadow-[0_0_15px_rgba(133,29,239,0.1)]'
                          : 'border-white/5 bg-white/[0.01] hover:border-white/15 hover:bg-white/[0.03]'
                        }`}
                    >
                      <span className="text-xl mt-0.5">{option.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[1rem] font-bold block ${isActive ? 'text-[var(--color-accent)]' : 'text-white/80'}`}>{option.label}</span>
                          {isActive && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                        <span className="text-[1rem] text-white/30 block leading-snug">{option.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {addOns.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-3 flex-wrap">
                  <span className="text-[0.875rem] font-bold uppercase tracking-widest text-white/30">Selected:</span>
                  {addOns.map(id => (
                    <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[1rem] font-bold rounded-full border border-[var(--color-accent)]/20">
                      {id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      <button type="button" onClick={() => setAddOns(prev => prev.filter(a => a !== id))} className="ml-0.5 text-[var(--color-accent)]/50 hover:text-[var(--color-accent)] cursor-pointer">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Step 6: Notes & Questions */}
            <div className="bg-[#0b0b12] border border-white/5 p-8 rounded-3xl shadow-2xl relative">
              <h2 className="text-[1.05rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-2 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.875rem]">6</span>
                Notes & Questions
              </h2>
              <p className="text-white/30 text-[1.05rem] mb-4">Anything else you&apos;d like to mention? Special requests, questions, or details for our band manager.</p>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={5}
                placeholder="e.g. We need a specific song for the first dance, the venue has a noise curfew at 10pm, or any questions about pricing, gear, or logistics…"
                className="w-full bg-white/[0.02] border border-white/10 text-white text-[1.05rem] leading-relaxed px-5 py-4 rounded-2xl focus:border-[var(--color-accent)]/50 outline-none transition-all resize-none placeholder:text-white/15 [color-scheme:dark]"
              />
              {formData.details && (
                <div className="mt-3 flex items-center gap-2 text-[1rem] text-emerald-400/60">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="uppercase tracking-widest font-bold">Note attached to your booking</span>
                </div>
              )}
            </div>

            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input type="text" name="website" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} tabIndex={-1} autoComplete="off" />
            </div>

          </div>



          {/* Right Column: Sticky Summary Sidebar */}
          <div>
            <div className="sticky top-32">
            <div className="bg-[var(--color-accent)]/[0.03] border border-[var(--color-accent)]/20 rounded-3xl p-6 shadow-[0_10px_40px_min(rgba(133,29,239,0.1),10%)]">
               <h3 className="text-[1.05rem] font-bold tracking-[0.2em] uppercase text-white/60 mb-6 pb-4 border-b border-white/5">Booking Summary</h3>
               
               <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between items-start">
                     <span className="text-[1.05rem] text-white/40 uppercase tracking-widest mt-1">Date</span>
                     <span className="text-[1rem] font-bold text-white text-right">
                       {formData.eventDate ? new Date(formData.eventDate + "T12:00:00Z").toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'}) : <span className="text-white/20">—</span>}
                     </span>
                  </div>
                  <div className="flex justify-between items-start">
                     <span className="text-[1.05rem] text-white/40 uppercase tracking-widest mt-1">Time</span>
                     <span className="text-[1rem] font-bold text-white text-right">
                       {formData.startTime && formData.endTime ? `${formData.startTime} – ${formData.endTime}` : <span className="text-white/20">—</span>}
                     </span>
                  </div>
                  <div className="flex justify-between items-start">
                     <span className="text-[1.05rem] text-white/40 uppercase tracking-widest mt-1">Format</span>
                     <span className="text-[1rem] font-bold text-[var(--color-accent)] text-right">
                       {selectedType ? eventTypes.find(t => t.id === selectedType)?.label : <span className="text-[var(--color-accent)]/30">—</span>}
                     </span>
                  </div>
                  <div className="flex justify-between items-start pt-4 border-t border-white/5">
                     <span className="text-[1.05rem] text-white/40 uppercase tracking-widest mt-1">Venue</span>
                     <span className="text-[1rem] font-bold text-white text-right break-words max-w-[150px]">
                       {formData.venueName ? formData.venueName : <span className="text-white/20">—</span>}
                       {formData.venueCity && <span className="block text-[1rem] text-white/40 font-normal">{formData.venueCity}, {formData.venueState}</span>}
                     </span>
                  </div>
                  {addOns.length > 0 && (
                    <div className="flex justify-between items-start pt-4 border-t border-white/5">
                      <span className="text-[1.05rem] text-white/40 uppercase tracking-widest mt-1">Add-Ons</span>
                      <div className="text-right">
                        <span className="text-[1rem] font-bold text-[var(--color-accent)]">{addOns.length} selected</span>
                        <div className="flex flex-wrap gap-1 mt-1 justify-end max-w-[160px]">
                          {addOns.slice(0, 3).map(id => (
                            <span key={id} className="text-[1.05rem] bg-[var(--color-accent)]/10 text-[var(--color-accent)]/70 px-1.5 py-0.5 rounded font-bold">{id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                          ))}
                          {addOns.length > 3 && <span className="text-[1.05rem] text-white/30 font-bold">+{addOns.length - 3} more</span>}
                        </div>
                      </div>
                    </div>
                  )}
               </div>

               {/* Validation Errors */}
               {validationErrors.length > 0 && (
                 <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-red-400 text-sm">⚠</span>
                     <span className="text-red-400 text-[1.05rem] font-bold uppercase tracking-widest">Please fix the following</span>
                   </div>
                   <ul className="space-y-1">
                     {validationErrors.map((err, i) => (
                       <li key={i} className="text-red-300/80 text-[0.875rem] pl-5 relative before:content-['•'] before:absolute before:left-1.5 before:text-red-500/50">{err}</li>
                     ))}
                   </ul>
                 </div>
               )}

               <button 
                type="submit" 
                disabled={submitting || !selectedType || !formData.eventDate || !formData.startTime || !formData.endTime || !formData.email}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold tracking-wider uppercase text-[1rem] py-4 rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(133,29,239,0.4)]"
               >
                 {submitting ? "Submitting..." : "Submit Request"}
               </button>
               <p className="text-[1rem] text-white/30 text-center mt-4">
                 No payment is required to request a date. By submitting, you agree to our <a href="/privacy" className="underline hover:text-white/50 transition-colors">Privacy Policy</a> and <a href="/terms" className="underline hover:text-white/50 transition-colors">Terms</a>.
               </p>
            </div>
            </div>
          </div>
        </form>

        {/* Testimonial */}
        <div className="mt-16 mb-8 border border-white/10 bg-white/[0.02] p-8 relative">
          <div className="absolute top-4 left-6 text-4xl text-[var(--color-accent)]/30 leading-none">&ldquo;</div>
          <p className="text-white/60 text-[1rem] leading-relaxed italic pl-8 pr-4 mb-4">
            7th Heaven absolutely crushed it. Our guests couldn&apos;t stop talking about the band for weeks. From the first call to the last song, everything was professional and seamless. Already booked them again for next year.
          </p>
          <div className="pl-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-accent)]/20 flex items-center justify-center text-[1rem] font-bold text-[var(--color-accent)]">JM</div>
            <div>
              <span className="text-[0.875rem] font-bold text-white block">Jake M.</span>
              <span className="text-[1rem] text-white/30">Corporate Event Manager — Chicago, IL</span>
            </div>
          </div>
        </div>

        {/* Past Event Gallery */}
        <div className="border-t border-white/10 pt-20 mb-20">
          <div className="text-center mb-12">
            <span className="inline-block text-[1.05rem] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-3 bg-[var(--color-accent)]/10 px-4 py-1.5 rounded-full border border-[var(--color-accent)]/20">See Us In Action</span>
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold text-white">Past <span className="gradient-text">Events</span></h2>
            <p className="text-white/40 text-[1rem] mt-3 max-w-lg mx-auto">From packed festival stages to intimate cocktail hours — we bring the energy everywhere.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { img: '/images/events/festival.png', title: 'Summer Music Festival', venue: 'Millennium Park, Chicago', type: 'Full Band', guests: '5,000+' },
              { img: '/images/events/wedding.png', title: 'Anderson Wedding Reception', venue: 'The Drake Hotel, Chicago', type: 'Private Event', guests: '250' },
              { img: '/images/events/corporate.png', title: 'Annual Corporate Gala', venue: 'Four Seasons Ballroom, IL', type: 'Full Band', guests: '400' },
              { img: '/images/events/bar.png', title: 'Friday Night Residency', venue: "Joe's Bar, Chicago", type: 'Full Band', guests: '300' },
              { img: '/images/events/acoustic.png', title: 'Wine & Dine Series', venue: 'Vino & Vine, Naperville', type: 'Unplugged', guests: '60' },
              { img: '/images/events/private-party.png', title: 'Luxury Pool Party', venue: 'Private Estate, Lake Forest', type: 'Private Event', guests: '150' },
            ].map((event, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border border-white/5 bg-[#0b0b12]">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={event.img} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="inline-block text-[0.875rem] font-bold uppercase tracking-widest text-[var(--color-accent)] bg-[var(--color-accent)]/20 px-2 py-0.5 rounded mb-2">{event.type}</span>
                  <h3 className="text-white font-bold text-[1rem] mb-0.5">{event.title}</h3>
                  <p className="text-white/40 text-[1.05rem]">{event.venue} · {event.guests} guests</p>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
      </section>
    </div>
  );
}
