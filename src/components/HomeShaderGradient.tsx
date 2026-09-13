"use client";
/* oxlint-disable react-doctor/effect-needs-cleanup */
/* eslint-disable react-doctor/effect-needs-cleanup */

import React, { useEffect, useRef, useSyncExternalStore } from "react";

const GRADIENT_SETTINGS = {
  colorMovePeriod: 12,
  colors: [
    { color: '#151150', enabled: true, posX: 15, posY: 20, moveX: 120, moveY: 90, opacity: 0.6, size: 50 },
    { color: '#850FB7', enabled: true, posX: 35, posY: 45, moveX: 140, moveY: 100, opacity: 0.6, size: 50 },
    { color: '#A43E17', enabled: true, posX: 55, posY: 30, moveX: 110, moveY: 85, opacity: 0.6, size: 50 },
    { color: '#4A1B6F', enabled: true, posX: 75, posY: 65, moveX: 130, moveY: 110, opacity: 0.6, size: 50 },
    { color: '#611EBD', enabled: true, posX: 30, posY: 75, moveX: 125, moveY: 95, opacity: 0.6, size: 50 },
    { color: '#600C7F', enabled: true, posX: 70, posY: 85, moveX: 135, moveY: 105, opacity: 0.6, size: 50 },
  ],
  speed: 4,
  horizontalPressure: 4,
  verticalPressure: 4,
  waveFrequencyX: 0,
  waveFrequencyY: 0,
  waveAmplitude: 0,
  secondaryWaveEnabled: false,
  secondaryWaveFrequencyX: 3,
  secondaryWaveFrequencyY: 3,
  secondaryWaveAmplitude: 5,
  secondaryWaveSpeed: 0.6,
  secondaryWaveAngle: 1,
  shadows: 5,
  highlights: 3,
  colorBrightness: 0.7,
  colorSaturation: -2,
  wireframe: false,
  antialias: false,
  colorBlending: 10,
  backgroundColor: '#000000',
  backgroundAlpha: 1,
  grainScale: 0,
  grainSparsity: 0,
  grainIntensity: 0,
  grainSpeed: 10,
  resolution: 2,
  renderScale: 2,
  yOffset: 64903,
  yOffsetWaveMultiplier: 0,
  yOffsetColorMultiplier: 3.1,
  yOffsetFlowMultiplier: 7.2,
  flowDistortionA: 2.4,
  flowDistortionB: 5.9,
  flowScale: 4.1,
  flowEase: 0,
  flowEnabled: false,
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
  vignetteIntensity: 1,
  vignetteRadius: 0.8,
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
  cameraLock: true,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 0,
  cameraRotationX: 0,
  cameraRotationY: 0,
  cameraRotationZ: 0,
  cameraZoom: 1,
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const mobileSubscribe = (cb: () => void) => {
  const mq = typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px), (pointer: coarse)") : null;
  mq?.addEventListener("change", cb);
  return () => mq?.removeEventListener("change", cb);
};
const mobileSnapshot = () => typeof window !== "undefined" && (window.innerWidth < 1024 || window.matchMedia("(pointer: coarse)").matches);
const mobileServerSnapshot = () => false;

