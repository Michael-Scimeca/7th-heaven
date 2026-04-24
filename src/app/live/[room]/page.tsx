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
  const router = useRouter();
  const rawRoom = typeof params?.room === 'string' ? params.room : 'michael';
  // If the room is a test room, redirect to the live hub
  if (/test/i.test(rawRoom)) {
    router.replace('/live');
    return null;
  }
  const memberId = rawRoom.replace(/^live_/, '');

  const [isLive, setIsLive] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLive = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('live_streams')
        .select('id')
        .eq('status', 'live')
        .eq('user_id', memberId)
        .limit(1);
      setIsLive(!error && data && data.length > 0);
    };
    checkLive();
  }, [memberId]);

  if (isLive === false) {
    // Not actually broadcasting – send user back to hub
    router.replace('/live');
    return null;
  }
  if (isLive === null) {
    // Still loading – render nothing (or could render a spinner)
    return null;
  }

  return <LiveSimulation memberId={memberId} />;
}
