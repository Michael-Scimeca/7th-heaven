'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** /crew is retired — each crew member has their own page now */
export default function CrewRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/crew-michael'); }, [router]);
  return null;
}
