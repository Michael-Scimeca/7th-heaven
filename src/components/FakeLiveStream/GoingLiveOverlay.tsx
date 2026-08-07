'use client';

import React, { useState, useEffect } from 'react';
import type { CrewConfig } from './constants';

export function GoingLiveOverlay({ onComplete, crew }: { onComplete: () => void; crew: CrewConfig }) {
  const [phase, setPhase] = useState<'connecting' | 'initializing' | 'live'>('connecting');
  const [faded, setFaded] = useState(false);

  // Use RAF + Date.now() so it works even in background tabs
  useEffect(() => {
    const start = Date.now();
    let rafId: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= 1800 && elapsed < 3600) setPhase('initializing');
      else if (elapsed >= 3600) setPhase('live');
      if (elapsed >= 4200) setFaded(true);
      if (elapsed >= 5000) {
        onComplete();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      style={{
        transition: 'opacity 0.8s ease',
        opacity: faded ? 0 : 1,
        pointerEvents: faded ? 'none' : 'all',
      }}
    >
      <style>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes ring-expand {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes blink-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
        animation: 'scan-line 2s linear infinite',
      }} />

      {/* Center */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Pulsing rings */}
        <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 24px' }}>
          {[0, 0.4, 0.8].map((delay, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0, border: '2px solid rgba(255,10,61,0.4)',
              borderRadius: '50%',
              animation: `ring-expand 2s ${delay}s ease-out infinite`,
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle, rgba(255,10,61,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 36 }}>{crew.badge}</span>
          </div>
        </div>

        <div style={{
          fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)', marginBottom: 12,
        }}>
          7th Heaven
        </div>

        {phase === 'connecting' && (
          <div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: 22, letterSpacing: '0.05em', marginBottom: 8 }}>
              Connecting...
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#a855f7',
                  animation: `blink-dot 1s ${d}s ease-in-out infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        {phase === 'initializing' && (
          <div>
            <div style={{ color: '#a855f7', fontWeight: 900, fontSize: 22, letterSpacing: '0.05em', marginBottom: 8 }}>
              Crew member is going live
            </div>
            <div style={{
              padding: '6px 16px', background: 'rgba(255,10,61,0.15)',
              border: '1px solid rgba(255,10,61,0.4)', borderRadius: 8,
              color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              {crew.name} · {crew.instrument}
            </div>
          </div>
        )}
        {phase === 'live' && (
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#dc2626', padding: '8px 24px', borderRadius: 999,
              color: 'white', fontWeight: 900, fontSize: 18, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: '0 0 30px rgba(220,38,38,0.5)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: 'white',
                animation: 'blink-dot 0.8s ease-in-out infinite',
              }} />
              YOU'RE LIVE
            </div>
          </div>
        )}
      </div>

      {/* Skip button */}
      <button aria-label="Action button"
        onClick={onComplete}
        style={{
          position: 'absolute', bottom: 32, right: 32,
          padding: '8px 20px', background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
          color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
        }}
      >
        Skip →
      </button>

      {/* Noise texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
