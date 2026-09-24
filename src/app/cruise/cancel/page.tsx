"use client";
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function CancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<
    "idle" | "cancelling" | "success" | "error"
  >("idle");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCancel = async () => {
    if (status === "cancelling") return;
    if (!token) return;
    setStatus("cancelling");
    try {
      const res = await fetch(`/api/cruise/signup?token=${token}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to cancel");
      }
      const data = await res.json();
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
        <span className="mb-6 block text-4xl">⚠️</span>
        <h2 className="mb-2">Invalid Link</h2>
        <p className="mb-6">
          This cancel link is missing a token. Please use the link from your
          confirmation email.
        </p>
        <Link
          href="/cruise"
          className="text-[var(--color-accent)] transition-colors hover:text-white"
        >
          ← Back to Cruise Page
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md text-center">
      {status === "success" ? (
        <>
          <span className="mb-6 block text-4xl">✅</span>
          <h2 className="mb-2">Signup Cancelled</h2>
          <p className="mb-2">
            {name ? `Hey ${name}, your` : "Your"} cruise interest signup has
            been removed.
          </p>
          <p className="mb-8">
            A confirmation email has been sent. If you change your mind, you can
            always sign up again.
          </p>
          <Link
            href="/cruise"
            className="inline-block bg-[var(--color-accent)] px-8 py-3 transition-colors hover:bg-[var(--color-accent)]/80"
          >
            Back to Cruise Page
          </Link>
        </>
      ) : status === "error" ? (
        <>
          <span className="mb-6 block text-4xl">❌</span>
          <h2 className="mb-2">Couldn&apos;t Cancel</h2>
          <p className="mb-6">
            {errorMsg || "This link may have already been used or expired."}
          </p>
          <Link
            href="/cruise"
            className="text-[var(--color-accent)] transition-colors hover:text-white"
          >
            ← Back to Cruise Page
          </Link>
        </>
      ) : (
        <>
          <span className="mb-6 block text-4xl">🚢</span>
          <h1 className="mb-2 text-2xl">Cancel Your Cruise Signup?</h1>
          <p className="mb-8">
            This will remove your interest signup from the 7th Heaven cruise.
            You can always sign up again later.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCancel}
              disabled={status === "cancelling"}
              className="cursor-pointer bg-rose-500 px-8 py-3 transition-colors hover:bg-rose-400 disabled:opacity-70"
            >
              {status === "cancelling"
                ? "Cancelling..."
                : "Yes, Cancel My Signup"}
            </button>
            <Link
              href="/cruise"
              className="text-white/30 transition-colors hover:text-white"
            >
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
    <div className="flex min-h-screen items-center justify-center pt-[72px]">
      <Suspense
        fallback={
          <div className="text-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-lg border-2 border-white/10 border-t-white" />
          </div>
        }
      >
        <CancelContent />
      </Suspense>
    </div>
  );
}
