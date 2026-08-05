"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const ITEMS = [
  {
    id: 1,
    label: "Live at Frontier Days",
    sub: "Arlington Heights · 2024",
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
    color: "#9b3ff7",
  },
  {
    id: 2,
    label: "30 Songs in 30 Minutes",
    sub: "The Famous Medley",
    img: "https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&q=80",
    color: "#e11d48",
  },
  {
    id: 3,
    label: "Ain't That Just Beautiful",
    sub: "#1 Billboard Hit",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    color: "#0ea5e9",
  },
  {
    id: 4,
    label: "Be Here",
    sub: "Title Track · Album 2018",
    img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80",
    color: "#10b981",
  },
  {
    id: 5,
    label: "Behind The Scenes",
    sub: "Tour Life · 2023",
    img: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&q=80",
    color: "#9333ea",
  },
  {
    id: 6,
    label: "Fan Wall Highlights",
    sub: "Your Moments · Always",
    img: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",
    color: "#ec4899",
  },
  {
    id: 7,
    label: "Sing",
    sub: "From Album · Luminous",
    img: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80",
    color: "#6366f1",
  },
  {
    id: 8,
    label: "Better This Way",
    sub: "Color In Motion",
    img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80",
    color: "#14b8a6",
  },
];

const COUNT = ITEMS.length;
const ANGLE_STEP = 360 / COUNT;
const RADIUS = 380;

