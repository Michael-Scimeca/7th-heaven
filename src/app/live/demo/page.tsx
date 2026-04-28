'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMember } from '@/context/MemberContext';
import { createClient } from '@/lib/supabase/client';
import { createCheckout } from '@/lib/shopify';
import { LiveKitStream } from '@/components/LiveKitStream';

/* ─────────────────────────────────────────────
   FAKE ACCOUNT DATABASE
   ───────────────────────────────────────────── */

interface FakeAccount {
  id: string;
  name: string;
  displayName: string;
  role: 'fan' | 'crew' | 'admin';
  color: string;
  badge?: string;
  avatar: string; // 2 letter initials
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinYear: number;
}

const CREW_ACCOUNTS: FakeAccount[] = [
  { id: 'crew-mike', name: 'Mike S', displayName: 'Mike S', role: 'crew', color: '#a855f7', badge: '🎸', avatar: 'MS', joinYear: 2020 },
  { id: 'crew-sammy', name: 'Sammy', displayName: 'Sammy D', role: 'crew', color: '#ec4899', badge: '🥁', avatar: 'SD', joinYear: 2020 },
  { id: 'crew-ryan', name: 'Ryan', displayName: 'Ryan K', role: 'crew', color: '#06b6d4', badge: '🎹', avatar: 'RK', joinYear: 2020 },
  { id: 'crew-tony', name: 'Tony', displayName: 'Tony M', role: 'crew', color: '#f97316', badge: '🎤', avatar: 'TM', joinYear: 2020 },
];

const FAN_ACCOUNTS: FakeAccount[] = [
  { id: 'fan-jess', name: 'Jess_M', displayName: 'Jess_M', role: 'fan', color: '#a78bfa', avatar: 'JM', tier: 'Platinum', joinYear: 2021 },
  { id: 'fan-rockerdan', name: 'rockerdan92', displayName: 'rockerdan92', role: 'fan', color: '#f472b6', avatar: 'RD', tier: 'Gold', joinYear: 2022 },
  { id: 'fan-mikefan', name: 'mike_fan_01', displayName: 'mike_fan_01', role: 'fan', color: '#34d399', avatar: 'MF', tier: 'Silver', joinYear: 2023 },
  { id: 'fan-chicagolou', name: 'ChicagoLou', displayName: 'ChicagoLou', role: 'fan', color: '#fbbf24', avatar: 'CL', tier: 'Gold', joinYear: 2021 },
  { id: 'fan-tay', name: 'tay_rocks', displayName: 'tay_rocks', role: 'fan', color: '#60a5fa', avatar: 'TR', tier: 'Silver', joinYear: 2023 },
  { id: 'fan-mel', name: 'MelM', displayName: 'MelM', role: 'fan', color: '#fb923c', avatar: 'MM', tier: 'Platinum', joinYear: 2020 },
  { id: 'fan-super', name: 'superfan99', displayName: 'superfan99', role: 'fan', color: '#c084fc', avatar: 'S9', tier: 'Gold', joinYear: 2021 },
  { id: 'fan-drummer', name: 'drummer_kid', displayName: 'drummer_kid', role: 'fan', color: '#4ade80', avatar: 'DK', tier: 'Bronze', joinYear: 2024 },
  { id: 'fan-stacey', name: 'StaceyB', displayName: 'StaceyB', role: 'fan', color: '#f43f5e', avatar: 'SB', tier: 'Silver', joinYear: 2022 },
  { id: 'fan-maxrock', name: 'MaxRock', displayName: 'MaxRock', role: 'fan', color: '#14b8a6', avatar: 'MR', tier: 'Bronze', joinYear: 2024 },
  { id: 'fan-ashley', name: 'ashley_xo', displayName: 'ashley_xo', role: 'fan', color: '#e879f9', avatar: 'AX', tier: 'Gold', joinYear: 2021 },
  { id: 'fan-jake', name: 'Jake7H', displayName: 'Jake7H', role: 'fan', color: '#38bdf8', avatar: 'J7', tier: 'Platinum', joinYear: 2020 },
  { id: 'fan-midwest', name: 'MidwestMama', displayName: 'MidwestMama', role: 'fan', color: '#facc15', avatar: 'MW', tier: 'Silver', joinYear: 2023 },
  { id: 'fan-nate', name: 'nate_bass', displayName: 'nate_bass', role: 'fan', color: '#22d3ee', avatar: 'NB', tier: 'Bronze', joinYear: 2024 },
  { id: 'fan-lauren', name: 'LaurenLive', displayName: 'LaurenLive', role: 'fan', color: '#a3e635', avatar: 'LL', tier: 'Gold', joinYear: 2022 },
  { id: 'fan-tommy', name: 'TommyGuitar', displayName: 'TommyGuitar', role: 'fan', color: '#818cf8', avatar: 'TG', tier: 'Silver', joinYear: 2023 },
];

const ALL_ACCOUNTS = [...CREW_ACCOUNTS, ...FAN_ACCOUNTS];

/* ── Crew member config for parameterized pages ── */
const CREW_CONFIG: Record<string, { id: string; name: string; displayName: string; badge: string; avatar: string; color: string; gradient: string; instrument: string }> = {
  mike:    { id: 'crew-mike',  name: 'Mike S',  displayName: 'MIKE S',  badge: '🎸', avatar: 'MS', color: '#a855f7', gradient: 'from-[#8a1cfc] to-[#ec4899]', instrument: 'Guitar' },
  michael: { id: 'crew-mike',  name: 'Mike S',  displayName: 'MIKE S',  badge: '🎸', avatar: 'MS', color: '#a855f7', gradient: 'from-[#8a1cfc] to-[#ec4899]', instrument: 'Guitar' },
  sammy:   { id: 'crew-sammy', name: 'Sammy D', displayName: 'SAMMY D', badge: '🥁', avatar: 'SD', color: '#ec4899', gradient: 'from-[#ec4899] to-[#f97316]', instrument: 'Drums' },
  ryan:    { id: 'crew-ryan',  name: 'Ryan K',  displayName: 'RYAN K',  badge: '🎹', avatar: 'RK', color: '#06b6d4', gradient: 'from-[#06b6d4] to-[#8a1cfc]', instrument: 'Keys' },
  tony:    { id: 'crew-tony',  name: 'Tony M',  displayName: 'TONY M',  badge: '🎤', avatar: 'TM', color: '#f97316', gradient: 'from-[#f97316] to-[#ef4444]', instrument: 'Vocals' },
  john:    { id: 'crew-john',  name: 'John W',  displayName: 'JOHN W',  badge: '🎸', avatar: 'JW', color: '#3b82f6', gradient: 'from-[#3b82f6] to-[#8a1cfc]', instrument: 'Guitar' },
};

const ALL_ROOMS = [
  { key: 'michael', name: 'live_michael', label: 'Mike',  viewers: 1247 },
  { key: 'sammy',   name: 'live_sammy',   label: 'Sammy', viewers: 84 },
  { key: 'ryan',    name: 'live_ryan',    label: 'Ryan',  viewers: 412 },
  { key: 'tony',    name: 'live_tony',    label: 'Tony',  viewers: 18 },
];

/* ─────────────────────────────────────────────
   MESSAGE POOLS
   ───────────────────────────────────────────── */
const FAN_MESSAGES = [
  'omg this is insane 🔥🔥', 'LETS GOOOO 7TH HEAVEN', 'best show of the year no cap',
  '🤘🤘🤘 sending love from the back row', 'the drums tonight tho!! WOW',
  'been waiting 3 years for this moment ❤️', 'streaming this to my whole family rn lmao',
  'those guitar riffs hit different live', 'THIS IS MY FAVORITE SONG', 'chills. actual chills.',
  'who else is crying rn 😭', 'TURN IT UP 🔊🔊🔊', 'the energy in here is UNREAL',
  'they never disappoint 🙌', 'Chicago represent!! 🏙️', 'first time seeing them live… speechless',
  'MOM LOOK IM ON THE LIVE STREAM', 'this band is everything', 'PLAY SING NEXT PLEASE 🎵',
  'i cant stop screaming', 'watching from my car in the parking lot lol 😂',
  '7th heaven forever ❤️‍🔥', 'that bass line tho 🎸', 'bruh this setlist is FIRE',
  'i drove 6 hours for this', 'whos got the setlist??', 'PIT IS INSANE RN',
  'they sound even better live wtf', 'ENCORE ENCORE ENCORE', 'losing my voice already',
  'this is what live music is about', 'my 15th 7H show and they keep getting better',
  'the light show tonight 😍', 'GET YOUR PHONES UP 📱', 'im literally floating rn',
  'WAIT IS THAT A NEW SONG??', 'someone catch me im gonna faint', 'LEGEND STATUS 🏆',
  'making memories for life', 'the whole crowd is jumping 🦘', 'VIBE CHECK: 100/100',
  'goosebumps on goosebumps', 'they really are the best band in the midwest',
  'wish yall could smell the stage smoke from here 💨', 'holy harmonies batman',
  'whoever is streaming THANK YOU 🙏', 'my neighbors are gonna call the cops im so loud',
  'FRONT ROW BABY', 'they LITERALLY just winked at me', 'im never washing this hand',
];

const CREW_MESSAGES = [
  '🔴 Soundcheck vibes — we\'re locked in tonight', 'LFG crowd is INSANE 🔥',
  'thank you all for being here tonight ❤️', 'crowd cam looking beautiful out there 📸',
  'this next one goes out to the OG fans', 'we got a STACKED setlist tonight 🎶',
  'new song alert 👀 dropping this one for the first time', 'shoutout to the crew holding it down backstage',
  'love seeing all your signs in the crowd!!', 'we see you front row! 🤘',
  'yo the energy is OFF THE CHARTS', 'that one was for you, Chicago! 🏙️',
  '30 songs in 30 minutes coming up next 🎵', 'THIS is why we do this 🙌',
  'encore time… you ready?? 👀', 'quick water break, don\'t go anywhere!',
];

const REACTION_EMOJIS = ['❤️', '🔥', '🤘', '🎸', '👏', '⚡', '😍', '🙌', '💜', '🤯'];



/* ─────────────────────────────────────────────
   CHAT MESSAGE TYPE
   ───────────────────────────────────────────── */
interface ChatMsg {
  id: string;
  account: FakeAccount;
  text: string;
  timestamp: number;
}

/* ─────────────────────────────────────────────
   FLOATING EMOJI TYPE
   ───────────────────────────────────────────── */
interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  createdAt: number;
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
export function LiveSimulation({ memberId = 'mike' }: { memberId?: string }) {
  const crewConfig = CREW_CONFIG[memberId] || CREW_CONFIG.mike;
  const otherRooms = ALL_ROOMS.filter(r => r.key !== memberId);
  const thisRoom = ALL_ROOMS.find(r => r.key === memberId);
  const baseViewers = thisRoom?.viewers ?? 1247;
  const { member, isLoggedIn, openModal, logout } = useMember();
  const supabase = createClient();

  // Namespace localStorage keys per crew member so feeds are independent
  const LS = (key: string) => `${key}_${memberId?.toString().toLowerCase().trim()}`;
  
  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatChannelRef = useRef<any>(null);

  // Chat moderation — banned user IDs
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());
  const isModRole = member?.role === 'crew' || member?.role === 'admin';
  const banUser = (userId: string) => setBannedUsers(prev => new Set(prev).add(userId));
  const unbanUser = (userId: string) => setBannedUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });

  // Viewer count — real, tracked from actual page loads
  const [viewerCount, setViewerCount] = useState(0);

  // Floating reactions
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);

  // Emoji picker
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  // Stream elapsed time
  const [elapsed, setElapsed] = useState(0);

  // Active users panel
  const [showViewers, setShowViewers] = useState(false);

  // Concert stage animation phase
  const [lightPhase, setLightPhase] = useState(0);

  // 🔥 Hype Meter (0-100)
  const [hype, setHype] = useState(35);
  const [hypeBurst, setHypeBurst] = useState(false);

  // 📌 Pinned Messages
  const [activePinned, setActivePinned] = useState<{text: string; by: string} | null>(null);

  // Reactions visibility toggle
  const [reactionsHidden, setReactionsHidden] = useState(false);
  // Stream ended = crew hit "End Stream" but we might be waiting for a sale to finish
  const [streamEnded, setStreamEnded] = useState(false);
  const [disconnectCountdown, setDisconnectCountdown] = useState<number | null>(null);
  
  // 🎰 Live Raffle
  const [raffleState, setRaffleState] = useState<{status: string, entrants: number, prizes: any[], winners: string[], timer: number, minEntrants?: number, countdown?: number, winnerPins?: string[]} | null>(null);

  const [hasEnteredRaffle, setHasEnteredRaffle] = useState(false);
  const [raffleWidgetClosed, setRaffleWidgetClosed] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimMethod, setClaimMethod] = useState<'shipping' | 'merch_table' | null>(null);
  const [nextRaffleCountdown, setNextRaffleCountdown] = useState<number | null>(null);

  // Feed gate — page only works when crew is live
  const [feedActive, setFeedActive] = useState<boolean | null>(null);
  const router = useRouter();

  // On mount: check if a feed is actually live via Supabase, LiveKit, or localStorage
  const checkIfLiveRef = useRef(async () => {
    // 1. Check localStorage (same-tab)
    if (localStorage.getItem(`is_live_${memberId}`) === 'true') return true;
    if (localStorage.getItem('is_live') === 'true') return true; // Global fallback
    if (localStorage.getItem(LS('crew_is_live')) === 'true') return true;
    
    // 2. Check LiveKit active rooms FIRST (most reliable source of truth)
    try {
      const res = await fetch('/api/live-rooms');
      const lkData = await res.json();
      if (lkData.rooms?.some((r: any) => 
        r.name === `live_${memberId}` || r.name === memberId
      )) return true;
    } catch {}

    // 3. Check Supabase live_streams table — match by stream_url slug since user_id is a UUID
    try {
      const sb = createClient();
      const { data } = await sb
        .from('live_streams')
        .select('id, stream_url, user_id')
        .eq('status', 'live');
      if (data?.some((s: any) => 
        s.user_id === memberId || 
        s.stream_url === `live_${memberId}` ||
        s.stream_url?.includes(memberId)
      )) {
        localStorage.setItem(`is_live_${memberId}`, 'true');
        return true;
      }
    } catch {}
    
    return false;
  });

  useEffect(() => {
    checkIfLiveRef.current().then(live => {
      if (!live) {
        // Clean up stale localStorage flags so the page doesn't think we're still live
        try {
          localStorage.removeItem(`is_live_${memberId}`);
          localStorage.removeItem('is_live');
          localStorage.removeItem(LS('crew_is_live'));
        } catch {}
      }
      setFeedActive(live);
    });
  }, []);

  // Track real viewer count via heartbeat presence system
  useEffect(() => {
    if (!feedActive) return;
    
    const sessionId = Math.random().toString(36).substring(7);
    const presenceKey = LS('live_presence');
    
    const updatePresence = () => {
      try {
        const now = Date.now();
        const presence = JSON.parse(localStorage.getItem(presenceKey) || '{}');
        
        // Update my heartbeat
        presence[sessionId] = now;
        
        // Clean up expired ones (> 15s)
        const activePresence: Record<string, number> = {};
        Object.keys(presence).forEach(id => {
          if (now - presence[id] < 15000) {
            activePresence[id] = presence[id];
          }
        });
        
        const count = Object.keys(activePresence).length;
        localStorage.setItem(presenceKey, JSON.stringify(activePresence));
        localStorage.setItem(LS('live_viewer_count'), String(count));
        setViewerCount(count);
      } catch (e) {
        console.warn("Presence update failed", e);
      }
    };
    
    updatePresence();
    const interval = setInterval(updatePresence, 5000);
    
    const cleanup = () => {
      try {
        const presence = JSON.parse(localStorage.getItem(presenceKey) || '{}');
        delete presence[sessionId];
        const count = Object.keys(presence).length;
        localStorage.setItem(presenceKey, JSON.stringify(presence));
        localStorage.setItem(LS('live_viewer_count'), String(Math.max(0, count)));
      } catch (e) {}
      clearInterval(interval);
    };
    
    window.addEventListener('beforeunload', cleanup);
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [feedActive]);

  // Flash Merch Drop State
  const [showFlashDrop, setShowFlashDrop] = useState(false);
  const [flashStock, setFlashStock] = useState(0);
  const [flashName, setFlashName] = useState('');
  const [flashPrice, setFlashPrice] = useState('');
  const [flashImage, setFlashImage] = useState('/images/mockups/merch_hoodie.png');
  const [hasPurchased, setHasPurchased] = useState(false);
  const [flashTimeLeft, setFlashTimeLeft] = useState(0);
  const [flashAllowPickup, setFlashAllowPickup] = useState(false);

  // Ship vs Pickup choice modal
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  const [fulfillmentChoice, setFulfillmentChoice] = useState<'ship'|'pickup'|null>(null);
  const [pickupCode, setPickupCode] = useState('');
  
  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);

  // Sync flash drops via localStorage (cross-tab)
  useEffect(() => {
    const handler = (payload: any) => {
      setFlashName(payload.name || 'Signature Item');
      setFlashPrice(payload.price || '0.00');
      setFlashStock(parseInt(payload.stock) || 50);
      setFlashImage(payload.image || '/images/mockups/merch_hoodie.png');
      setFlashTimeLeft(parseInt(payload.duration) || 300);
      setFlashAllowPickup(!!payload.allowPickup);
      setHasPurchased(false);
      setFulfillmentChoice(null);
      setPickupCode('');
      setShowFlashDrop(true);
    };

    // Read currently active pinned message on mount (for late joiners)
    try {
      const existingPin = localStorage.getItem(LS('live_pinned'));
      if (existingPin) setActivePinned(JSON.parse(existingPin));
      
      // Only restore raffle state if the crew is actually live
      const crewIsLive = localStorage.getItem(LS('is_live')) === 'true';
      if (!crewIsLive) {
        // Wipe any stale raffle data from a previous session
        localStorage.removeItem(LS('live_raffle_sync'));
        setRaffleState(null);
      } else {
        const existingRaffle = localStorage.getItem(LS('live_raffle_sync'));
        if (existingRaffle) {
         const pb = JSON.parse(existingRaffle);
         if (pb.status === 'idle') setRaffleState(null);
         else setRaffleState(pb);
        }
      }
    } catch (e) {}

    // Load chat from Supabase first, fallback to localStorage
    const loadChatAndInbox = async () => {
      try {
        const roomId = `live_${memberId?.toString().toLowerCase().trim()}`;
        const { data: chatData } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room', roomId)
          .order('created_at', { ascending: true })
          .limit(100);
        
        if (chatData && chatData.length > 0) {
          const mapped = chatData.map((m: any) => ({
            id: m.id,
            account: {
              id: m.sender_name,
              name: m.sender_name,
              displayName: m.sender_name,
              role: m.sender_role || 'fan',
              color: m.sender_role === 'crew' ? '#f97316' : '#8b5cf6',
              avatar: m.sender_avatar || m.sender_name.slice(0, 2).toUpperCase(),
            },
            text: m.content,
            timestamp: new Date(m.created_at).getTime(),
          }));
          setMessages(mapped);
        }
      } catch {}

      // Load VIP inbox from Supabase notifications
      if (member?.email) {
        try {
          const { data: notifs } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_email', member.email)
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (notifs && notifs.length > 0) {
            const inbox = notifs.map((n: any) => ({
              id: n.id,
              icon: n.type === 'raffle_win' ? '🏆' : '📦',
              title: n.title,
              desc: n.body + (n.pin ? ` PIN: ${n.pin}` : ''),
              time: new Date(n.created_at).toLocaleString(),
              isNew: !n.read,
              color: n.type === 'raffle_win' ? 'yellow' : 'blue',
            }));
            const existing = JSON.parse(localStorage.getItem('vip_inbox_messages') || '[]');
            const merged = [...inbox];
            existing.forEach((e: any) => {
              if (!merged.find((m: any) => m.title === e.title && m.desc === e.desc)) {
                merged.push(e);
              }
            });
            localStorage.setItem('vip_inbox_messages', JSON.stringify(merged.slice(0, 50)));
          }
        } catch {}
      }
    };
    loadChatAndInbox();

    const storageHandler = (e: StorageEvent) => {
      if (e.key === LS('live_pinned')) {
        if (e.newValue) setActivePinned(JSON.parse(e.newValue));
        else setActivePinned(null);
      }
      // Crew chat message bridge (same-browser cross-tab)
      if (e.key === LS('live_chat_sync') && e.newValue) {
        try {
          const msg = JSON.parse(e.newValue);
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            const next = [...prev, msg];
            return next.length > 80 ? next.slice(-80) : next;
          });
        } catch (err) {}
      }
    };
    window.addEventListener('storage', storageHandler);

    // Supabase Realtime subscription for cross-browser chat sync
    const chatChannel = supabase.channel('live_chat')
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        if (!payload?.id) return;
        setMessages(prev => {
          if (prev.find(m => m.id === payload.id)) return prev;
          const next = [...prev, payload as ChatMsg];
          return next.length > 80 ? next.slice(-80) : next;
        });
      })
      .subscribe();

    return () => {
      window.removeEventListener('storage', storageHandler);
      supabase.removeChannel(chatChannel);
    };
  }, []);

  // When stream ended AND merch sale is done → start the 30s countdown
  useEffect(() => {
    if (streamEnded && !showFlashDrop && disconnectCountdown === null) {
      setDisconnectCountdown(30);
    }
  }, [streamEnded, showFlashDrop, disconnectCountdown]);

  // When stream ends, reset UI state and clear stale live flags
  useEffect(() => {
    if (streamEnded) {
      // Force UI back to offline mode
      setFeedActive(false);
      // Remove any lingering localStorage live markers
      try {
        localStorage.removeItem(`is_live_${memberId}`);
        localStorage.removeItem('is_live');
        localStorage.removeItem(LS('crew_is_live'));
      } catch {}
    }
  }, [streamEnded]);

  // Stream-ended polling fallback — checks Supabase + LiveKit every 5s
  // This catches when the crew ends the stream even if the broadcast event
  // didn't fire (different tabs, network lag, UUID vs slug mismatch)
  useEffect(() => {
    if (!feedActive || streamEnded) return;

    const pollStreamAlive = async () => {
      try {
        // Check Supabase: are there any live streams for this member?
        const sb = createClient();
        const { data: liveStreams } = await sb
          .from('live_streams')
          .select('id')
          .eq('status', 'live');

        // Check if ANY live stream exists (the member's Supabase user_id won't match the slug,
        // so we also check LiveKit rooms as a cross-reference)
        const hasSupabaseStream = liveStreams && liveStreams.length > 0;

        // Check LiveKit rooms
        let hasLiveKitRoom = false;
        try {
          const res = await fetch('/api/live-rooms');
          const lkData = await res.json();
          hasLiveKitRoom = lkData.rooms?.some((r: any) =>
            r.name === `live_${memberId}` || r.name === memberId
          ) ?? false;
        } catch {}

        // Also check localStorage flags
        const lsLive = localStorage.getItem(`is_live_${memberId}`) === 'true' ||
                        localStorage.getItem('is_live') === 'true' ||
                        localStorage.getItem(LS('crew_is_live')) === 'true';

        // If ALL sources say no → stream is dead
        if (!hasSupabaseStream && !hasLiveKitRoom && !lsLive) {
          console.log('📡 [StreamPoll] Stream confirmed ended — triggering disconnect');
          setStreamEnded(true);
        }
      } catch (err) {
        console.warn('Stream poll failed:', err);
      }
    };

    const interval = setInterval(pollStreamAlive, 5000);
    return () => clearInterval(interval);
  }, [feedActive, streamEnded, memberId]);

  // Raffle state polling — runs every 1s to catch status transitions 
  // (same-tab storage events don't fire, Supabase can lag in local dev)
  // Initial raffle state check on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS('live_raffle_sync'));
      if (raw) {
        const pb = JSON.parse(raw);
        if (pb && (pb.userId === memberId || memberId === 'michael')) {
          if (pb.status === 'idle') setRaffleState(null);
          else setRaffleState(pb);
        }
      }
    } catch {}
  }, [memberId]);




  // Safety net: if fan sees countdown=0, force re-read after 2s to catch 'complete' write
  useEffect(() => {
    if (raffleState?.status === 'countdown' && (raffleState.countdown ?? 1) <= 0) {
      const t = setTimeout(() => {
        try {
          const raw = localStorage.getItem(LS('live_raffle_sync'));
          if (raw) {
            const pb = JSON.parse(raw);
            if (pb.status !== 'idle') setRaffleState(pb);
          }
        } catch {}
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [raffleState?.status, raffleState?.countdown]);

  // Auto-reopen widget + fire winner email when raffle completes and current user won
  const winnerEmailSent = useRef(false);
  useEffect(() => {
    if (!raffleState || raffleState.status !== 'complete') {
      if (!raffleState) winnerEmailSent.current = false;
      return;
    }
    const isWinner = hasEnteredRaffle && !!member?.name &&
      raffleState.winners?.some((w: any) => (w?.name || w)?.toLowerCase().trim() === member.name.toLowerCase().trim());

    if (isWinner && raffleWidgetClosed) setRaffleWidgetClosed(false);

    if (isWinner && !winnerEmailSent.current) {
      winnerEmailSent.current = true;
      const prizeName = raffleState.prizes[0]?.name || 'your prize';
      const winnerIndex = raffleState.winners.findIndex((w: any) => (w?.name || w) === member.name);
      const pin = (raffleState.winnerPins?.[winnerIndex >= 0 ? winnerIndex : 0]) || '';

      const claimUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://7thheavenband.com'}/claim/${pin}`;
      const pinDigits = pin.split('').map((d: string) =>
        `<td style="padding:0 3px;"><div style="width:40px;height:52px;background:#0a0a0a;border:2px solid rgba(251,191,36,0.4);border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#FBBF24;font-size:24px;font-weight:900;font-family:monospace;">${d}</span></div></td>`
      ).join('');

      const fallbackEmail = 'fan@7thheavenband.com';
      const promptEmail = window.prompt("Testing Dispatch: What is your exact Resend account email address to receive the test?", member?.email || fallbackEmail);
      const targetEmail = promptEmail ? promptEmail.trim() : fallbackEmail;

      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: '🏆 You Won the 7th Heaven Raffle!',
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;"><tr><td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:22px 40px;text-align:center;border-radius:12px 12px 0 0;"><p style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p></td></tr><tr><td style="background:#111118;padding:48px 40px;text-align:center;border-left:1px solid #1f1f2e;border-right:1px solid #1f1f2e;"><p style="font-size:52px;margin:0 0 16px;">🏆</p><h1 style="margin:0 0 12px;color:#fff;font-size:32px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">YOU WON THE RAFFLE</h1><p style="margin:0 0 36px;color:#888;font-size:16px;">Congratulations — your name was drawn live in front of everyone.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="background:#0a0a0e;border:2px solid #FBBF24;border-radius:12px;padding:24px;text-align:center;"><p style="margin:0 0 8px;color:#92600a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Your Prize</p><p style="margin:0;color:#fff;font-size:24px;font-weight:900;">${prizeName}</p></td></tr></table>${pin ? `<p style="margin:0 0 12px;color:#555;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Claim PIN</p><table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;"><tr>${pinDigits}</tr></table><p style="margin:0 0 32px;color:#444;font-size:11px;">Show this PIN to the 7th Heaven crew at the merch table</p>` : ''}<a href="${claimUrl}" style="display:inline-block;background:#FBBF24;color:#000;font-weight:900;font-size:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:10px;margin-bottom:24px;">Open My Claim Page</a><p style="margin:0;color:#555;font-size:13px;">Or show this page to the crew at the merch table to collect your prize.</p></td></tr><tr><td style="background:#0d0d14;padding:24px 40px;text-align:center;border:1px solid #1f1f2e;border-top:none;border-radius:0 0 12px 12px;"><p style="margin:0 0 8px;color:#444;font-size:12px;">This email was sent because you entered the 7th Heaven live stream raffle.</p><p style="margin:0;color:#7c3aed;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7TH HEAVEN</p></td></tr></table></td></tr></table></body></html>`
        })
      }).catch(console.error);
      try {
        const inbox = JSON.parse(localStorage.getItem('vip_inbox_messages') || '[]');
        inbox.unshift({ id: Date.now(), icon: '🏆', title: 'You Won the Raffle!', desc: `Congratulations! You won: ${prizeName}. Your PIN: ${pin}. Check your email for claim instructions.`, time: 'Just now', isNew: true, color: 'yellow' });
        localStorage.setItem('vip_inbox_messages', JSON.stringify(inbox));

        // Also persist to Supabase notifications
        Promise.resolve(supabase.from('notifications').insert({
          user_email: member?.email || 'unknown@fan.7thheaven.com',
          type: 'raffle_win',
          title: `🏆 You Won the Raffle!`,
          body: `Congratulations! You won: ${prizeName}. Your PIN: ${pin}. Check your email for claim instructions.`,
          pin: pin,
          prize: prizeName,
        })).catch(() => {});
      } catch {}
    }
  }, [raffleState?.status, raffleState?.winners, raffleWidgetClosed]);


  // When a NEW raffle starts (status goes open after being complete/null),
  // reset the fan's entry state so they can enter the new raffle fresh
  const prevRaffleStatus = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevRaffleStatus.current;
    const curr = raffleState?.status ?? null;
    // New raffle detected: was complete or null, now is open
    if (curr === 'open' && (prev === 'complete' || prev === null)) {
      setHasEnteredRaffle(false);
      setRaffleWidgetClosed(false);
      setShowClaimModal(false);
      setClaimMethod(null);
    }
    // Raffle ended (idle): also clear closed state so widget shows on next open
    if (curr === null && prev !== null) {
      setHasEnteredRaffle(false);
      setRaffleWidgetClosed(false);
    }
    prevRaffleStatus.current = curr;
  }, [raffleState?.status]);

  // Auto-dismiss winner display after 3 minutes for everyone
  useEffect(() => {
    if (raffleState?.status !== 'complete') return;
    const t = setTimeout(() => {
      setRaffleWidgetClosed(true);
    }, 3 * 60 * 1000); // 3 minutes
    return () => clearTimeout(t);
  }, [raffleState?.status]);

  // Next Raffle Countdown (Wait for crew's 120s auto-restart)
  useEffect(() => {
    if (raffleState?.status === 'complete' && raffleState.timestamp) {
      const t = setInterval(() => {
        const diff = Math.floor((raffleState.timestamp + 120000 - Date.now()) / 1000);
        setNextRaffleCountdown(Math.max(0, diff));
      }, 1000);
      return () => clearInterval(t);
    } else {
      setNextRaffleCountdown(null);
    }
  }, [raffleState?.status, raffleState?.timestamp]);

  useEffect(() => {
    if (disconnectCountdown !== null && disconnectCountdown > 0) {
      const t = setInterval(() => {
        setDisconnectCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(t);
    }
    if (disconnectCountdown === 0) {
      window.location.href = '/tour';
    }
  }, [disconnectCountdown]);

  /* ── Flash Drop Countdown Timer ── */
  useEffect(() => {
    // Keep the merch timer running even after stream ends so the sale completes
    if (!showFlashDrop || flashTimeLeft <= 0 || !feedActive || flashStock <= 0) return;
    const t = setInterval(() => {
      setFlashTimeLeft(prev => {
        if (prev <= 1) {
          setShowFlashDrop(false); // Automatically close the drop when time runs out!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showFlashDrop, flashTimeLeft, viewerCount, flashStock]);

  /* ── Out of Sale Timer ── */
  useEffect(() => {
    if (showFlashDrop && flashStock <= 0) {
      const wait = setTimeout(() => {
        setShowFlashDrop(false);
      }, 20000); // 20 seconds
      return () => clearTimeout(wait);
    }
  }, [showFlashDrop, flashStock]);

  const formatFlashTime = (s: number) => {
    if (s < 0) return '∞';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Sync elapsed time from localStorage (using start time for accuracy)
  useEffect(() => {
    if (!feedActive || streamEnded) return;
    const t = setInterval(() => {
      const start = localStorage.getItem(LS('live_stream_start'));
      if (start) {
        setElapsed(Math.floor((Date.now() - parseInt(start)) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [memberId, feedActive, streamEnded]);

  const CHAT_EMOJIS = ['😂','❤️','🔥','🤘','🎸','👏','⚡','😍','🙌','💀','👀','🎵','🫶','😭','💜','🤯','🎤','🎶','🥹','😎'];

  /* ── Format elapsed time ── */
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  // ── Elapsed timer: sync from crew's start timestamp ──
  useEffect(() => {
    if (streamEnded) return;
    const t = setInterval(() => {
      const start = localStorage.getItem(LS('live_stream_start'));
      if (start) {
        setElapsed(Math.floor((Date.now() - parseInt(start)) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [streamEnded]);

  // ── Viewer count: read real count from localStorage ──
  useEffect(() => {
    if (streamEnded) return;
    const t = setInterval(() => {
      const val = localStorage.getItem(LS('live_viewer_count'));
      if (val) setViewerCount(parseInt(val));
    }, 2000);
    return () => clearInterval(t);
  }, [streamEnded]);

  /* ── Light phase animation ── */
  useEffect(() => {
    const t = setInterval(() => setLightPhase(p => (p + 1) % 360), 80);
    return () => clearInterval(t);
  }, []);

  /* ── 🔥 Hype auto-decay ── */
  useEffect(() => {
    const t = setInterval(() => {
      setHype(h => Math.max(0, h - 0.5));
    }, 200);
    return () => clearInterval(t);
  }, []);

  /* ── 🔥 Hype burst effect at 100% — then reset to 0 ── */
  useEffect(() => {
    if (hype >= 100 && !hypeBurst) {
      setHypeBurst(true);
      // Spawn burst of reactions
      const burstEmojis = Array.from({ length: 12 }, (_, i) => ({
        id: `burst-${Date.now()}-${i}`,
        emoji: REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)],
        x: 5 + Math.random() * 85,
        createdAt: Date.now(),
      }));
      setFloating(prev => [...prev, ...burstEmojis]);
      // Reset hype to 0 after burst
      setTimeout(() => {
        setHype(0);
        setHypeBurst(false);
      }, 3000);
    }
  }, [hype, hypeBurst]);





  /* ── Generate random chat messages ── */
  const addRandomMessage = useCallback(() => {
    const isCrew = Math.random() < 0.12; // 12% chance crew message
    const account = isCrew
      ? CREW_ACCOUNTS[Math.floor(Math.random() * CREW_ACCOUNTS.length)]
      : FAN_ACCOUNTS[Math.floor(Math.random() * FAN_ACCOUNTS.length)];

    const pool = isCrew ? CREW_MESSAGES : FAN_MESSAGES;
    const text = pool[Math.floor(Math.random() * pool.length)];

    const msg: ChatMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      account,
      text,
      timestamp: Date.now(),
    };

    setMessages(prev => {
      const next = [...prev, msg];
      return next.length > 80 ? next.slice(-80) : next;
    });
  }, []);

  // Chat simulation disabled — only real messages from crew & fans now

  /* ── Sync real-time multi-tab Fan chat, Reactions & Merch ── */
  useEffect(() => {
    // --- Load Pinned State from Local Storage ---
    // Chat is loaded from Supabase (source of truth) in loadChatAndInbox above
    try {
      const storedPin = localStorage.getItem('7h_global_pinned');
      if (storedPin && storedPin !== 'null') setActivePinned(JSON.parse(storedPin));
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === '7h_global_chat_history' && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
      if (e.key === '7h_global_pinned' && e.newValue) {
        setActivePinned(e.newValue === 'null' ? null : JSON.parse(e.newValue));
      }
      if (e.key === '7h_flash_drop' && e.newValue) {
        const data = JSON.parse(e.newValue);
        setFlashName(data.name || 'Signature Item');
        setFlashPrice(data.price || '0.00');
        const parsedStock = parseInt(data.stock);
        setFlashStock(!isNaN(parsedStock) ? parsedStock : 50);
        setFlashImage(data.image || '/images/mockups/merch_hoodie.png');
        setFlashTimeLeft(parseInt(data.duration) || 300);
        setHasPurchased(false);
        setShowFlashDrop(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    chatChannelRef.current = supabase.channel('live_chat_demo')
      .on('broadcast', { event: 'new_reaction' }, (payload) => {
        const data = payload.payload as FloatingEmoji;
        setFloating(prev => {
          if (prev.find(r => r.id === data.id)) return prev;
          return [...prev, data];
        });
        setHype(h => Math.min(100, h + 2));
      })
      .subscribe((status) => {
        console.log('Fan Live Chat Status:', status);
      });

    const eventsChannel = supabase.channel('live_events')
      .on('broadcast', { event: 'flash_drop' }, (payload) => {
        const data = payload.payload;
        setFlashName(data.name || 'Signature Item');
        setFlashPrice(data.price || '0.00');
        const parsedStock2 = parseInt(data.stock);
        setFlashStock(!isNaN(parsedStock2) ? parsedStock2 : 50);
        setFlashImage(data.image || '/images/mockups/merch_hoodie.png');
        setFlashTimeLeft(parseInt(data.duration) || 300);
        setHasPurchased(false);
        setShowFlashDrop(true);
      })
      .on('broadcast', { event: 'merch_sync' }, (payload) => {
        const data = payload.payload;
        if (data.timer !== undefined) setFlashTimeLeft(data.timer);
        if (data.stock !== undefined) setFlashStock(data.stock);
      })
      .on('broadcast', { event: 'stream_state' }, (payload) => {
        const data = payload.payload;
        // Accept stream end if: userId matches directly, OR userId contains the memberId slug,
        // OR this is the only stream we're watching (single-room page)
        if (data.isLive === false && (
          data.userId === memberId ||
          data.userId?.toLowerCase?.().includes?.(memberId.toLowerCase()) ||
          memberId.length <= 20 // slug-based memberId means we're on a dynamic room page
        )) {
          setStreamEnded(true);
          setRaffleState(null); // Clear raffle on stream end
        }
      })
      .on('broadcast', { event: 'raffle_sync' }, (p) => {
        const pb = p.payload;
        // Only sync if this raffle belongs to the member we are watching
        if (pb && (pb.userId === memberId || memberId === 'michael')) {
          if (pb.status === 'idle') {
            setRaffleState(null);
          } else {
            setRaffleState(pb);
          }
        }
      })
      .on('broadcast', { event: 'reaction' }, (payload) => {
        const data = payload.payload;
        setFloating(prev => [...prev, { ...data, createdAt: Date.now() }]);
        setHype(h => Math.min(100, h + 2));
      })
      .subscribe();

    return () => { 
      window.removeEventListener('storage', handleStorage);
      if (chatChannelRef.current) supabase.removeChannel(chatChannelRef.current); 
      supabase.removeChannel(eventsChannel);
    };
  }, [supabase]);

  /* ── Auto-scroll chat ── */
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      // Only auto-scroll if user is near the bottom
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      if (isNearBottom) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Auto-reactions disabled — only real user reactions now

  // Clean up old floating emojis
  useEffect(() => {
    const t = setInterval(() => {
      setFloating(prev => prev.filter(e => Date.now() - e.createdAt < 3000));
    }, 500);
    return () => clearInterval(t);
  }, []);

  /* ── Send reaction ── */
  const sendReaction = (emoji: string) => {
    const reactionInfo: FloatingEmoji = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      emoji,
      x: 10 + Math.random() * 70,
      createdAt: Date.now(),
    };

    // Optimistic local update
    setFloating(prev => [...prev, reactionInfo]);
    setHype(h => Math.min(100, h + 2));

    // Broadcast globally
    try {
      supabase.channel('live_events').send({
        type: 'broadcast',
        event: 'reaction',
        payload: { ...reactionInfo, memberId, userId: memberId }
      });
    } catch {}

    // Bridge to crew dashboard via localStorage
    localStorage.setItem(LS('live_reaction_sync'), JSON.stringify(reactionInfo));
  };

  /* ── Simulate Purchase Flow & Headless API ── */
  const handlePurchase = () => {
    if (flashAllowPickup) {
      // Show ship vs pickup choice first
      setShowFulfillmentModal(true);
    } else {
      // Ship only — go straight to checkout
      setCheckoutQuantity(1);
      setIsCheckoutOpen(true);
    }
  };

  const handleFulfillmentChoice = (choice: 'ship' | 'pickup') => {
    setFulfillmentChoice(choice);
    setShowFulfillmentModal(false);
    if (choice === 'pickup') {
      // Generate a pickup confirmation code
      const code = 'PU-' + String(Math.floor(100000 + Math.random() * 900000));
      setPickupCode(code);
      // Save to localStorage so merch table pickup queue can see it
      const queue: any[] = JSON.parse(localStorage.getItem('merch_pickup_queue') || '[]');
      queue.unshift({
        id: Date.now(),
        code,
        item: flashName,
        price: flashPrice,
        customer: member?.name || 'Fan',
        email: member?.email || '',
        ts: Date.now(),
        claimed: false,
      });
      localStorage.setItem('merch_pickup_queue', JSON.stringify(queue));
      // Notify VIP inbox
      const inbox = JSON.parse(localStorage.getItem('vip_inbox_messages') || '[]');
      inbox.unshift({ id: Date.now(), icon: '🛍️', title: 'Pickup Reserved!', desc: `Your ${flashName} is reserved for pickup. Code: ${code}`, time: 'Just now', isNew: true, color: 'yellow' });
      localStorage.setItem('vip_inbox_messages', JSON.stringify(inbox));

      // Persist to Supabase
      Promise.resolve(supabase.from('merch_pickups').insert({
        fan_email: member?.email || '',
        fan_name: member?.name || 'Fan',
        product_name: flashName,
        quantity: 1,
        total: parseFloat(flashPrice.replace(/[^0-9.]/g, '')) || 0,
        pin: code,
        stream_id: `live_${memberId?.toString().toLowerCase().trim()}`,
      })).catch(() => {});

      Promise.resolve(supabase.from('notifications').insert({
        user_email: member?.email || '',
        type: 'merch_pickup',
        title: '🛍️ Pickup Reserved!',
        body: `Your ${flashName} is reserved for pickup. Code: ${code}`,
        pin: code,
        prize: flashName,
      })).catch(() => {});
      
      recordSale(1); // Record 1 quantity for pickup
      setHasPurchased(true);
    } else {
      setCheckoutQuantity(1);
      setIsCheckoutOpen(true);
    }
  };

  const recordSale = (qty: number) => {
    try {
      const priceVal = parseFloat(flashPrice.replace(/[^0-9.]/g, '')) || 0;
      const totalToAdd = priceVal * qty;
      const currentSales = parseFloat(localStorage.getItem(LS('live_merch_sales')) || '0');
      localStorage.setItem(LS('live_merch_sales'), (currentSales + totalToAdd).toString());
    } catch(e) {}
  };

  // Add this near the top of the file if not already imported:
  // import { createCheckout, getProducts } from '@/lib/shopify';

  const executePayment = async () => {
    setIsProcessingPayment(true);
    
    // 1. Attempt Headless Shopify Real-World Generation
    if (process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      try {
        // Dynamically fetch the first available product in the linked store
        // to bypass placeholder validation errors and generate a real cart
        const { getProducts, createCheckout } = await import('@/lib/shopify');
        const products = await getProducts();
        
        if (products && products.length > 0) {
          // Extract the exact Variant ID of the first product
          const firstVariantId = products[0].variants.edges[0].node.id;
          const checkoutUrl = await createCheckout(firstVariantId);
          
          if (checkoutUrl) {
             window.open(checkoutUrl, '_blank');
             setIsProcessingPayment(false);
             return;
          }
        } else {
          console.warn('Connected to Shopify, but NO products were found in the store! Falling back to checkout simulation.');
        }
      } catch (e) {
        console.warn('Shopify Integration Pending: Safely falling back to local visual simulation.', e);
      }
    }

    // 2. Local Fallback Simulation Logic
    setTimeout(() => {
      // Simulate opening a generic checkout tab so the button "works" visually for the demo
      window.open('https://shopify.com/checkout/demo-simulation', '_blank');
      
      setIsProcessingPayment(false);
      setIsCheckoutOpen(false);
      
      if (hasPurchased) return;
      
      recordSale(checkoutQuantity); // Add revenue directly to global counter

      setHasPurchased(true);
      if (flashStock > 0) setFlashStock(s => Math.max(0, s - checkoutQuantity));
      
      // Automatically trigger 100% hype rush 
      setHype(100);

      // Drop a simulated system message into the chat room
      setMessages(prev => [...prev, {
        id: `sys-purchase-${Date.now()}`,
        account: {
          id: 'system', name: 'System', displayName: 'SYSTEM', role: 'admin', color: '#ec4899', avatar: '🛍️', joinYear: 2024
        },
        text: `Just snagged ${checkoutQuantity > 1 ? `${checkoutQuantity} copies of ` : 'the '}${flashName}! 🔥🔥🔥`,
        timestamp: Date.now(),
      }]);
    }, 1500);
  };

  /* ── Handle user sending a message ── */
  const handleSend = () => {
    if (!isLoggedIn) { openModal('login'); return; }
    if (!userMessage.trim()) return;
    const msg: ChatMsg = {
      id: `user-${Date.now()}`,
      account: {
        id: member?.id || 'you',
        name: member?.name || 'You',
        displayName: member?.name || 'You',
        role: 'fan',
        color: '#8b5cf6',
        avatar: member?.avatar || member?.name?.slice(0, 2).toUpperCase() || 'YO',
        tier: 'Gold',
        joinYear: 2023,
      },
      text: userMessage.trim(),
      timestamp: Date.now(),
    };
    
    // Sync to persistence history
    const stored = JSON.parse(localStorage.getItem('7h_global_chat_history') || '[]');
    const nextPosts = [...stored, msg];
    const limited = nextPosts.length > 100 ? nextPosts.slice(-100) : nextPosts;
    
    setMessages(limited);
    localStorage.setItem('7h_global_chat_history', JSON.stringify(limited));

    // Persist to Supabase chat_messages table
    const roomId = `live_${memberId?.toString().toLowerCase().trim()}`;
    Promise.resolve(supabase.from('chat_messages').insert({
      room: roomId,
      sender_name: member?.name || 'You',
      sender_role: 'fan',
      sender_avatar: member?.avatar || 'YO',
      content: userMessage.trim(),
    })).catch(() => {});

    // Broadcast via Supabase Realtime for cross-browser/tab sync
    supabase.channel('live_chat').send({
      type: 'broadcast',
      event: 'new_message',
      payload: msg,
    }).catch(() => {});

    setUserMessage('');
  };

  /* ── Tier badge colors ── */
  const tierColors: Record<string, string> = {
    Bronze: '#cd7f32',
    Silver: '#c0c0c0',
    Gold: '#ffd700',
    Platinum: '#a855f7',
  };

  /* ── Role badge ── */
  const RoleBadge = ({ account }: { account: FakeAccount }) => {
    if (account.role === 'crew' || account.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#8a1cfc]/20 border border-[#8a1cfc]/40 rounded text-[0.55rem] font-bold uppercase tracking-wider text-[#c084fc] ml-1.5">
          {account.badge || '⭐'} CREW
        </span>
      );
    }
    return null;
  };

  /* otherRooms derived from memberId above */

  /* ── Concert stage gradient ── */
  const stageGradient = useMemo(() => {
    const hue1 = lightPhase % 360;
    const hue2 = (lightPhase + 120) % 360;
    const hue3 = (lightPhase + 240) % 360;
    return `
      radial-gradient(ellipse 80% 60% at 20% 80%, hsla(${hue1}, 80%, 30%, 0.5) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 80% 70%, hsla(${hue2}, 80%, 25%, 0.4) 0%, transparent 60%),
      radial-gradient(ellipse 100% 40% at 50% 100%, hsla(${hue3}, 70%, 20%, 0.6) 0%, transparent 50%),
      radial-gradient(circle at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 40%),
      linear-gradient(180deg, #050508 0%, #0a0a12 40%, #0d0b18 100%)
    `;
  }, [lightPhase]);

  // Poll for live status changes (e.g. crew goes live while fan is waiting)
  useEffect(() => {
    if (feedActive) return;
    const poll = setInterval(async () => {
      const live = await checkIfLiveRef.current();
      if (live) {
        setFeedActive(true);
        clearInterval(poll);
      }
    }, 3000);
    return () => clearInterval(poll);
  }, [feedActive]);

  // If we haven't redirected yet, aggressively block the UI
  if (!feedActive) {
    return (
      <section className="fixed inset-0 bg-[#07070a] z-50 flex items-center justify-center">
        <style>{`header, footer, .page-nav, a[href="/studio"] { display: none !important; } body { overflow: hidden !important; }`}</style>
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-white/20">
            {crewConfig.avatar}
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{crewConfig.displayName}</h2>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-sm text-white/40 uppercase tracking-widest font-bold">Offline</span>
          </div>
          <p className="text-white/30 text-sm mb-8 leading-relaxed">
            This crew member isn't streaming right now. When they go live, the feed will start automatically.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/20 text-xs animate-pulse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Waiting for stream...
          </div>
          <Link href="/tour" className="inline-block mt-8 px-6 py-2.5 bg-white/5 border border-white/10 text-white/50 text-xs uppercase tracking-widest font-bold hover:bg-white/10 hover:text-white transition-all rounded-lg">
            ← Back to Tour
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="fixed inset-0 top-0 bg-[var(--color-bg-primary)] z-40 flex flex-col overflow-hidden">
      {/* Hide site header/footer/nav on this page */}
      <style>{`
        header, footer, .page-nav, a[href="/studio"] { display: none !important; }
        body { overflow: hidden !important; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>


      {/* ── Top bar: Back + Stream info ── */}
      <div className="shrink-0 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-[#060609] border-b border-white/[0.06]">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link
            href="/live"
            className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all font-medium text-xs shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${crewConfig.gradient} flex items-center justify-center text-white text-[0.5rem] sm:text-[0.6rem] font-black shrink-0`}>{crewConfig.avatar}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-white/90 text-xs sm:text-sm font-bold truncate">Crew Cam: {crewConfig.displayName}</span>
                <span className="hidden xs:inline-flex px-1.5 py-0.5 bg-[#8a1cfc]/20 border border-[#8a1cfc]/40 rounded text-[0.45rem] sm:text-[0.5rem] font-bold uppercase tracking-wider text-[#c084fc] shrink-0">{crewConfig.badge} CREW</span>
              </div>
              <p className="text-white/30 text-[0.55rem] sm:text-[0.65rem] truncate hidden sm:block">7th Heaven · House of Blues, Chicago · {formatTime(elapsed)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Other live feeds mock removed per design update */}
          {/* Mobile elapsed time */}
          <span className="sm:hidden text-white/40 text-[0.6rem] font-mono">{formatTime(elapsed)}</span>

          {isLoggedIn ? (
            <div className="flex items-center gap-2 ml-1 sm:ml-2">
              <Link
                href={member?.role === 'event_planner' ? '/planner' : member?.role === 'crew' ? '/crew' : member?.role === 'admin' ? '/admin' : '/fans'}
                className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 text-[var(--color-accent)] text-[0.6rem] sm:text-xs font-bold hover:bg-[var(--color-accent)]/30 transition-all rounded-full"
                title="Dashboard"
              >
                {member?.name ? member.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : member?.avatar}
              </Link>
              <button
                onClick={() => { logout(); window.location.href = '/'; }}
                className="h-7 sm:h-8 px-2 sm:px-3 flex items-center justify-center gap-1.5 border border-white/10 text-white/30 hover:border-rose-500/40 hover:text-rose-400 transition-all cursor-pointer bg-white/[0.02] rounded-md"
                title="Sign Out"
              >
                <svg width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span className="text-[0.55rem] sm:text-[0.6rem] font-bold uppercase tracking-widest hidden sm:block">Sign Out</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Main: Video + Chat ── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

        {/* ── VIDEO PLAYER ── */}
        {/* Mobile/tablet: fixed aspect ratio. Desktop: fills remaining space */}
        <div className="w-full lg:flex-1 lg:min-w-0 lg:min-h-0 relative shrink-0 lg:shrink">
          {/* Mobile: aspect ratio container. Desktop: absolute fill */}
          {streamEnded ? (
            <div className="aspect-video lg:aspect-auto lg:absolute lg:inset-0 flex flex-col items-center justify-center text-center p-6" style={{ background: stageGradient }}>
              <span className="text-5xl mb-4 block">👋</span>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter mb-2" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                Thanks For Watching
              </h2>
              <p className="text-white/30 text-xs max-w-xs mx-auto">
                The show has ended. We hope you enjoyed it!
              </p>
              {disconnectCountdown !== null && (
                <p className="text-white/20 text-[0.65rem] mt-4 font-mono">
                  Redirecting to Tour Dates in <span className="text-pink-400 font-bold">{disconnectCountdown}s</span>
                </p>
                )}
            </div>
          ) : (
          <div className="aspect-video lg:aspect-auto lg:absolute lg:inset-0" style={{ background: stageGradient }}>
            {/* True WebRTC LiveKit Feed */}
            <LiveKitStream 
              room={memberId ? `live_${memberId}` : 'live_michael'} 
              username={member?.name ? `${member.name} (Fan)` : `Fan_${Math.floor(Math.random() * 10000)}`} 
              isPublisher={false} 
              className="absolute inset-0 z-10 w-full h-full object-cover" 
            />
            {/* Stage silhouettes */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-0 right-0 h-[45%] opacity-40" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
              }}/>
              <div className="absolute bottom-0 left-0 right-0 h-[15%] opacity-70" style={{
                background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.8) 60%, transparent 100%)',
              }}/>
              {/* Spotlight beams */}
              <div className="absolute top-0 left-[20%] w-[2px] h-[70%] opacity-20 blur-sm" style={{
                background: `linear-gradient(to bottom, hsla(${lightPhase}, 100%, 70%, 0.8), transparent)`,
                transform: `rotate(${Math.sin(lightPhase * 0.02) * 8}deg)`,
                transformOrigin: 'top center',
              }}/>
              <div className="absolute top-0 left-[50%] w-[3px] h-[65%] opacity-15 blur-sm" style={{
                background: `linear-gradient(to bottom, hsla(${(lightPhase + 180) % 360}, 100%, 70%, 0.6), transparent)`,
                transform: `rotate(${Math.cos(lightPhase * 0.015) * 10}deg)`,
                transformOrigin: 'top center',
              }}/>
              <div className="absolute top-0 left-[75%] w-[2px] h-[60%] opacity-20 blur-sm" style={{
                background: `linear-gradient(to bottom, hsla(${(lightPhase + 90) % 360}, 100%, 70%, 0.7), transparent)`,
                transform: `rotate(${Math.sin(lightPhase * 0.018 + 1) * 6}deg)`,
                transformOrigin: 'top center',
              }}/>
              {/* Stage text */}
              <div className="absolute top-[30%] sm:top-[35%] left-1/2 -translate-x-1/2 text-center pointer-events-none select-none">
                <div className="text-white/[0.06] text-[clamp(1.5rem,6vw,5rem)] font-black italic tracking-widest uppercase" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                  7TH HEAVEN
                </div>
                <div className="text-white/[0.04] text-[0.5rem] sm:text-xs tracking-[0.3em] sm:tracking-[0.4em] uppercase mt-1">LIVE FROM CHICAGO</div>
              </div>
            </div>

            {/* Floating emojis */}
            {!reactionsHidden && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                {floating.map(item => (
                  <span
                    key={item.id}
                    className="absolute text-xl sm:text-2xl md:text-3xl animate-float-up"
                    style={{
                      left: `${item.x}%`,
                      bottom: '8%',
                      animationDuration: '2800ms',
                    }}
                  >
                    {item.emoji}
                  </span>
                ))}
              </div>
            )}




            {/* Top-left: LIVE badge + viewer count */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-30 flex items-center gap-1.5 sm:gap-2">
              <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-red-600 rounded-full text-white text-[0.6rem] sm:text-xs font-bold uppercase tracking-wider shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              <button
                onClick={() => setShowViewers(v => !v)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-[0.6rem] sm:text-xs font-semibold hover:bg-black/80 transition-colors cursor-pointer"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-3 sm:h-3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {viewerCount.toLocaleString()}
              </button>
              <button
                onClick={() => setReactionsHidden(h => !h)}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 backdrop-blur-sm rounded-full text-[0.55rem] sm:text-[0.65rem] font-semibold transition-colors cursor-pointer ${
                  reactionsHidden ? 'bg-white/10 text-white/40' : 'bg-black/60 text-white/70'
                }`}
              >
                {reactionsHidden ? 'Show Reactions' : 'Hide Reactions'}
              </button>
            </div>

            {/* Top-right: elapsed time + hype meter */}
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30 flex items-center gap-2">

              <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-black/60 backdrop-blur-sm rounded-full text-white/80 text-[0.6rem] sm:text-xs font-mono tracking-wider">
                ⏱ {formatTime(elapsed)}
              </div>
            </div>

            {/* 🔥 Hype Burst overlay */}
            {hypeBurst && (
              <div className="absolute inset-0 z-25 pointer-events-none animate-pulse" style={{
                background: 'radial-gradient(circle at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
              }} />
            )}

            {/* LIVE RAFFLE WIDGET */}
            {raffleState && !raffleWidgetClosed && (() => {
              const isCurrentUserWinner = hasEnteredRaffle && !!member?.name &&
                raffleState.winners?.some((w: any) => (w?.name || w)?.toLowerCase().trim() === member!.name.toLowerCase().trim());
              return (
              <div className="absolute top-20 left-4 sm:left-auto sm:right-4 z-40 w-[calc(100%-2rem)] sm:w-full sm:max-w-xs animate-in slide-in-from-right-8 fade-in duration-500">
                <div className="bg-[#0a0a0e]/95 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.3)] text-white relative flex flex-col px-4 py-5 pointer-events-auto">

                  {/* Close button — top right */}
                  <button
                    onClick={() => setRaffleWidgetClosed(true)}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/40 hover:text-white rounded-full transition-colors z-10"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>

                  {/* ── OPEN state ── */}
                  {raffleState.status === 'open' && (
                   <>
                    <div className="flex items-center gap-2 text-yellow-400 mb-4 pr-6">
                     <span className="text-xl animate-pulse">🎰</span>
                     <span className="font-black text-[0.8rem] uppercase tracking-widest leading-tight mt-1">Live Raffle</span>
                     <span className="ml-auto px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-[0.6rem] font-bold uppercase tracking-widest animate-pulse">OPEN</span>
                    </div>

                    {/* Entrant count + progress */}
                    <div className="mb-4">
                     <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[0.55rem] font-bold text-white/40 uppercase tracking-widest">{Array.isArray(raffleState.entrants) ? raffleState.entrants.length : (raffleState.entrants || 0)} entered</span>
                      <span className="text-[0.55rem] font-bold text-yellow-500/70 uppercase tracking-widest">{raffleState.minEntrants ?? '?'} needed</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                       style={{ width: `${Math.min(100, ((Array.isArray(raffleState.entrants) ? raffleState.entrants.length : (raffleState.entrants || 0)) / (raffleState.minEntrants || 1)) * 100)}%` }} />
                     </div>
                    </div>

                    {/* Prize */}
                    {raffleState.prizes[0]?.name && (
                     <div className="mb-4 px-3 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-[0.5rem] font-bold text-yellow-500/60 uppercase tracking-[0.15em] mb-1">You could win</p>
                      <p className="text-yellow-300 font-black text-base leading-tight">
                         {raffleState.prizes[0].qty > 1 ? <span className="text-white bg-yellow-500/30 px-1.5 py-0.5 rounded text-xs mr-2">{raffleState.prizes[0].qty}x</span> : null}
                         {raffleState.prizes[0].name}
                      </p>
                      {raffleState.prizes.filter((p:any) => p.name).length > 1 && (
                       <p className="text-yellow-500/70 text-[0.65rem] mt-1">+ {raffleState.prizes.filter((p:any) => p.name).length - 1} more prizes</p>
                      )}
                     </div>
                    )}

                    {!hasEnteredRaffle ? (
                     <button onClick={() => {
                      if (!isLoggedIn) { openModal('login'); return; }
                      setHasEnteredRaffle(true);
                      setRaffleWidgetClosed(false);
                      // ── Send real raffle entry to crew page ──
                      const fanName = (member as any)?.name || (member as any)?.displayName || 'Fan';
                      localStorage.setItem('raffle_enter_sync', JSON.stringify({ fanName, ts: Date.now() }));
                      try { supabase?.channel('live_events').send({ type: 'broadcast', event: 'raffle_enter', payload: { fanName } }); } catch {}
                      fetch('/api/email', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({
                        to: member?.email || 'fan@7thheavenband.com',
                        subject: '🎟️ You are entered into the 7th Heaven Raffle!',
                        html: `<div style="font-family:Arial,sans-serif;background:#000;color:#fff;padding:40px 20px;text-align:center;"><h1 style="color:#FBBF24;">RAFFLE ENTRY CONFIRMED</h1><p>You entered the raffle for <strong>${raffleState?.prizes[0]?.name || 'the live drop'}</strong>.</p></div>`
                       })
                      }).catch(console.error);
                      try {
                       const inbox = JSON.parse(localStorage.getItem('vip_inbox_messages') || '[]');
                       inbox.unshift({ id: Date.now(), icon: '🎰', title: 'Raffle Entry Confirmed!', desc: `You've entered the live raffle. Stay tuned!`, time: 'Just now', isNew: true, color: 'yellow' });
                       localStorage.setItem('vip_inbox_messages', JSON.stringify(inbox));
                      } catch {}
                     }} className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[0.7rem] uppercase tracking-[0.15em] rounded-xl transition-colors shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                      Enter Raffle
                     </button>
                    ) : (
                     <div className="w-full py-3 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 text-center font-black text-[0.7rem] uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      You're Entered!
                     </div>
                    )}
                   </>
                  )}

                  {/* ── COUNTDOWN state — no timer, just confirm entry ── */}
                  {raffleState.status === 'countdown' && (
                   <div className="py-8 text-center flex flex-col items-center gap-3">
                    <span className="text-4xl">🎟️</span>
                    <p className="text-yellow-300 font-black text-sm uppercase tracking-wider">Drawing Coming Up!</p>
                    <p className="text-white/40 text-[0.6rem]">{raffleState.entrants} entries locked in</p>
                    {hasEnteredRaffle && (
                     <div className="mt-1 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-yellow-400 text-[0.65rem] font-bold">✓ You're in the drawing!</p>
                     </div>
                    )}
                   </div>
                  )}

                  {/* ── DRAWING ── */}
                  {raffleState.status === 'drawing' && (
                   <div className="py-8 text-center flex flex-col items-center justify-center">
                    <div className="text-5xl animate-spin mb-4">🎰</div>
                    <p className="text-yellow-400 font-black text-sm uppercase tracking-widest animate-pulse">Drawing Winner...</p>
                   </div>
                  )}

                  {/* ── COMPLETE — username only ── */}
                  {raffleState.status === 'complete' && (
                   <div className="py-2">
                    <div className="flex items-center gap-2 text-yellow-400 mb-4 pr-6">
                     <span className="text-xl">🏆</span>
                     <span className="font-black text-[0.8rem] uppercase tracking-widest">Raffle Winner</span>
                    </div>
                    <div className="space-y-2">
                     {raffleState.winners.map((wObj: any, i: number) => {
                      const w = wObj?.name || wObj;
                      const isMine = isCurrentUserWinner && i === 0;
                      return (
                       <div key={i} className={`rounded-xl overflow-hidden border ${isMine ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'border-white/10'}`}>
                        <div className={`px-3 py-1 text-[0.45rem] font-black uppercase tracking-[0.2em] text-center ${isMine ? 'bg-yellow-500 text-black' : 'bg-white/5 text-white/30'}`}>
                         {i === 0 ? '1st Place' : i === 1 ? '2nd Place' : '3rd Place'}{raffleState.prizes[i]?.name ? ` · ${raffleState.prizes[i].name}` : ''}
                        </div>
                        <div className={`px-4 py-3 text-center ${isMine ? 'bg-yellow-500/10' : ''}`}>
                         <p className={`font-black text-xl leading-tight ${isMine ? 'text-yellow-400' : 'text-white'}`}>{w}</p>
                         {isMine && (
                          <button onClick={() => setShowClaimModal(true)}
                           className="mt-2 w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[0.6rem] uppercase tracking-widest rounded-lg transition-colors">
                           Claim Reward
                          </button>
                         )}
                        </div>
                       </div>
                      );
                     })}
                    </div>
                    
                    <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                     <p className="text-[0.65rem] text-white/70 leading-relaxed font-semibold">
                      <span className="text-yellow-400 font-bold uppercase tracking-widest text-[0.55rem] block mb-1">How to Claim</span>
                      Winners: Check your <strong className="text-white">Email</strong> or your <strong className="text-white">Fan Profile Dashboard</strong> for your unique Verification PIN. Show your PIN to the crew at the merch table!
                     </p>
                    </div>

                    {nextRaffleCountdown !== null && nextRaffleCountdown > 0 && (
                     <div className="mt-5 pt-5 border-t border-white/5 text-center px-4 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <p className="text-[0.55rem] text-white/40 uppercase tracking-[0.2em] font-bold mb-2">Next Raffle Drawing In</p>
                      <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/10 shadow-inner">
                       <span className="text-[10px] animate-pulse">⏳</span>
                       <span className="text-[1.1rem] font-mono font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                        {Math.floor(nextRaffleCountdown / 60)}:{(nextRaffleCountdown % 60).toString().padStart(2, '0')}
                       </span>
                      </div>
                     </div>
                    )}
                   </div>
                  )}

                 </div>
               </div>
              );
            })()}

            {/* RAFFLE CLAIM MODAL OVERLAY */}
            {showClaimModal && (() => {
              const winnerIdx = Math.max(0, raffleState?.winners.findIndex((w: any) => (w?.name || w) === member?.name) ?? 0);
              const pin = raffleState?.winnerPins?.[winnerIdx] || '';

              const claimUrl = `${window.location.origin}/claim/${pin}`;
              return (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto">
                <div className="bg-[#0a0a0e]/98 backdrop-blur-xl border border-yellow-500/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                  <button onClick={() => { setShowClaimModal(false); setClaimMethod(null); }} className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>

                  {!claimMethod ? (
                    <>
                      <div className="text-center mb-5">
                        <span className="text-4xl mb-2 block">🏆</span>
                        <h3 className="text-xl font-black text-white uppercase tracking-wider">You Won!</h3>
                        {raffleState.prizes?.[winnerIdx]?.name && (
                          <p className="text-sm font-bold text-yellow-500 mt-1 uppercase tracking-widest">{raffleState.prizes[winnerIdx].name}</p>
                        )}
                        <p className="text-xs text-white/40 mt-1">Show your PIN to the crew at the merch table</p>
                      </div>

                      {pin && (
                        <div className="bg-yellow-500/5 border-2 border-yellow-500/40 rounded-xl p-4 mb-4 text-center">
                          <p className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-yellow-500/60 mb-3">Your Verification PIN</p>
                          <div className="flex items-center justify-center gap-2 mb-3">
                            {pin.split('').map((digit: string, i: number) => (
                              <div key={i} className="w-9 h-12 bg-black/60 border-2 border-yellow-500/40 rounded-lg flex items-center justify-center">
                                <span className="text-yellow-400 font-black text-2xl tabular-nums">{digit}</span>
                              </div>
                            ))}
                          </div>
                          <a href={claimUrl} target="_blank" rel="noreferrer"
                            className="block w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[0.65rem] uppercase tracking-widest rounded-lg transition-colors mb-2">
                            Open Full Claim Page
                          </a>
                          <p className="text-[0.5rem] text-white/20">This link is unique to you — show it to the crew</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-[0.55rem] text-white/30 uppercase tracking-widest text-center mb-2">Or choose how to receive your prize</p>
                        <button onClick={() => setClaimMethod('shipping')}
                          className="w-full p-3 border border-white/10 hover:border-yellow-500/30 bg-white/5 rounded-xl flex items-center gap-3 transition-all text-left">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white uppercase tracking-wider">Ship it to me</p>
                            <p className="text-[0.6rem] text-white/30 mt-0.5">100% off Shopify checkout link</p>
                          </div>
                        </button>
                        <button onClick={() => setClaimMethod('merch_table')}
                          className="w-full p-3 border border-white/10 hover:border-yellow-500/30 bg-white/5 rounded-xl flex items-center gap-3 transition-all text-left">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white uppercase tracking-wider">Pick up at Merch Table</p>
                            <p className="text-[0.6rem] text-white/30 mt-0.5">Show PIN or open claim page</p>
                          </div>
                        </button>
                      </div>
                    </>
                  ) : claimMethod === 'shipping' ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Shipping Claim</h3>
                      <p className="text-[0.7rem] text-white/50 mb-6 px-4">Your 100% off voucher is being generated. You'll be transferred to Shopify to enter your shipping details.</p>
                      <button onClick={() => { alert('In production, this opens a Shopify Cart with discount applied!'); setShowClaimModal(false); setClaimMethod(null); }} className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors">
                        Open Secure Checkout
                      </button>
                      <button onClick={() => setClaimMethod(null)} className="w-full mt-2 py-2 text-white/30 hover:text-white/60 text-[0.6rem] font-bold uppercase tracking-widest transition-colors">Back</button>
                    </div>
                  ) : claimMethod === 'merch_table' ? (
                    <div className="text-center py-4">
                      <h3 className="text-lg font-black text-emerald-400 uppercase tracking-wider mb-1">Merch Table Pickup</h3>
                      <p className="text-[0.65rem] text-white/40 mb-5 uppercase tracking-widest">Show this PIN or page to the crew</p>
                      {pin && (
                        <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            {pin.split('').map((digit: string, i: number) => (
                              <div key={i} className="w-8 h-10 bg-black/60 border border-yellow-500/40 rounded flex items-center justify-center">
                                <span className="text-yellow-400 font-black text-lg tabular-nums">{digit}</span>
                              </div>
                            ))}
                          </div>
                          <a href={claimUrl} target="_blank" rel="noreferrer" className="text-yellow-500/60 text-[0.55rem] underline">Open full claim page →</a>
                        </div>
                      )}
                      <button onClick={() => { setShowClaimModal(false); setClaimMethod(null); }} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-colors">Done</button>
                      <button onClick={() => setClaimMethod(null)} className="w-full mt-2 py-2 text-white/30 hover:text-white/60 text-[0.6rem] font-bold uppercase tracking-widest transition-colors">Back</button>
                    </div>
                  ) : null}
                </div>
              </div>
              );
            })()}


            {/* FLASH DROP WIDGET */}
            {showFlashDrop && (
              <div className="absolute bottom-16 right-4 sm:bottom-20 z-40 w-[calc(100%-2rem)] max-w-sm sm:max-w-md animate-in slide-in-from-bottom-8 fade-in duration-500 pointer-events-auto">
                <div className="bg-[#0a0a0e]/95 backdrop-blur-xl border-2 border-pink-500/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.3)] flex text-white relative">
                  <button onClick={() => setShowFlashDrop(false)} className="absolute top-2 right-2 text-white/50 hover:text-white z-50 p-1 bg-black/50 rounded-full cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  
                  {/* Left: product image */}
                  <div className="w-1/3 bg-white/5 flex items-center justify-center p-2 relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-transparent" />
                    <img src={flashImage} alt="Flash Drop Item" className="w-full object-contain mix-blend-screen relative z-10 drop-shadow-xl" onError={(e) => { e.currentTarget.src = '/images/mockups/merch_hoodie.png'; }} />
                    {flashStock <= 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <span className="text-white/80 font-black tracking-widest uppercase rotate-[-15deg] border-2 border-white/80 px-2 py-1 text-xs">Sold Out</span>
                      </div>
                    )}
                  </div>
                  {/* Right: info + buy */}
                  <div className="w-2/3 p-4 flex flex-col justify-center relative">
                        <div className="flex items-center gap-1.5 mb-1 text-pink-400 font-black text-[0.65rem] uppercase tracking-widest">
                          <span className="animate-pulse">🔥</span> FLASH DROP
                          <div className="ml-auto flex items-center gap-1 bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30">
                            <span className="text-[0.6rem] text-pink-400 font-bold tabular-nums">
                              {!feedActive ? 'WAITING FOR LIVE' : formatFlashTime(flashTimeLeft)}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-sm font-bold truncate pr-6 leading-tight">{flashName}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xl font-black ${flashStock <= 0 ? 'text-white/30' : ''}`}>${flashPrice}</span>
                          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${flashStock <= 0 ? 'bg-zinc-600' : 'bg-pink-500'}`} style={{ width: `${Math.max(0, Math.min(100, (flashStock / 50) * 100))}%` }} />
                          </div>
                          <span className="text-[0.65rem] text-white/50 font-bold uppercase whitespace-nowrap"><span className={flashStock <= 0 ? "text-red-500 font-black" : "text-white"}>{flashStock}</span> LEFT</span>
                        </div>
                        
                        {flashStock <= 0 ? (
                          <div className="mt-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-center flex flex-col items-center justify-center">
                             <p className="text-red-500 font-black text-[0.7rem] uppercase tracking-widest">All Sold Out</p>
                             <p className="text-white/40 text-[0.48rem] mt-0.5 uppercase tracking-widest">Drop Sale Is Over</p>
                          </div>
                        ) : hasPurchased ? (
                          fulfillmentChoice === 'pickup' && pickupCode ? (
                            <div className="mt-3 py-2 bg-emerald-500/10 border border-emerald-500/40 rounded-lg text-center">
                              <p className="text-emerald-400 font-black text-[0.6rem] uppercase tracking-widest">✓ Pickup Reserved</p>
                              <p className="text-white font-black text-sm tracking-widest">{pickupCode}</p>
                              <p className="text-white/30 text-[0.48rem]">Show at merch table</p>
                            </div>
                          ) : (
                            <button disabled className="w-full mt-3 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-black text-[0.7rem] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 opacity-90">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              ORDER PLACED
                            </button>
                          )
                        ) : (
                          <button onClick={handlePurchase} className="w-full mt-3 py-2 bg-white text-black font-black text-[0.75rem] uppercase tracking-wider rounded-lg hover:bg-pink-400 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-pink-500/50">
                            {flashAllowPickup ? '🛍️ Buy / Pick Up' : 'Buy Now'}
                          </button>
                        )}
                        {flashAllowPickup && !hasPurchased && flashStock > 0 && (
                          <p className="text-[0.48rem] text-pink-400/60 text-center mt-1">Pickup at merch table available tonight</p>
                        )}
                      </div>
                </div>
              </div>
            )}

            {/* Ship vs Pickup fulfillment modal */}
            {showFulfillmentModal && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 pointer-events-auto">
                <div className="bg-[#0f0f18] border border-pink-500/30 rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-r from-pink-600/20 to-transparent px-5 py-4 border-b border-white/10">
                    <p className="text-[0.55rem] text-pink-400 font-black uppercase tracking-widest mb-0.5">🔥 Flash Drop</p>
                    <h3 className="text-white font-black text-sm">{flashName}</h3>
                    <p className="text-pink-400 font-black">${flashPrice}</p>
                  </div>
                  <div className="p-5">
                    <p className="text-white/50 text-xs mb-4 text-center">How would you like to receive this?</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleFulfillmentChoice('pickup')}
                        className="flex flex-col items-center gap-2 p-4 bg-emerald-500/10 border-2 border-emerald-500/40 hover:border-emerald-500 rounded-xl transition-all">
                        <span className="text-2xl">🛍️</span>
                        <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Pickup</p>
                        <p className="text-white/30 text-[0.55rem] text-center">Collect at the merch table tonight</p>
                      </button>
                      <button onClick={() => handleFulfillmentChoice('ship')}
                        className="flex flex-col items-center gap-2 p-4 bg-white/5 border-2 border-white/10 hover:border-white/30 rounded-xl transition-all">
                        <span className="text-2xl">📦</span>
                        <p className="text-white font-black text-xs uppercase tracking-widest">Ship</p>
                        <p className="text-white/30 text-[0.55rem] text-center">Delivered to your address</p>
                      </button>
                    </div>
                    <button onClick={() => setShowFulfillmentModal(false)}
                      className="w-full mt-4 text-white/30 hover:text-white/60 text-[0.6rem] font-bold uppercase tracking-widest transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">
              <div className="hidden sm:flex items-center gap-1">
                {REACTION_EMOJIS.slice(0, 6).map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.12] hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-sm sm:text-base cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {/* Mobile: show only 3 reactions */}
              <div className="flex sm:hidden items-center gap-1">
                {REACTION_EMOJIS.slice(0, 3).map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] active:scale-95 transition-all flex items-center justify-center text-sm cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {streamEnded ? (
                <div className="flex-1 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-center">
                  <span className="text-[0.65rem] font-bold text-white/30 uppercase tracking-[0.2em]">Stream Ended</span>
                </div>
              ) : isLoggedIn ? (
              <div className="flex-1 relative flex items-center bg-black/50 backdrop-blur-md rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 border border-white/15 focus-within:border-[#8a1cfc]/60 transition-colors">
                <input
                  type="text"
                  placeholder="Say something..."
                  value={userMessage}
                  onChange={e => setUserMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && userMessage.trim()) handleSend();
                  }}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-white/40 outline-none min-w-0"
                />
                <button
                  onClick={() => setEmojiPickerOpen(o => !o)}
                  className="ml-1.5 sm:ml-2 text-white/50 hover:text-white transition-colors text-base sm:text-lg leading-none shrink-0 cursor-pointer"
                >😊</button>
                <button
                  onClick={handleSend}
                  className="ml-1.5 sm:ml-2 px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 rounded-full text-white text-[0.6rem] sm:text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >Send</button>
                {emojiPickerOpen && (
                  <div className="absolute bottom-full right-0 mb-2 p-2 bg-[#1a1727] border border-white/10 rounded-xl shadow-2xl grid grid-cols-5 gap-1.5 w-48 sm:w-52 pointer-events-auto z-40">
                    {CHAT_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { setUserMessage(m => m + emoji); setEmojiPickerOpen(false); }}
                        className="text-lg sm:text-xl w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      >{emoji}</button>
                    ))}
                  </div>
                )}
              </div>
              ) : (
              <button
                onClick={() => openModal('login')}
                className="flex-1 flex items-center justify-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-1.5 sm:py-2 border border-white/15 hover:border-[#8a1cfc]/60 hover:bg-[#8a1cfc]/20 transition-all cursor-pointer group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40 group-hover:text-[#8a1cfc] transition-colors"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                <span className="text-xs sm:text-sm text-white/50 group-hover:text-white transition-colors font-medium">Sign in to comment</span>
              </button>
              )}
            </div>
          </div>
          )}
        </div>

        {/* ── LIVE CHAT PANEL ── */}
        {/* Mobile: fills remaining space below video. Desktop: fixed width sidebar */}
        <div className="flex-1 lg:flex-none w-full lg:w-[360px] xl:w-[420px] shrink lg:shrink-0 flex flex-col bg-[#0a0a0e] border-t lg:border-t-0 lg:border-l border-white/[0.06] overflow-hidden min-h-0">
          {/* Chat header */}
          <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between bg-[#0d0d14] shrink-0">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8a1cfc]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="text-white/90 text-sm font-bold uppercase tracking-widest">Live Chat</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            {isModRole && bannedUsers.size > 0 && (
              <div className="relative group/muted">
                <button className="text-[0.55rem] text-rose-400/80 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest cursor-pointer hover:bg-rose-500/20 transition-colors">
                  🚫 {bannedUsers.size} muted
                </button>
                <div className="hidden group-hover/muted:block absolute right-0 top-full mt-1 bg-[#0d0d14] border border-white/10 rounded-lg shadow-xl z-50 min-w-[160px] p-2">
                  <p className="text-[0.55rem] text-white/30 font-bold uppercase tracking-widest mb-2 px-1">Muted Users</p>
                  {Array.from(bannedUsers).map(id => {
                    const acc = [...(FAN_ACCOUNTS || [])].find(a => a.id === id);
                    return (
                      <div key={id} className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-white/5">
                        <span className="text-[0.7rem] text-white/60">{acc?.displayName || id}</span>
                        <button onClick={() => unbanUser(id)} className="text-[0.5rem] text-emerald-400 hover:text-emerald-300 cursor-pointer font-bold uppercase">Unmute</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 📌 Pinned Message */}
          {activePinned && (
           <div className="px-4 py-3 border-b border-white/[0.06] bg-gradient-to-r from-blue-500/10 to-transparent shrink-0">
             <div className="flex items-start gap-2.5">
               <span className="text-sm shrink-0 mt-0.5">📌</span>
               <div className="min-w-0 flex-1">
                 <p className="text-white/90 text-sm leading-snug font-medium" style={{ animation: 'slideIn 0.4s ease-out' }}>
                   {activePinned.text}
                 </p>
                 <p className="text-white/30 text-[0.6rem] mt-1">— {activePinned.by} · Pinned</p>
               </div>
             </div>
           </div>
          )}

          {/* Chat messages */}
          <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-0.5 scrollbar-hide min-h-0"
              style={{ overscrollBehavior: 'contain' }}
            >
              {messages.filter(msg => !bannedUsers.has(msg.account.id)).map(msg => (
                <div
                  key={msg.id}
                  className="flex items-start gap-2 py-1 px-2 rounded-lg hover:bg-white/[0.03] transition-colors group/msg animate-[slideIn_0.3s_ease-out]"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[0.5rem] font-black shrink-0 mt-0.5 border border-white/10"
                    style={{ background: `${msg.account.color}30`, color: msg.account.color }}
                  >
                    {msg.account.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="font-bold text-[0.7rem]" style={{ color: msg.account.color }}>
                        {msg.account.displayName}
                      </span>
                      <RoleBadge account={msg.account} />
                      {/* Ban button — crew/admin only, fan messages only */}
                      {isModRole && msg.account.role === 'fan' && (
                        <button
                          onClick={() => banUser(msg.account.id)}
                          title={`Mute ${msg.account.displayName}`}
                          className="ml-auto opacity-0 group-hover/msg:opacity-100 transition-opacity text-[0.55rem] text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 px-1.5 py-0.5 rounded border border-transparent hover:border-rose-500/30 cursor-pointer"
                        >
                          🚫
                        </button>
                      )}
                    </div>
                    <p className="text-white/80 text-[0.75rem] leading-snug break-words">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>


          {/* Active viewers panel */}
          {showViewers && (
            <div className="border-t border-white/[0.06] bg-[#0d0d14] px-3 py-2 max-h-[160px] overflow-y-auto scrollbar-hide shrink-0">
              <p className="text-white/40 text-[0.55rem] font-bold uppercase tracking-widest mb-1.5">Active Viewers ({ALL_ACCOUNTS.length}+)</p>
              <div className="flex flex-wrap gap-1">
                {ALL_ACCOUNTS.map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-white/[0.03] border border-white/5 rounded-full"
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[0.35rem] font-black"
                      style={{ background: `${a.color}30`, color: a.color }}
                    >
                      {a.avatar}
                    </div>
                    <span className="text-white/60 text-[0.55rem] font-medium">{a.displayName}</span>
                    {a.role === 'crew' && <span className="text-[0.45rem]">{a.badge}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Viewer toggle */}
          <button
            onClick={() => setShowViewers(v => !v)}
            className="px-4 py-1.5 border-t border-white/[0.06] text-white/30 hover:text-white/60 text-[0.55rem] font-bold uppercase tracking-widest transition-colors hover:bg-white/[0.02] cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            {showViewers ? 'Hide Viewers' : 'Show Active Viewers'}
          </button>
        </div>
      </div>

      {/* ── IMMERSIVE CHECKOUT MODAL ── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isProcessingPayment && setIsCheckoutOpen(false)} />
          
          {/* Modal Body */}
          <div className="relative w-full max-w-lg bg-[#0d0d14] border border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-black/40">
              <span className="text-white/90 font-black tracking-widest uppercase text-sm">Secure Checkout</span>
              <button disabled={isProcessingPayment} onClick={() => setIsCheckoutOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="flex gap-4 mb-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center shrink-0 object-contain p-1 border border-white/10">
                  <img src={flashImage} alt="Product" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/images/mockups/merch_hoodie.png' }} />
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{flashName}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-pink-400 font-black text-xl">${flashPrice}</p>
                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10 shrink-0">
                      <button onClick={() => setCheckoutQuantity(Math.max(1, checkoutQuantity - 1))} className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-white font-bold cursor-pointer transition-colors">-</button>
                      <span className="text-xs font-bold w-4 text-center select-none">{checkoutQuantity}</span>
                      <button onClick={() => setCheckoutQuantity(Math.min(flashStock, checkoutQuantity + 1))} className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded text-white font-bold cursor-pointer transition-colors">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Checkout Redirection */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </span>
                  <p className="text-[0.7rem] text-emerald-400/90 leading-tight">
                    <strong className="text-emerald-400 block mb-0.5 uppercase tracking-wider text-[0.65rem] font-black">Secure Shopify Gateway</strong>
                    You will be securely redirected to our official checkout portal to provide your shipping address and payment details.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={executePayment}
                disabled={isProcessingPayment}
                className="w-full py-4 bg-pink-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-pink-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative shadow-[0_0_20px_rgba(236,72,153,0.3)] cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    CONNECTING TO SECURE CHECKOUT...
                  </>
                ) : (
                  <>
                    PROCEED TO SECURE CHECKOUT
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

/* Default export for /live/demo route */
export default function LiveDemoPage() {
  return <LiveSimulation memberId="mike" />;
}
