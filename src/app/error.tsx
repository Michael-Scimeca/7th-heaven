"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [reported, setReported] = useState(false);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Caught:", error);

    // Send the error to our custom API to trigger the email alert
    if (!reported) {
      setReported(true);
      fetch('/api/report-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.stack || error.message,
          digest: error.digest,
          path: typeof window !== 'undefined' ? window.location.href : 'Server/Unknown',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server/Unknown',
        }),
      }).catch(err => {
        console.error("Failed to send error report:", err);
      });
    }
  }, [error, reported]);

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background styling */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600 opacity-5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-accent)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full bg-[#0a0a0f]/80 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-8 md:p-10 text-center relative z-10 shadow-[0_0_50px_rgba(225,29,72,0.05)]">
        <div className="w-20 h-20 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 mb-6 shadow-[0_0_20px_rgba(225,29,72,0.2)]">
          <span className="text-3xl">🔌</span>
        </div>
        
        <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-3">
          Signal <span className="text-rose-500">Lost</span>
        </h2>
        
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          Something unexpected happened and we lost connection to the stage. Don't worry, an alert has already been sent to our tech crew.
        </p>

        {error.digest && (
          <div className="mb-8 p-3 bg-black/40 border border-white/5 rounded-lg">
            <span className="text-xs font-bold uppercase tracking-widest text-white/30 block mb-1">Error Code</span>
            <span className="text-xs font-mono text-rose-400/80">{error.digest}</span>
          </div>
        )}

        <button
          onClick={() => reset()}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-[0.15em] text-xs rounded-xl border border-white/10 transition-all hover:border-white/20 shadow-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
