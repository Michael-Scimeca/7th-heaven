'use client';

import { FakeLiveStream } from '@/components/FakeLiveStream';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

/**
 * Dynamic live room page — /live/[room]
 * Uses the FakeLiveStream demo so the client can always see what
 * a live stream looks like, even without a real broadcaster active.
 */
export default function LiveRoomPage() {
  const params = useParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rawRoom = typeof params?.room === 'string' ? params.room : 'michael';
  const memberId = rawRoom.replace(/^live_/, '');

  if (!mounted) return null;

  return <FakeLiveStream memberId={memberId} />;
}
