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
          path: typeof window !== 'undefined' ? window.location.href : 'Root Layout / Server',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
        }),
      }).catch(err => {
        console.error("Failed to send global error report:", err);
      });
    }
  }, [error, reported]);

  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: '100vh', backgroundColor: '#050508', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Critical System Error</h1>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
              A critical error occurred in the application root. Our development team (Mikey) has been notified automatically.
            </p>
            <button 
              onClick={() => reset()}
              style={{ padding: '12px 24px', backgroundColor: 'transparent', color: 'white', border: '1px solid #3f3f46', borderRadius: '8px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px', fontWeight: 'bold' }}
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
