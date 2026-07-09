"use client";

import { useMember } from "@/context/MemberContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import CruiseChat from "@/components/CruiseChat";
import { EmbarkationCountdown, ImportantLinksWidget, BookingManager } from "@/components/CruiseWidgets";
import { createClient } from "@/lib/supabase/client";
import { formatPhoneDisplay } from "@/lib/validation";

function PassengersWidget() {
  const avatars = ['JD', 'SL', 'MT', 'AB', 'RC', 'KW'];
  const totalFans = 412;
  
  return (
    <div className="bg-[#0b0b12] border border-white/5 rounded-2xl p-6 mb-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent)]/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-accent)]/20 transition-all duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-end mb-5 relative z-10">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-1">Community</h2>
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-2xl italic tracking-wide">{totalFans}</span>
            <span className="text-[var(--color-accent)] font-bold uppercase tracking-widest text-xs">Cruise Members Onboard</span>
          </div>
        </div>
      </div>

      <div className="flex items-center relative z-10 mb-4">
        <div className="flex -space-x-3">
          {avatars.map((initials, i) => {
            const colors = ['bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-pink-500'];
            return (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0b0b12] ${colors[i % colors.length]} flex items-center justify-center overflow-hidden shadow-lg hover:-translate-y-1 transition-transform cursor-pointer relative z-[${10-i}]`}>
                <span className="text-xs font-black text-white/90 tracking-widest">{initials}</span>
              </div>
            );
          })}
          <div className="w-10 h-10 rounded-full border-2 border-[#0b0b12] bg-[var(--color-accent)]/20 flex items-center justify-center shadow-lg text-[var(--color-accent)] font-bold text-xs relative z-0">
            +{totalFans - avatars.length}
          </div>
        </div>
      </div>
      
      <p className="text-white/30 text-xs leading-relaxed relative z-10 border-t border-white/5 pt-4">
        Join the official 7th Heaven cruise community. See who else is sailing, coordinate shore excursions, and make new friends!
      </p>
    </div>
  );
}

export default function CruiseDashboard() {
  const { isLoggedIn, member, login, signup } = useMember();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const urlUsername = typeof params?.username === 'string' ? params.username : '';
  const isDemoMode = urlUsername === 'demo';

  useEffect(() => {
    if (isDemoMode) return;
    if (isLoggedIn && member?.username && member.username !== urlUsername) {
      router.push(`/cruise/${member.username}`);
    }
  }, [isLoggedIn, member, urlUsername, router, isDemoMode]);

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState('');

  type ItineraryEvent = { id: string; time: string; title: string; subtitle: string; };
  type ItineraryDay = { id: string; dayLabel: string; location: string; theme: string; events: ItineraryEvent[]; colorTheme: string; };
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  // Auth panel states
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const isDevBypass = typeof window !== 'undefined' && localStorage.getItem('7h_dev_bypass') === 'true';
  const showAuth = !isLoggedIn && !isDevBypass && !isDemoMode;
  const effectiveMember = isDemoMode ? {
    id: 'demo-cruise-001',
    name: 'Demo Cruiser',
    email: 'demo@7thheavenband.com',
    role: 'fan',
    signup_source: 'cruise_member_signup',
    username: 'demo',
    avatar: 'DC'
  } as any : member;
  const isAdmin = effectiveMember?.role === 'admin' || effectiveMember?.role === 'crew' || isDevBypass;

  useEffect(() => {
    // Only load data if user is logged in or dev bypass is active
    if (!showAuth) {
      // Load Cruise Itinerary
      fetch(`/api/cruise/itinerary?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          let actualData = data;
          let attempts = 0;
          while (typeof actualData === 'string' && attempts < 3) {
            try { actualData = JSON.parse(actualData); } catch(e) { break; }
            attempts++;
          }
          if (Array.isArray(actualData) && actualData.length > 0) {
            setItinerary(actualData);
          }
        })
        .catch(() => {});

      fetch(`/api/cruise/announcement?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          let actualData = data;
          let attempts = 0;
          while (typeof actualData === 'string' && attempts < 3) {
            try { actualData = JSON.parse(actualData); } catch(e) { break; }
            attempts++;
          }
          
          if (actualData?.message) {
            setAnnouncement(actualData.message);
            setAnnouncementInput(actualData.message);
          } else {
            setAnnouncement(null); // Ensure it clears if empty
            setAnnouncementInput('');
          }
        })
        .catch(() => {});
    }
  }, [showAuth]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Email and Password are required.');
      return;
    }
    setSubmitting(true);
    setAuthError('');
    try {
      const success = await login(email, password);
      if (!success) {
        setAuthError('Invalid email or password.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during log in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setAuthError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    setAuthError('');
    try {
      const res = await fetch('/api/cruise/register-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          name,
          email,
          phone,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Failed to submit registration request.');
      } else {
        setVerifyingPin(true);
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput) {
      setAuthError('PIN code is required.');
      return;
    }
    setSubmitting(true);
    setAuthError('');
    try {
      const res = await fetch('/api/cruise/register-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          email,
          pin: pinInput
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Verification failed.');
      } else {
        // Verification succeeded! Auto-login using the password they provided
        const success = await login(email, password);
        if (success) {
          setVerifyingPin(false);
          setPinInput('');
        } else {
          setAuthError('Verification successful, but automatic log in failed. Please sign in via the Log In tab.');
          setVerifyingPin(false);
          setAuthTab('login');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      const res = await fetch('/api/cruise/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: announcementInput })
      });
      if (res.ok) {
        setAnnouncement(announcementInput || null);
        setIsEditingAnnouncement(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoggedIn === undefined) return <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">Loading...</div>;

  if (showAuth) {
    return (
      <div className="min-h-screen bg-[#050508] text-white pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
        {/* Subtle space-like background elements */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--color-accent)]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-[fadeIn_0.3s_ease-out]">
          <div className="text-center mb-8">
            <span className="text-5xl block mb-4 animate-[bounce_2s_infinite]">🚢</span>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">Cruise Hub</h1>
            <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mt-1">Exclusive Passenger Community</p>
          </div>

          <div className="bg-[#0b0b12]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {verifyingPin ? (
              <div className="p-8 animate-[fadeIn_0.3s_ease-out]">
                <div className="text-center mb-6">
                  <span className="text-4xl block mb-3 animate-[pulse_1.5s_infinite]">🔑</span>
                  <h3 className="font-bold text-white text-lg uppercase tracking-wider mb-2">Verify Your Email</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    We've sent a 6-digit verification PIN to <strong className="text-cyan-400">{email}</strong>. Enter it below to activate your account.
                  </p>
                </div>

                <form onSubmit={handleVerifyPinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">6-Digit Verification PIN</label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      maxLength={6}
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#15151f] border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-black tracking-[0.3em] text-white focus:border-cyan-400/50 outline-none transition-all"
                    />
                  </div>

                  {authError && <p className="text-rose-400 text-xs mt-2 text-center">{authError}</p>}

                  <button type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    {submitting ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Verify PIN & Access Hub →"}
                  </button>

                  <div className="text-center mt-4">
                    <button type="button" onClick={() => { setVerifyingPin(false); setAuthError(''); }} className="text-white/40 hover:text-white/60 text-2xs font-bold uppercase tracking-widest transition-all cursor-pointer">
                      ← Cancel and Back
                    </button>
                  </div>
                </form>
              </div>
            ) : regSuccess ? (
              <div className="p-8 text-center animate-[fadeIn_0.3s_ease-out]">
                <span className="text-4xl block mb-4">📧</span>
                <h3 className="font-bold text-white text-lg uppercase tracking-wider mb-2">Check Your Email</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  We've sent a verification link to <strong className="text-white">{email}</strong>. Please check your inbox and click the link to activate your Cruise Hub account.
                </p>
                <button onClick={() => { setRegSuccess(false); setAuthTab('login'); }} className="w-full py-2.5 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                  Go to Log In
                </button>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-white/10">
                  <button onClick={() => { setAuthTab('login'); setAuthError(''); }} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${authTab === 'login' ? 'border-b-2 border-cyan-400 text-white bg-white/[0.02]' : 'text-white/40 hover:text-white/70'}`}>
                    Log In
                  </button>
                  <button onClick={() => { setAuthTab('register'); setAuthError(''); }} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${authTab === 'register' ? 'border-b-2 border-cyan-400 text-white bg-white/[0.02]' : 'text-white/40 hover:text-white/70'}`}>
                    Register
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  {authTab === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <p className="text-white/50 text-xs mb-4">Sign in using your Cruise Hub credentials to access your booking, lounge chat, and itinerary.</p>
                      <div>
                        <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Email Address</label>
                        <input type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#15151f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400/50 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Password</label>
                        <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#15151f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400/50 outline-none transition-all" />
                      </div>

                      {authError && <p className="text-rose-400 text-xs mt-2">{authError}</p>}

                      <button type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                        {submitting ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Access Cruise Hub →"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <p className="text-white/50 text-xs mb-4">Sign up as a Cruise Member to register for the priority booking list and unlock access to the hub.</p>
                      <div>
                        <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Full Legal Name *</label>
                        <input type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#15151f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400/50 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Email Address *</label>
                        <input type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#15151f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400/50 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Phone Number *</label>
                        <input type="tel" required placeholder="(555) 123-4567" value={phone} onChange={e => setPhone(formatPhoneDisplay(e.target.value))} className="w-full bg-[#15151f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400/50 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Choose Password *</label>
                        <input type="password" required placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#15151f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400/50 outline-none transition-all" />
                      </div>

                      {authError && <p className="text-rose-400 text-xs mt-2">{authError}</p>}

                      <button type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-[var(--color-accent)] hover:brightness-110 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-[var(--color-accent)]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                        {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Register & Access Hub →"}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="text-center mt-6">
            <Link href="/cruise" className="text-white/40 hover:text-white/60 text-xs font-bold uppercase tracking-widest transition-all">
              ← Back to Cruise Information
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-32 pb-20 px-6">
      <div className="site-container">
        <header className="mb-8 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">🚢</span>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-widest text-white">Cruise Hub</h1>
                <p className="text-[var(--color-accent)] font-bold text-sm tracking-widest uppercase mt-1">Passenger Area</p>
              </div>
            </div>
            <p className="text-white/60 text-lg max-w-xl">Welcome aboard, <strong className="text-white">{effectiveMember?.name || 'Guest'}</strong>. Here is your official cruise status and early access portal.</p>
          </div>

          <div className="shrink-0">
            <EmbarkationCountdown />
          </div>
        </header>

        {(announcement || isAdmin) && (
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-950/40 to-[#0a0a0f] border border-cyan-500/30 rounded-2xl mb-8 shadow-[0_0_40px_rgba(6,182,212,0.1)] group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500" />
            
            <div className="p-6 md:p-8 relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <span className="animate-pulse">🔔</span>
                </div>
                <h3 className="text-lg font-black italic tracking-wider text-white uppercase">Captain's Log</h3>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-cyan-500/60 border border-cyan-500/20 px-2 py-1 rounded">Priority Update</span>
                {isAdmin && !isEditingAnnouncement && (
                  <button onClick={() => setIsEditingAnnouncement(true)} className="ml-auto text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest cursor-pointer transition-colors border border-cyan-500/20 px-2.5 py-1 rounded bg-cyan-500/5">
                    ✏️ Edit Announcement
                  </button>
                )}
              </div>

              {isEditingAnnouncement ? (
                <div className="space-y-4">
                  <textarea
                    value={announcementInput}
                    onChange={e => setAnnouncementInput(e.target.value)}
                    placeholder="Type news/announcements here (HTML formatting allowed)..."
                    className="w-full bg-[#15151f] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-cyan-400/50 outline-none h-32 resize-none transition-all"
                  />
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setIsEditingAnnouncement(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                      Cancel
                    </button>
                    <button onClick={handleSaveAnnouncement} className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                      Save Announcement
                    </button>
                  </div>
                </div>
              ) : announcement ? (
                <div 
                  className="text-white/80 text-sm leading-relaxed space-y-4 [&_a]:text-cyan-400 [&_a]:underline [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_strong]:text-white [&_strong]:font-bold [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white"
                  dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(announcement) : announcement }}
                />
              ) : (
                <p className="text-white/30 text-sm italic">No priority news announcements posted yet.</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: 5 Paragraph Info block */}
          <div className="lg:col-span-2 bg-[#0b0b12] border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden group shadow-[0_0_30px_rgba(6,182,212,0.02)] flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/2 pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-500" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📋</span>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider text-white">Cruise Information & Guidelines</h2>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Cruiser Welcome Pack</p>
                </div>
              </div>
              <div className="space-y-5 text-white/70 text-sm leading-relaxed">
                <p>
                  Welcome to the official 7th Heaven Cruise Passenger Portal! We are absolutely thrilled to have you join us for this one-of-a-kind rock-and-roll voyage. This portal is your exclusive gateway to everything happening during our journey, designed to keep you connected with the band, the crew, and your fellow passengers from the moment you book until we return to port.
                </p>
                <p>
                  As we prepare to embark, make sure you review the official <Link href="/cruise" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/30 hover:decoration-cyan-400 font-bold transition-all">travel check-list</Link> and itinerary details. From shipboard safety drills to themed concert nights, staying informed ensures you won't miss a single beat of the action. Keep an eye on the Captain's Log and priority updates above for any real-time adjustments or exciting announcements from the band.
                </p>
                <p>
                  Onboard entertainment is the heart of the 7th Heaven cruise experience. We have a stellar lineup of main stage concert performances, intimate acoustic lounge sets, Q&A sessions, and exclusive deck parties scheduled throughout the trip. Be sure to check the <a href="#itinerary" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/30 hover:decoration-cyan-400 font-bold transition-all">official itinerary schedule</a> below to plan your days and nights around these highlight events.
                </p>
                <p>
                  Beyond the music, this cruise offers incredible opportunities to explore beautiful tropical destinations, coordinate group excursions, and participate in fun community activities. Whether you are relaxing by the pool, dining with friends, or exploring local ports of call, there is always something exciting to do with the 7th Heaven community.
                </p>
                <p>
                  Lastly, don't forget to use the Passenger Lounge Chat on the right to introduce yourself, coordinate plans, and share your excitement! Connecting with other fans before and during the cruise is a huge part of what makes this trip so special. We can't wait to see you onboard and rock the high seas together!
                </p>
              </div>
            </div>
          </div>
          {/* Right Column: Chat Box */}
          <div className="lg:col-span-1">
            <CruiseChat memberOverride={effectiveMember} />
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <BookingManager email={effectiveMember?.email} />
              <ImportantLinksWidget />
            </div>

            {itinerary.length > 0 && (
              <div>
                <h2 id="itinerary" className="text-xl font-black italic tracking-wide text-white uppercase mb-6 flex items-center gap-3">
                  <span className="text-[var(--color-accent)]">⚓</span> Official Itinerary <span className="text-xs font-bold text-white/30 tracking-widest not-italic ml-2 uppercase">Subject to Change</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itinerary.map(day => (
                    <div key={day.id} className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300" style={{ '--tw-border-opacity': '0.4', borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)` } as React.CSSProperties}>
                      <div 
                        className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 transition-all duration-500 pointer-events-none opacity-10 group-hover:opacity-20" 
                        style={{ backgroundColor: day.colorTheme }} 
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-5">
                          <span 
                            className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded border" 
                            style={{ color: day.colorTheme, backgroundColor: `color-mix(in srgb, ${day.colorTheme} 10%, transparent)`, borderColor: `color-mix(in srgb, ${day.colorTheme} 20%, transparent)` }}
                          >{day.dayLabel}</span>
                          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{day.location}</span>
                        </div>
                        <h3 className="text-lg font-black uppercase tracking-wide text-white mb-2">{day.theme}</h3>
                        <ul className="space-y-4 mt-5 border-t border-white/5 pt-5">
                          {day.events.map(ev => (
                            <li key={ev.id} className="flex items-start gap-4">
                              <span className="font-mono text-xs font-bold tracking-wider mt-0.5" style={{ color: day.colorTheme }}>{ev.time}</span>
                              <div>
                                <strong className="block text-white text-sm tracking-wide">{ev.title}</strong>
                                <span className="text-white/40 text-xs">{ev.subtitle}</span>
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
          
          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 flex flex-col gap-6">
              <PassengersWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
