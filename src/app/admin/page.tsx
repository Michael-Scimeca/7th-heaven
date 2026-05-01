"use client";
import React from 'react';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useMember } from "@/context/MemberContext";

import { adminKillStream, adminBanUser, seedMockData, adminCreateCrewMember, adminResetPassword } from "./actions";
import ShowCrewPanel from "@/components/ShowCrewPanel";
import InviteChallengePanel from "@/components/admin/InviteChallengePanel";
import dynamic from 'next/dynamic';

const AdminMap = dynamic(() => import('@/components/AdminMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-black/40 rounded-xl animate-pulse" />
});

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function AdminDashboard() {
  const { member, isLoggedIn, login, logout } = useMember();
  const [feeds, setFeeds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState<"All" | "fan" | "crew" | "admin">("All");
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminTab, setAdminTab] = useState<'band' | 'cruise'>('band');
  const adminTabRef = useRef<'band' | 'cruise'>('band');
  const [unreadCruiseChat, setUnreadCruiseChat] = useState(0);
  const supabase = createClient();

  // Global Announcement State
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerExpiresAt, setBannerExpiresAt] = useState<string | null>(null);
  const [bannerUpdating, setBannerUpdating] = useState(false);

  // Cruise Announcement State
  const [cruiseMessage, setCruiseMessage] = useState('');
  const [cruiseUpdating, setCruiseUpdating] = useState(false);
  const [cruiseSaveStatus, setCruiseSaveStatus] = useState<string | null>(null);

  // Cruise Community Blast State
  const [cruiseBlastSubject, setCruiseBlastSubject] = useState('');
  const [cruiseBlastBody, setCruiseBlastBody] = useState('');
  const [cruiseBlastSending, setCruiseBlastSending] = useState(false);
  const [cruiseBlastResult, setCruiseBlastResult] = useState<{ success: boolean; message: string } | null>(null);

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  // Crew creation state
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewEmail, setNewCrewEmail] = useState('');
  const [newCrewPassword, setNewCrewPassword] = useState('');
  const [newCrewPhone, setNewCrewPhone] = useState('');
  const [newCrewUsername, setNewCrewUsername] = useState('');
  const [createdCrew, setCreatedCrew] = useState<{ name: string; email: string; password: string; phone: string; username: string } | null>(null);
  const [crewError, setCrewError] = useState('');
  const [crewLoading, setCrewLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const registryRef = useRef<HTMLElement>(null);
  const loggedStreamIds = useRef<Set<string>>(new Set());

  // Shopify Sales Data
  const [shopifyData, setShopifyData] = useState<any>(null);
  const [shopifyLoading, setShopifyLoading] = useState(true);
  const [shopifyPeriod, setShopifyPeriod] = useState(30);
  const [shopifyError, setShopifyError] = useState('');

  // Fan Analytics
  const [fanData, setFanData] = useState<any>(null);

  // Google Analytics Mock Data
  const [gaData, setGaData] = useState<any>({
    activeUsers: 42,
    sessions: 1240,
    pageViews: 8430,
    avgSession: '2m 14s',
    bounceRate: '34%',
    sources: [
      { name: 'Direct', value: 45 },
      { name: 'Social', value: 25 },
      { name: 'Search', value: 20 },
      { name: 'Referral', value: 10 },
    ],
    pages: [
      { path: '/', views: 2450 },
      { path: '/live', views: 1820 },
      { path: '/fans', views: 950 },
      { path: '/tour', views: 880 },
    ],
    conversionRate: '3.8%',
    revenuePerSession: '$4.12',
    locations: [
      { city: 'Chicago, IL', percentage: 38 },
      { city: 'Nashville, TN', percentage: 15 },
      { city: 'Los Angeles, CA', percentage: 12 },
      { city: 'Dallas, TX', percentage: 8 },
    ]
  });

  // Newsletter Blast
  const [blastSubject, setBlastSubject] = useState('');
  const [blastBody, setBlastBody] = useState('');
  const [blastSending, setBlastSending] = useState(false);
  const [blastResult, setBlastResult] = useState<any>(null);

  // Audit log
  interface AuditEntry { id: string; text: string; time: string; color: string; }
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    { id: 'boot', text: 'System boot online. Realtime bindings initialized.', time: 'Just now', color: 'bg-emerald-500' },
    { id: 'session', text: 'Administrator session granted.', time: '1 min ago', color: 'bg-[#8a1cfc]' },
  ]);

  // Crew SMS Alert
  const [crewAlertMsg, setCrewAlertMsg] = useState('');
  const [crewAlertSending, setCrewAlertSending] = useState(false);
  const [crewAlertResult, setCrewAlertResult] = useState<any>(null);
  const [crewAlertStats, setCrewAlertStats] = useState<{ totalCrew: number; withPhone: number } | null>(null);

  // SMS Proximity Blast (Fan Show Alerts)
  const [smsShows, setSmsShows] = useState<any[]>([]);
  const [smsSelectedShow, setSmsSelectedShow] = useState<string>('');
  const [smsCustomMsg, setSmsCustomMsg] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState<any>(null);
  const [smsPreview, setSmsPreview] = useState('');
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [smsAutoBlast, setSmsAutoBlast] = useState(true);
  const [smsAutoBlastDays, setSmsAutoBlastDays] = useState(3);

  // Cruise Itinerary Builder
  type ItineraryEvent = { id: string; time: string; title: string; subtitle: string; };
  type ItineraryDay = { id: string; dayLabel: string; location: string; theme: string; events: ItineraryEvent[]; colorTheme: string; };
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [itineraryUpdating, setItineraryUpdating] = useState(false);
  const [itinerarySaveStatus, setItinerarySaveStatus] = useState<'saved' | 'error' | null>(null);

  // Cruise Chat Pin
  const [cruiseChatPin, setCruiseChatPin] = useState('');
  const [cruiseChatPinUpdating, setCruiseChatPinUpdating] = useState(false);
  const [cruiseChatPinSaveStatus, setCruiseChatPinSaveStatus] = useState<'saved' | 'error' | null>(null);

  // Cruise Chat Enable/Disable
  const [cruiseChatEnabled, setCruiseChatEnabled] = useState(true);
  const [cruiseChatToggling, setCruiseChatToggling] = useState(false);

  // Admin Live Chat Feed
  type AdminChatMsg = { id: string; sender_name: string; sender_role: string; sender_avatar: string; content: string; created_at: string; };
  const [adminChatMessages, setAdminChatMessages] = useState<AdminChatMsg[]>([]);
  const [adminChatInput, setAdminChatInput] = useState('');
  const [adminChatSending, setAdminChatSending] = useState(false);
  const adminChatEndRef = useRef<HTMLDivElement>(null);
  const adminChatContainerRef = useRef<HTMLDivElement>(null);

  // Cruise Important Links
  const [importantLinks, setImportantLinks] = useState<{title: string, url: string, icon: string}[]>([]);
  const [linksUpdating, setLinksUpdating] = useState(false);
  const [linksSaveStatus, setLinksSaveStatus] = useState<'saved' | 'error' | null>(null);

  // Cruise Stats
  const [cruiseStats, setCruiseStats] = useState<{ total: number; adults: number; children: number; signups: number; recentSignups: { name: string; email: string; phone: string; date: string; partySize: number }[] }>({ total: 0, adults: 0, children: 0, signups: 0, recentSignups: [] });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    // Authenticate via Supabase Auth — no hardcoded credentials
    const ok = await login(adminEmail, adminPassword);

    if (!ok) {
      setAdminLoginError('Invalid credentials. Please check your email and password.');
      setAdminLoginLoading(false);
      return;
    }

    // After login, the member context will set the role from Supabase profiles.
    // The login gate below (member?.role !== 'admin') will handle authorization.
    setAdminLoginLoading(false);
  };

  const createCrew = async () => {
    if (!newCrewName || !newCrewEmail || !newCrewPassword) return;
    if (newCrewPassword.length < 6) { setCrewError('Password must be at least 6 characters.'); return; }
    setCrewLoading(true);
    setCrewError('');
    setCreatedCrew(null);
    const savedName = newCrewName;
    const savedEmail = newCrewEmail;
    const savedPassword = newCrewPassword;
    const savedPhone = newCrewPhone;
    const savedUsername = newCrewUsername;
    const res = await adminCreateCrewMember({ name: newCrewName, email: newCrewEmail, password: newCrewPassword, phone: newCrewPhone || undefined, username: newCrewUsername || undefined });
    if (res.success) {
      setCreatedCrew({ name: savedName, email: savedEmail, password: savedPassword, phone: savedPhone, username: savedUsername });
      setNewCrewName('');
      setNewCrewEmail('');
      setNewCrewPassword('');
      setNewCrewPhone('');
      setNewCrewUsername('');

      // Also save to localStorage so crew can login via the standard modal
      const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
      accounts[savedEmail.toLowerCase()] = {
        id: crypto.randomUUID(),
        name: savedName,
        email: savedEmail.toLowerCase(),
        password: savedPassword,
        phone: savedPhone,
        joinDate: new Date().toISOString(),
        avatar: savedName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        points: 0,
        tier: 'Bronze',
        showsAttended: 0,
        favoriteVenues: [],
        notificationsEnabled: false,
        notificationRadius: 25,
        role: 'crew',
      };
      localStorage.setItem('7h_accounts', JSON.stringify(accounts));

      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) setUsers(profilesData.map(p => ({ id: p.id, name: p.full_name || p.email || 'Anonymous', role: p.role, status: 'active', strikes: 0 })));
      setFilterRole('crew');
    } else {
      setCrewError(res.error || 'Failed to create crew member.');
    }
    setCrewLoading(false);
  };

  const scrollToRegistry = () => {
    registryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Load Real Data from Supabase + simulated demo feeds
  useEffect(() => {
    let pollLocal: NodeJS.Timeout;

    // Load Global Announcement Banner
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => {
        setBannerActive(data.isActive);
        setBannerText(data.text || '');
        setBannerLink(data.link || '');
        setBannerExpiresAt(data.expiresAt || null);
      })
      .catch(() => {});
      
    // Load Cruise Announcement
    fetch(`/api/cruise/announcement?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        let actualData = data;
        let attempts = 0;
        while (typeof actualData === 'string' && attempts < 3) {
          try { actualData = JSON.parse(actualData); } catch(e) { break; }
          attempts++;
        }
        if (actualData?.message) setCruiseMessage(actualData.message);
      })
      .catch(() => {});

    // Load Cruise Chat Pin + enabled state
    fetch(`/api/cruise/chat-pin`)
      .then(res => res.json())
      .then(data => {
        if (data?.pin) setCruiseChatPin(data.pin);
        if (data?.chatEnabled !== undefined) setCruiseChatEnabled(data.chatEnabled);
      })
      .catch(() => {});

    // Load Cruise Chat History for admin view
    supabase
      .from('chat_messages')
      .select('*')
      .eq('room', 'cruise_dashboard')
      .order('created_at', { ascending: false })
      .limit(80)
      .then(({ data }) => {
        if (data) {
          setAdminChatMessages(data.reverse());
          if (adminTabRef.current !== 'cruise' && data.length > 0) {
            setUnreadCruiseChat(data.length);
          }
        }
      });

    // Realtime subscription for admin chat feed
    const adminChatChannel = supabase
      .channel('admin_cruise_chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: 'room=eq.cruise_dashboard'
      }, (payload) => {
        const msg = payload.new as AdminChatMsg;
        setAdminChatMessages(prev => [...prev.slice(-79), msg]);
        if (adminTabRef.current !== 'cruise') {
          setUnreadCruiseChat(prev => prev + 1);
        }
      })
      .subscribe();

    // Load Important Links
    fetch(`/api/cruise/important-links?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.links && Array.isArray(data.links)) {
          setImportantLinks(data.links);
        }
      })
      .catch(() => {});

    // Load Cruise Stats
    fetch(`/api/admin/cruise-stats?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setCruiseStats(data);
      })
      .catch(() => {});

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
        } else {
          // Default empty state or fallback template
          setItinerary([
            { id: 'day1', dayLabel: 'Day 1', location: 'Miami, FL', theme: 'Embarkation', colorTheme: 'var(--color-accent)', events: [
              { id: 'e1', time: '15:00', title: 'Welcome Aboard Party', subtitle: 'Lido Deck Poolside' },
              { id: 'e2', time: '20:00', title: 'Main Stage Kickoff', subtitle: 'Starlight Theater' }
            ] }
          ]);
        }
      })
      .catch(() => {});
    
    async function loadAdminData() {
      const { data: streamsData } = await supabase
        .from('live_streams')
        .select('*')
        .eq('status', 'live');
        
      const realFeeds = (streamsData || []).map(st => ({
        id: st.id,
        name: st.title || 'Untitled Stream',
        host: 'Crew Member', // Fallback since we removed the profiles join
        viewers: st.viewer_count || 0,
        uptime: st.created_at ? Math.max(1, Math.floor((new Date().getTime() - new Date(st.created_at).getTime()) / 60000)) + "m" : "Just now",
        status: st.status,
        isSimulated: false,
        route: '',
      }));

      // Log new Supabase streams to audit log
      realFeeds.forEach(feed => {
        if (!loggedStreamIds.current.has(feed.id)) {
          loggedStreamIds.current.add(feed.id);
          setAuditLog(prev => [{ id: crypto.randomUUID(), text: `🔴 ${feed.host} went live — "${feed.name}"`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
        }
      });

      setFeeds(realFeeds);

      pollLocal = setInterval(() => {
        const uids = ['michael', 'sammy', 'ryan', 'tony'];
        const nameMap: any = { 'michael': 'Mike S', 'sammy': 'Sammy D', 'ryan': 'Ryan K', 'tony': 'Tony M' };
        const activeLocal: any[] = [];
        uids.forEach(uid => {
          // Unify with Crew/Fan naming: key_id
          const isLive = localStorage.getItem(`is_live_${uid}`) === 'true' || localStorage.getItem(`7h_crew_is_live_${uid}`) === 'true';
          
          if (isLive) {
            const startStr = localStorage.getItem(`live_stream_start_${uid}`) || localStorage.getItem(`7h_live_stream_start_${uid}`);
            const uptime = startStr ? Math.max(1, Math.floor((Date.now() - parseInt(startStr)) / 60000)) + 'm' : 'Just now';
            const viewers = parseInt(localStorage.getItem(`live_viewer_count_${uid}`) || localStorage.getItem(`7h_live_viewer_count_${uid}`) || '0');
            const revenue = parseFloat(localStorage.getItem(`live_merch_sales_${uid}`) || localStorage.getItem(`7h_live_merch_sales_${uid}`) || '0');
            const feedId = `sim-${uid}`;
            activeLocal.push({
              id: feedId, name: `Crew Cam: ${nameMap[uid]}`, host: nameMap[uid],
              viewers, uptime, status: 'live', isSimulated: true,
              route: `/live/live_${uid}`, revenue
            });
            // Log to audit if first time seeing this stream
            if (!loggedStreamIds.current.has(feedId)) {
              loggedStreamIds.current.add(feedId);
              setAuditLog(prev => [{ id: crypto.randomUUID(), text: `🔴 ${nameMap[uid]} went live — Crew Broadcast`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
            }
          } else {
            // If stream ended, remove from tracked so re-going-live triggers a new log
            loggedStreamIds.current.delete(`sim-${uid}`);
          }
        });
        setFeeds(prev => {
          const dbFeeds = prev.filter(p => !p.isSimulated);
          return [...activeLocal, ...dbFeeds].sort((a,b) => b.viewers - a.viewers);
        });
      }, 2000);

      const { data: profilesData } = await supabase
        .from('profiles').select('*').order('created_at', { ascending: false });
      if (profilesData) {
        setUsers(profilesData.map(p => ({
          id: p.id, 
          name: p.full_name || 'Anonymous',
          email: p.email || '',
          role: p.role, 
          status: 'active', 
          strikes: 0
        })));
      }

      try {
        const photoRes = await fetch('/api/fans?all=true');
        if (photoRes.ok) {
          const allPhotos = await photoRes.json();
          setModerationQueue(allPhotos.filter((p: any) => !p.approved));
        }
      } catch (err) {}

      try {
        const bookingRes = await fetch('/api/booking');
        if (bookingRes.ok) setBookings(await bookingRes.json());
      } catch (err) {}

      // Load Shopify Sales Data
      try {
        const shopRes = await fetch(`/api/shopify/orders?days=${shopifyPeriod}`);
        if (shopRes.ok) {
          setShopifyData(await shopRes.json());
          setShopifyError('');
        } else {
          const errData = await shopRes.json().catch(() => ({}));
          setShopifyError(errData.error || 'Failed to load');
        }
      } catch (err) {
        setShopifyError('Network error');
      }
      setShopifyLoading(false);

      // Load Fan Analytics
      try {
        const fanRes = await fetch('/api/admin/fans');
        if (fanRes.ok) setFanData(await fanRes.json());
      } catch {}

      // Load Crew Alert Stats
      try {
        const crewRes = await fetch('/api/admin/crew-alert');
        if (crewRes.ok) setCrewAlertStats(await crewRes.json());
      } catch {}

      // Load upcoming shows for SMS blast picker
      try {
        const showsRes = await fetch('/api/admin/shows');
        if (showsRes.ok) setSmsShows(await showsRes.json());
      } catch {}

      // Load auto-blast settings
      try {
        const settingsRes = await fetch('/api/admin/settings');
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          const autoBlast = settings.find((s: any) => s.key === 'sms_auto_blast');
          const autoBlastDays = settings.find((s: any) => s.key === 'sms_auto_blast_days');
          if (autoBlast) setSmsAutoBlast(autoBlast.value !== 'off');
          if (autoBlastDays) setSmsAutoBlastDays(parseInt(autoBlastDays.value, 10) || 3);
        }
      } catch {}

      setIsLoading(false);
    }
    
    loadAdminData();

    const bookingPoll = setInterval(async () => {
      try {
        const res = await fetch('/api/booking');
        if (res.ok) setBookings(await res.json());
      } catch {}
    }, 10000);

    return () => {
      if (pollLocal) clearInterval(pollLocal);
      clearInterval(bookingPoll);
      supabase.removeChannel(adminChatChannel);
    };
  }, [supabase]);

  // Auto-scroll admin chat feed
  useEffect(() => {
    adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [adminChatMessages]);

  const [chatRate, setChatRate] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
       const chatLog = JSON.parse(localStorage.getItem('7h_global_chat_history') || '[]');
       setChatRate(chatLog.length);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const killStream = async (feed: any) => {
    if (feed.isSimulated) {
      const uid = feed.id.replace('sim-', '');
      localStorage.removeItem(`7h_crew_is_live_${uid}`);
      localStorage.removeItem(`7h_is_live_${uid}`); // Also clear namespaced key
      localStorage.setItem(`is_live_${uid}`, 'false');
      setFeeds(current => current.filter(f => f.id !== feed.id));
      setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Terminated demo stream: ${feed.host}`, time: 'Just now', color: 'bg-amber-500' }, ...prev]);
    } else {
      const res = await adminKillStream(feed.id);
      if (res.success) {
        setFeeds(current => current.filter(f => f.id !== feed.id));
        setAuditLog(prev => [{ id: crypto.randomUUID(), text: 'Live stream terminated.', time: 'Just now', color: 'bg-amber-500' }, ...prev]);
      } else {
        setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Failed to kill stream: ${res.error}`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
      }
    }
  };

  const banUser = async (id: string, name: string) => {
    const res = await adminBanUser(id);
    if (!res.success) {
      setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Failed to remove ${name}: ${res.error}`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
    } else {
      setUsers(current => current.filter(u => u.id !== id));
      setAuditLog(prev => [{ id: crypto.randomUUID(), text: `${name} removed from platform.`, time: 'Just now', color: 'bg-red-500' }, ...prev]);
    }
  };

  const seedData = async () => {
    setIsLoading(true);
    await seedMockData();
    window.location.reload();
  };

  const moderatePhoto = async (id: string, action: 'approve' | 'reject') => {
    setModerationQueue(current => current.filter(p => p.id !== id));
    try {
      await fetch('/api/fans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const [bannerSaveStatus, setBannerSaveStatus] = useState<string | null>(null);

  const updateGlobalBanner = async (overrides?: { isActive?: boolean; expiresAt?: string | null }) => {
    setBannerUpdating(true);
    setBannerSaveStatus(null);
    try {
      await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: overrides?.isActive ?? bannerActive,
          text: bannerText,
          link: bannerLink,
          expiresAt: overrides?.expiresAt !== undefined ? overrides.expiresAt : bannerExpiresAt,
        })
      });
      setBannerSaveStatus('saved');
      setTimeout(() => setBannerSaveStatus(null), 3000);
    } catch (e) {
      setBannerSaveStatus('error');
      setTimeout(() => setBannerSaveStatus(null), 4000);
    }
    setBannerUpdating(false);
  };

  const updateCruiseMessage = async (msgOverride?: string) => {
    const finalMessage = msgOverride !== undefined ? msgOverride : cruiseMessage;
    setCruiseUpdating(true);
    setCruiseSaveStatus(null);
    try {
      await fetch('/api/cruise/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: finalMessage })
      });
      if (msgOverride !== undefined) setCruiseMessage(msgOverride);
      setCruiseSaveStatus('saved');
      setTimeout(() => setCruiseSaveStatus(null), 3000);
    } catch (e) {
      setCruiseSaveStatus('error');
      setTimeout(() => setCruiseSaveStatus(null), 4000);
    }
    setCruiseUpdating(false);
  };

  const updateItinerary = async (newItin: ItineraryDay[]) => {
    setItineraryUpdating(true);
    setItinerarySaveStatus(null);
    try {
      await fetch('/api/cruise/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: newItin })
      });
      setItinerary(newItin);
      setItinerarySaveStatus('saved');
      setTimeout(() => setItinerarySaveStatus(null), 3000);
    } catch (e) {
      setItinerarySaveStatus('error');
      setTimeout(() => setItinerarySaveStatus(null), 4000);
    }
    setItineraryUpdating(false);
  };

  const updateCruiseChatPin = async (msgOverride?: string) => {
    const finalMessage = msgOverride !== undefined ? msgOverride : cruiseChatPin;
    setCruiseChatPinUpdating(true);
    setCruiseChatPinSaveStatus(null);
    try {
      await fetch('/api/cruise/chat-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: finalMessage })
      });
      if (msgOverride !== undefined) setCruiseChatPin(msgOverride);
      setCruiseChatPinSaveStatus('saved');
      setTimeout(() => setCruiseChatPinSaveStatus(null), 3000);
    } catch (e) {
      setCruiseChatPinSaveStatus('error');
      setTimeout(() => setCruiseChatPinSaveStatus(null), 4000);
    } finally {
      setCruiseChatPinUpdating(false);
    }
  };

  const toggleCruiseChat = async () => {
    const newVal = !cruiseChatEnabled;
    setCruiseChatToggling(true);
    try {
      await fetch('/api/cruise/chat-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatEnabled: newVal }),
      });
      setCruiseChatEnabled(newVal);
    } catch {
      // revert on failure
    } finally {
      setCruiseChatToggling(false);
    }
  };

  const updateImportantLinks = async () => {
    setLinksUpdating(true);
    setLinksSaveStatus(null);
    try {
      await fetch('/api/cruise/important-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: importantLinks })
      });
      setLinksSaveStatus('saved');
      setTimeout(() => setLinksSaveStatus(null), 3000);
    } catch {
      setLinksSaveStatus('error');
      setTimeout(() => setLinksSaveStatus(null), 4000);
    } finally {
      setLinksUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => filterRole === "All" || u.role === filterRole);
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending');

  const METRICS = [
    { label: "Total Registered Users", value: users.length.toString(), trend: "Live", color: "text-emerald-400" },
    { label: "Active Live Streams", value: feeds.length.toString(), trend: "Live", color: "text-[var(--color-accent)]" },
    { label: "Booking Requests", value: pendingBookings.length.toString(), trend: pendingBookings.length > 0 ? "Action Needed" : "Clear", color: pendingBookings.length > 0 ? "text-amber-400" : "text-emerald-400" },
    { label: "Server Status", value: "Online", trend: "Stable", color: "text-emerald-400" },
  ];

  // ── Admin Login Gate ──
  const devBypass = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && localStorage.getItem('7h_dev_bypass') === 'true';
  const forceLogin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('login') === 'true';

  if ((forceLogin || !devBypass) && (!isLoggedIn || member?.role !== 'admin')) {
    const isWrongRole = isLoggedIn && member?.role !== 'admin';

    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500 opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#0c0c18] border border-white/10 overflow-hidden shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

            <div className="p-10">
              <div className="text-center mb-10">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                  Admin <span className="text-red-500">Access</span>
                </h1>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/30 mt-2">
                  Restricted — Authorized personnel only
                </p>
              </div>

              {isWrongRole ? (
                <div className="text-center">
                  <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                    <p className="text-sm font-bold text-red-400 mb-1">Access Denied</p>
                    <p className="text-[0.7rem] text-white/40">
                      You&apos;re logged in as <strong className="text-white">{member?.name}</strong> ({member?.role}). 
                      Admin privileges are required to access this dashboard.
                    </p>
                  </div>
                  <Link href="/fans" className="text-[0.65rem] text-[var(--color-accent)] hover:text-white uppercase tracking-[0.15em] font-bold transition-colors">
                    ← Back to Fan Dashboard
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleAdminLogin} className="flex flex-col gap-4" autoComplete="off" data-form-type="other">
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@7thheaven.com"
                      autoComplete="off"
                      data-lpignore="true"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Password</label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      data-lpignore="true"
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-colors"
                      required
                    />
                  </div>

                  {adminLoginError && (
                    <p className="text-xs text-rose-400 bg-rose-400/10 px-3 py-2 border border-rose-400/20">{adminLoginError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={adminLoginLoading}
                    className="w-full py-3.5 bg-red-600 text-white font-bold text-sm uppercase tracking-[0.15em] hover:bg-red-500 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  >
                    {adminLoginLoading ? "Authenticating..." : "Sign In as Admin"}
                  </button>
                </form>
              )}

              <p className="mt-8 text-center text-[0.55rem] text-white/15 uppercase tracking-[0.2em]">
                7th Heaven · System Administration
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white pt-24 pb-12 font-sans selection:bg-[var(--color-accent)] selection:text-white relative overflow-x-hidden">
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_10%,transparent_100%)] pointer-events-none" />

      <div className="site-container relative z-10 px-4 md:px-6">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-xl font-black text-amber-400">
              {(member?.name || 'Admin').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-[#0a0a0f] flex items-center justify-center">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="#0a0a0f"><path d="M2 20h20v2H2v-2zm1-7l4 5h10l4-5-3-6-4 4-2-7-2 7-4-4-3 6z" /></svg>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black italic tracking-tight text-white">{member?.name || "System Admin"}</h1>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-400/30 rounded-full text-amber-400 text-[0.55rem] font-bold uppercase tracking-[0.15em]">
                  👑 Admin
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 border border-red-500/50 rounded-full text-red-500 text-[0.55rem] font-bold uppercase tracking-widest animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  God Mode
                </span>
              </div>
              <p className="text-[0.8rem] text-white/40 font-mono">{member?.email || "admin@7thheaven.com"}</p>
              <p className="text-[0.7rem] text-white/30 mt-1">Oversee activity, intercept live feeds, and manage community access in real-time.</p>
            </div>
          </div>
          
          <Link href="/" className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">
            Exit to Site →
          </Link>
        </div>

        {/* === ADMIN TAB TOGGLE === */}
        <div className="flex items-center gap-1 mb-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 w-fit mx-auto shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <button
            onClick={() => { setAdminTab('band'); adminTabRef.current = 'band'; }}
            className={`relative px-8 py-3 rounded-xl text-[0.7rem] font-black uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
              adminTab === 'band'
                ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/80 text-white shadow-[0_0_20px_rgba(133,29,239,0.4)] border border-[var(--color-accent)]/50'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-base">🎸</span>
              Band & Site
            </span>
          </button>
          <button
            onClick={() => { setAdminTab('cruise'); adminTabRef.current = 'cruise'; setUnreadCruiseChat(0); }}
            className={`relative px-8 py-3 rounded-xl text-[0.7rem] font-black uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${
              adminTab === 'cruise'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/50'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-base">🚢</span>
              Cruise
            </span>
            {unreadCruiseChat > 0 && adminTab !== 'cruise' && (
              <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[0.55rem] font-black px-1.5 shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-[bounce_1s_ease-in-out_2] border-2 border-[#0a0a0f]">
                {unreadCruiseChat > 99 ? '99+' : unreadCruiseChat}
              </span>
            )}
          </button>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* ═══  BAND & SITE TAB  ═══════════════════════ */}
        {/* ═══════════════════════════════════════════════ */}
        {adminTab === 'band' && (
          <>

        {/* === SITE ANNOUNCEMENTS === */}
        <div className="mb-14 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-accent)]/60 flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
                <span className="text-lg">📡</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wide text-white uppercase">Band Announcements</h2>
              <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Post band updates & alerts across the entire site</p>
            </div>
          </div>

          <div className="relative">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-[var(--color-accent)]/10 to-transparent blur-[100px] pointer-events-none rounded-full" />
            
            {/* Global Announcement Banner Control */}
            <div className={`relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border ${bannerActive ? 'border-[var(--color-accent)]/50 shadow-[0_0_30px_rgba(133,29,239,0.15)]' : 'border-white/5 hover:border-white/10'} rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col group`}>
              <div className={`absolute inset-0 ${bannerActive ? 'bg-[var(--color-accent)]/5' : 'bg-transparent'} pointer-events-none transition-all duration-500 rounded-2xl`} />
              
              <div className="relative z-10 flex flex-col gap-6">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-xl ${bannerActive ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/40 shadow-[0_0_15px_rgba(133,29,239,0.3)]' : 'bg-white/5 border-white/10 group-hover:bg-white/10'} border flex items-center justify-center text-2xl transition-all duration-500`}>📢</div>
                    <div>
                      <h3 className="text-lg font-black italic tracking-wide text-white">Global Alert Banner</h3>
                      <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Pin a band announcement or urgent notice sitewide</p>
                    </div>
                  </div>
                  {/* Main toggle — auto-saves */}
                  <button 
                    onClick={async () => {
                      const newActive = !bannerActive;
                      setBannerActive(newActive);
                      await updateGlobalBanner({ isActive: newActive });
                    }} 
                    disabled={bannerUpdating}
                    className={`relative px-6 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer shrink-0 overflow-hidden ${bannerActive 
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_0_20px_rgba(133,29,239,0.5)] hover:shadow-[0_0_30px_rgba(133,29,239,0.8)] hover:scale-[1.02]' 
                      : 'bg-[#1c1c24] text-white/50 border-white/10 hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)] hover:bg-[#252530]'
                    } disabled:opacity-50 disabled:hover:scale-100`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${bannerActive ? 'bg-white animate-pulse shadow-[0_0_5px_white]' : 'bg-white/30'}`} />
                      {bannerActive ? 'LIVE ON SITE' : 'OFF'}
                    </span>
                    {bannerActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />}
                  </button>
                </div>
                
                {/* Save status toast */}
                {bannerSaveStatus && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] backdrop-blur-md ${
                    bannerSaveStatus === 'saved' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                  }`}>
                    {bannerSaveStatus === 'saved' ? '✓ Banner updated successfully' : '✕ Failed to update — try again'}
                  </div>
                )}

                {/* Message input */}
                <div className="flex flex-col gap-3 mt-auto">
                  <div className="w-full text-black [&_.ql-editor]:min-h-[200px]">
                    <ReactQuill 
                      theme="snow" 
                      value={bannerText} 
                      onChange={setBannerText} 
                      placeholder="Alert message (e.g. Weather delay tonight)" 
                      className="bg-white rounded-xl overflow-hidden"
                    />
                  </div>

                  {/* Controls row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 bg-black/20 p-2 rounded-xl border border-white/5">
                    <button 
                      onClick={() => updateGlobalBanner()}
                      disabled={bannerUpdating}
                      className="px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-[0.6rem] font-black uppercase tracking-widest rounded-lg border border-[var(--color-accent)]/50 transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(133,29,239,0.3)] hover:shadow-[0_6px_20px_rgba(133,29,239,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {bannerUpdating ? 'Saving...' : 'Dispatch'}
                    </button>

                    {/* Auto-expire buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                      <span className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest shrink-0 mr-2">Expiry:</span>
                      {[
                        { label: '1h', hours: 1 },
                        { label: '3h', hours: 3 },
                        { label: '12h', hours: 12 },
                        { label: '24h', hours: 24 },
                      ].map(({ label, hours }) => {
                        const expiry = new Date(Date.now() + hours * 3600000).toISOString();
                        const isSelected = bannerExpiresAt && Math.abs(new Date(bannerExpiresAt).getTime() - Date.now() - hours * 3600000) < 60000;
                        return (
                          <button 
                            key={label} 
                            type="button" 
                            onClick={async () => {
                              setBannerExpiresAt(expiry);
                              await updateGlobalBanner({ expiresAt: expiry });
                            }}
                            className={`px-3 py-1.5 rounded-md text-[0.55rem] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                              isSelected
                                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-white shadow-[0_0_10px_rgba(133,29,239,0.2)]'
                                : 'border-transparent bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                            }`}
                          >{label}</button>
                        );
                      })}
                      <button 
                        type="button" 
                        onClick={async () => {
                          setBannerExpiresAt(null);
                          await updateGlobalBanner({ expiresAt: null });
                        }}
                        className={`px-3 py-1.5 rounded-md text-[0.55rem] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                          !bannerExpiresAt ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]' : 'border-transparent bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                        }`}
                      >Off</button>
                    </div>
                  </div>
                  
                  {/* Expiry info */}
                  {bannerExpiresAt && (
                    <div className="flex items-center gap-2 text-[0.55rem] px-2 py-1 rounded bg-black/30 border border-white/5 w-fit">
                      <span className="text-white/30 font-bold uppercase tracking-widest">Auto-off at:</span>
                      <span className="font-bold text-amber-400 tracking-wider">{new Date(bannerExpiresAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                      {new Date(bannerExpiresAt) < new Date() && (
                        <span className="font-bold text-rose-400 uppercase tracking-widest px-1.5 rounded bg-rose-500/20">Expired</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {METRICS.map((metric, i) => (
            <div key={i} onClick={() => { if (metric.label === 'Booking Requests') document.getElementById('booking-requests-section')?.scrollIntoView({ behavior: 'smooth' }); }} className={`bg-[#0f0f13] border border-white/5 p-6 rounded-xl flex flex-col justify-between shadow-2xl relative overflow-hidden group ${metric.label === 'Booking Requests' ? 'cursor-pointer' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/40 mb-2">{metric.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-black">{metric.value}</span>
                <span className={`text-[0.6rem] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 rounded ${metric.color}`}>
                  {metric.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 flex flex-col gap-8">

            {/* ── Google Analytics ── */}
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                  Google Analytics
                </h3>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[0.6rem] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Live Data
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* GA Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                  <div className="bg-black/30 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition-colors col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-blue-400/60 mb-2">Active Users</p>
                    <p className="text-2xl font-black text-blue-400">{gaData.activeUsers}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Right now</p>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Sessions</p>
                    <p className="text-2xl font-black text-white">{gaData.sessions.toLocaleString()}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Last 30 days</p>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Page Views</p>
                    <p className="text-2xl font-black text-white">{gaData.pageViews.toLocaleString()}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Total traffic</p>
                  </div>
                  <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-emerald-400/60 mb-2">Conv. Rate</p>
                    <p className="text-2xl font-black text-emerald-400">{gaData.conversionRate}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Traffic → Sale</p>
                  </div>
                  <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-emerald-400/60 mb-2">Rev / Session</p>
                    <p className="text-2xl font-black text-emerald-400">{gaData.revenuePerSession}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Avg Value</p>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1">
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Bounce Rate</p>
                    <p className="text-2xl font-black text-white">{gaData.bounceRate}</p>
                    <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Engagement</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Traffic Sources */}
                  <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
                      Traffic Sources
                    </h4>
                    <div className="space-y-4">
                      {gaData.sources.map((source: any) => (
                        <div key={source.name} className="space-y-1.5">
                          <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider">
                            <span className="text-white/60">{source.name}</span>
                            <span className="text-white/40">{source.value}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500/60 rounded-full"
                              style={{ width: `${source.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Locations */}
                  <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      Top Locations
                    </h4>
                    <div className="space-y-4">
                      {gaData.locations.map((loc: any) => (
                        <div key={loc.city} className="space-y-1.5">
                          <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider">
                            <span className="text-white/60">{loc.city}</span>
                            <span className="text-white/40">{loc.percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500/60 rounded-full"
                              style={{ width: `${loc.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversion Funnel */}
                  <div className="bg-black/20 border border-white/5 rounded-xl p-5">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                      Conversion Funnel
                    </h4>
                    <div className="space-y-4 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-px bg-white/10" />
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-[0.6rem] font-black text-blue-400">100%</div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60">Site Visitors</p>
                          <p className="text-[0.55rem] text-white/30">{gaData.sessions.toLocaleString()} sessions</p>
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[0.6rem] font-black text-purple-400">12%</div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60">Added to Cart</p>
                          <p className="text-[0.55rem] text-white/30">{Math.floor(gaData.sessions * 0.12)} sessions</p>
                        </div>
                      </div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[0.6rem] font-black text-emerald-400">{gaData.conversionRate}</div>
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-widest text-white/60">Purchased</p>
                          <p className="text-[0.55rem] text-white/30">{Math.floor(gaData.sessions * 0.038)} orders</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hotspot Analytics Map */}
                <div className="mt-6 bg-black/20 border border-white/5 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(66,133,244,0.1)_0%,transparent_70%)] opacity-50 pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 w-full relative">
                      <AdminMap locations={gaData.locations} />
                    </div>
                    <div className="w-full md:w-64 shrink-0 space-y-4">
                      <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40 mb-2 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        Traffic Heatmap
                      </h4>
                      <p className="text-[0.6rem] text-white/40 leading-relaxed mb-4">
                        Real-time visualization of high-density traffic areas to assist with targeted tour routing.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                          <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Chicago (Primary)
                        </div>
                        <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Nashville (Growing)
                        </div>
                        <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/60">
                          <span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Los Angeles
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection Notice */}
                <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-1 sm:mt-0">✅</span>
                    <div>
                      <p className="text-xs font-bold text-white/80">Google Analytics Active</p>
                      <p className="text-[0.6rem] text-white/40 uppercase tracking-widest leading-relaxed">
                        Tracking Live with ID: <span className="text-emerald-400 font-mono">G-HS8X0ZD66V</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Handoff Reminder Notice */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 w-full sm:w-auto">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400 text-sm">⚠️</span>
                      <div>
                        <p className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-widest">Handoff Reminder</p>
                        <p className="text-[0.6rem] text-white/60 leading-snug mt-1 max-w-[280px]">
                          To link GA4 with Shopify data: Go to Shopify Admin → Online Store → Preferences. Scroll to Google Analytics and paste the same ID: <strong className="text-white">G-HS8X0ZD66V</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>


            {/* ── Shopify Sales Dashboard ── */}
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#96bf48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Shopify Sales
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex bg-black rounded p-1 border border-white/10">
                    {[7, 30, 90].map(d => (
                      <button
                        key={d}
                        onClick={async () => {
                          setShopifyPeriod(d);
                          setShopifyLoading(true);
                          try {
                            const res = await fetch(`/api/shopify/orders?days=${d}`);
                            if (res.ok) { setShopifyData(await res.json()); setShopifyError(''); }
                          } catch {}
                          setShopifyLoading(false);
                        }}
                        className={`px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors ${shopifyPeriod === d ? 'bg-[#96bf48]/20 text-[#96bf48]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      setShopifyLoading(true);
                      try {
                        const res = await fetch(`/api/shopify/orders?days=${shopifyPeriod}`);
                        if (res.ok) { setShopifyData(await res.json()); setShopifyError(''); }
                      } catch {}
                      setShopifyLoading(false);
                    }}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[0.6rem] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  >
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {shopifyLoading ? (
                <div className="p-16 text-center text-white/30 font-mono text-xs animate-pulse">Pulling Shopify analytics...</div>
              ) : shopifyError ? (
                <div className="p-16 text-center">
                  <span className="text-4xl opacity-20 block mb-4">🛒</span>
                  <p className="text-white/40 text-sm">{shopifyError}</p>
                  <p className="text-white/20 text-xs mt-2">Check your Shopify Admin API credentials in .env.local</p>
                </div>
              ) : shopifyData?.mode === 'inventory' ? (
                <div className="p-6">
                  {shopifyData.needsOrderScope && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                      <span className="text-amber-400 text-lg">⚠️</span>
                      <div>
                        <p className="text-sm font-bold text-amber-400">Orders Access Not Enabled</p>
                        <p className="text-[0.7rem] text-white/40 mt-1">To see sales data, enable <code className="text-amber-300">read_orders</code> in Shopify Admin → Settings → Apps → Your app → Admin API scopes. Showing inventory data instead.</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-black/30 border border-[#96bf48]/20 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#96bf48]/60 mb-2">Inventory Value</p>
                      <p className="text-2xl font-black text-[#96bf48]">${shopifyData.summary.inventoryValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Retail value on hand</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Products</p>
                      <p className="text-2xl font-black text-white">{shopifyData.summary.totalProducts}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">{shopifyData.summary.totalVariants} variants</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Total Units</p>
                      <p className="text-2xl font-black text-white">{shopifyData.summary.totalInventory}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">In stock</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Avg Price</p>
                      <p className="text-2xl font-black text-white">${shopifyData.summary.totalInventory > 0 ? (shopifyData.summary.inventoryValue / shopifyData.summary.totalInventory).toFixed(2) : '0.00'}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Per unit</p>
                    </div>
                  </div>
                  <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5"><h4 className="text-sm font-bold flex items-center gap-2">📦 Product Inventory</h4></div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left">
                        <thead><tr className="text-[0.55rem] uppercase tracking-widest text-white/25">
                          <th className="px-4 py-3 font-bold border-b border-white/5">Product</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Price</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Stock</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Value</th>
                        </tr></thead>
                        <tbody>
                          {shopifyData.products.map((p: any, i: number) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover border border-white/10" />}
                                  <span className="text-sm font-bold truncate max-w-[200px]">{p.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm text-white/60">${p.minPrice.toFixed(2)}{p.maxPrice !== p.minPrice ? ` – $${p.maxPrice.toFixed(2)}` : ''}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`font-mono text-sm font-bold ${p.inventory <= 0 ? 'text-rose-400' : p.inventory < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{p.inventory}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[#96bf48]">${(p.minPrice * p.inventory).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : shopifyData ? (
                <div className="p-6">
                  {/* Revenue Metrics Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-black/30 border border-[#96bf48]/20 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#96bf48]/60 mb-2">Total Revenue</p>
                      <p className="text-2xl font-black text-[#96bf48]">${shopifyData.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Last {shopifyData.period}</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Orders</p>
                      <p className="text-2xl font-black text-white">{shopifyData.summary.totalOrders}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">
                        {shopifyData.statusBreakdown.fulfilled} fulfilled · {shopifyData.statusBreakdown.unfulfilled} pending
                      </p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Avg Order Value</p>
                      <p className="text-2xl font-black text-white">${shopifyData.summary.avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-[0.55rem] text-white/30 mt-1 uppercase tracking-widest">Per transaction</p>
                    </div>
                    <div className="bg-black/30 border border-white/10 rounded-xl p-5">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40 mb-2">Net Revenue</p>
                      <p className="text-2xl font-black text-emerald-400">${shopifyData.summary.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      {shopifyData.summary.totalRefunded > 0 && (
                        <p className="text-[0.55rem] text-rose-400 mt-1 uppercase tracking-widest">
                          -${shopifyData.summary.totalRefunded.toFixed(2)} refunded
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Two Column: Top Products + Revenue Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Products */}
                    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/5">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          🏆 Top Products
                        </h4>
                      </div>
                      <div className="p-0">
                        {shopifyData.topProducts.length === 0 ? (
                          <div className="p-8 text-center text-white/30 text-xs">No product data</div>
                        ) : (
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[0.55rem] uppercase tracking-widest text-white/25">
                                <th className="px-4 py-3 font-bold border-b border-white/5">Product</th>
                                <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Qty</th>
                                <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Revenue</th>
                              </tr>
                            </thead>
                            <tbody>
                              {shopifyData.topProducts.map((p: any, i: number) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[0.55rem] font-black shrink-0 ${
                                        i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                        i === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                                        i === 2 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' :
                                        'bg-white/5 text-white/30 border border-white/10'
                                      }`}>{i + 1}</span>
                                      <span className="text-sm font-bold truncate max-w-[180px]">{p.title}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono text-sm text-white/60">{p.qty}</td>
                                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[#96bf48]">${p.revenue.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {/* Daily Revenue Mini-Chart */}
                    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/5">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          📈 Daily Revenue
                        </h4>
                      </div>
                      <div className="p-4">
                        {Object.keys(shopifyData.dailyRevenue).length === 0 ? (
                          <div className="p-8 text-center text-white/30 text-xs">No data in this period</div>
                        ) : (
                          <div className="space-y-2">
                            {Object.entries(shopifyData.dailyRevenue)
                              .sort(([a], [b]) => a.localeCompare(b))
                              .slice(-14)
                              .map(([date, amount]: [string, any]) => {
                                const maxRevenue = Math.max(...Object.values(shopifyData.dailyRevenue).map(Number));
                                const pct = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
                                return (
                                  <div key={date} className="flex items-center gap-3">
                                    <span className="text-[0.6rem] font-mono text-white/30 w-16 shrink-0">
                                      {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-[#96bf48]/60 to-[#96bf48] rounded-full transition-all duration-500"
                                        style={{ width: `${Math.max(pct, 2)}%` }}
                                      />
                                    </div>
                                    <span className="text-[0.65rem] font-mono font-bold text-white/60 w-16 text-right">${Number(amount).toFixed(0)}</span>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        📦 Recent Orders
                      </h4>
                      <span className="text-[0.55rem] text-white/30 uppercase tracking-widest">{shopifyData.orders.length} orders</span>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {shopifyData.orders.length === 0 ? (
                        <div className="p-8 text-center text-white/30 text-xs">No orders in this period</div>
                      ) : (
                        <table className="w-full text-left">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-[#0f0f13] text-[0.55rem] uppercase tracking-widest text-white/25">
                              <th className="px-4 py-3 font-bold border-b border-white/5">Order</th>
                              <th className="px-4 py-3 font-bold border-b border-white/5">Customer</th>
                              <th className="px-4 py-3 font-bold border-b border-white/5">Items</th>
                              <th className="px-4 py-3 font-bold border-b border-white/5">Status</th>
                              <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shopifyData.orders.map((order: any) => (
                              <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-mono text-sm font-bold text-[#96bf48]">{order.name}</div>
                                  <div className="text-[0.55rem] text-white/30">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm font-bold truncate max-w-[120px]">{order.customer.name}</div>
                                  {order.customer.ordersCount > 1 && (
                                    <span className="text-[0.5rem] text-[var(--color-accent)] font-bold uppercase tracking-widest">Repeat ({order.customer.ordersCount}×)</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-white/60">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col gap-1">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest w-fit ${
                                      order.financialStatus === 'PAID' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : order.financialStatus === 'REFUNDED' || order.financialStatus === 'PARTIALLY_REFUNDED' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    }`}>{order.financialStatus?.toLowerCase().replace('_', ' ')}</span>
                                    {order.fulfillmentStatus && (
                                      <span className={`inline-block px-2 py-0.5 rounded text-[0.5rem] font-bold uppercase tracking-widest w-fit ${
                                        order.fulfillmentStatus === 'FULFILLED' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                        : 'bg-white/5 text-white/30 border border-white/10'
                                      }`}>{order.fulfillmentStatus?.toLowerCase()}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className="font-mono text-sm font-bold">${order.total.toFixed(2)}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Product Inventory (always shown in orders mode too) */}
                  {shopifyData.products && shopifyData.products.length > 0 && (
                    <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden mt-8">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h4 className="text-sm font-bold flex items-center gap-2">📦 Product Inventory</h4>
                        {shopifyData.inventory && (
                          <span className="text-[0.55rem] text-white/30 uppercase tracking-widest">
                            {shopifyData.inventory.totalInventory} units · ${shopifyData.inventory.inventoryValue?.toLocaleString()} value
                          </span>
                        )}
                      </div>
                      <table className="w-full text-left">
                        <thead><tr className="text-[0.55rem] uppercase tracking-widest text-white/25">
                          <th className="px-4 py-3 font-bold border-b border-white/5">Product</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Price</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Stock</th>
                          <th className="px-4 py-3 font-bold border-b border-white/5 text-right">Value</th>
                        </tr></thead>
                        <tbody>
                          {shopifyData.products.map((p: any, i: number) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover border border-white/10" />}
                                  <span className="text-sm font-bold truncate max-w-[200px]">{p.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm text-white/60">${p.minPrice.toFixed(2)}{p.maxPrice !== p.minPrice ? ` – $${p.maxPrice.toFixed(2)}` : ''}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`font-mono text-sm font-bold ${p.inventory <= 0 ? 'text-rose-400' : p.inventory < 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{p.inventory}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[#96bf48]">${(p.minPrice * p.inventory).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </section>


            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  Active Live Streams
                </h3>
                <span className="text-[0.65rem] text-white/40 uppercase tracking-widest">{feeds.length} Online</span>
              </div>
              <div className="p-0">
                {isLoading ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs animate-pulse">Scanning network...</div>
                ) : feeds.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No active streams detected across infrastructure.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] text-white/30 text-[0.6rem] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-white/5 w-1/3">Stream Name</th>
                        <th className="p-4 font-bold border-b border-white/5">Host</th>
                        <th className="p-4 font-bold border-b border-white/5">Viewers</th>
                        <th className="p-4 font-bold border-b border-white/5">Merch Sales</th>
                        <th className="p-4 font-bold border-b border-white/5 text-right w-1/6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeds.map((feed) => (
                        <tr key={feed.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-bold flex items-center gap-2 text-sm">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                              {feed.isSimulated && feed.route ? (
                                <Link href={feed.route} className="truncate block hover:text-[var(--color-accent)] transition-colors">{feed.name}</Link>
                              ) : (
                                <span className="truncate block">{feed.name}</span>
                              )}
                              {feed.isSimulated && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-[0.5rem] font-bold uppercase tracking-wider text-emerald-400 shrink-0">Demo</span>
                              )}
                            </div>
                            <div className="text-white/40 text-[0.6rem] uppercase tracking-wider mt-1">Uptime: {feed.uptime}</div>
                          </td>
                          <td className="p-4 text-sm text-white/70">{feed.host}</td>
                          <td className="p-4 font-mono text-sm">{feed.viewers.toLocaleString()}</td>
                          <td className="p-4 font-mono text-sm font-bold text-emerald-400">
                             {feed.revenue !== undefined ? `$${feed.revenue.toLocaleString()}` : '$0'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={feed.isSimulated && feed.route ? feed.route : `/live/${feed.id}`}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all inline-block"
                              >
                                View
                              </Link>
                              <button 
                                onClick={() => killStream(feed)}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all"
                              >
                                Shut Down
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            
            {/* Booking Requests Section */}
            <section id="booking-requests-section" className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Booking Requests
                </h3>
                <span className={`px-3 py-1 ${pendingBookings.length > 0 ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'} border rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2`}>
                  {pendingBookings.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                  {pendingBookings.length} Pending
                </span>
              </div>
              <div className="p-0">
                {bookings.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No booking requests received yet.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] text-white/30 text-[0.6rem] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-white/5">ID</th>
                        <th className="p-4 font-bold border-b border-white/5">Client</th>
                        <th className="p-4 font-bold border-b border-white/5">Event Type</th>
                        <th className="p-4 font-bold border-b border-white/5">Date</th>
                        <th className="p-4 font-bold border-b border-white/5">Venue</th>
                        <th className="p-4 font-bold border-b border-white/5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice().reverse().map((b: any) => (
                        <React.Fragment key={b.bookingId}>
                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono text-[0.75rem] text-[var(--color-accent)] font-bold cursor-pointer hover:underline" onClick={() => setExpandedBooking(prev => prev === b.bookingId ? null : b.bookingId)}>
                            {expandedBooking === b.bookingId ? '▼' : '▶'} {b.bookingId}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-sm">{b.name}</div>
                            <div className="text-[0.65rem] text-white/40">{b.email}</div>
                          </td>
                          <td className="p-4 text-sm text-white/70 capitalize">{b.eventType?.replace('_', ' ')}</td>
                          <td className="p-4 text-sm text-white/70">{b.eventDate}</td>
                          <td className="p-4">
                            <div className="text-sm text-white/70 truncate max-w-[150px]">{b.venueName || '–'}</div>
                            <div className="text-[0.6rem] text-white/30">{b.venueCity}, {b.venueState}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-widest ${
                                b.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : b.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}>{b.status}</span>
                              {b.status === 'pending' && (
                                <div className="flex gap-1 ml-1">
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Approve booking ${b.bookingId}?`)) return;
                                      const res = await fetch('/api/booking', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: b.bookingId, status: 'confirmed' }) });
                                      if (res.ok) { setBookings((prev: any[]) => prev.map((bk: any) => bk.bookingId === b.bookingId ? { ...bk, status: 'confirmed' } : bk)); }
                                    }}
                                    className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 text-[0.5rem] font-bold uppercase tracking-widest rounded transition-all"
                                  >✓</button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Reject booking ${b.bookingId}?`)) return;
                                      const res = await fetch('/api/booking', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: b.bookingId, status: 'cancelled' }) });
                                      if (res.ok) { setBookings((prev: any[]) => prev.map((bk: any) => bk.bookingId === b.bookingId ? { ...bk, status: 'cancelled' } : bk)); }
                                    }}
                                    className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-black border border-rose-500/20 text-[0.5rem] font-bold uppercase tracking-widest rounded transition-all"
                                  >✕</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedBooking === b.bookingId && (
                          <tr>
                            <td colSpan={6} className="p-4 bg-[#060609]">
                              <ShowCrewPanel bookingId={b.bookingId} eventDate={b.eventDate} venueName={b.venueName || 'TBD'} />
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            {/* ── Event Planners Directory ── */}
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Event Planners Directory
                </h3>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2 text-white/40">
                  {Array.from(new Map(bookings.filter(b => b.email).map(b => [b.email, b])).values()).length} Planners
                </span>
              </div>
              <div className="p-0">
                {bookings.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No planners found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {Array.from(new Map(bookings.filter(b => b.email).map(b => [b.email, b])).values()).map((planner: any) => (
                      <div key={planner.email} className="bg-black/20 border border-white/5 rounded-xl p-5 hover:border-[var(--color-accent)]/50 transition-colors group flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-accent)]/5 flex items-center justify-center text-lg font-black text-[var(--color-accent)] shrink-0 border border-[var(--color-accent)]/20">
                              {planner.name?.substring(0, 2).toUpperCase() || 'EP'}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-white text-sm truncate">{planner.name || 'Unknown Planner'}</h4>
                              <p className="text-[0.65rem] text-white/40 truncate uppercase tracking-widest">{planner.venueName || planner.eventType?.replace('_', ' ') || 'Event Planner'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-6">
                            {planner.email && (
                              <div className="flex items-center gap-2 text-[0.65rem] text-white/60">
                                <span className="text-[var(--color-accent)] text-xs">✉</span> <span className="truncate">{planner.email}</span>
                              </div>
                            )}
                            {planner.phone ? (
                              <div className="flex items-center gap-2 text-[0.65rem] text-white/60">
                                <span className="text-[var(--color-accent)] text-xs">☏</span> {planner.phone}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-[0.65rem] text-white/30 italic">
                                <span className="text-white/20 text-xs">☏</span> No phone provided
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                          <a href={`mailto:${planner.email}`} onClick={() => setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Admin initiated email to planner ${planner.name}`, time: 'Just now', color: 'bg-emerald-500' }, ...prev])} className="flex-1 py-2 text-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[0.6rem] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
                            Email
                          </a>
                          {planner.phone ? (
                            <a href={`sms:${planner.phone.replace(/[^0-9]/g, '')}`} onClick={() => setAuditLog(prev => [{ id: crypto.randomUUID(), text: `Admin initiated SMS to planner ${planner.name}`, time: 'Just now', color: 'bg-blue-500' }, ...prev])} className="flex-1 py-2 text-center bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 rounded text-[0.6rem] font-bold uppercase tracking-widest text-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all">
                              Text
                            </a>
                          ) : (
                            <button disabled className="flex-1 py-2 text-center bg-white/5 border border-white/10 rounded text-[0.6rem] font-bold uppercase tracking-widest text-white/20 cursor-not-allowed">
                              No Phone
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>


            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Fan Photo Moderation Queue
                </h3>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full text-[0.6rem] uppercase font-bold tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {moderationQueue.length} Pending
                </span>
              </div>
              <div className="p-0">
                {moderationQueue.length === 0 ? (
                  <div className="p-16 text-center text-white/30 text-sm">
                     <span className="text-4xl opacity-20 block mb-4">🏆</span>
                     Queue is entirely empty. All fan content is categorized.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {moderationQueue.map((photo) => (
                      <div key={photo.id} className="group relative bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden shadow-xl hover:border-[var(--color-accent)]/50 transition-colors">
                        <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                          <img src={photo.src} alt="Fan Upload" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-0 right-0 m-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded border border-white/10 text-white font-mono text-[0.6rem] uppercase tracking-widest shadow-xl">
                            {new Date(photo.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-sm font-bold truncate">
                            <span className="text-[var(--color-accent)]">@</span>
                            {photo.name}
                          </div>
                          {photo.venue && <p className="text-[0.65rem] font-bold tracking-widest uppercase text-white/40 truncate">📍 {photo.venue}</p>}
                          {photo.caption && <p className="text-sm text-white/70 italic border-l-2 border-[var(--color-accent)]/30 pl-3 mt-2">"{photo.caption}"</p>}
                        </div>
                        <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                          <button onClick={() => moderatePhoto(photo.id, 'reject')} className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            Reject & Delete
                          </button>
                          <button onClick={() => moderatePhoto(photo.id, 'approve')} className="py-3 text-[0.6rem] font-black uppercase tracking-widest text-[#050505] bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                            Safe & Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>


            {/* ── Invite Challenge ── */}
            <section className="mt-8">
              <InviteChallengePanel shows={smsShows} />
            </section>

            {/* ── SMS Proximity Blast — Fan Show Alerts ── */}
            <section className="bg-[#0f0f13] border border-rose-500/20 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div className="p-6 border-b border-rose-500/10 flex items-center justify-between bg-gradient-to-r from-rose-500/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl">📡</div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white">SMS Proximity Blast</h3>
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-rose-400/60 font-bold mt-0.5">Auto-text fans near an upcoming show</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Auto-blast toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-[0.55rem] font-bold uppercase tracking-widest text-white/30">Auto-Blast</span>
                    <button
                      onClick={async () => {
                        const newVal = !smsAutoBlast;
                        setSmsAutoBlast(newVal);
                        try {
                          await fetch('/api/admin/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key: 'sms_auto_blast', value: newVal ? 'on' : 'off' }),
                          });
                        } catch {}
                      }}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${smsAutoBlast ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${smsAutoBlast ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <span className="text-[0.6rem] text-rose-400/60 uppercase tracking-widest font-bold">
                    {smsShows.length} upcoming show{smsShows.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Auto-blast info bar */}
              <div className={`px-6 py-3 border-b border-white/5 flex items-center justify-between ${smsAutoBlast ? 'bg-emerald-500/5' : 'bg-white/[0.01]'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${smsAutoBlast ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />
                  <span className="text-[0.65rem] text-white/40">
                    {smsAutoBlast
                      ? `Auto-sending ${smsAutoBlastDays} day${smsAutoBlastDays !== 1 ? 's' : ''} before each public show`
                      : 'Auto-blast disabled — manual sends only'}
                  </span>
                </div>
                {smsAutoBlast && (
                  <div className="flex items-center gap-2">
                    <span className="text-[0.5rem] font-bold uppercase tracking-widest text-white/25">Days before:</span>
                    <select
                      value={smsAutoBlastDays}
                      onChange={async (e) => {
                        const v = parseInt(e.target.value, 10);
                        setSmsAutoBlastDays(v);
                        try {
                          await fetch('/api/admin/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key: 'sms_auto_blast_days', value: String(v) }),
                          });
                        } catch {}
                      }}
                      className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[0.7rem] text-white outline-none cursor-pointer [color-scheme:dark]"
                    >
                      {[1,2,3,5,7].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-6">
                <p className="text-[0.7rem] text-white/40 mb-5">
                  {smsAutoBlast
                    ? 'Blasts auto-send for public shows. You can still manually send or override below. Private events are always excluded.'
                    : 'Pick an upcoming show and we\u0027ll auto-compose a text with all the details. Only fans subscribed within proximity of the venue will receive it.'}
                </p>

                {/* Show Picker */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Select Show</label>
                    <select
                      value={smsSelectedShow}
                      onChange={e => {
                        setSmsSelectedShow(e.target.value);
                        setSmsResult(null);
                        const show = smsShows.find((s: any) => s._id === e.target.value);
                        if (show) {
                          const location = show.state ? `${show.city}, ${show.state}` : show.city;
                          const dateStr = (() => {
                            try {
                              const d = new Date(show.date + 'T12:00:00');
                              return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                            } catch { return show.date; }
                          })();
                          const lines: string[] = [
                            `🎸 7th Heaven is playing in your area!`,
                            ``,
                            `📍 ${show.venue} — ${location}`,
                          ];
                          if (dateStr) lines.push(`📅 ${dateStr}`);
                          if (show.doorsTime && show.time) {
                            lines.push(`🚪 Doors: ${show.doorsTime} | Show: ${show.time}`);
                          } else if (show.time) {
                            lines.push(`🕗 Show: ${show.time}`);
                          } else if (show.doorsTime) {
                            lines.push(`🚪 Doors: ${show.doorsTime}`);
                          }
                          if (show.allAges === true) lines.push(`✅ All Ages`);
                          else if (show.allAges === false) lines.push(`🔞 21+`);
                          if (show.cover) {
                            const lc = show.cover.toLowerCase();
                            if (lc === 'free' || lc === 'no cover' || lc === '$0') lines.push(`🎟️ FREE — No Cover`);
                            else lines.push(`🎟️ Cover: ${show.cover}`);
                          }
                          lines.push(``);
                          lines.push(`Reply STOP to unsubscribe.`);
                          setSmsPreview(lines.join('\n'));
                        } else {
                          setSmsPreview('');
                        }
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors appearance-none cursor-pointer"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ffffff40' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                    >
                      <option value="">— Select an upcoming show —</option>
                      {smsShows.map((show: any) => {
                        const dateStr = (() => {
                          try {
                            const d = new Date(show.date + 'T12:00:00');
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          } catch { return show.date; }
                        })();
                        const loc = show.state ? `${show.city}, ${show.state}` : show.city;
                        return (
                          <option key={show._id} value={show._id}>
                            {dateStr} — {show.venue} ({loc}) {show.time ? `@ ${show.time}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Message Preview */}
                  {smsPreview && (
                    <div>
                      <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Message Preview</label>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-4 relative">
                        <pre className="text-sm text-white/80 font-mono leading-relaxed whitespace-pre-wrap">{smsPreview}</pre>
                        <span className="absolute top-3 right-3 text-[0.5rem] font-bold text-white/20 uppercase tracking-widest">
                          {smsPreview.length} chars
                        </span>
                      </div>

                      {/* Missing field hints */}
                      {(() => {
                        const show = smsShows.find((s: any) => s._id === smsSelectedShow);
                        if (!show) return null;
                        const missing: string[] = [];
                        if (!show.doorsTime) missing.push('Doors Time');
                        if (show.allAges === undefined || show.allAges === null) missing.push('All Ages');
                        if (!show.cover) missing.push('Cover/Admission');
                        if (!show.time) missing.push('Show Time');
                        if (missing.length === 0) return null;
                        return (
                          <p className="mt-2 text-[0.6rem] text-amber-400/80 flex items-center gap-1.5">
                            <span>⚠</span> Missing from Sanity: <strong>{missing.join(', ')}</strong> — add in <a href="/studio" className="underline hover:text-white transition-colors">Studio</a> to enrich the message
                          </p>
                        );
                      })()}
                    </div>
                  )}

                  {/* Custom message override */}
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">
                      Custom Message Override <span className="text-white/20 normal-case">(optional — replaces auto-message)</span>
                    </label>
                    <div className="w-full text-black [&_.ql-editor]:min-h-[120px] relative z-20">
                      <ReactQuill
                        theme="snow"
                        value={smsCustomMsg}
                        onChange={setSmsCustomMsg}
                        placeholder="Leave empty to use the auto-generated message above"
                        className="bg-white rounded-xl overflow-hidden"
                      />
                    </div>
                  </div>

                  {/* Send controls */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {smsResult && (
                        <div className={`text-sm font-bold ${smsResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {smsResult.success ? (
                            <>
                              ✓ {smsResult.sent !== undefined ? `Sent to ${smsResult.sent} fan${smsResult.sent !== 1 ? 's' : ''}` : smsResult.message}
                              {smsResult.note && <span className="text-amber-400 ml-2 text-xs">({smsResult.note})</span>}
                            </>
                          ) : (
                            <>✕ {smsResult.error}</>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      disabled={smsSending || !smsSelectedShow}
                      onClick={async () => {
                        const show = smsShows.find((s: any) => s._id === smsSelectedShow);
                        if (!show) return;
                        const recipientDesc = `fans near ${show.venue}`;
                        if (!confirm(`Send proximity SMS to ${recipientDesc}?`)) return;
                        setSmsSending(true);
                        setSmsResult(null);
                        try {
                          const body: any = {
                            venue: show.venue,
                            city: show.city,
                            state: show.state || '',
                            lat: show.lat,
                            lng: show.lng,
                          };
                          if (smsCustomMsg.replace(/<[^>]*>/g, '').trim()) {
                            body.message = smsCustomMsg;
                          } else {
                            const d = new Date(show.date + 'T12:00:00');
                            body.date = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                            body.time = show.time || '';
                            body.doorsTime = show.doorsTime || '';
                            if (show.allAges !== undefined && show.allAges !== null) body.allAges = show.allAges;
                            if (show.cover) body.cover = show.cover;
                          }
                          const res = await fetch('/api/sms/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body),
                          });
                          const data = await res.json();
                          setSmsResult(data);
                        } catch (err: any) {
                          setSmsResult({ error: err.message });
                        }
                        setSmsSending(false);
                      }}
                      className="px-6 py-3 bg-rose-500 hover:bg-rose-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                    >
                      {smsSending ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <>📡 Send Proximity Blast</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>


            {/* ── Crew SMS Alert ── */}
            <section className="bg-[#0f0f13] border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div className="p-6 border-b border-amber-500/10 flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-transparent">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  🛡️ Crew SMS Alert
                </h3>
                {crewAlertStats && (
                  <span className="text-[0.6rem] text-amber-400/60 uppercase tracking-widest font-bold">
                    {crewAlertStats.totalCrew} crew · {crewAlertStats.withPhone} with phone
                  </span>
                )}
              </div>
              <div className="p-6">
                <p className="text-[0.7rem] text-white/40 mb-4">
                  Send an instant text message to all crew members & admins. Use for urgent updates, schedule changes, or show-day alerts.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Alert Message</label>
                    <textarea
                      value={crewAlertMsg}
                      onChange={e => setCrewAlertMsg(e.target.value)}
                      placeholder="e.g. Load-in moved to 3PM. Doors at 6. See you there."
                      rows={3}
                      maxLength={320}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[0.55rem] text-white/20">{crewAlertMsg.length}/320 characters</span>
                      {crewAlertStats?.withPhone === 0 && (
                        <span className="text-[0.55rem] text-amber-400">⚠ No crew members have phone numbers on file</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {crewAlertResult && (
                        <p className={`text-sm font-bold ${crewAlertResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {crewAlertResult.success
                            ? `✓ Sent to ${crewAlertResult.sent} crew member${crewAlertResult.sent !== 1 ? 's' : ''}${crewAlertResult.dev ? ' (dev mode)' : ''}`
                            : `✕ ${crewAlertResult.error}`}
                          {crewAlertResult.failed > 0 && <span className="text-rose-400 ml-2">({crewAlertResult.failed} failed)</span>}
                        </p>
                      )}
                    </div>
                    <button
                      disabled={crewAlertSending || !crewAlertMsg.trim()}
                      onClick={async () => {
                        if (!confirm(`Send this text to ALL ${crewAlertStats?.withPhone || 0} crew members?`)) return;
                        setCrewAlertSending(true);
                        setCrewAlertResult(null);
                        try {
                          const res = await fetch('/api/admin/crew-alert', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: crewAlertMsg }),
                          });
                          const data = await res.json();
                          setCrewAlertResult(data);
                          if (data.success) setCrewAlertMsg('');
                        } catch (err: any) {
                          setCrewAlertResult({ error: err.message });
                        }
                        setCrewAlertSending(false);
                      }}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-sm uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    >
                      {crewAlertSending ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <>📱 Send Crew Alert</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>


            {/* ── Newsletter Blast ── */}
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl mt-8">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Newsletter Blast
                </h3>
                {fanData && <span className="text-[0.6rem] text-white/30 uppercase tracking-widest">{fanData.total + (fanData.newsletterSubscribers || 0)} recipients ({fanData.total} fans + {fanData.newsletterSubscribers || 0} subscribers)</span>}
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Subject Line</label>
                    <input
                      type="text"
                      value={blastSubject}
                      onChange={e => setBlastSubject(e.target.value)}
                      placeholder="e.g. 🎸 New Show Announced — Chicago June 15th!"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40 mb-2 block">Message Body</label>
                    <textarea
                      value={blastBody}
                      onChange={e => setBlastBody(e.target.value)}
                      placeholder="Write your announcement here..."
                      rows={6}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {blastResult && (
                        <p className={`text-sm font-bold ${blastResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {blastResult.success ? `✓ Sent to ${blastResult.sent} fans` : `✕ ${blastResult.error}`}
                          {blastResult.failed > 0 && <span className="text-rose-400 ml-2">({blastResult.failed} failed)</span>}
                        </p>
                      )}
                    </div>
                    <button
                      disabled={blastSending || !blastSubject.trim() || !blastBody.trim()}
                      onClick={async () => {
                        if (!confirm(`Send this email to ALL ${fanData?.total || 0} fans?`)) return;
                        setBlastSending(true);
                        setBlastResult(null);
                        try {
                          const res = await fetch('/api/admin/newsletter', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ subject: blastSubject, body: blastBody }),
                          });
                          const data = await res.json();
                          setBlastResult(data);
                          if (data.success) { setBlastSubject(''); setBlastBody(''); }
                        } catch (err: any) {
                          setBlastResult({ error: err.message });
                        }
                        setBlastSending(false);
                      }}
                      className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-sm uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                    >
                      {blastSending ? (
                        <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <>📨 Send Blast</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>


            {/* ── Community Registry ── */}
            <section ref={registryRef} className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl scroll-mt-24">
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Community Registry
                </h3>
                <div className="flex items-center gap-4 w-full sm:w-auto">
  {users.length === 0 && (
    <button onClick={seedData} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[0.6rem] uppercase font-bold tracking-widest hover:bg-emerald-500 transition-colors hover:text-white shrink-0">
      Generate Mock Profiles
    </button>
  )}
  <div className="flex bg-black rounded p-1 border border-white/10 overflow-x-auto shrink-0 w-full sm:w-auto">
    {['All', 'fan', 'crew', 'admin'].map(role => (
      <button
        key={role}
        onClick={() => setFilterRole(role as any)}
        className={`px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-widest rounded transition-colors whitespace-nowrap ${filterRole === role ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
      >
        {role}
      </button>
    ))}
  </div>
</div>
               </div>

              

              <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs animate-pulse">Pulling registry data...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-white/30 font-mono text-xs">No users found matching this filter.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] text-white/30 text-[0.6rem] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-white/5">User</th>
                        <th className="p-4 font-bold border-b border-white/5">Role</th>
                        <th className="p-4 font-bold border-b border-white/5">Status</th>
                        <th className="p-4 font-bold border-b border-white/5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const accounts = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('7h_accounts') || '{}') : {};
                        const acct = Object.values(accounts).find((a: any) => 
                          (a.id && a.id === user.id) || 
                          (a.email && user.email && a.email.toLowerCase() === user.email.toLowerCase()) ||
                          (a.name && a.name.toLowerCase() === user.name.toLowerCase())
                        ) as any;
                        return (
                        <React.Fragment key={user.id}>
                        <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-bold text-sm truncate max-w-[150px]">{user.name}</td>
                          <td className="p-4 text-sm">
                            <span className={`px-2 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-widest ${user.role === 'crew' || user.role === 'admin' ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'bg-white/5 text-white/60 border border-white/10'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                user.status === 'streaming' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                : user.status === 'watching' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                              }`} />
                              <span className="text-[0.6rem] uppercase tracking-wider text-white/50">{user.status}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {user.role !== 'admin' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => setViewingUser(viewingUser === user.id ? null : user.id)}
                                  className="px-3 py-2 bg-transparent border border-white/10 text-white/40 hover:bg-white/5 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all"
                                >
                                  {viewingUser === user.id ? 'Hide' : 'View'}
                                </button>
                                <button 
                                  onClick={() => banUser(user.id, user.name)}
                                  className="px-3 py-2 bg-transparent border border-red-500/30 text-red-500 hover:bg-red-500 hover:border-red-500 hover:text-white text-[0.6rem] font-bold uppercase tracking-widest rounded transition-all"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <span className="px-4 py-2 inline-block text-[0.55rem] uppercase font-bold tracking-widest text-white/20">
                                Protected
                              </span>
                            )}
                          </td>
                        </tr>
                        {viewingUser === user.id && (
                          <tr className="bg-white/[0.02]">
                            <td colSpan={4} className="px-6 py-3">
                              <div className="flex items-center gap-8 text-[0.7rem]">
                                <div>
                                  <span className="text-white/30 uppercase tracking-widest text-[0.55rem] font-bold">Email: </span>
                                  <span className="text-white font-mono">{acct?.email || user.email || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-white/30 uppercase tracking-widest text-[0.55rem] font-bold">Password: </span>
                                  <span className="text-amber-400 font-mono">
                                    {acct?.password || (user.role === 'crew' ? '********' : 'N/A')}
                                  </span>
                                  {user.role === 'crew' && (
                                    <button 
                                      onClick={async () => {
                                        const res = await adminResetPassword(user.id, user.email);
                                        if (res.success) {
                                          const accounts = JSON.parse(localStorage.getItem('7h_accounts') || '{}');
                                          accounts[user.email.toLowerCase()] = {
                                            ...accounts[user.email.toLowerCase()],
                                            id: user.id,
                                            name: user.name,
                                            email: user.email.toLowerCase(),
                                            password: res.password,
                                            role: 'crew'
                                          };
                                          localStorage.setItem('7h_accounts', JSON.stringify(accounts));
                                          alert(`Password reset to: ${res.password}\n\nPlease refresh to see changes.`);
                                          window.location.reload();
                                        }
                                      }}
                                      className="ml-4 px-2 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/20 text-[0.55rem] font-bold uppercase tracking-widest rounded transition-all"
                                    >
                                      Reset & Show
                                    </button>
                                  )}
                                </div>
                                {user.role === 'crew' && !acct?.password && (
                                  <p className="text-[0.6rem] text-amber-500/60 font-bold italic">
                                    * Credentials lost (Check browser history or re-create account)
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                        );
                      })}

                    </tbody>
                  </table>
                )}
              </div>
            </section>


            {/* ── Crew Account Creation ── */}
            <section className="bg-gradient-to-br from-[#0f0f13] to-[#12101a] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-emerald-500/10 bg-emerald-500/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white">Create Crew Account</h3>
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-emerald-400/60 font-bold mt-0.5">Admin Only · Set credentials manually</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={newCrewName}
                      onChange={e => setNewCrewName(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Username</label>
                    <input
                      type="text"
                      placeholder="e.g. alex_7h"
                      value={newCrewUsername}
                      onChange={e => setNewCrewUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                      maxLength={24}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Email Address</label>
                    <input
                      type="email"
                      placeholder="crew@7thheaven.com"
                      value={newCrewEmail}
                      onChange={e => setNewCrewEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Password</label>
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      value={newCrewPassword}
                      onChange={e => setNewCrewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[0.6rem] uppercase tracking-[0.15em] text-white/40 mb-2 block font-bold">Phone Number <span className="text-amber-400">*</span></label>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={newCrewPhone}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        if (digits.length <= 3) setNewCrewPhone(digits);
                        else if (digits.length <= 6) setNewCrewPhone(`(${digits.slice(0, 3)}) ${digits.slice(3)}`);
                        else setNewCrewPhone(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
                      }}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all rounded-lg"
                    />
                  </div>
                  <button
                    onClick={createCrew}
                    disabled={!newCrewName.trim() || !newCrewEmail.trim() || !newCrewPassword.trim()}
                    className="px-6 py-3 bg-emerald-500 text-black font-bold text-[0.7rem] uppercase tracking-[0.15em] rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                    Create Account
                  </button>
                </div>
                <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-start gap-3">
                  <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                  <p className="text-[0.65rem] text-white/40 leading-relaxed">
                    A crew account will be created with the credentials above. Share the login details securely with the crew member. Only admins can create crew accounts.
                  </p>
                </div>

                {/* Success card */}
                {createdCrew && (
                  <div className="mt-4 p-5 bg-emerald-500/[0.08] border border-emerald-500/30 rounded-xl animate-[fadeIn_0.3s_ease]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">✅</div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-400">Crew Account Created</h4>
                          <p className="text-[0.7rem] text-white/60 mt-1"><strong className="text-white">{createdCrew.name}</strong> · {createdCrew.email}</p>
                          {createdCrew.phone && <p className="text-[0.65rem] text-white/40 mt-0.5">📱 {createdCrew.phone}</p>}
                          <div className="mt-3 flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-lg">
                            <span className="text-[0.55rem] uppercase tracking-[0.15em] text-white/30 font-bold shrink-0">Temp Password</span>
                            <code className="text-sm font-mono font-bold text-amber-400 tracking-wider select-all">{createdCrew.password}</code>
                            <button
                              onClick={() => { navigator.clipboard.writeText(createdCrew.password); }}
                              className="ml-auto text-[0.55rem] uppercase tracking-[0.15em] text-white/30 hover:text-white font-bold transition-colors px-2 py-1 border border-white/10 hover:border-white/30 rounded"
                            >Copy</button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setCreatedCrew(null)} className="text-white/20 hover:text-white text-lg transition-colors shrink-0">✕</button>
                    </div>
                    <button
                      onClick={scrollToRegistry}
                      className="mt-4 w-full py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[0.65rem] uppercase tracking-[0.15em] font-bold hover:bg-emerald-500/20 transition-all rounded-lg flex items-center justify-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      View in Registry ↓
                    </button>
                  </div>
                )}

                {/* Error */}
                {crewError && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3">
                    <span className="text-rose-400">✕</span>
                    <p className="text-[0.7rem] text-rose-400 font-bold">{crewError}</p>
                    <button onClick={() => setCrewError('')} className="ml-auto text-white/30 hover:text-white">✕</button>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="xl:col-span-1 flex flex-col gap-8">
            <section className="bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  Audit Log
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>
                <span className="text-[0.6rem] text-white/30 uppercase tracking-widest">{auditLog.length} Events</span>
              </div>
              <div className="p-6 flex flex-col gap-5 flex-1 overflow-y-auto max-h-[500px] custom-scrollbar">
                {auditLog.map((entry, i) => (
                  <div key={entry.id} className="flex gap-4 relative" style={{ animation: i === 0 ? 'slideIn 0.4s ease-out' : 'none' }}>
                    {i < auditLog.length - 1 && (
                      <div className="absolute top-6 bottom-[-20px] left-[7px] w-[2px] bg-white/5" />
                    )}
                    <div className="shrink-0 mt-1">
                      <div className={`w-4 h-4 rounded-full border-2 border-[#0f0f13] ${entry.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-white/80 leading-relaxed mb-1">{entry.text}</p>
                      <p className="text-[0.65rem] uppercase tracking-widest text-white/30">{entry.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          </div>

        </>
        )}

        {adminTab === 'cruise' && (
          <>
        {/* === CRUISE BROADCAST CENTER === */}
        <div className="mb-14 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
                <span className="text-lg">🚢</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wide text-white uppercase">Cruise Command Center</h2>
              <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Manage cruise dashboard announcements, links & chat</p>
            </div>
          </div>

          {/* Row 1: Passenger Notice + Passenger Lounge */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative items-start">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-cyan-500/10 to-transparent blur-[100px] pointer-events-none rounded-full" />

            {/* Passenger Notice */}
            <div className={`relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 hover:border-cyan-500/20 rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col group overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-cyan-500/10 transition-all duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center text-2xl transition-all duration-500">📋</div>
                    <div>
                      <h3 className="text-lg font-black italic tracking-wide text-white">Passenger Notice</h3>
                      <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Post an update to the Cruise Dashboard</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_cyan]" />
                    <span className="text-[0.5rem] font-bold text-cyan-400 uppercase tracking-widest">Active</span>
                  </div>
                </div>
                {cruiseSaveStatus && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] backdrop-blur-md ${cruiseSaveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {cruiseSaveStatus === 'saved' ? '✓ Notice updated — live on cruise dashboard' : '✕ Failed to update — try again'}
                  </div>
                )}
                <div className="flex flex-col gap-3 mt-auto bg-black/20 p-3 md:p-4 rounded-xl border border-white/5">
                  <div className="w-full text-black [&_.ql-editor]:min-h-[200px]">
                    <ReactQuill theme="snow" value={cruiseMessage} onChange={setCruiseMessage} placeholder="Message (e.g. VIP pre-booking opens Friday at 12 PM CST)" className="bg-white rounded-xl overflow-hidden" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-end mt-2">
                    <div className="text-[0.55rem] text-white/30 font-medium italic mr-auto px-2">Press the trash icon to remove the active notice.</div>
                    <button onClick={() => updateCruiseMessage()} disabled={cruiseUpdating} className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.25)] border border-cyan-400/30 flex items-center justify-center">
                      <span className="relative z-10">{cruiseUpdating ? 'Dispatching...' : 'Dispatch Update'}</span>
                    </button>
                    <button onClick={() => updateCruiseMessage('')} disabled={cruiseUpdating} title="Remove Notice" className="w-10 h-10 flex items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 group/trash">
                      <svg className="group-hover/trash:scale-110 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Live Chat Panel */}
            <div className={`relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border ${cruiseChatEnabled ? 'border-[var(--color-accent)]/20' : 'border-rose-500/15'} rounded-2xl transition-all duration-500 flex flex-col overflow-hidden`}>
              {/* Header with toggle */}
              <div className="bg-black/40 px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${cruiseChatEnabled ? 'bg-[var(--color-accent)]/20' : 'bg-rose-500/10'} flex items-center justify-center text-lg`}>💬</div>
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-wide">Passenger Lounge</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${cruiseChatEnabled ? 'bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                      <span className={`text-[0.55rem] font-bold uppercase tracking-widest ${cruiseChatEnabled ? 'text-emerald-400' : 'text-white/20'}`}>{cruiseChatEnabled ? 'Live' : 'Offline'}</span>
                      <span className="text-[0.55rem] text-white/20 ml-2">{adminChatMessages.length} messages</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={toggleCruiseChat}
                  disabled={cruiseChatToggling}
                  className={`relative px-5 py-2 rounded-xl text-[0.55rem] font-black uppercase tracking-widest transition-all duration-300 border cursor-pointer shrink-0 overflow-hidden ${cruiseChatEnabled 
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-[1.02]' 
                    : 'bg-[#1c1c24] text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                  } disabled:opacity-50`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${cruiseChatEnabled ? 'bg-white animate-pulse' : 'bg-rose-400'}`} />
                    {cruiseChatEnabled ? 'LIVE' : 'OFF'}
                  </span>
                  {cruiseChatEnabled && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />}
                </button>
              </div>

              {/* Pinned Message Bar */}
              {cruiseChatPin && cruiseChatPin !== '<p><br></p>' && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-2">
                  <span className="text-amber-400 text-xs shrink-0">📌</span>
                  <p className="text-amber-100/80 text-[0.7rem] font-medium truncate flex-1" dangerouslySetInnerHTML={{ __html: cruiseChatPin.replace(/<[^>]+>/g, ' ').trim() }} />
                </div>
              )}

              {/* Chat Messages Feed */}
              <div ref={adminChatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[360px] min-h-[200px] scrollbar-hide">
                {adminChatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-white/20">
                    <span className="text-2xl mb-2 opacity-50">💬</span>
                    <p className="text-[0.6rem] font-bold uppercase tracking-widest">No messages yet</p>
                    <p className="text-[0.55rem] mt-1 text-center max-w-[200px]">Cruise members will appear here when they start chatting.</p>
                  </div>
                ) : (
                  adminChatMessages.map((msg) => {
                    const isAdmin = msg.sender_role === 'admin';
                    const isCrew = msg.sender_role === 'crew';
                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[0.5rem] font-black border ${
                          isAdmin ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                          isCrew ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]' :
                          'border-white/10 bg-[#15151f] text-white/60'
                        }`}>
                          {msg.sender_avatar.substring(0, 2).toUpperCase()}
                        </div>
                        <div className={`flex flex-col ${isAdmin ? 'items-end' : ''} flex-1 max-w-[85%]`}>
                          <div className={`flex items-baseline gap-2 mb-0.5 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[0.65rem] font-bold text-white/70">{msg.sender_name}</span>
                            <span className={`text-[0.45rem] font-bold uppercase tracking-widest px-1 py-0.5 rounded border ${
                              isAdmin ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                              isCrew ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10 border-[var(--color-accent)]/20' :
                              'text-white/40 bg-white/5 border-white/5'
                            }`}>{msg.sender_role}</span>
                            <span className="text-[0.5rem] text-white/20 font-mono">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className={`${isAdmin ? 'bg-emerald-500/10 border-emerald-500/10 rounded-2xl rounded-tr-none' : 'bg-white/5 border-white/[0.02] rounded-2xl rounded-tl-none'} px-3 py-2 text-[0.75rem] text-white/70 inline-block w-fit leading-relaxed border`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={adminChatEndRef} />
              </div>

              {/* Admin Message Input */}
              <div className="p-3 bg-black/40 border-t border-white/5">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!adminChatInput.trim() || adminChatSending) return;
                  setAdminChatSending(true);
                  try {
                    const res = await fetch('/api/chat/send', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        room: 'cruise_dashboard',
                        sender_name: member?.name || 'Admin',
                        sender_role: 'admin',
                        sender_avatar: member?.name?.substring(0, 2) || 'AD',
                        content: adminChatInput.trim(),
                      })
                    });
                    if (res.ok) setAdminChatInput('');
                  } catch (err) { console.error(err); }
                  setAdminChatSending(false);
                }} className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={adminChatInput}
                    onChange={(e) => setAdminChatInput(e.target.value)}
                    placeholder="Send a message as admin..."
                    className="w-full bg-[#15151f] border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:bg-white/5 transition-all"
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={!adminChatInput.trim() || adminChatSending}
                    className="absolute right-2 w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </form>
              </div>

              {/* Pin Controls (collapsible) */}
              <div className="px-4 py-3 bg-black/20 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">📌</span>
                  <span className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">Pin a message</span>
                  {cruiseChatPinSaveStatus && (
                    <span className={`text-[0.5rem] font-bold uppercase tracking-widest ml-auto ${cruiseChatPinSaveStatus === 'saved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {cruiseChatPinSaveStatus === 'saved' ? '✓ Pinned' : '✕ Failed'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cruiseChatPin.replace(/<[^>]+>/g, '')}
                    onChange={(e) => setCruiseChatPin(e.target.value)}
                    placeholder="e.g. Welcome aboard! Band drops in at 3 PM."
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 transition-all placeholder:text-white/15"
                  />
                  <button onClick={() => updateCruiseChatPin()} disabled={cruiseChatPinUpdating} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-white text-[0.55rem] font-bold uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 border border-amber-500/20">
                    {cruiseChatPinUpdating ? '...' : 'Pin'}
                  </button>
                  <button onClick={() => updateCruiseChatPin('')} disabled={cruiseChatPinUpdating} title="Remove Pin" className="w-9 h-9 flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Important Links + Roster Export */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative items-start mt-6">
            {/* Important Links — 2 cols */}
            <div className="xl:col-span-2 relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 hover:border-fuchsia-500/20 rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col group overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-fuchsia-500/10 transition-all duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.15)] flex items-center justify-center text-2xl transition-all duration-500">🔗</div>
                    <div>
                      <h3 className="text-lg font-black italic tracking-wide text-white">Important Links</h3>
                      <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Quick Links (Drink Packages, Excursions)</p>
                    </div>
                  </div>
                </div>
                {linksSaveStatus && (
                  <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] ${linksSaveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {linksSaveStatus === 'saved' ? '✓ Links updated successfully' : '✕ Failed to update — try again'}
                  </div>
                )}
                <div className="flex flex-col gap-3 mt-auto">
                  {importantLinks.map((link, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                      <input type="text" value={link.icon} onChange={e => { const n=[...importantLinks]; n[i].icon=e.target.value; setImportantLinks(n); }} placeholder="🍹" className="w-full md:w-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-center text-white outline-none focus:border-fuchsia-500/60 transition-all" />
                      <input type="text" value={link.title} onChange={e => { const n=[...importantLinks]; n[i].title=e.target.value; setImportantLinks(n); }} placeholder="Title" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500/60 transition-all" />
                      <input type="text" value={link.url} onChange={e => { const n=[...importantLinks]; n[i].url=e.target.value; setImportantLinks(n); }} placeholder="URL" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500/60 transition-all" />
                      <button onClick={() => setImportantLinks(importantLinks.filter((_,idx)=>idx!==i))} className="w-12 h-[46px] flex items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shrink-0">✕</button>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setImportantLinks([...importantLinks, { title: '', url: '', icon: '🔗' }])} className="flex-1 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all">+ Add Link</button>
                    <button onClick={updateImportantLinks} disabled={linksUpdating} className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:from-fuchsia-500 hover:to-fuchsia-400 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 border border-fuchsia-400/30 shadow-[0_4px_15px_rgba(217,70,239,0.25)] min-w-[120px]">{linksUpdating ? 'Saving...' : 'Save All'}</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cruise Roster & Signup Stats — 1 col */}
            <div className="relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 hover:border-emerald-500/20 rounded-2xl p-6 md:p-8 transition-all duration-500 flex flex-col group overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/10 transition-all duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center text-2xl transition-all duration-500">📊</div>
                  <div>
                    <h3 className="text-lg font-black italic tracking-wide text-white">Cruise Roster</h3>
                    <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest leading-relaxed mt-0.5">Signups & Passenger Manifest</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-2xl font-black text-emerald-400">{cruiseStats.signups || 0}</p>
                    <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Bookings</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-2xl font-black text-white">{cruiseStats.total}</p>
                    <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Total Pax</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-lg font-black text-white/60">{cruiseStats.adults}<span className="text-white/20 mx-0.5">/</span>{cruiseStats.children}</p>
                    <p className="text-[0.5rem] font-bold text-white/30 uppercase tracking-widest mt-0.5">Adult / Child</p>
                  </div>
                </div>

                {/* Recent Signups */}
                {(cruiseStats.recentSignups?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[0.55rem] font-bold text-white/30 uppercase tracking-widest mb-2">Recent Signups</p>
                    <div className="max-h-[220px] overflow-y-auto scrollbar-hide space-y-1.5">
                      {(cruiseStats.recentSignups || []).map((s, i) => (
                        <div key={i} className="flex items-center gap-3 bg-black/20 px-3 py-2.5 rounded-lg border border-white/5 hover:border-emerald-500/20 transition-all group/row">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[0.5rem] font-black text-emerald-400 shrink-0">
                            {s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{s.name}</p>
                            <p className="text-[0.55rem] text-white/30 truncate">{s.email}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[0.55rem] text-white/20 font-mono">{s.phone || '—'}</p>
                            <p className="text-[0.5rem] text-white/15">{s.partySize > 1 ? `${s.partySize} guests` : '1 guest'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download CSV */}
                <button onClick={async () => { const res = await fetch('/api/admin/cruise-export'); if (res.ok) { const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = '7th-heaven-cruise-roster.csv'; a.click(); } }} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.25)] border border-emerald-400/30 flex items-center justify-center gap-2 mt-auto">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Download Full CSV
                </button>
                <p className="text-[0.5rem] text-white/20 text-center -mt-2">Includes names, emails, phone numbers, guest details</p>
              </div>
            </div>
          </div>
        </div>

        {/* === CRUISE COMMUNITY BLAST === */}
        <div className="mb-14 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
                <span className="text-lg">📡</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wide text-white uppercase">Cruise Community Blast</h2>
              <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Send an email update to all cruise signups</p>
            </div>
          </div>

          <div className="relative z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 hover:border-cyan-500/20 rounded-2xl p-6 md:p-8 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-5">

              {cruiseBlastResult && (
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] backdrop-blur-md ${cruiseBlastResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {cruiseBlastResult.message}
                </div>
              )}

              <div>
                <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest block mb-2">Subject Line</label>
                <input
                  type="text"
                  value={cruiseBlastSubject}
                  onChange={e => setCruiseBlastSubject(e.target.value)}
                  placeholder="🚢 Cruise Update: Big news for the community!"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/60 transition-all placeholder:text-white/15"
                />
              </div>

              <div>
                <label className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest block mb-2">Message Body (HTML supported)</label>
                <div className="w-full text-black [&_.ql-editor]:min-h-[200px] relative z-20">
                  <ReactQuill
                    theme="snow"
                    value={cruiseBlastBody}
                    onChange={setCruiseBlastBody}
                    placeholder="Write your cruise community update here..."
                    className="bg-white rounded-xl overflow-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-2">
                <p className="text-[0.6rem] text-white/30 leading-relaxed">
                  This will send to <strong className="text-cyan-400">all cruise signups</strong> in the database. Make sure the content is ready.
                </p>
                <button
                  onClick={async () => {
                    if (!cruiseBlastSubject.trim() || !cruiseBlastBody.trim()) {
                      setCruiseBlastResult({ success: false, message: 'Subject and body are required' });
                      return;
                    }
                    if (!confirm(`Send this cruise update to ALL cruise signups? This cannot be undone.`)) return;
                    setCruiseBlastSending(true);
                    setCruiseBlastResult(null);
                    try {
                      const res = await fetch('/api/cruise/blast', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subject: cruiseBlastSubject, body: cruiseBlastBody }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setCruiseBlastResult({ success: true, message: `✓ Sent to ${data.sent}/${data.total} cruise signups` });
                        setCruiseBlastSubject('');
                        setCruiseBlastBody('');
                      } else {
                        throw new Error(data.error || 'Blast failed');
                      }
                    } catch (err: any) {
                      setCruiseBlastResult({ success: false, message: `✕ ${err.message}` });
                    } finally {
                      setCruiseBlastSending(false);
                    }
                  }}
                  disabled={cruiseBlastSending}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 border border-cyan-400/30 shadow-[0_4px_15px_rgba(6,182,212,0.25)] shrink-0 cursor-pointer"
                >
                  {cruiseBlastSending ? 'Sending...' : '🚀 Send Blast'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* === ITINERARY BUILDER === */}
        <div className="mb-14 relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 p-[1px]">
              <div className="w-full h-full bg-[#050508] rounded-full flex items-center justify-center">
                <span className="text-lg">⚓</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-wide text-white uppercase">Cruise Itinerary Builder</h2>
              <p className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">Manage passenger dashboard daily schedules</p>
            </div>
          </div>

          <div className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 relative">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-8 pb-6 border-b border-white/5">
              <button onClick={() => setItinerary([...itinerary, { id: 'day' + Date.now(), dayLabel: 'Day ' + (itinerary.length + 1), location: 'Port', theme: 'Theme', events: [], colorTheme: 'var(--color-accent)' }])} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-[0.65rem] font-bold uppercase tracking-widest rounded-lg transition-all border border-white/10 flex items-center gap-2">
                <span>+ Add Day</span>
              </button>
              <button onClick={() => updateItinerary(itinerary)} disabled={itineraryUpdating} className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(133,29,239,0.3)] disabled:opacity-50 border border-[var(--color-accent)]/30">
                {itineraryUpdating ? 'Saving...' : '💾 Save Itinerary Live'}
              </button>
            </div>
            {itinerarySaveStatus && (
              <div className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-[0.65rem] font-bold uppercase tracking-widest animate-[slideIn_0.3s_ease-out] ${itinerarySaveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {itinerarySaveStatus === 'saved' ? '✓ Itinerary updated — live on cruise dashboard' : '✕ Failed to update — try again'}
              </div>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {itinerary.map((day, dayIndex) => (
                <div key={day.id} className="bg-black/40 border border-white/10 rounded-xl p-5 md:p-6 relative group transition-all hover:border-white/20">
                  <button onClick={() => setItinerary(itinerary.filter((_,i) => i !== dayIndex))} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all text-xs">✕</button>
                  <div className="flex flex-col gap-3 mb-4">
                    <input type="text" value={day.dayLabel} onChange={e => { const n=[...itinerary]; n[dayIndex].dayLabel=e.target.value; setItinerary(n); }} className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none focus:border-[var(--color-accent)]/50 transition-all" placeholder="Day 1" />
                    <div className="flex gap-2">
                      <input type="text" value={day.location} onChange={e => { const n=[...itinerary]; n[dayIndex].location=e.target.value; setItinerary(n); }} className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-[var(--color-accent)]/50 transition-all" placeholder="Location" />
                      <input type="text" value={day.theme} onChange={e => { const n=[...itinerary]; n[dayIndex].theme=e.target.value; setItinerary(n); }} className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-[var(--color-accent)]/50 transition-all" placeholder="Theme" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {day.events.map((evt: any, evtIndex: number) => (
                      <div key={evtIndex} className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                        <input type="text" value={evt.time} onChange={e => { const n=[...itinerary]; n[dayIndex].events[evtIndex].time=e.target.value; setItinerary(n); }} className="w-20 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-[0.7rem] text-white/60 outline-none" placeholder="9:00 AM" />
                        <input type="text" value={evt.title} onChange={e => { const n=[...itinerary]; n[dayIndex].events[evtIndex].title=e.target.value; setItinerary(n); }} className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-[0.7rem] text-white outline-none" placeholder="Event name" />
                        <input type="text" value={evt.icon || ''} onChange={e => { const n=[...itinerary]; (n[dayIndex].events[evtIndex] as any).icon=e.target.value; setItinerary(n); }} className="w-12 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-center text-[0.7rem] outline-none" placeholder="🎵" />
                        <button onClick={() => { const n=[...itinerary]; n[dayIndex].events.splice(evtIndex,1); setItinerary(n); }} className="w-7 h-7 flex items-center justify-center rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white text-xs transition-all shrink-0">✕</button>
                      </div>
                    ))}
                    <button onClick={() => { const n=[...itinerary]; n[dayIndex].events.push({ id: 'evt'+Date.now(), time: '', title: '', subtitle: '' } as any); setItinerary(n); }} className="w-full py-2 border border-dashed border-white/10 rounded-lg text-white/30 hover:text-white/60 hover:border-white/20 text-[0.65rem] font-bold uppercase tracking-widest transition-all">+ Add Event</button>
                  </div>
                </div>
              ))}
              {itinerary.length === 0 && (
                <div className="col-span-1 xl:col-span-2 py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
                  <span className="text-4xl block mb-4 opacity-30">🗓️</span>
                  <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No Itinerary Days configured</p>
                  <p className="text-xs text-white/20 mt-2">Click &quot;+ Add Day&quot; to start building the schedule.</p>
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}

      </div>
    </div>
  );
}
