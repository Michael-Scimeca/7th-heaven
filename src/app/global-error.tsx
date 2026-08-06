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

  const reportError = useCallback(async (errToReport: Error & { digest?: string }) => {
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
  }, []);

  useEffect(() => {
    // Auto-recover immediately for transient DOM reconciliation errors
    // (e.g. browser extensions mutating the DOM, Lenis/GSAP scroll patches)
    const isDomError =
      error.message?.includes("insertBefore") ||
      error.message?.includes("removeChild") ||
      error.message?.includes("NotFoundError") ||
      error.message?.includes("The node before") ||
      error.message?.includes("is not a child");

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
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#050508",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
            padding: "20px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <h1
              style={{
                color: "#f43f5e",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Critical System Error
            </h1>
            <p
              style={{
                color: "#a1a1aa",
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "30px",
              }}
            >
              A critical error occurred in the application root. Our development
              team (Mikey) has been notified automatically.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "12px 24px",
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
