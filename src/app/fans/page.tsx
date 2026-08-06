"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams, redirect } from "next/navigation";
import { useMember } from "@/context/MemberContext";

function FansRedirectContent() {
  const { member, isLoggedIn, hydrated, openModal, login } = useMember();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  if (hydrated && isDemo) {
    redirect("/fans/demo");
  }

  if (hydrated && isLoggedIn && member) {
    const slug = member.username || "me";
    redirect(`/fans/${slug}`);
  }

  useEffect(() => {
    if (!hydrated) return;

    if (!isLoggedIn) {
      if (process.env.NODE_ENV === 'development') {
        login("fan@7thheaven.com", "password123");
      } else {
        openModal("login");
      }
    }
  }, [hydrated, isLoggedIn, openModal, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
          {isDemo ? "Loading Demo..." : isLoggedIn ? "Redirecting to your dashboard..." : "Please sign in to continue"}
        </p>
      </div>
    </div>
  );
}

export default function FansRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" /></div>}>
      <FansRedirectContent />
    </Suspense>
  );
}
