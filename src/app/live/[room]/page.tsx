'use client';

import { LiveSimulation } from '../demo/page';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

/**
 * Dynamic live room page — /live/[room]
 * Delegates to the shared LiveSimulation component with the member ID
 * extracted from the [room] URL segment (e.g. live_michael → michael).
 * If the member is not broadcasting, redirects back to the live hub.
 */
export default function LiveRoomPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rawRoom = typeof params?.room === 'string' ? params.room : 'michael';
  const memberId = rawRoom.replace(/^live_/, '');

  if (!mounted) return null;

  console.log('📡 [LiveRoom] Direct rendering simulation for:', memberId);

  return <LiveSimulation memberId={memberId} />;
}
