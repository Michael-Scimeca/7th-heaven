/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */
import Image from 'next/image';

import { useState, useEffect, useCallback } from "react";
import { useMember } from "@/context/MemberContext";
import { formatPhoneDisplay } from "@/lib/validation";
import { SquishyToggle } from "@/components/SquishyToggle";

// --- COUNTDOWN TICKER ---
export function EmbarkationCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Mock target date: 6 months from now
    const target = new Date();
    target.setMonth(target.getMonth() + 6);
    target.setHours(15, 0, 0, 0);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-6 bg-transparent border-none px-2 pt-4 pb-2 relative overflow-visible">
      <div className="flex items-center shrink-0 z-10">
        <div>
          <h2 className="text-white font-black italic tracking-wide text-xl leading-normal py-0.5">Embarkation</h2>
          <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Port of Miami</p>
        </div>
      </div>

      <div className="flex items-center gap-4 z-10">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-center">
            <div className="min-w-[48px] flex items-center justify-center">
              <span className="text-white font-mono font-black text-2xl md:text-3xl leading-none text-center">
                {value.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-widest mt-1 drop-shadow-sm">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


// --- DAILY POLL ---
const POLL_OPTIONS = [
  { id: 1, text: "7th Heaven's Greatest Hits", votes: 45 },
  { id: 2, text: "80s Rock Anthems Cover Set", votes: 82 },
  { id: 3, text: "Acoustic Sunset Session", votes: 28 },
];

export function DailyPoll() {
  const [voted, setVoted] = useState<number | null>(null);

  const totalVotes = POLL_OPTIONS.reduce((acc, opt) => acc + opt.votes, 0) + (voted !== null ? 1 : 0);

  return (
    <div className="bg-[var(--color-bg-surface)] border  border-[var(--color-accent)]/30 p-8 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <span className="text-8xl">🗳️</span>
      </div>

      <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-2">Community Poll</h2>
      <p className="text-white font-bold text-lg mb-6 relative z-10">What should the theme be for the Lido Deck Sailaway Party?</p>

      <div className="space-y-3 relative z-10">
        {POLL_OPTIONS.map((opt) => {
          const optVotes = opt.votes + (voted === opt.id ? 1 : 0);
          const percent = Math.round((optVotes / totalVotes) * 100);
          const isWinner = percent === Math.max(...POLL_OPTIONS.map(o => Math.round(((o.votes + (voted === o.id ? 1 : 0)) / totalVotes) * 100)));

          return (
            <button aria-label="Action button"
              key={opt.id}
              onClick={() => !voted && setVoted(opt.id)}
              disabled={voted !== null}
              className={`w-full relative overflow-hidden  border text-left transition-colors ${voted === opt.id
                ? 'border-emerald-500 bg-emerald-500/10'
                : voted !== null
                  ? 'border-white/5 bg-white/5 cursor-default'
                  : 'border-white/10 bg-black/40 hover:border-emerald-500/40 hover:bg-white/5 cursor-pointer'
                }`}
            >
              {/* Progress bar background (only shows after voting) */}
              {voted !== null && (
                <div
                  className={`absolute top-0 left-0 bottom-0 transition-colors duration-1000 ease-out ${isWinner ? 'bg-emerald-500/20' : 'bg-white/5'}`}
                  style={{ width: `${percent}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between p-4">
                <span className={`text-sm font-medium ${voted === opt.id ? 'text-emerald-400' : 'text-white/80'}`}>
                  {opt.text}
                </span>
                {voted !== null && (
                  <span className={`text-xs font-bold ${isWinner ? 'text-emerald-400' : 'text-white/40'}`}>
                    {percent}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-white/30 uppercase tracking-widest mt-5 font-bold">
        {totalVotes} Total Votes • Poll closes in 24h
      </p>
    </div>
  );
}

// --- ORIGINS MAP WIDGET ---
const ORIGIN_STATS = [
  { location: 'Illinois', count: 145 },
  { location: 'Florida', count: 42 },
  { location: 'Texas', count: 28 },
  { location: 'Canada', count: 12 },
  { location: 'Other', count: 185 },
];

export function OriginStats() {
  const maxCount = Math.max(...ORIGIN_STATS.map(s => s.count));

  return (
    <div className="bg-[var(--color-bg-surface)] border border-white/5 p-6 relative overflow-hidden group">
      <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-5">Where Fans Are Sailing From</h2>

      <div className="space-y-4">
        {ORIGIN_STATS.map((stat, i) => (
          <div key={stat.location}>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5">
              <span className="text-white/70">{stat.location}</span>
              <span className=" text-[var(--color-accent)]">{stat.count} fans</span>
            </div>
            <div className="w-full h-1.5   rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-accent)] to-cyan-500 rounded-full opacity-80 group-hover:opacity-100 transition-colors duration-1000 delay-100"
                style={{ width: `${(stat.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- PHOTO WALL ---
const MOCK_PHOTOS = [
  '/images/galleries/live_show_1.jpg',
  '/images/galleries/live_show_2.jpg',
  '/images/galleries/live_show_3.jpg',
  '/images/galleries/live_show_4.jpg',
  '/images/galleries/live_show_5.jpg',
  '/images/galleries/live_show_6.jpg',
];

export function PhotoWall() {

  return (
    <div className="mt-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-xl font-black italic tracking-wide text-white uppercase mb-1">Fan Pre-Cruise Photo Wall</h2>
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Share your prep and packing photos!</p>
        </div>
        <button aria-label="Action button" className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-colors uppercase tracking-widest">
          + Upload
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {MOCK_PHOTOS.map((src, i) => (
          <div
            key={i}
            className="aspect-square bg-white/5 border border-white/10 overflow-hidden group cursor-pointer relative"
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-colors z-10 flex items-center justify-center backdrop-blur-[2px]">
              <span className="text-white text-2xl">📸</span>
            </div>
            <div
              className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
              style={{ backgroundImage: `url(${src})` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// --- BOOKING MANAGER ---
export function BookingManager({ email }: { email?: string }) {
  const { member } = useMember();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ guest_count: 1, phone: '', anonymous: false, guests: [] as any[] });
  const [saveStatus, setSaveStatus] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Quick Register form state
  const [registering, setRegistering] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regPartySize, setRegPartySize] = useState(2);
  const [regCabinPref, setRegCabinPref] = useState('group_d4');
  const [regError, setRegError] = useState('');

  const fetchBooking = useCallback(async () => {
    const effectiveEmail = email || member?.email || 'cruise@7thheaven.com';

    const defaultBooking = {
      name: member?.name || (email ? email.split('@')[0].replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Cruise Member'),
      email: effectiveEmail,
      guest_count: 2,
      phone: '(555) 019-9283',
      anonymous: false,
      cabin_preference: 'Ocean View Balcony (Cabin 9122)',
      cabin_deck: 'Deck 9 · Midship',
      cabin_image: '/images/cruise/d1_ocean_view_balcony.jpg',
      total_fare: '$1,550.00',
      amount_paid: '$1,200.00',
      balance_due: '$350.00',
      guests: [
        { name: 'Sarah Connor', type: 'adult' }
      ]
    };

    if (effectiveEmail === 'demo@7thheavenband.com' || effectiveEmail === 'cruise@7thheaven.com' || effectiveEmail.includes('cruise')) {
      setBooking(defaultBooking);
      setFormData({
        guest_count: 2,
        phone: '(555) 019-9283',
        anonymous: false,
        guests: [{ name: 'Sarah Connor', type: 'adult' }]
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/cruise/booking?email=${encodeURIComponent(effectiveEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          let cabinPref = data.booking.cabin_preference || 'Ocean View Balcony (Cabin 9122)';
          let cabinImg = '/images/cruise/d1_ocean_view_balcony.jpg';
          if (data.booking.notes) {
            const notesLower = data.booking.notes.toLowerCase();
            const matches = data.booking.notes.match(/Cabin Preference:\s*(.*)/i) || data.booking.notes.match(/Cabin:\s*(.*)/i);
            if (matches && matches[1]) {
              cabinPref = matches[1].split('\n')[0].trim();
            }
            if (notesLower.includes('group_n5') || notesLower.includes('ocean view')) {
              cabinImg = '/images/cruise/n5.jpg';
            } else if (notesLower.includes('group_if') || notesLower.includes('central park')) {
              cabinImg = '/images/cruise/if.jpg';
            } else if (notesLower.includes('group_d4') || notesLower.includes('group_d2') || notesLower.includes('balcony')) {
              cabinImg = '/images/cruise/d1_ocean_view_balcony.jpg';
            } else if (notesLower.includes('group_i1') || notesLower.includes('infinite ocean balcony')) {
              cabinImg = '/images/cruise/i1_infinite_ocean_view_balcony.jpg';
            } else if (notesLower.includes('group_jy') || notesLower.includes('suite')) {
              cabinImg = '/images/cruise/jy.png';
            }
          }

          const amountPaid = data.booking.full_paid ? "$1,550.00" : (data.booking.deposit_paid ? "$500.00" : "$1,200.00");
          const balanceDue = data.booking.full_paid ? "$0.00" : (data.booking.deposit_paid ? "$1,050.00" : "$350.00");

          setBooking({
            ...data.booking,
            name: data.booking.name || member?.name || 'Cruise Guest',
            cabin_preference: cabinPref,
            cabin_image: cabinImg,
            total_fare: data.booking.total_fare || "$1,550.00",
            amount_paid: amountPaid,
            balance_due: balanceDue
          });

          setFormData({
            guest_count: data.booking.guest_count || 2,
            phone: data.booking.phone || '(555) 019-9283',
            anonymous: data.booking.anonymous || false,
            guests: data.booking.guests || [{ name: 'Sarah Connor', type: 'adult' }]
          });
        } else {
          setBooking(defaultBooking);
          setFormData({
            guest_count: 2,
            phone: '(555) 019-9283',
            anonymous: false,
            guests: [{ name: 'Sarah Connor', type: 'adult' }]
          });
        }
      }
    } catch {
      setBooking(defaultBooking);
    } finally {
      setLoading(false);
    }
  }, [email, member]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleSave = async () => {
    setSaveStatus('Saving...');
    try {
      if (email === 'demo@7thheavenband.com') {
        setBooking((prev: any) => ({
          ...prev,
          guest_count: formData.guest_count,
          phone: formData.phone,
          anonymous: formData.anonymous,
          guests: formData.guests
        }));
        setIsEditing(false);
        setSaveStatus('');
        return;
      }

      const res = await fetch('/api/cruise/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ...formData })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Parse cabin preference and set matching image
          let cabinPref = 'Ocean View Balcony';
          let cabinImg = '/images/cruise/d1_ocean_view_balcony.jpg';
          if (data.booking.notes) {
            const notesLower = data.booking.notes.toLowerCase();
            const matches = data.booking.notes.match(/Cabin Preference:\s*(.*)/i) || data.booking.notes.match(/Cabin:\s*(.*)/i);
            if (matches && matches[1]) {
              cabinPref = matches[1].split('\n')[0].trim();
            }
            if (notesLower.includes('group_n5') || notesLower.includes('ocean view')) {
              cabinImg = '/images/cruise/n5.jpg';
            } else if (notesLower.includes('group_if') || notesLower.includes('central park')) {
              cabinImg = '/images/cruise/if.jpg';
            } else if (notesLower.includes('group_d4') || notesLower.includes('group_d2') || notesLower.includes('balcony')) {
              cabinImg = '/images/cruise/d1_ocean_view_balcony.jpg';
            } else if (notesLower.includes('group_i1') || notesLower.includes('infinite ocean balcony')) {
              cabinImg = '/images/cruise/i1_infinite_ocean_view_balcony.jpg';
            } else if (notesLower.includes('group_jy') || notesLower.includes('suite')) {
              cabinImg = '/images/cruise/jy.png';
            }
          }

          const amountPaid = data.booking.full_paid ? "$1,550.00" : (data.booking.deposit_paid ? "$500.00" : "$0.00");
          const balanceDue = data.booking.full_paid ? "$0.00" : (data.booking.deposit_paid ? "$1,050.00" : "$1,550.00");

          setBooking({
            ...data.booking,
            cabin_preference: cabinPref,
            cabin_image: cabinImg,
            amount_paid: amountPaid,
            balance_due: balanceDue
          });
          setIsEditing(false);
          setSaveStatus('');
        } else {
          setSaveStatus('Error saving');
        }
      }
    } catch {
      setSaveStatus('Error saving');
    }
  };

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone) {
      setRegError('Phone number is required.');
      return;
    }
    setRegistering(true);
    setRegError('');
    try {
      const res = await fetch('/api/cruise/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: member?.name || 'Cruise Fan',
          email: email,
          phone: regPhone,
          guest_count: regPartySize,
          cabinPreference: regCabinPref,
          joinCommunity: false, // already a community member
          website: ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        const bookRes = await fetch(`/api/cruise/booking?email=${encodeURIComponent(email || '')}`);
        if (bookRes.ok) {
          const bookData = await bookRes.json();
          if (bookData.success) {
            setBooking(bookData.booking);
            setFormData({
              guest_count: bookData.booking.guest_count || 1,
              phone: bookData.booking.phone || '',
              anonymous: bookData.booking.anonymous || false,
              guests: bookData.booking.guests || []
            });
          }
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setRegError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setRegError('An error occurred during registration.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-accent)]/20 p-8 animate-pulse h-32 flex items-center justify-center">
      <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Loading Priority Status...</span>
    </div>
  );

  if (!booking) return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-accent)]/20 p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <span className="text-8xl">🚢</span>
      </div>
      <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Cruise Registration</h2>
      <p className="text-white/60 text-sm mb-6">You haven't registered for the cruise priority list yet. Complete the quick form below to sign up instantly using your member account.</p>

      <form onSubmit={handleQuickRegister} className="space-y-4 relative z-10  p-4 border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="block text-[var(--font-size-4xs)] font-bold text-white/40 uppercase tracking-widest mb-1">Full Name</span>
            <input aria-label="Input field" type="text" readOnly value={member?.name || ''} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/50 outline-none cursor-not-allowed" />
          </div>
          <div>
            <span className="block text-[var(--font-size-4xs)] font-bold text-white/40 uppercase tracking-widest mb-1">Email Address</span>
            <input aria-label="Input field" type="text" readOnly value={email || ''} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/50 outline-none cursor-not-allowed" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="cruise-reg-phone" className="block text-[var(--font-size-4xs)] font-bold text-white/40 uppercase tracking-widest mb-1">Phone Number *</label>
            <div className="input-glow-border rounded-lg">
              <input aria-label="Input field" id="cruise-reg-phone" type="tel" required placeholder="(555) 123-4567" value={regPhone} onChange={e => setRegPhone(formatPhoneDisplay(e.target.value))} className="w-full bg-[var(--color-bg-card)] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label htmlFor="cruise-reg-party-size" className="block text-[var(--font-size-4xs)] font-bold text-white/40 uppercase tracking-widest mb-1">Party Size *</label>
            <div className="input-glow-border rounded-lg">
              <input aria-label="Input field" id="cruise-reg-party-size" type="number" required min={1} max={10} value={regPartySize} onChange={e => setRegPartySize(parseInt(e.target.value) || 1)} className="w-full bg-[var(--color-bg-card)] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors" />
            </div>
          </div>
          <div>
            <label htmlFor="cruise-reg-cabin-pref" className="block text-[var(--font-size-4xs)] font-bold text-white/40 uppercase tracking-widest mb-1">Cabin Preference *</label>
            <div className="input-glow-border rounded-lg">
              <select aria-label="Select option" id="cruise-reg-cabin-pref" value={regCabinPref} onChange={e => setRegCabinPref(e.target.value)} className="w-full bg-[var(--color-bg-card)] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors cursor-pointer">
                <option value="group_n5">Ocean View</option>
                <option value="group_if">Infinite Central Park</option>
                <option value="group_d4">Ocean View Balcony</option>
                <option value="group_d2">Ocean View Balcony D2</option>
                <option value="group_i1">Infinite Ocean View Balcony</option>
              </select>
            </div>
          </div>
        </div>

        {regError && <p className="text-rose-400 text-xs mt-1">{regError}</p>}

        <button aria-label="Action button" type="submit" disabled={registering} className="w-full mt-2 py-2.5 bg-linear-to-r from-[#6917BF] via-[#8c0eaf] to-[#6F008E] hover:brightness-110 text-white font-black tracking-wider text-xs rounded-lg transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
          {registering ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Complete Cruise Registration"}
        </button>
      </form>
    </div>
  );

  return (
    <div className="text-white relative overflow-hidden flex flex-col justify-between">
      {/* Travel Readiness Checklist Badges */}
      <div className="my-3">
        <span className="text-[var(--font-size-3xs)] font-bold text-white/50 uppercase tracking-widest block mb-2">Travel Readiness Checklist</span>
        <div className="grid grid-cols-2 gap-2 text-[var(--font-size-2xs)]">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
            <span>✓</span> Passport Verified
          </div>
          <div className="flex items-center gap-1.5  text-[var(--color-accent)] font-bold bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-2 py-1 rounded">
            <span>🎸</span> Band VIP Pass Included
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300 font-medium border border-cyan-500/20 px-2 py-1 rounded">
            <span>📅</span> Check-in: 45 Days Prior
          </div>
          <div className="flex items-center gap-1.5 text-[var(--color-accent)] font-medium bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
            <span>🏷️</span> Luggage Tags: Dec 1st
          </div>
        </div>
      </div>

      {/* Payment Breakdown: Total Fare, Paid & Owed */}
      <div className="space-y-2.5 my-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-white/50 uppercase tracking-wider">Total Cruise Fare</span>
          <span className="font-bold text-white">{booking.total_fare || "$1,550.00"}</span>
        </div>
        <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
          <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <span>✓</span> Amount Paid
          </span>
          <span className="text-emerald-400 font-extrabold">{booking.amount_paid || "$1,200.00"}</span>
        </div>
        <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
          <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <span>⏳</span> Balance Owed
          </span>
          <div className="flex items-center gap-2">
            <span className="text-rose-400 font-black text-sm">{booking.balance_due || "$350.00"}</span>
            {parseFloat((booking.balance_due || "$350.00").replace(/[^0-9.]/g, '')) > 0 && (
              <button aria-label="Action button"
                onClick={() => setIsPayModalOpen(true)}
                className="text-[var(--font-size-3xs)] font-black uppercase tracking-wider text-white bg-rose-500 hover:bg-rose-400 transition-colors px-2.5 py-1 rounded shadow cursor-pointer"
              >
                💳 Pay Balance
              </button>
            )}
          </div>
        </div>
      </div>

      {booking.guests && booking.guests.length > 0 && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Guest List</h3>
          <div className="space-y-1.5">
            {booking.guests.map((g: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span className="text-white font-medium">{g.name || `Guest ${i + 2}`}</span>
                <span className="text-white/40">{g.type === 'child' ? `Child ${g.age ? `(Age ${g.age})` : ''}` : 'Adult'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Clickable Cruise Agent Email Buttons */}
      <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
        <span className="text-[var(--font-size-3xs)] font-bold text-white/40 uppercase tracking-widest block mb-2">Get in Touch with Cruise Agents</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Button 1: Cruise Admin Agent */}
          <a
            href={`mailto:cruise@7thheavenband.com?subject=${encodeURIComponent(
              `7th Heaven Cruise Inquiry - ${booking.cabin_preference || 'Cabin 9122'} (${booking.name || 'Passenger'})`
            )}&body=${encodeURIComponent(
              `Hi 7th Heaven Cruise Admin,\n\nI have a question regarding my cruise booking for ${booking.name || 'Cruise Guest'} (${booking.cabin_preference || 'Cabin 9122'}):\n\n[Write your question here]\n\nThank you,\n${booking.name || 'Cruise Guest'}`
            )}`}
            className="flex flex-col items-center justify-center gap-0.5 py-3 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer text-center"
          >
            <div className="flex items-center gap-1.5 font-black">
              <span>✉️</span> Cruise Admin
            </div>
            <span className="text-[var(--font-size-4xs)] font-mono font-normal text-cyan-200 lowercase tracking-normal">cruise@7thheavenband.com</span>
          </a>

          {/* Button 2: Support & Booking Agent (Mary - NTD Vacations) */}
          <a
            href={`mailto:mary@ntdvacations.com?subject=${encodeURIComponent(
              `7th Heaven Cruise Support - ${booking.name || 'Passenger'} (${booking.cabin_preference || 'Cabin 9122'})`
            )}&body=${encodeURIComponent(
              `Hi Mary / Cruise Agent,\n\nI have a question regarding my cruise booking:\n\n[Write your question here]\n\nThank you,\n${booking.name || 'Cruise Guest'}`
            )}`}
            className="flex flex-col items-center justify-center gap-0.5 py-3 px-3 bg-[var(--color-accent)] hover:bg-[#851de7] text-white font-black text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer text-center"
          >
            <div className="flex items-center gap-1.5 font-black">
              <span>✉️</span> Support Agent (Mary)
            </div>
            <span className="text-[var(--font-size-4xs)] font-mono font-normal text-white/80 lowercase tracking-normal">mary@ntdvacations.com</span>
          </a>
        </div>
      </div>

      {/* Cruising Power Travel Agent Portal Hook */}
      <div className="mt-4 pt-4 border-t border-white/10 text-[10.5px] leading-relaxed relative z-10 text-white/60 text-left">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm">🚢</span>
          <span className="font-extrabold uppercase tracking-wider text-cyan-400">Cruising Power Integration</span>
        </div>
        <p>
          Are you booking through a travel agent? Agents can log into Royal Caribbean Group&apos;s official <a href="https://www.cruisingpower.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-white hover:text-cyan-300">Cruising Power Portal</a> to register and link your booking details to the 7th Heaven group code.
        </p>
      </div>

      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        balanceDue={booking.balance_due}
        email={email}
        onSuccess={() => {
          setBooking((prev: any) => {
            if (!prev) return prev;
            const prevPaid = parseFloat(prev.amount_paid?.replace(/[^0-9.]/g, '') || '0') || 0;
            const prevDue = parseFloat(prev.balance_due?.replace(/[^0-9.]/g, '') || '0') || 0;
            const total = prevPaid + prevDue;
            const formattedTotal = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            return {
              ...prev,
              amount_paid: formattedTotal,
              balance_due: '$0.00'
            };
          });
        }}
      />
    </div>
  );
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  balanceDue: string;
  email?: string;
  onSuccess: () => void;
}

function PaymentModal({ isOpen, onClose, balanceDue, email, onSuccess }: PaymentModalProps) {
  const [tab, setTab] = useState<'saved' | 'new'>('saved');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // New card inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').substring(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.substring(0, 2)}/${digits.substring(2, 4)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  const handleCVCChange = (val: string) => {
    setCardCVC(val.replace(/\D/g, '').substring(0, 3));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'new') {
      if (!cardName.trim()) {
        setError('Cardholder Name is required.');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setError('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCVC.length < 3) {
        setError('Please enter a valid 3-digit CVC.');
        return;
      }
    }

    setProcessing(true);

    setTimeout(async () => {
      try {
        if (email && email !== 'demo@7thheavenband.com') {
          await fetch('/api/cruise/booking', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, full_paid: true })
          });
        }
        setProcessing(false);
        setSuccess(true);
        onSuccess();
      } catch (err) {
        setProcessing(false);
        setError('Payment gateway error. Please try again.');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-colors border-0"
        aria-label="Close modal background"
        onClick={processing || success ? undefined : onClose}
      />

      <div className="relative w-full max-w-md bg-[var(--color-bg-surface)] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden transition-colors duration-300 text-left">
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-[var(--color-accent)] mx-auto text-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              ✓
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest text-white">Payment Successful</h3>
            <p className="text-white/60 text-xs leading-relaxed">
              Your final payment of <strong className="text-emerald-400">{balanceDue}</strong> has been processed securely. Your booking is now fully paid!
            </p>
            <button aria-label="Close"
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-widest transition-colors cursor-pointer shadow-emerald-500/15"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Final Payment</h3>
                <p className="text-[var(--font-size-3xs)] text-white/40 uppercase tracking-wider mt-0.5">Pay remaining balance due</p>
              </div>
              <div className="text-right">
                <span className="text-rose-400 font-black text-lg">{balanceDue}</span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{error}</p>
            )}

            {processing ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-purple-400uppercase tracking-widest animate-pulse">Processing Secure Payment...</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2 p-1 bg-black/40 border border-white/5">
                  <button aria-label="Action button"
                    type="button"
                    onClick={() => { setTab('saved'); setError(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-[var(--font-size-3xs)] font-black uppercase tracking-wider transition-colors cursor-pointer ${tab === 'saved' ? '   border border-cyan-500/20 text-cyan-400' : 'text-white/40 border border-transparent'}`}
                  >
                    Use Saved Card
                  </button>
                  <button aria-label="Action button"
                    type="button"
                    onClick={() => { setTab('new'); setError(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-[var(--font-size-3xs)] font-black uppercase tracking-wider transition-colors cursor-pointer ${tab === 'new' ? '   border border-cyan-500/20 text-cyan-400' : 'text-white/40 border border-transparent'}`}
                  >
                    Use New Card
                  </button>
                </div>

                {tab === 'saved' ? (
                  <div className=" border border-white/5 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💳</span>
                        <div>
                          <strong className="block text-white text-xs font-bold tracking-wide">Visa ending in 4242</strong>
                          <span className="text-white/40 text-[var(--font-size-4xs)] uppercase tracking-wider">Expires 12/28 • Demo Cruiser</span>
                        </div>
                      </div>
                      <span className="text-[var(--font-size-4xs)] font-black text-purple-400uppercase tracking-wider border border-cyan-500/20 px-1.5 py-0.5 rounded bg-cyan-500/5">
                        Default
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cruise-card-name" className="block text-[var(--font-size-4xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                      <input aria-label="Input field"
                        id="cruise-card-name"
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        className="w-full bg-[var(--color-bg-card)] border border-white/10 px-3 py-2 text-xs text-white focus:border-cyan-400/50 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="cruise-card-number" className="block text-[var(--font-size-4xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">Card Number</label>
                      <div className="relative">
                        <input aria-label="Input field"
                          id="cruise-card-number"
                          type="text"
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={e => handleCardNumberChange(e.target.value)}
                          className="w-full bg-[var(--color-bg-card)] border border-white/10 pl-9 pr-3 py-2 text-xs text-white focus:border-cyan-400/50 outline-none transition-colors font-mono"
                        />
                        <span className="absolute left-3 top-2.5 text-white/40 text-xs">💳</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cruise-card-expiry" className="block text-[var(--font-size-4xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">Expiry Date</label>
                        <input aria-label="Input field"
                          id="cruise-card-expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={e => handleExpiryChange(e.target.value)}
                          className="w-full bg-[var(--color-bg-card)] border border-white/10 px-3 py-2 text-xs text-white focus:border-cyan-400/50 outline-none transition-colors font-mono"
                        />
                      </div>
                      <div>
                        <label htmlFor="cruise-card-cvc" className="block text-[var(--font-size-4xs)] font-bold text-white/40 uppercase tracking-widest mb-1.5">CVC</label>
                        <input aria-label="Input field"
                          id="cruise-card-cvc"
                          type="password"
                          placeholder="123"
                          value={cardCVC}
                          onChange={e => handleCVCChange(e.target.value)}
                          className="w-full bg-[var(--color-bg-card)] border border-white/10 px-3 py-2 text-xs text-white focus:border-cyan-400/50 outline-none transition-colors font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button aria-label="Close"
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button aria-label="Action button"
                    type="submit"
                    className="flex-1 py-2.5 bg-linear-to-r from-[#6917BF] via-[#8c0eaf] to-[#6F008E] hover:brightness-110 text-white text-xs font-black tracking-wider rounded-lg transition-all cursor-pointer shadow-lg shadow-purple-600/30"
                  >
                    Pay {balanceDue}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// --- IMPORTANT LINKS WIDGET ---
export function ImportantLinksWidget() {
  const [links, setLinks] = useState<{ title: string, url: string, icon: string }[]>([]);

  const loadLinks = useCallback(async () => {
    try {
      const res = await fetch(`/api/cruise/important-links?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.links && Array.isArray(data.links)) {
          setLinks(data.links);
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  if (links.length === 0) return null;

  return (
    <div className="bg-[var(--color-bg-glass,rgba(18,18,24,0.45))] backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <span className="text-8xl">🔗</span>
      </div>

      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-purple-400mb-1">Quick Access</h2>
          <p className="text-white font-bold text-lg">Important Links</p>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {links.map((link) => (
          <a
            key={link.url || link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/40 rounded-lg  transition-colors text-left group/item"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{link.icon || '🔗'}</span>
              <span className="text-sm font-medium text-white group-hover/item:text-cyan-300 transition-colors">
                {link.title}
              </span>
            </div>
            <span className=" text-[var(--color-accent)] opacity-0 group-hover/item:opacity-100 transition-opacity -translate-x-2 group-hover/item:translate-x-0 duration-300">
              →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// --- SONG REQUEST LEADERBOARD ---
export function SongRequestLeaderboard() {
  const [songs, setSongs] = useState([
    { id: 1, title: "Sing", votes: 412 },
    { id: 2, title: "Beautiful Life", votes: 385 },
    { id: 3, title: "Stoplight", votes: 290 },
    { id: 4, title: "Time of Our Lives", votes: 215 },
  ]);

  const handleVote = (id: number) => {
    setSongs(songs.map(song => song.id === id ? { ...song, votes: song.votes + 1 } : song).sort((a, b) => b.votes - a.votes));
  };

  return (
    <div className="bg-[var(--color-bg-surface)] border border-purple-500/20 p-6 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center  text-[var(--color-accent)] text-sm">🎸</div>
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-purple-300">Setlist Requests</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest mt-0.5">Top 3 get played on Lido Deck</p>
        </div>
      </div>

      <div className="space-y-4">
        {songs.map((song, i) => (
          <div key={song.id} className="flex items-center gap-4 group">
            <span className={`text-sm font-black w-4 text-center ${i < 3 ? ' text-[var(--color-accent)]' : 'text-white/20'}`}>
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="text-white/90 font-medium text-sm">{song.title}</div>
              <div className="text-white/30 text-xs">{song.votes} votes</div>
            </div>
            <button aria-label="Action button"
              onClick={() => handleVote(song.id)}
              className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-[var(--color-purple-glow)] hover:border-[var(--color-border-purple)] hover:text-[var(--color-purple-light)] transition-colors text-white/40"
            >
              ▲
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- CAPTAIN's LOG (AUDIO NOTES) ---
export function CaptainsLog() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 0;
        return p + 2;
      });
    }, 100);
    return () => clearInterval(t);
  }, [isPlaying]);

  // Stop playing when progress resets to 0 after completing
  useEffect(() => {
    if (progress === 0 && isPlaying) setIsPlaying(false);
  }, [progress, isPlaying]);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 shadow-xl relative">
      <h2 className="text-xs font-bold tracking-[0.2em] uppercase  text-[var(--color-accent)] mb-4">Captain's Log</h2>

      <div className="flex items-center gap-4 bg-black/40 p-4 border border-white/5">
        <button aria-label="Action button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shrink-0 hover:bg-[#851de7] hover:scale-105 transition-colors shadow-md"
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-white truncate">Rehearsal Update!</span>
            <span className="text-xs  text-[var(--color-accent)]/80 font-mono">0:42</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
            <div className="h-full bg-[var(--color-accent)] rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <p className="text-xs text-white/40 mt-3 italic text-center">
        "Hey everyone, Richard here! We are running through the 80s set right now..."
      </p>
    </div>
  );
}



// --- EXCURSION TEASERS ---
const EXCURSIONS = [
  { title: "Cozumel Snorkel & Sail", bandMember: "Richard", spots: 12 },
  { title: "Mayan Ruins Exploration", bandMember: "Michael", spots: 4 },
];

export function ExcursionTeasers() {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-cyan-500/20 p-6">
      <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-purple-400mb-5">Band Excursions</h2>

      <div className="space-y-3">
        {EXCURSIONS.map((ex, i) => (
          <div key={ex.title} className="p-3 bg-cyan-900/10 border border-cyan-500/10 hover:border-cyan-500/30 transition-colors flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white mb-0.5">{ex.title}</div>
              <div className="text-xs text-cyan-400/80 uppercase tracking-wider">Join {ex.bandMember}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-white">{ex.spots}</div>
              <div className="text-xs text-white/40 uppercase tracking-widest">Spots Left</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

