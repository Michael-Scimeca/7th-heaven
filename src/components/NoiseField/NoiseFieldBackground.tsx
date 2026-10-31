"use client";

/**
 * Site background in "fed" motion mode (see lib/motionMode.ts):
 * the federicopian.com simplex-noise field in 7th Heaven colors, under a dark glass tint
 * and animated film grain. Colors tween per route (0.3s sine.out, like the reference),
 * a soft hole trails the cursor, and time follows gsap's global timeScale.
 *
 * In "classic" mode it renders the previous <HomeShaderGradient /> instead.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import HomeShaderGradient from "@/components/HomeShaderGradient";
import { FED_PALETTE_EVENT, FED_ROUTE_EVENT, readMotionMode, type MotionMode } from "@/lib/motionMode";
import { NOISE_FRAG, NOISE_VERT } from "./shader";
import { paletteFor, type Palette } from "./palettes";
import "./noise-field.css";

const COVERAGE = 1.7; // 1 = exact reference
const LIFT = 0.18; // 0 = exact reference, lifted so colors glow across entire page
const SPEED = 0.1; // u_time = elapsed * SPEED (reference)
const EASE_POINTER = 0.1; // cursor easing per frame (reference)

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));


export default function NoiseFieldBackground() {
  const pathname = usePathname();
  const [mode, setMode] = useState<MotionMode>("fed");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useRef({ c1: [165, 30, 227], c2: [212, 88, 30], bg: [7, 4, 13] });
  const [grain, setGrain] = useState<string | null>(null);

  // decide mode on the client, tag <html> so CSS + TextTransitions can follow it
  useEffect(() => {
    const m = readMotionMode();
    setMode(m);
    document.documentElement.classList.toggle("fed-motion", m === "fed");
  }, []);

  // film grain texture, generated once
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 160;
      const x = c.getContext("2d");
      if (!x) return;
      const d = x.createImageData(160, 160);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = Math.random() * 255;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      setGrain(c.toDataURL());
    } catch {}
  }, []);

  // tween to a route's palette
  const applyPalette = useRef((pal: Palette, instant = false) => {
    const [bg, c1, c2] = pal.map(hex);
    const u = colors.current;
    if (instant) {
      u.bg = bg; u.c1 = c1; u.c2 = c2;
      return;
    }
    const to = (arr: number[], t: number[]) =>
      gsap.to(arr, { 0: t[0], 1: t[1], 2: t[2], duration: 0.3, ease: "sine.out", overwrite: true });
    to(u.c1, c1); to(u.c2, c2); to(u.bg, bg);
  });

  const first = useRef(true);
  useEffect(() => {
    applyPalette.current(paletteFor(pathname || "/"), first.current);
    first.current = false;
  }, [pathname]);

  // transitions announce the destination early so color changes while the page dissolves
  useEffect(() => {
    const onRoute = (e: Event) => {
      const path = (e as CustomEvent<{ path: string }>).detail?.path;
      if (path) applyPalette.current(paletteFor(path));
    };
    window.addEventListener(FED_ROUTE_EVENT, onRoute);
    return () => window.removeEventListener(FED_ROUTE_EVENT, onRoute);
  }, []);

  // hover recolor (e.g. Rock 'n' Roll Kids items), null restores the route palette
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);
  useEffect(() => {
    const onPalette = (e: Event) => {
      const pal = (e as CustomEvent<{ palette: Palette | null }>).detail?.palette;
      applyPalette.current(pal ?? paletteFor(pathRef.current || "/"));
    };
    window.addEventListener(FED_PALETTE_EVENT, onPalette);
    return () => window.removeEventListener(FED_PALETTE_EVENT, onPalette);
  }, []);

  // WebGL loop
  useEffect(() => {
    if (mode !== "fed") return;
    const cv = canvasRef.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, NOISE_VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, NOISE_FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (!gl.isContextLost()) console.error("[NoiseField]", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(
      ["u_ratio", "u_time", "u_mouseInteraction", "u_coverage", "u_lift", "u_point", "u_resolution", "u_color1", "u_color2", "u_bg"].map(
        (k) => [k, gl.getUniformLocation(prog, k)],
      ),
    ) as Record<string, WebGLUniformLocation | null>;

    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.75;
    const size = () => {
      cv.width = Math.max(2, Math.round(window.innerWidth * scale));
      cv.height = Math.max(2, Math.round(window.innerHeight * scale));
      gl.viewport(0, 0, cv.width, cv.height);
    };
    size();
    window.addEventListener("resize", size);

    const target = [0.5, 0.5];
    const point = [0.5, 0.5];
    const onMove = (e: PointerEvent) => {
      target[0] = e.clientX / window.innerWidth;
      target[1] = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let elapsed = 0;
    let last = performance.now();
    let raf = 0;
    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, Math.max(0, (ts - last) / 1000));
      last = ts;
      if (document.hidden) return;
      elapsed += dt * gsap.globalTimeline.timeScale() * (reduced ? 0.15 : 1);
      point[0] += (target[0] - point[0]) * EASE_POINTER;
      point[1] += (target[1] - point[1]) * EASE_POINTER;
      const u = colors.current;
      gl.uniform1f(U.u_ratio, window.innerWidth / window.innerHeight);
      gl.uniform2f(U.u_resolution, window.innerWidth, window.innerHeight);
      gl.uniform1f(U.u_time, elapsed * SPEED);
      gl.uniform1f(U.u_mouseInteraction, 1);
      gl.uniform1f(U.u_coverage, COVERAGE);
      gl.uniform1f(U.u_lift, LIFT);
      gl.uniform2f(U.u_point, point[0], point[1]);
      gl.uniform3fv(U.u_color1, u.c1);
      gl.uniform3fv(U.u_color2, u.c2);
      gl.uniform3fv(U.u_bg, u.bg);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
      // free GPU objects but keep the context: React (dev) re-runs this effect on the same canvas
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [mode]);

  return (
    <>
      {mode === "classic" ? (
        <HomeShaderGradient />
      ) : (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0618]">
          <canvas id="noise-field-canvas" ref={canvasRef} className="pointer-events-none fixed inset-0 block h-full w-full" />
          <div
            id="noise-field-ambient"
            className="pointer-events-none fixed inset-0"
          />
        </div>
      )}
      <div
        aria-hidden="true"
        className="noise-field-glass"
        style={grain ? ({ ["--nf-grain" as string]: `url(${grain})` } as CSSProperties) : undefined}
      />
    </>
  );
}
