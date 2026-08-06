'use client';
import Image from 'next/image';

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const LiveKitStream = dynamic(() => import('@/components/LiveKitStream').then(mod => mod.LiveKitStream), { ssr: false });
import { useRouter, usePathname } from 'next/navigation';
import { useMember } from '@/context/MemberContext';
import { supabase } from '@/lib/supabase-client';

// ── Sub-components extracted from this file ──
import { CameraFeed } from './CameraFeed';
import { GoingLiveOverlay } from './GoingLiveOverlay';
import { RaffleClaimModal } from './RaffleClaimModal';

// ── Shared constants & types ──
import {
  CREW_ACCOUNTS, FAN_ACCOUNTS, FAN_MESSAGES, CREW_MESSAGES, SYSTEM_EVENTS,
  REACTION_EMOJIS, CREW_CONFIG, DEMO_VIOLATIONS, MERCH_PRODUCTS, MERCH_DURATIONS,
  FEED_STATS, FLAG_KEYWORDS, CHAT_EMOJIS,
  type FakeAccount, type CrewConfig, type ChatMsg, type FloatingEmoji, type SetlistSong,
} from './constants';


export function FakeLiveStream({ memberId = 'mike', adminMode = false }: { memberId?: string; adminMode?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const crew = CREW_CONFIG[memberId] ?? CREW_CONFIG.mike;

  // ── Crew live status: check localStorage on mount to know if crew is actually streaming ──
  const [crewIsLive, setCrewIsLive] = useState(false);
  useEffect(() => {
    const membSlug = memberId === 'mike' ? 'michael' : memberId;
    setCrewIsLive(localStorage.getItem(`is_live_${membSlug}`) === 'true');
  }, [memberId]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [liveFeedStatuses, setLiveFeedStatuses] = useState<Record<string, string>>({});
  useEffect(() => {
    const slugs = { mike: 'michael', sammy: 'sammy', ryan: 'ryan', tony: 'tony' };
    const statuses: Record<string, string> = {};
    for (const slug of Object.values(slugs)) {
      statuses[slug] = localStorage.getItem(`is_live_${slug}`) || 'false';
    }
    setLiveFeedStatuses(statuses);
  }, []);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [hype, setHype] = useState(20);
  const [hypeBurst, setHypeBurst] = useState(false);
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);
  const [lightPhase, setLightPhase] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [viewerCount, setViewerCount] = useState(847);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [reactionsVisible, setReactionsVisible] = useState(true);

  // ── Pinned message from crew dashboard ──
  const [pinnedMessage, setPinnedMessage] = useState<{ text: string; by: string } | null>(null);

  /* ── Admin panel state — pre-seeded so demo loads instantly ── */
  const [showAdminPanel, setShowAdminPanel] = useState(adminMode);
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [warnedUsers, setWarnedUsers] = useState<Set<string>>(() => new Set(['fan-rockerdan']));
  const [modLog, setModLog] = useState<{ id: string; action: string; user: string; time: number; reason?: string }[]>(() => [
    { id: 'seed-log-1', action: '🔇 Muted', user: 'troll_acc22', time: Date.now() - 8 * 60000 },
    { id: 'seed-log-2', action: '🚫 Banned', user: 'hate_user99', time: Date.now() - 22 * 60000, reason: '⚠️ Hate speech / slur' },
  ]);
  const [flaggedMsgs, setFlaggedMsgs] = useState<{ msg: ChatMsg; reason: string }[]>(() =>
    DEMO_VIOLATIONS.slice(0, 3).map((v, i) => ({
      msg: {
        id: `seed-flag-${i}`,
        account: FAN_ACCOUNTS.find(a => a.id === v.fanId) ?? FAN_ACCOUNTS[i],
        text: v.text,
        timestamp: Date.now() - (3 - i) * 45000,
      },
      reason: v.reason,
    }))
  );
  const [adminTab, setAdminTab] = useState<'live' | 'flagged' | 'merch' | 'users' | 'log' | 'policy' | 'stats'>(adminMode ? 'merch' : 'live');
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const adminAutoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adminViolationIdxRef = useRef(3); // start after the 3 pre-seeded ones

  // ── Multi-cam switcher ──
  const normalizedId = memberId.toLowerCase() === 'michael' ? 'mike' : memberId.toLowerCase();
  const [activeFeedId, setActiveFeedId] = useState<string>(CREW_CONFIG[normalizedId] ? normalizedId : 'mike');
  const activeFeedCrew = CREW_CONFIG[activeFeedId] ?? crew;

  // ── Fan spotlight lower-third ──
  const [spotlight, setSpotlight] = useState<{ account: FakeAccount; text: string } | null>(null);
  const spotlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Custom Flagged Words ──
  const [customWords, setCustomWords] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('7h_custom_flagged_words');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [newCustomWord, setNewCustomWord] = useState('');

  // Sync custom words with other tabs of the same browser via storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === '7h_custom_flagged_words') {
        try {
          if (e.newValue) {
            setCustomWords(JSON.parse(e.newValue));
          } else {
            setCustomWords([]);
          }
        } catch { }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 🎰 Live Raffle States
  const { member, isLoggedIn, openModal } = useMember();
  const [raffleState, setRaffleState] = useState<{ status: string, entrants: any[], prizes: any[], winners: any[], timer: number, minEntrants?: number, countdown?: number, winnerPins?: string[], timestamp?: number } | null>(null);
  const [hasEnteredRaffle, setHasEnteredRaffle] = useState(false);
  const [raffleWidgetClosed, setRaffleWidgetClosed] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);


  const [nextRaffleCountdown, setNextRaffleCountdown] = useState<number | null>(null);

  // 🛍️ Live Merch Drop Checkout States
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [checkoutSelectedSize, setCheckoutSelectedSize] = useState('L');
  const [checkoutSelectedColor, setCheckoutSelectedColor] = useState('Black');
  const [shippingDetails, setShippingDetails] = useState({ name: '', email: '', address: '', city: '', zip: '', card: '•••• •••• •••• 4242' });
  const [checkoutDeliveryMethod, setCheckoutDeliveryMethod] = useState<'shipping' | 'merch_table'>('merch_table');
  const [checkoutClaimPin, setCheckoutClaimPin] = useState('');

  // 🎵 Live Setlist States
  const [setlist, setSetlist] = useState<SetlistSong[]>([
    { id: 's1', title: 'Sing', likes: 0, isPlaying: false },
    { id: 's2', title: 'This Is My Life', likes: 0, isPlaying: false },
    { id: 's3', title: 'Better This Way', likes: 0, isPlaying: false },
    { id: 's4', title: 'Gravity', likes: 0, isPlaying: false },
    { id: 's5', title: 'Beautiful Life', likes: 0, isPlaying: false },
    { id: 's6', title: 'Stop Shillin', likes: 0, isPlaying: false },
  ]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'setlist'>('chat');
  const [setlistSort, setSetlistSort] = useState<'order' | 'likes'>('order');
  const [prevMemberId, setPrevMemberId] = useState(memberId);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(() => {
    const liked = new Set<string>();
    try {
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.startsWith(`liked_song_${memberId}_`) && localStorage.getItem(k) === 'true') {
            liked.add(k.slice(`liked_song_${memberId}_`.length));
          }
        }
      }
    } catch { }
    return liked;
  });

  if (prevMemberId !== memberId) {
    setPrevMemberId(memberId);
    const liked = new Set<string>();
    try {
      if (typeof window !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.startsWith(`liked_song_${memberId}_`) && localStorage.getItem(k) === 'true') {
            liked.add(k.slice(`liked_song_${memberId}_`.length));
          }
        }
      }
    } catch { }
    setLikedSongs(liked);
  }

  // ── Merch drop (admin-controlled) ──
  const [merchTimerActive, setMerchTimerActive] = useState(false);
  const [merchTimeLeft, setMerchTimeLeft] = useState(0);
  const [merchSelectedProduct, setMerchSelectedProduct] = useState(MERCH_PRODUCTS[0].id);
  const [merchSelectedDuration, setMerchSelectedDuration] = useState(300);
  const [activeMerchDrop, setActiveMerchDrop] = useState<{ product: typeof MERCH_PRODUCTS[0] & { image?: string; imageUrl?: string }; totalTime: number } | null>(null);
  const MERCH_TIMER_DURATION = 300; // legacy fallback




  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const msgCountRef = useRef(0);
  // Cross-tab sync via BroadcastChannel
  const bcRef = useRef<BroadcastChannel | null>(null);
  const seenMsgIds = useRef<Set<string>>(new Set());


  /* ── Stage gradient ── */
  const stageGradient = useMemo(() => {
    const h1 = lightPhase % 360;
    const h2 = (lightPhase + 120) % 360;
    const h3 = (lightPhase + 240) % 360;
    return `
      radial-gradient(ellipse 80% 60% at 20% 80%, hsla(${h1}, 80%, 30%, 0.5) 0%, transparent 70%),
      radial-gradient(ellipse 60% 50% at 80% 70%, hsla(${h2}, 80%, 25%, 0.4) 0%, transparent 60%),
      radial-gradient(ellipse 100% 40% at 50% 100%, hsla(${h3}, 70%, 20%, 0.6) 0%, transparent 50%),
      radial-gradient(circle at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 40%),
      linear-gradient(180deg, #050508 0%, #0a0a12 40%, #0d0b18 100%)
    `;
  }, [lightPhase]);

  /* ── Light phase ── */
  useEffect(() => {
    const t = setInterval(() => setLightPhase(p => (p + 1) % 360), 80);
    return () => clearInterval(t);
  }, []);

  /* ── Poll localStorage every second to detect crew going live ── */
  /* This is the most reliable cross-tab sync method — storage events   */
  /* only fire in OTHER tabs, and BroadcastChannel can fail silently.   */
  useEffect(() => {
    const checkLive = () => {
      const feedSlug = activeFeedId === 'mike' ? 'michael' : activeFeedId;
      const nowLive = localStorage.getItem(`is_live_${feedSlug}`) === 'true';
      if (nowLive && !crewIsLive && activeFeedId === normalizedId) {
        setShowOverlay(true);
      }
      if (nowLive !== crewIsLive) {
        setCrewIsLive(nowLive);
      }
    };
    checkLive();
    const t = setInterval(checkLive, 1000);
    // Also listen for storage events as a bonus (fires faster than polling)
    const handleStorage = (e: StorageEvent) => {
      const feedSlug = activeFeedId === 'mike' ? 'michael' : activeFeedId;
      if (e.key === `is_live_${feedSlug}`) {
        checkLive();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(t);
      window.removeEventListener('storage', handleStorage);
    };
  }, [activeFeedId, normalizedId]);

  // LocalStorage Namespace helper
  const LS = useCallback((key: string) => `${key}_${memberId?.toString().toLowerCase().trim()}`, [memberId]);

  // Initial raffle state load and 1s poll (to sync across tabs/processes)
  useEffect(() => {
    const checkRaffle = () => {
      try {
        if (!crewIsLive) {
          localStorage.removeItem(LS('live_raffle_sync'));
          setRaffleState(null);
          return;
        }
        const raw = localStorage.getItem(LS('live_raffle_sync'));
        if (raw) {
          const pb = JSON.parse(raw);
          if (pb && (pb.userId === memberId || memberId === 'michael')) {
            if (pb.status === 'idle') setRaffleState(null);
            else setRaffleState(pb);
          }
        } else {
          setRaffleState(null);
        }
      } catch { }
    };

    checkRaffle();
    const pollInterval = setInterval(checkRaffle, 1000);
    return () => clearInterval(pollInterval);
  }, [memberId, LS, crewIsLive]);

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
        } catch { }
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [raffleState?.status, raffleState?.countdown, LS]);

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
        `<td style="padding:0 3px;"><div style="width:40px;height:52px;background:#0a0a0a;border:2px solid rgba(192, 132, 252,0.4);border-radius:8px;display:flex;align-items:center;justify-content:center;"><span style="color:#c084fc;font-size:24px;font-weight:900;font-family:monospace;">${d}</span></div></td>`
      ).join('');

      const fallbackEmail = 'fan@7thheavenband.com';
      const promptEmail = typeof window !== 'undefined' ? window.prompt("Testing Dispatch: What is your exact Resend account email address to receive the test?", member?.email || fallbackEmail) : null;
      const targetEmail = promptEmail ? promptEmail.trim() : fallbackEmail;

      fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: '🏆 You Won the 7th Heaven Raffle!',
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Barlow',Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;"><tr><td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:22px 40px;text-align:center;border-radius:12px 12px 0 0;"><p style="margin:0;color:#fff;font-size:22px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">7TH HEAVEN</p></td></tr><tr><td style="background:#111118;padding:48px 40px;text-align:center;border-left:1px solid #1f1f2e;border-right:1px solid #1f1f2e;"><p style="font-size:52px;margin:0 0 16px;">🏆</p><h1 style="margin:0 0 12px;color:#fff;font-size:32px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">YOU WON THE RAFFLE</h1><p style="margin:0 0 36px;color:#888;font-size:16px;">Congratulations — your name was drawn live in front of everyone.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="background:#0a0a0e;border:2px solid #c084fc;border-radius:12px;padding:24px;text-align:center;"><p style="margin:0 0 8px;color:#92600a;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Your Prize</p><p style="margin:0;color:#fff;font-size:24px;font-weight:900;">${prizeName}</p></td></tr></table>${pin ? `<p style="margin:0 0 12px;color:#555;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Your Claim PIN</p><table cellpadding="0" cellspacing="0" style="margin:0 auto 8px;"><tr>${pinDigits}</tr></table><p style="margin:0 0 32px;color:#444;font-size:11px;">Show this PIN to the 7th Heaven crew at the merch table</p>` : ''}<a href="${claimUrl}" style="display:inline-block;background:#c084fc;color:#000;font-weight:900;font-size:14px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:10px;margin-bottom:24px;">Open My Claim Page</a><p style="margin:0;color:#555;font-size:13px;">Or show this page to the crew at the merch table to collect your prize.</p></td></tr><tr><td style="background:#0d0d14;padding:24px 40px;text-align:center;border:1px solid #1f1f2e;border-top:none;border-radius:0 0 12px 12px;"><p style="margin:0 0 8px;color:#444;font-size:12px;">This email was sent because you entered the 7th Heaven live stream raffle.</p><p style="margin:0;color:#7c3aed;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">7TH HEAVEN</p></td></tr></table></td></tr></table></body></html>`
        })
      }).catch(console.error);

      try {
        const inbox = JSON.parse(localStorage.getItem('vip_inbox_messages') || '[]');
        inbox.unshift({ id: Date.now(), icon: '🏆', title: 'You Won the Raffle!', desc: `Congratulations! You won: ${prizeName}. Your PIN: ${pin}. Check your email for claim instructions.`, time: 'Just now', isNew: true, color: 'yellow' });
        localStorage.setItem('vip_inbox_messages', JSON.stringify(inbox));

        Promise.resolve(supabase.from('notifications').insert({
          user_email: member?.email || 'unknown@fan.7thheaven.com',
          type: 'raffle_win',
          title: `🏆 You Won the Raffle!`,
          body: `Congratulations! You won: ${prizeName}. Your PIN: ${pin}. Check your email for claim instructions.`,
          pin: pin,
          prize: prizeName,
        })).catch(() => { });
      } catch { }
    }
  }, [raffleState?.status, raffleState?.winners, raffleWidgetClosed, hasEnteredRaffle, member]);

  // Reset entry state for new raffles
  const prevRaffleStatus = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevRaffleStatus.current;
    const curr = raffleState?.status ?? null;
    if (curr === 'open' && (prev === 'complete' || prev === null)) {
      setHasEnteredRaffle(false);
      setRaffleWidgetClosed(false);
      setShowClaimModal(false);

    }
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
    }, 3 * 60 * 1000);
    return () => clearTimeout(t);
  }, [raffleState?.status]);

  // Next Raffle Countdown
  useEffect(() => {
    if (raffleState?.status === 'complete' && raffleState.timestamp) {
      const t = setInterval(() => {
        const diff = Math.floor((raffleState.timestamp! + 120000 - Date.now()) / 1000);
        setNextRaffleCountdown(Math.max(0, diff));
      }, 1000);
      return () => clearInterval(t);
    } else {
      setNextRaffleCountdown(null);
    }
  }, [raffleState?.status, raffleState?.timestamp]);

  // Supabase live_events subscription for raffle state, setlist state, custom flagged words, AND flash drops
  useEffect(() => {
    const eventsChannel = supabase.channel('live_events')
      .on('broadcast', { event: 'raffle_sync' }, (p: any) => {
        const pb = p.payload;
        if (pb && (pb.userId === memberId || memberId === 'michael')) {
          if (pb.status === 'idle') {
            setRaffleState(null);
          } else {
            setRaffleState(pb);
          }
        }
      })
      .on('broadcast', { event: 'setlist_sync' }, (p: any) => {
        const pb = p.payload;
        if (pb && (pb.userId === memberId || memberId === 'michael')) {
          if (pb.setlist) setSetlist(pb.setlist);
        }
      })
      .on('broadcast', { event: 'custom_words_sync' }, (p: any) => {
        const pb = p.payload;
        if (pb && pb.words) {
          setCustomWords(pb.words);
        }
      })
      .on('broadcast', { event: 'flash_drop' }, (p: any) => {
        if (adminMode) return;
        const payload = p.payload;
        if (!payload) return;
        const { name, price, stock, duration, image, description, variants } = payload;
        const syntheticProduct = {
          id: `flash-${Date.now()}`,
          name: name || 'Flash Merch Drop',
          price: price ? `$${parseFloat(price).toFixed(2)}` : '$45.00',
          stock: stock || 15,
          emoji: '🛍',
          color: '#ec4899',
          badge: 'LIMITED',
          image: image || '/images/mockups/merch-hoodie.png',
          description: description || '',
          variants: variants || [],
        };
        setActiveMerchDrop({ product: syntheticProduct as any, totalTime: duration || 300 });
        setMerchTimerActive(true);
        setMerchTimeLeft(duration || 300);
        setHype(h => Math.min(100, h + 40));
      })
      .on('broadcast', { event: 'cancel_flash_drop' }, () => {
        if (adminMode) return;
        setMerchTimerActive(false);
        setActiveMerchDrop(null);
        setMerchTimeLeft(0);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, [memberId, adminMode]);

  // Poll live_setlist_sync from localStorage (for cross-tab sync during testing)
  useEffect(() => {
    const checkSetlist = () => {
      try {
        const raw = localStorage.getItem(LS('live_setlist_sync'));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed)) {
            setSetlist(parsed);
          }
        }
      } catch { }
    };

    checkSetlist();
    const pollInterval = setInterval(checkSetlist, 1000);
    return () => clearInterval(pollInterval);
  }, [memberId, LS]);

  // Handler to like a song
  const likeSong = (songId: string) => {
    // Save locally to prevent double hearting
    const userLikedKey = `liked_song_${memberId}_${songId}`;
    if (localStorage.getItem(userLikedKey) === 'true') return; // already liked
    localStorage.setItem(userLikedKey, 'true');
    setLikedSongs(prev => new Set(prev).add(songId));

    // Update local setlist count
    setSetlist(prev => prev.map(s => s.id === songId ? { ...s, likes: s.likes + 1 } : s));

    // Broadcast the like event to crew via Supabase Realtime
    try {
      supabase.channel('live_events').send({
        type: 'broadcast',
        event: 'song_like',
        payload: { songId, crewId: memberId }
      });
    } catch { }

    // Broadcast the like event to crew via LocalStorage for same-browser testing
    try {
      localStorage.setItem('song_like_sync', JSON.stringify({
        songId,
        crewId: memberId,
        ts: Date.now()
      }));
    } catch { }

    // Float a heart reaction
    const floatHeart = {
      id: `heart-like-${Date.now()}-${Math.random()}`,
      emoji: '💖',
      x: 20 + Math.random() * 60,
      createdAt: Date.now(),
    };
    setFloating(prev => [...prev, floatHeart]);
    // Also increment hype slightly for fun!
    setHype(h => Math.min(100, h + 2));
  };

  /* ── BroadcastChannel: cross-tab sync between /live/[member] and /crew-[member] ── */
  useEffect(() => {
    const channelKey = `7h_live_${memberId.replace('michael', 'michael')}`;
    const bc = new BroadcastChannel(channelKey);
    bcRef.current = bc;

    const handleBcMessage = (evt: MessageEvent) => {
      const { type, payload } = evt.data ?? {};
      if (!type) return;

      if (type === 'CUSTOM_WORDS_SYNC') {
        setCustomWords(payload);
      }

      if (type === 'CHAT_MSG') {
        // Receive chat messages from the other tab
        if (seenMsgIds.current.has(payload.id)) return;
        seenMsgIds.current.add(payload.id);
        setMessages(prev => {
          if (prev.find(m => m.id === payload.id)) return prev;
          const next = [...prev, payload];
          return next.length > 80 ? next.slice(-80) : next;
        });
      }

      if (type === 'MERCH_DROP_START' && !adminMode) {
        // Fan page receives drop → show banner
        const { product, totalTime, timeLeft } = payload;
        setActiveMerchDrop({ product, totalTime });
        setMerchTimerActive(true);
        setMerchTimeLeft(timeLeft);
      }

      if (type === 'MERCH_DROP_END' && !adminMode) {
        setMerchTimerActive(false);
        setActiveMerchDrop(null);
        setMerchTimeLeft(0);
      }

      if (type === 'MERCH_STOCK_DECREMENT') {
        const { newStock } = payload;
        setActiveMerchDrop(current => {
          if (current && current.product) {
            return {
              ...current,
              product: {
                ...current.product,
                stock: newStock
              }
            };
          }
          return current;
        });
      }

      if (type === 'MOD_SYSTEM_MSG') {
        // System moderation messages (warn/mute/ban/kick) from crew page
        if (seenMsgIds.current.has(payload.id)) return;
        seenMsgIds.current.add(payload.id);
        setMessages(prev => {
          if (prev.find(m => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
      }

      if (type === 'FLASH_DROP' && !adminMode) {
        // Real CrewDashboard launched a flash drop → show it on the fan page
        const { name, price, stock, duration, image, description, variants, products } = payload;
        const syntheticProduct = {
          id: `flash-${Date.now()}`,
          name: name || 'Flash Merch Drop',
          price: price ? `$${parseFloat(price).toFixed(2)}` : '$45.00',
          stock: stock || 15,
          emoji: '🛍',
          color: '#ec4899',
          badge: 'LIMITED',
          image: image || '/images/mockups/merch-hoodie.png',
          description: description || '',
          variants: variants || [],
          products: products || []
        };
        setActiveMerchDrop({ product: syntheticProduct as any, totalTime: duration || 300 });
        setMerchTimerActive(true);
        setMerchTimeLeft(duration || 300);
        // Fire a hype message in chat
        const dropMsg: ChatMsg = {
          id: `flash-drop-${Date.now()}`,
          account: CREW_ACCOUNTS[0],
          text: `🛍 FLASH DROP! ${name} — $${parseFloat(price || '45').toFixed(2)} · ${stock || 15} in stock. Limited time only! 🔥`,
          timestamp: Date.now(),
        };
        seenMsgIds.current.add(dropMsg.id);
        setMessages(prev => [...prev, dropMsg]);
        setHype(h => Math.min(100, h + 40));
      }

      if (type === 'CANCEL_FLASH_DROP' && !adminMode) {
        setMerchTimerActive(false);
        setActiveMerchDrop(null);
        setMerchTimeLeft(0);
      }

      if (type === 'STREAM_STATE') {
        // Crew dashboard went live or ended — sync the fan page
        if (payload?.isLive) {
          setCrewIsLive(true);
          setShowOverlay(true);
        } else {
          setCrewIsLive(false);
        }
      }

      if (type === 'PIN_MSG') {
        // Crew pinned a message — show it on the fan page
        if (payload?.text) {
          setPinnedMessage({ text: payload.text, by: payload.by || 'Crew' });
        } else {
          setPinnedMessage(null);
        }
      }
    };

    bc.onmessage = handleBcMessage;

    const globalBc = new BroadcastChannel('7h_live_global');
    globalBc.onmessage = handleBcMessage;

    // ── localStorage recovery: if a flash drop was launched BEFORE this tab opened,
    //    pick it up immediately so the fan page never misses an active drop. ──
    if (!adminMode) {
      try {
        const stored = localStorage.getItem('7h_flash_drop');
        if (stored) {
          const data = JSON.parse(stored);
          // Only hydrate if the drop was set within the last hour (safety guard)
          if (data && data.ts && (Date.now() - data.ts) < 3600_000) {
            const { name, price, stock, duration, image, description, variants } = data;
            const elapsed = Math.floor((Date.now() - data.ts) / 1000);
            const remaining = (duration || 300) - elapsed;
            if (remaining > 0) {
              const syntheticProduct = {
                id: `flash-${data.ts}`,
                name: name || 'Flash Merch Drop',
                price: price ? `$${parseFloat(price).toFixed(2)}` : '$45.00',
                stock: stock || 15,
                emoji: '🛍',
                color: '#ec4899',
                badge: 'LIMITED',
                image: image || '/images/mockups/merch-hoodie.png',
                description: description || '',
                variants: variants || [],
              };
              setActiveMerchDrop({ product: syntheticProduct as any, totalTime: duration || 300 });
              setMerchTimerActive(true);
              setMerchTimeLeft(remaining);
            } else {
              // Drop expired — clean up
              localStorage.removeItem('7h_flash_drop');
            }
          }
        }
      } catch (e) {
        console.error('Failed to recover flash drop from localStorage:', e);
      }
    }

    return () => { bc.close(); globalBc.close(); bcRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, adminMode]);

  /* ── Elapsed timer ── */
  useEffect(() => {
    if (showOverlay) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [showOverlay]);

  /* ── Viewer count fluctuation ── */
  useEffect(() => {
    if (showOverlay) return;
    const t = setInterval(() => {
      setViewerCount(prev => {
        const delta = Math.floor(Math.random() * 7) - 2; // -2 to +4
        const newCount = Math.max(800, Math.min(1400, prev + delta));
        if (bcRef.current) {
          bcRef.current.postMessage({ type: 'VIEWER_COUNT', payload: newCount });
        }
        return newCount;
      });
    }, 3500);
    return () => clearInterval(t);
  }, [showOverlay]);

  /* ── Hype decay ── */
  useEffect(() => {
    const t = setInterval(() => setHype(h => Math.max(0, h - 0.4)), 200);
    return () => clearInterval(t);
  }, []);

  /* ── Hype burst ── */
  useEffect(() => {
    if (hype >= 100 && !hypeBurst) {
      setHypeBurst(true);
      const burstEmojis = Array.from({ length: 14 }, (_, i) => ({
        id: `burst-${Date.now()}-${i}`,
        emoji: REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)],
        x: 5 + Math.random() * 85,
        createdAt: Date.now(),
      }));
      setFloating(prev => [...prev, ...burstEmojis]);
      const t = setTimeout(() => { setHype(0); setHypeBurst(false); }, 3000);
      return () => clearTimeout(t);
    }
  }, [hype, hypeBurst]);

  /* ── Auto-scroll chat ── */
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 140;
    if (isNearBottom) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Clean up old floating emojis ── */
  useEffect(() => {
    const t = setInterval(() => {
      setFloating(prev => prev.filter(e => Date.now() - e.createdAt < 3200));
    }, 500);
    return () => clearInterval(t);
  }, []);

  /* ── Auto-generate messages once stream is live ── */
  const addAutoMessage = useCallback(() => {
    msgCountRef.current += 1;

    // First 4 messages: crew "going live" sequence
    if (msgCountRef.current <= 4) {
      const crewIntros = [
        { account: CREW_ACCOUNTS[0], text: '🔴 Soundcheck done — we are LOCKED IN tonight 🔥' },
        { account: CREW_ACCOUNTS[0], text: 'Chicago — you ready for this?! 🏙️' },
        { account: CREW_ACCOUNTS[1], text: 'DRUMS ARE PRIMED. LET\'S GOO 🥁🥁' },
        { account: CREW_ACCOUNTS[3], text: 'Vocal check ✅ Mic\'s hot. This crowd is INSANE already' },
      ];
      const intro = crewIntros[msgCountRef.current - 1];
      const msg: ChatMsg = {
        id: `crew-intro-${msgCountRef.current}-${Date.now()}`,
        account: intro.account,
        text: intro.text,
        timestamp: Date.now(),
      };
      setMessages(prev => {
        const next = [...prev, msg];
        return next.length > 80 ? next.slice(-80) : next;
      });
      // Also broadcast intro messages to the crew dashboard
      if (!seenMsgIds.current.has(msg.id)) {
        seenMsgIds.current.add(msg.id);
        bcRef.current?.postMessage({ type: 'CHAT_MSG', payload: msg });
      }
      setHype(h => Math.min(100, h + 8));
      return;
    }

    const isCrew = Math.random() < 0.1;
    const account = isCrew
      ? CREW_ACCOUNTS[Math.floor(Math.random() * CREW_ACCOUNTS.length)]
      : FAN_ACCOUNTS[Math.floor(Math.random() * FAN_ACCOUNTS.length)];
    const pool = isCrew ? CREW_MESSAGES : FAN_MESSAGES;
    const text = pool[Math.floor(Math.random() * pool.length)];

    const msg: ChatMsg = {
      id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      account,
      text,
      timestamp: Date.now(),
    };

    // Broadcast to the other tab (fan ↔ crew)
    if (!seenMsgIds.current.has(msg.id)) {
      seenMsgIds.current.add(msg.id);
      bcRef.current?.postMessage({ type: 'CHAT_MSG', payload: msg });
    }

    setMessages(prev => {
      const next = [...prev, msg];
      return next.length > 80 ? next.slice(-80) : next;
    });

    if (isCrew) setHype(h => Math.min(100, h + 6));
    else if (Math.random() < 0.3) {
      // Random floating emoji from fan message
      const emoji = REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)];
      setFloating(prev => [...prev, {
        id: `auto-emoji-${Date.now()}`,
        emoji,
        x: 5 + Math.random() * 85,
        createdAt: Date.now(),
      }]);
      setHype(h => Math.min(100, h + 1.5));
    }
  }, []);

  /* ── Start auto-message loop when stream goes live ── */
  useEffect(() => {
    if (showOverlay) return;
    // Demo auto-messages always run; crewIsLive triggers the overlay animation
    // Initial burst of crew going live
    const delays = [400, 1800, 3200, 5000];
    const timeouts = delays.map(d => setTimeout(addAutoMessage, d));

    // Then regular cadence: random 2.5s – 7s
    const schedule = () => {
      const delay = 2500 + Math.random() * 4500;
      const t = setTimeout(() => {
        addAutoMessage();
        schedule();
      }, delay);
      timeouts.push(t);
    };
    const startTimer = setTimeout(schedule, 6000);

    // Periodic system join events
    SYSTEM_EVENTS.forEach(ev => {
      const t = setTimeout(() => {
        setMessages(prev => {
          const next = [...prev, {
            id: `sys-${Date.now()}-${Math.random()}`,
            account: null,
            text: ev.text,
            timestamp: Date.now(),
            isSystem: true,
          }];
          return next.length > 80 ? next.slice(-80) : next;
        });
      }, ev.delay + 200);
      timeouts.push(t);
    });
    timeouts.push(startTimer);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [showOverlay, crewIsLive, addAutoMessage]);

  /* ── Auto-flag new messages ── */
  useEffect(() => {
    if (messages.length === 0) return;

    messages.forEach(msg => {
      if (msg.isSystem || !msg.account) return;

      // 1. Check default regex keywords
      let flagged = false;
      for (const { kw, reason } of FLAG_KEYWORDS) {
        if (kw.test(msg.text)) {
          setFlaggedMsgs(prev => {
            if (prev.some(f => f.msg.id === msg.id)) return prev;
            return [...prev, { msg, reason }];
          });
          flagged = true;
          break;
        }
      }

      // 2. Check custom keywords
      if (!flagged && customWords.length > 0) {
        const lowerText = msg.text.toLowerCase();
        for (const word of customWords) {
          if (lowerText.includes(word)) {
            setFlaggedMsgs(prev => {
              if (prev.some(f => f.msg.id === msg.id)) return prev;
              return [...prev, { msg, reason: `🚫 Flagged word: "${word}"` }];
            });
            break;
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, customWords]);

  const syncCustomWords = (words: string[]) => {
    bcRef.current?.postMessage({ type: 'CUSTOM_WORDS_SYNC', payload: words });
    try {
      supabase.channel('live_events').send({
        type: 'broadcast',
        event: 'custom_words_sync',
        payload: { words, crewId: memberId }
      });
    } catch { }
  };

  const handleAddCustomWord = (wordToAdd: string) => {
    const word = wordToAdd.trim().toLowerCase();
    if (!word) return;
    if (!customWords.includes(word)) {
      const next = [...customWords, word];
      setCustomWords(next);
      localStorage.setItem('7h_custom_flagged_words', JSON.stringify(next));
      syncCustomWords(next);
    }
  };

  const handleRemoveCustomWord = (wordToRemove: string) => {
    const next = customWords.filter(w => w !== wordToRemove);
    setCustomWords(next);
    localStorage.setItem('7h_custom_flagged_words', JSON.stringify(next));
    syncCustomWords(next);
  };

  const addModAction = useCallback((action: string, user: string, reason?: string) => {
    setModLog(prev => [{ id: `mod-${Date.now()}`, action, user, time: Date.now(), reason }, ...prev.slice(0, 49)]);
  }, []);

  const handleWarn = useCallback((acc: FakeAccount) => {
    setWarnedUsers(s => new Set(s).add(acc.id));
    addModAction('⚠️ Warned', acc.displayName);
    setMessages(prev => [...prev, {
      id: `mod-warn-${Date.now()}`, account: null, text: `🛡️ ${acc.displayName} has been warned by a moderator.`,
      timestamp: Date.now(), isSystem: true,
    }]);
  }, [addModAction]);

  const handleMute = useCallback((acc: FakeAccount) => {
    setMutedUsers(s => new Set(s).add(acc.id));
    addModAction('🔇 Muted', acc.displayName);
    setMessages(prev => [...prev, {
      id: `mod-mute-${Date.now()}`, account: null, text: `🔇 ${acc.displayName} has been muted.`,
      timestamp: Date.now(), isSystem: true,
    }]);
  }, [addModAction]);

  const handleKick = useCallback((acc: FakeAccount) => {
    addModAction('👢 Kicked', acc.displayName);
    setMessages(prev => [...prev, {
      id: `mod-kick-${Date.now()}`, account: null, text: `👢 ${acc.displayName} was removed from the stream.`,
      timestamp: Date.now(), isSystem: true,
    }].filter(m => !m.account || m.account.id !== acc.id));
  }, [addModAction]);

  const handleBan = useCallback((acc: FakeAccount, reason?: string) => {
    setBannedUsers(s => new Set(s).add(acc.id));
    addModAction('🚫 Banned', acc.displayName, reason);
    setMessages(prev => [
      ...prev.filter(m => !m.account || m.account.id !== acc.id),
      { id: `mod-ban-${Date.now()}`, account: null, text: `🚫 ${acc.displayName} has been permanently banned.`, timestamp: Date.now(), isSystem: true },
    ]);
    setFlaggedMsgs(prev => prev.filter(f => f.msg.account?.id !== acc.id));
  }, [addModAction]);


  const handleDismissFlag = useCallback((msgId: string) => {
    setFlaggedMsgs(prev => prev.filter(f => f.msg.id !== msgId));
  }, []);

  const handleSpotlight = useCallback((acc: FakeAccount, text: string) => {
    if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
    setSpotlight({ account: acc, text });
    addModAction('📌 Spotlighted', acc.displayName);
    setMessages(prev => [...prev, {
      id: `spot-${Date.now()}`, account: null,
      text: `📌 ${acc.displayName}'s message was spotlighted on stream.`,
      timestamp: Date.now(), isSystem: true,
    }]);
    spotlightTimerRef.current = setTimeout(() => setSpotlight(null), 12000);
  }, [addModAction]);

  /* ── Merch drop countdown ── */
  useEffect(() => {
    if (!merchTimerActive || merchTimeLeft <= 0 || !activeMerchDrop) return;

    const targetEndTime = Date.now() + merchTimeLeft * 1000;

    const t = setInterval(() => {
      const remainingSeconds = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
      setMerchTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        setMerchTimerActive(false);
        setActiveMerchDrop(null);
        // Broadcast drop ended to the fan page
        if (adminMode) bcRef.current?.postMessage({ type: 'MERCH_DROP_END' });
        clearInterval(t);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [merchTimerActive, adminMode, activeMerchDrop]);

  const handleMerchDrop = useCallback((productId: string, duration: number) => {
    const product = MERCH_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    setMerchTimeLeft(duration);
    setMerchTimerActive(true);
    setActiveMerchDrop({ product, totalTime: duration });

    // Broadcast drop to the fan page tab
    bcRef.current?.postMessage({
      type: 'MERCH_DROP_START',
      payload: { product, totalTime: duration, timeLeft: duration },
    });

    // Hype chat message — also broadcast it
    const dropMsg: ChatMsg = {
      id: `merch-drop-${Date.now()}`,
      account: CREW_ACCOUNTS[0],
      text: `🛍 MERCH DROP LIVE NOW! ${product.emoji} ${product.name} — only ${product.price} while supplies last → shop.7thheavenband.com`,
      timestamp: Date.now(),
    };
    seenMsgIds.current.add(dropMsg.id);
    bcRef.current?.postMessage({ type: 'CHAT_MSG', payload: dropMsg });
    setMessages(prev => [...prev, dropMsg]);

    setHype(h => Math.min(100, h + 30));
    addModAction('🛍 Merch Drop', product.name, `${product.price} · ${Math.floor(duration / 60)}min timer`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addModAction]);

  /* ── Admin auto-inject: drop a new violation every ~18s while panel is open ── */
  useEffect(() => {
    if (!showAdminPanel) {
      if (adminAutoTimerRef.current) { clearInterval(adminAutoTimerRef.current); adminAutoTimerRef.current = null; }
      return;
    }
    // Also inject the pre-seeded violation messages into the live chat so Users tab shows them
    setMessages(prev => {
      const existingIds = new Set(prev.map(m => m.id));
      const toAdd = DEMO_VIOLATIONS.slice(0, 3)
        .map((v, i) => ({
          id: `seed-flag-${i}`,
          account: FAN_ACCOUNTS.find(a => a.id === v.fanId) ?? FAN_ACCOUNTS[i],
          text: v.text,
          timestamp: Date.now() - (3 - i) * 45000,
        }))
        .filter(m => !existingIds.has(m.id));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });

    adminAutoTimerRef.current = setInterval(() => {
      const idx = adminViolationIdxRef.current % DEMO_VIOLATIONS.length;
      adminViolationIdxRef.current++;
      const v = DEMO_VIOLATIONS[idx];
      const acc = FAN_ACCOUNTS.find(a => a.id === v.fanId) ?? FAN_ACCOUNTS[Math.floor(Math.random() * FAN_ACCOUNTS.length)];
      const newMsg: ChatMsg = { id: `auto-flag-${Date.now()}`, account: acc, text: v.text, timestamp: Date.now() };
      setFlaggedMsgs(prev => [...prev, { msg: newMsg, reason: v.reason }]);
      setMessages(prev => [...prev, newMsg]);
      setAdminTab('flagged');
    }, 18000);

    return () => { if (adminAutoTimerRef.current) { clearInterval(adminAutoTimerRef.current); adminAutoTimerRef.current = null; } };
  }, [showAdminPanel]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  /* ── Handle user message ── */
  // ── Pre-send content rules ──
  const CONTENT_RULES: { pattern: RegExp; reason: string }[] = [
    { pattern: /\b(maga|trump|biden|obama|tds|sleepy joe|sleeply joe|vote|republican|democrat|election|political|gop|dnc|roe v wade|abortion)\b/i, reason: '🚫 Political content isn\'t allowed in this chat.' },
    { pattern: /\b(nigger|nigga|faggot|kike|spic|chink|tranny|retard|cunt)\b/i, reason: '🚫 Hate speech isn\'t allowed here.' },
    { pattern: /\b(onlyfans|pornhub|xvideos|sex|nude|nsfw|xxx)\b/i, reason: '🔞 Adult content isn\'t allowed here.' },
    { pattern: /\b(follow me|check my (bio|link|profile)|discord\.gg|t\.me\/|bit\.ly|giveaway|free (nitro|robux|gift))\b/i, reason: '📢 Spam links or promotions aren\'t allowed.' },
    { pattern: /\b(shoot|kill|bomb|threat|die|stab|murder)\b/i, reason: '⚠️ Threatening language isn\'t allowed.' },
    { pattern: /(.)(\1{6,})/i, reason: '🤖 Repeated characters detected — slow down!' },
    { pattern: /(https?:\/\/(?!7thheavenband\.com))/i, reason: '🔗 External links aren\'t allowed in this chat.' },
  ];

  const handleSend = () => {
    const text = userMessage.trim();
    if (!text) return;

    // Run pre-send filter
    for (const rule of CONTENT_RULES) {
      if (rule.pattern.test(text)) {
        setBlockedReason(rule.reason);
        setTimeout(() => setBlockedReason(null), 3500);
        return; // block — don't clear the input so user can edit
      }
    }

    setUserMessage('');
    setShowEmojiPicker(false);
    setBlockedReason(null);

    const userAcc: FakeAccount = {
      id: 'user-you',
      displayName: 'You',
      role: 'fan',
      color: '#8b5cf6',
      avatar: 'YO',
      tier: '🥇 Gold',
    };

    const msg: ChatMsg = {
      id: `user-${Date.now()}`,
      account: userAcc,
      text,
      timestamp: Date.now(),
      isUser: true,
    };

    if (!seenMsgIds.current.has(msg.id)) {
      seenMsgIds.current.add(msg.id);
      bcRef.current?.postMessage({ type: 'CHAT_MSG', payload: msg });
    }

    setMessages(prev => {
      const next = [...prev, msg];
      return next.length > 80 ? next.slice(-80) : next;
    });
    setHype(h => Math.min(100, h + 5));
    inputRef.current?.focus();
  };

  /* ── Send reaction ── */
  const sendReaction = (emoji: string) => {
    const reactionInfo: FloatingEmoji = {
      id: `user-reaction-${Date.now()}`,
      emoji,
      x: 10 + Math.random() * 70,
      createdAt: Date.now(),
    };
    setFloating(prev => [...prev, reactionInfo]);
    setHype(h => Math.min(100, h + 3));
  };

  /* ── Hype color ── */
  const hypeColor = hype > 80 ? '#ef4444' : hype > 50 ? '#f97316' : hype > 25 ? '#eab308' : '#a855f7';

  return (
    <>
      <style>{`
        footer, .page-nav { display: none !important; }
        body { overflow: hidden !important; }

        @keyframes slideInMsg {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hypePulse {
          0%, 100% { box-shadow: 0 0 8px rgba(255,10,61,0.4); }
          50% { box-shadow: 0 0 20px rgba(239,68,68,0.6); }
        }
        .msg-new { animation: slideInMsg 0.25s ease forwards; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .hype-bar { animation: hypePulse 2s ease-in-out infinite; }
        @keyframes lowerThirdIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lower-third { animation: lowerThirdIn 0.35s ease forwards; }
      `}</style>

      {/* ── Going Live overlay ── */}
      {showOverlay && (
        <GoingLiveOverlay crew={crew} onComplete={() => {
          startTimeRef.current = Date.now();
          setShowOverlay(false);
        }} />
      )}


      {/* ── Main layout ── */}
      <section
        className="fixed bottom-0 left-0 right-0 top-[95px] z-40 flex flex-col overflow-hidden"
        style={{ background: '#ffffff' }}
      >

        {/* ── TOP BAR ── */}
        <div
          className="shrink-0 flex items-center justify-between gap-2 px-3 py-2"
          style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
        >
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/live"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                color: 'rgba(0,0,0,0.6)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Link>

            {/* Stream identity — updates with active cam */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs font-black shrink-0 transition-all duration-300"
                style={{ background: activeFeedCrew.gradient }}
              >{activeFeedCrew.avatar}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-black/90 text-sm font-bold truncate">{activeFeedCrew.name} — {activeFeedCrew.cameraLabel}</span>
                  <span
                    className="hidden sm:inline px-1.5 py-0.5 rounded text-xs font-black uppercase tracking-wider shrink-0"
                    style={{
                      background: `${activeFeedCrew.color}22`,
                      border: `1px solid ${activeFeedCrew.color}55`,
                      color: activeFeedCrew.color,
                    }}
                  >{activeFeedCrew.badge} CREW</span>
                </div>
                <p className="text-black/30 text-xs hidden sm:block">
                  7th Heaven · House of Blues, Chicago · {formatTime(elapsed)}
                </p>
              </div>
            </div>
          </div>

          {/* Right — crew member link + crew side button + demo badge */}
          <div className="shrink-0 flex items-center gap-2">
            <Link
              href={`/live/${activeFeedId === 'mike' ? 'michael' : activeFeedId}`}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: `${activeFeedCrew.color}18`,
                border: `1px solid ${activeFeedCrew.color}44`,
                color: activeFeedCrew.color,
                textDecoration: 'none',
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-black font-black shrink-0"
                style={{ background: activeFeedCrew.gradient, fontSize: 8 }}
              >
                {activeFeedCrew.avatar}
              </div>
              <span className="hidden sm:inline">{activeFeedCrew.name}</span>
              {flaggedMsgs.length > 0 && (
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-black font-black" style={{ background: '#ef4444', fontSize: 9 }}>
                  {flaggedMsgs.length}
                </span>
              )}
            </Link>

            {/* Crew side button — goes to this crew member's own admin dashboard */}
            <Link
              href={
                activeFeedId === 'mike' || activeFeedId === 'michael' ? '/crew-michael' :
                  activeFeedId === 'sammy' ? '/crew-sam' :
                    activeFeedId === 'ryan' ? '/crew-ryan' :
                      activeFeedId === 'tony' ? '/crew-tony' : '/crew'
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all hover:scale-105"
              style={{
                background: 'rgba(255,10,61,0.12)',
                border: '1px solid rgba(255,10,61,0.35)',
                color: '#c084fc',
                textDecoration: 'none',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="hidden sm:inline">Crew Side</span>
            </Link>

            <div
              className="shrink-0 flex items-center gap-2 px-3 py-1.5"
              style={{
                background: 'rgba(192, 132, 252,0.08)',
                border: '1px solid rgba(192, 132, 252,0.25)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#c084fc' }} />
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline" style={{ color: '#c084fc' }}>
                Demo Mode
              </span>
            </div>
          </div>
        </div>

        {/* ── CAM SWITCHER TABS ── */}
        <div
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 overflow-x-auto"
          style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
        >
          <span className="text-xs shrink-0 mr-1" style={{ color: 'rgba(0,0,0,0.4)' }}>CAM</span>
          {(['mike', 'sammy', 'ryan', 'tony'] as const).map(key => {
            const cfg = CREW_CONFIG[key];
            const feedSlug = key === 'mike' ? 'michael' : key;
            const isFeedLive = liveFeedStatuses[feedSlug] === 'true';
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveFeedId(key);
                  const feedSlug = key === 'mike' ? 'michael' : key;
                  if (pathname.startsWith('/live/live_')) {
                    router.push(`/live/live_${feedSlug}`);
                  } else if (pathname.startsWith('/live/')) {
                    router.push(`/live/${feedSlug}`);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0"
                style={{
                  background: activeFeedId === key ? `${cfg.color}22` : 'transparent',
                  border: activeFeedId === key ? `1px solid ${cfg.color}55` : '1px solid transparent',
                  color: activeFeedId === key ? cfg.color : 'rgba(0,0,0,0.5)',
                }}
              >
                <span>{cfg.badge}</span>
                <span>{cfg.name}</span>
                {isFeedLive && (
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_#dc2626]" style={{ background: '#dc2626' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── MAIN: video + chat ── */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

          {/* ── VIDEO PLAYER ── */}
          <div className="w-full lg:flex-1 relative aspect-video lg:aspect-auto shrink-0 max-h-[40vh] lg:max-h-none">
            {/* Canvas-based fake live camera feed — updates with cam switcher */}
            <div className="absolute inset-0">
              {crewIsLive ? (
                <LiveKitStream
                  room={`live_${activeFeedId === 'mike' ? 'michael' : activeFeedId}`}
                  username="fan"
                  isPublisher={false}
                />
              ) : (
                <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center border border-black/10">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/25">
                      <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="rgba(255,255,255,0.2)" />
                    </svg>
                  </div>
                  <h3 className="text-black/40 font-bold tracking-widest uppercase text-sm mb-1">Stream Offline</h3>
                  <p className="text-black/25 text-xs">Waiting for {activeFeedCrew.name} to go live...</p>
                </div>
              )}

              {/* Floating emojis */}
              {reactionsVisible && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                  {floating.map(item => (
                    <span
                      key={item.id}
                      className="absolute text-2xl animate-float-up"
                      style={{ left: `${item.x}%`, bottom: '8%', animationDuration: '2800ms' }}
                    >
                      {item.emoji}
                    </span>
                  ))}
                </div>
              )}

              {/* ── LIVE badge + viewer count ── */}
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-30 flex items-center gap-2">
                {crewIsLive ? (
                  <>
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-black text-xs font-bold uppercase tracking-wider animate-in fade-in"
                      style={{ background: '#dc2626', boxShadow: '0 0 12px rgba(220,38,38,0.5)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>

                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold animate-in fade-in"
                      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.85)' }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                      {viewerCount.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-black/50 text-xs font-bold uppercase tracking-wider"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    OFFLINE
                  </span>
                )}

                <button
                  onClick={() => setReactionsVisible(v => !v)}
                  className="hidden sm:flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    color: reactionsVisible ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {reactionsVisible ? 'Hide Reactions' : 'Show Reactions'}
                </button>
              </div>

              {/* ── Elapsed time ── */}
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-30">
                <div
                  className="px-2.5 py-1 rounded-full text-xs font-mono tracking-wider"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.8)' }}
                >
                  ⏱ {formatTime(elapsed)}
                </div>
              </div>




              {/* NOW PLAYING OVERLAY BADGE */}
              {(() => {
                const activeSong = setlist.find(s => s.isPlaying);
                if (!activeSong) return null;
                return (
                  <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 max-w-[calc(100%-2rem)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 text-black text-xs font-black uppercase tracking-wider border border-[var(--color-accent)]/30 shadow-[0_0_15px_rgba(255,10,61,0.3)]"
                      style={{
                        background: 'linear-gradient(135deg, rgba(88,28,135,0.8), rgba(255,10,61,0.4))',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping shrink-0" />
                      <span className=" text-[var(--color-accent)] shrink-0">Now Playing:</span>
                      <span className="text-black truncate font-bold">{activeSong.title}</span>
                      <span className=" text-[var(--color-accent)] shrink-0">🎵</span>
                    </div>
                  </div>
                );
              })()}

              {/* LIVE RAFFLE WIDGET */}
              {crewIsLive && raffleState && !raffleWidgetClosed && (() => {
                const isCurrentUserWinner = hasEnteredRaffle && !!member?.name &&
                  raffleState.winners?.some((w: any) => (w?.name || w)?.toLowerCase().trim() === member!.name.toLowerCase().trim());
                return (
                  <div className="absolute top-20 left-4 sm:left-auto sm:right-4 z-40 w-[calc(100%-2rem)] sm:w-full sm:max-w-xs animate-in slide-in-from-right-8 fade-in duration-500">
                    <div className="bg-gray-50/95 backdrop-blur-xl border-2 border-yellow-500/50 overflow-hidden shadow-[0_0_40px_rgba(234,179,8,0.3)] text-black relative flex flex-col px-4 py-5 pointer-events-auto">

                      <button
                        onClick={() => setRaffleWidgetClosed(true)}
                        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center bg-gray-50 hover:bg-white/15 text-black/40 hover:text-black rounded-full transition-colors z-10"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>

                      {raffleState.status === 'open' && (
                        <>
                          <div className="flex items-center gap-2 text-purple-300 mb-4 pr-6">
                            <span className="text-xl animate-pulse">🎰</span>
                            <span className="font-black text-sm uppercase tracking-widest leading-tight mt-1">Live Raffle</span>
                            <span className="ml-auto px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-xs font-bold uppercase tracking-widest animate-pulse">OPEN</span>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-black/40 uppercase tracking-widest">{Array.isArray(raffleState.entrants) ? raffleState.entrants.length : (raffleState.entrants || 0)} entered</span>
                              <span className="text-xs font-bold  text-[var(--color-accent)]/70 uppercase tracking-widest">{raffleState.minEntrants ?? 10} needed</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, ((Array.isArray(raffleState.entrants) ? raffleState.entrants.length : (raffleState.entrants || 0)) / (raffleState.minEntrants || 1)) * 100)}%` }} />
                            </div>
                          </div>

                          {raffleState.prizes[0]?.name && (
                            <div className="mb-4 px-3 py-2.5 bg-purple-500/10 border border-purple-500/20">
                              <p className="text-[var(--font-size-2xs)] font-bold  text-[var(--color-accent)]/60 uppercase tracking-[0.15em] mb-1">You could win</p>
                              <p className="text-yellow-300 font-black text-base leading-tight">
                                {raffleState.prizes[0].qty > 1 ? <span className="text-black bg-yellow-500/30 px-1.5 py-0.5 rounded text-xs mr-2">{raffleState.prizes[0].qty}x</span> : null}
                                {raffleState.prizes[0].name}
                              </p>
                              {raffleState.prizes.filter((p: any) => p.name).length > 1 && (
                                <p className=" text-[var(--color-accent)]/70 text-xs mt-1">+ {raffleState.prizes.filter((p: any) => p.name).length - 1} more prizes</p>
                              )}
                            </div>
                          )}

                          {!hasEnteredRaffle ? (
                            <button onClick={() => {
                              if (!isLoggedIn) { openModal('login'); return; }
                              setHasEnteredRaffle(true);
                              setRaffleWidgetClosed(false);
                              const fanName = member?.name || 'Fan';
                              localStorage.setItem('raffle_enter_sync', JSON.stringify({ fanName, email: member?.email || 'fan@7thheavenband.com', id: member?.id || 'unknown', crewId: memberId, ts: Date.now() }));
                              try { supabase.channel('live_events').send({ type: 'broadcast', event: 'raffle_enter', payload: { fanName, email: member?.email || 'fan@7thheavenband.com', fanId: member?.id || 'unknown', crewId: memberId } }); } catch { }
                              fetch('/api/email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  to: member?.email || 'fan@7thheavenband.com',
                                  subject: '🎟️ You are entered into the 7th Heaven Raffle!',
                                  html: `<div style="font-family:'Barlow',sans-serif;background:#000;color:#fff;padding:40px 20px;text-align:center;"><h1 style="color:#c084fc;">RAFFLE ENTRY CONFIRMED</h1><p>You entered the raffle for <strong>${raffleState?.prizes[0]?.name || 'the live drop'}</strong>.</p></div>`
                                })
                              }).catch(console.error);
                              try {
                                const inbox = JSON.parse(localStorage.getItem('vip_inbox_messages') || '[]');
                                inbox.unshift({ id: Date.now(), icon: '🎰', title: 'Raffle Entry Confirmed!', desc: `You've entered the live raffle. Stay tuned!`, time: 'Just now', isNew: true, color: 'yellow' });
                                localStorage.setItem('vip_inbox_messages', JSON.stringify(inbox));
                              } catch { }
                            }} className="w-full py-3 bg-[var(--color-purple-primary)] hover:bg-[var(--color-purple-hover)] text-white font-black text-sm uppercase tracking-[0.15em] transition-colors shadow-[0_0_15px_var(--color-purple-glow)]">
                              Enter Raffle
                            </button>
                          ) : (
                            <div className="w-full py-3 bg-[var(--color-purple-glow)] text-[var(--color-purple-light)] border border-[var(--color-border-purple)] text-center font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                              You're Entered!
                            </div>
                          )}
                        </>
                      )}

                      {raffleState.status === 'countdown' && (
                        <div className="py-8 text-center flex flex-col items-center gap-3">
                          <span className="text-4xl">🎟️</span>
                          <p className="text-yellow-300 font-black text-sm uppercase tracking-wider">Drawing Coming Up!</p>
                          <p className="text-black/40 text-xs">{Array.isArray(raffleState.entrants) ? raffleState.entrants.length : (raffleState.entrants || 0)} entries locked in</p>
                          {hasEnteredRaffle && (
                            <div className="mt-1 px-4 py-2 bg-purple-500/10 border border-purple-500/20">
                              <p className="text-purple-300 text-xs font-bold">✓ You're in the drawing!</p>
                            </div>
                          )}
                        </div>
                      )}

                      {raffleState.status === 'drawing' && (
                        <div className="py-8 text-center flex flex-col items-center justify-center">
                          <div className="text-5xl animate-spin mb-4">🎰</div>
                          <p className="text-purple-300 font-black text-sm uppercase tracking-widest animate-pulse">Drawing Winner...</p>
                        </div>
                      )}

                      {raffleState.status === 'complete' && (
                        <div className="py-2">
                          <div className="flex items-center gap-2 text-purple-300 mb-4 pr-6">
                            <span className="text-xl">🏆</span>
                            <span className="font-black text-sm uppercase tracking-widest">Raffle Winner</span>
                          </div>
                          <div className="space-y-2">
                            {raffleState.winners.map((wObj: any, i: number) => {
                              const w = wObj?.name || wObj;
                              const isMine = isCurrentUserWinner && i === 0;
                              return (
                                <div key={i} className={` overflow-hidden border ${isMine ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'border-black/10'}`}>
                                  <div className={`px-3 py-1 text-[var(--font-size-2xs)] font-black uppercase tracking-[0.2em] text-center ${isMine ? 'bg-purple-600 text-white' : 'bg-gray-50 text-black/30'}`}>
                                    {i === 0 ? '1st Place' : i === 1 ? '2nd Place' : '3rd Place'}{raffleState.prizes[i]?.name ? ` · ${raffleState.prizes[i].name}` : ''}
                                  </div>
                                  <div className={`px-4 py-3 text-center ${isMine ? 'bg-purple-500/10' : ''}`}>
                                    <p className={`font-black text-xl leading-tight ${isMine ? 'text-purple-300' : 'text-black'}`}>{w}</p>
                                    {isMine && (
                                      <button onClick={() => setShowClaimModal(true)}
                                        className="mt-2 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-colors">
                                        Claim Reward
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-4 p-3 bg-gray-50 border border-black/10 text-center">
                            <p className="text-xs text-black/70 leading-relaxed font-semibold">
                              <span className="text-purple-300 font-bold uppercase tracking-widest text-xs block mb-1">How to Claim</span>
                              Winners: Check your <strong className="text-black font-bold">Email</strong> or your <strong className="text-black font-bold">Fan Profile Dashboard</strong> for your unique Verification PIN. Show your PIN to the crew at the merch table!
                            </p>
                          </div>

                          {nextRaffleCountdown !== null && nextRaffleCountdown > 0 && (
                            <div className="mt-5 pt-5 border-t border-black/10 text-center px-4 relative">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                              <p className="text-xs text-black/40 uppercase tracking-[0.2em] font-bold mb-2">Next Raffle Drawing In</p>
                              <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded border border-black/10 shadow-inner">
                                <span className="text-[var(--font-size-3xs)] animate-pulse">⏳</span>
                                <span className="text-lg font-mono font-black tracking-widest text-emerald-500">
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

              {/* ── Merch Drop Live Banner ── */}
              {merchTimerActive && activeMerchDrop && merchTimeLeft > 0 && (() => {
                const pct = activeMerchDrop.totalTime > 0 ? (activeMerchDrop.totalTime - merchTimeLeft) / activeMerchDrop.totalTime : 0;
                return (
                  <div
                    className="absolute bottom-16 left-3 right-3 z-30"
                    style={{ animation: 'lowerThirdIn 0.4s ease forwards' }}
                  >
                    <div
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        background: 'rgba(0,0,0,0.88)',
                        backdropFilter: 'blur(16px)',
                        border: `1px solid ${activeMerchDrop.product.color}55`,
                        boxShadow: `0 0 30px ${activeMerchDrop.product.color}22`,
                      }}
                    >
                      {/* Product emoji */}
                      <div
                        className="w-12 h-12 flex items-center justify-center text-2xl shrink-0"
                        style={{ background: `${activeMerchDrop.product.color}22`, border: `1px solid ${activeMerchDrop.product.color}44` }}
                      >
                        {activeMerchDrop.product.emoji}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className="text-xs font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                            style={{ background: `${activeMerchDrop.product.color}33`, color: activeMerchDrop.product.color, fontSize: 9 }}
                          >
                            🛍 LIVE DROP
                          </span>
                          <span
                            className="text-xs font-black px-1.5 py-0.5 rounded-full uppercase"
                            style={{ background: 'rgba(192, 132, 252,0.2)', color: '#c084fc', fontSize: 9 }}
                          >
                            {activeMerchDrop.product.badge}
                          </span>
                        </div>
                        <p className="text-black text-sm font-black leading-tight truncate">{activeMerchDrop.product.name}</p>
                        <p className="text-xs" style={{ color: activeMerchDrop.product.color }}>Only {activeMerchDrop.product.stock} left · shop.7thheavenband.com</p>
                      </div>
                      {/* Price + countdown + action button */}
                      <div className="shrink-0 flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xl font-black" style={{ color: activeMerchDrop.product.color }}>{activeMerchDrop.product.price}</p>
                          <p className="text-xs font-black tabular-nums" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {String(Math.floor(merchTimeLeft / 60)).padStart(2, '0')}:{String(merchTimeLeft % 60).padStart(2, '0')}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setCheckoutStep('form');
                            // Reset size/color based on product type
                            const pName = activeMerchDrop.product.name.toLowerCase();
                            const isClo = pName.includes('shirt') || pName.includes('tee') || pName.includes('hood') || pName.includes('sweat') || pName.includes('jersey') || pName.includes('jacket') || pName.includes('tank') || pName.includes('hat') || pName.includes('cap');
                            if (isClo) {
                              setCheckoutSelectedSize(prev => prev || 'L');
                              setCheckoutSelectedColor(prev => prev || 'Black');
                            } else {
                              setCheckoutSelectedSize('');
                              setCheckoutSelectedColor('');
                            }
                            setShowCheckoutModal(true);
                          }}
                          style={{
                            background: activeMerchDrop.product.color,
                            boxShadow: `0 0 15px ${activeMerchDrop.product.color}88`
                          }}
                          className="px-3.5 py-1.5 text-black font-black text-[var(--font-size-3xs)] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer border-none shrink-0"
                        >
                          BUY NOW
                        </button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(1 - pct) * 100}%`, background: activeMerchDrop.product.color, opacity: 0.7 }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* ── Fan Spotlight Lower-Third ── */}
              {spotlight && (
                <div
                  className="lower-third absolute bottom-14 left-3 right-3 z-30 flex items-center gap-3 px-4 py-3"
                  style={{
                    background: 'rgba(0,0,0,0.82)',
                    backdropFilter: 'blur(14px)',
                    border: `1px solid ${spotlight.account.color}55`,
                    boxShadow: `0 0 24px ${spotlight.account.color}18`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-black font-black text-sm shrink-0"
                    style={{ background: spotlight.account.color }}
                  >
                    {spotlight.account.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-black" style={{ color: spotlight.account.color }}>{spotlight.account.displayName}</span>
                      {spotlight.account.tier && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{spotlight.account.tier}</span>}
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,10,61,0.2)', color: '#c084fc', fontSize: 9 }}>📌 SPOTLIGHT</span>
                    </div>
                    <p className="text-black/80 text-sm leading-snug" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>&#8220;{spotlight.text}&#8221;</p>
                  </div>
                  <button
                    onClick={() => setSpotlight(null)}
                    className="text-black/30 hover:text-black/70 transition-colors shrink-0 text-sm"
                  >✕</button>
                </div>
              )}

              {/* Hype burst overlay */}
              {hypeBurst && (
                <div className="absolute inset-0 z-25 pointer-events-none" style={{
                  background: 'radial-gradient(circle at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
                  animation: 'hypePulse 0.5s ease-in-out',
                }} />
              )}
            </div>
          </div>

          {/* ── CHAT PANEL / ADMIN PANEL ── */}
          {showAdminPanel ? (
            /* ─────────────── ADMIN DASHBOARD ─────────────── */
            <div
              className="w-full lg:w-[440px] xl:w-[500px] flex-1 lg:flex-none flex flex-col min-h-0 overflow-hidden"
              style={{ background: '#ffffff', borderLeft: '1px solid rgba(239,68,68,0.2)' }}
            >
              {/* Admin header */}
              <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.05)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    <span className="text-sm font-black uppercase tracking-wider" style={{ color: '#f87171' }}>Moderation Dashboard</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <span>👁 {viewerCount.toLocaleString()}</span>
                    <span style={{ color: bannedUsers.size > 0 ? '#f87171' : 'rgba(255,255,255,0.3)' }}>🚫 {bannedUsers.size}</span>
                    <span style={{ color: mutedUsers.size > 0 ? '#c084fc' : 'rgba(255,255,255,0.3)' }}>🔇 {mutedUsers.size}</span>
                  </div>
                </div>
                {/* Tabs */}
                <div className="flex gap-1 flex-wrap">
                  {(['live', 'flagged', 'merch', 'users', 'log', 'policy', 'stats'] as const).map(tab => (
                    <button key={tab} onClick={() => setAdminTab(tab as typeof adminTab)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                      style={{
                        background: adminTab === tab
                          ? tab === 'live' ? 'rgba(34,197,94,0.18)'
                            : tab === 'flagged' ? 'rgba(239,68,68,0.2)'
                              : tab === 'merch' ? 'rgba(192, 132, 252,0.18)'
                                : tab === 'stats' ? 'rgba(16,185,129,0.15)'
                                  : 'rgba(255,10,61,0.15)'
                          : 'rgba(255,255,255,0.04)',
                        color: adminTab === tab
                          ? tab === 'live' ? '#4ade80'
                            : tab === 'flagged' ? '#f87171'
                              : tab === 'merch' ? '#c084fc'
                                : tab === 'stats' ? '#34d399'
                                  : '#c084fc'
                          : 'rgba(255,255,255,0.35)',
                        border: adminTab === tab
                          ? tab === 'live' ? '1px solid rgba(34,197,94,0.35)'
                            : tab === 'flagged' ? '1px solid rgba(239,68,68,0.3)'
                              : tab === 'merch' ? '1px solid rgba(192, 132, 252,0.35)'
                                : tab === 'stats' ? '1px solid rgba(16,185,129,0.3)'
                                  : '1px solid rgba(255,10,61,0.25)'
                          : '1px solid transparent',
                      }}
                    >
                      {tab === 'live' && `💬 Live${messages.filter(m => !m.isSystem).length > 0 ? ` (${messages.filter(m => !m.isSystem).length})` : ''}`}
                      {tab === 'flagged' && `🚨 Flagged${flaggedMsgs.length > 0 ? ` (${flaggedMsgs.length})` : ''}`}
                      {tab === 'merch' && `🛍 Merch${merchTimerActive ? ' ●' : ''}`}
                      {tab === 'users' && '👥 Users'}
                      {tab === 'log' && '📋 Log'}
                      {tab === 'policy' && '📜 Policy'}
                      {tab === 'stats' && '📊 Stats'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div data-lenis-prevent className="flex-1 overflow-y-scroll" style={{ minHeight: 0 }}>

                {/* ── LIVE FEED TAB ── */}
                {adminTab === 'live' && (
                  <div className="flex flex-col h-full">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-4xl mb-3">💬</span>
                        <p className="text-black/30 text-xs uppercase tracking-widest">Waiting for messages...</p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-0.5">
                        {messages.map((msg, i) => {
                          const isFlagged = flaggedMsgs.some(f => f.msg.id === msg.id);
                          const isBanned = msg.account ? bannedUsers.has(msg.account.id) : false;
                          const isMuted = msg.account ? mutedUsers.has(msg.account.id) : false;
                          return (
                            <div
                              key={msg.id}
                              className="group flex items-start gap-2.5 px-3 py-2 mb-2 transition-all shadow-2xs"
                              style={{
                                background: isFlagged ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.04)',
                                border: isFlagged ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(0,0,0,0.08)',
                                opacity: isBanned ? 0.4 : 1,
                                animationName: i === messages.length - 1 ? 'slideInMsg' : 'none',
                                animationDuration: '0.25s',
                                animationFillMode: 'forwards',
                              }}
                            >
                              {msg.isSystem ? (
                                <p className="w-full text-center text-xs py-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{msg.text}</p>
                              ) : (
                                <>
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-black font-black shrink-0 mt-0.5"
                                    style={{ background: msg.account?.color ?? '#555', fontSize: 9 }}
                                  >
                                    {msg.account?.avatar}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-black" style={{ color: msg.account?.color ?? '#888' }}>{msg.account?.displayName}</span>
                                      {msg.account?.tier && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>{msg.account.tier}</span>}
                                      {isFlagged && <span className="text-xs px-1 rounded" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: 9 }}>🚨 FLAGGED</span>}
                                      {isBanned && <span className="text-xs px-1 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 9 }}>BANNED</span>}
                                      {isMuted && <span className="text-xs px-1 rounded" style={{ background: 'rgba(156,163,175,0.15)', color: '#9ca3af', fontSize: 9 }}>MUTED</span>}
                                    </div>
                                    <div className="mt-1 inline-block px-2.5 py-1.5 rounded-tl-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                      <p className="text-xs leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>{msg.text}</p>
                                    </div>
                                  </div>
                                  {/* Quick-action buttons on hover */}
                                  {msg.account && !isBanned && (
                                    <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => msg.account && handleSpotlight(msg.account, msg.text)} title="Spotlight" className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-[var(--color-accent)]/20 transition-colors">📌</button>
                                      {!isMuted && <button onClick={() => msg.account && handleMute(msg.account)} title="Mute" className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-gray-500/20 transition-colors">🔇</button>}
                                      <button onClick={() => msg.account && handleBan(msg.account)} title="Ban" className="w-6 h-6 rounded flex items-center justify-center text-xs hover:bg-red-500/20 transition-colors">🚫</button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>
                )}

                {/* ── FLAGGED MESSAGES TAB ── */}
                {adminTab === 'flagged' && (
                  <div className="p-3 space-y-2">
                    {flaggedMsgs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-4xl mb-3">✅</span>
                        <p className="text-black/30 text-xs uppercase tracking-widest">No flagged messages</p>
                        <p className="text-black/15 text-xs mt-1">Chat is clean — use the Demo buttons below to test</p>
                      </div>
                    ) : flaggedMsgs.map(({ msg, reason }) => (
                      <div key={msg.id} className="p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <div className="mb-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-black font-black" style={{ background: msg.account?.color ?? '#555', fontSize: 8 }}>
                              {msg.account?.avatar}
                            </div>
                            <span className="text-xs font-bold" style={{ color: msg.account?.color ?? '#888' }}>{msg.account?.displayName}</span>
                            {msg.account?.tier && <span className="text-xs opacity-40">{msg.account.tier}</span>}
                          </div>
                          <p className="text-black/70 text-xs leading-snug italic">&ldquo;{msg.text}&rdquo;</p>
                          <span className="text-xs mt-1.5 inline-block px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', fontSize: 10 }}>
                            {reason}
                          </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          {msg.account && !warnedUsers.has(msg.account.id) && (
                            <button onClick={() => msg.account && handleWarn(msg.account)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{ background: 'rgba(192, 132, 252,0.15)', border: '1px solid rgba(192, 132, 252,0.3)', color: '#c084fc' }}>
                              ⚠️ Warn
                            </button>
                          )}
                          {msg.account && !mutedUsers.has(msg.account.id) && (
                            <button onClick={() => msg.account && handleMute(msg.account)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{ background: 'rgba(156,163,175,0.1)', border: '1px solid rgba(156,163,175,0.2)', color: '#9ca3af' }}>
                              🔇 Mute
                            </button>
                          )}
                          {msg.account && (
                            <button onClick={() => msg.account && handleKick(msg.account)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#fb923c' }}>
                              👢 Kick
                            </button>
                          )}
                          {msg.account && !bannedUsers.has(msg.account.id) && (
                            <button onClick={() => msg.account && handleBan(msg.account, reason)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
                              🚫 Ban
                            </button>
                          )}
                          <button onClick={() => handleDismissFlag(msg.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105 ml-auto"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
                            ✓ Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}


                {/* ── USERS TAB ── */}
                {adminTab === 'users' && (
                  <div className="p-3 space-y-1.5">
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>Active in chat — click to moderate</p>
                    {FAN_ACCOUNTS.map(acc => {
                      const isBanned = bannedUsers.has(acc.id);
                      const isMuted = mutedUsers.has(acc.id);
                      const isWarned = warnedUsers.has(acc.id);
                      const msgCount = messages.filter(m => m.account?.id === acc.id).length;
                      if (msgCount === 0 && !isBanned && !isMuted && !isWarned) return null;
                      const lastMsg = messages.filter(m => m.account?.id === acc.id && !m.isSystem).slice(-1)[0];
                      return (
                        <div key={acc.id} className="p-3"
                          style={{
                            background: isBanned ? 'rgba(239,68,68,0.06)' : isMuted ? 'rgba(156,163,175,0.05)' : 'rgba(255,255,255,0.03)',
                            border: isBanned ? '1px solid rgba(239,68,68,0.2)' : isMuted ? '1px solid rgba(156,163,175,0.12)' : '1px solid rgba(255,255,255,0.06)',
                            opacity: isBanned ? 0.65 : 1,
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-black font-black shrink-0" style={{ background: acc.color, fontSize: 10 }}>
                                {acc.avatar}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold" style={{ color: acc.color }}>{acc.displayName}</span>
                                  {acc.tier && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>{acc.tier}</span>}
                                  {isBanned && <span className="px-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: 9 }}>BANNED</span>}
                                  {isMuted && !isBanned && <span className="px-1.5 rounded-full" style={{ background: 'rgba(156,163,175,0.15)', color: '#9ca3af', fontSize: 9 }}>MUTED</span>}
                                  {isWarned && !isBanned && <span className="px-1.5 rounded-full" style={{ background: 'rgba(192, 132, 252,0.15)', color: '#c084fc', fontSize: 9 }}>WARNED</span>}
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>{msgCount} message{msgCount !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            {!isBanned && (
                              <div className="flex items-center gap-1 shrink-0">
                                {!isWarned && <button onClick={() => handleWarn(acc)} title="Warn" className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110" style={{ background: 'rgba(192, 132, 252,0.1)' }}>⚠️</button>}
                                {!isMuted && <button onClick={() => handleMute(acc)} title="Mute" className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110" style={{ background: 'rgba(156,163,175,0.08)' }}>🔇</button>}
                                <button onClick={() => handleKick(acc)} title="Kick" className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110" style={{ background: 'rgba(249,115,22,0.1)' }}>👢</button>
                                <button onClick={() => handleBan(acc)} title="Ban" className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110" style={{ background: 'rgba(239,68,68,0.12)' }}>🚫</button>
                                {lastMsg && <button onClick={() => handleSpotlight(acc, lastMsg.text)} title="Spotlight" className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110" style={{ background: 'rgba(255,10,61,0.12)' }}>📌</button>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {FAN_ACCOUNTS.every(acc => messages.filter(m => m.account?.id === acc.id).length === 0) && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-4xl mb-3">👥</span>
                        <p className="text-black/30 text-xs uppercase tracking-widest">Waiting for chat activity...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── MOD LOG TAB ── */}
                {adminTab === 'log' && (
                  <div className="p-3 space-y-1">
                    {modLog.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-4xl mb-3">📋</span>
                        <p className="text-black/30 text-xs uppercase tracking-widest">No actions taken yet</p>
                      </div>
                    ) : modLog.map(entry => (
                      <div key={entry.id} className="flex items-start gap-2 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span className="text-base shrink-0">{entry.action.split(' ')[0]}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-black/70">{entry.action} — <span style={{ color: '#c084fc' }}>{entry.user}</span></p>
                          {entry.reason && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{entry.reason}</p>}
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{new Date(entry.time).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── POLICY TAB ── */}
                {adminTab === 'policy' && (
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#f87171' }}>🚫 Zero-Tolerance — Instant Ban</p>
                      {[
                        { icon: '🔞', rule: 'Adult / pornographic content', desc: 'Any explicit sexual content, NSFW images, or adult platform links (e.g. OnlyFans).' },
                        { icon: '⚠️', rule: 'Hate speech & slurs', desc: 'Racist, homophobic, antisemitic, or discriminatory language of any kind.' },
                        { icon: '🚨', rule: 'Threats & violence', desc: 'Threats toward any person, band members, venue staff, or other fans.' },
                      ].map(({ icon, rule, desc }) => (
                        <div key={rule} className="mb-2 p-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
                          <p className="text-xs font-bold text-black/80">{icon} {rule}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#c084fc' }}>⚠️ Warn First — Then Mute / Kick</p>
                      {[
                        { icon: '🏛️', rule: 'Political commentary', desc: 'No political debate, party references, campaign talk, or electoral content.' },
                        { icon: '📢', rule: 'Spam & self-promotion', desc: 'Posting links, social handles, cashapp/venmo tags, or soliciting followers.' },
                        { icon: '🔄', rule: 'Excessive repetition', desc: 'Flooding the chat with the same message, phrase, or emoji spam.' },
                        { icon: '💊', rule: 'Drug / substance references', desc: 'Discussion of illegal substances or encouraging drug use during the event.' },
                      ].map(({ icon, rule, desc }) => (
                        <div key={rule} className="mb-2 p-3" style={{ background: 'rgba(192, 132, 252,0.06)', border: '1px solid rgba(192, 132, 252,0.15)' }}>
                          <p className="text-xs font-bold text-black/80">{icon} {rule}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3" style={{ background: 'rgba(255,10,61,0.08)', border: '1px solid rgba(255,10,61,0.2)' }}>
                      <p className="text-xs font-black text-black/60 uppercase tracking-widest mb-1">✅ Keep It Positive</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>This is a fan space for music lovers. Keep the energy high, support the artists, and spread love. 🎸</p>
                    </div>

                    {/* CUSTOM FLAGGED WORDS MANAGER */}
                    <div className="pt-4 border-t border-black/10 space-y-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--color-accent-pink)]">🔍 Custom Flagged Keywords</p>
                        <p className="text-black/40 text-[var(--font-size-2xs)] mt-0.5 leading-relaxed">
                          Add specific keywords or phrases. Any message containing these (case-insensitive) will be flagged for review.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCustomWord}
                          onChange={e => setNewCustomWord(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomWord(newCustomWord);
                              setNewCustomWord('');
                            }
                          }}
                          placeholder="e.g. ticket-scalper"
                          className="flex-1 bg-white border border-black/10 rounded-lg px-3 py-1.5 text-xs text-black outline-none focus:border-[#ec4899]/50 font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleAddCustomWord(newCustomWord);
                            setNewCustomWord('');
                          }}
                          className="px-4 py-1.5 bg-[var(--color-accent-pink)]/20 hover:bg-[var(--color-accent-pink)]/30 border border-[#ec4899]/30 hover:border-[#ec4899]/50 text-[var(--color-accent-pink)] font-bold text-xs rounded-lg transition-all"
                        >
                          Add
                        </button>
                      </div>

                      {customWords.length === 0 ? (
                        <p className="text-black/25 text-[var(--font-size-2xs)] italic text-center py-2">No custom keywords added yet.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                          {customWords.map(word => (
                            <span
                              key={word}
                              className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-gray-50 border border-black/10 rounded-lg text-[var(--font-size-2xs)] font-bold text-black/80"
                            >
                              <span>{word}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomWord(word)}
                                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-100 text-black/30 hover:text-black transition-colors"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STATS TAB ── */}
                {adminTab === 'stats' && (
                  <div className="p-3 space-y-3">
                    <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Feed performance — tonight&#39;s show</p>
                    {Object.entries(FEED_STATS).map(([key, s]) => {
                      const maxPeak = Math.max(...Object.values(FEED_STATS).map(f => f.peakViewers));
                      const barW = Math.round((s.peakViewers / maxPeak) * 100);
                      const isTop = s.peakViewers === maxPeak;
                      return (
                        <div key={key} className="p-3"
                          style={{
                            background: isTop ? `${s.color}0d` : 'rgba(255,255,255,0.03)',
                            border: isTop ? `1px solid ${s.color}33` : '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span>{s.badge}</span>
                              <span className="text-xs font-bold" style={{ color: isTop ? s.color : 'rgba(255,255,255,0.7)' }}>{s.label}</span>
                              {isTop && <span className="text-xs px-1.5 py-0.5 rounded-full font-black" style={{ background: `${s.color}22`, color: s.color, fontSize: 9 }}>🏆 TOP</span>}
                            </div>
                            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.duration}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }} className="uppercase tracking-widest mb-0.5">Peak</p>
                              <p className="text-sm font-black" style={{ color: s.color }}>{s.peakViewers.toLocaleString()}</p>
                            </div>
                            <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }} className="uppercase tracking-widest mb-0.5">Avg</p>
                              <p className="text-sm font-black text-black/70">{s.avgViewers.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <div className="h-full rounded-full" style={{ width: `${barW}%`, background: s.color, opacity: 0.7 }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Session Summary</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Total Views', val: Object.values(FEED_STATS).reduce((a, b) => a + b.peakViewers, 0).toLocaleString() },
                          { label: 'Mod Actions', val: modLog.length.toString() },
                          { label: 'Chat Msgs', val: messages.filter(m => !m.isSystem).length.toString() },
                        ].map(({ label, val }) => (
                          <div key={label} className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <p className="text-sm font-black text-black/80">{val}</p>
                            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }} className="uppercase tracking-widest mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MERCH DROP TAB ── */}
                {adminTab === 'merch' && (
                  <div className="p-3 space-y-4">

                    {/* Active drop status */}
                    {merchTimerActive && activeMerchDrop ? (
                      <div
                        className="p-4"
                        style={{
                          background: `${activeMerchDrop.product.color}12`,
                          border: `1px solid ${activeMerchDrop.product.color}44`,
                          boxShadow: `0 0 20px ${activeMerchDrop.product.color}12`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
                          <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#4ade80' }}>Drop Live Now</span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-14 h-14 flex items-center justify-center text-3xl shrink-0"
                            style={{ background: `${activeMerchDrop.product.color}22`, border: `1px solid ${activeMerchDrop.product.color}44` }}
                          >
                            {activeMerchDrop.product.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-black font-black text-sm leading-tight">{activeMerchDrop.product.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: activeMerchDrop.product.color }}>{activeMerchDrop.product.price} · {activeMerchDrop.product.stock} in stock</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-black" style={{ background: `${activeMerchDrop.product.color}22`, color: activeMerchDrop.product.color, fontSize: 9 }}>
                                {activeMerchDrop.product.badge}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-2xl font-black tabular-nums" style={{ color: activeMerchDrop.product.color }}>
                              {String(Math.floor(merchTimeLeft / 60)).padStart(2, '0')}:{String(merchTimeLeft % 60).padStart(2, '0')}
                            </p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>remaining</p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${activeMerchDrop.totalTime > 0 ? ((activeMerchDrop.totalTime - merchTimeLeft) / activeMerchDrop.totalTime) * 100 : 0}%`,
                              background: `linear-gradient(90deg, ${activeMerchDrop.product.color}, ${activeMerchDrop.product.color}88)`,
                            }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            setMerchTimerActive(false);
                            setActiveMerchDrop(null);
                            setMerchTimeLeft(0);
                            bcRef.current?.postMessage({ type: 'MERCH_DROP_END' });
                            addModAction('🛍 Drop Ended', activeMerchDrop.product.name);
                          }}
                          className="w-full py-2 text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02]"
                          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                        >
                          ⏹ End Drop Early
                        </button>
                      </div>
                    ) : (
                      <div className="p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>No active drop — launch one below</p>
                      </div>
                    )}

                    {/* Product picker */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Select Product</p>
                      <div className="grid grid-cols-2 gap-2">
                        {MERCH_PRODUCTS.map(product => {
                          const isSelected = merchSelectedProduct === product.id;
                          return (
                            <button
                              key={product.id}
                              onClick={() => setMerchSelectedProduct(product.id)}
                              className="p-3 text-left transition-all hover:scale-[1.02]"
                              style={{
                                background: isSelected ? `${product.color}18` : 'rgba(255,255,255,0.03)',
                                border: isSelected ? `1px solid ${product.color}55` : '1px solid rgba(255,255,255,0.07)',
                                boxShadow: isSelected ? `0 0 12px ${product.color}18` : 'none',
                              }}
                            >
                              <div className="text-2xl mb-1.5">{product.emoji}</div>
                              <p className="text-xs font-black text-black/80 leading-tight mb-0.5">{product.name}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-black" style={{ color: product.color }}>{product.price}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${product.color}22`, color: product.color, fontSize: 8 }}>
                                  {product.badge}
                                </span>
                              </div>
                              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>{product.stock} left</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Duration picker */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Drop Duration</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {MERCH_DURATIONS.map(d => (
                          <button
                            key={d.seconds}
                            onClick={() => setMerchSelectedDuration(d.seconds)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            style={{
                              background: merchSelectedDuration === d.seconds ? 'rgba(192, 132, 252,0.18)' : 'rgba(255,255,255,0.04)',
                              border: merchSelectedDuration === d.seconds ? '1px solid rgba(192, 132, 252,0.45)' : '1px solid rgba(255,255,255,0.08)',
                              color: merchSelectedDuration === d.seconds ? '#c084fc' : 'rgba(255,255,255,0.4)',
                            }}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleMerchDrop(merchSelectedProduct, merchSelectedDuration)}
                        disabled={merchTimerActive}
                        className="w-full py-3 text-sm font-black uppercase tracking-wider transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: 'linear-gradient(135deg, rgba(192, 132, 252,0.25), rgba(249,115,22,0.2))',
                          border: '1px solid rgba(192, 132, 252,0.5)',
                          color: '#c084fc',
                          boxShadow: '0 0 20px rgba(192, 132, 252,0.15)',
                        }}
                      >
                        🛍 Start Drop with Timer
                      </button>
                      <button
                        onClick={() => handleMerchDrop(merchSelectedProduct, 0)}
                        disabled={merchTimerActive}
                        className="w-full py-2.5 text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: 'rgba(255,10,61,0.12)',
                          border: '1px solid rgba(255,10,61,0.3)',
                          color: '#c084fc',
                        }}
                      >
                        ⚡ Drop Now (No Timer)
                      </button>
                    </div>

                    {/* Past drops from log */}
                    {modLog.filter(e => e.action === '🛍 Merch Drop').length > 0 && (
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>Drop History</p>
                        <div className="space-y-1">
                          {modLog.filter(e => e.action === '🛍 Merch Drop').map(e => (
                            <div key={e.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                              <span className="text-xs text-black/60 font-bold">{e.user}</span>
                              <div className="flex items-center gap-2">
                                {e.reason && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{e.reason}</span>}
                                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{new Date(e.time).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Demo inject bar */}
              <div className="shrink-0 px-3 py-3" style={{ borderTop: '1px solid rgba(239,68,68,0.12)', background: 'rgba(239,68,68,0.03)' }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>🎭 Demo: inject a flagged message</p>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { label: '🔞 NSFW', text: 'check my onlyfans.com profile lol' },
                    { label: '🏛️ Politics', text: 'MAGA forever! vote republican 2024!' },
                    { label: '📢 Spam', text: 'follow me @myhandle for giveaway' },
                    { label: '🚨 Threat', text: 'gonna shoot up this whole venue lol' },
                  ].map(({ label, text }) => (
                    <button key={label}
                      onClick={() => {
                        const demoAcc = FAN_ACCOUNTS[Math.floor(Math.random() * FAN_ACCOUNTS.length)];
                        setMessages(prev => [...prev, {
                          id: `demo-flag-${Date.now()}`,
                          account: demoAcc,
                          text,
                          timestamp: Date.now(),
                        }]);
                        setAdminTab('flagged');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {/* Quick merch shortcut */}
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => setAdminTab('merch')}
                    className="w-full px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{ background: 'rgba(192, 132, 252,0.08)', border: '1px solid rgba(192, 132, 252,0.2)', color: '#c084fc' }}
                  >
                    🛍 Go to Merch Drop Tab
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ─────────────── NORMAL CHAT PANEL ─────────────── */
            <div
              className="w-full lg:w-[360px] xl:w-[400px] flex-1 lg:flex-none flex flex-col min-h-0 overflow-hidden"
              style={{
                background: '#ffffff',
                borderLeft: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              {/* Chat header with Tab toggling */}
              <div
                className="shrink-0 flex flex-col px-4 pt-3 pb-2"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveSidebarTab('chat')}
                      className={`text-sm font-black uppercase tracking-wider transition-colors ${activeSidebarTab === 'chat' ? 'text-black' : 'text-black/40 hover:text-black/70'}`}
                    >
                      💬 Chat
                    </button>
                    <button
                      onClick={() => setActiveSidebarTab('setlist')}
                      className={`text-sm font-black uppercase tracking-wider transition-colors ${activeSidebarTab === 'setlist' ? 'text-black' : 'text-black/40 hover:text-black/70'}`}
                    >
                      🎵 Setlist
                    </button>
                  </div>

                  {/* Mini crew list */}
                  <div className="flex items-center gap-1">
                    {CREW_ACCOUNTS.map(c => (
                      <div
                        key={c.id}
                        title={`${c.displayName} is live`}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ring-2 ring-white"
                        style={{ background: c.color, fontSize: 9 }}
                      >
                        {c.avatar}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {activeSidebarTab === 'setlist' ? (
                <div className="flex-1 flex flex-col min-h-0 bg-gray-50">
                  {/* Sort Toggle header */}
                  <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-black/10">
                    <span className="text-[var(--font-size-2xs)] font-black uppercase tracking-widest text-black/40">Sort View</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setSetlistSort('order')}
                        className={`px-2 py-1 rounded text-3xs font-black uppercase tracking-widest transition-all ${setlistSort === 'order' ? 'bg-gray-100text-black' : 'bg-transparent text-black/30 hover:text-black/60'
                          }`}
                      >
                        Setlist Order
                      </button>
                      <button
                        onClick={() => setSetlistSort('likes')}
                        className={`px-2 py-1 rounded text-3xs font-black uppercase tracking-widest transition-all ${setlistSort === 'likes' ? 'bg-[var(--color-accent)]/20  text-[var(--color-accent)] border border-[var(--color-accent)]/30' : 'bg-transparent text-black/30 hover:text-black/60 border border-transparent'
                          }`}
                      >
                        Most Liked
                      </button>
                    </div>
                  </div>

                  {/* List of songs */}
                  <div data-lenis-prevent className="flex-1 overflow-y-auto p-3 space-y-2">
                    {(() => {
                      const sorted = [...setlist].sort((a, b) => {
                        if (setlistSort === 'likes') {
                          return b.likes - a.likes || setlist.indexOf(a) - setlist.indexOf(b);
                        }
                        return 0; // retain original setlist order
                      });

                      return sorted.map((song) => {
                        const hasLiked = likedSongs.has(song.id);
                        return (
                          <div
                            key={song.id}
                            className={`flex items-center justify-between p-3  border transition-all ${song.isPlaying
                              ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40 shadow-[0_0_15px_rgba(255,10,61,0.15)] animate-in fade-in duration-300'
                              : 'bg-white/[0.02] border-black/10'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`text-sm shrink-0 ${song.isPlaying ? 'animate-pulse  text-[var(--color-accent)]' : 'text-black/25'}`}>
                                {song.isPlaying ? '🔊' : '🎵'}
                              </span>
                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${song.isPlaying ? ' text-[var(--color-accent)]' : 'text-black/90'}`}>
                                  {song.title}
                                </p>
                                {song.isPlaying && (
                                  <span className="inline-block text-[var(--font-size-4xs)] font-black uppercase tracking-widest  text-[var(--color-accent)] mt-0.5 animate-pulse">
                                    Now Playing
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[var(--font-size-2xs)] font-mono font-bold text-black/40">
                                {song.likes}
                              </span>
                              <button
                                onClick={() => likeSong(song.id)}
                                disabled={hasLiked}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${hasLiked
                                  ? 'bg-red-500/10 text-red-500 cursor-not-allowed'
                                  : 'bg-gray-50 border border-black/10 hover:border-black/15 text-black/50 hover:text-black hover:scale-105 active:scale-95'
                                  }`}
                                title={hasLiked ? 'Already Liked!' : 'Like this song'}
                              >
                                {hasLiked ? '❤️' : '🤍'}
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                <>
                  {/* ── ADMIN-WATCHING BANNER ── visible to fans when mod is in admin mode */}
                  {showAdminPanel && (
                    <div
                      className="shrink-0 flex items-center justify-center gap-2 px-3 py-1.5"
                      style={{
                        background: 'rgba(239,68,68,0.08)',
                        borderBottom: '1px solid rgba(239,68,68,0.2)',
                        animation: 'modPulse 3s ease-in-out infinite',
                      }}
                    >
                      <style>{`
                      @keyframes modPulse {
                        0%,100% { background: rgba(239,68,68,0.06); }
                        50%      { background: rgba(239,68,68,0.13); }
                      }
                    `}</style>
                      <span style={{ fontSize: 11 }}>🛡️</span>
                      <span style={{ fontSize: 11, color: 'rgba(252,165,165,0.85)', fontWeight: 700, letterSpacing: '0.05em' }}>
                        MODERATOR IS MONITORING THIS CHAT
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#ef4444', animation: 'pulse 1.4s infinite' }}
                      />
                    </div>
                  )}

                  {/* ── PINNED MESSAGE BANNER ── shows when crew pins a message from dashboard */}
                  {pinnedMessage && (
                    <div
                      className="shrink-0 flex items-start gap-2 px-3 py-2"
                      style={{
                        background: 'linear-gradient(90deg, rgba(255,10,61,0.12), rgba(236,72,153,0.08))',
                        borderBottom: '1px solid rgba(255,10,61,0.2)',
                      }}
                    >
                      <span style={{ fontSize: 13, marginTop: 1 }}>📌</span>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.4 }}>
                          {pinnedMessage.text}
                        </p>
                        <p style={{ fontSize: 10, color: 'rgba(255,10,61,0.7)', marginTop: 2 }}>
                          Pinned by {pinnedMessage.by}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Messages — absolute inside relative wrapper guarantees scroll works */}
                  <div className="flex-1 relative min-h-0">
                    <div
                      ref={chatContainerRef}
                      data-lenis-prevent
                      className="absolute inset-0 overflow-y-auto px-3 py-2 space-y-1"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                          <span className="text-2xl mb-2">👋</span>
                          <p className="text-black/25 text-xs uppercase tracking-widest">Stream is starting...</p>
                        </div>
                      )}

                      {messages.map(msg => {
                        if (msg.isSystem || !msg.account) {
                          return (
                            <div key={msg.id} className="msg-new flex items-center justify-center py-1">
                              <span
                                className="px-3 py-1 rounded-full text-xs"
                                style={{
                                  background: 'rgba(0,0,0,0.04)',
                                  color: 'rgba(0,0,0,0.5)',
                                  fontSize: 11,
                                }}
                              >
                                {msg.text}
                              </span>
                            </div>
                          );
                        }

                        const isCrew = msg.account.role === 'crew';
                        const isUser = msg.isUser;
                        const isFlagged = flaggedMsgs.some(f => f.msg.id === msg.id || (f.msg.account?.id === msg.account?.id && f.msg.text === msg.text));
                        const isBanned = msg.account && bannedUsers.has(msg.account.id);
                        const flagEntry = flaggedMsgs.find(f => f.msg.id === msg.id || (f.msg.account?.id === msg.account?.id && f.msg.text === msg.text));

                        const initials = (msg.account?.displayName || 'FN').substring(0, 2).toUpperCase();
                        const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:52 PM';

                        return (
                          <div
                            key={msg.id}
                            className="msg-new flex items-start gap-2.5 py-1 px-1 mb-1.5 group"
                          >
                            {/* Avatar */}
                            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black mt-0.5 bg-cyan-600 text-white shadow-xs">
                              {initials}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Header row */}
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-extrabold !text-slate-900">
                                  {msg.account?.displayName || 'Fan'}
                                </span>

                                <span className="text-[8px] font-black uppercase tracking-widest px-1 py-0.5 rounded border leading-none text-emerald-800 bg-emerald-500/20 border-emerald-500/35">
                                  {isCrew ? 'CREW' : isUser ? 'YOU' : 'FAN'}
                                </span>

                                {showAdminPanel && isBanned && (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1 py-0.5 rounded border leading-none text-red-800 bg-red-500/20 border-red-500/35">
                                    🚫 BANNED
                                  </span>
                                )}
                                {showAdminPanel && isFlagged && !isBanned && (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1 py-0.5 rounded border leading-none  text-[var(--color-accent)] bg-purple-600/20 border-purple-500/35">
                                    ⚩ FLAGGED
                                  </span>
                                )}

                                <span className="text-[10px] !text-gray-700 font-sans font-bold leading-none ml-auto tracking-tight">
                                  {timeStr}
                                </span>
                              </div>

                              {/* Message bubble */}
                              <div
                                className={`px-3.5 py-2 text-xs inline-block w-fit max-w-[98%] leading-relaxed border break-words shadow-sm !text-white font-bold  rounded-tl-xs ${isCrew
                                  ? 'bg-emerald-600 border-emerald-400/50'
                                  : 'bg-cyan-500 border-cyan-400/50'
                                  }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>
                  </div>

                  {/* Chat input */}
                  <div
                    className="shrink-0 p-3"
                    style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
                  >
                    {/* Emoji picker */}
                    {showEmojiPicker && (
                      <div
                        className="mb-2 p-2 flex flex-wrap gap-1"
                        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}
                      >
                        {CHAT_EMOJIS.map(em => (
                          <button
                            key={em}
                            onClick={() => {
                              setUserMessage(prev => prev + em);
                              inputRef.current?.focus();
                            }}
                            className="text-lg hover:scale-125 transition-transform"
                            style={{ lineHeight: 1 }}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Blocked message warning */}
                    {blockedReason && (
                      <div
                        className="flex items-center gap-2 mb-2 px-3 py-2 text-xs font-bold"
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          border: '1px solid rgba(239,68,68,0.35)',
                          color: '#fca5a5',
                          animation: 'slideInMsg 0.2s ease forwards',
                        }}
                      >
                        <span className="shrink-0">⛔</span>
                        <span><strong>WARNING:</strong> {blockedReason}</span>
                      </div>
                    )}

                    <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="relative flex items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userMessage}
                        onChange={e => setUserMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                        placeholder="Type a message... use @admin to ask a question"
                        maxLength={200}
                        className="w-full !bg-white border border-black/15 pl-3.5 pr-28 py-2.5 text-xs !text-black font-medium outline-none focus:border-[var(--color-accent)] focus:!bg-white transition-all placeholder:!text-black/50 shadow-sm"
                      />
                      <div className="absolute right-1.5 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(v => !v)}
                          className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 text-black flex items-center justify-center text-sm transition-all cursor-pointer"
                        >
                          😀
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 rounded bg-purple-600/10 hover:bg-purple-600/20  text-[var(--color-accent)] font-bold text-xs border border-purple-500/30 transition-all cursor-pointer"
                        >
                          @
                        </button>
                        <button
                          type="submit"
                          disabled={!userMessage.trim()}
                          className="w-7 h-7 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent)] text-white flex items-center justify-center transition-all shadow-[0_0_10px_rgba(138,28,252,0.3)] disabled:opacity-30 disabled:hover:bg-[var(--color-accent)] cursor-pointer"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                      </div>
                    </form>

                    {/* Chat Rules Helper Text */}
                    <div className="flex items-center justify-between text-[10px] font-bold !text-gray-700 uppercase tracking-wider mt-2 px-1">
                      <span>KEEP IT RATED PG-13 · NO POLITICS</span>
                      <span className="!text-gray-700 font-bold lowercase tracking-normal">tag @admin for help</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>


        {/* RAFFLE CLAIM MODAL OVERLAY */}
        {showClaimModal && raffleState && (
          <RaffleClaimModal
            raffleState={raffleState}
            member={member}
            onClose={() => setShowClaimModal(false)}
          />
        )}



        {/* ── LIVE DROP CHECKOUT MODAL OVERLAY ── */}
        {showCheckoutModal && activeMerchDrop && (() => {
          const handleCheckoutSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            setCheckoutStep('processing');

            const claimPin = Math.floor(1000 + Math.random() * 9000).toString();
            setCheckoutClaimPin(claimPin);

            // Simulate payment processing for 1.8 seconds
            setTimeout(() => {
              // Decrement the stock of the product in the local state or product catalog
              let newStock = 0;
              if (activeMerchDrop.product) {
                newStock = Math.max(0, activeMerchDrop.product.stock - 1);
                setActiveMerchDrop(prev => prev ? {
                  ...prev,
                  product: prev.product ? { ...prev.product, stock: newStock } : prev.product
                } : null);
              }

              // Broadcast stock update
              bcRef.current?.postMessage({
                type: 'MERCH_STOCK_DECREMENT',
                payload: { newStock }
              });

              // Simulate adding a chat notification
              const purchaseMsg: ChatMsg = {
                id: 'msg_' + Date.now() + '_purchase',
                account: member ? {
                  id: member.id,
                  name: shippingDetails.name || member.name,
                  avatar: member.avatar || '',
                  role: 'FAN',
                  badge: 'FAN'
                } as any : {
                  id: 'anonymous',
                  name: shippingDetails.name || 'Anonymous Fan',
                  avatar: '',
                  role: 'FAN',
                  badge: 'FAN'
                } as any,
                text: `🛍️ just purchased the ${activeMerchDrop.product.name}${checkoutSelectedSize ? ` (${checkoutSelectedSize}` : ''}${checkoutSelectedColor ? `${checkoutSelectedSize ? ' / ' : ' ('}${checkoutSelectedColor})` : checkoutSelectedSize ? ')' : ''} [${checkoutDeliveryMethod === 'merch_table' ? 'Merch Table Pickup' : 'Shipped to Home'}]!`,
                timestamp: Date.now(),
                isUser: !member
              };

              // Broadcast chat message
              seenMsgIds.current.add(purchaseMsg.id);
              bcRef.current?.postMessage({ type: 'CHAT_MSG', payload: purchaseMsg });
              setMessages(prev => [...prev, purchaseMsg]);

              // Write persistent row to chat_messages database table so crew dashboard gets the update
              const currentRoomSlug = activeFeedId === 'mike' ? 'michael' : activeFeedId;
              supabase.from('chat_messages').insert({
                room: currentRoomSlug,
                sender_name: 'Shopify Bot',
                sender_role: 'system',
                sender_avatar: '🛍️',
                content: `🛍️ ${shippingDetails.name || 'A fan'} purchased the ${activeMerchDrop.product.name}${checkoutSelectedSize ? ` (${checkoutSelectedSize}` : ''}${checkoutSelectedColor ? `${checkoutSelectedSize ? ' / ' : ' ('}${checkoutSelectedColor})` : checkoutSelectedSize ? ')' : ''} [${checkoutDeliveryMethod === 'merch_table' ? `Merch Table Pickup - PIN: ${claimPin}` : 'Shipped to Home'}]!`,
              }).then();

              // Save order to global admin_orders_list in localStorage
              const isClothing = activeMerchDrop.product.name.toLowerCase().match(/shirt|tee|hoodie|sweat|jersey|jacket|tank|hat|cap/);
              const newOrder = {
                id: Date.now(),
                customer: shippingDetails.name || 'Anonymous Fan',
                email: shippingDetails.email,
                address: checkoutDeliveryMethod === 'shipping' ? shippingDetails.address : '',
                city: checkoutDeliveryMethod === 'shipping' ? shippingDetails.city : '',
                zip: checkoutDeliveryMethod === 'shipping' ? shippingDetails.zip : '',
                item: activeMerchDrop.product.name,
                price: activeMerchDrop.product.price,
                size: isClothing ? checkoutSelectedSize : null,
                color: isClothing ? checkoutSelectedColor : null,
                method: checkoutDeliveryMethod,
                source: 'Flash Drop',
                status: checkoutDeliveryMethod === 'merch_table' ? 'Ready for Pickup' : 'Pending',
                image: activeMerchDrop.product.image || '/images/merch/vinyl.png',
                ts: Date.now()
              };

              try {
                const currentOrders = JSON.parse(localStorage.getItem('admin_orders_list') || '[]');
                currentOrders.unshift(newOrder);
                localStorage.setItem('admin_orders_list', JSON.stringify(currentOrders));
              } catch (e) {
                console.error('Failed to save to admin orders list:', e);
              }

              // Notify dashboard
              bcRef.current?.postMessage({ type: 'ORDER_CREATED', payload: newOrder });

              // Decrement inventory in Shopify storefront for flash drop
              // Match product by name
              fetch('/api/shopify/inventory')
                .then(res => res.json())
                .then(data => {
                  const productList = data.products || data || [];
                  const matchedProduct = productList.find((p: any) =>
                    p.title.toLowerCase().includes(activeMerchDrop.product.name.toLowerCase()) ||
                    activeMerchDrop.product.name.toLowerCase().includes(p.title.toLowerCase())
                  );
                  const matchedVariant = matchedProduct?.variants?.edges?.find((edge: any) => {
                    const title = edge.node.title.toLowerCase();
                    const matchesSize = !checkoutSelectedSize || title.includes(checkoutSelectedSize.toLowerCase());
                    const matchesColor = !checkoutSelectedColor || title.includes(checkoutSelectedColor.toLowerCase());
                    return matchesSize && matchesColor;
                  })?.node || matchedProduct?.variants?.edges?.[0]?.node;

                  if (matchedVariant?.id) {
                    fetch('/api/shopify/inventory/adjust', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ variantId: matchedVariant.id, quantity: 1 })
                    }).then(res => res.json())
                      .then(d => console.log('[Shopify Flash Drop Sync Success]', d))
                      .catch(err => console.error('[Shopify Flash Drop Sync Error]', err));
                  }
                })
                .catch(err => console.error('[Shopify Inventory Load Error]', err));

              // Save order to merch_pickup_queue in localStorage if choosing pickup
              if (checkoutDeliveryMethod === 'merch_table') {
                try {
                  const queue = JSON.parse(localStorage.getItem('merch_pickup_queue') || '[]');
                  queue.unshift({
                    id: newOrder.id,
                    code: `PU-${claimPin}`,
                    item: activeMerchDrop.product.name,
                    size: checkoutSelectedSize || null,
                    color: checkoutSelectedColor || null,
                    price: activeMerchDrop.product.price,
                    customer: shippingDetails.name || 'Fan',
                    email: shippingDetails.email,
                    ts: Date.now(),
                    claimed: false
                  });
                  localStorage.setItem('merch_pickup_queue', JSON.stringify(queue));
                } catch (e) {
                  console.error('Failed to update merch queue:', e);
                }
              }

              // Send email confirmation
              if (shippingDetails.email) {
                const emailSubject = checkoutDeliveryMethod === 'merch_table'
                  ? `🎫 Merch Pickup Confirmation [PIN: ${claimPin}] — 7th Heaven`
                  : `📦 Merch Order Confirmed — 7th Heaven`;

                const emailHtml = checkoutDeliveryMethod === 'merch_table'
                  ? `<div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff; color: #1a1a1a;">
                      <h2 style="color: #10b981; margin-top: 0; text-transform: uppercase;">Merch Ready for Pickup</h2>
                      <p>Hello <strong>${shippingDetails.name || 'Fan'}</strong>,</p>
                      <p>Thank you for purchasing live! Your order has been registered for <strong>Merch Table Pickup</strong> at the venue.</p>
                      
                      <div style="background: #f4f4f5; padding: 24px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <div style="margin-bottom: 16px;">
                          <Image width={200} height={200} unoptimized src="${activeMerchDrop.product.image}" alt="${activeMerchDrop.product.name}" width="140" height="140" style="border-radius: 12px; border: 1px solid #eaeaea; display: inline-block; object-fit: cover;" />
                        </div>
                        <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px 0; color: #000;">${activeMerchDrop.product.name}</p>
                        ${activeMerchDrop.product.description ? `<p style="font-size: 12px; color: #666; margin: 4px 0 8px 0;">${activeMerchDrop.product.description}</p>` : ''}
                        ${checkoutSelectedSize ? `<p style="font-size: 13px; color: #333; margin: 4px 0 4px 0;"><strong>Size:</strong> ${checkoutSelectedSize}</p>` : ''}
                        ${checkoutSelectedColor ? `<p style="font-size: 13px; color: #333; margin: 4px 0 8px 0;"><strong>Color:</strong> ${checkoutSelectedColor}</p>` : ''}
                        <p style="font-size: 12px; color: #666; margin: 0 0 24px 0;">Price Paid: ${activeMerchDrop.product.price}</p>

                        <p style="text-transform: uppercase; font-size: 11px; color: #666; margin: 0 0 8px 0; letter-spacing: 0.1em; font-weight: 800;">Your Single-Use QR Code</p>
                        <Image width={200} height={200} unoptimized src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PU-${claimPin}" alt="Scan QR Code" style="display: block; margin: 12px auto; border: 4px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" width="150" height="150" />
                        <p style="font-size: 11px; color: #6b21a8; font-weight: bold; margin: 12px 0 0 0;">⚠️ This QR code is only valid for ONE claim. Do not share this email.</p>
                      </div>
                      
                      <p style="font-weight: bold; color: #111827; font-size: 14px;">Please bring this QR code to the merch table to claim your item.</p>
                      <p style="color: #888888; font-size: 11px; border-top: 1px solid #eaeaea; padding-top: 12px; margin-top: 24px;">
                        7th Heaven Band Live Stream. Thank you for your support!
                      </p>
                    </div>`
                  : `<div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff; color: #1a1a1a;">
                      <h2 style="color: #3b82f6; margin-top: 0; text-transform: uppercase;">Order Confirmed</h2>
                      <p>Hello <strong>${shippingDetails.name || 'Fan'}</strong>,</p>
                      <p>Your order has been successfully confirmed. It will be shipped to you shortly.</p>
                      
                      <div style="background: #f4f4f5; padding: 24px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <div style="margin-bottom: 12px;">
                          <Image width={200} height={200} unoptimized src="${activeMerchDrop.product.image}" alt="${activeMerchDrop.product.name}" width="140" height="140" style="border-radius: 12px; border: 1px solid #eaeaea; display: inline-block; object-fit: cover;" />
                        </div>
                        <p style="font-weight: bold; font-size: 16px; margin: 0 0 4px 0; color: #000;">${activeMerchDrop.product.name}</p>
                        ${activeMerchDrop.product.description ? `<p style="font-size: 12px; color: #666; margin: 4px 0 8px 0;">${activeMerchDrop.product.description}</p>` : ''}
                        ${checkoutSelectedSize ? `<p style="font-size: 13px; color: #333; margin: 4px 0 4px 0;"><strong>Size:</strong> ${checkoutSelectedSize}</p>` : ''}
                        ${checkoutSelectedColor ? `<p style="font-size: 13px; color: #333; margin: 4px 0 8px 0;"><strong>Color:</strong> ${checkoutSelectedColor}</p>` : ''}
                        <p style="font-size: 12px; color: #666; margin: 0;">Price Paid: ${activeMerchDrop.product.price}</p>
                      </div>

                      <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #666;">Shipping Address</h4>
                        <p style="margin: 0; font-weight: bold;">${shippingDetails.name}</p>
                        <p style="margin: 4px 0 0 0;">${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.zip}</p>
                      </div>
                      <p>Your tracking number will be emailed to you as soon as the item ships.</p>
                      <p style="color: #888888; font-size: 11px; border-top: 1px solid #eaeaea; padding-top: 12px; margin-top: 24px;">
                        7th Heaven Band Live Stream. Thank you for your support!
                      </p>
                    </div>`;

                fetch('/api/email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ to: shippingDetails.email, subject: emailSubject, html: emailHtml })
                }).catch(err => console.error('Failed to send confirmation email:', err));
              }

              setCheckoutStep('success');
            }, 1800);
          };

          return (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
              <div className="bg-white/98 backdrop-blur-xl border p-6 w-full max-w-sm shadow-md relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto text-black text-left"
                style={{ borderColor: `${activeMerchDrop.product.color}55`, boxShadow: `0 0 40px ${activeMerchDrop.product.color}15` }}>

                {/* Close Button */}
                <button onClick={() => setShowCheckoutModal(false)} className="absolute top-3 right-3 text-black/50 hover:text-black transition-colors p-1 bg-gray-50 hover:bg-gray-100 rounded-full border-none cursor-pointer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>

                {checkoutStep === 'form' && (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div className="text-center mb-2 flex flex-col items-center">
                      <div className="w-20 h-20 border border-black/10 bg-gray-50 overflow-hidden mb-2.5 shrink-0">
                        <Image width={200} height={200} unoptimized
                          src={activeMerchDrop.product.image || '/images/merch/vinyl.png'}
                          alt={activeMerchDrop.product.name}
                          onError={(e) => {
                            const name = activeMerchDrop.product.name.toLowerCase();
                            if (name.includes('shirt') || name.includes('tee')) {
                              e.currentTarget.src = '/images/merch/logo-tee.png';
                            } else if (name.includes('hood') || name.includes('sweat')) {
                              e.currentTarget.src = '/images/merch/hoodie.png';
                            } else {
                              e.currentTarget.src = '/images/merch/vinyl.png';
                            }
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[var(--font-size-3xs)] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: `${activeMerchDrop.product.color}22`, color: activeMerchDrop.product.color }}>
                        🛍️ LIVE DROP MERCH
                      </span>
                      <h3 className="text-lg font-black text-black uppercase tracking-wider mt-2 leading-tight">
                        {activeMerchDrop.product.name}
                      </h3>
                      {activeMerchDrop.product.description && (
                        <p className="text-[var(--font-size-2xs)] text-black/50 mt-1 max-w-[280px] leading-relaxed font-sans">
                          {activeMerchDrop.product.description}
                        </p>
                      )}
                      <p className="text-sm font-black mt-1.5" style={{ color: activeMerchDrop.product.color }}>
                        {activeMerchDrop.product.price}
                      </p>
                      <p className="text-[var(--font-size-3xs)] text-black/40 mt-0.5 font-sans">Only {activeMerchDrop.product.stock} items left in stock</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/40 font-bold block mb-1.5 font-sans">Delivery Option</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCheckoutDeliveryMethod('merch_table')}
                            className={`py-2.5 px-3  border text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${checkoutDeliveryMethod === 'merch_table'
                              ? 'bg-white text-black border-white'
                              : 'bg-transparent text-black/60 border-black/10 hover:border-black/15'
                              }`}
                          >
                            <span>🛍️ Pickup</span>
                            <span className="text-[var(--font-size-4xs)] opacity-60 normal-case font-normal font-sans">Merch Table</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCheckoutDeliveryMethod('shipping')}
                            className={`py-2.5 px-3  border text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${checkoutDeliveryMethod === 'shipping'
                              ? 'bg-white text-black border-white'
                              : 'bg-transparent text-black/60 border-black/10 hover:border-black/15'
                              }`}
                          >
                            <span>📦 Ship Home</span>
                            <span className="text-[var(--font-size-4xs)] opacity-60 normal-case font-normal font-sans">Standard Delivery</span>
                          </button>
                        </div>
                      </div>

                      {/* Size Selector */}
                      {(() => {
                        const name = activeMerchDrop.product.name.toLowerCase();
                        const isClothing = name.includes('shirt') || name.includes('tee') || name.includes('hood') || name.includes('sweat') || name.includes('jersey') || name.includes('jacket') || name.includes('tank');
                        const hasVariants = (activeMerchDrop.product as any).variants && (activeMerchDrop.product as any).variants.length > 0;
                        const sizeOptions = hasVariants
                          ? (activeMerchDrop.product as any).variants.map((v: any) => v.title)
                          : (isClothing ? ['S', 'M', 'L', 'XL', 'XXL'] : null);
                        if (!sizeOptions) return null;
                        return (
                          <div>
                            <label className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/40 font-bold block mb-1.5 font-sans">Select Size</label>
                            <div className="flex flex-wrap gap-1.5">
                              {sizeOptions.map((size: string) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => setCheckoutSelectedSize(size)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${checkoutSelectedSize === size
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-black/60 border-black/10 hover:border-black/15'
                                    }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Color Selector */}
                      {(() => {
                        const name = activeMerchDrop.product.name.toLowerCase();
                        const isClothing = name.includes('shirt') || name.includes('tee') || name.includes('hood') || name.includes('sweat') || name.includes('jersey') || name.includes('jacket') || name.includes('tank') || name.includes('hat') || name.includes('cap');
                        if (!isClothing) return null;
                        const COLORS = [
                          { name: 'Black', hex: '#1a1a1a' },
                          { name: 'White', hex: '#f5f5f5' },
                          { name: 'Heather Grey', hex: '#9ca3af' },
                          { name: 'Navy', hex: '#1e3a5f' },
                          { name: 'Red', hex: '#dc2626' },
                          { name: 'Forest Green', hex: '#166534' },
                        ];
                        return (
                          <div>
                            <label className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/40 font-bold block mb-1.5 font-sans">Select Color</label>
                            <div className="flex flex-wrap gap-2">
                              {COLORS.map((c) => (
                                <button
                                  key={c.name}
                                  type="button"
                                  onClick={() => setCheckoutSelectedColor(c.name)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[var(--font-size-3xs)] font-bold uppercase tracking-wider transition-all cursor-pointer ${checkoutSelectedColor === c.name
                                    ? 'bg-gray-100 text-black border-white'
                                    : 'bg-transparent text-black/50 border-black/10 hover:border-black/15'
                                    }`}
                                >
                                  <span
                                    className="w-3.5 h-3.5 rounded-full shrink-0 border"
                                    style={{ background: c.hex, borderColor: c.name === 'White' ? '#d1d5db' : c.hex }}
                                  />
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      <div>
                        <label className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/40 font-bold block mb-1 font-sans">Full Name</label>
                        <input
                          type="text"
                          required
                          value={shippingDetails.name}
                          onChange={e => setShippingDetails(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          className="w-full bg-gray-50 border border-black/10 p-2.5 text-xs text-black placeholder-white/20 focus:border-[var(--color-accent)] focus:outline-none font-sans"
                        />
                      </div>
                      <div>
                        <label className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/40 font-bold block mb-1 font-sans">Email Address</label>
                        <input
                          type="email"
                          required
                          value={shippingDetails.email}
                          onChange={e => setShippingDetails(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                          className="w-full bg-gray-50 border border-black/10 p-2.5 text-xs text-black placeholder-white/20 focus:border-[var(--color-accent)] focus:outline-none font-sans"
                        />
                      </div>

                      {checkoutDeliveryMethod === 'shipping' && (
                        <>
                          <div>
                            <label className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/40 font-bold block mb-1 font-sans">Shipping Address</label>
                            <input
                              type="text"
                              required
                              value={shippingDetails.address}
                              onChange={e => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="123 Main St"
                              className="w-full bg-gray-50 border border-black/10 p-2.5 text-xs text-black placeholder-white/20 focus:border-[var(--color-accent)] focus:outline-none font-sans"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/40 font-bold block mb-1 font-sans">City</label>
                              <input
                                type="text"
                                required
                                value={shippingDetails.city}
                                onChange={e => setShippingDetails(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Chicago"
                                className="w-full bg-gray-50 border border-black/10 p-2.5 text-xs text-black placeholder-white/20 focus:border-[var(--color-accent)] focus:outline-none font-sans"
                              />
                            </div>
                            <div>
                              <label className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/40 font-bold block mb-1 font-sans">ZIP Code</label>
                              <input
                                type="text"
                                required
                                value={shippingDetails.zip}
                                onChange={e => setShippingDetails(prev => ({ ...prev, zip: e.target.value }))}
                                placeholder="60601"
                                className="w-full bg-gray-50 border border-black/10 p-2.5 text-xs text-black placeholder-white/20 focus:border-[var(--color-accent)] focus:outline-none font-sans"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="text-[var(--font-size-4xs)] uppercase tracking-wider text-black/40 font-bold block mb-1 font-sans">Card Details (Mock)</label>
                        <input
                          type="text"
                          required
                          value={shippingDetails.card}
                          onChange={e => setShippingDetails(prev => ({ ...prev, card: e.target.value }))}
                          placeholder="4242 4242 4242 4242"
                          className="w-full bg-gray-50 border border-black/10 p-2.5 text-xs text-black placeholder-white/20 focus:border-[var(--color-accent)] focus:outline-none font-sans"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        background: activeMerchDrop.product.color,
                        boxShadow: `0 0 15px ${activeMerchDrop.product.color}44`
                      }}
                      className="w-full py-3 text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none mt-2 font-sans"
                    >
                      Authorize Payment
                    </button>
                  </form>
                )}

                {checkoutStep === 'processing' && (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-12 h-12 border-4 border-black/10 border-t-white rounded-full animate-spin mx-auto"
                      style={{ borderTopColor: activeMerchDrop.product.color }} />
                    <h3 className="text-sm font-black uppercase tracking-widest text-black/80 font-sans">Securing payment</h3>
                    <p className="text-[var(--font-size-2xs)] text-black/40 max-w-[200px] mx-auto font-sans">Connecting to Shopify checkout secure gateways...</p>
                  </div>
                )}

                {checkoutStep === 'success' && (() => {
                  const successProdName = activeMerchDrop.product.name.toLowerCase();
                  const successIsClothing = successProdName.includes('shirt') || successProdName.includes('tee') || successProdName.includes('hood') || successProdName.includes('sweat') || successProdName.includes('jersey') || successProdName.includes('jacket') || successProdName.includes('tank') || successProdName.includes('hat') || successProdName.includes('cap');
                  return (
                    <div className="text-center py-4 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[var(--color-accent)] flex items-center justify-center mx-auto"
                        style={{ boxShadow: '0 0 20px rgba(16,185,129,0.1)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-black uppercase tracking-wider font-sans">Purchase Successful!</h3>
                        <p className="text-xs text-black/50 mt-1 max-w-[240px] mx-auto font-sans">
                          {checkoutDeliveryMethod === 'merch_table' ? (
                            <span>Your order for the <strong>{activeMerchDrop.product.name}</strong> is confirmed. Please check your email for your single-use QR code to claim your item.</span>
                          ) : (
                            <span>Your order for the <strong>{activeMerchDrop.product.name}</strong> is confirmed.</span>
                          )}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-black/10 p-4 text-left space-y-3">
                        {/* Product Image - large and prominent */}
                        <div className="flex justify-center">
                          <Image width={200} height={200} unoptimized
                            src={activeMerchDrop.product.image || '/images/merch/vinyl.png'}
                            alt={activeMerchDrop.product.name}
                            onError={(e) => {
                              const name = activeMerchDrop.product.name.toLowerCase();
                              if (name.includes('shirt') || name.includes('tee')) {
                                e.currentTarget.src = '/images/merch/logo-tee.png';
                              } else if (name.includes('hood') || name.includes('sweat')) {
                                e.currentTarget.src = '/images/merch/hoodie.png';
                              } else {
                                e.currentTarget.src = '/images/merch/vinyl.png';
                              }
                            }}
                            className="w-28 h-28 object-cover border border-black/10"
                          />
                        </div>

                        {/* Product Description */}
                        {activeMerchDrop.product.description && (
                          <p className="text-[var(--font-size-2xs)] text-black/50 text-center leading-relaxed font-sans px-2">
                            {activeMerchDrop.product.description}
                          </p>
                        )}

                        {/* Order Details */}
                        <div className="space-y-1.5 pt-2 border-t border-black/10">
                          <p className="text-[var(--font-size-3xs)] text-black/40 uppercase font-bold tracking-widest font-sans mb-1.5">Order Details</p>
                          <p className="text-xs font-bold text-black/90 font-sans">Recipient: <span className="font-normal text-black/60">{shippingDetails.name}</span></p>
                          <p className="text-xs font-bold text-black/90 font-sans truncate">Product: <span className="font-normal text-black/60">{activeMerchDrop.product.name}</span></p>
                          {successIsClothing && checkoutSelectedSize && (
                            <p className="text-xs font-bold text-black/90 font-sans">Size: <span className="font-normal text-black/60">{checkoutSelectedSize}</span></p>
                          )}
                          {successIsClothing && checkoutSelectedColor && (
                            <p className="text-xs font-bold text-black/90 font-sans">Color: <span className="font-normal text-black/60 inline-flex items-center gap-1.5">
                              <span className="inline-block w-2.5 h-2.5 rounded-full border border-black/15" style={{ background: checkoutSelectedColor === 'Black' ? '#1a1a1a' : checkoutSelectedColor === 'White' ? '#f5f5f5' : checkoutSelectedColor === 'Heather Grey' ? '#9ca3af' : checkoutSelectedColor === 'Navy' ? '#1e3a5f' : checkoutSelectedColor === 'Red' ? '#dc2626' : checkoutSelectedColor === 'Forest Green' ? '#166534' : '#888' }} />
                              {checkoutSelectedColor}
                            </span></p>
                          )}
                          <p className="text-xs font-bold text-black/90 font-sans">Method: <span className="font-normal text-black/60">{checkoutDeliveryMethod === 'merch_table' ? 'Merch Table Pickup' : 'Shipped to Home'}</span></p>
                          {checkoutDeliveryMethod === 'shipping' && (
                            <p className="text-xs font-bold text-black/90 font-sans truncate">Ship To: <span className="font-normal text-black/60">{shippingDetails.address}, {shippingDetails.city}</span></p>
                          )}
                          <p className="text-xs font-bold text-black/90 font-sans">Price Paid: <span className="font-normal text-black/60">{activeMerchDrop.product.price}</span></p>
                        </div>
                      </div>

                      {/* Email confirmation notice */}
                      {shippingDetails.email && (
                        <p className="text-xs text-[var(--color-accent)]/80 font-sans flex items-center justify-center gap-1.5">
                          <span>📧</span>
                          <span>Confirmation email sent to <span className="underline underline-offset-2">{shippingDetails.email}</span></span>
                        </p>
                      )}

                      <button
                        onClick={() => setShowCheckoutModal(false)}
                        style={{
                          background: activeMerchDrop.product.color
                        }}
                        className="w-full py-3 text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none font-sans"
                      >
                        Return to Stream
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })()}
      </section>
    </>
  );
}

