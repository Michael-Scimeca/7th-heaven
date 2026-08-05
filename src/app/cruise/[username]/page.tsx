"use client";

import { useMember } from "@/context/MemberContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import CruiseChat from "@/components/CruiseChat";
import { EmbarkationCountdown, ImportantLinksWidget, BookingManager } from "@/components/CruiseWidgets";
import CruiseSnakeItinerary from "@/components/CruiseSnakeItinerary";
import { createClient } from "@/lib/supabase/client";
import { formatPhoneDisplay } from "@/lib/validation";
import dynamic from "next/dynamic";
import { cleanWysiwygHtml } from "@/lib/wysiwyg-cleaner";
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

function PassengersWidget() {
  const avatars = ['JD', 'SL', 'MT', 'AB', 'RC', 'KW'];
  const totalFans = 412;

  return (
    <div className="p-2 relative overflow-hidden group">
      <div className="flex justify-between items-end mb-5 relative z-10">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-black/50 mb-1">Community</h2>
          <div className="flex items-center gap-2">
            <span className="text-black font-black text-2xl italic tracking-wide">{totalFans}</span>
            <span className="text-[var(--color-accent)] font-bold uppercase tracking-widest text-xs">Cruise Members Onboard</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center relative z-10">
        <div className="flex -space-x-3">
          {avatars.map((initials, i) => {
            const colors = ['bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-600', 'bg-violet-500', 'bg-pink-500'];
            return (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${colors[i % colors.length]} flex items-center justify-center overflow-hidden shadow-md hover:-translate-y-1 transition-transform cursor-pointer relative z-[${10 - i}]`}>
                <span className="text-xs font-black text-white/90 tracking-widest">{initials}</span>
              </div>
            );
          })}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-[var(--color-accent)]/20 flex items-center justify-center shadow-md text-[var(--color-accent)] font-bold text-xs relative z-0">
            +{totalFans - avatars.length}
          </div>
        </div>
      </div>
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
    if (isLoggedIn && member?.role === 'cruise' && member?.username && member.username !== urlUsername) {
      router.push(`/cruise/${member.username}`);
    }
  }, [isLoggedIn, member, urlUsername, router, isDemoMode]);

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState<string>('');
  const [announcementTitleInput, setAnnouncementTitleInput] = useState<string>('');
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState('');

  type ItineraryEvent = { id: string; time: string; title: string; subtitle: string; };
  type ItineraryDay = { id: string; dayLabel: string; location: string; theme: string; events: ItineraryEvent[]; colorTheme: string; };

  const DEFAULT_CARIBBEAN_ITINERARY: ItineraryDay[] = [
    {
      id: "day1",
      dayLabel: "Day 1 · Sun Jan 10",
      location: "Port Canaveral, Florida (Orlando)",
      theme: "Welcome Aboard & Sail Away",
      colorTheme: "#06b6d4",
      events: [
        { id: "e1-1", time: "12:00 PM", title: "VIP Boarding & Check-In", subtitle: "Port Canaveral Terminal (Orlando)" },
        { id: "e1-2", time: "4:30 PM", title: "Ship Depart & Lido Deck Sail Away", subtitle: "Set sail with 7th Heaven live acoustic kick-off" },
        { id: "e1-3", time: "9:00 PM", title: "7th Heaven: The Classics Live", subtitle: "Main Theater — First full rock set!" },
      ]
    },
    {
      id: "day2",
      dayLabel: "Day 2 · Mon Jan 11",
      location: "Cococay, Bahamas (Private Island)",
      theme: "Private Island Beach Party",
      colorTheme: "#3b82f6",
      events: [
        { id: "e2-1", time: "7:00 AM", title: "Island Arrival & Docking", subtitle: "Disembark at Royal Caribbean's Private Island" },
        { id: "e2-2", time: "1:00 PM", title: "Oasis Lagoon Poolside Jam", subtitle: "Live band performance at freshwater pool" },
        { id: "e2-3", time: "4:00 PM", title: "All Aboard & Sunset Departure", subtitle: "Return to ship for evening dinner & show" },
      ]
    },
    {
      id: "day3",
      dayLabel: "Day 3 · Tue Jan 12",
      location: "Day At Sea",
      theme: "Rock & Roll At Sea",
      colorTheme: "#a855f7",
      events: [
        { id: "e3-1", time: "11:00 AM", title: "Band Q&A & Photo Session", subtitle: "Deck 11 Lounge — Meet all 7th Heaven members" },
        { id: "e3-2", time: "3:30 PM", title: "Poolside Acoustic Set", subtitle: "Lido Deck Main Stage" },
        { id: "e3-3", time: "10:00 PM", title: "Late Night 80s Rock Party", subtitle: "Main Theater Arena" },
      ]
    },
    {
      id: "day4",
      dayLabel: "Day 4 · Wed Jan 13",
      location: "St. Thomas",
      theme: "Virgin Islands Exploration",
      colorTheme: "#10b981",
      events: [
        { id: "e4-1", time: "12:30 PM", title: "Dock at St. Thomas", subtitle: "Explore Charlotte Amalie & Magens Bay" },
        { id: "e4-2", time: "6:00 PM", title: "St. Thomas Sunset Deck Hang", subtitle: "Enjoy island views from the upper deck" },
        { id: "e4-3", time: "8:00 PM", title: "Ship Departs St. Thomas", subtitle: "All aboard for evening concert" },
      ]
    },
    {
      id: "day5",
      dayLabel: "Day 5 · Thu Jan 14",
      location: "St. Maarten",
      theme: "Tropical Island Sunset",
      colorTheme: "#9333ea",
      events: [
        { id: "e5-1", time: "8:00 AM", title: "Dock at Philipsburg, St. Maarten", subtitle: "Maho Beach plane watching & shopping" },
        { id: "e5-2", time: "5:00 PM", title: "Ship Departs St. Maarten", subtitle: "Set sail for evening theater show" },
        { id: "e5-3", time: "9:00 PM", title: "7th Heaven Unplugged: Deep Cuts", subtitle: "Intimate acoustic theater performance" },
      ]
    },
    {
      id: "day6",
      dayLabel: "Day 6 · Fri Jan 15",
      location: "Day At Sea",
      theme: "Caribbean Cruising",
      colorTheme: "#ec4899",
      events: [
        { id: "e6-1", time: "1:00 PM", title: "Fan Rock Trivia & Prize Raffle", subtitle: "Win autographed merchandise & VIP passes" },
        { id: "e6-2", time: "4:00 PM", title: "Deck Party & Cocktail Hour", subtitle: "Poolside grooves with 7th Heaven" },
        { id: "e6-3", time: "9:30 PM", title: "Rock the Ocean Showcase", subtitle: "Main Deck Concert" },
      ]
    },
    {
      id: "day7",
      dayLabel: "Day 7 · Sat Jan 16",
      location: "Day At Sea",
      theme: "Grand Finale Celebration",
      colorTheme: "#8b5cf6",
      events: [
        { id: "e7-1", time: "2:00 PM", title: "Farewell Fan Photo & Autographs", subtitle: "Deck 5 Atrium" },
        { id: "e7-2", time: "9:00 PM", title: "7th Heaven Farewell Concert", subtitle: "Grand Theater — All the mega hits!" },
        { id: "e7-3", time: "11:30 PM", title: "After-Party Jam Session", subtitle: "Lounge 360" },
      ]
    },
    {
      id: "day8",
      dayLabel: "Day 8 · Sun Jan 17",
      location: "Port Canaveral, Florida (Orlando)",
      theme: "Disembarkation & Farewell",
      colorTheme: "#64748b",
      events: [
        { id: "e8-1", time: "6:00 AM", title: "Ship Arrives Port Canaveral", subtitle: "Docking at Orlando Cruise Terminal" },
        { id: "e8-2", time: "8:00 AM", title: "Farewell Breakfast & Disembarkation", subtitle: "Safe travels home — see you next voyage!" },
      ]
    }
  ];

  const [itinerary, setItinerary] = useState<ItineraryDay[]>(DEFAULT_CARIBBEAN_ITINERARY);

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

  const rawUsername = params?.username ? String(params.username) : 'cruise_guest';
  const derivedName = member?.name || rawUsername.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const showAuth = false; // Always grant access on /cruise/[username]
  const effectiveMember = isDemoMode ? {
    id: 'demo-cruise-001',
    name: 'Demo Cruiser',
    email: 'demo@7thheavenband.com',
    role: 'cruise',
    signup_source: 'cruise_member_signup',
    username: 'demo',
    avatar: 'DC'
  } as any : ((member && member.role === 'cruise') ? member : {
    id: `cruise-${rawUsername}`,
    name: member?.name || derivedName || 'Cruise Guest',
    email: member?.email || `${rawUsername.toLowerCase()}@7thheaven.com`,
    role: 'cruise',
    signup_source: 'cruise_member_signup',
    username: rawUsername,
    avatar: (member?.name || derivedName || 'CG').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  } as any);
  const isAdmin = effectiveMember?.role === 'admin' || effectiveMember?.role === 'crew' || member?.role === 'admin';

  useEffect(() => {
    // Only load data if user is logged in or dev bypass is active
    if (!showAuth) {
      // Load Cruise Itinerary
      fetch(`/api/cruise/itinerary?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!data) {
            setItinerary(DEFAULT_CARIBBEAN_ITINERARY);
            return;
          }
          let actualData = data;
          let attempts = 0;
          while (typeof actualData === 'string' && attempts < 3) {
            try { actualData = JSON.parse(actualData); } catch (e) { break; }
            attempts++;
          }
          if (Array.isArray(actualData) && actualData.length > 0) {
            setItinerary(actualData);
          } else {
            setItinerary(DEFAULT_CARIBBEAN_ITINERARY);
          }
        })
        .catch(() => {
          setItinerary(DEFAULT_CARIBBEAN_ITINERARY);
        });

      fetch(`/api/cruise/announcement?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          let actualData = data;
          let attempts = 0;
          while (typeof actualData === 'string' && attempts < 3) {
            try { actualData = JSON.parse(actualData); } catch (e) { break; }
            attempts++;
          }

          if (actualData?.message) {
            setAnnouncement(actualData.message);
            setAnnouncementInput(actualData.message);
            const subj = actualData?.subject || actualData?.title || '';
            setAnnouncementTitle(subj);
            setAnnouncementTitleInput(subj);
          } else {
            setAnnouncement(null); // Ensure it clears if empty
            setAnnouncementInput('');
            setAnnouncementTitle('');
            setAnnouncementTitleInput('');
          }
        })
        .catch(() => { });

      fetch(`/api/cruise/guidelines?t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.title) {
            setGuidelines(data);
            setGuidelinesTitleInput(data.title || "Cruise Information & Guidelines");
            setGuidelinesSubtitleInput(data.subtitle || "Cruiser Welcome Pack");
            setGuidelinesContentInput(data.content || "");
          }
        })
        .catch(() => { });
    }
  }, [showAuth]);

  const [guidelines, setGuidelines] = useState<{ title: string; subtitle: string; content: string }>({
    title: "Cruise Information & Guidelines",
    subtitle: "Cruiser Welcome Pack",
    content: `<p>Welcome to the official 7th Heaven Cruise Passenger Portal! We are absolutely thrilled to have you join us for this one-of-a-kind rock-and-roll voyage. This portal is your exclusive gateway to everything happening during our journey, designed to keep you connected with the band, the crew, and your fellow passengers from the moment you book until we return to port.</p><p>As we prepare to embark, make sure you review the official <a href="/cruise">travel check-list</a> and itinerary details. From shipboard safety drills to themed concert nights, staying informed ensures you won't miss a single beat of the action. Keep an eye on the Captain's Log and priority updates above for any real-time adjustments or exciting announcements from the band.</p><p>Onboard entertainment is the heart of the 7th Heaven cruise experience. We have a stellar lineup of main stage concert performances, intimate acoustic lounge sets, Q&A sessions, and exclusive deck parties scheduled throughout the trip. Be sure to check the <a href="#itinerary">official itinerary schedule</a> below to plan your days and nights around these highlight events.</p><p>Beyond the music, this cruise offers incredible opportunities to explore beautiful tropical destinations, coordinate group excursions, and participate in fun community activities. Whether you are relaxing by the pool, dining with friends, or exploring local ports of call, there is always something exciting to do with the 7th Heaven community.</p><p>Lastly, don't forget to use the Passenger Lounge Chat on the right to introduce yourself, coordinate plans, and share your excitement! Connecting with other fans before and during the cruise is a huge part of what makes this trip so special. We can't wait to see you onboard and rock the high seas together!</p>`
  });
  const [isEditingGuidelines, setIsEditingGuidelines] = useState(false);
  const [guidelinesTitleInput, setGuidelinesTitleInput] = useState('');
  const [guidelinesSubtitleInput, setGuidelinesSubtitleInput] = useState('');
  const [guidelinesContentInput, setGuidelinesContentInput] = useState('');
  const [sanitizedGuidelinesContent, setSanitizedGuidelinesContent] = useState('');

  useEffect(() => {
    if (guidelines.content && typeof window !== 'undefined') {
      const clean = cleanWysiwygHtml(guidelines.content);
      setSanitizedGuidelinesContent(DOMPurify.sanitize(clean));
    }
  }, [guidelines.content]);

  const handleSaveGuidelines = async () => {
    try {
      const cleanContent = cleanWysiwygHtml(guidelinesContentInput);
      const res = await fetch('/api/cruise/guidelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: guidelinesTitleInput,
          subtitle: guidelinesSubtitleInput,
          content: cleanContent
        })
      });
      if (res.ok) {
        setGuidelines({
          title: guidelinesTitleInput,
          subtitle: guidelinesSubtitleInput,
          content: cleanContent
        });
        setIsEditingGuidelines(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [sanitizedAnnouncement, setSanitizedAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    if (announcement && typeof window !== 'undefined') {
      const clean = cleanWysiwygHtml(announcement);
      setSanitizedAnnouncement(DOMPurify.sanitize(clean));
    } else {
      setSanitizedAnnouncement(null);
    }
  }, [announcement]);

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
        body: JSON.stringify({ message: announcementInput, subject: announcementTitleInput })
      });
      if (res.ok) {
        setAnnouncement(announcementInput || null);
        setAnnouncementTitle(announcementTitleInput || '');
        setIsEditingAnnouncement(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoggedIn === undefined) return <div className="min-h-screen bg-[#f0f2f5] text-black flex items-center justify-center">Loading...</div>;

  if (showAuth) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] text-black pt-32 pb-20 px-6 flex items-center justify-center relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--color-accent)]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 animate-[fadeIn_0.3s_ease-out]">
          <div className="text-center mb-8">
            <span className="text-5xl block mb-4 animate-[bounce_2s_infinite]">🚢</span>
            <h1 className="text-2xl font-black uppercase tracking-widest text-black">Cruise Hub</h1>
            <p className="text-xs text-cyan-600 font-bold uppercase tracking-widest mt-1">Exclusive Passenger Community</p>
          </div>

          <div className="bg-white border border-black/10 overflow-hidden shadow-xl">
            {verifyingPin ? (
              <div className="p-8 animate-[fadeIn_0.3s_ease-out]">
                <div className="text-center mb-6">
                  <span className="text-4xl block mb-3 animate-[pulse_1.5s_infinite]">🔑</span>
                  <h3 className="font-bold text-black text-lg uppercase tracking-wider mb-2">Verify Your Email</h3>
                  <p className="text-black/60 text-sm leading-relaxed">
                    We've sent a 6-digit verification PIN to <strong className="text-cyan-600">{email}</strong>. Enter it below to activate your account.
                  </p>
                </div>

                <form onSubmit={handleVerifyPinSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">6-Digit Verification PIN</label>
                    <input
                      type="text"
                      required
                      placeholder="123456"
                      maxLength={6}
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-black/15 px-4 py-3 text-center text-lg font-black tracking-[0.3em] text-black focus:border-cyan-500 outline-none transition-all"
                    />
                  </div>

                  {authError && <p className="text-rose-500 text-xs mt-2 text-center font-bold">{authError}</p>}

                  <button type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify PIN & Access Hub →"}
                  </button>

                  <div className="text-center mt-4">
                    <button type="button" onClick={() => { setVerifyingPin(false); setAuthError(''); }} className="text-black/40 hover:text-black text-[var(--font-size-2xs)] font-bold uppercase tracking-widest transition-all cursor-pointer">
                      ← Cancel and Back
                    </button>
                  </div>
                </form>
              </div>
            ) : regSuccess ? (
              <div className="p-8 text-center animate-[fadeIn_0.3s_ease-out]">
                <span className="text-4xl block mb-4">📧</span>
                <h3 className="font-bold text-black text-lg uppercase tracking-wider mb-2">Check Your Email</h3>
                <p className="text-black/60 text-sm leading-relaxed mb-6">
                  We've sent a verification link to <strong className="text-black">{email}</strong>. Please check your inbox and click the link to activate your Cruise Hub account.
                </p>
                <button onClick={() => { setRegSuccess(false); setAuthTab('login'); }} className="w-full py-2.5 bg-gray-50 border border-black/10 text-black/80 hover:bg-gray-100 hover:text-black text-xs font-black uppercase tracking-widest transition-all cursor-pointer">
                  Go to Log In
                </button>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-black/10">
                  <button onClick={() => { setAuthTab('login'); setAuthError(''); }} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${authTab === 'login' ? 'border-b-2 border-cyan-600 text-black bg-gray-50' : 'text-black/40 hover:text-black/70'}`}>
                    Log In
                  </button>
                  <button onClick={() => { setAuthTab('register'); setAuthError(''); }} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${authTab === 'register' ? 'border-b-2 border-cyan-600 text-black bg-gray-50' : 'text-black/40 hover:text-black/70'}`}>
                    Register
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  {authTab === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <p className="text-black/50 text-xs mb-4">Sign in using your Cruise Hub credentials to access your booking, lounge chat, and itinerary.</p>
                      <div>
                        <label className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Email Address</label>
                        <input type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Password</label>
                        <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-all" />
                      </div>

                      {authError && <p className="text-rose-500 text-xs mt-2 font-bold">{authError}</p>}

                      <button type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                        {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Access Cruise Hub →"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <p className="text-black/50 text-xs mb-4">Sign up as a Cruise Member to register for the priority booking list and unlock access to the hub.</p>
                      <div>
                        <label className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Full Legal Name *</label>
                        <input type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Email Address *</label>
                        <input type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Phone Number *</label>
                        <input type="tel" required placeholder="(555) 123-4567" value={phone} onChange={e => setPhone(formatPhoneDisplay(e.target.value))} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Choose Password *</label>
                        <input type="password" required placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-all" />
                      </div>

                      {authError && <p className="text-rose-500 text-xs mt-2 font-bold">{authError}</p>}

                      <button type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-[var(--color-accent)] hover:brightness-110 text-white font-black uppercase tracking-widest text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                        {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Register & Access Hub →"}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-6">
            <Link href="/cruise" className="text-black/40 hover:text-black text-xs font-bold uppercase tracking-widest transition-all">
              ← Back to Cruise Information
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-black pt-[122px] pb-0 overflow-x-hidden w-full max-w-full">
      <div className="site-container overflow-x-hidden">
        <header className="mb-8 border-b border-black/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl md:text-4xl leading-none">🚢</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-black leading-none">Cruise Hub</h1>
                <p className="text-[var(--color-accent)] font-bold text-xs md:text-sm tracking-widest uppercase mt-1.5">Passenger Area</p>
              </div>
            </div>
            <p className="text-black/60 text-base md:text-lg max-w-xl">Welcome aboard, <strong className="text-black">{effectiveMember?.name || 'Guest'}</strong>. Here is your official cruise status and early access portal.</p>
          </div>

          <div className="shrink-0">
            <EmbarkationCountdown />
          </div>
        </header>

        {(announcement || isAdmin) && (
          <div className="relative overflow-hidden mb-8 p-4 bg-white border border-black/10 shadow-md group">
            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-sm shrink-0 mt-0.5">
                  <span className="animate-pulse">🔔</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black tracking-[0.15em] uppercase text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">Priority Update</span>
                  </div>
                  <h3 className="text-lg font-black tracking-wide text-black uppercase">{announcementTitle || "Cruise Notice"}</h3>
                </div>
                {isAdmin && !isEditingAnnouncement && (
                  <button onClick={() => setIsEditingAnnouncement(true)} className="ml-auto text-xs font-bold text-cyan-700 hover:text-cyan-800 uppercase tracking-widest cursor-pointer transition-colors px-2.5 py-1 rounded bg-cyan-50 border border-cyan-200">
                    ✏️ Edit Announcement
                  </button>
                )}
              </div>

              {isEditingAnnouncement ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-black/50 uppercase tracking-widest block mb-1">Notice Header Title / Subject</label>
                    <input
                      type="text"
                      value={announcementTitleInput}
                      onChange={e => setAnnouncementTitleInput(e.target.value)}
                      placeholder="e.g. TEST, Captain's Log, or Cruise Notice..."
                      className="w-full bg-white border border-black/15 px-3.5 py-2 text-xs text-black focus:border-cyan-500 outline-none font-bold transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-black/50 uppercase tracking-widest block mb-1">Notice Content</label>
                    <textarea
                      value={announcementInput}
                      onChange={e => setAnnouncementInput(e.target.value)}
                      placeholder="Type news/announcements here (HTML formatting allowed)..."
                      className="w-full bg-white border border-black/15 p-3.5 text-sm text-black focus:border-cyan-500 outline-none h-32 resize-none transition-all"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setIsEditingAnnouncement(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black/80 text-xs font-black uppercase tracking-widest transition-all cursor-pointer">
                      Cancel
                    </button>
                    <button onClick={handleSaveAnnouncement} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer">
                      Save Announcement
                    </button>
                  </div>
                </div>
              ) : sanitizedAnnouncement ? (
                <div
                  className="text-black/80 text-sm leading-relaxed space-y-4 [&_a]:text-cyan-600 [&_a]:underline [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_strong]:text-black [&_strong]:font-bold [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-black [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-black"
                  dangerouslySetInnerHTML={{ __html: sanitizedAnnouncement }}
                />
              ) : (
                <p className="text-black/40 text-sm italic">No priority news announcements posted yet.</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
          {/* Main Content Column (Left 2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-8 min-w-0 max-w-full">
            {/* 1. Cruise Information & Guidelines */}
            <div className="p-6 bg-white border border-black/10 shadow-md h-fit min-w-0 max-w-full overflow-hidden">
              <div className="relative z-10 min-w-0 max-w-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/10 flex-wrap">
                  <span className="text-3xl">📋</span>
                  <div>
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-black">{guidelines.title}</h2>
                    <p className="text-xs text-cyan-700 font-bold uppercase tracking-widest mt-0.5">{guidelines.subtitle}</p>
                  </div>
                  {isAdmin && !isEditingGuidelines && (
                    <button
                      onClick={() => {
                        setGuidelinesTitleInput(guidelines.title);
                        setGuidelinesSubtitleInput(guidelines.subtitle);
                        setGuidelinesContentInput(guidelines.content);
                        setIsEditingGuidelines(true);
                      }}
                      className="ml-auto text-xs font-bold text-cyan-700 hover:text-cyan-800 uppercase tracking-widest cursor-pointer transition-colors px-2.5 py-1 rounded bg-cyan-50 border border-cyan-200"
                    >
                      ✏️ Edit Guidelines
                    </button>
                  )}
                </div>

                {isEditingGuidelines ? (
                  <div className="space-y-4 min-w-0 max-w-full">
                    <div>
                      <label className="block text-xs font-bold text-black/50 uppercase tracking-widest mb-1">Section Title</label>
                      <input
                        type="text"
                        value={guidelinesTitleInput}
                        onChange={e => setGuidelinesTitleInput(e.target.value)}
                        className="w-full bg-white border border-black/15 px-4 py-2 text-sm text-black focus:border-cyan-500 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black/50 uppercase tracking-widest mb-1">Subtitle / Badge</label>
                      <input
                        type="text"
                        value={guidelinesSubtitleInput}
                        onChange={e => setGuidelinesSubtitleInput(e.target.value)}
                        className="w-full bg-white border border-black/15 px-4 py-2 text-xs text-cyan-700 focus:border-cyan-500 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black/50 uppercase tracking-widest mb-1">Content (WYSIWYG - Reflects Live Card Colors)</label>
                      <div className="w-full text-black guidelines-wysiwyg-editor [&_.ql-editor]:min-h-[180px]">
                        <ReactQuill theme="snow" value={guidelinesContentInput} onChange={setGuidelinesContentInput} placeholder="Type guidelines & welcome pack information here..." className="bg-white overflow-hidden" />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setIsEditingGuidelines(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black/80 text-xs font-black uppercase tracking-widest transition-all cursor-pointer">
                        Cancel
                      </button>
                      <button onClick={handleSaveGuidelines} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer">
                        Save Guidelines
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="space-y-4 text-black/80 text-sm md:text-base leading-relaxed tracking-wide min-w-0 max-w-full [overflow-wrap:break-word] break-words [hyphens:manual] overflow-hidden [&_a]:text-cyan-600 [&_a]:hover:text-cyan-700 [&_a]:underline [&_a]:underline-offset-4 [&_a]:font-bold [&_p]:text-black/80 [&_p]:mb-3 [&_p]:max-w-full [&_h1]:text-black [&_h1]:font-bold [&_h2]:text-black [&_h2]:font-bold [&_h3]:text-black [&_h3]:font-bold [&_strong]:text-black [&_span]:text-black/80 [&_li]:text-black/80 [&_div]:text-black/80"
                    dangerouslySetInnerHTML={{ __html: sanitizedGuidelinesContent || guidelines.content }}
                  />
                )}
              </div>
            </div>

            {/* 2. Priority Status & Cabin Booking Details */}
            <BookingManager email={effectiveMember?.email} />

            {/* 3. Important Links */}
            <ImportantLinksWidget />
          </div>

          {/* Right Sidebar Column (1 Col) */}
          <div className="lg:col-span-1">
            <div className="flex flex-col gap-6">
              <CruiseChat memberOverride={effectiveMember} />
              <PassengersWidget />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Official Winding Snake Itinerary Timeline — Full Width */}
      <CruiseSnakeItinerary itinerary={itinerary} />
    </div>
  );
}
