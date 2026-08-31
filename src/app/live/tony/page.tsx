'use client';

import { FakeLiveStream } from '@/components/FakeLiveStream';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function LiveTonyPage() {
  const hydrated = useIsHydrated();

  if (!hydrated) {
    return <div className="min-h-screen bg-[rgb(10,10,15)]" />;
  }

  return <FakeLiveStream memberId="tony" />;
}
