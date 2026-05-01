"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/context/MemberContext";

const ITINERARY = [
  {
    day: 1, port: "Miami, FL", label: "Embarkation", icon: "🚢", type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "12:00 PM", event: "Boarding begins at PortMiami", cat: "ship" },
      { time: "2:00 PM",  event: "Cabins open — drop your bags & explore", cat: "explore" },
      { time: "4:00 PM",  event: "🎸 Sail-Away Party — pool deck", cat: "band" },
      { time: "6:00 PM",  event: "Depart Miami — skyline views from deck", cat: "ship" },
      { time: "8:00 PM",  event: "Welcome dinner & cocktails", cat: "food" },
    ],
  },
  {
    day: 2, port: "At Sea", label: "Sea Day", icon: "🌊", type: "sea",
    photo: "/images/cruise/at-sea.png",
    schedule: [
      { time: "9:00 AM",  event: "Sunrise coffee on the upper deck", cat: "explore" },
      { time: "11:00 AM", event: "🎸 Acoustic set by the pool", cat: "band" },
      { time: "2:00 PM",  event: "🎸 VIP Meet & Greet — Sky Lounge", cat: "band" },
      { time: "4:00 PM",  event: "Free time — spa, casino, sun deck", cat: "explore" },
      { time: "8:00 PM",  event: "🎸 Full electric show — main theater", cat: "band" },
    ],
  },
  {
    day: 3, port: "Cozumel, Mexico", label: "Port Day", icon: "🏝️", type: "island",
    photo: "/images/cruise/cozumel.png",
    schedule: [
      { time: "7:00 AM",  event: "Dock at Cozumel International Pier", cat: "ship" },
      { time: "8:00 AM",  event: "Mayan ruins tour — Tulum excursion", cat: "explore" },
      { time: "10:00 AM", event: "Snorkeling at Palancar Reef", cat: "explore" },
      { time: "12:00 PM", event: "Beach clubs & lunch on the water", cat: "food" },
      { time: "4:00 PM",  event: "All aboard deadline", cat: "ship" },
      { time: "9:00 PM",  event: "🎸 Deck party — 7th Heaven classics", cat: "band" },
    ],
  },
  {
    day: 4, port: "Grand Cayman", label: "Port Day", icon: "🐢", type: "island",
    photo: "/images/cruise/grand-cayman.png",
    schedule: [
      { time: "8:00 AM",  event: "Tender boats to George Town", cat: "ship" },
      { time: "9:00 AM",  event: "Stingray City sandbar excursion", cat: "explore" },
      { time: "11:00 AM", event: "Seven Mile Beach — free swim & sun", cat: "explore" },
      { time: "12:30 PM", event: "Rum Point beach bar lunch", cat: "food" },
      { time: "3:30 PM",  event: "Return tender to ship", cat: "ship" },
      { time: "7:30 PM",  event: "🎸 Sunset deck session with the band", cat: "band" },
    ],
  },
  {
    day: 5, port: "Roatán, Honduras", label: "Port Day", icon: "🤿", type: "island",
    photo: "/images/cruise/roatan.png",
    schedule: [
      { time: "7:00 AM",  event: "Dock at Mahogany Bay Pier", cat: "ship" },
      { time: "8:00 AM",  event: "Zip-lining through the jungle canopy", cat: "explore" },
      { time: "9:30 AM",  event: "Scuba & snorkeling — Mesoamerican Reef", cat: "explore" },
      { time: "12:30 PM", event: "Beachside lunch at Tabyana Beach", cat: "food" },
      { time: "4:00 PM",  event: "All aboard deadline", cat: "ship" },
      { time: "8:30 PM",  event: "🎸 Late-night jam — Lido deck", cat: "band" },
    ],
  },
  {
    day: 6, port: "At Sea", label: "Grand Finale", icon: "🎸", type: "sea",
    photo: "/images/cruise/concert.png",
    schedule: [
      { time: "10:00 AM", event: "Farewell brunch — main dining room", cat: "food" },
      { time: "12:00 PM", event: "🎸 Fan Q&A with 7th Heaven — Sky Lounge", cat: "band" },
      { time: "5:00 PM",  event: "🎸 Sound check — fans welcome", cat: "band" },
      { time: "8:00 PM",  event: "🎸 Grand Finale — 2-hr fan-request concert", cat: "band" },
      { time: "10:30 PM", event: "🎸 After-party — pool deck, no curfew", cat: "band" },
    ],
  },
  {
    day: 7, port: "Miami, FL", label: "Disembarkation", icon: "⚓", type: "depart",
    photo: "/images/cruise/miami.png",
    schedule: [
      { time: "7:00 AM",  event: "Arrive back in Miami — sunrise views", cat: "ship" },
      { time: "7:30 AM",  event: "Farewell breakfast buffet", cat: "food" },
      { time: "9:00 AM",  event: "🎸 Group photo with the band — pool deck", cat: "band" },
      { time: "10:00 AM", event: "Disembarkation begins by group", cat: "ship" },
    ],
  },
];

