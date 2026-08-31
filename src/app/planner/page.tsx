"use client";
/* oxlint-disable react-doctor/nextjs-no-client-side-redirect */
/* eslint-disable react-doctor/nextjs-no-client-side-redirect */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMember } from "@/context/MemberContext";

export default function PlannerRedirectPage() {
  const { member, isLoggedIn, hydrated, openModal } = useMember();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    if (isLoggedIn && member) {
      const slug = member.username || "me";
      router.replace(`/book/${slug}`);
      return;
    }

    if (!isLoggedIn) {
      // Redirect to demo planner for now
      router.replace("/book/demo");
    }
  }, [hydrated, isLoggedIn, member, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2  border-white/10  border-t-[var(--color-accent)] rounded-lg animate-spin mx-auto mb-4" />
        <p className="font-bold uppercase   ">Redirecting to Planner Dashboard...</p>
      </div>
    </div>
  );
}
