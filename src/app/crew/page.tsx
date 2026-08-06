"use client";

import { useEffect } from "react";
import { useRouter, redirect } from "next/navigation";
import { useMember } from "@/context/MemberContext";

const CREW_MEMBERS = [
  { id: "michael", path: "/crew-michael", emailKey: "michael" },
  { id: "sammy",   path: "/crew-sam",     emailKey: "sammy"   },
  { id: "ryan",    path: "/crew-ryan",    emailKey: "ryan"    },
  { id: "tony",    path: "/crew-tony",    emailKey: "tony"    },
  { id: "abbie",   path: "/crew-abbie",   emailKey: "abbie"   },
];

export default function CrewPortalPage() {
  const { member, isLoggedIn, hydrated, openModal } = useMember();

  if (hydrated && isLoggedIn) {
    const crewMatch = CREW_MEMBERS.find(
      (c) => member?.email?.toLowerCase().includes(c.emailKey)
    ) || CREW_MEMBERS[0];
    redirect(crewMatch.path);
  }

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      openModal("login", "crew");
    }
  }, [hydrated, isLoggedIn, openModal]);

  // Full-screen loading / redirect state
  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/30 text-xs uppercase tracking-widest font-bold">
          Crew Portal — Loading…
        </p>
      </div>
    </div>
  );
}
