'use client';

import { FakeLiveStream } from '@/components/FakeLiveStream';
import { useParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Dynamic live room page — /live/[room]
 * Uses the FakeLiveStream demo so the client can always see what
 * a live stream looks like, even without a real broadcaster active.
 */
export default function LiveRoomPage() {
  const params = useParams();
  const hydrated = useIsHydrated();

  const rawRoom = typeof params?.room === 'string' ? params.room : 'michael';
  const memberId = rawRoom.replace(/^live_/, '');

  if (!hydrated) {
    return <div className="min-h-screen bg-[rgb(10,10,15)]" />;
  }

  return <FakeLiveStream memberId={memberId || 'michael'} />;
}
