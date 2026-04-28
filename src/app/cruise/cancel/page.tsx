"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function CancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "cancelling" | "success" | "error">("idle");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCancel = async () => {
    if (!token) return;
    setStatus("cancelling");
    try {
      const res = await fetch(`/api/cruise/signup?token=${token}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");
      setStatus("success");
      setName(data.name || "");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong");
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <span className="text-4xl block mb-4">⚠️</span>
        <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
        <p className="text-white/40 text-sm mb-6">This cancel link is missing a token. Please use the link from your confirmation email.</p>
        <Link href="/cruise" className="text-[var(--color-accent)] text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">
          ← Back to Cruise Page
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center max-w-md mx-auto">
      {status === "success" ? (
        <>
          <span className="text-4xl block mb-4">✅</span>
          <h2 className="text-2xl font-black text-white mb-2">Signup Cancelled</h2>
          <p className="text-white/50 text-sm mb-2">
            {name ? `Hey ${name}, your` : "Your"} cruise interest signup has been removed.
          </p>
          <p className="text-white/30 text-sm mb-8">A confirmation email has been sent. If you change your mind, you can always sign up again.</p>
          <Link href="/cruise" className="inline-block px-8 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/80 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all">
            Back to Cruise Page
          </Link>
        </>
      ) : status === "error" ? (
        <>
          <span className="text-4xl block mb-4">❌</span>
          <h2 className="text-xl font-bold text-white mb-2">Couldn&apos;t Cancel</h2>
          <p className="text-white/40 text-sm mb-6">{errorMsg || "This link may have already been used or expired."}</p>
          <Link href="/cruise" className="text-[var(--color-accent)] text-sm font-bold uppercase tracking-widest hover:text-white transition-colors">
            ← Back to Cruise Page
          </Link>
        </>
      ) : (
        <>
          <span className="text-4xl block mb-4">🚢</span>
          <h2 className="text-2xl font-black text-white mb-2">Cancel Your Cruise Signup?</h2>
          <p className="text-white/50 text-sm mb-8">
            This will remove your interest signup from the 7th Heaven cruise. You can always sign up again later.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCancel}
              disabled={status === "cancelling"}
              className="px-8 py-3 bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-70 cursor-pointer"
            >
              {status === "cancelling" ? "Cancelling..." : "Yes, Cancel My Signup"}
            </button>
            <Link href="/cruise" className="text-white/30 text-sm hover:text-white transition-colors">
              Never mind, keep me on the list
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function CruiseCancelPage() {
  return (
    <div className="min-h-screen pt-[72px] flex items-center justify-center bg-[var(--color-bg-primary)]">
      <Suspense fallback={
        <div className="text-center">
          <span className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />
        </div>
      }>
        <CancelContent />
      </Suspense>
    </div>
  );
}
