"use client";

import { useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   Vertex shader – simple full-screen quad
   ───────────────────────────────────────────── */
const VERT = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

/* ─────────────────────────────────────────────
   Fragment shader – volumetric stage lights
   Inspired by waveform.framer.website
   Wide, desaturated curtain-like beams from top
   ───────────────────────────────────────────── */
const FRAG = `
  precision highp float;

  uniform vec2  u_resolution;
  uniform float u_time;
  uniform float u_scroll;

  /* ── helpers ── */
  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n = i.x + i.y * 57.0;
    float a = hash(n);
    float b = hash(n + 1.0);
    float c = hash(n + 57.0);
    float d = hash(n + 58.0);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  /* Soft volumetric beam
     origin : top-center of the beam (normalized coords, 0-1)
     uv     : current pixel
     angle  : cone direction in radians (0 = straight down)
     width  : how wide the beam is at the source
     taper  : how much it widens as it goes down
     reach  : how far the light travels (0-1 of screen height)       */
  float beam(vec2 uv, float originX, float angle, float width, float taper, float reach) {
    vec2 origin = vec2(originX, -0.05);
    vec2 d = uv - origin;

    /* Rotate into beam-local space */
    float ca = cos(-angle);
    float sa = sin(-angle);
    vec2 rd = vec2(d.x * ca - d.y * sa, d.x * sa + d.y * ca);

    /* Only illuminate downward (positive local-y) */
    if (rd.y < 0.0) return 0.0;

    /* Beam shape — wide at source, tapers with distance */
    float beamWidth = width + rd.y * taper;

    /* Soft gaussian-like falloff from center */
    float lateral = abs(rd.x) / beamWidth;
    float shape = exp(-lateral * lateral * 3.0);

    /* Distance falloff — soft exponential */
    float dist = rd.y / reach;
    float falloff = exp(-dist * dist * 2.5);

    /* Add a bit of smoky noise texture */
    float smokeScale = 4.0;
    float smoke = noise(vec2(rd.x * smokeScale + u_time * 0.02, rd.y * smokeScale * 0.8 - u_time * 0.015));
    smoke = mix(0.7, 1.0, smoke); /* subtle modulation */

    return shape * falloff * smoke;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.y = 1.0 - uv.y; /* flip so 0,0 is top-left */

    /* Aspect correction */
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uvA = vec2(uv.x * aspect, uv.y);

    float t = u_time * 0.08;

    /* Scroll offset — beams shift subtly with scroll */
    float scrollNorm = u_scroll * 0.00008;

    /* ── Define light beams ──
       Distinct cone-shaped beams from the top, like stage spotlights */
    float light = 0.0;

    /* Beam 1 — far left, angled inward */
    float sway1 = sin(t * 0.8 + 0.0) * 0.025;
    light += beam(uvA, 0.18 * aspect + scrollNorm, sway1 + 0.18, 0.06, 0.25, 0.9) * 0.50;

    /* Beam 2 — left-center */
    float sway2 = sin(t * 0.6 + 1.5) * 0.02;
    light += beam(uvA, 0.33 * aspect + scrollNorm, sway2 + 0.08, 0.08, 0.28, 1.0) * 0.55;

    /* Beam 3 — center-left */
    float sway3 = sin(t * 0.7 + 3.0) * 0.018;
    light += beam(uvA, 0.44 * aspect + scrollNorm, sway3 + 0.02, 0.07, 0.26, 1.05) * 0.60;

    /* Beam 4 — center (strongest) */
    float sway4 = sin(t * 0.5 + 4.5) * 0.012;
    light += beam(uvA, 0.5 * aspect + scrollNorm, sway4, 0.09, 0.30, 1.1) * 0.65;

    /* Beam 5 — center-right */
    float sway5 = sin(t * 0.65 + 6.0) * 0.018;
    light += beam(uvA, 0.56 * aspect + scrollNorm, sway5 - 0.02, 0.07, 0.26, 1.05) * 0.58;

    /* Beam 6 — right-center */
    float sway6 = sin(t * 0.75 + 7.5) * 0.02;
    light += beam(uvA, 0.67 * aspect + scrollNorm, sway6 - 0.08, 0.08, 0.28, 1.0) * 0.55;

    /* Beam 7 — far right, angled inward */
    float sway7 = sin(t * 0.55 + 9.0) * 0.025;
    light += beam(uvA, 0.82 * aspect + scrollNorm, sway7 - 0.16, 0.06, 0.25, 0.9) * 0.48;

    /* Clamp total */
    light = clamp(light, 0.0, 1.0);

    /* ── Color grade the light ──
       Desaturated grey-white with very subtle cool tint */
    vec3 coolGrey = vec3(0.75, 0.78, 0.85);
    vec3 warmGrey = vec3(0.80, 0.78, 0.75);

    /* Subtle position-based color variation */
    vec3 lightColor = mix(warmGrey, coolGrey, smoothstep(0.3, 0.7, uv.x));

    /* Brighten the hottest parts toward near-white */
    lightColor = mix(lightColor, vec3(0.92, 0.93, 0.96), pow(light, 1.5) * 0.6);

    /* ── Film grain — subtle haze texture ── */
    float grain = (hash(uv.x * 1234.0 + uv.y * 5678.0 + u_time * 37.0) - 0.5) * 0.015;

    /* ── Final composite ── */
    vec3 col = lightColor * light + grain;

    /* Vignette — darken edges naturally */
    float vignette = 1.0 - length((uv - vec2(0.5, 0.3)) * vec2(0.8, 0.5)) * 0.3;
    col *= max(vignette, 0.0);

    /* Output with alpha = light intensity for blending over dark bg */
    gl_FragColor = vec4(col, light * 0.95);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function CanvasLights() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const scrollRef = useRef(0);
  const startTime = useRef(Date.now());

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) return;

    /* ── Compile program ── */
    const vert = createShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    /* ── Full-screen quad ── */
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    /* ── Uniforms ── */
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uScroll = gl.getUniformLocation(program, "u_scroll");

    /* ── Blending ── */
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    /* ── Resize handler ── */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5); // cap DPR for perf
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* ── Scroll handler ── */
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ── Render loop ── */
    const render = () => {
      const elapsed = (Date.now() - startTime.current) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uScroll, scrollRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    };

    render();

    /* ── Cleanup ── */
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
    };
  }, []);

  useEffect(() => {
    const cleanup = init();
    return () => cleanup?.();
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