const ITIN_TYPE_ACCENT: Record<string, string> = {
  island: "text-cyan-400", sea: "text-purple-400", depart: "text-amber-400",
};
const ITIN_TYPE_BAR: Record<string, string> = {
  island: "from-cyan-500 to-emerald-400", sea: "from-purple-500 to-[var(--color-accent)]", depart: "from-amber-500 to-orange-400",
};
const ITIN_CAT_DOT: Record<string, string> = {
  band: "bg-[var(--color-accent)] shadow-[0_0_6px_rgba(133,29,239,0.8)]",
  explore: "bg-cyan-400", food: "bg-emerald-400", ship: "bg-white/25",
};
const ITIN_CAT_TEXT: Record<string, string> = {
  band: "text-white font-semibold", explore: "text-white/70", food: "text-white/60", ship: "text-white/35",
};

const FAQS = [
  { q: "How does the group deal work?", a: "We take the total number of interested fans to cruise line management and negotiate the best possible group rate. The more people who sign up, the better the deal for everyone." },
  { q: "Am I committing to buy by signing up?", a: "No — signing up is free and non-binding. It just tells us you're interested so we can negotiate the best rate. You'll get first access to book once pricing is locked in." },
  { q: "When will I know the final price?", a: "Once we hit our target number of interested fans, we'll take the headcount to cruise management. You'll be emailed the negotiated pricing before anyone else." },
  { q: "Is 7th Heaven playing the whole cruise?", a: "Yes! We have multiple performances planned — from intimate acoustic sets by the pool to a full-production grand finale concert." },
  { q: "Can I bring friends and family?", a: "Absolutely! When you sign up, tell us how many people you'd bring. Every person counts toward the group rate, so the more the merrier." },
  { q: "What's included?", a: "Cabin, meals at main dining venues, all 7th Heaven performances, and standard cruise amenities. Drink packages and excursions are typically additional." },
];

