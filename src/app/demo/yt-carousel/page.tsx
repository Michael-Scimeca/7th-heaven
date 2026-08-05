"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const CustomYTPlayer = dynamic(() => import("@/components/CustomYTPlayer"), { ssr: false });

const VIDEOS = [
  { id: "BzHUNTZ66zY", title: "Ain't That Just Beautiful", year: 2025, duration: "3:35" },
  { id: "SWV7-pmtoA8", title: "Monster", year: 2021, duration: "4:48" },
  { id: "Es4TIoA2Emg", title: "Are We There Yet", year: 2021, duration: "3:57" },
  { id: "zAQL-diwq0A", title: "Wonderful World", year: 2020, duration: "3:21" },
  { id: "pUxsIGCmP3w", title: "Say It Already", year: 2020, duration: "3:29" },
  { id: "Rv6u0SMTUA4", title: "I See You Smile", year: 2020, duration: "3:32" },
  { id: "SRxUiTqwaZs", title: "This Is Where The Party's At", year: 2020, duration: "3:03" },
  { id: "rTZI2YYtUxY", title: "Always", year: 2017, duration: "3:18" },
];

const COUNT = VIDEOS.length;
const ANGLE_STEP = 360 / COUNT;
const RADIUS = 400;

const thumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

export default function YTCarouselPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const rafId = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
      if (playingIndex !== null) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPlayingIndex(activeIndex); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, activeIndex, playingIndex]);

  const onDragStart = useCallback((clientX: number) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    isDragging.current = true;
    didDrag.current = false;
    setDragging(true);
    dragStartX.current = clientX;
    dragStartRotation.current = rotationRef.current;
    velocity.current = 0;
    lastX.current = clientX;
    lastTime.current = performance.now();
  }, []);

  const onDragMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const dx = Math.abs(clientX - dragStartX.current);
    if (dx > 4) didDrag.current = true;
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) velocity.current = (clientX - lastX.current) / dt * 16;
    lastX.current = clientX;
    lastTime.current = now;
    const newRot = dragStartRotation.current - (clientX - dragStartX.current) * 0.35;
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

  const activeVideo = VIDEOS[activeIndex];
  const playingVideo = playingIndex !== null ? VIDEOS[playingIndex] : null;

  return (
    <div className="ytc-page">
      <div className="ytc-bg" />

      <header className="ytc-header">
        <Link href="/" className="ytc-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Home
        </Link>
        <span className="ytc-eyebrow">7th Heaven · Videos</span>
      </header>

      {/* Active video info */}
      <div className="ytc-info" key={activeIndex}>
        <p className="ytc-info-year">{activeVideo.year} · {activeVideo.duration}</p>
        <h1 className="ytc-info-title">{activeVideo.title}</h1>
        <button
          className="ytc-play-btn"
          onClick={() => setPlayingIndex(activeIndex)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Watch Now
        </button>
      </div>

      {/* 3D Carousel */}
      <div
        className="ytc-stage"
        ref={containerRef}
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        <div
          className="ytc-ring"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transition: dragging ? "none" : "transform 0.65s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {VIDEOS.map((video, i) => {
            const angle = i * ANGLE_STEP;
            const isActive = i === activeIndex;
            return (
              <div
                key={video.id}
                className={`ytc-card${isActive ? " ytc-card--active" : ""}`}
                style={{ transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)` }}
                onClick={() => {
                  if (didDrag.current) return;
                  if (isActive) {
                    setPlayingIndex(i);
                  } else {
                    goTo(i);
                  }
                }}
              >
                <div className="ytc-card-inner">
                  {/* Thumbnail */}
                  <img
                    src={thumb(video.id)}
                    alt={video.title}
                    className="ytc-thumb"
                    draggable={false}
                  />
                  {/* Overlay */}
                  <div className="ytc-card-overlay" />

                  {/* Play icon — only on active */}
                  {isActive && (
                    <div className="ytc-play-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  )}

                  {/* Title on card */}
                  <div className="ytc-card-info">
                    <span className="ytc-card-year">{video.year}</span>
                    <span className="ytc-card-title">{video.title}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="ytc-controls">
        <button className="ytc-btn" onClick={prev} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="ytc-dots">
          {VIDEOS.map((_, i) => (
            <button
              key={i}
              className={`ytc-dot${i === activeIndex ? " ytc-dot--on" : ""}`}
              onClick={() => goTo(i)}
              aria-label={VIDEOS[i].title}
            />
          ))}
        </div>
        <button className="ytc-btn" onClick={next} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <p className="ytc-hint">Drag to spin · Click front card to play · ← → to navigate</p>

      {/* Custom YouTube Player modal */}
      {playingVideo && (
        <CustomYTPlayer
          videoId={playingVideo.id}
          title={playingVideo.title}
          year={playingVideo.year}
          onClose={() => setPlayingIndex(null)}
          onNext={playingIndex !== null && playingIndex < VIDEOS.length - 1 ? () => {
            const next = (playingIndex! + 1) % COUNT;
            setPlayingIndex(next);
            goTo(next);
          } : undefined}
          onPrev={playingIndex !== null && playingIndex > 0 ? () => {
            const prev = (playingIndex! - 1 + COUNT) % COUNT;
            setPlayingIndex(prev);
            goTo(prev);
          } : undefined}
          hasNext={playingIndex !== null && playingIndex < VIDEOS.length - 1}
          hasPrev={playingIndex !== null && playingIndex > 0}
        />
      )}

      <style>{`
        .ytc-page {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #05050a;
          font-family: var(--font-barlow), "Barlow", sans-serif;
          -webkit-user-select: none;
          user-select: none;
        }
        .ytc-bg {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 90% 55% at 50% -5%, #1a0828 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, #0a0518 0%, transparent 60%),
            #05050a;
          z-index: 0;
        }
        .ytc-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 40px;
          z-index: 50;
        }
        .ytc-back {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; color: rgba(255,255,255,0.35);
          transition: color 0.2s;
        }
        .ytc-back:hover { color: rgba(255,255,255,0.85); }
        .ytc-eyebrow {
          font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.2em; color: rgba(255,255,255,0.2);
        }
        /* Info */
        .ytc-info {
          position: relative; z-index: 10;
          text-align: center; margin-bottom: 28px;
          animation: ytcIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes ytcIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ytc-info-year {
          font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.2em; color: rgba(255,255,255,0.3); margin-bottom: 8px;
        }
        .ytc-info-title {
          font-size: clamp(1.5rem, 3vw, 2.6rem); font-weight: 900;
          color: #fff; letter-spacing: -0.03em; line-height: 1; margin: 0 0 16px;
        }
        .ytc-play-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 24px; font-size: 0.78rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          background: #ff0000; color: #fff; border-radius: 6px; border: none;
          cursor: pointer; transition: all 0.2s ease;
        }
        .ytc-play-btn:hover { background: #cc0000; transform: translateY(-2px); }
        .ytc-play-btn:active { transform: scale(0.96); }
        /* Stage */
        .ytc-stage {
          position: relative; z-index: 10; width: 100%; height: 320px;
          perspective: 1100px; perspective-origin: 50% 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .ytc-ring {
          position: relative; width: 0; height: 0;
          transform-style: preserve-3d;
        }
        .ytc-card {
          position: absolute;
          width: 220px; height: 148px; /* 16:9 ratio */
          top: -74px; left: -110px;
          cursor: pointer;
        }
        .ytc-card-inner {
          width: 100%; height: 100%;
          border-radius: 10px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          position: relative;
          transform: scale(0.7);
          opacity: 0.3;
          filter: brightness(0.5) saturate(0.6);
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1),
                      opacity 0.5s ease, filter 0.5s ease,
                      box-shadow 0.5s ease, border-color 0.4s ease;
        }
        .ytc-card--active .ytc-card-inner {
          transform: scale(1.2);
          opacity: 1;
          filter: brightness(1) saturate(1);
          border-color: rgba(255,255,255,0.2);
          box-shadow: 0 0 0 1px rgba(255,0,0,0.3), 0 24px 60px rgba(0,0,0,0.7);
        }
        .ytc-thumb {
          width: 100%; height: 100%; object-fit: cover;
          display: block; pointer-events: none;
        }
        .ytc-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, transparent 100%);
          pointer-events: none;
        }
        .ytc-play-icon {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -65%);
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255,0,0,0.9);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 24px rgba(255,0,0,0.5);
          transition: transform 0.2s ease, background 0.2s;
        }
        .ytc-card--active:hover .ytc-play-icon {
          background: #ff0000;
          transform: translate(-50%, -65%) scale(1.1);
        }
        .ytc-play-icon svg { margin-left: 3px; }
        .ytc-card-info {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 10px 12px;
          display: flex; flex-direction: column; gap: 2px;
          transform: translateY(4px); opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .ytc-card--active .ytc-card-info { opacity: 1; transform: translateY(0); }
        .ytc-card-year {
          font-size: 0.55rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.55);
        }
        .ytc-card-title {
          font-size: 0.78rem; font-weight: 800; color: #fff; line-height: 1.2;
        }
        /* Controls */
        .ytc-controls {
          position: relative; z-index: 10;
          display: flex; align-items: center; gap: 28px;
          margin-top: 44px;
        }
        .ytc-btn {
          width: 44px; height: 44px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s ease;
        }
        .ytc-btn:hover {
          border-color: rgba(255,255,255,0.25); color: #fff;
          background: rgba(255,255,255,0.08); transform: scale(1.06);
        }
        .ytc-btn:active { transform: scale(0.93); }
        .ytc-dots { display: flex; gap: 7px; align-items: center; }
        .ytc-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,0.18);
          border: none; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1); padding: 0;
        }
        .ytc-dot--on {
          width: 18px; border-radius: 2.5px; background: #ff0000;
        }
        .ytc-hint {
          position: relative; z-index: 10; margin-top: 16px;
          font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.18em;
          color: rgba(255,255,255,0.15);
        }
        @media (max-width: 640px) {
          .ytc-stage { height: 260px; }
          .ytc-card { width: 176px; height: 99px; top: -50px; left: -88px; }
          .ytc-header { padding: 14px 20px; }
        }
      `}</style>
    </div>
  );
}
