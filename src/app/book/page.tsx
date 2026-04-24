"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

const faqs = [
  {
    q: "How far in advance should I book?",
    a: "We recommend booking at least 4-8 weeks in advance for bar/club shows and 3-6 months for festivals, weddings, and corporate events. Popular dates (holidays, summer weekends) fill up fast.",
  },
  {
    q: "Is a deposit required?",
    a: "Yes, a 50% non-refundable deposit is required to secure your date. The remaining balance is due 7 days before the event.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Cancellations made 30+ days before the event receive a 50% credit toward a future date. Cancellations within 30 days forfeit the deposit. Weather-related cancellations for outdoor events are handled on a case-by-case basis.",
  },
  {
    q: "Do you travel outside the Chicago area?",
    a: "Absolutely. We perform nationwide and internationally. Travel fees may apply for events beyond 100 miles from Chicago and will be discussed during the booking process.",
  },
  {
    q: "What equipment do you bring?",
    a: "We bring all of our own instruments, microphones, and monitoring. For venues without a PA system, we can provide full sound reinforcement for an additional fee. Let us know your venue's setup in the form.",
  },
  {
    q: "Can you customize the setlist?",
    a: "Yes! We can tailor the setlist to your event — whether you want all originals, covers, a mix, or specific songs for special moments like a first dance.",
  },
  {
    q: "What's the difference between a full show and unplugged?",
    a: "A full show is the complete 5-piece band with full backline and PA at concert volume. An unplugged set is a stripped-down acoustic performance, perfect for intimate venues, restaurants, and cocktail hours.",
  },
];

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg-primary)]" />}>
      <BookPageContent />
    </Suspense>
  );
}

