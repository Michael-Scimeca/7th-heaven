/* eslint-disable react-doctor/effect-needs-cleanup, react-doctor/effect-observer-needs-disconnect, react-doctor/effect-raf-loop-needs-cancel, react-doctor/html-label-has-single-control */
"use client";

/**
 * Test page: a hero where the cursor drags a liquid, iridescent blob across a cutout photo. Inside
 * the blob the photo turns into a scan view; the trail marbles and fades. Everything is on one
 * WebGL canvas, with a live Controls panel.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK_MEMBERS } from "@/data/bandMembers";
import MemberFactSheetDrawer, { type BandMemberFactSheet } from "@/components/MemberFactSheetDrawer";
import "./liquid-reveal.css";

const MEMBERS = [
  { name: "Frankie Harchut", image: "/images/members/desktop-frank.webp" },
  { name: "Nick Cox", image: "/images/members/desktop-nick.webp" },
  { name: "Adam Heisler", image: "/images/members/desktop-adam.webp" },
  { name: "Richard Hofherr", image: "/images/members/desktop-richy.webp" },
  { name: "Mark Kennetz", image: "/images/members/desktop-mark.webp" },
];
/* How far along each member's width the next one starts, so shoulders overlap */
const FACT_SHEETS = FALLBACK_MEMBERS as BandMemberFactSheet[];
const STEP = 0.58;
const PHOTO_ASPECT = 1200 / 1001;
/* Middle members are drawn last so they sit in front */
const DRAW_ORDER = [0, 4, 1, 3, 2];

const DEFAULTS = {
  size: 0.13,
  lag: 0.1,
  trail: 0.97,
  swirl: 1,
  rim: 0.32,
  color: 0.95,
  vanish: 1.1,
  style: 0,
  auto: false,
};
type Params = typeof DEFAULTS;
type NumKey = Exclude<keyof Params, "auto" | "style">;

const SLIDERS: { key: NumKey; label: string; min: number; max: number; step: number }[] = [
  { key: "size", label: "Blob size", min: 0.05, max: 0.45, step: 0.005 },
  { key: "lag", label: "Follow speed", min: 0.02, max: 0.4, step: 0.005 },
  { key: "trail", label: "Trail length", min: 0.9, max: 0.995, step: 0.001 },
  { key: "swirl", label: "Liquid swirl", min: 0, max: 4, step: 0.05 },
  { key: "vanish", label: "Disappear time (sec)", min: 0.3, max: 5, step: 0.05 },
  { key: "rim", label: "Color rim width", min: 0.05, max: 0.55, step: 0.01 },
  { key: "color", label: "Color strength", min: 0, max: 1, step: 0.01 },
];
const STYLES = ["X-ray", "Thermal", "Negative"];
const STORE = "lrt-controls-v2";

const NOISE = /* glsl */ `
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
`;

const QUAD = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

/* Mask feedback: last frame's mask flows along a noise field and fades; the cursor paints into it */
const SIM = /* glsl */ `
  uniform sampler2D uPrev;
  uniform vec2 uCursor;
  uniform vec2 uMove;
  uniform float uAspect, uTime, uSize, uDecay, uSwirl, uOn;
  varying vec2 vUv;
  ${NOISE}
  void main() {
    vec2 p = vUv * vec2(uAspect, 1.0);
    float e = 0.01;
    vec2 n = p * 3.2 + uTime * 0.12;
    vec2 flow = vec2(fbm(n + vec2(0.0, e)) - fbm(n - vec2(0.0, e)), -(fbm(n + vec2(e, 0.0)) - fbm(n - vec2(e, 0.0)))) / (2.0 * e);
    vec2 c = uCursor * vec2(uAspect, 1.0);
    vec2 d = p - c;
    float near = exp(-dot(d, d) / (uSize * uSize * 4.0));
    vec2 back = flow * 0.0016 * uSwirl + uMove * near * 0.5;
    float prev = texture2D(uPrev, vUv - back / vec2(uAspect, 1.0)).r * uDecay;
    float wob = fbm(p * 5.0 + uTime * 0.5) - 0.5;
    float r = uSize * (1.0 + wob * 0.9);
    float paint = exp(-dot(d, d) / (r * r)) * 1.5 * uOn;
    gl_FragColor = vec4(max(prev, paint), 0.0, 0.0, 1.0);
  }
`;

