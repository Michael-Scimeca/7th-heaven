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
    <main
      id="planner-redirect-page"
      className="flex min-h-screen items-center justify-center"
    >
      <div className="text-center">
        <h1 className="sr-only">7th Heaven Event Planner Portal</h1>
        <div className="mx-auto mb-6 h-8 w-8 animate-spin rounded-lg border-2 border-white/10 border-t-[var(--color-accent)]" />
        <p>Redirecting to Planner Dashboard...</p>
      </div>
    </main>
  );
}
