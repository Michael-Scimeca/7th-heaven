"use client";

import { useEffect, useRef } from "react";

// Transparent looping band video keyed from a green-screen render (scripts/key-band-video.py).
// Safari/iOS only support alpha in HEVC, everyone else in VP9 WebM, so the .mov is listed
// first with a quicktime type that non-Safari browsers skip. /movie/* is served immutable,
// so bump the -vN suffix whenever the files are re-encoded.
const SRC_HEVC = "/movie/band-loop-v1.mov";
const SRC_WEBM = "/movie/band-loop-v1.webm";

export default function BandVideoLoop({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    // only decode while on screen
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={`pointer-events-none aspect-[2/1] w-full bg-transparent ${className}`}
      muted
      loop
      playsInline
      preload="auto"
      aria-label="Cartoon 7th Heaven band rocking out"
    >
      <source src={SRC_HEVC} type='video/quicktime; codecs="hvc1"' />
      <source src={SRC_WEBM} type="video/webm" />
    </video>
  );
}