const COMP = /* glsl */ `
  uniform sampler2D uMask, uPhoto;
  uniform vec2 uView;
  uniform vec4 uRect;
  uniform float uTime, uIntro, uRim, uColor, uStyle, uPhotoFade;
  uniform vec2 uTexel;
  varying vec2 vUv;
  ${NOISE}
  vec3 iris(float t) {
    return 0.55 + 0.5 * cos(6.2832 * (vec3(1.0, 1.0, 1.0) * t + vec3(0.0, 0.36, 0.62)));
  }
  void main() {
    float aspect = uView.x / uView.y;
    vec2 p = vec2(vUv.x * aspect, vUv.y);

    // Scan panels on either side of the center column, only during the intro
    float inPanel = step(0.31, vUv.y) * (step(vUv.x, 0.33) + step(0.67, vUv.x));
    float grid = step(0.5, fract(vUv.x * uView.x / 5.0)) * step(0.5, fract(vUv.y * uView.y / 4.0));
    float pulse = sin(clamp(uIntro * 1.9, 0.0, 1.0) * 3.1416);
    float panels = inPanel * pulse * (0.1 + 0.3 * grid);

    vec3 out_ = vec3(1.0) * panels;
    float outA = clamp(panels, 0.0, 1.0);

    vec2 tuv = (vUv - uRect.xy) / uRect.zw;
    if (tuv.x > 0.0 && tuv.x < 1.0 && tuv.y > 0.0 && tuv.y < 1.0) {
      vec4 tex = texture2D(uPhoto, tuv);
      float pa = tex.a * uPhotoFade;
      if (pa > 0.001) {
        vec3 photo = tex.rgb / max(tex.a, 0.001);
        float m = texture2D(uMask, vUv).r;
        float lum = dot(photo, vec3(0.3, 0.59, 0.11));
        float lx = dot(texture2D(uPhoto, tuv + vec2(uTexel.x, 0.0)).rgb, vec3(0.33)) - dot(texture2D(uPhoto, tuv - vec2(uTexel.x, 0.0)).rgb, vec3(0.33));
        float ly = dot(texture2D(uPhoto, tuv + vec2(0.0, uTexel.y)).rgb, vec3(0.33)) - dot(texture2D(uPhoto, tuv - vec2(0.0, uTexel.y)).rgb, vec3(0.33));
        float edge = clamp(length(vec2(lx, ly)) * 3.2, 0.0, 1.0);
        vec3 scan;
        if (uStyle < 0.5) {
          scan = mix(vec3(0.03, 0.06, 0.18), vec3(0.72, 0.9, 1.0), pow(1.0 - lum, 1.5)) + edge * vec3(0.8, 0.95, 1.0);
        } else if (uStyle < 1.5) {
          scan = 0.5 + 0.5 * cos(6.2832 * (lum * 0.8 + vec3(0.55, 0.75, 0.0)));
          scan += edge * 0.4;
        } else {
          scan = 1.0 - photo + edge * 0.3;
        }
        float t = fbm(vUv * vec2(aspect, 1.0) * 5.0 + vec2(m * 2.4, uTime * 0.12));
        float marble = fbm(vUv * vec2(aspect, 1.0) * 11.0 + t * 3.5 + uTime * 0.05);
        vec3 oil = iris(t * 1.6 + marble * 1.3 + m);
        float core = 0.72;
        float k = smoothstep(core, core + 0.05, m);
        float rimOuter = core - uRim;
        float rimA = smoothstep(rimOuter - 0.1, rimOuter + 0.06, m) * (1.0 - k);
        vec3 col = mix(photo, oil, rimA * uColor);
        col = mix(col, scan, k);
        float line = 1.0 - smoothstep(0.0, 0.05, abs(m - core));
        col = mix(col, oil * 1.15, line * uColor * 0.85);
        out_ = out_ * (1.0 - pa) + col * pa;
        outA = outA + pa * (1.0 - outA);
      }
    }
    gl_FragColor = vec4(out_, outA);
  }
`;

