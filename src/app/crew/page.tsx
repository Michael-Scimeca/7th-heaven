"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LiveKitStream } from '@/components/LiveKitStream';
import { getProducts } from '@/lib/shopify';

// --- Types ---
interface FakeAccount {
  id: string;
  name: string;
  displayName: string;
  role: 'fan' | 'crew' | 'admin';
  color: string;
  avatar: string;
}

interface ChatMsg {
  id: string;
  account: FakeAccount;
  text: string;
  timestamp: number;
}


function getAvatarColor(name: string) {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function CrewDashboard() {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<'fan' | 'crew' | 'admin'>('crew');
  const [email, setEmail] = useState('');

  // Namespaced localStorage helper for synchronization
  const LS = (key: string) => `${key}_${userId?.toString().toLowerCase().trim() || 'michael'}`;

  // Build a stable, human-readable room slug that matches the fan page URL
  // If userId is a short slug (e.g. 'michael'), use it directly. If it's a UUID, derive from displayName.
  const memberSlug = (userId && userId.length < 36)
    ? userId.toLowerCase().replace(/\s+/g, '_')
    : (displayName || 'michael').split(' ')[0].toLowerCase().replace(/\s+/g, '_');
  const roomSlug = `live_${memberSlug}`;

  // --- Stream State ---
  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [toggling, setToggling] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isSavingReplay, setIsSavingReplay] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };
  
  // --- Chat State ---
  const [posts, setPosts] = useState<ChatMsg[]>([]);
  const [content, setContent] = useState('');
  const [globalPinText, setGlobalPinText] = useState('');
  const [posting, setPosting] = useState(false);
  const chatChannelRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [activePinned, setActivePinned] = useState<{text: string; by: string} | null>(null);
  const [floating, setFloating] = useState<{id: string, emoji: string, x: number, createdAt: number}[]>([]);
  
  // --- Raffle State ---
  const [raffleStatus, setRaffleStatus] = useState<'idle' | 'open' | 'drawing' | 'complete'>('idle');
  const [raffleEntrants, setRaffleEntrants] = useState<{name: string, id: string, email?: string}[]>([]);
  const [drawnWinners, setDrawnWinners] = useState<{name: string, id: string, email?: string}[]>([]);
  const [winnerPins, setWinnerPins] = useState<string[]>([]);
  
  // Array of upcoming/queued raffles
  const [raffleQueue, setRaffleQueue] = useState<{name: string, qty: number, min: number}[]>([
    { name: 'VIP Meet & Greet Pass', qty: 1, min: 1 },
    { name: 'Signed Tour Poster', qty: 5, min: 30 },
    { name: 'Free Merch Drop Code', qty: 1, min: 45 }
  ]);
  const isDrawingRef = useRef(false);
  const [activeQueueIndex, setActiveQueueIndex] = useState(0);

  // Derived active config bindings
  const raffleMinEntrants = raffleQueue[activeQueueIndex]?.min || 15;
  const rafflePrizes = [{ name: raffleQueue[activeQueueIndex]?.name || '', qty: raffleQueue[activeQueueIndex]?.qty || 1 }];

  // --- Flash Drop State ---
  const [inventoryQty, setInventoryQty] = useState(15);
  const [shopifyProducts, setShopifyProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [dropDurationStr, setDropDurationStr] = useState('5m');

  // --- Raffle Restart State ---
  const [raffleAutoRestartCountdown, setRaffleAutoRestartCountdown] = useState<number | null>(null);

  // --- Global Announcement Banner State ---
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerUpdating, setBannerUpdating] = useState(false);

  useEffect(() => {
    // Load Global Announcement Banner
    fetch('/api/announcement')
      .then(res => res.json())
      .then(data => {
        setBannerActive(data.isActive);
        setBannerText(data.text || '');
        setBannerLink(data.link || '');
      })
      .catch(() => {});

    getProducts().then(products => {
      setShopifyProducts(products);
      if (products.length > 0) {
        setSelectedProductId(products[0].id);
        setInventoryQty(products[0].quantityAvailable || 15);
      }
    }).catch(console.error);

    const checkUser = async () => {
      // 1. PRIMARY: Check Supabase session (real auth)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.displayName || 'Crew';
        setIsAuthenticated(true);
        setUserId(session.user.id);
        setDisplayName(name);
        setEmail(session.user.email || '');
        setRole(session.user.user_metadata?.role || 'crew');
        setIsLoading(false);
        return;
      }

      // 2. FALLBACK: Check localStorage-based login (from MemberContext)
      const storedMember = localStorage.getItem('7h_member');
      if (storedMember) {
        try {
          const parsed = JSON.parse(storedMember);
          if (parsed.role === 'crew' || parsed.role === 'admin') {
            setIsAuthenticated(true);
            setUserId(parsed.id || 'crew');
            setDisplayName(parsed.name || 'Crew');
            setEmail(parsed.email || '');
            setRole(parsed.role);
            setIsLoading(false);
            return;
          }
        } catch {}
      }

      // 3. DEV BYPASS: Only if no real session exists
      if (localStorage.getItem('7h_dev_bypass') === 'true') {
        const stored = localStorage.getItem('7h_member');
        const parsed = stored ? JSON.parse(stored) : null;
        
        setIsAuthenticated(true);
        setUserId(parsed?.id || 'michael');
        setDisplayName(parsed?.name || 'Michael Scimeca');
        setEmail(parsed?.email || 'michael@7thheaven.com');
        setRole('crew');
        if (!localStorage.getItem('7h_member')) {
          localStorage.setItem('7h_member', JSON.stringify({
            id: 'michael', name: 'Michael Scimeca', email: 'michael@7thheaven.com',
            role: 'crew', avatar: 'MS', joinDate: new Date().toISOString(),
            points: 0, tier: 'Bronze', showsAttended: 0, favoriteVenues: [],
            notificationsEnabled: false, notificationRadius: 25,
          }));
          window.location.reload();
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };
    checkUser();
  }, []);

  // Separate effect to load stream state once userId is stable
  useEffect(() => {
    if (!userId || isLoading) return;

    const loadStreamState = async () => {
      const slug = roomSlug; // uses display-name-based slug from component scope
      try {
        const { data, error } = await supabase
          .from('live_streams')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'live')
          .limit(1)
          .single();
        if (data && !error) {
          // Stream IS live — load chat
          setIsLive(true);
          setStreamTitle(data.title || '');
          localStorage.setItem(LS('is_live'), 'true');

          try {
            const { data: chatData } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('room', slug)
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
              setPosts(mapped);
            }
          } catch {}
        } else {
          // Stream is NOT live — purge ALL stale data
          setIsLive(false);
          setPosts([]);
          setActivePinned(null);

          localStorage.setItem(LS('is_live'), 'false');
          localStorage.removeItem(`is_live_${slug.replace('live_', '')}`);
          localStorage.removeItem('is_live');
          localStorage.setItem(LS('live_chat_history'), '[]');
          localStorage.setItem('7h_global_chat_history', '[]');
          localStorage.removeItem(LS('live_pinned'));
          localStorage.setItem('7h_global_pinned', 'null');

          // Delete orphaned data from Supabase
          fetch('/api/live/clear-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room: slug }) }).catch(() => {});
          fetch('/api/live-rooms/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName: slug }),
          }).catch(() => {});
        }
      } catch {
        setIsLive(false);
        setPosts([]);
        setActivePinned(null);
        localStorage.setItem(LS('is_live'), 'false');
      }
    };

    loadStreamState();

    try {
      const storedRaffle = localStorage.getItem(LS('live_raffle_sync'));
      if (storedRaffle) {
        const parsed = JSON.parse(storedRaffle);
        const safeStatus = (parsed.status === 'open' || parsed.status === 'drawing') ? 'idle' : parsed.status;
        setRaffleStatus(safeStatus);
        setRaffleEntrants(parsed.entrants || []);

        if (parsed.minEntrants && parsed.prizes) {
          setRaffleQueue(prev => {
            const next = [...prev];
            next[0] = { name: parsed.prizes[0]?.name || '', qty: parsed.prizes[0]?.qty || 1, min: parsed.minEntrants };
            return next;
          });
          setActiveQueueIndex(0);
        }
        if (parsed.winners) setDrawnWinners(parsed.winners);
        if (parsed.winnerPins) setWinnerPins(parsed.winnerPins);
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      // Admin kill switch: detect when is_live is set to 'false' from another tab
      if (e.key === LS('is_live') && e.newValue === 'false') {
        console.log('[Crew] Admin shutdown detected via storage event');
        setIsLive(false);
      }
      if (e.key === LS('live_chat_history') && e.newValue) {
        setPosts(JSON.parse(e.newValue));
      }
      // Fan chat sync from other tabs
      if (e.key === '7h_global_chat_history' && e.newValue) {
        try { setPosts(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === LS('live_pinned') && e.newValue) {
        setActivePinned(e.newValue === 'null' ? null : JSON.parse(e.newValue));
      }
      if (e.key === LS('live_reaction_sync') && e.newValue) {
        setFloating(prev => [...prev, JSON.parse(e.newValue!)]);
      }
    };
    window.addEventListener('storage', handleStorage);

    const channel = supabase.channel('live_events')
      .on('broadcast', { event: 'reaction' }, (payload: any) => {
        const data = payload.payload;
        if (data.userId === userId || data.memberId === userId) {
          setFloating(prev => [...prev, { ...data, createdAt: Date.now() }]);
        }
      })
      .subscribe();

    // Supabase Realtime subscription for fan chat messages
    const chatChannel = supabase.channel('live_chat')
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        if (!payload?.id) return;
        setPosts(prev => {
          if (prev.find(m => m.id === payload.id)) return prev;
          const next = [...prev, payload as ChatMsg];
          return next.length > 100 ? next.slice(-100) : next;
        });
      })
      .subscribe();

    const viewerInterval = setInterval(() => {
      const live = localStorage.getItem(LS('viewer_count'));
      if (live) setViewerCount(parseInt(live));
    }, 2000);

    window.scrollTo(0, 0);

    return () => {
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(channel);
      supabase.removeChannel(chatChannel);
      clearInterval(viewerInterval);
    };
  }, [userId]);

  useEffect(() => {
    let t: any;
    if (isLive) {
      t = setInterval(() => {
        const start = localStorage.getItem(LS('live_stream_start'));
        if (start) {
          setElapsed(Math.floor((Date.now() - parseInt(start)) / 1000));
        } else {
          setElapsed(0);
        }
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(t);
  }, [isLive]);

  useEffect(() => {
    if (floating.length > 0) {
      const t = setTimeout(() => setFloating((prev) => prev.filter((f) => Date.now() - f.createdAt < 3000)), 3000);
      return () => clearTimeout(t);
    }
  }, [floating]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [posts]);

  const attemptEndStream = () => {
    if (isLive) setShowEndModal(true);
    else toggleLive();
  };

  const confirmEndAndSave = async () => {
    setIsSavingReplay(true);
    await new Promise(r => setTimeout(r, 2500));
    setIsSavingReplay(false);
    
    try {
      const customFeeds = JSON.parse(localStorage.getItem('7h_custom_live_feeds') || '[]');
      customFeeds.unshift({
        id: 'LWeA2cE8YlI',
        title: streamTitle || `${userId || 'Crew'} Broadcast Demo`,
        year: new Date().getFullYear(),
        duration: formatTime(elapsed),
        description: `7th heaven Live Crew Broadcast Archive (Test Run)`,
        viewCount: '1'
      });
      localStorage.setItem('7h_custom_live_feeds', JSON.stringify(customFeeds));
    } catch(e) {}
    
    setShowEndModal(false);
    toggleLive();
    alert("Live Stream successfully transcoded and published to the Past Shows Video Gallery!");
  };

  const confirmEndDiscard = () => {
    setShowEndModal(false);
    toggleLive();
  };

  const activeStreamId = useRef<string | null>(null);

  const toggleLive = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const nextState = !isLive;
      // roomSlug is already computed from displayName in component scope
      if (nextState) {
        // --- Fresh start: clear all previous chat & pinned data ---
        setPosts([]);
        setActivePinned(null);
        localStorage.setItem('7h_global_chat_history', '[]');
        localStorage.setItem(LS('live_chat_history'), '[]');
        localStorage.removeItem(LS('live_pinned'));
        localStorage.setItem('7h_global_pinned', 'null');
        // Delete old chat messages from Supabase for a clean slate
        await fetch('/api/live/clear-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room: roomSlug }) });

        localStorage.setItem(LS('live_stream_start'), Date.now().toString());
        
        localStorage.setItem(LS('viewer_count'), '0');
        localStorage.setItem(LS('presence'), '{}');
        setViewerCount(0);

        setElapsed(0);
        cancelRaffle();
        setActiveQueueIndex(0);

        // Set localStorage flags the fan page checks
        localStorage.setItem(`is_live_${roomSlug.replace('live_', '')}`, 'true');
        localStorage.setItem('is_live', 'true');

        const { data: newStream, error: insertErr } = await supabase
          .from('live_streams')
          .insert({
            user_id: userId,
            title: `${displayName} — ${streamTitle || 'Crew Broadcast'}`,
            status: 'live',
            viewer_count: 0,
          })
          .select('id')
          .single();
        if (insertErr) console.error('❌ live_streams insert failed:', insertErr);
        if (newStream) {
          activeStreamId.current = newStream.id;

          // 📲 Notify opted-in fans via SMS that a live stream just started
          fetch('/api/sms/live-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hostName: displayName || 'The Crew' }),
          }).catch(err => console.error('Live SMS alert failed:', err));
        }
      } else {
        localStorage.removeItem(LS('live_stream_start'));
        localStorage.setItem(LS('live_chat_history'), '[]');
        localStorage.setItem('7h_global_chat_history', '[]');
        setPosts([]);
        
        // Clear pinned message
        setActivePinned(null);
        localStorage.removeItem(LS('live_pinned'));
        localStorage.setItem('7h_global_pinned', 'null');
        
        localStorage.setItem(LS('viewer_count'), '0');
        localStorage.setItem(LS('presence'), '{}');
        setViewerCount(0);
        setElapsed(0);
        setActiveQueueIndex(0);

        // Delete chat messages from Supabase for this room (via service role API)
        try {
          await fetch('/api/live/clear-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: roomSlug }),
          });
        } catch {}

        // Clear ALL localStorage flags the fan page checks
        localStorage.removeItem(`is_live_${roomSlug.replace('live_', '')}`);
        localStorage.removeItem('is_live');
        localStorage.removeItem(LS('crew_is_live'));

        if (activeStreamId.current) {
          await supabase
            .from('live_streams')
            .update({ status: 'ended' })
            .eq('id', activeStreamId.current);
          activeStreamId.current = null;
        }

        cancelRaffle();
        
        // Delete the LiveKit room to kick all participants
        try {
          await fetch('/api/live-rooms/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName: roomSlug })
          });
        } catch {}

        await supabase
          .from('live_streams')
          .update({ status: 'ended' })
          .eq('user_id', userId)
          .eq('status', 'live');
      }
      
      setIsLive(nextState);
      localStorage.setItem(LS('is_live'), nextState.toString());
      localStorage.setItem(LS('stream_title'), streamTitle);
      await supabase.channel('live_events').send({ 
        type: 'broadcast', 
        event: 'stream_state', 
        payload: { isLive: nextState, title: streamTitle, userId } 
      });
    } catch (e) {
      console.error("toggleLive failed:", e);
    } finally {
      setToggling(false);
    }
  };

  const syncStreamTitle = () => {
    localStorage.setItem(LS('stream_title'), streamTitle);
    if (isLive) {
      supabase.channel('live_events').send({ 
        type: 'broadcast', 
        event: 'stream_state', 
        payload: { isLive, title: streamTitle, userId } 
      });
    }
  };

  const [activeRaffleId, setActiveRaffleId] = useState<string | null>(null);

  const syncRaffle = async (status: any, entrants: any, min: number, prizes: any, winners: any, winnerPins?: string[]) => {
    const state = { 
      status, 
      entrants, 
      minEntrants: min, 
      prizes, 
      winners, 
      winnerPins, 
      ts: Date.now(), 
      timestamp: Date.now(),
      userId
    };
    // Keep localStorage for cross-tab sync
    localStorage.setItem(LS('live_raffle_sync'), JSON.stringify(state));
    supabase.channel('live_events').send({ type: 'broadcast', event: 'raffle_sync', payload: state });

    // Persist to Supabase
    try {
      const raffleData = {
        crew_id: userId,
        stream_id: `live_${userId.toString().toLowerCase().replace(/\s+/g, '_')}`,
        status,
        prize_name: prizes?.[0]?.name || '',
        prize_qty: prizes?.[0]?.qty || 1,
        min_entrants: min,
        entrants: JSON.stringify(entrants || []),
        winners: JSON.stringify(winners || []),
        winner_pins: JSON.stringify(winnerPins || []),
        ...(status === 'complete' ? { completed_at: new Date().toISOString() } : {}),
      };

      if (activeRaffleId) {
        await supabase.from('raffles').update(raffleData).eq('id', activeRaffleId);
      } else if (status === 'open') {
        const { data } = await supabase.from('raffles').insert(raffleData).select('id').single();
        if (data) setActiveRaffleId(data.id);
      }

      if (status === 'idle' || status === 'complete') {
        setActiveRaffleId(null);
      }
    } catch (e) {
      console.error('[Raffle] Supabase sync failed, localStorage is still active:', e);
    }
  };

  const handlePin = () => {
    if (!content.trim() || posting) return;
    const pinData = { text: content.trim(), by: displayName };
    localStorage.setItem(LS('live_pinned'), JSON.stringify(pinData));
    setActivePinned(pinData);
    setContent('');
  };

  const cancelRaffle = () => {
    isDrawingRef.current = false;
    setRaffleStatus('idle');
    syncRaffle('idle', [], raffleMinEntrants, rafflePrizes, []);
  };

  const startSpecificRaffle = (idx: number) => {
    if (raffleStatus !== 'idle' && raffleStatus !== 'complete') return;
    setActiveQueueIndex(idx);
    const targetRaffle = raffleQueue[idx];
    
    window.dispatchEvent(new CustomEvent('testingSimulateFanRaffleJoin'));
    setRaffleStatus('open');
    setRaffleEntrants([]);
    setDrawnWinners([]);
    setWinnerPins([]);
    syncRaffle('open', [], targetRaffle.min, [{ name: targetRaffle.name, qty: targetRaffle.qty }], [], []);
  };

  const drawWinner = () => {
    if (isDrawingRef.current || raffleStatus !== 'open' || raffleEntrants.length === 0) return;
    isDrawingRef.current = true;
    setRaffleStatus('drawing');
    syncRaffle('drawing', raffleEntrants, raffleMinEntrants, rafflePrizes, []);
    
    setTimeout(() => {
      isDrawingRef.current = false;
      const uniqueEntrants = Array.from(new Map(raffleEntrants.map(e => [e.name, e])).values());
      const shuffled = uniqueEntrants.sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, rafflePrizes[0]?.qty || 1);
      const pins = winners.map(() => Math.floor(1000 + Math.random() * 9000).toString());
      setDrawnWinners(winners);
      setWinnerPins(pins);
      setRaffleStatus('complete');
      syncRaffle('complete', raffleEntrants, raffleMinEntrants, rafflePrizes, winners, pins);

      const prizeName = rafflePrizes[0]?.name || 'the raffle';
      
      winners.forEach((w, idx) => {
        const msg: ChatMsg = {
          id: `raffle-win-${Date.now()}-${idx}`,
          account: { id: 'system', name: '7th Heaven', displayName: 'RAFFLE BOT', role: 'admin', color: '#fbbf24', avatar: '🏆' },
          text: `🎉 CONGRATULATIONS to ${w.name} for winning ${prizeName}! Check your Fan Dashboard to claim your prize! 🏆`,
          timestamp: Date.now(),
        };
        const stored = JSON.parse(localStorage.getItem(LS('live_chat_history')) || '[]');
        const nextChat = [...stored, msg].slice(-100);
        localStorage.setItem(LS('live_chat_history'), JSON.stringify(nextChat));
        setPosts(nextChat);
      });

      try {
        const inbox = JSON.parse(localStorage.getItem('vip_inbox_messages') || '[]');
        winners.forEach((w, idx) => {
          inbox.unshift({
            id: Date.now() + idx,
            icon: '🎰',
            title: 'Raffle Winner Drawn!',
            desc: `${w.name} won ${prizeName}. PIN: ${pins[idx]}.`,
            time: 'Just now',
            isNew: true,
            color: 'yellow'
          });

          // Persist notification to Supabase so it survives refresh
          Promise.resolve(supabase.from('notifications').insert({
            user_email: w.email || w.name.toLowerCase().replace(/\s+/g, '') + '@fan.7thheaven.com',
            type: 'raffle_win',
            title: `🏆 You won ${prizeName}!`,
            body: `Congratulations! Show this PIN at the merch table to claim your prize.`,
            pin: pins[idx],
            prize: prizeName,
          })).catch(() => {});
        });
        localStorage.setItem('vip_inbox_messages', JSON.stringify(inbox.slice(0, 50)));
      } catch {}
    }, 4000); // Wait 4s for simulated spin effect on fan page
  };

  const rigWinForMe = () => {
    if (raffleStatus !== 'open') {
       alert("Please START a raffle first, then click Rig to guarantee your win!");
       return;
    }
    const me = { name: displayName, id: userId || 'crew', email: email, joinedAt: Date.now() };
    // Force me as the only entrant for a guaranteed win
    setRaffleEntrants([me]);
    setTimeout(() => drawWinner(), 500);
  };

  // Auto-draw when entries reach minimum
  useEffect(() => {
    if (raffleStatus === 'open' && raffleEntrants.length >= raffleMinEntrants) {
      drawWinner();
    }
  }, [raffleStatus, raffleEntrants.length, raffleMinEntrants]);

  // Handle countdown and auto-restart action
  useEffect(() => {
    if (raffleStatus === 'complete') {
      setRaffleAutoRestartCountdown(120); // 2 minutes
    } else {
      setRaffleAutoRestartCountdown(null);
    }
  }, [raffleStatus]);

  // Auto-restart logic removed to prevent raffles from starting without explicit user action.
  /*
  useEffect(() => {
    if (raffleAutoRestartCountdown !== null && raffleAutoRestartCountdown > 0) {
      const t = setInterval(() => setRaffleAutoRestartCountdown(c => (c ? c - 1 : 0)), 1000);
      return () => clearInterval(t);
    }
    if (raffleAutoRestartCountdown === 0 && raffleStatus === 'complete') {
      const nextIndex = (activeQueueIndex + 1) % raffleQueue.length;
      setActiveQueueIndex(nextIndex);
      const nextRaffle = raffleQueue[nextIndex];

      setRaffleStatus('open');
      setRaffleEntrants([]);
      setDrawnWinners([]);
      setWinnerPins([]);
      setRaffleAutoRestartCountdown(null);
      syncRaffle('open', [], nextRaffle.min, [{ name: nextRaffle.name, qty: nextRaffle.qty }], [], []);
    }
  }, [raffleAutoRestartCountdown, raffleStatus]);
  */

  const updateQueueItem = (idx: number, field: string, value: any) => {
    const next = [...raffleQueue];
    next[idx] = { ...next[idx], [field]: value };
    setRaffleQueue(next);

    if (idx === activeQueueIndex && raffleStatus !== 'idle') {
       const activeRaffle = next[idx];
       syncRaffle(raffleStatus, raffleEntrants, activeRaffle.min, [{ name: activeRaffle.name, qty: activeRaffle.qty }], drawnWinners, winnerPins);
    }
  };

  const addQueueItem = () => {
    setRaffleQueue([...raffleQueue, { name: '', qty: 1, min: 10 }]);
  };

  const removeQueueItem = (idx: number) => {
    if (raffleQueue.length <= 1) return;
    const next = raffleQueue.filter((_, i) => i !== idx);
    setRaffleQueue(next);
    if (activeQueueIndex >= next.length) setActiveQueueIndex(0);
  };

  const addFakeEntry = () => {
    if (raffleStatus !== 'open') return;
    const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley'];
    const newEntrant = { name: names[Math.floor(Math.random() * names.length)], id: Math.random().toString() };
    const nextEntrants = [...raffleEntrants, newEntrant];
    setRaffleEntrants(nextEntrants);
    syncRaffle(raffleStatus, nextEntrants, raffleMinEntrants, rafflePrizes, drawnWinners, winnerPins);
  };
  
  const addLotsOfFakeEntries = () => {
     let current = [...raffleEntrants];
     for (let i = 0; i < 5; i++) {
        current.push({ name: 'SimulatedFan' + Math.floor(Math.random()*1000), id: Math.random().toString() });
     }
     setRaffleEntrants(current);
     syncRaffle(raffleStatus, current, raffleMinEntrants, rafflePrizes, drawnWinners, winnerPins);
  };

  const handlePost = () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    const msg: ChatMsg = {
      id: `crew-${Date.now()}`,
      account: {
        id: userId || 'crew',
        name: displayName,
        displayName: displayName,
        role: 'crew',
        color: '#f97316',
        avatar: displayName.slice(0, 2).toUpperCase(),
      },
      text: content.trim(),
      timestamp: Date.now(),
    };
    // Sync to persistence history
    const stored = JSON.parse(localStorage.getItem('7h_global_chat_history') || '[]');
    const nextPosts = [...stored, msg];
    const limited = nextPosts.length > 100 ? nextPosts.slice(-100) : nextPosts;
    
    setPosts(limited);
    localStorage.setItem('7h_global_chat_history', JSON.stringify(limited));

    // Also write the individual message to live_chat_sync for cross-tab fan page pickup
    localStorage.setItem(LS('live_chat_sync'), JSON.stringify(msg));

    // Persist to Supabase chat_messages table
    // Use display-name-based roomSlug (same as what the fan page expects)
    Promise.resolve(supabase.from('chat_messages').insert({
      room: roomSlug,
      sender_name: displayName,
      sender_role: 'crew',
      sender_avatar: displayName.slice(0, 2).toUpperCase(),
      content: content.trim(),
    })).catch(() => {});

    // Broadcast via Supabase Realtime for cross-browser sync
    supabase.channel('live_chat').send({
      type: 'broadcast',
      event: 'new_message',
      payload: msg,
    }).catch(() => {});
    
    setContent('');
    setPosting(false);
  };

  const handleGlobalPinBox = () => {
    if (!globalPinText.trim()) return;
    const pinData = { text: globalPinText.trim(), by: displayName };
    localStorage.setItem(LS('live_pinned'), JSON.stringify(pinData));
    setActivePinned(pinData);
    setGlobalPinText('');
  };

  const launchFlashDrop = () => {
     let seconds = 300;
     const dur = dropDurationStr.trim().toLowerCase();
     
     if (dur.includes('m') && dur.includes('s')) {
         const m = parseInt(dur.split('m')[0]) || 0;
         const sString = dur.split('m')[1].replace('s', '').trim();
         const s = parseInt(sString) || 0;
         seconds = m * 60 + s;
     } else if (dur.endsWith('m')) {
       seconds = (parseInt(dur) || 0) * 60;
     } else if (dur.endsWith('s')) {
       seconds = parseInt(dur) || 0;
     } else {
       seconds = (parseInt(dur) || 0) * 60; // default to minutes
     }
     
     if (isNaN(seconds) || seconds <= 0) seconds = 300;

     const activeProduct = shopifyProducts.find(p => p.id === selectedProductId) || shopifyProducts[0];
     const pName = activeProduct?.title || '7TH HEAVEN HOODIE 2026';
     const pPrice = activeProduct ? activeProduct.variants.edges[0].node.price.amount : '45.00';
     const pStock = activeProduct ? (activeProduct.quantityAvailable || 0) : inventoryQty;
     const pImageUrl = activeProduct?.images?.edges?.[0]?.node?.url || '/images/mockups/merch-hoodie.png';

     const payload = {
        name: pName,
        price: pPrice,
        stock: pStock,
        image: pImageUrl,
        duration: seconds
     };

     // Sync drop via local storage directly across tabs (immediate sync for testing)
     localStorage.setItem('7h_flash_drop', JSON.stringify({ ...payload, ts: Date.now() }));
     
     // Also fire the canonical websocket broadcast for cross-device connections
     try {
       supabase.channel('live_events').send({
         type: 'broadcast',
         event: 'flash_drop',
         payload
       });
     } catch (e) {
       console.error("Supabase Flash Drop Broadcast Error:", e);
     }
  };

  const updateGlobalBanner = async () => {
    setBannerUpdating(true);
    try {
      await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: bannerActive, text: bannerText, link: bannerLink })
      });
      alert('Global Announcement Banner Updated!');
    } catch (e) {
      alert('Failed to update banner.');
    }
    setBannerUpdating(false);
  };

  if (isLoading) return <div className="min-h-screen bg-[#050508]" />;

  const activeProduct = shopifyProducts.find(p => p.id === selectedProductId) || shopifyProducts[0];
  const pName = activeProduct?.title || '7TH HEAVEN HOODIE 2026';
  const pPrice = activeProduct ? activeProduct.variants.edges[0].node.price.amount : '45.00';
  const pStock = activeProduct ? (activeProduct.quantityAvailable || 0) : inventoryQty;
  const pImageUrl = activeProduct?.images?.edges?.[0]?.node?.url || '/images/mockups/merch-hoodie.png';

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-[#ec4899]/30 pt-20">
      
      {/* ─── EXACT HEADER LAYOUT ─── */}
      <header className="border-b border-white/[0.04] bg-[#050508]/50">
        <div className="site-container py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center text-xl font-bold border border-purple-500 relative">
            MS
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold italic tracking-tight">{displayName}</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[0.55rem] font-black uppercase tracking-widest rounded flex items-center gap-1">🇮🇹 Crew</span>
            </div>
            <span className="text-xs text-white/40">{email}</span>
          </div>
        </div>
        <div className="px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[0.65rem] font-bold text-red-500 uppercase tracking-widest">{isLive ? `LIVE - ${viewerCount} VIEWERS` : 'OFFLINE'}</span>
        </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="site-container py-8 space-y-6">


        <div className="flex items-center gap-2 text-white/50 text-sm uppercase tracking-widest font-black">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          Crew Broadcast <span className="text-white/20 px-2">·</span> <span className="text-[0.65rem]">{viewerCount} viewers</span>
        </div>

        {/* Callout Link - Only visible when stream is LIVE */}
        {isLive && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-transparent border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
              <p className="text-[0.55rem] flex flex-col sm:flex-row items-center gap-1.5 font-black text-emerald-400 uppercase tracking-[0.2em] mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                Fan Watch Link — Share with your audience
              </p>
              <p className="text-sm font-mono text-emerald-300/90 select-all relative z-10 block break-all">
                {`http://localhost:3000/live/live_${userId.toString().toLowerCase().replace(/\s+/g, '_')}`}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href={`/live/live_${userId.toString().toLowerCase().replace(/\s+/g, '_')}`} target="_blank" className="flex-1 sm:flex-none text-center px-4 py-2 sm:py-1.5 bg-white/5 hover:bg-white/15 text-emerald-300 hover:text-white text-[0.65rem] font-bold uppercase tracking-widest rounded border border-emerald-500/20 hover:border-emerald-500/50 transition-colors">
                Open <span className="ml-0.5">→</span>
              </Link>
              <button onClick={() => navigator.clipboard.writeText(`http://localhost:3000/live/live_${userId.toString().toLowerCase().replace(/\s+/g, '_')}`)} className="flex-1 sm:flex-none px-4 py-2 sm:py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#05110d] text-[0.65rem] font-black uppercase tracking-widest rounded shadow-[0_0_10px_rgba(16,185,129,0.4)] hover:shadow-[0_0_15px_rgba(16,185,129,0.8)] transition-all cursor-pointer">
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* ─── VIDEO + CHAT GRID (Exactly like the old one) ─── */}
        <div className="flex bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl h-[600px]">
          
          {/* VIDEO PLAYER (Left side) */}
          <div className="flex-1 relative bg-black group min-w-0">
            {userId ? (
              <LiveKitStream 
                room={`live_${userId.toString().toLowerCase().replace(/\s+/g, '_')}`} 
                username={displayName} 
                isPublisher={true} 
                onDisconnected={() => {
                  console.log("Remote termination detected");
                  setIsLive(false);
                  localStorage.setItem(LS('is_live'), 'false');
                }}
                className="absolute inset-0 z-0" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white/20 text-xs">
                Initializing Stream Identity...
              </div>
            )}
            
            {/* Floating Emojis overlay synced from fans */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[15]">
              {floating.map(item => (
                <span
                  key={item.id}
                  className="absolute text-4xl animate-float-up drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
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

            {/* Live Indicator overlay — only visible when actually broadcasting */}
            {isLive && (
            <div className="absolute top-4 left-4 flex gap-2 z-20">
               <div className="px-3 py-1 bg-red-600 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[0.6rem] font-black text-white uppercase tracking-widest">Live</span>
               </div>
               <div className="px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full flex items-center gap-1.5 text-white/90">
                  <span className="text-[0.6rem] font-medium">👁 {viewerCount}</span>
               </div>
               <div className="px-3 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-full flex items-center gap-1.5 text-white/90">
                  <span className="text-[0.6rem] font-medium">⏱ {formatTime(elapsed)}</span>
               </div>
            </div>
            )}

            {/* Video Controls overlay — only when live */}
            {isLive && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-20 flex items-center justify-end gap-4 pointer-events-none">
              <button 
                onClick={attemptEndStream}
                disabled={toggling}
                className="shrink-0 px-8 py-3 rounded-full text-[0.65rem] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 bg-red-900/80 border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white pointer-events-auto"
              >
                {toggling ? '...' : '● End Stream'}
              </button>
            </div>
            )}

            {/* Go Live CTA — bottom of video, above A/V controls */}
            {!isLive && (
            <div className="absolute inset-x-0 bottom-16 z-20 flex items-center justify-center">
              <button 
                onClick={attemptEndStream}
                disabled={toggling}
                className="px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all disabled:opacity-50 bg-[#ec4899] text-white hover:brightness-110 hover:scale-105 hover:shadow-[0_0_50px_rgba(236,72,153,0.7)] flex items-center gap-3"
              >
                <span className="w-3 h-3 bg-white rounded-full drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                {toggling ? 'Starting...' : 'Go Live'}
              </button>
            </div>
            )}
          </div>

          {/* CHAT PANEL (Right side) */}
          <div className="w-[400px] bg-[#0c0c11] border-l border-white/[0.05] flex flex-col shrink-0">
             <div className="p-4 border-b border-white/[0.05] flex items-center justify-between">
                <span className="text-[0.65rem] font-black uppercase tracking-widest text-white/80">💭 Live Chat</span>
                <div className="flex items-center gap-3 text-[0.55rem] font-bold uppercase tracking-widest text-white/40">
                   <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-emerald-500" /> {viewerCount} online
                   </div>
                   <span>·</span>
                   <span>{posts.length} msgs</span>
                </div>
             </div>
             
             {/* 📌 Pinned Message Alert */}
             {activePinned && (
               <div className="px-4 py-3 border-b border-white/[0.06] bg-gradient-to-r from-emerald-500/10 to-transparent shrink-0 relative group">
                 <div className="flex items-start gap-2.5 pr-6">
                   <span className="text-sm shrink-0 mt-0.5">📌</span>
                   <div className="min-w-0 flex-1">
                     <p className="text-white/90 text-[0.75rem] leading-snug font-medium">
                       {activePinned.text}
                     </p>
                     <p className="text-emerald-400/80 text-[0.55rem] mt-1 font-bold uppercase tracking-widest">
                       PINNED BY {activePinned.by}
                     </p>
                   </div>
                 </div>
                 <button 
                  onClick={() => { setActivePinned(null); localStorage.setItem('7h_global_pinned', 'null'); }} 
                  className="absolute top-3 right-3 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Unpin Message"
                 >
                    ×
                 </button>
               </div>
             )}

             <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col min-h-0">
                {posts.map(p => (
                  <div key={p.id} className="flex gap-3">
                     <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-black shrink-0 shadow-lg" style={{ backgroundColor: p.account?.color || getAvatarColor(p.account?.displayName || 'Crew') }}>
                        {p.account?.avatar || 'C'}
                     </div>
                     <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                           <p className="text-[0.7rem] font-bold uppercase tracking-tight" style={{ color: p.account?.color || getAvatarColor(p.account?.displayName || 'Crew') }}>{p.account?.displayName || 'Anonymous'}</p>
                           {(p.account?.role === 'crew' || p.account?.role === 'admin') && (
                              <span className="px-1 py-0.5 bg-[#8a1cfc]/20 border border-[#8a1cfc]/40 rounded text-[0.45rem] font-black uppercase tracking-wider text-[#c084fc]">
                                CREW
                              </span>
                           )}
                        </div>
                        <p className="text-sm text-white/90 leading-snug">{p.text}</p>
                     </div>
                  </div>
                ))}
                
             </div>

             <div className="p-4 bg-[#111116] border-t border-white/[0.05] space-y-2">
                {/* Pin message input */}
                <div className="relative">
                   <input 
                     value={globalPinText}
                     onChange={e => setGlobalPinText(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleGlobalPinBox()}
                     placeholder="Pin a message to all fans..."
                     className="w-full bg-emerald-500/[0.06] border border-emerald-500/20 rounded-full px-5 py-2.5 pr-28 text-sm text-white placeholder:text-emerald-400/40 outline-none focus:border-emerald-500/50 transition-colors"
                   />
                   <div className="absolute right-2 top-1.5 bottom-1.5 flex items-center z-10">
                      <button 
                        onClick={handleGlobalPinBox} 
                        disabled={!globalPinText.trim()} 
                        className="h-full px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-[0.55rem] rounded-full transition-colors disabled:opacity-30 disabled:bg-white/10 disabled:text-white/30"
                      >
                        📌 PIN
                      </button>
                   </div>
                </div>
                {/* Chat message input */}
                <div className="relative">
                   <input 
                     value={content}
                     onChange={e => setContent(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handlePost()}
                     placeholder="Type a message..."
                     className="w-full bg-[#1c1c24] border border-white/5 rounded-full px-5 py-3 pr-24 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ec4899]/50 transition-colors"
                   />
                   <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                      <button onClick={handlePost} disabled={!content.trim() || posting} className="w-9 h-9 bg-[#2a2a35] hover:bg-[#ec4899] text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50" title="Send Chat">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* ─── BOTTOM RIGHT CARDS (Merch & Raffle) ─── */}
        <div className="flex flex-col xl:flex-row w-full gap-6 mt-6">
           
           {/* FLASH MERCH DROP */}
           <div className="flex-1 bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/[0.05] flex items-center gap-3 bg-[#181820]">
                 <div className="w-10 h-10 rounded-xl bg-[#ec4899]/20 border border-[#ec4899]/30 flex items-center justify-center text-xl">🛍️</div>
                 <div>
                    <h3 className="text-sm font-black italic tracking-wide text-white">Flash Merch Drop</h3>
                    <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">Limited time, limited stock</p>
                 </div>
              </div>
              <div className="p-4">
                 <div className="flex items-center justify-between mb-3 text-[0.55rem] font-black uppercase tracking-widest">
                    <span className="text-[#ec4899]">■ LIVE SHOPIFY INVENTORY</span>
                    <button onClick={() => window.location.reload()} className="text-white/30 hover:text-white flex items-center gap-1">↻ Refresh</button>
                 </div>
                 
                 <div className="mb-4">
                    <select 
                       value={selectedProductId || ''}
                       onChange={e => setSelectedProductId(e.target.value)}
                       className="w-full bg-black border border-[#ec4899]/30 rounded-xl p-3 text-white font-bold text-sm outline-none focus:border-[#ec4899] cursor-pointer appearance-none"
                       style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ec4899%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                       {shopifyProducts.length === 0 && (
                          <option value="">{pName} — ${pPrice} ({pStock} in stock)</option>
                       )}
                       {shopifyProducts.map(p => (
                          <option key={p.id} value={p.id}>
                             {p.title} — ${p.variants.edges[0].node.price.amount} ({(p.quantityAvailable || 0)} in stock)
                          </option>
                       ))}
                    </select>
                 </div>
                 
                 <div className="flex gap-4 p-4 bg-[#1c1c24] rounded-xl border border-white/5 mb-4 items-center">
                    <img src={pImageUrl} alt={pName} className="w-16 h-16 rounded bg-black object-cover" />
                    <div className="flex-1">
                       <p className="text-sm font-bold truncate pr-2" title={pName}>{pName}</p>
                       <p className="text-[#ec4899] font-black">${pPrice}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-4">
                   <div>
                     <p className="text-[0.55rem] font-black tracking-widest uppercase text-white/30 mb-2">Stock <span className="text-[#ec4899]">(Shopify: {pStock})</span></p>
                     <div className="w-full bg-[#1c1c24] border border-white/10 rounded-lg p-2.5 text-center text-xs font-bold font-mono">{pStock}</div>
                   </div>
                   <div>
                     <p className="text-[0.55rem] font-black tracking-widest uppercase text-white/30 mb-2">Duration</p>
                     <div className="grid grid-cols-5 gap-1">
                       {['2m', '5m', '10m', '15m'].map((d) => (
                         <button 
                           key={d}
                           onClick={() => setDropDurationStr(d)}
                           className={`text-center p-2 rounded border text-[0.6rem] font-bold ${dropDurationStr === d ? 'bg-[#ec4899]/20 border-[#ec4899] text-[#ec4899]' : 'bg-[#1c1c24] border-white/10 text-white/40 hover:bg-white/5'}`}
                         >
                           {d}
                         </button>
                       ))}
                       <input 
                         type="text" 
                         placeholder="1m 30s" 
                         value={dropDurationStr} 
                         onChange={e => setDropDurationStr(e.target.value)} 
                         className="bg-black border border-white/20 text-white text-[0.6rem] font-bold text-center rounded outline-none focus:border-[#ec4899] w-full" 
                       />
                     </div>
                   </div>
                 </div>

                 <button 
                   onClick={launchFlashDrop}
                   className="w-full py-4 bg-gradient-to-r from-[#ec4899] to-pink-600 hover:brightness-110 text-white text-[0.7rem] font-black italic tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all"
                 >
                    🔥 Launch Flash Drop
                 </button>

                 <button 
                   onClick={() => {
                     const testPayload = { name: '7TH HEAVEN HOODIE 2026', price: '45.00', stock: 0, image: '/images/mockups/merch_hoodie.png', duration: 300 };
                     localStorage.setItem('7h_flash_drop', JSON.stringify({ ...testPayload, ts: Date.now() }));
                     try { supabase.channel('live_events').send({ type: 'broadcast', event: 'flash_drop', payload: testPayload }) } catch {}
                   }}
                   className="w-full mt-2 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 text-[0.6rem] font-black tracking-widest uppercase rounded-xl transition-all"
                 >
                    [TESTING] Simulate Sold Out Merch Drop
                 </button>
              </div>
           </div>

           {/* LIVE RAFFLE (Rebuilt as requested) */}
           <div className="flex-1 bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-4 border-b border-white/[0.05] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#181820]">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">🎟️</div>
                    <div>
                       <h3 className="text-sm font-black italic tracking-wide text-white">Live Event Raffle</h3>
                       <p className="text-[0.6rem] font-bold text-white/40 uppercase tracking-widest">{raffleStatus === 'idle' ? 'Standby' : raffleStatus === 'open' ? 'Accepting Entries' : raffleStatus === 'drawing' ? 'Drawing Winner...' : 'Complete'}</p>
                    </div>
                 </div>
                 {raffleStatus !== 'idle' && (
                   <button 
                      onClick={cancelRaffle} 
                      className="px-6 py-2.5 text-[0.6rem] font-black uppercase tracking-widest rounded-lg transition-colors border bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                   >
                      {raffleStatus === 'complete' ? 'Clear Results' : 'Cancel Raffle'}
                   </button>
                 )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-5">
                 
                 {/* Multi-Raffle Queue Configuration */}
                 <div className="space-y-6">
                    {raffleQueue.map((item, idx) => (
                      <div key={idx} className={`flex flex-col gap-2 relative ${idx !== activeQueueIndex && (raffleStatus !== 'idle' && raffleStatus !== 'complete') ? 'opacity-30 pointer-events-none' : ''}`}>
                         {/* Show indicator if it's the currently active raffle */}
                         {idx === activeQueueIndex && raffleStatus !== 'idle' && (
                           <div className="absolute -left-6 top-8 text-amber-500 animate-pulse">▶</div>
                         )}

                         <div className="flex gap-3 items-end">
                            {/* Input 1: Prize Name */}
                            <div className="flex-1 flex flex-col gap-2">
                               {idx === 0 && <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#a78bfa]">1. Input for raffle prize</label>}
                               <input 
                                 type="text" 
                                 disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                                 value={item.name}
                                 onChange={(e) => updateQueueItem(idx, 'name', e.target.value)}
                                 placeholder="e.g. VIP Meet & Greet Pass"
                                 className={`w-full bg-[#1c1c24] border rounded-lg px-4 py-3 text-sm text-white outline-none transition-colors ${idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing') ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-white/10 focus:border-[#a78bfa]'}`}
                               />
                            </div>

                            {/* Input 2: Entries Needed */}
                            <div className="w-28 flex flex-col gap-2 relative">
                               {idx === 0 && <label className="text-[0.55rem] font-black uppercase tracking-widest text-amber-500 truncate">2. Entries needed</label>}
                               <input 
                                 type="number" 
                                 min="1"
                                 disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                                 value={item.min || ''}
                                 onChange={(e) => updateQueueItem(idx, 'min', parseInt(e.target.value) || 1)}
                                 className={`w-full bg-[#1c1c24] border rounded-lg px-4 py-3 text-sm text-amber-400 font-bold outline-none transition-colors text-center ${idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing') ? 'border-amber-500/50' : 'border-white/10 focus:border-amber-500'}`}
                               />
                               {/* Floating counter during active raffle */}
                               {idx === activeQueueIndex && raffleStatus !== 'idle' && (
                                 <div className="absolute -top-6 right-0 text-[0.55rem] text-amber-500 font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 whitespace-nowrap overflow-visible z-10 w-auto text-right">
                                   {raffleEntrants.length} / {item.min} Entries
                                 </div>
                               )}
                            </div>

                            {/* Input 3: Prize Qty */}
                            <div className="w-24 flex flex-col gap-2">
                               {idx === 0 && <label className="text-[0.55rem] font-black uppercase tracking-widest text-[#a78bfa] truncate">3. How many</label>}
                               <input 
                                 type="number" 
                                 min="1"
                                 disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                                 value={item.qty || ''}
                                 onChange={(e) => updateQueueItem(idx, 'qty', parseInt(e.target.value) || 1)}
                                 className={`w-full bg-[#1c1c24] border rounded-lg px-4 py-3 text-sm text-white outline-none transition-colors text-center ${idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing') ? 'border-amber-500/50' : 'border-white/10 focus:border-[#a78bfa]'}`}
                               />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => startSpecificRaffle(idx)}
                                disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                                className={`h-[46px] px-6 shrink-0 flex items-center justify-center border text-[0.6rem] font-black uppercase tracking-widest rounded-lg transition-all ${
                                  (raffleStatus === 'idle' || raffleStatus === 'complete')
                                  ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10' 
                                  : idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing')
                                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-500' // highlight active
                                    : 'border-white/10 text-white/30 opacity-30 shadow-none' // dim inactive
                                }`}
                              >
                                {idx === activeQueueIndex && (raffleStatus === 'open' || raffleStatus === 'drawing') ? 'Running' : 'Start'}
                              </button>

                              <button 
                                onClick={() => removeQueueItem(idx)}
                                disabled={raffleStatus !== 'idle' || raffleQueue.length === 1}
                                className="h-[46px] w-[46px] shrink-0 flex items-center justify-center border border-red-500/10 hover:border-red-500/40 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-0"
                              >
                                ✕
                              </button>
                            </div>
                         </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={addQueueItem}
                      disabled={raffleStatus !== 'idle' && raffleStatus !== 'complete'}
                      className="w-full py-2.5 border border-dashed border-white/20 text-white/40 text-[0.6rem] font-bold uppercase tracking-widest rounded-lg hover:border-white/40 hover:text-white/80 transition-colors disabled:opacity-30"
                    >
                      + Add Another Raffle To Queue
                    </button>
                 </div>

                 {raffleStatus === 'open' && (
                    <div className="mt-2 text-center p-3 border border-amber-500/20 bg-amber-500/5 rounded-xl">
                       <p className="text-lg font-black text-white italic mb-1">{raffleEntrants.length} <span className="text-xs text-white/50">/ {raffleMinEntrants}</span></p>
                       <p className="text-[0.55rem] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Fan entries collected</p>
                       <div className="flex flex-col gap-2 mt-4 px-2">
                        <div className="flex gap-2">
                           <button onClick={addFakeEntry} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[0.6rem] font-bold text-white uppercase tracking-widest transition-colors">+ Fake Entry</button>
                           <button onClick={addLotsOfFakeEntries} className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[0.6rem] font-bold text-white uppercase tracking-widest transition-colors">+ Multi Fake</button>
                        </div>
                        <button 
                          onClick={rigWinForMe} 
                          className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[0.6rem] font-black text-emerald-400 uppercase tracking-[0.2em] transition-all"
                        >
                          🧪 TEST: Rig Win for Me
                        </button>
                     </div>
                    </div>
                 )}

                 {/* Draw Action */}
                 <div className="mt-auto">
                    {raffleStatus !== 'complete' ? (
                       <button 
                         onClick={drawWinner}
                         disabled={raffleStatus !== 'open' || raffleEntrants.length < raffleMinEntrants}
                         className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-black text-[0.7rem] font-black italic tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-30 disabled:grayscale"
                       >
                         {raffleStatus === 'drawing' ? '🎰 Rolling the dice...' : '🎰 Draw Winner'}
                       </button>
                    ) : (
                       <div className="bg-[#1c1c24] border border-amber-500/30 rounded-xl p-4 text-center">
                         <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 shadow-[0_0_15px_rgba(245,158,11,0.5)]">🎉</div>
                         <h4 className="text-lg font-black text-white italic">Winner Selected</h4>
                         <div className="flex flex-col gap-2 justify-center mt-3">
                           {drawnWinners.map((w, i) => (
                              <div key={w.id} className="flex items-center justify-between px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30">
                                <span className="text-sm font-black">{w.name}</span>
                                <span className="text-xs font-mono font-bold tracking-widest text-amber-300">PIN: {winnerPins[i] || '0000'}</span>
                              </div>
                           ))}
                         </div>
                         {raffleAutoRestartCountdown !== null && (
                            <p className="text-[0.6rem] font-bold text-white/40 mt-3 pt-3 border-t border-white/10">
                              Next raffle auto-starts in <span className="text-amber-500 font-mono text-xs">{Math.floor(raffleAutoRestartCountdown / 60)}:{(raffleAutoRestartCountdown % 60).toString().padStart(2, '0')}</span>
                            </p>
                         )}
                       </div>
                    )}
                 </div>

              </div>
           </div>

        </div>
      </div>
      
      {/* End Stream Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#0a0a0f] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
             {isSavingReplay && (
                <div className="absolute inset-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Processing & Saving...</h3>
                  <p className="text-white/40 text-xs mt-2">Compressing VOD to Gallery</p>
                </div>
             )}
             
             <div className="text-center mb-8 relative z-10">
               <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/></svg>
               </div>
               <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2 text-white">End Broadcast?</h2>
               <p className="text-sm text-white/60 leading-relaxed">
                 You are about to terminate the live broadcast to all fans. Are you sure you want to terminate the stream?
               </p>
             </div>
             
             <div className="flex flex-col gap-3 relative z-10">
               <button 
                 onClick={confirmEndDiscard}
                 className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-black uppercase tracking-[0.2em] text-xs transition-colors shadow-[0_0_20px_rgba(239,68,68,0.3)] rounded-lg"
               >
                 End Broadcast
               </button>
               <button 
                 onClick={() => setShowEndModal(false)}
                 className="w-full py-2 text-white/40 hover:text-white uppercase tracking-widest text-[0.6rem] font-bold mt-2 transition-colors"
               >
                 Cancel, Keep Streaming
               </button>
             </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}</style>
    </div>
  );
}
