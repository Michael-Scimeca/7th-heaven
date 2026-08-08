'use client';

import dynamic from 'next/dynamic';

const CrewDashboard = dynamic(
  () => import('@/components/CrewDashboard').then(mod => mod.CrewDashboard),
  { ssr: false }
);

export default function CrewRyanPage() {
  return <CrewDashboard defaultMemberId="ryan" />;
}
