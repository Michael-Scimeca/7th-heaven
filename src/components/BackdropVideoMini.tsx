"use client";

/**
 * Small live preview of the page's backdrop video, with a progress bar and time.
 * It draws the video element that is already playing, so it needs no second download.
 */

import { useEffect, useRef, useState } from "react";
import BackdropVideoPicker from "@/components/BackdropVideoPicker";

const WIDTH = 160;
const HEIGHT = 90;
const DRAW_EVERY_MS = 66; // about 15 frames a second is plenty at this size

const formatTime = (seconds: number) => {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

export default function BackdropVideoMini() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [time, setTime] = useState("0:00 / 0:00");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    let lastDraw = 0;
    let shownTime = "";
    let shownVideo = false;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - lastDraw < DRAW_EVERY_MS) return;
      lastDraw = now;

      // During a crossfade two videos exist; the newest one is last
      const videos = document.querySelectorAll<HTMLVideoElement>('video[class*="backdrop-video-crossfade"]');
      const video = videos[videos.length - 1];
      const ready = Boolean(video && video.readyState >= 2 && video.duration > 0);
      if (ready !== shownVideo) {
        shownVideo = ready;
        setHasVideo(ready);
      }
      if (!ready || !video) return;

      canvasRef.current?.getContext("2d")?.drawImage(video, 0, 0, WIDTH, HEIGHT);
      // The backdrop may replay only the start of the file, so measure against that length
      const length = Math.min(video.duration, Number(video.dataset.loopSeconds) || video.duration);
      const progress = Math.min(1, video.currentTime / length);
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      trackRef.current?.setAttribute("aria-valuenow", String(Math.round(progress * 100)));

      const nextTime = `${formatTime(video.currentTime)} / ${formatTime(length)}`;
      if (nextTime !== shownTime) {
        shownTime = nextTime;
        setTime(nextTime);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
    <div
      className={`fixed bottom-[232px] left-8 z-[999999] w-[160px] overflow-hidden rounded-lg border border-white/20 bg-black/50 shadow-lg backdrop-blur-md ${hasVideo ? "" : "hidden"}`}
      aria-label="Background video preview"
      role="group"
    >
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block h-[90px] w-full" />
      <div
        ref={trackRef}
        role="progressbar"
        aria-label="Background video progress"
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1 w-full bg-white/20"
      >
        <div ref={barRef} className="h-full w-full origin-left bg-[#f5b942]" style={{ transform: "scaleX(0)" }} />
      </div>
      <div className="flex items-center justify-between px-2 py-1">
        <p className="m-0 text-[11px] leading-4 text-white tabular-nums">{time}</p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="cursor-pointer rounded border border-white/30 bg-transparent px-1.5 text-[11px] leading-4 text-white hover:border-[#f5b942] hover:text-[#fffbb5]"
        >
          Change
        </button>
      </div>
    </div>
    {pickerOpen && <BackdropVideoPicker onClose={() => setPickerOpen(false)} />}
    </>
  );
}
