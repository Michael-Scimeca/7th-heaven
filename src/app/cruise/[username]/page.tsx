/* eslint-disable react-doctor/no-giant-component */
"use client";
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import { useMember } from "@/context/MemberContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import DOMPurify from "dompurify";
import CruiseChat from "@/components/CruiseChat";
import { EmbarkationCountdown, ImportantLinksWidget, BookingManager } from "@/components/CruiseWidgets";
import CruiseSnakeItinerary from "@/components/CruiseSnakeItinerary";
import { createClient } from "@/lib/supabase/client";
import { formatPhoneDisplay } from "@/lib/validation";
import dynamic from "next/dynamic";
import { cleanWysiwygHtml } from "@/lib/wysiwyg-cleaner";
import 'react-quill-new/dist/quill.snow.css';
import { sanitizeHtml } from "@/lib/sanitize-html";
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
    location: "Day At Sea",
    theme: "Rock the Ocean",
    colorTheme: "#3b82f6",
    events: [
      { id: "e2-1", time: "11:00 AM", title: "Q&A Session with 7th Heaven", subtitle: "Main Theater — Ask the band anything!" },
      { id: "e2-2", time: "3:00 PM", title: "Acoustic Poolside Jam", subtitle: "Lido Deck Pool — Sunshine & acoustic vibes" },
      { id: "e2-3", time: "10:00 PM", title: "Late Night Rock Karaoke", subtitle: "Star Lounge — Sing with band members" },
    ]
  },
  {
    id: "day3",
    dayLabel: "Day 3 · Tue Jan 12",
    location: "Celebrity Reflection / CocoCay",
    theme: "Island Party",
    colorTheme: "#10b981",
    events: [
      { id: "e3-1", time: "9:00 AM", title: "Disembark at Private Island", subtitle: "Beach day, watersports & tropical drinks" },
      { id: "e3-2", time: "1:00 PM", title: "Beachside Concert", subtitle: "Private Island Stage — Barefoot rock show!" },
      { id: "e3-3", time: "5:00 PM", title: "All Aboard — Sail for St. Thomas", subtitle: "Lido Deck sunset party" },
    ]
  },
  {
    id: "day4",
    dayLabel: "Day 4 · Wed Jan 13",
    location: "Charlotte Amalie, St. Thomas",
    theme: "Tropical Excursions",
    colorTheme: "#f59e0b",
    events: [
      { id: "e4-1", time: "8:00 AM", title: "Dock at St. Thomas", subtitle: "Explore Magens Bay, shopping & catamaran tours" },
      { id: "e4-2", time: "4:30 PM", title: "All Aboard St. Thomas", subtitle: "Prep for 80s Rock Theme Night" },
      { id: "e4-3", time: "9:00 PM", title: "80s Rock Costume Party & Show", subtitle: "Main Theater — Dress in your best 80s gear!" },
    ]
  },
  {
    id: "day5",
    dayLabel: "Day 5 · Thu Jan 14",
    location: "Philipsburg, St. Maarten",
    theme: "Island Vibes & Acoustic Sunset",
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

const AVATARS = ['JD', 'SL', 'MT', 'AB', 'RC', 'KW'];

function PassengersWidget() {
  const totalFans = 412;

  return (
    <div className="p-2 relative overflow-hidden group">
      <div className="flex justify-between items-end mb-5 relative z-10">
        <div>
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-black/50 mb-1">Community</h2>
          <div className="flex items-center gap-2">
            <span className="text-black font-black text-2xl italic tracking-wide">{totalFans}</span>
            <span className=" text-[var(--color-accent)] font-bold uppercase tracking-widest text-xs">Cruise Members Onboard</span>
          </div>
        </div>
      </div>

      <div className="flex items-center relative z-10">
        <div className="flex -space-x-3">
          {AVATARS.map((initials, i) => {
            const colors = ['bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-600', 'bg-violet-500', 'bg-pink-500'];
            return (
              <div key={initials} className={`w-10 h-10 rounded-full border-2 border-white ${colors[i % colors.length]} flex items-center justify-center overflow-hidden shadow-md hover:-translate-y-1 transition-transform cursor-pointer relative z-[${10 - i}]`}>
                <span className="text-xs font-black text-white/90 tracking-widest">{initials}</span>
              </div>
            );
          })}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-[var(--color-accent)]/20 flex items-center justify-center shadow-md  text-[var(--color-accent)] font-bold text-xs relative z-0">
            +{totalFans - AVATARS.length}
          </div>
        </div>
      </div>
    </div>
  );
}

const loadCruiseItineraryData = async (): Promise<ItineraryDay[]> => {
  try {
    const res = await fetch(`/api/cruise/itinerary?t=${Date.now()}`, { cache: 'no-store' });
    const data = res.ok ? await res.json() : null;
    if (!data) return DEFAULT_CARIBBEAN_ITINERARY;
    let actualData = data;
    let attempts = 0;
    while (typeof actualData === 'string' && attempts < 3) {
      try { actualData = JSON.parse(actualData); } catch { break; }
      attempts++;
    }
    if (Array.isArray(actualData) && actualData.length > 0) {
      return actualData;
    }
    return DEFAULT_CARIBBEAN_ITINERARY;
  } catch {
    return DEFAULT_CARIBBEAN_ITINERARY;
  }
};

const loadCruiseAnnouncementData = async (): Promise<{ message: string; title: string } | null> => {
  try {
    const res = await fetch(`/api/cruise/announcement?t=${Date.now()}`, { cache: 'no-store' });
    const data = res.ok ? await res.json() : null;
    let actualData = data;
    let attempts = 0;
    while (typeof actualData === 'string' && attempts < 3) {
      try { actualData = JSON.parse(actualData); } catch { break; }
      attempts++;
    }
    if (actualData?.message) {
      const subj = actualData?.subject || actualData?.title || '';
      return { message: actualData.message, title: subj };
    }
    return null;
  } catch {
    return null;
  }
};

const loadCruiseGuidelinesData = async (): Promise<{ title: string; subtitle: string; content: string } | null> => {
  try {
    const res = await fetch(`/api/cruise/guidelines?t=${Date.now()}`, { cache: 'no-store' });
    const data = res.ok ? await res.json() : null;
    if (data?.title) {
      return {
        title: data.title || "Cruise Information & Guidelines",
        subtitle: data.subtitle || "Cruiser Welcome Pack",
        content: data.content || ""
      };
    }
    return null;
  } catch {
    return null;
  }
};

export default function CruiseDashboard() {
  const { isLoggedIn, member, login, signup } = useMember();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const urlUsername = typeof params?.username === 'string' ? params.username : '';
  const isDemoMode = urlUsername === 'demo';

  useEffect(() => {
    if (!isDemoMode && isLoggedIn && member?.role === 'cruise' && member?.username && member.username !== urlUsername) {
      router.replace(`/cruise/${member.username}`);
    }
  }, [isDemoMode, isLoggedIn, member, urlUsername, router]);

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState<string>('');
  const [announcementTitleInput, setAnnouncementTitleInput] = useState<string>('');
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState('');

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

  const refreshCruiseData = useCallback(() => {
    let isMounted = true;

    Promise.all([
      loadCruiseItineraryData(),
      loadCruiseAnnouncementData(),
      loadCruiseGuidelinesData()
    ]).then(([itinData, annData, guideData]) => {
      if (!isMounted) return;
      setItinerary(itinData);

      if (annData) {
        setAnnouncement(annData.message);
        setAnnouncementInput(annData.message);
        setAnnouncementTitle(annData.title);
        setAnnouncementTitleInput(annData.title);
      } else {
        setAnnouncement(null);
        setAnnouncementInput('');
        setAnnouncementTitle('');
        setAnnouncementTitleInput('');
      }

      if (guideData) {
        setGuidelines(guideData);
        setGuidelinesTitleInput(guideData.title);
        setGuidelinesSubtitleInput(guideData.subtitle);
        setGuidelinesContentInput(guideData.content);
      }
    });

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (showAuth) return;
    return refreshCruiseData();
  }, [showAuth, refreshCruiseData]);

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

  const isSavingGuidelinesRef = useRef(false);
  const handleSaveGuidelines = async () => {
    if (isSavingGuidelinesRef.current) return;
    isSavingGuidelinesRef.current = true;
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
    } finally {
      isSavingGuidelinesRef.current = false;
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

      if (res.ok) {
        const data = await res.json();
        setVerifyingPin(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || 'Failed to submit registration request.');
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

      if (res.ok) {
        const data = await res.json();
        const success = await login(email, password);
        if (success) {
          setVerifyingPin(false);
          setPinInput('');
        } else {
          setAuthError('Verification successful, but automatic log in failed. Please sign in via the Log In tab.');
          setVerifyingPin(false);
          setAuthTab('login');
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || 'Verification failed.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSavingAnnouncementRef = useRef(false);
  const handleSaveAnnouncement = async () => {
    if (isSavingAnnouncementRef.current) return;
    isSavingAnnouncementRef.current = true;
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
    } finally {
      isSavingAnnouncementRef.current = false;
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
                    <label htmlFor="cruise-user-pin-input" className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">6-Digit Verification PIN</label>
                    <input aria-label="Input field"
                      id="cruise-user-pin-input"
                      type="text"
                      required
                      placeholder="123456"
                      maxLength={6}
                      value={pinInput}
                      onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-black/15 px-4 py-3 text-center text-lg font-black tracking-[0.3em] text-black focus:border-cyan-500 outline-none transition-colors"
                    />
                  </div>

                  {authError && <p className="text-rose-500 text-xs mt-2 text-center font-bold">{authError}</p>}

                  <button aria-label="Action button" type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                    {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify PIN & Access Hub →"}
                  </button>

                  <div className="text-center mt-4">
                    <button aria-label="Action button" type="button" onClick={() => { setVerifyingPin(false); setAuthError(''); }} className="text-black/40 hover:text-black text-[var(--font-size-2xs)] font-bold uppercase tracking-widest transition-colors cursor-pointer">
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
                <button aria-label="Action button" onClick={() => { setRegSuccess(false); setAuthTab('login'); }} className="w-full py-2.5 bg-gray-50 border border-black/10 text-black/80 hover:bg-gray-100 hover:text-black text-xs font-black uppercase tracking-widest transition-colors cursor-pointer">
                  Go to Log In
                </button>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-black/10">
                  <button aria-label="Action button" onClick={() => { setAuthTab('login'); setAuthError(''); }} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer ${authTab === 'login' ? 'border-b-2 border-cyan-600 text-black bg-gray-50' : 'text-black/40 hover:text-black/70'}`}>
                    Log In
                  </button>
                  <button aria-label="Action button" onClick={() => { setAuthTab('register'); setAuthError(''); }} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer ${authTab === 'register' ? 'border-b-2 border-cyan-600 text-black bg-gray-50' : 'text-black/40 hover:text-black/70'}`}>
                    Register
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  {authTab === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <p className="text-black/50 text-xs mb-4">Sign in using your Cruise Hub credentials to access your booking, lounge chat, and itinerary.</p>
                      <div>
                        <label htmlFor="cruise-hub-login-email" className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Email Address</label>
                        <input aria-label="Input field" id="cruise-hub-login-email" type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label htmlFor="cruise-hub-login-password" className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Password</label>
                        <input aria-label="Input field" id="cruise-hub-login-password" type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-colors" />
                      </div>

                      {authError && <p className="text-rose-500 text-xs mt-2 font-bold">{authError}</p>}

                      <button aria-label="Action button" type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                        {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Access Cruise Hub →"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <p className="text-black/50 text-xs mb-4">Sign up as a Cruise Member to register for the priority booking list and unlock access to the hub.</p>
                      <div>
                        <label htmlFor="cruise-hub-reg-name" className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Full Legal Name *</label>
                        <input aria-label="Input field" id="cruise-hub-reg-name" type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label htmlFor="cruise-hub-reg-email" className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Email Address *</label>
                        <input aria-label="Input field" id="cruise-hub-reg-email" type="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label htmlFor="cruise-hub-reg-phone" className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Phone Number *</label>
                        <input aria-label="Input field" id="cruise-hub-reg-phone" type="tel" required placeholder="(555) 123-4567" value={phone} onChange={e => setPhone(formatPhoneDisplay(e.target.value))} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label htmlFor="cruise-hub-reg-password" className="block text-[var(--font-size-4xs)] font-bold text-black/50 uppercase tracking-widest mb-1.5">Choose Password *</label>
                        <input aria-label="Input field" id="cruise-hub-reg-password" type="password" required placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-black/15 px-4 py-3 text-sm text-black focus:border-cyan-500 outline-none transition-colors" />
                      </div>

                      {authError && <p className="text-rose-500 text-xs mt-2 font-bold">{authError}</p>}

                      <button aria-label="Action button" type="submit" disabled={submitting} className="w-full mt-4 py-3 bg-[var(--color-accent)] hover:brightness-110 text-white font-black uppercase tracking-widest text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                        {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Register & Access Hub →"}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-6">
            <Link href="/cruise" className="text-black/40 hover:text-black text-xs font-bold uppercase tracking-widest transition-colors">
              ← Back to Cruise Information
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white pt-[122px] pb-16 overflow-x-hidden w-full max-w-full selection:bg-cyan-500 selection:text-black">
      <div className="site-container overflow-x-hidden">
        <header className="mb-8 border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl md:text-4xl leading-none">🚢</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white leading-none">Cruise Hub</h1>
                <p className="text-cyan-400 font-bold text-xs md:text-sm tracking-widest uppercase mt-1.5">Passenger Area</p>
              </div>
            </div>
            <p className="text-white/60 text-base md:text-lg max-w-xl">Welcome aboard, <strong className="text-white">{effectiveMember?.name || 'Guest'}</strong>. Here is your official cruise status and early access portal.</p>
          </div>

          <div className="shrink-0">
            <EmbarkationCountdown />
          </div>
        </header>

        {(announcement || isAdmin) && (
          <div className="relative overflow-hidden mb-8 p-6 bg-[var(--color-bg-glass,rgba(18,18,24,0.45))] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl group">
            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-sm shrink-0 mt-0.5 border border-cyan-500/30">
                  <span className="animate-pulse">🔔</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black tracking-[0.15em] uppercase text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">Priority Update</span>
                  </div>
                  <h3 className="text-lg font-black tracking-wide text-white uppercase">{announcementTitle || "Cruise Notice"}</h3>
                </div>
                {isAdmin && !isEditingAnnouncement && (
                  <button aria-label="Action button" onClick={() => setIsEditingAnnouncement(true)} className="ml-auto text-xs font-bold text-cyan-300 hover:text-white uppercase tracking-widest cursor-pointer transition-colors px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    ✏️ Edit Announcement
                  </button>
                )}
              </div>

              {isEditingAnnouncement ? (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="cruise-hub-notice-title" className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1">Notice Header Title / Subject</label>
                    <input aria-label="Input field"
                      id="cruise-hub-notice-title"
                      type="text"
                      value={announcementTitleInput}
                      onChange={e => setAnnouncementTitleInput(e.target.value)}
                      placeholder="e.g. TEST, Captain's Log, or Cruise Notice..."
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-400 outline-none font-bold transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="cruise-hub-notice-content" className="text-[10px] font-bold text-white/50 uppercase tracking-widest block mb-1">Notice Content</label>
                    <textarea aria-label="Text input"
                      id="cruise-hub-notice-content"
                      value={announcementInput}
                      onChange={e => setAnnouncementInput(e.target.value)}
                      placeholder="Type news/announcements here (HTML formatting allowed)..."
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-3.5 text-sm text-white focus:border-cyan-400 outline-none h-32 resize-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button aria-label="Action button" onClick={() => setIsEditingAnnouncement(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer rounded-xl">
                      Cancel
                    </button>
                    <button aria-label="Action button" onClick={handleSaveAnnouncement} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-widest transition-colors cursor-pointer rounded-xl">
                      Save Announcement
                    </button>
                  </div>
                </div>
              ) : sanitizedAnnouncement ? (
                <div
                  className="text-white/80 text-sm leading-relaxed space-y-4 [&_a]:text-cyan-400 [&_a]:underline [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_strong]:text-white [&_strong]:font-bold [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white"
                  dangerouslySetInnerHTML={{ __html: sanitizedAnnouncement }}
                />
              ) : (
                <p className="text-white/40 text-sm italic">No priority news announcements posted yet.</p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
          {/* Main Content Column (Left 2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-8 min-w-0 max-w-full">
            {/* 1. Cruise Information & Guidelines */}
            <div className="p-6 md:p-8 bg-[var(--color-bg-glass,rgba(18,18,24,0.45))] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl h-fit min-w-0 max-w-full overflow-hidden">
              <div className="relative z-10 min-w-0 max-w-full">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 flex-wrap">
                  <span className="text-3xl">📋</span>
                  <div>
                    <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-white">{guidelines.title}</h2>
                    <p className="text-xs text-purple-400font-bold uppercase tracking-widest mt-0.5">{guidelines.subtitle}</p>
                  </div>
                  {isAdmin && !isEditingGuidelines && (
                    <button aria-label="Action button"
                      onClick={() => {
                        setGuidelinesTitleInput(guidelines.title);
                        setGuidelinesSubtitleInput(guidelines.subtitle);
                        setGuidelinesContentInput(guidelines.content);
                        setIsEditingGuidelines(true);
                      }}
                      className="ml-auto text-xs font-bold text-cyan-300 hover:text-white uppercase tracking-widest cursor-pointer transition-colors px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30"
                    >
                      ✏️ Edit Guidelines
                    </button>
                  )}
                </div>

                {isEditingGuidelines ? (
                  <div className="space-y-4 min-w-0 max-w-full">
                    <div>
                      <label htmlFor="cruise-hub-guidelines-title" className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Section Title</label>
                      <input aria-label="Input field"
                        id="cruise-hub-guidelines-title"
                        type="text"
                        value={guidelinesTitleInput}
                        onChange={e => setGuidelinesTitleInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label htmlFor="cruise-hub-guidelines-sub" className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Subtitle / Badge</label>
                      <input aria-label="Input field"
                        id="cruise-hub-guidelines-sub"
                        type="text"
                        value={guidelinesSubtitleInput}
                        onChange={e => setGuidelinesSubtitleInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-xs text-purple-400focus:border-cyan-400 outline-none font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Content (WYSIWYG - Reflects Live Card Colors)</span>
                      <div className="w-full text-white guidelines-wysiwyg-editor [&_.ql-editor]:min-h-[180px]">
                        <ReactQuill theme="snow" value={guidelinesContentInput} onChange={setGuidelinesContentInput} placeholder="Type guidelines & welcome pack information here..." className="bg-white/5 border border-white/15 rounded-xl text-white overflow-hidden" />
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button aria-label="Action button" onClick={() => setIsEditingGuidelines(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer rounded-xl">
                        Cancel
                      </button>
                      <button aria-label="Action button" onClick={handleSaveGuidelines} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-widest transition-colors cursor-pointer rounded-xl">
                        Save Guidelines
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="space-y-4 text-white/80 text-sm md:text-base leading-relaxed tracking-wide min-w-0 max-w-full [overflow-wrap:break-word] break-words [hyphens:manual] overflow-hidden [&_a]:text-cyan-400 [&_a]:hover:text-cyan-300 [&_a]:underline [&_a]:underline-offset-4 [&_a]:font-bold [&_p]:text-white/80 [&_p]:mb-3 [&_p]:max-w-full [&_h1]:text-white [&_h1]:font-bold [&_h2]:text-white [&_h2]:font-bold [&_h3]:text-white [&_h3]:font-bold [&_strong]:text-white [&_span]:text-white/80 [&_li]:text-white/80 [&_div]:text-white/80"
                    dangerouslySetInnerHTML={{ __html: sanitizedGuidelinesContent || sanitizeHtml(cleanWysiwygHtml(guidelines.content)) }}
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
      <section id="itinerary">
        <CruiseSnakeItinerary itinerary={itinerary} />
      </section>
    </div>
  );
}
