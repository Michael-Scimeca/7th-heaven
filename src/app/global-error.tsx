"use client";

import { useEffect, useRef, useCallback } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reported = useRef(false);
  const resetAttempted = useRef(false);

  const reportError = useCallback(
    async (errToReport: Error & { digest?: string }) => {
      if (reported.current) return;
      reported.current = true;
      try {
        await fetch("/api/report-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            error: errToReport.stack || errToReport.message,
            digest: errToReport.digest,
            path:
              typeof window !== "undefined"
                ? window.location.href
                : "Root Layout / Server",
            userAgent:
              typeof window !== "undefined"
                ? window.navigator.userAgent
                : "Unknown",
          }),
        });
      } catch (err) {
        console.error("Global Error Reporting Failed silently:", err);
      }
    },
    [],
  );

  useEffect(() => {
    // Auto-recover immediately for transient DOM reconciliation errors
    // (e.g. browser extensions mutating the DOM, Lenis/GSAP scroll patches)
    const isDomError =
      error.message?.includes("insertBefore") ||
      error.message?.includes("removeChild") ||
      error.message?.includes("NotFoundError") ||
      error.message?.includes("The node before") ||
      error.message?.includes("is not a child") ||
      error.message?.includes("Hydration") ||
      error.message?.includes("hydration") ||
      error.message?.includes("Module not found") ||
      error.message?.includes("Cannot find module") ||
      error.name === "ChunkLoadError" ||
      error.message?.includes("ChunkLoadError") ||
      error.message?.includes("Failed to load chunk");

    if (isDomError && !resetAttempted.current) {
      resetAttempted.current = true;
      // Give React one tick to stabilise before resetting
      const t = setTimeout(() => reset(), 100);
      return () => clearTimeout(t);
    }

    reportError(error);
  }, [error, reset, reportError]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-[#050508] p-5 font-sans text-white">
          <div className="max-w-[400px] text-center">
            <h1 className="text-rose-500">
              Critical System Error
            </h1>
            <p className="mb-7.5 text-sm leading-relaxed text-zinc-400">
              A critical error occurred in the application root. Our development
              team (Mikey) has been notified automatically.
            </p>
            <button
              onClick={() => reset()}
              className="cursor-pointer rounded-lg border border-zinc-700 bg-transparent px-6 py-3 text-xs font-bold tracking-widest text-white"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