export default function CruisePage() {
  const supabase = createClient();
  const { isLoggedIn, member, openModal } = useMember();
  const [signupStatus, setSignupStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({ 
    name: "", email: "", phone: "", notes: "", anonymous: false, 
    joinCommunity: true, website: "", guestCount: 1 
  });
  const [guests, setGuests] = useState<{name: string; email: string; phone: string; age: string; type: "adult" | "child"}[]>([]);
  const [openPanel, setOpenPanel] = useState<number>(-1); // -1 = primary booker open by default handled below
  const [primaryOpen, setPrimaryOpen] = useState(true);

  const GUEST_COLORS = ["#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#8b5cf6", "#f97316"];

  const addGuest = () => {
    setGuests(prev => [...prev, { name: "", email: "", phone: "", age: "", type: "adult" }]);
    setOpenPanel(guests.length);
    setPrimaryOpen(false);
  };

  const removeGuest = (idx: number) => {
    setGuests(prev => prev.filter((_, i) => i !== idx));
    if (openPanel === idx) setOpenPanel(-1);
  };

  const updateGuest = (index: number, field: string, value: string) => {
    setGuests(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [signupCount, setSignupCount] = useState<number>(0);
  const [joinedFans, setJoinedFans] = useState<{name: string; guest_count: number; anonymous: boolean; created_at: string}[]>([]);
  const [totalGuests, setTotalGuests] = useState<number>(0);

  const AVATAR_COLORS = ["#851DEF", "#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#8b5cf6"];

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/api/cruise/count');
        if (res.ok) {
          const data = await res.json();
          setSignupCount(data.signupCount);
          setTotalGuests(data.totalGuests);
          setJoinedFans(data.joinedFans);
        }
      } catch {}
    };
    loadStats();
  }, []);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (isLoggedIn && member) {
      setFormData(prev => ({
        ...prev,
        name: member.name || prev.name,
        email: member.email || prev.email,
        phone: prev.phone || "", // If member has phone, use it, else empty
      }));
    }
  }, [isLoggedIn, member]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) return; // Honeypot trap
    setSignupStatus("submitting");
    try {
      const res = await fetch('/api/cruise/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone || null,
          guest_count: 1 + guests.length,
          notes: formData.notes || null,
          anonymous: formData.anonymous,
          joinCommunity: formData.joinCommunity,
          guests: guests.filter(g => g.name).map(g => ({
            name: g.name,
            email: g.email || null,
            phone: g.phone || null,
            age: g.type === "child" ? (g.age || null) : null,
            type: g.type,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setSignupStatus("error");
          return;
        }
        throw new Error(data.error || 'Signup failed');
      }
      setSignupStatus("success");
      setSignupCount(prev => prev + 1);
      setTotalGuests(prev => prev + 1 + guests.length);
      setFormData({ name: "", email: "", phone: "", notes: "", anonymous: false, joinCommunity: true, website: "", guestCount: 1 });
      setGuests([]);
    } catch {
      setSignupStatus("error");
    }
  };

  const GOAL = 200;
  const progress = Math.min((totalGuests / GOAL) * 100, 100);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">

      {/* ── FULL-VIEWPORT HERO ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/cruise-hero.png" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[var(--color-bg-primary)]" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Gauging Interest — Free Signup
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white drop-shadow-2xl" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            7th Heaven <span className="accent-gradient-text">Cruise</span>
          </h1>
          <p className="text-xl text-white/60 mt-6 max-w-2xl mx-auto leading-relaxed">
            7 nights. 3 islands. 6 live shows. The ultimate fan experience on the Caribbean.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-white/40">
            <span>🚢 Miami → Caribbean</span>
            <span>🏝️ Cozumel · Grand Cayman · Roatán</span>
            <span>🎸 6 Performances</span>
          </div>

        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-[0.55rem] uppercase tracking-widest font-bold">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </section>

      {/* ── SIGNUP + COUNTER (overlapping hero) ── */}
      <section id="signup" className="site-container -mt-20 relative z-20 mb-20">
        <div className="bg-[#0d0d14]/95 backdrop-blur-xl border border-[var(--color-accent)]/30 rounded-3xl p-8 md:p-10 shadow-[0_0_60px_rgba(133,29,239,0.15)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight mb-1" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
                    Join the <span className="accent-gradient-text">Journey</span>
                  </h2>
                  <p className="text-white/40 text-sm">Free, non-binding. Just show us you&apos;re interested.</p>
                </div>
                {!isLoggedIn && (
                  <button 
                    onClick={() => openModal("login")}
                    className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--color-accent)] hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full border border-[var(--color-accent)]/30 flex items-center justify-center group-hover:border-[var(--color-accent)] transition-all">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                    Already have an account? Sign In
                  </button>
                )}
                {isLoggedIn && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    member?.role === 'crew' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                    member?.role === 'admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      member?.role === 'crew' ? 'bg-rose-500' :
                      member?.role === 'admin' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`} />
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest">
                      Signed In as {member?.role === 'crew' ? 'Crew Member' : member?.role === 'admin' ? 'Admin' : 'Fan'}: {member?.name || 'User'}
                    </span>
                  </div>
                )}
              </div>
              {signupStatus === "success" ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
                  <span className="text-3xl block mb-3">🚢</span>
                  <p className="text-white font-bold text-lg">You&apos;re on the list, {formData.name ? formData.name.split(' ')[0] : 'Captain'}!</p>
                  <p className="text-emerald-400 text-sm mt-2">Check <strong className="text-white">{formData.email}</strong> for your confirmation email. Please click the link inside to verify your request.</p>
                  <p className="text-white/30 text-xs mt-3">If you change your mind, you can cancel from the email anytime.</p>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Party Size Selector */}
                  <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                    <div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-1">Party Size</p>
                      <p className="text-sm font-bold text-white">How many guests in your party?</p>
                    </div>
                    <select 
                      value={formData.guestCount} 
                      onChange={e => {
                        const count = parseInt(e.target.value);
                        setFormData({ ...formData, guestCount: count });
                        const diff = count - 1 - guests.length;
                        if (diff > 0) {
                          const newGuests = [...guests];
                          for (let i = 0; i < diff; i++) {
                            newGuests.push({ name: "", email: "", phone: "", age: "", type: "adult" });
                          }
                          setGuests(newGuests);
                        } else if (diff < 0) {
                          setGuests(guests.slice(0, count - 1));
                        }
                      }}
                      className="bg-[#0c0c18] border border-white/20 rounded-lg px-3 py-1.5 text-sm font-bold text-white outline-none focus:border-[var(--color-accent)] cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>)}
                    </select>
                  </div>

                  {/* ── Collapsible Guest List ── */}
                  <div className="space-y-2">
                    {/* Primary Booker */}
                    <div className="rounded-xl overflow-hidden border border-white/5">
                      <button type="button" onClick={() => { setPrimaryOpen(!primaryOpen); setOpenPanel(-1); }}
                        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-all bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/25">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white shrink-0 bg-[var(--color-accent)]">
                          {formData.name ? formData.name[0].toUpperCase() : "1"}
                        </span>
                        <div className="flex-1 text-left">
                          <p className="text-[0.5rem] font-bold uppercase tracking-widest text-white/40">Primary Booker</p>
                          <p className="text-sm font-bold text-white">{formData.name || "—"}</p>
                        </div>
                        <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/20 mr-2">Adult</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/30 transition-transform ${primaryOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      {primaryOpen && (
                        <div className="px-4 pb-4 pt-3 space-y-2.5 bg-white/[0.01]">
                          <input type="text" required placeholder="Full Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                          <input type="email" required placeholder="Email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                          <input type="tel" required placeholder="Phone" value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                        </div>
                      )}
                    </div>

                    {/* Additional Guests */}
                    {guests.map((guest, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-white/5">
                        <button type="button" onClick={() => { setOpenPanel(openPanel === i ? -1 : i); setPrimaryOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-all bg-white/[0.03] hover:bg-white/[0.05]">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white shrink-0" style={{ backgroundColor: GUEST_COLORS[i % GUEST_COLORS.length] }}>
                            {guest.name ? guest.name[0].toUpperCase() : (i + 2)}
                          </span>
                          <div className="flex-1 text-left">
                            <p className="text-[0.5rem] font-bold uppercase tracking-widest text-white/30">Guest {i + 2}</p>
                            <p className="text-sm font-bold text-white">{guest.name || "—"}</p>
                          </div>
                          <span className={`text-[0.5rem] font-bold uppercase tracking-widest mr-2 ${guest.type === "child" ? "text-cyan-400/60" : "text-white/20"}`}>
                            {guest.type === "child" ? "Child" : "Adult"}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-white/30 transition-transform ${openPanel === i ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                        {openPanel === i && (
                          <div className="px-4 pb-4 pt-3 space-y-2.5 bg-white/[0.01]">
                            {/* Adult / Child Toggle */}
                            <div className="flex gap-2 mb-1">
                              <button type="button" onClick={() => updateGuest(i, "type", "adult")}
                                className={`flex-1 py-2 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                  guest.type === "adult" ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30" : "bg-white/[0.03] text-white/25 border border-white/5 hover:text-white/40"
                                }`}>👤 Adult</button>
                              <button type="button" onClick={() => updateGuest(i, "type", "child")}
                                className={`flex-1 py-2 rounded-lg text-[0.65rem] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                  guest.type === "child" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "bg-white/[0.03] text-white/25 border border-white/5 hover:text-white/40"
                                }`}>🧒 Child</button>
                            </div>
                            <input type="text" required placeholder={guest.type === "child" ? "Child's Name" : "Guest Name"} value={guest.name} onChange={e => updateGuest(i, "name", e.target.value)}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                            {guest.type === "child" && (
                              <select value={guest.age} onChange={e => updateGuest(i, "age", e.target.value)} required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none transition-colors appearance-none cursor-pointer">
                                <option value="" disabled>Child&apos;s Age</option>
                                {Array.from({ length: 18 }, (_, n) => (
                                  <option key={n} value={String(n)} className="bg-[#0d0d14] text-white">{n === 0 ? "Under 1" : `${n} year${n > 1 ? "s" : ""} old`}</option>
                                ))}
                              </select>
                            )}
                            {guest.type === "adult" && (
                              <>
                                <input type="email" required placeholder="Email" value={guest.email} onChange={e => updateGuest(i, "email", e.target.value)}
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                                <input type="tel" required placeholder="Phone" value={guest.phone} onChange={e => updateGuest(i, "phone", e.target.value)}
                                  className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors" />
                              </>
                            )}
                            <button type="button" onClick={() => removeGuest(i)}
                              className="text-[0.6rem] text-red-400/40 hover:text-red-400 font-bold uppercase tracking-widest transition-colors cursor-pointer">Remove Guest</button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Guest Button */}
                    <button type="button" onClick={addGuest}
                      className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest text-white/20 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition-colors cursor-pointer">
                      + Add a Guest
                    </button>
                  </div>
                  <textarea placeholder="Anything else? (optional)" value={formData.notes} onChange={e => setFormData(f => ({...f, notes: e.target.value}))} rows={2}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-[var(--color-accent)] focus:outline-none transition-colors resize-none" />
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={formData.anonymous} onChange={e => setFormData(f => ({...f, anonymous: e.target.checked}))}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[var(--color-accent)] cursor-pointer" />
                    <span className="text-[0.75rem] text-white/40 group-hover:text-white/60 transition-colors">Keep my name anonymous on the public list</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={formData.joinCommunity} onChange={e => setFormData(f => ({...f, joinCommunity: e.target.checked}))}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 accent-cyan-400 cursor-pointer" />
                    <div className="flex-1">
                      <p className="text-[0.75rem] text-white/60 group-hover:text-white transition-colors font-bold">Join the 7th Heaven Cruise Community</p>
                      <p className="text-[0.6rem] text-white/30">Get early access to deck plans, song polls, and group chat.</p>
                    </div>
                  </label>
                  {/* Honeypot */}
                  <div className="hidden" aria-hidden="true">
                    <input type="text" name="website" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} tabIndex={-1} autoComplete="off" />
                  </div>
                  <button type="submit" disabled={signupStatus === "submitting"}
                    className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(133,29,239,0.3)] disabled:opacity-70 cursor-pointer">
                    {signupStatus === "submitting" ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : "Count Me In"}
                  </button>
                  <p className="text-[0.6rem] text-white/25 text-center leading-relaxed">
                    By signing up you agree to our <a href="/privacy" className="text-white/40 underline hover:text-white/60 transition-colors">Privacy Policy</a> and <a href="/terms" className="text-white/40 underline hover:text-white/60 transition-colors">Terms of Service</a>. You'll receive a confirmation email. You can cancel anytime.
                  </p>
                  {signupStatus === "error" && <p className="text-rose-400 text-xs text-center">Something went wrong. Try again.</p>}
                </form>
              )}
            </div>
            {/* Counter */}
            <div className="flex flex-col justify-center">
              <p className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-[var(--color-accent)] mb-4">Fan Interest Tracker</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{signupCount}</p>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Fans</p>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{totalGuests}</p>
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/25 mt-1">Total Guests</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <p className="text-[0.55rem] text-white/30 font-bold uppercase tracking-widest mb-2">How it works</p>
                <div className="space-y-2">
                  {["Sign up free — tell us your group size", "We negotiate the rate with cruise management", "You get first access at the locked-in price"].map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center text-[0.5rem] font-black text-[var(--color-accent)] shrink-0">{i+1}</span>
                      <p className="text-[0.75rem] text-white/40">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Who's Joined */}
              {joinedFans.length > 0 && (
                <div className="mt-6 p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                  <p className="text-[0.55rem] text-white/30 font-bold uppercase tracking-widest mb-4">Who&apos;s Joined</p>
                  
                  {/* Avatar Stack */}
                  <div className="flex items-center mb-4">
                    <div className="flex -space-x-2">
                      {joinedFans.slice(0, 8).map((fan, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white border-2 border-[#0d0d14] shrink-0 relative z-[1] hover:z-10 hover:scale-110 transition-transform cursor-default"
                          style={{ backgroundColor: fan.anonymous ? '#374151' : AVATAR_COLORS[i % AVATAR_COLORS.length], zIndex: 8 - i }}
                          title={fan.anonymous ? 'Anonymous Fan' : fan.name}
                        >
                          {fan.anonymous ? '?' : fan.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {joinedFans.length > 8 && (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white/60 bg-white/10 border-2 border-[#0d0d14] shrink-0">
                          +{joinedFans.length - 8}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Names List */}
                  <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                    {joinedFans.map((fan, i) => (
                      <span key={i} className="text-[0.7rem] text-white/40">
                        {fan.anonymous ? 'Anonymous' : fan.name.split(' ')[0]}
                        {fan.guest_count > 1 && <span className="text-white/20"> +{fan.guest_count - 1}</span>}
                        {i < joinedFans.length - 1 && <span className="text-white/15 mx-0.5">·</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── ITINERARY TIMELINE (Layout N style) ── */}
      <section className="mb-20">
        <div className="site-container mb-10 text-center">
          <h2 className="text-3xl font-black uppercase italic tracking-tight" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
            Day-by-Day <span className="accent-gradient-text">Schedule</span>
          </h2>
          <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
            {[{dot:"bg-[var(--color-accent)]",label:"Band"},{dot:"bg-cyan-400",label:"Excursion"},{dot:"bg-emerald-400",label:"Food"},{dot:"bg-white/25",label:"Ship"}].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/30">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        {ITINERARY.map((day, i) => (
          <div key={day.day} className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} min-h-[480px] overflow-hidden`}>
            {/* Photo */}
            <div className="relative lg:w-[42%] h-56 lg:h-auto overflow-hidden">
              <img src={day.photo} alt={day.port} className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-700" />
              <div className={`absolute inset-0 bg-gradient-to-${i % 2 === 0 ? "r" : "l"} from-transparent via-black/30 to-[var(--color-bg-primary)]`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent lg:hidden" />
              <div className="absolute top-5 left-5 bg-black/65 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10">
                <span className={`text-[0.45rem] font-black uppercase tracking-[0.3em] ${ITIN_TYPE_ACCENT[day.type]} block`}>Day {day.day}</span>
                <span className="text-2xl leading-none">{day.icon}</span>
              </div>
            </div>
            {/* Schedule */}
            <div className="flex-1 flex items-stretch px-8 lg:px-14 py-10">
              <div className="w-full max-w-xl mx-auto lg:mx-0">
                <div className="mb-6 pb-5 border-b border-white/[0.06]">
                  <span className={`text-[0.45rem] font-black uppercase tracking-[0.3em] ${ITIN_TYPE_ACCENT[day.type]}`}>{day.label}</span>
                  <h3 className="text-[clamp(1.6rem,4vw,2.5rem)] font-black italic uppercase text-white leading-none mt-0.5" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{day.port}</h3>
                </div>
                <div className="relative space-y-0">
                  <div className={`absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b ${ITIN_TYPE_BAR[day.type]} opacity-20`} />
                  {day.schedule.map((item, si) => (
                    <div key={si} className="relative flex items-start gap-4 pb-4 last:pb-0">
                      <div className={`shrink-0 w-4 h-4 rounded-full border-2 border-[var(--color-bg-primary)] mt-0.5 z-10 ${ITIN_CAT_DOT[item.cat]}`} />
                      <span className="shrink-0 text-[0.5rem] font-black text-white/20 w-16 pt-1 tabular-nums">{item.time}</span>
                      <span className={`text-sm leading-snug pt-0.5 ${ITIN_CAT_TEXT[item.cat]}`}>{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="site-container mb-20">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-8 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          What&apos;s <span className="accent-gradient-text">Included</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🎸", title: "Multiple Live Shows", desc: "Acoustic sets, full-band concerts, and exclusive jam sessions throughout the cruise." },
            { icon: "🤝", title: "Meet & Greet", desc: "Hang with the band in small groups. Photos, conversations, and fan-only moments." },
            { icon: "🍽️", title: "All Meals Included", desc: "Main dining, buffets, and room service included in your cabin rate." },
            { icon: "🏝️", title: "3 Island Stops", desc: "Cozumel, Grand Cayman, and Roatán with optional group excursions." },
            { icon: "🎉", title: "Exclusive Events", desc: "Sail-away party, sunset deck sessions, and a grand finale after-party." },
            { icon: "💰", title: "Group Rate Pricing", desc: "The more fans who sign up, the better the deal we negotiate for everyone." },
          ].map(item => (
            <div key={item.title} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-[var(--color-accent)]/30 transition-colors">
              <span className="text-2xl block mb-3">{item.icon}</span>
              <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
              <p className="text-[0.75rem] text-white/35 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="site-container mb-16 pb-16">
        <h2 className="text-3xl font-black uppercase italic tracking-tight mb-8 text-center" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
          Questions? <span className="accent-gradient-text">Answers.</span>
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer">
                <span className="font-bold text-[0.9rem] text-white pr-4">{faq.q}</span>
                <span className={`text-white/30 text-lg transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-[0.85rem] text-white/40 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CRUISE COMMUNITY CTA ── */}
      <section className="site-container mb-16 pb-16">
        <div className="relative p-10 md:p-16 rounded-[2.5rem] overflow-hidden text-center bg-[#0d0d14] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
          <div className="absolute inset-0 opacity-10">
            <img src="/images/cruise-hero.png" alt="" className="w-full h-full object-cover grayscale" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-[#0d0d14]/40 to-transparent" />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[0.6rem] font-bold uppercase tracking-widest mb-6">Authenticated Experience</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight mb-4" style={{ fontFamily: "var(--font-barlow-condensed)" }}>
              The Cruise <span className="text-cyan-400">Community</span>
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto mb-10 leading-relaxed">
              Don&apos;t just book — belong. Join the private hub for cruise attendees to vote on setlists, view deck maps, and meet other fans before we set sail.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#signup" className="px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#0d0d14] font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20">Join the Community</a>
              <a href="/fans" className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-sm rounded-xl border border-white/10 transition-all">Go to Fan Hub</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
