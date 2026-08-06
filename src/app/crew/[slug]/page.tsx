'use client';

import { useEffect } from 'react';
import { useParams, useRouter, redirect } from 'next/navigation';

/**
 * /crew/[slug] — pre-seeds localStorage with the correct crew member identity
 * for demo purposes, then renders the crew dashboard.
 *
 * Supported slugs: michael, sammy, ryan, tony
 */

const CREW_MEMBERS: Record<string, { id: string; name: string; email: string; avatar: string }> = {
  michael: { id: 'michael', name: 'Michael Scimeca', email: 'michael@7thheaven.com', avatar: 'MS' },
  sammy:   { id: 'sammy',   name: 'Sammy D',         email: 'sammy@7thheaven.com',   avatar: 'SD' },
  ryan:    { id: 'ryan',    name: 'Ryan K',           email: 'ryan@7thheaven.com',    avatar: 'RK' },
  tony:    { id: 'tony',    name: 'Tony M',           email: 'tony@7thheaven.com',    avatar: 'TM' },
  abbie:   { id: 'abbie',   name: 'Abbie Janssen',   email: 'abbie@7thheaven.com',   avatar: 'AJ' },
};

export default function CrewMemberPage() {
  const params = useParams();
  const slug = (params?.slug as string)?.toLowerCase();
  const member = slug ? CREW_MEMBERS[slug] : null;

  if (!member) {
    redirect('/crew');
  }

  useEffect(() => {
    // Seed localStorage so the crew dashboard loads with the right identity
    localStorage.setItem('7h_dev_bypass_v1', 'true');
    localStorage.setItem('7h_member_v1', JSON.stringify({
      id: member.id,
      name: member.name,
      email: member.email,
      role: 'crew',
      avatar: member.avatar,
      joinDate: new Date().toISOString(),
      points: 0,
      tier: 'Bronze',
      showsAttended: 0,
      favoriteVenues: [],
      notificationsEnabled: false,
      notificationRadius: 25,
    }));

    // Now redirect to the main crew dashboard which reads from localStorage
    window.location.replace('/crew');
  }, [member]);

  // Show a brief loading state while redirecting
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#030305' }}
    >
      <div className="text-center">
        {member ? (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl mx-auto mb-4 animate-pulse"
              style={{ background: 'linear-gradient(135deg, #8a1cfc, #ec4899)' }}
            >
              {member.avatar}
            </div>
            <p className="text-white/60 text-sm font-bold uppercase tracking-widest">
              Loading {member.name}&apos;s Crew Dashboard…
            </p>
          </>
        ) : (
          <p className="text-white/40 text-sm">Redirecting…</p>
        )}
      </div>
    </div>
  );
}
