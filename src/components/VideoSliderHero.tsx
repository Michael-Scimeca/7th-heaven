"use client";

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import Core, { damp } from "smooothy";
import gsap from "gsap";

/* ─── Album → video mapping (same order as ALBUMS in VinylHeroPlayer) ─── */
export const ALBUM_SLIDES = [
  { id: "be-here",         src: "/movie/Behere-hero.mp4" },
  { id: "color-in-motion", src: "/movie/hero-colorinmostion.mp4" },
  { id: "luminous",        src: "/movie/luminous.mp4" },
  { id: "next",            src: "/movie/next.mp4" },
  { id: "spectrum",        src: "/movie/spectrum.mp4" },
] as const;

/* ─── Public API exposed via ref ─── */
export type VideoSliderHandle = {
  goToIndex: (idx: number) => void;
};

interface Props {
  /** Called when the active slide changes (by drag or programmatic) */
  onSlideChange?: (albumId: string, idx: number) => void;
}

/* ─────────────────────────────────────────────────────────────────── */
const VideoSliderHero = forwardRef<VideoSliderHandle, Props>(
  ({ onSlideChange }, ref) => {
    const outerRef    = useRef<HTMLDivElement>(null);
    const wrapperRef  = useRef<HTMLDivElement>(null);
    const sliderRef   = useRef<Core | null>(null);
    const videoEls    = useRef<(HTMLVideoElement | null)[]>([]);
    const currentIdx  = useRef(0);
    const onChangeRef = useRef(onSlideChange);

    /* keep callback ref fresh without recreating slider */
    useEffect(() => { onChangeRef.current = onSlideChange; }, [onSlideChange]);

    /* ── expose goToIndex ── */
    useImperativeHandle(ref, () => ({
      goToIndex(idx: number) {
        if (sliderRef.current && idx !== currentIdx.current) {
          sliderRef.current.goToIndex(idx);
        }
      },
    }));

    /* ── init smooothy after mount ── */
    useEffect(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      let lerpedSpeed = 0;

      /* Helper: update dot styles without React re-render */
      const setActiveDot = (_idx: number) => {}; // dots removed

      const slider = new Core(wrapper, {
        infinite: false,
        snap: true,
        lerpFactor: 0.06,          // ultra-smooth glide
        dragSensitivity: 0.003,
        speedDecay: 0.88,

        onSlideChange(current, _previous) {
          currentIdx.current = current;
          setActiveDot(current);

          /* autoplay active video, pause others */
          videoEls.current.forEach((v, i) => {
            if (!v) return;
            if (i === current) v.play().catch(() => {});
            else v.pause();
          });

          onChangeRef.current?.(ALBUM_SLIDES[current].id, current);
        },

        /* Parallax + Speed effect */
        onUpdate(core) {
          lerpedSpeed = damp(lerpedSpeed, core.speed, 5, core.deltaTime);
          const pv = core.parallaxValues;
          if (!pv) return;
          videoEls.current.forEach((el, i) => {
            if (!el) return;
            const offset = pv[i] * Math.abs(lerpedSpeed) * 22;
            // Keep the -50% centering and add the parallax offset on top
            el.style.transform = `translateX(calc(-50% + ${offset}%))`;
          });
        },
      });

      sliderRef.current = slider;

      /* wire into gsap ticker so the slider stays in sync with everything else */
      const tick = () => slider.update();
      gsap.ticker.add(tick);

      /* prime first slide */
      videoEls.current[0]?.play().catch(() => {});

      return () => {
        gsap.ticker.remove(tick);
        slider.destroy();
        sliderRef.current = null;
      };
    }, []); // run once on mount

    return (
      /* Outer clip container — sits behind everything else in the hero card */
      <div
        ref={outerRef}
        style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}
      >
        {/* ── Smooothy wrapper (flex row of slides) ── */}
        <div
          ref={wrapperRef}
          style={{ display: "flex", width: "100%", height: "100%" }}
        >
          {ALBUM_SLIDES.map((album, i) => (
            <div
              key={album.id}
              style={{
                flexShrink: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/*
                Video is 120% wide, centered via left:50% + translateX(-50%).
                Parallax offset is applied on top, so at rest it's perfectly
                centred and shifts symmetrically during a fast drag.
              */}
              <video
                ref={(el) => { videoEls.current[i] = el; }}
                muted
                loop
                playsInline
                preload={i === 0 ? "auto" : "metadata"}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  width: "120%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center center",
                  transform: "translateX(-50%)",
                  willChange: "transform",
                }}
              >
                <source src={album.src} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>

      </div>
    );
  }
);

VideoSliderHero.displayName = "VideoSliderHero";
export default VideoSliderHero;
