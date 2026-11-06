"use client";

/** A button with a flowing chrome border drawn by a small WebGL shader. All of its look comes from `settings`. */

import { Ticket } from "lucide-react";
import { type CSSProperties, useEffect, useRef } from "react";

export const METAL_DEFAULTS = {
  borderWidth: 2,
  hoverWidth: 1.5,
  speed: 0.7,
  hoverSpeed: 1.3,
  bands: 4,
  sharpness: 3,
  shine: 0.28,
  warp: 1.6,
  warpSize: 1,
  warpSpeed: 1,
  brightColor: "#f5f7ff",
  darkColor: "#292638",
  tintColor: "#521f80",
  tintAmount: 0.5,
  glow: 0.1,
  hoverGlow: 0.32,
  glowSpread: 4.5,
  ripple: 1,
  rippleSize: 14,
  height: 56,
  sidePadding: 34,
  roundness: 100,
  fillColor: "#0c0a14",
  textColor: "#f3eef8",
  fontSize: 15,
  fontWeight: 600,
  hoverScale: 1,
  alwaysHover: false,
};
export type MetalSettings = typeof METAL_DEFAULTS;

const PAD = 48; // room around the button for the glow and ripple

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes, uHalf;
uniform float uRadius, uTime, uHover, uPress, uDpr;
uniform float uWidth, uHoverWidth, uBands, uSharp, uShine, uWarp, uWarpSize, uWarpTime;
uniform float uTint, uGlow, uHoverGlow, uGlowSpread, uRipple, uRippleSize;
uniform vec3 uBright, uDark, uTintColor;
float box(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
void main() {
  vec2 p = (gl_FragCoord.xy - uRes * 0.5) / uDpr;
  float d = box(p, uHalf, uRadius);
  float width = uWidth + uHover * uHoverWidth;
  float ring = width <= 0.0 ? 0.0 : 1.0 - smoothstep(0.0, 1.0, abs(d + width * 0.5) - width * 0.5);

  // Bands of light that warp as they travel around the shape
  float flow = atan(p.y, p.x) + uTime;
  float warp = sin(p.x * 0.05 * uWarpSize + uWarpTime * 0.9) + sin(p.y * 0.17 * uWarpSize - uWarpTime * 0.6);
  float band = 0.5 + 0.5 * sin(flow * uBands + warp * uWarp);
  float metal = pow(band, uSharp) + 0.14 + uShine * pow(0.5 + 0.5 * sin(flow * uBands * 2.5 - warp), 6.0);
  vec3 col = mix(uDark, uBright, clamp(metal, 0.0, 1.0));
  col += uTintColor * (1.0 - band) * uTint;

  float glow = exp(-max(d, 0.0) / max(uGlowSpread, 0.1)) * step(0.0, d) * (uGlow + uHover * uHoverGlow) * (0.4 + band);
  glow *= 1.0 - smoothstep(20.0, 46.0, d); // fade out before the edge of the canvas
  float ripple = uRipple * uPress * exp(-pow((d - (1.0 - uPress) * uRippleSize) * 0.45, 2.0));
  float alpha = clamp(max(ring, max(glow, ripple)), 0.0, 1.0);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export default function LiquidMetalButton({
  label,
  iconOnly = false,
  settings = METAL_DEFAULTS,
}: {
  label: string;
  iconOnly?: boolean;
  settings?: MetalSettings;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef(settings);
  const hoverGoal = useRef(0);
  const press = useRef(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const button = buttonRef.current;
    const canvas = canvasRef.current;
    if (!button || !canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true });
    if (!gl) {
      button.dataset.noGl = "true"; // the CSS border stands in
      return;
    }
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type) as WebGLShader;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(program, 0, "p");
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(program, name);
    const f = (name: string, value: number) => gl.uniform1f(u(name), value);
    const c = (name: string, hex: string) => gl.uniform3fv(u(name), rgb(hex));

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      canvas.width = (button.offsetWidth + PAD * 2) * dpr;
      canvas.height = (button.offsetHeight + PAD * 2) * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u("uRes"), canvas.width, canvas.height);
      gl.uniform2f(u("uHalf"), button.offsetWidth / 2, button.offsetHeight / 2);
      f("uDpr", dpr);
    };
    size();
    const watcher = new ResizeObserver(size);
    watcher.observe(button);

    let raf = 0;
    let hover = 0;
    let flow = 0;
    let last = performance.now();
    const start = last;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const s = settingsRef.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      hover += ((s.alwaysHover ? 1 : hoverGoal.current) - hover) * 0.1;
      press.current *= 0.93;
      // Speed changes must not make the bands jump, so the flow is added up frame by frame
      if (!reduced) flow += dt * (s.speed + hover * s.hoverSpeed);
      button.style.transform = hover > 0.001 ? `scale(${1 + (s.hoverScale - 1) * hover})` : "";

      f("uRadius", (Math.min(button.offsetHeight, button.offsetWidth) / 2) * (s.roundness / 100));
      gl.uniform1f(u("uTime"), flow);
      f("uHover", hover);
      f("uPress", press.current);
      f("uWidth", s.borderWidth);
      f("uHoverWidth", s.hoverWidth);
      f("uBands", s.bands);
      f("uSharp", s.sharpness);
      f("uShine", s.shine);
      f("uWarp", s.warp);
      f("uWarpSize", s.warpSize);
      gl.uniform1f(u("uWarpTime"), reduced ? 0 : ((now - start) / 1000) * s.warpSpeed);
      f("uTint", s.tintAmount);
      f("uGlow", s.glow);
      f("uHoverGlow", s.hoverGlow);
      f("uGlowSpread", s.glowSpread);
      f("uRipple", s.ripple);
      f("uRippleSize", s.rippleSize);
      c("uBright", s.brightColor);
      c("uDark", s.darkColor);
      c("uTintColor", s.tintColor);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      watcher.disconnect();
    };
  }, []);

  const look: CSSProperties = {
    minHeight: settings.height,
    width: iconOnly ? settings.height : undefined,
    padding: iconOnly ? 0 : `0 ${settings.sidePadding}px`,
    borderRadius: (settings.height / 2) * (settings.roundness / 100),
    background: settings.fillColor,
    color: settings.textColor,
    fontSize: settings.fontSize,
    fontWeight: settings.fontWeight,
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className="metal"
      style={look}
      aria-label={iconOnly ? label : undefined}
      onPointerEnter={() => { hoverGoal.current = 1; }}
      onPointerLeave={() => { hoverGoal.current = 0; }}
      onFocus={() => { hoverGoal.current = 1; }}
      onBlur={() => { hoverGoal.current = 0; }}
      onClick={() => { press.current = 1; }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ inset: -PAD, width: `calc(100% + ${PAD * 2}px)`, height: `calc(100% + ${PAD * 2}px)` }}
      />
      {iconOnly ? <Ticket size={settings.fontSize + 5} aria-hidden="true" /> : <span>{label}</span>}
    </button>
  );
}