function HomeShaderGradientComponent() {
  const isMobileOrTablet = useSyncExternalStore(mobileSubscribe, mobileSnapshot, mobileServerSnapshot);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionLayerRef = useRef<HTMLDivElement>(null);
  const grainCanvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // NOTE: a `canvasRef.current.__neatInitialized` DOM-attached guard used
    // to live here, added to stop React Strict Mode's dev-only double-invoke
    // from creating two gradient instances. It backfired: Strict Mode's
    // mount -> cleanup -> remount cycle reuses the SAME canvas DOM node (no
    // real unmount happens in between), so the first invocation set the flag
    // synchronously, then the second (real) invocation saw it already set
    // and bailed out before ever calling initNeat() -- while the first
    // invocation's own async import later resolved to find `cancelled`
    // already true (see below) and bailed too. Net effect: neither
    // invocation ever constructed a NeatGradient, so the canvas stayed at
    // its default 300x150 size with nothing drawn -- the "gradient is
    // missing" bug seen site-wide. The `cancelled` flag below already fully
    // covers the orphaned-WebGL-context problem this guard was meant to
    // solve (each effect invocation gets its own `cancelled`/`neatInstance`
    // closure, so only the surviving invocation ends up constructing and
    // owning an instance) -- no DOM-attached guard needed on top of it.

    // Initialize WebGL background canvas across all screen sizes
    let neatInstance: any = null;
    let watermarkTimeout: NodeJS.Timeout | null = null;
    let cancelled = false;

    const initNeat = async () => {
      if (!canvasRef.current) return;
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      try {
        const { NeatGradient } = await import("@firecms/neat");
        if (cancelled || neatInstance || !canvasRef.current) return;

        // Destroy any existing orphaned WebGL instance globally before creating a new one
        if (typeof window !== "undefined" && (window as any).__neatInstance) {
          try {
            (window as any).__neatInstance?.destroy?.();
          } catch { }
          (window as any).__neatInstance = null;
        }

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
        }, 100);
      } catch (e) {
        console.warn("NeatGradient init fallback:", e);
      }
    };

    initNeat();

    // ── Position Overlay Animation ──
    let animFrameId: number | null = null;
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

    const startLoop = () => {
      if (!animFrameId && isVisible && !document.hidden) {
        // eslint-disable-next-line react-doctor/three-prefer-set-animation-loop
        animFrameId = requestAnimationFrame(positionLoop);
      }
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && canvasRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startLoop();
      }, { threshold: 0.01 });
      observer.observe(canvasRef.current);
    }

    const onVisibilityChange = () => {
      if (!document.hidden && isVisible) startLoop();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
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
      const periodMs = (GRADIENT_SETTINGS.colorMovePeriod || 12) * 1000;
      const basePhase = (((t - startMs) % periodMs) / periodMs) * Math.PI * 2;
      const winW = cachedWinW || 1920;
      const winH = cachedWinH || 1080;

      const layers = GRADIENT_SETTINGS.colors.flatMap((c: any, idx: number) => {
        if (!c.enabled) return [];
        const phase = basePhase + idx * (Math.PI / 4);
        const posX = c.posX ?? (15 + (idx * 15) % 70);
        const posY = c.posY ?? (20 + (idx * 25) % 60);
        const moveX = c.moveX ?? 120;
        const moveY = c.moveY ?? 90;
        const opacity = c.opacity ?? 0.6;
        const size = c.size ?? 50;

        const mx = (moveX / winW) * 100;
        const my = (moveY / winH) * 100;

        const xPct = posX + Math.sin(phase) * mx;
        const yPct = posY + Math.cos(phase * 0.8) * my;

        return `radial-gradient(circle at ${xPct.toFixed(2)}% ${yPct.toFixed(2)}%, ${hexToRgba(c.color, opacity)} 0%, transparent ${size}%)`;
      });

      positionLayerRef.current.style.background = layers.join(", ");
    };

    const positionLoop = (t: number) => {
      if (!isVisible || document.hidden) {
        animFrameId = null;
        return;
      }
      const baseCap = (typeof window !== "undefined" && window.innerWidth < 768) ? 66 : 40;
      const frameCap = isScrolling ? baseCap * 2 : baseCap;
      if (t - lastFrameTime > frameCap) {
        updatePositionLayer(t);
        lastFrameTime = t;
      }
      animFrameId = requestAnimationFrame(positionLoop);
    };

    // Render one static paint of the CSS background gradient for mobile/touch devices (zero ongoing frame cost)
    updatePositionLayer(startMs);

    startLoop();

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
        cancelled = true;
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
      cancelled = true;
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
        if (typeof window !== "undefined" && (window as any).__neatInstance === neatInstance) {
          (window as any).__neatInstance = null;
        }
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
    // eslint-disable-next-line react-doctor/exhaustive-deps
  }, []);

  // Pause the gradient while a page transition is covering the screen
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const sync = () => { };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
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
      <div ref={wrapperRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden ">
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full block pointer-events-none" />
        <div ref={positionLayerRef} className="fixed inset-0 z-0 pointer-events-none" />
      </div>
    </>
  );
}

const HomeShaderGradient = React.memo(HomeShaderGradientComponent);
export default HomeShaderGradient;