/* Layers the five cutouts into one image, with each member's own opacity */
const COMPOSE = /* glsl */ `
  uniform sampler2D uPeople[5];
  uniform float uFades[5];
  uniform float uStart[5];
  uniform float uWidth;
  uniform int uOrder[5];
  uniform float uTime;
  varying vec2 vUv;
  ${NOISE}
  vec3 iris(float t) {
    return 0.55 + 0.5 * cos(6.2832 * (t + vec3(0.0, 0.36, 0.62)));
  }
  vec4 sampleBottomBlur(sampler2D map, vec2 uv) {
    float botFade = smoothstep(0.01, 0.24, uv.y);
    float blurAmt = 1.0 - smoothstep(0.0, 0.26, uv.y);
    blurAmt *= blurAmt;
    if (blurAmt < 0.001) {
      return texture2D(map, uv) * botFade;
    }
    vec2 rad = vec2(0.018, 0.024) * blurAmt;
    vec4 sum = texture2D(map, uv) * 0.22;
    sum += texture2D(map, clamp(uv + vec2(-rad.x, 0.0), 0.001, 0.999)) * 0.13;
    sum += texture2D(map, clamp(uv + vec2( rad.x, 0.0), 0.001, 0.999)) * 0.13;
    sum += texture2D(map, clamp(uv + vec2(0.0, -rad.y), 0.001, 0.999)) * 0.13;
    sum += texture2D(map, clamp(uv + vec2(0.0,  rad.y), 0.001, 0.999)) * 0.13;
    sum += texture2D(map, clamp(uv + vec2(-rad.x, -rad.y) * 0.7, 0.001, 0.999)) * 0.065;
    sum += texture2D(map, clamp(uv + vec2( rad.x, -rad.y) * 0.7, 0.001, 0.999)) * 0.065;
    sum += texture2D(map, clamp(uv + vec2(-rad.x,  rad.y) * 0.7, 0.001, 0.999)) * 0.065;
    sum += texture2D(map, clamp(uv + vec2( rad.x,  rad.y) * 0.7, 0.001, 0.999)) * 0.065;
    return sum * botFade;
  }
  vec4 person(sampler2D map, float start, float fade) {
    vec2 q = vec2((vUv.x - start) / uWidth, vUv.y);
    if (q.x < 0.0 || q.x > 1.0) return vec4(0.0);
    if (fade >= 0.999) return sampleBottomBlur(map, q);
    if (fade <= 0.001) return vec4(0.0);
    // The melt climbs from the shoulders up, along an uneven noise front
    float seed = start * 37.0;
    vec2 st = vec2(q.x * 1.2, q.y);
    float n = fbm(st * 5.0 + seed + vec2(0.0, uTime * 0.25));
    float d = n * 0.55 + q.y * 0.45;
    float thr = mix(-0.03, 1.03, 1.0 - fade);
    float edge = d - thr;

    // Liquid wobble just ahead of the front
    float band = exp(-edge * edge / 0.012);
    vec2 w = q + vec2(sin(q.y * 26.0 + uTime * 5.0), cos(q.x * 22.0 + uTime * 4.0)) * 0.016 * band;
    vec4 tex = sampleBottomBlur(map, w);

    if (edge < 0.0) {
      // Behind the front the person breaks into glowing dots that drift upward
      vec2 g = st * 95.0;
      g.y -= uTime * 7.0;
      vec2 id = floor(g);
      float spark = step(length(fract(g) - 0.5), 0.3) * step(hash(id + seed), 0.42);
      spark *= smoothstep(-0.2, 0.0, edge);
      float sa = spark * sampleBottomBlur(map, q).a;
      return vec4(iris(n * 2.0 + q.y + uTime * 0.2) * sa, sa);
    }
    float rim = 1.0 - smoothstep(0.0, 0.085, edge);
    vec3 col = mix(tex.rgb, iris(n * 2.4 + q.y * 1.5 + uTime * 0.25) * tex.a, rim);
    return vec4(col, tex.a) * smoothstep(0.0, 0.012, edge);
  }
  void main() {
    vec4 c = vec4(0.0);
    for (int n = 0; n < 5; n++) {
      vec4 src = vec4(0.0);
      int i = uOrder[n];
      if (i == 0) src = person(uPeople[0], uStart[0], uFades[0]);
      else if (i == 1) src = person(uPeople[1], uStart[1], uFades[1]);
      else if (i == 2) src = person(uPeople[2], uStart[2], uFades[2]);
      else if (i == 3) src = person(uPeople[3], uStart[3], uFades[3]);
      else src = person(uPeople[4], uStart[4], uFades[4]);
      c = src + c * (1.0 - src.a);
    }
    gl_FragColor = c;
  }
`;