export default function CircleCarouselPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);

  // Keep ref in sync
  useEffect(() => { rotationRef.current = rotation; }, [rotation]);

  const getFrontIndex = useCallback((rot: number) => {
    const norm = ((rot % 360) + 360) % 360;
    return Math.round(norm / ANGLE_STEP) % COUNT;
  }, []);

  const goTo = useCallback((index: number) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const current = rotationRef.current;
    const target = index * ANGLE_STEP;
    const norm = ((current % 360) + 360) % 360;
    let diff = target - norm;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    setRotation(current - diff);
    setActiveIndex(index);
  }, []);

  const prev = useCallback(() => goTo((activeIndex - 1 + COUNT) % COUNT), [activeIndex, goTo]);
  const next = useCallback(() => goTo((activeIndex + 1) % COUNT), [activeIndex, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const onDragStart = useCallback((clientX: number) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    isDragging.current = true;
    setDragging(true);
    dragStartX.current = clientX;
    dragStartRotation.current = rotationRef.current;
    velocity.current = 0;
    lastX.current = clientX;
    lastTime.current = performance.now();
  }, []);

  const onDragMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) velocity.current = (clientX - lastX.current) / dt * 16;
    lastX.current = clientX;
    lastTime.current = now;
    const dx = clientX - dragStartX.current;
    const newRot = dragStartRotation.current - dx * 0.35;
    rotationRef.current = newRot;
    setRotation(newRot);
  }, []);

  const onDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);
    let vel = -velocity.current * 0.5;
    const animate = () => {
      if (Math.abs(vel) < 0.05) {
        // Snap to nearest
        const front = getFrontIndex(rotationRef.current);
        goTo(front);
        return;
      }
      vel *= 0.94;
      const newRot = rotationRef.current + vel;
      rotationRef.current = newRot;
      setRotation(newRot);
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
  }, [getFrontIndex, goTo]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const md = (e: MouseEvent) => onDragStart(e.clientX);
    const mm = (e: MouseEvent) => onDragMove(e.clientX);
    const mu = () => onDragEnd();
    const ts = (e: TouchEvent) => onDragStart(e.touches[0].clientX);
    const tm = (e: TouchEvent) => { e.preventDefault(); onDragMove(e.touches[0].clientX); };
    const te = () => onDragEnd();
    el.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", te);
    return () => {
      el.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", te);
    };
  }, [onDragStart, onDragMove, onDragEnd]);

  const activeItem = ITEMS[activeIndex];

  return (
    <div className="cc-page">
      <div className="cc-bg" />
      <div
        className="cc-bg-glow"
        style={{ background: `radial-gradient(ellipse 70% 50% at 50% 65%, ${activeItem.color}1a 0%, transparent 70%)` }}
      />

      <header className="cc-header">
        <Link href="/" className="cc-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Home
        </Link>
        <span className="cc-eyebrow">7th Heaven</span>
      </header>

      <div className="cc-title-area" key={activeIndex}>
        <p className="cc-sub">{activeItem.sub}</p>
        <h1 className="cc-title">{activeItem.label}</h1>
      </div>

      <div
        className="cc-stage"
        ref={containerRef}
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        <div
          className="cc-ring"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transition: dragging ? "none" : "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {ITEMS.map((item, i) => {
            const angle = i * ANGLE_STEP;
            const isActive = i === activeIndex;
            return (
              <div
                key={item.id}
                className={`cc-card${isActive ? " cc-card--active" : ""}`}
                style={{ transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)` }}
                onClick={() => { if (!dragging) goTo(i); }}
              >
                <div className="cc-card-inner" style={isActive ? { boxShadow: `0 0 80px ${item.color}44, 0 24px 48px rgba(0,0,0,0.6)` } : {}}>
                  <img src={item.img} alt={item.label} className="cc-img" draggable={false} />
                  <div className="cc-overlay" style={{ background: `linear-gradient(to top, ${item.color}dd 0%, ${item.color}22 40%, transparent 70%)` }} />
                  <div className="cc-text">
                    <span className="cc-text-sub">{item.sub}</span>
                    <span className="cc-text-label">{item.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cc-controls">
        <button className="cc-btn" onClick={prev} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="cc-dots">
          {ITEMS.map((_, i) => (
            <button
              key={i}
              className={`cc-dot${i === activeIndex ? " cc-dot--on" : ""}`}
              onClick={() => goTo(i)}
              aria-label={ITEMS[i].label}
              style={i === activeIndex ? { background: activeItem.color, width: 22 } : {}}
            />
          ))}
        </div>
        <button className="cc-btn" onClick={next} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <p className="cc-hint">Drag to spin &nbsp;·&nbsp; Arrow keys to navigate</p>

      <style>{`
        .cc-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #06060a;
          font-family: var(--font-barlow), "Barlow", sans-serif;
          -webkit-user-select: none;
          user-select: none;
        }
        .cc-bg {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse 100% 70% at 50% -10%, #1c0a35 0%, #06060a 55%);
          z-index: 0;
        }
        .cc-bg-glow {
          position: fixed;
          inset: 0;
          z-index: 0;
          transition: background 1s ease;
          pointer-events: none;
        }
        .cc-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          z-index: 50;
        }
        .cc-back {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.4);
          transition: color 0.2s;
        }
        .cc-back:hover { color: rgba(255,255,255,0.9); }
        .cc-eyebrow {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.25);
        }
        .cc-title-area {
          position: relative;
          z-index: 10;
          text-align: center;
          margin-bottom: 32px;
          animation: ccIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes ccIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cc-sub {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: rgba(255,255,255,0.35);
          margin-bottom: 8px;
        }
        .cc-title {
          font-size: clamp(1.6rem, 3.5vw, 2.8rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1;
          margin: 0;
        }
        /* Stage */
        .cc-stage {
          position: relative;
          z-index: 10;
          width: 100%;
          height: 340px;
          perspective: 1100px;
          perspective-origin: 50% 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cc-ring {
          position: relative;
          width: 0; height: 0;
          transform-style: preserve-3d;
        }
        .cc-card {
          position: absolute;
          width: 210px;
          height: 290px;
          top: -145px;
          left: -105px;
          cursor: pointer;
        }
        .cc-card-inner {
          width: 100%;
          height: 100%;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          position: relative;
          transform: scale(0.72);
          opacity: 0.35;
          filter: brightness(0.55) saturate(0.7);
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1),
                      opacity 0.5s ease,
                      filter 0.5s ease,
                      box-shadow 0.5s ease,
                      border-color 0.4s ease;
        }
        .cc-card--active .cc-card-inner {
          transform: scale(1.18);
          opacity: 1;
          filter: brightness(1) saturate(1);
          border-color: rgba(255,255,255,0.18);
        }
        .cc-img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }
        .cc-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .cc-text {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          transform: translateY(6px);
          opacity: 0;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .cc-card--active .cc-text {
          opacity: 1;
          transform: translateY(0);
        }
        .cc-text-sub {
          font-size: 0.58rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.65);
        }
        .cc-text-label {
          font-size: 0.88rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
        }
        /* Controls */
        .cc-controls {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 28px;
          margin-top: 44px;
        }
        .cc-btn {
          width: 46px; height: 46px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .cc-btn:hover {
          border-color: rgba(255,255,255,0.25);
          color: #fff;
          background: rgba(255,255,255,0.08);
          transform: scale(1.06);
        }
        .cc-btn:active { transform: scale(0.93); }
        .cc-dots {
          display: flex;
          gap: 7px;
          align-items: center;
        }
        .cc-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          padding: 0;
        }
        .cc-dot--on {
          border-radius: 3px;
          height: 6px;
        }
        .cc-hint {
          position: relative;
          z-index: 10;
          margin-top: 18px;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.18);
        }
        @media (max-width: 640px) {
          .cc-stage { height: 280px; }
          .cc-card { width: 170px; height: 240px; top: -120px; left: -85px; }
          .cc-header { padding: 16px 20px; }
        }
      `}</style>
    </div>
  );
}