function BookPageContent() {
  const { member, isLoggedIn, openModal, signup } = useMember();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const isFromPlanner = fromParam === "planner" || fromParam === "rebook";
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accountPassword, setAccountPassword] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

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
        body: JSON.stringify({ ...formData, eventType: selectedType }),
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
      <label className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">{label}{required && " *"}</label>
      <input {...props} required={required}
        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 rounded-xl text-[0.85rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all"
      />
    </div>
  );

  const SelectField = ({ label, options, required, ...props }: { label: string; options: string[]; required?: boolean } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <div>
      <label className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-2">{label}{required && " *"}</label>
      <select {...props} required={required}
        className="w-full bg-white/[0.03] border border-white/10 px-4 py-3 rounded-xl text-[0.85rem] text-white focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all appearance-none cursor-pointer"
      >
        <option value="" className="bg-[#0a0a0f]">Select</option>
        {options.map(o => <option key={o} value={o} className="bg-[#0a0a0f]">{o}</option>)}
      </select>
    </div>
  );

  const RadioPillField = ({ label, name, options, value, onChange, required }: { label: string; name: string, options: string[], value: string, onChange: any, required?: boolean }) => (
    <div className="mb-2">
      <label className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/30 block mb-3">{label}{required && " *"}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() => onChange({ target: { name, value: o } } as any)}
            className={`py-2 px-4 rounded-xl text-[0.7rem] font-bold tracking-wide transition-all border
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
          <p className="text-white/50 text-[0.95rem] leading-relaxed mb-8">
            Thank you for your interest in booking 7th Heaven! We&apos;ll review the details and get back to you within 24-48 hours.
          </p>

          {!isLoggedIn ? (
            <div className="bg-[#0c0c11] border border-white/5 p-8 rounded-3xl mb-8 flex flex-col items-center shadow-[0_10px_40px_min(rgba(133,29,239,0.05),10%)] relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-50" />
              <h3 className="text-white font-extrabold text-[1.2rem] mb-2 tracking-tight">Save this booking to your profile?</h3>
              <p className="text-white/40 text-[0.85rem] mb-6 leading-relaxed max-w-sm">
                We can link this request to <span className="text-white font-bold">{formData.email}</span>. Just set a password below so you never have to re-type venue details again.
              </p>
              
              <div className="w-full relative mb-4">
                 <input 
                   type="password" 
                   placeholder="Create a password"
                   value={accountPassword}
                   onChange={e => setAccountPassword(e.target.value)}
                   className="w-full bg-[#050508] border border-white/10 px-5 py-4 rounded-xl text-[0.95rem] text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all"
                 />
              </div>

              <button 
                onClick={async () => {
                  if (!accountPassword || accountPassword.length < 4) return;
                  setCreatingAccount(true);
                  const success = await signup(formData.name, formData.email, accountPassword, formData.phone);
                  if (success) {
                    // Update the account role to event_planner since they booked
                    const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
                    const key = formData.email.toLowerCase();
                    if (accounts[key]) {
                      accounts[key].role = 'event_planner';
                      if (formData.phone) accounts[key].phone = formData.phone;
                      localStorage.setItem('7h_accounts', JSON.stringify(accounts));
                    }
                    // Redirect to planner dashboard
                    window.location.href = '/planner';
                  }
                  setCreatingAccount(false);
                }}
                disabled={creatingAccount || !accountPassword}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold tracking-wider uppercase text-[0.75rem] py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] hover:shadow-[0_0_30px_rgba(133,29,239,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingAccount ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          ) : (
             <div className="mb-8">
                <span className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[0.7rem] font-bold uppercase tracking-widest rounded-full">
                  Saved to Profile
                </span>
             </div>
          )}

          <a href="/" className="inline-flex items-center justify-center w-full bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-bold uppercase tracking-wider text-[0.75rem] py-4 px-8 rounded-xl transition-all border border-white/5">
            Return to Homepage
          </a>
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
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.15em] border rounded-full ${
                    member.role === 'event_planner' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30'
                  }`}>
                    {member.role === 'event_planner' ? '📋 Event Planner' : member.role === 'admin' ? '🛡️ Admin' : member.role === 'crew' ? '🛡️ Crew' : '★ Fan'}
                  </span>
                </div>
                <p className="text-[0.8rem] text-white/40 font-mono mt-0.5">{member.email}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[0.65rem] text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Account data auto-filled
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-10">
          <div>
            <span className="inline-block text-[0.75rem] font-bold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-4 bg-[var(--color-accent)]/10 px-4 py-1.5 rounded-full border border-[var(--color-accent)]/20">
              Book 7th Heaven
            </span>
            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.1] tracking-tight text-white mb-2">
              Bring the Show to <br className="hidden md:block"/> Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[#b084f5]">Stage</span>
            </h1>
          </div>
          <p className="text-white/40 max-w-sm text-[0.95rem] leading-relaxed">
            Fill out the details below. We'll review your request and get back to you within 24-48 hours.
          </p>
        </div>

        {/* DEV: Auto-fill Test Button */}
        {typeof window !== 'undefined' && localStorage.getItem('7h_dev_bypass') === 'true' && (
          <button
            type="button"
            onClick={() => {
              setSelectedType('full_band');
              setFormData({
                name: 'Marcus Rivera',
                email: 'marcus@riveraentertainment.com',
                phone: '(312) 555-0187',
                organization: 'Rivera Entertainment Group',
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
              });
            }}
            className="mb-6 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[0.65rem] font-bold uppercase tracking-widest rounded-lg hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            ⚡ Dev: Auto-Fill Form
          </button>
        )}

        {/* Testimonial */}
        <div className="mb-16 border border-white/10 bg-white/[0.02] p-8 relative">
          <div className="absolute top-4 left-6 text-4xl text-[var(--color-accent)]/30 leading-none">&ldquo;</div>
          <p className="text-white/60 text-[0.9rem] leading-relaxed italic pl-8 pr-4 mb-4">
            7th Heaven absolutely crushed it. Our guests couldn&apos;t stop talking about the band for weeks. From the first call to the last song, everything was professional and seamless. Already booked them again for next year.
          </p>
          <div className="pl-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.65rem] font-bold text-[var(--color-accent)]">JM</div>
            <div>
              <span className="text-[0.75rem] font-bold text-white block">Jake M.</span>
              <span className="text-[0.6rem] text-white/30">Corporate Event Manager — Chicago, IL</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="flex flex-col gap-8">

            {isFromPlanner && (
              <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 px-6 py-4 rounded-2xl flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <p className="text-fuchsia-300 text-[0.8rem] font-bold">{fromParam === "rebook" ? "Rebooking previous event" : "Profile details pre-loaded"}</p>
                  <p className="text-white/40 text-[0.7rem]">{fromParam === "rebook" ? "All your previous event details have been copied over. Just pick a new date and tweak anything you need." : "Your contact & venue info has been filled in. Just pick your date and event type."}</p>
                </div>
              </div>
            )}

            {/* Step 1: Calendar & Format */}
            <div className="bg-[#0b0b12] border border-white/5 p-8 rounded-3xl shadow-2xl relative">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
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
              />
            </div>
            {/* Pricing hint per type */}
            {selectedType && (
              <div className="px-5 py-3 bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20 text-[0.75rem] text-white/50 rounded-xl mb-4">
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
              <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.55rem]">2</span>
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
              <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.55rem]">3</span>
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
              <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] mb-6 flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-[0.55rem]">4</span>
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

          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <div>
            <div className="sticky top-32">
            <div className="bg-[var(--color-accent)]/[0.03] border border-[var(--color-accent)]/20 rounded-3xl p-6 shadow-[0_10px_40px_min(rgba(133,29,239,0.1),10%)]">
               <h3 className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-white/60 mb-6 pb-4 border-b border-white/5">Booking Summary</h3>
               
               <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between items-start">
                     <span className="text-[0.7rem] text-white/40 uppercase tracking-widest mt-1">Date</span>
                     <span className="text-[0.9rem] font-bold text-white text-right">
                       {formData.eventDate ? new Date(formData.eventDate + "T12:00:00Z").toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'}) : <span className="text-white/20">—</span>}
                     </span>
                  </div>
                  <div className="flex justify-between items-start">
                     <span className="text-[0.7rem] text-white/40 uppercase tracking-widest mt-1">Time</span>
                     <span className="text-[0.9rem] font-bold text-white text-right">
                       {formData.startTime && formData.endTime ? `${formData.startTime} – ${formData.endTime}` : <span className="text-white/20">—</span>}
                     </span>
                  </div>
                  <div className="flex justify-between items-start">
                     <span className="text-[0.7rem] text-white/40 uppercase tracking-widest mt-1">Format</span>
                     <span className="text-[0.9rem] font-bold text-[var(--color-accent)] text-right">
                       {selectedType ? eventTypes.find(t => t.id === selectedType)?.label : <span className="text-[var(--color-accent)]/30">—</span>}
                     </span>
                  </div>
                  <div className="flex justify-between items-start pt-4 border-t border-white/5">
                     <span className="text-[0.7rem] text-white/40 uppercase tracking-widest mt-1">Venue</span>
                     <span className="text-[0.9rem] font-bold text-white text-right break-words max-w-[150px]">
                       {formData.venueName ? formData.venueName : <span className="text-white/20">—</span>}
                       {formData.venueCity && <span className="block text-[0.65rem] text-white/40 font-normal">{formData.venueCity}, {formData.venueState}</span>}
                     </span>
                  </div>
               </div>

               {/* Validation Errors */}
               {validationErrors.length > 0 && (
                 <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-red-400 text-sm">⚠</span>
                     <span className="text-red-400 text-[0.7rem] font-bold uppercase tracking-widest">Please fix the following</span>
                   </div>
                   <ul className="space-y-1">
                     {validationErrors.map((err, i) => (
                       <li key={i} className="text-red-300/80 text-[0.75rem] pl-5 relative before:content-['•'] before:absolute before:left-1.5 before:text-red-500/50">{err}</li>
                     ))}
                   </ul>
                 </div>
               )}

               <button 
                type="submit" 
                disabled={submitting || !selectedType || !formData.eventDate || !formData.startTime || !formData.endTime || !formData.email}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold tracking-wider uppercase text-[0.8rem] py-4 rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(133,29,239,0.4)]"
               >
                 {submitting ? "Submitting..." : "Submit Request"}
               </button>
               <p className="text-[0.6rem] text-white/30 text-center mt-4">
                 No payment is required to request a date.
               </p>
            </div>
            </div>
          </div>
        </form>

        {/* FAQ Section */}
        <div className="border-t border-white/10 pt-20">
          <div className="text-center mb-12">
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-white">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/10 bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer group"
                >
                  <span className={`text-[0.85rem] font-bold transition-colors ${openFaq === i ? "text-[var(--color-accent)]" : "text-white group-hover:text-white/80"}`}>
                    {faq.q}
                  </span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-white/30 shrink-0 ml-4 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-5 pb-5 text-[0.8rem] text-white/40 leading-relaxed">
                    {faq.a}
                  </p>
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