function loadParams(): Params {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    // storage unavailable: use defaults
  }
  return { ...DEFAULTS };
}

export default function LiquidRevealClient() {
  const heroRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const paramsRef = useRef<Params>(DEFAULTS);
  const [params, setParams] = useState<Params>(DEFAULTS);
  const [active, setActive] = useState(-1);
  const [selected, setSelected] = useState<number | null>(null);
  const selectRef = useRef<(i: number | null) => void>(() => { });
  const [panelOpen, setPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loaded = loadParams();
    paramsRef.current = loaded;
    setParams(loaded);
  }, []);

  const change = useCallback((next: Partial<Params>) => {
    const merged = { ...paramsRef.current, ...next };
    paramsRef.current = merged;
    setParams(merged);
    try {
      localStorage.setItem(STORE, JSON.stringify(merged));
    } catch {
      // storage unavailable: settings last for this visit
    }
  }, []);

  const copyValues = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(paramsRef.current, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    const hero = heroRef.current;
    const host = hostRef.current;
    const row = rowRef.current;
    if (!hero || !host || !row) return;
    let cancelled = false;
    let cleanup = () => { };

    (async () => {
      const THREE = await import("three");
      if (cancelled) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      host.appendChild(renderer.domElement);

      const camera = new THREE.Camera();
      const geometry = new THREE.PlaneGeometry(2, 2);
      const makeTarget = (w: number, h: number) =>
        new THREE.WebGLRenderTarget(w, h, {
          type: THREE.HalfFloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: false,
        });
      let a = makeTarget(4, 4);
      let b = makeTarget(4, 4);

      const simMat = new THREE.ShaderMaterial({
        vertexShader: QUAD,
        fragmentShader: SIM,
        blending: THREE.NoBlending,
        uniforms: {
          uPrev: { value: null },
          uCursor: { value: new THREE.Vector2(0.5, 0.5) },
          uMove: { value: new THREE.Vector2() },
          uAspect: { value: 1 },
          uTime: { value: 0 },
          uSize: { value: 0.2 },
          uDecay: { value: 0.97 },
          uSwirl: { value: 1 },
          uOn: { value: 0 },
        },
      });
      const compMat = new THREE.ShaderMaterial({
        vertexShader: QUAD,
        fragmentShader: COMP,
        blending: THREE.NoBlending,
        uniforms: {
          uMask: { value: null },
          uPhoto: { value: null },
          uView: { value: new THREE.Vector2(1, 1) },
          uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
          uTexel: { value: new THREE.Vector2(0.001, 0.001) },
          uTime: { value: 0 },
          uIntro: { value: reduced ? 1 : 0 },
          uRim: { value: 0.32 },
          uColor: { value: 1 },
          uStyle: { value: 0 },
          uPhotoFade: { value: 0 },
        },
      });
      const simScene = new THREE.Scene();
      simScene.add(new THREE.Mesh(geometry, simMat));
      const compScene = new THREE.Scene();
      compScene.add(new THREE.Mesh(geometry, compMat));

      let W = 1;
      let H = 1;
      const rowAspect = (1 + (MEMBERS.length - 1) * STEP) * PHOTO_ASPECT;
      const rowRect = { x: 0, z: 1, h: 1 };
      let picked: number | null = null;
      const placePhoto = () => {
        // The whole band in one row across the bottom
        const wFrac = W / H < 1 ? 1 : 0.96;
        const hFrac = Math.min(((wFrac * W) / rowAspect) / H, 0.62);
        const fitted = (hFrac * H * rowAspect) / W;
        rowRect.x = 0.5 - fitted / 2;
        rowRect.z = fitted;
        rowRect.h = hFrac;
        const g = picked !== null ? zoomGoal(picked) : rowRect;
        compMat.uniforms.uRect.value.set(g.x, 0, g.z, g.h);
        row.style.setProperty("--row-width", `${fitted * ((MEMBERS.length * STEP * PHOTO_ASPECT) / rowAspect) * 100}%`);
      };
      /* With a member chosen, the whole row zooms so that person fills the space left of the fact sheet */
      const zoomGoal = (i: number) => {
        const sheet = W >= 640 ? Math.max(W / 3, 480) : 0; // matches .lrt-sheet
        const free = W - sheet;
        const h = Math.min(0.92, (free * 0.94) / (H * PHOTO_ASPECT));
        const z = (h * H * rowAspect) / W;
        const start = (i * STEP * PHOTO_ASPECT) / rowAspect;
        const width = PHOTO_ASPECT / rowAspect;
        const cx = (free / 2) / W;
        return { x: cx - (start + width / 2) * z, z, h };
      };
      const resize = () => {
        W = host.clientWidth;
        H = host.clientHeight;
        renderer.setSize(W, H);
        compMat.uniforms.uView.value.set(W, H);
        simMat.uniforms.uAspect.value = W / H;
        const sh = 360;
        const sw = Math.max(64, Math.round((sh * W) / H));
        a.setSize(sw, sh);
        b.setSize(sw, sh);
        placePhoto();
      };
      resize();
      window.addEventListener("resize", resize);

      const people: import("three").Texture[] = [];
      let composed: import("three").WebGLRenderTarget | null = null;
      let composeMat: import("three").ShaderMaterial | null = null;
      let composeScene: import("three").Scene | null = null;
      let masks: { data: Uint8ClampedArray; w: number; h: number }[] = [];
      let targetFade = 0;
      const fades = MEMBERS.map(() => 1);
      let needsCompose = true;
      const memberW = PHOTO_ASPECT / rowAspect;
      const memberStart = MEMBERS.map((_, i) => i * STEP * memberW);

      Promise.all(
        MEMBERS.map(
          (m) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = m.image;
            }),
        ),
      ).then((imgs) => {
        if (cancelled) return;
        // Low-res alpha maps, so a click only counts on the person and not the air around them
        masks = imgs.map((img) => {
          const c = document.createElement("canvas");
          c.width = 72;
          c.height = 60;
          const ctx = c.getContext("2d");
          ctx?.drawImage(img, 0, 0, c.width, c.height);
          return { data: ctx ? ctx.getImageData(0, 0, c.width, c.height).data : new Uint8ClampedArray(0), w: c.width, h: c.height };
        });
        imgs.forEach((img) => {
          const tex = new THREE.Texture(img);
          tex.colorSpace = THREE.NoColorSpace;
          tex.premultiplyAlpha = true;
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          people.push(tex);
        });
        const ch = 1001;
        const cw = Math.min(4096, Math.round(ch * rowAspect));
        const rtH = Math.round((cw / rowAspect));
        composed = new THREE.WebGLRenderTarget(cw, rtH, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: false,
        });
        composeMat = new THREE.ShaderMaterial({
          vertexShader: QUAD,
          fragmentShader: COMPOSE,
          blending: THREE.NoBlending,
          uniforms: {
            uPeople: { value: people },
            uFades: { value: fades },
            uStart: { value: memberStart },
            uWidth: { value: memberW },
            uOrder: { value: DRAW_ORDER },
            uTime: { value: 0 },
          },
        });
        composeScene = new THREE.Scene();
        composeScene.add(new THREE.Mesh(geometry, composeMat));
        compMat.uniforms.uTexel.value.set(1.5 / cw, 1.5 / rtH);
        compMat.uniforms.uPhoto.value = composed.texture;
        needsCompose = true;
        targetFade = 1;
      });

      const hitAt = (nx: number, ny: number) => {
        const rect = compMat.uniforms.uRect.value;
        const u = (nx - rect.x) / rect.z;
        const v = ny / rect.w;
        if (u < 0 || u > 1 || v < 0 || v > 1 || !masks.length) return -1;
        for (let n = DRAW_ORDER.length - 1; n >= 0; n--) {
          const i = DRAW_ORDER[n];
          if (fades[i] < 0.5) continue;
          const lu = (u - memberStart[i]) / memberW;
          if (lu < 0 || lu >= 1) continue;
          const m = masks[i];
          const px = Math.floor(lu * m.w);
          const py = Math.min(m.h - 1, Math.floor((1 - v) * m.h));
          if (m.data[(py * m.w + px) * 4 + 3] > 128) return i;
        }
        return -1;
      };
      // Members go one after another, spreading outward from the chosen person
      const delays = MEMBERS.map(() => 0);
      let changedAt = 0;
      const select = (i: number | null) => {
        const center = i ?? picked ?? 2;
        picked = i;
        changedAt = performance.now();
        delays.forEach((_, m) => { delays[m] = Math.abs(m - center) * 0.1; });
        setSelected(i);
      };
      selectRef.current = select;
      const onClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest?.("a, button, input, select, label, .lrt-panel")) return;
        const r = host.getBoundingClientRect();
        const hit = hitAt((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
        if (picked !== null) select(null);
        else if (hit >= 0) select(hit);
      };
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") select(null);
      };
      hero.addEventListener("click", onClick);
      window.addEventListener("keydown", onEsc);

      const pointer = { x: 0.5, y: 0.5, inside: false };
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width;
        pointer.y = 1 - (e.clientY - r.top) / r.height;
        pointer.inside = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1;
      };
      const onLeave = () => { pointer.inside = false; };
      // On window, because the open fact sheet sits in a layer above the hero
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerdown", onMove);
      document.documentElement.addEventListener("pointerleave", onLeave);

      let visible = true;
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
      io.observe(hero);

      const cursor = new THREE.Vector2(0.5, 0.5);
      const prev = new THREE.Vector2(0.5, 0.5);
      let raf = 0;
      let shownOver = -1;
      let lastFrame = performance.now();
      let transitioning = false;
      const startedAt = performance.now();

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const p = paramsRef.current;
        const time = (now - startedAt) / 1000;

        const auto = (p.auto || (coarse && !pointer.inside)) && !reduced;
        const active = pointer.inside || auto;
        const rect = compMat.uniforms.uRect.value;
        const chosen = picked !== null ? zoomGoal(picked) : null;
        const goal = chosen ?? rowRect;
        const glide = reduced ? 1 : 0.075;
        rect.x += (goal.x - rect.x) * glide;
        rect.z += (goal.z - rect.z) * glide;
        rect.w += (goal.h - rect.w) * glide;
        const gx = auto && !pointer.inside ? 0.5 + Math.sin(time * 0.7) * rect.z * 0.28 : pointer.x;
        const gy = auto && !pointer.inside ? rect.w * 0.42 + Math.sin(time * 1.1) * rect.w * 0.2 : pointer.y;
        cursor.x += (gx - cursor.x) * p.lag;
        cursor.y += (gy - cursor.y) * p.lag;
        // Highlight the name of whoever the cursor is over
        const over = pointer.inside ? hitAt(pointer.x, pointer.y) : -1;
        if (over !== shownOver) {
          shownOver = over;
          setActive(over);
          hero.style.cursor = over >= 0 ? "pointer" : "";
        }

        // Fade members in and out, rebuilding the layered image only while something changes
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        fades.forEach((f, i) => {
          const goal = picked === null || picked === i ? 1 : 0;
          if (f === goal) return;
          if (!reduced && (now - changedAt) / 1000 < delays[i]) return;
          const step = dt / Math.max(0.05, p.vanish);
          const next = goal > f ? Math.min(1, f + step) : Math.max(0, f - step);
          fades[i] = reduced ? goal : next;
        });
        if (fades.some((f) => f > 0 && f < 1) || transitioning) needsCompose = true;
        transitioning = fades.some((f) => f > 0 && f < 1);
        if (composeMat) composeMat.uniforms.uTime.value = time;
        if (needsCompose && composed && composeScene) {
          needsCompose = false;
          renderer.setRenderTarget(composed);
          renderer.render(composeScene, camera);
          renderer.setRenderTarget(null);
        }
        const introT = reduced ? 1 : Math.min(1, time / 2.2);

        const s = simMat.uniforms;
        s.uCursor.value.copy(cursor);
        s.uMove.value.set((cursor.x - prev.x) * (W / H), cursor.y - prev.y);
        prev.copy(cursor);
        s.uTime.value = time;
        s.uSize.value = p.size;
        s.uDecay.value = p.trail;
        s.uSwirl.value = p.swirl;
        s.uOn.value = active && introT >= 1 ? 1 : 0;
        s.uPrev.value = a.texture;
        renderer.setRenderTarget(b);
        renderer.render(simScene, camera);
        renderer.setRenderTarget(null);
        const swap = a;
        a = b;
        b = swap;

        const c = compMat.uniforms;
        c.uMask.value = a.texture;
        c.uTime.value = time;
        c.uIntro.value = introT;
        c.uRim.value = p.rim;
        c.uColor.value = p.color;
        c.uStyle.value = p.style;
        c.uPhotoFade.value += (targetFade - c.uPhotoFade.value) * 0.07;
        // The photo rises into place during the intro
        const e = 1 - Math.pow(1 - introT, 3);
        const baseRect = rect.y;
        rect.y = -0.22 * (1 - e);
        renderer.render(compScene, camera);
        rect.y = baseRect;
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        selectRef.current = () => { };
        hero.removeEventListener("click", onClick);
        window.removeEventListener("keydown", onEsc);
        people.forEach((t) => t.dispose());
        composed?.dispose();
        composeMat?.dispose();
        a.dispose();
        b.dispose();
        simMat.dispose();
        compMat.dispose();
        geometry.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <section ref={heroRef} className="lrt" data-no-text-anim aria-labelledby="lrt-title">
      <h1 className="lrt-giant" id="lrt-title" data-hidden={selected !== null}>
        Members
      </h1>

      <div ref={hostRef} className="lrt-canvas" aria-hidden="true" />

      <div className="lrt-copy" data-hidden={selected !== null}>
        <p className="lrt-tag">40 years of live rock. 700+ songs.</p>
        <p className="lrt-lead">Move across the band to look inside the group that has been on stage for four decades.</p>
      </div>

      <ul ref={rowRef} className="lrt-names" aria-label="The band" data-hidden={selected !== null}>
        {MEMBERS.map((m, i) => (
          <li key={m.name} data-active={i === active || i === selected}>
            <button
              type="button"
              aria-pressed={i === selected}
              onClick={() => selectRef.current(i === selected ? null : i)}
            >
              {m.name}
            </button>
          </li>
        ))}
      </ul>

      <aside className="lrt-panel" aria-label="Controls">
        <button type="button" className="lrt-panel-toggle" aria-expanded={panelOpen} onClick={() => setPanelOpen((o) => !o)}>
          Controls <span aria-hidden="true">{panelOpen ? "−" : "+"}</span>
        </button>
        {panelOpen && (
          <div className="lrt-panel-body">
            {SLIDERS.map((s) => (
              <label key={s.key} className="lrt-slider">
                <span>
                  {s.label}
                  <output>{params[s.key]}</output>
                </span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.key]}
                  onChange={(e) => change({ [s.key]: Number(e.target.value) } as Partial<Params>)}
                />
              </label>
            ))}
            <label className="lrt-slider">
              <span>Inside look</span>
              <select value={params.style} onChange={(e) => change({ style: Number(e.target.value) })}>
                {STYLES.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="lrt-toggle">
              <input type="checkbox" checked={params.auto} onChange={(e) => change({ auto: e.target.checked })} />
              Auto demo
            </label>
            <div className="lrt-panel-actions">
              <button type="button" onClick={() => change({ ...DEFAULTS })}>
                Reset
              </button>
              <button type="button" onClick={copyValues}>
                {copied ? "Copied" : "Copy values"}
              </button>
            </div>
          </div>
        )}
      </aside>

      <MemberFactSheetDrawer
        isOpen={selected !== null}
        member={selected !== null ? FACT_SHEETS[selected] : null}
        allMembers={FACT_SHEETS}
        panelClassName="lrt-sheet"
        onClose={() => selectRef.current(null)}
        onSelectMember={(m) => {
          const i = FACT_SHEETS.findIndex((x) => x.name === m.name);
          if (i >= 0) selectRef.current(i);
        }}
      />
    </section>
  );
}
