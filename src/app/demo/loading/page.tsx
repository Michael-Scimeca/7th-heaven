"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = [
  { label: "Deep Indigo",   value: "rgb(21 15 42)"   },
  { label: "Jet Black",     value: "#0a0a0a"          },
  { label: "Midnight Blue", value: "#020817"          },
  { label: "Rich Purple",   value: "#1a0033"          },
  { label: "Dark Slate",    value: "#0f172a"          },
  { label: "Deep Charcoal", value: "#111118"          },
  { label: "Blood Red",     value: "#1a0505"          },
  { label: "Forest Night",  value: "#071a0e"          },
];

export default function LoadingDemo() {
  const [pct, setPct]             = useState(0);
  const [done, setDone]           = useState(false);
  const [bg, setBg]               = useState(COLORS[0].value);
  const [showPicker, setShowPicker] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restart = () => { setPct(0); setDone(false); };

  useEffect(() => {
    if (done) return;
    let current = 0;
    const tick = () => {
      const remaining = 100 - current;
      const step = Math.max(0.15, remaining * 0.014 + Math.random() * 1.2);
      current = Math.min(100, current + step);
      setPct(current);
      if (current >= 100) { setDone(true); return; }
      timerRef.current = setTimeout(tick, 22 + Math.random() * 30);
    };
    timerRef.current = setTimeout(tick, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [done]);

  const displayPct = Math.floor(pct);
  const BAR_HEIGHT = "28vh";

  return (
    <>
      <style>{`
        header, footer, nav { display: none !important; }
        body, html { overflow: hidden !important; margin: 0; padding: 0; }
        @keyframes pulse   { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes fadein  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
      `}</style>

      <div style={{
        position: "fixed", inset: 0,
        width: "100vw", height: "100vh",
        overflow: "hidden",
        background: bg,
        zIndex: 9999,
        transition: "background 0.5s ease",
      }}>

        {/* White progress bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          height: BAR_HEIGHT, width: `${pct}%`,
          background: "#ffffff",
          transition: "transform 0.04s linear",
        }} />

        {/* Counter rides the leading edge */}
        <div style={{
          position: "absolute", bottom: BAR_HEIGHT,
          left: `${pct}%`, transform: "translateX(-100%)",
          transition: "left 0.04s linear",
          paddingBottom: "12px", paddingRight: "4px",
          pointerEvents: "none",
        }}>
          <span style={{
            fontFamily: "var(--font-heading,'Impact',sans-serif)",
            fontWeight: 900,
            fontSize: "clamp(24px,4vw,52px)",
            color: "#ffffff",
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            fontStyle: "italic",
          }}>
            {displayPct}
            <span style={{ fontSize: "0.55em", opacity: 0.7, marginLeft: "2px" }}>/100%</span>
          </span>
        </div>

        {/* Done — click anywhere to restart */}
        {done && (
          <button type="button" onClick={restart} style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", border: "none", background: "transparent"
          }}>
            <span style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 11, fontWeight: 900,
              textTransform: "uppercase", letterSpacing: "0.2em",
              fontFamily: "sans-serif",
              animation: "pulse 2s ease-in-out infinite",
            }}>
              Click to restart
            </span>
          </button>
        )}

        {/* ── Floating controls top-right ── */}
        <div style={{
          position: "absolute", top: 20, right: 20,
          display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
          zIndex: 10001,
        }}>
          <button aria-label="Action button" onClick={restart} style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff", fontSize: 10, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.15em",
            padding: "7px 16px", borderRadius: 999, cursor: "pointer",
            fontFamily: "sans-serif",
          }}>
            ↺ Restart
          </button>

          <button aria-label="Action button" onClick={() => setShowPicker(p => !p)} style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff", fontSize: 10, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.15em",
            padding: "7px 16px", borderRadius: 999, cursor: "pointer",
            fontFamily: "sans-serif",
          }}>
            🎨 Background
          </button>

          {showPicker && (
            <div style={{
              background: "rgba(8,8,18,0.94)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 14, padding: 10,
              display: "flex", flexDirection: "column", gap: 4,
              backdropFilter: "blur(16px)",
              animation: "fadein 0.18s ease",
              minWidth: 170,
            }}>
              {COLORS.map((c) => (
                <button aria-label="Action button"
                  key={c.value}
                  onClick={() => { setBg(c.value); setShowPicker(false); restart(); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: bg === c.value ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "1px solid " + (bg === c.value ? "rgba(255,255,255,0.25)" : "transparent"),
                    borderRadius: 8, padding: "7px 10px",
                    cursor: "pointer",
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: c.value,
                    border: "1px solid rgba(255,255,255,0.2)",
                    flexShrink: 0, display: "inline-block",
                  }} />
                  <span style={{
                    color: "#fff", fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    fontFamily: "sans-serif",
                  }}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
