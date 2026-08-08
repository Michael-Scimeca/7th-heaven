'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const CrewDashboard = dynamic(
  () => import('@/components/CrewDashboard').then((mod) => mod.CrewDashboard),
  { ssr: false }
);

export default function CrewMemberPage() {
  const params = useParams();
  const slug = (params?.slug as string)?.toLowerCase() || 'michael';

  return <CrewDashboard defaultMemberId={slug} />;
}
