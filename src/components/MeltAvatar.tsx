"use client";

/**
 * The phone-only member photo in the fact sheet. It melts in with the same effect the band melts out
 * with, and melts out again when `leaving` turns on.
 */

import { useEffect, useRef } from "react";

const SIZE = 76;
const IN_SECONDS = 0.35;
const OUT_SECONDS = 0.25;
const FIRST_DELAY_SECONDS = 0.25; // lets the sheet finish most of its slide first

const VERT = `attribute vec2 p; varying vec2 vUv; void main() { vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform sampler2D uMap;
uniform float uFade, uTime, uAspect;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.0; a *= 0.5; }
  return v;
}
vec3 iris(float t) { return 0.55 + 0.45 * cos(6.2832 * (t + vec3(0.0, 0.33, 0.67))); }
vec4 photo(vec2 uv) {
  return texture2D(uMap, vec2((uv.x - 0.5) / uAspect + 0.5, uv.y));
}
void main() {
  if (uFade >= 0.999) { gl_FragColor = photo(vUv); return; }
  float n = fbm(vUv * 4.0 + vec2(0.0, uTime * 0.25));
  float d = n * 0.55 + vUv.y * 0.45;
  float edge = d - mix(-0.03, 1.03, 1.0 - uFade);
  float band = exp(-edge * edge / 0.012);
  vec2 w = vUv + vec2(sin(vUv.y * 22.0 + uTime * 5.0), cos(vUv.x * 18.0 + uTime * 4.0)) * 0.018 * band;
  vec4 tex = photo(w);
  if (edge < 0.0) {
    vec2 g = vUv * 26.0;
    g.y -= uTime * 3.0;
    float spark = step(length(fract(g) - 0.5), 0.3) * step(hash(floor(g)), 0.42) * smoothstep(-0.2, 0.0, edge);
    float sa = spark * photo(vUv).a;
    gl_FragColor = vec4(iris(n * 2.0 + vUv.y + uTime * 0.2) * sa, sa);
    return;
  }
  float rim = 1.0 - smoothstep(0.0, 0.085, edge);
  gl_FragColor = vec4(mix(tex.rgb, iris(n * 3.0 + uTime * 0.4) * tex.a, rim), tex.a);
}
`;

export default function MeltAvatar({ src, leaving = false, delayed = true }: { src: string; leaving?: boolean; delayed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leavingRef = useRef(leaving);
  const srcRef = useRef(src);
  const delayedRef = useRef(delayed);
  const loadRef = useRef<(next: string) => void>(() => {});

  useEffect(() => {
    leavingRef.current = leaving;
    srcRef.current = src;
    delayedRef.current = delayed;
  }, [leaving, src, delayed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !matchMedia("(max-width: 639px)").matches) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true });
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = SIZE * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const compile = (type: number, code: string) => {
      const s = gl.createShader(type) as WebGLShader;
      gl.shaderSource(s, code);
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
    const uFade = gl.getUniformLocation(program, "uFade");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uAspect = gl.getUniformLocation(program, "uAspect");

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ready = false;
    let fade = 0;
    let waitUntil = performance.now() + (delayedRef.current ? FIRST_DELAY_SECONDS * 1000 : 0);
    let cancelled = false;

    loadRef.current = (next: string) => {
      ready = false;
      fade = 0;
      const img = new Image();
      img.onload = () => {
        if (cancelled || srcRef.current !== next) return;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.uniform1f(uAspect, img.naturalWidth / img.naturalHeight);
        ready = true;
      };
      img.src = next;
    };
    loadRef.current(srcRef.current);

    let raf = 0;
    let last = performance.now();
    const start = last;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!ready) return;
      if (leavingRef.current) fade = reduced ? 0 : Math.max(0, fade - dt / OUT_SECONDS);
      else if (now >= waitUntil) fade = reduced ? 1 : Math.min(1, fade + dt / IN_SECONDS);
      gl.uniform1f(uFade, fade);
      gl.uniform1f(uTime, (now - start) / 1000);
      if (fade > 0.001) gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      waitUntil = 0;
      cancelAnimationFrame(raf);
      loadRef.current = () => {};
    };
  }, []);

  // Paging to another member melts their photo in straight away
  const firstSrc = useRef(src);
  useEffect(() => {
    if (firstSrc.current === src) return;
    firstSrc.current = src;
    loadRef.current(src);
  }, [src]);

  return <canvas ref={canvasRef} className="mfs-avatar" aria-hidden="true" />;
}
