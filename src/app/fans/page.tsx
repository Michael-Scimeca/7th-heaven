"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMember } from "@/context/MemberContext";

export default function FansRedirectPage() {
  const { member, isLoggedIn, hydrated, openModal, login } = useMember();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    if (!hydrated) return;

    // Demo mode — redirect to /fans/demo
    if (isDemo) {
      router.replace("/fans/demo");
      return;
    }

    // Logged in — redirect to /fans/[username]
    if (isLoggedIn && member) {
      const slug = member.username || "me";
      router.replace(`/fans/${slug}`);
      return;
    }

    // Not logged in — auto-login in dev mode or open modal in production
    if (!isLoggedIn) {
      if (process.env.NODE_ENV === 'development') {
        login("fan@7thheaven.com", "password123");
      } else {
        openModal("login");
      }
    }
  }, [hydrated, isLoggedIn, member, isDemo, router, openModal, login]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
          {isDemo ? "Loading Demo..." : isLoggedIn ? "Redirecting to your dashboard..." : "Please sign in to continue"}
        </p>
      </div>
    </div>
  );
}
