"use client";
/* oxlint-disable react-doctor/effect-needs-cleanup */
/* eslint-disable react-doctor/effect-needs-cleanup */

import React, { useEffect, useRef } from "react";

const GRADIENT_SETTINGS = {
  colors: [
    { color: '#800583', enabled: true, posX: 20, posY: 20, size: 70, opacity: 0.7, moveX: 100, moveY: 100 },
    { color: '#133EA6', enabled: true, posX: 40, posY: 30, size: 60, opacity: 0.7, moveX: 120, moveY: 80 },
    { color: '#1C004E', enabled: true, posX: 60, posY: 50, size: 65, opacity: 0.7, moveX: 90, moveY: 110 },
    { color: '#7C11BB', enabled: true, posX: 30, posY: 70, size: 75, opacity: 0.7, moveX: 110, moveY: 90 },
    { color: '#571694', enabled: true, posX: 70, posY: 80, size: 80, opacity: 0.7, moveX: 80, moveY: 120 },
    { color: '#631A6F', enabled: true, posX: 80, posY: 30, size: 55, opacity: 0.7, moveX: 130, moveY: 70 },
  ],
  colorMovePeriod: 4,
  speed: 2,
  horizontalPressure: 6,
  verticalPressure: 6,
  waveFrequencyX: 6,
  waveFrequencyY: 2,
  waveAmplitude: 2,
  secondaryWaveEnabled: false,
  secondaryWaveFrequencyX: 3,
  secondaryWaveFrequencyY: 3,
  secondaryWaveAmplitude: 5,
  secondaryWaveSpeed: 0.6,
  secondaryWaveAngle: 1,
  shadows: 6,
  highlights: 1,
  colorBrightness: 0.45,
  colorSaturation: 2,
  wireframe: false,
  antialias: false,
  colorBlending: 6,
  backgroundColor: '#05030a',
  backgroundAlpha: 0,
  grainScale: 0,
  grainSparsity: 0,
  grainIntensity: 0,
  grainSpeed: 1,
  resolution: 2,
  renderScale: 0.45,
  yOffset: 50041,
  yOffsetWaveMultiplier: 0,
  yOffsetColorMultiplier: 10.1,
  yOffsetFlowMultiplier: 7,
  flowDistortionA: 2.2,
  flowDistortionB: 3.8,
  flowScale: 0.5,
  flowEase: 0.22,
  flowEnabled: true,
  enableProceduralTexture: false,
  transparentTextureVoid: false,
  textureMode: 'bitmap',
  bakeEdgeSoftness: 1,
  textureVoidLikelihood: 0.45,
  textureVoidWidthMin: 200,
  textureVoidWidthMax: 486,
  textureBandDensity: 2.15,
  textureColorBlending: 0.01,
  textureSeed: 333,
  textureEase: 0.5,
  proceduralBackgroundColor: '#000000',
  textureShapeTriangles: 20,
  textureShapeCircles: 15,
  textureShapeBars: 15,
  textureShapeSquiggles: 10,
  domainWarpEnabled: false,
  domainWarpIntensity: 0,
  domainWarpScale: 3,
  vignetteIntensity: 0.4,
  vignetteRadius: 0.4,
  fresnelEnabled: false,
  fresnelPower: 2,
  fresnelIntensity: 0.5,
  fresnelColor: '#FFFFFF',
  iridescenceEnabled: false,
  iridescenceIntensity: 0.5,
  iridescenceSpeed: 1,
  prismEdgeEnabled: false,
  prismEdgeIntensity: 0.5,
  prismEdgeThinness: 3,
  prismEdgeSpread: 1,
  prismEdgeSpeed: 0.5,
  prismEdgeRipple: 1,
  bloomIntensity: 0,
  bloomThreshold: 0.7,
  chromaticAberration: 0,
  shapeType: 'plane' as const,
  shapeRotationX: 0,
  shapeRotationY: 0,
  shapeRotationZ: 0,
  shapeAutoRotateSpeedX: 0,
  shapeAutoRotateSpeedY: 0,
  sphereRadius: 15,
  torusRadius: 15,
  torusTube: 5,
  cylinderRadius: 10,
  cylinderHeight: 40,
  planeBend: 0,
  planeTwist: 0,
  silhouetteFade: 0.25,
  cylinderFade: 0.08,
  ribbonFade: 0.05,
  flatShading: true,
  cameraLock: false,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 0,
  cameraRotationX: 0,
  cameraRotationY: 0.021,
  cameraRotationZ: 0,
  cameraZoom: 1.1,
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function HomeShaderGradientComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionLayerRef = useRef<HTMLDivElement>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if ((canvasRef.current as any).__neatInitialized) return;
    (canvasRef.current as any).__neatInitialized = true;

    // Initialize WebGL background canvas across all screen sizes
    let neatInstance: any = null;
    let watermarkTimeout: NodeJS.Timeout | null = null;

    const initNeat = async () => {
      if (!canvasRef.current) return;
      try {
        const { NeatGradient } = await import("@firecms/neat");
        if (neatInstance) return;
        neatInstance = new NeatGradient({
          ref: canvasRef.current,
          ...GRADIENT_SETTINGS,
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

    initNeat();

    // ── Position Overlay Animation ──
    let animFrameId: number;
    const startMs = performance.now();
    let isVisible = true;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    let lastFrameTime = 0;

    const onScroll = () => {
      isScrolling = true;
      if (neatInstance) {
        neatInstance.yOffset = (GRADIENT_SETTINGS.yOffset || 50041) + window.scrollY;
      }
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

    let cachedWinW = typeof window !== "undefined" ? window.innerWidth : 1920;
    let cachedWinH = typeof window !== "undefined" ? window.innerHeight : 1080;

    const onResize = () => {
      cachedWinW = window.innerWidth;
      cachedWinH = window.innerHeight;
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", onResize, { passive: true });
    }

    const updatePositionLayer = (t: number) => {
      if (!positionLayerRef.current) return;
      const periodMs = GRADIENT_SETTINGS.colorMovePeriod * 1000;
      const basePhase = (((t - startMs) % periodMs) / periodMs) * Math.PI * 2;
      const winW = cachedWinW;
      const winH = cachedWinH;

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
      // Keep position updates smooth and continuous without restarting or jumping on scroll
      if (isVisible && !document.hidden) {
        const baseCap = (typeof window !== "undefined" && window.innerWidth < 768) ? 66 : 40; // 15 FPS on mobile, 25 FPS on desktop
        // This loop runs for the lifetime of every page (it lives in the root
        // layout), competing with scroll-driven work for main-thread frame
        // budget. Ambient background drift isn't something anyone perceives
        // the rate of, so halve the update rate while the user is actively
        // scrolling to free that budget for scroll smoothness instead.
        const frameCap = isScrolling ? baseCap * 2 : baseCap;
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

      const cleanupWebGL = () => {
        if (watermarkTimeout) {
          clearTimeout(watermarkTimeout);
        }
        if (typeof window !== "undefined") {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onResize);
        }
        if (observer) {
          observer.disconnect();
        }
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
        }
        try {
          neatInstance?.destroy?.();
          if (canvasRef.current) {
            const gl = canvasRef.current.getContext("webgl2") || canvasRef.current.getContext("webgl");
            if (gl) {
              const loseCtx = gl.getExtension("WEBGL_lose_context");
              if (loseCtx) loseCtx.loseContext();
            }
          }
        } catch { }
      };

      return cleanupWebGL;
    }

    const cleanupWebGL = () => {
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
      try {
        neatInstance?.destroy?.();
        if (canvasRef.current) {
          const gl = canvasRef.current.getContext("webgl2") || canvasRef.current.getContext("webgl");
          if (gl) {
            const loseCtx = gl.getExtension("WEBGL_lose_context");
            if (loseCtx) loseCtx.loseContext();
          }
        }
      } catch { }
    };

    return cleanupWebGL;
  }, []);

  // Static Film Grain & Real-time Canvas Studio Sync
  useEffect(() => {
    const feTurb = document.querySelector("#globalGrainFilter feTurbulence");
    if (feTurb) {
      feTurb.setAttribute("seed", "42");
    }

    const applySettings = (settings: any) => {
      if (!settings || typeof window === "undefined") return;
      if (settings.grainOpacity !== undefined) {
        document.documentElement.style.setProperty("--canvas-grain-opacity", `${settings.grainOpacity / 100}`);
      }
      if (settings.grainBlend) {
        document.documentElement.style.setProperty("--canvas-grain-blend", settings.grainBlend);
      }
      if (settings.grainSize !== undefined) {
        document.documentElement.style.setProperty("--canvas-grain-size", `${settings.grainSize}`);
        const feTurbEl = document.querySelector("#globalGrainFilter feTurbulence");
        if (feTurbEl) feTurbEl.setAttribute("baseFrequency", `${settings.grainSize}`);
      }
      const neat = (window as any).__neatInstance;
      if (neat) {
        if (settings.speed !== undefined) neat.speed = settings.speed;
        if (settings.waveAmp !== undefined) neat.waveAmplitude = settings.waveAmp;
        if (settings.waveFreqX !== undefined) neat.waveFrequencyX = settings.waveFreqX;
        if (settings.waveFreqY !== undefined) neat.waveFrequencyY = settings.waveFreqY;
        if (settings.colorBlending !== undefined) neat.colorBlending = settings.colorBlending;
        if (settings.colorSaturation !== undefined) neat.colorSaturation = settings.colorSaturation;
        if (settings.colorBrightness !== undefined) neat.colorBrightness = settings.colorBrightness;
        if (settings.shadows !== undefined) neat.shadows = settings.shadows;
        if (settings.highlights !== undefined) neat.highlights = settings.highlights;
        if (settings.hPressure !== undefined) neat.horizontalPressure = settings.hPressure;
        if (settings.vPressure !== undefined) neat.verticalPressure = settings.vPressure;
        if (settings.bgColor && settings.bgColor !== '#003FFF') neat.backgroundColor = settings.bgColor;
        else neat.backgroundColor = '#05030a';
      }
    };

    // Apply initial saved settings from localStorage if available
    try {
      const saved = localStorage.getItem("7th_heaven_canvas_settings_v1");
      if (saved) {
        applySettings(JSON.parse(saved));
      }
    } catch { }

    const handleSettingsChange = (e: Event) => {
      const customEv = e as CustomEvent;
      applySettings(customEv.detail);
    };

    window.addEventListener("canvas-settings-changed", handleSettingsChange);
    return () => {
      window.removeEventListener("canvas-settings-changed", handleSettingsChange);
    };
  }, []);

  return (
    <>
      {/* Background Shader Canvas Container */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-transparent">
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full block pointer-events-none" />
        <div ref={positionLayerRef} className="fixed inset-0 z-0 pointer-events-none" />
      </div>
    </>
  );
}

const HomeShaderGradient = React.memo(HomeShaderGradientComponent);
export default HomeShaderGradient;
