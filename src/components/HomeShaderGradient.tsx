"use client";
/* oxlint-disable react-doctor/effect-needs-cleanup */
/* eslint-disable react-doctor/effect-needs-cleanup */

import React, { useEffect, useRef } from "react";
import { NeatGradient } from "@firecms/neat";

const GRADIENT_SETTINGS = {
  shapeType: "plane",
  resolution: 1,
  renderScale: 1,
  wireframe: false,
  flatShading: false,
  antialiasing: true,
  yOffset: 0,
  yOffsetWaveMultiplier: 4,
  yOffsetColorMultiplier: 4,
  yOffsetFlowMultiplier: 4,
  planeBend: 0,
  planeTwist: 0,
  sphereRadius: 1,
  torusRadius: 1,
  torusTube: 0.4,
  cylinderRadius: 1,
  cylinderHeight: 2,
  silhouetteFade: 0,
  cylinderFade: 0,
  ribbonFade: 0,
  shapeRotationX: 0,
  shapeRotationY: 0,
  shapeRotationZ: 0,
  shapeAutoRotateSpeedX: 0,
  shapeAutoRotateSpeedY: 0,
  cameraLock: false,
  cameraZoom: 3,
  cameraX: -2.65,
  cameraY: -4.95,
  cameraZ: 0,
  cameraRotationX: 0,
  cameraRotationY: 0,
  cameraRotationZ: 0,
  speed: 3,
  patternScale: 1,
  waveFrequencyX: 1.5,
  waveFrequencyY: 2,
  waveAmplitude: 0.6,
  flowEnabled: true,
  flowDistortionA: 0.3,
  flowDistortionB: 0.3,
  flowScale: 0.5,
  flowEase: 0.3,
  domainWarpEnabled: false,
  domainWarpIntensity: 3,
  domainWarpScale: 3,
  positionOverlayEnabled: true,
  colorMovePeriod: 4,
  colorBlending: 10,
  horizontalPressure: 3,
  verticalPressure: 3,
  backgroundColor: "#05030a",
  backgroundAlpha: 1,
  enableProceduralTexture: false,
  shadows: 10,
  highlights: 10,
  colorSaturation: 10,
  colorBrightness: 0.5,
  vignetteIntensity: 0,
  vignetteRadius: 0.76,
  bloomIntensity: 0,
  bloomThreshold: 0.6,
  chromaticAberration: 0,
  fresnelEnabled: false,
  fresnelPower: 2,
  fresnelIntensity: 0.5,
  fresnelColor: "#8b6ae6",
  iridescenceEnabled: false,
  iridescenceIntensity: 0.9,
  iridescenceSpeed: 0,
  grainIntensity: 0,
  grainScale: 0,
  grainSparsity: 0,
  grainSpeed: 0,
  colors: [
    { color: "#01030e", enabled: true, influence: 0.55, posX: 64.4, posY: 88, size: 90, opacity: 0.7, moveX: 200, moveY: 800 },
    { color: "#20162c", enabled: true, influence: 1, posX: 48.4, posY: 50, size: 45, opacity: 0.7, moveX: 45, moveY: 0 },
    { color: "#7c0404", enabled: true, influence: 1, posX: 97, posY: 21, size: 39, opacity: 0.7, moveX: 130, moveY: 40 },
    { color: "#16091b", enabled: true, influence: 1, posX: 31, posY: 100, size: 90, opacity: 0.7, moveX: 200, moveY: 60 },
    { color: "#0f052e", enabled: true, influence: 1, posX: 5.7, posY: 67.5, size: 41, opacity: 0.7, moveX: 198, moveY: 135 },
    { color: "#1d0a29", enabled: true, influence: 0.95, posX: 20, posY: 4, size: 90, opacity: 1, moveX: 200, moveY: 200 },
    { color: "#1f11ee", enabled: true, influence: 1, posX: 15, posY: 50, size: 45, opacity: 0.7, moveX: 50, moveY: 30 }
  ]
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function HomeShaderGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionLayerRef = useRef<HTMLDivElement>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Skip WebGL gradient on mobile — too GPU intensive; CSS background used instead
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    let neatInstance: NeatGradient | null = null;
    let watermarkTimeout: NodeJS.Timeout | null = null;
    let idleId: any = null;

    const initNeat = () => {
      if (!canvasRef.current) return;
      try {
        neatInstance = new NeatGradient({
          ref: canvasRef.current,
          colors: GRADIENT_SETTINGS.colors.map((c) => ({
            color: c.color,
            enabled: c.enabled,
            influence: c.influence
          })),
        speed: GRADIENT_SETTINGS.speed,
        waveAmplitude: GRADIENT_SETTINGS.waveAmplitude,
        waveFrequencyX: GRADIENT_SETTINGS.waveFrequencyX,
        waveFrequencyY: GRADIENT_SETTINGS.waveFrequencyY,
        colorBlending: GRADIENT_SETTINGS.colorBlending,
        colorSaturation: GRADIENT_SETTINGS.colorSaturation,
        colorBrightness: GRADIENT_SETTINGS.colorBrightness,
        horizontalPressure: GRADIENT_SETTINGS.horizontalPressure,
        verticalPressure: GRADIENT_SETTINGS.verticalPressure,
        shadows: GRADIENT_SETTINGS.shadows,
        highlights: GRADIENT_SETTINGS.highlights,
        grainIntensity: 0, // Grain handled via overlay canvas
        resolution: 0.7, // Optimized resolution for smooth 60fps scrolling on High-DPI/Retina screens
        wireframe: GRADIENT_SETTINGS.wireframe,
        flatShading: GRADIENT_SETTINGS.flatShading,
        antialias: false,
        flowEnabled: GRADIENT_SETTINGS.flowEnabled,
        flowDistortionA: GRADIENT_SETTINGS.flowDistortionA,
        flowDistortionB: GRADIENT_SETTINGS.flowDistortionB,
        flowScale: GRADIENT_SETTINGS.flowScale,
        flowEase: GRADIENT_SETTINGS.flowEase,
        domainWarpEnabled: GRADIENT_SETTINGS.domainWarpEnabled,
        yOffset: GRADIENT_SETTINGS.yOffset,
        yOffsetWaveMultiplier: GRADIENT_SETTINGS.yOffsetWaveMultiplier,
        yOffsetColorMultiplier: GRADIENT_SETTINGS.yOffsetColorMultiplier,
        yOffsetFlowMultiplier: GRADIENT_SETTINGS.yOffsetFlowMultiplier,
        backgroundColor: GRADIENT_SETTINGS.backgroundColor,
        backgroundAlpha: GRADIENT_SETTINGS.backgroundAlpha,
        shapeType: GRADIENT_SETTINGS.shapeType as any,
        cameraLock: GRADIENT_SETTINGS.cameraLock,
        cameraX: GRADIENT_SETTINGS.cameraX,
        cameraY: GRADIENT_SETTINGS.cameraY,
        cameraZ: GRADIENT_SETTINGS.cameraZ,
        cameraZoom: GRADIENT_SETTINGS.cameraZoom
      });

      // Completely disable WebGL watermark rendering pass inside NeatGradient canvas
      if (neatInstance) {
        (neatInstance as any)._licensed = true;
        (neatInstance as any)._renderWatermark = () => { };
        // Expose instance globally so style guide canvas controls can update it live
        (window as any).__neatInstance = neatInstance;
      }

      // Remove any Neat watermark link injected into DOM
      watermarkTimeout = setTimeout(() => {
        if (canvasRef.current?.parentElement) {
          const links = canvasRef.current.parentElement.querySelectorAll("a");
          links.forEach((l) => l.remove());
        }
        document.querySelectorAll('a[href*="neat"], a[href*="firecms"], .neat-link').forEach((l) => l.remove());
      }, 50);
    } catch (e) {
      console.warn("NeatGradient init fallback:", e);
    }
  };

  if ("requestIdleCallback" in window) {
    idleId = (window as any).requestIdleCallback(initNeat);
  } else {
    idleId = setTimeout(initNeat, 1000);
  }

    // ── Position Overlay Animation ──
    let animFrameId: number;
    const startMs = performance.now();
    let isVisible = true;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    let lastFrameTime = 0;

    const onScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && canvasRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0.01 });
      observer.observe(canvasRef.current);
    }

    const updatePositionLayer = (t: number) => {
      if (!positionLayerRef.current) return;
      const periodMs = GRADIENT_SETTINGS.colorMovePeriod * 1000;
      const basePhase = (((t - startMs) % periodMs) / periodMs) * Math.PI * 2;
      const winW = typeof window !== "undefined" ? window.innerWidth : 1920;
      const winH = typeof window !== "undefined" ? window.innerHeight : 1080;

      const layers = GRADIENT_SETTINGS.colors.flatMap((c, idx) => {
        if (!c.enabled) return [];
        const phase = basePhase + idx * (Math.PI / 4);
        const mx = (c.moveX / winW) * 100;
        const my = (c.moveY / winH) * 100;
        const x = Math.max(0, Math.min(100, c.posX + Math.sin(phase) * mx));
        const y = Math.max(0, Math.min(100, c.posY + Math.cos(phase) * my));
        return [`radial-gradient(circle at ${x}% ${y}%, ${hexToRgba(c.color, c.opacity)} 0%, transparent ${c.size}%)`];
      });

      positionLayerRef.current.style.background = layers.join(", ");
    };

    const positionLoop = (t: number) => {
      // Pause position updates during active scrolling or hidden document to free CPU/GPU
      if (isVisible && !isScrolling && !document.hidden && !(typeof window !== "undefined" && (window as unknown as Record<string, boolean>).__pageTransitionActive)) {
        const frameCap = (typeof window !== "undefined" && window.innerWidth < 768) ? 66 : 40; // 15 FPS on mobile, 25 FPS on desktop
        if (t - lastFrameTime > frameCap) {
          updatePositionLayer(t);
          lastFrameTime = t;
        }
      }
      animFrameId = requestAnimationFrame(positionLoop);
    };

    animFrameId = requestAnimationFrame(positionLoop);

    // ── Grain Overlay Canvas (Optimized 256x256 Tile Pattern) ──
    const grainCanvas = grainCanvasRef.current;
    if (grainCanvas) {
      const ctx = grainCanvas.getContext("2d");
      const generateGrainTile = () => {
        grainCanvas.width = 256;
        grainCanvas.height = 256;
        if (ctx) {
          const w = 256;
          const h = 256;
          const intensity = GRADIENT_SETTINGS.grainIntensity;
          ctx.clearRect(0, 0, w, h);
          if (intensity > 0) {
            const imgData = ctx.createImageData(w, h);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              const v = Math.random() < 0.5 ? 0 : 255;
              const a = Math.floor(Math.random() * intensity * 180);
              data[i] = v;
              data[i + 1] = v;
              data[i + 2] = v;
              data[i + 3] = a;
            }
            ctx.putImageData(imgData, 0, 0);
          }
        }
      };
      generateGrainTile();

      return () => {
        if (idleId) {
          if ("cancelIdleCallback" in window) (window as any).cancelIdleCallback(idleId);
          else clearTimeout(idleId);
        }
        if (watermarkTimeout) {
          clearTimeout(watermarkTimeout);
        }
        if (typeof window !== "undefined") {
          window.removeEventListener("scroll", onScroll);
        }
        if (observer) {
          observer.disconnect();
        }
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
        }
        neatInstance?.destroy?.();
      };
    }

    return () => {
      if (idleId) {
        if ("cancelIdleCallback" in window) (window as any).cancelIdleCallback(idleId);
        else clearTimeout(idleId);
      }
      if (watermarkTimeout) {
        clearTimeout(watermarkTimeout);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", onScroll);
      }
      if (observer) {
        observer.disconnect();
      }
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
      neatInstance?.destroy?.();
    };
  }, []);

  // Static Film Grain (fixed seed so grain layer does not move or jitter)
  useEffect(() => {
    const feTurb = document.querySelector("#globalGrainFilter feTurbulence");
    if (feTurb) {
      feTurb.setAttribute("seed", "42");
    }
  }, []);

  return (
    <>
      {/* Fixed Full-Page Film Grain Overlay Layer — Covers the ENTIRE page over all content */}
      <div
        id="global-film-grain-overlay"
        className="fixed inset-0 pointer-events-none z-[99999] transition-opacity duration-200"
        style={{
          opacity: `var(--canvas-grain-opacity, 0.18)`,
          mixBlendMode: `var(--canvas-grain-blend, overlay)` as any,
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}>
          <filter id="globalGrainFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#globalGrainFilter)" />
        </svg>
      </div>

      {/* Background Shader Canvas Container */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-transparent">
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full block pointer-events-none" />
        <div ref={positionLayerRef} className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-300" />
      </div>
    </>
  );
}
