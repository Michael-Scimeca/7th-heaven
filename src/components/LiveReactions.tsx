'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FloatingEmoji {
 id: string;
 emoji: string;
 x: number;
 createdAt: number;
}

const REACTIONS = [
 { emoji: '❤️', label: 'Love' },
 { emoji: '🔥', label: 'Fire' },
 { emoji: '🤘', label: 'Rock' },
 { emoji: '🎸', label: 'Guitar' },
 { emoji: '👏', label: 'Clap' },
 { emoji: '⚡', label: 'Electric' },
];

const FLOAT_DURATION = 2800;

interface LiveReactionsProps {
 className?: string;
 /** 'buttons' = only show the clickable row, 'floats' = only the animated layer, 'both' = default full component */
 mode?: 'buttons' | 'floats' | 'both';
}

export function LiveReactions({ className = '', mode = 'both' }: LiveReactionsProps) {
 const [floating, setFloating] = useState<FloatingEmoji[]>([]);
 const supabase = createClient();
 const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
 const cooldownRef = useRef(false);

 useEffect(() => {
  const channel = supabase.channel('live-reactions', {
   config: { broadcast: { self: true } },
  });
  channel
   .on('broadcast', { event: 'reaction' }, (payload) => {
    const emoji = payload.payload?.emoji;
    if (!emoji) return;
    setFloating(prev => [...prev, {
     id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
     emoji,
     x: 10 + Math.random() * 70, // spread across bottom width
     createdAt: Date.now(),
    }]);
   })
   .subscribe();
  channelRef.current = channel;
  return () => { supabase.removeChannel(channel); };
 }, [supabase]);

 useEffect(() => {
  const interval = setInterval(() => {
   setFloating(prev => prev.filter(e => Date.now() - e.createdAt < FLOAT_DURATION));
  }, 500);
  return () => clearInterval(interval);
 }, []);

 const sendReaction = useCallback((emoji: string) => {
  if (cooldownRef.current) return;
  cooldownRef.current = true;
  channelRef.current?.send({ type: 'broadcast', event: 'reaction', payload: { emoji } });
  setTimeout(() => { cooldownRef.current = false; }, 200);
 }, []);

 return (
  <div className={className}>
   {/* Floating emojis — rendered at video level so they rise the full height */}
   {(mode === 'floats' || mode === 'both') && (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
     {floating.map(item => (
      <span
       key={item.id}
       className="absolute text-3xl animate-float-up"
       style={{
        left: `${item.x}%`,
        bottom: '8%',
        animationDuration: `${FLOAT_DURATION}ms`,
       }}
      >
       {item.emoji}
      </span>
     ))}
    </div>
   )}

   {/* Reaction buttons row */}
   {(mode === 'buttons' || mode === 'both') && (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
     {REACTIONS.map(r => (
      <button
       key={r.emoji}
       onClick={() => sendReaction(r.emoji)}
       className="group relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.04] border border-white/[0.08]
        hover:bg-white/[0.08] hover:border-white/[0.15] hover:scale-110
        active:scale-95 transition-all duration-150 cursor-pointer
        flex items-center justify-center text-lg sm:text-xl"
       title={r.label}
      >
       {r.emoji}
       <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 rounded text-[9px] text-white/60
        font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {r.label}
       </span>
      </button>
     ))}
    </div>
   )}
  </div>
 );
}
