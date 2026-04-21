'use client';

import { LiveSimulation } from '../demo/page';
import { useParams } from 'next/navigation';

/**
 * Dynamic live room page — /live/[room]
 * Delegates to the shared LiveSimulation component with the member ID
 * extracted from the [room] URL segment (e.g. live_michael → michael).
 */
export default function LiveRoomPage() {
  const params = useParams();
  const rawRoom = typeof params?.room === 'string' ? params.room : 'michael';
  // Convert "live_michael" → "michael", "live_sammy" → "sammy", etc.
  const memberId = rawRoom.replace(/^live_/, '');
  return <LiveSimulation memberId={memberId} />;
}
