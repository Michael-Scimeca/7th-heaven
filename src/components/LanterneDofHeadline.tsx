"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";

export interface LanterneDofHeadlineProps {
  /** Stacked display lines (e.g. ["LANTERNE", "ARCHITECTES"] or ["SINCE 1985,", "MUSIC THAT AWAKENS STORIES"]). */
  readonly lines: readonly string[];
  /** Semantic element rendered via screen-reader-accessible markup. */
  readonly as?: "h1" | "h2" | "h3" | "div";
  /** Optional DOM id attached to the semantic heading element (e.g. for section aria-labelledby). */
  readonly headingId?: string;
  /** Horizontal alignment of the display typography inside the stage. */
  readonly align?: "center" | "left";
  /** CSS hex or rgb color for the display letterforms (e.g. "#FFFFFF" or "#E83D18"). */
  readonly color?: string;
  /** Maximum vertical pitch tilt angle in degrees when tracking cursor Y. */
  readonly maxTiltXDeg?: number;
  /** Maximum horizontal yaw tilt angle in degrees when tracking cursor X. */
  readonly maxTiltYDeg?: number;
  /** Exponential damping factor (0.02 = heavy inertia, 0.2 = snappy). */
  readonly damping?: number;
  /** Maximum Depth-of-Field Circle-of-Confusion bokeh radius in CSS pixels. */
  readonly bokehStrength?: number;
  /** Half-width of the razor-sharp z = 0 focal band before DoF blur ramps in (0..0.45). */
  readonly focusWidth?: number;
  /** Depth distance over which blur ramps from sharp (CoC = 0) to full bokeh (CoC = 1). */
  readonly focusFalloff?: number;
  /** Tactile risograph pigment grain & stochastic powdery bokeh stipple (0..1). */
  readonly grainIntensity?: number;
  /** 3D camera vertical field of view in degrees. */
  readonly perspectiveFovDeg?: number;
  /** Ease back to flat razor-sharp resting pose when pointer leaves window/stage. */
  readonly resetOnLeave?: boolean;
  /** Optional override for CSS font-family (defaults to site --font-heading). */
  readonly fontFamily?: string;
  /** Line-height multiplier for multi-line display stacks. */
  readonly lineHeight?: number;
  /** Uppercase display lines automatically. */
  readonly uppercase?: boolean;
  /** Sizing strategy: "fit-stage" fills the stage container; "computed" matches natural CSS font-size & flush alignment with transparent bokeh bleed. */
  readonly fontSizeMode?: "fit-stage" | "computed";
  /** CSS typography class applied to the hidden probe / layout sizer (defaults to "font-heading"). */
  readonly typographyClassName?: string;
  /** Optional override to preview full 3D motion even when OS prefers-reduced-motion is enabled. */
  readonly forceMotion?: boolean;
  readonly className?: string;
}

const COMPUTED_BLEED_X_CSS_PX = 160;
const COMPUTED_BLEED_Y_CSS_PX = 80;

const FULLSCREEN_VERT = `#version 300 es
precision highp float;
out vec2 vUv;

void main() {
  vec2 pos = vec2(
    (gl_VertexID == 1) ? 3.0 : -1.0,
    (gl_VertexID == 2) ? 3.0 : -1.0
  );
  vUv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const PASS1_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outCoc;

uniform sampler2D uTextTex;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uYaw;
uniform float uPitch;
uniform float uFovRad;
uniform float uPivotX;
uniform vec3 uBaseColor;
uniform float uFocusBand;
uniform float uFocusFalloff;
uniform float uGrain;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  float aspect = max(0.01, uResolution.x / max(1.0, uResolution.y));
  vec2 ndc = vUv * 2.0 - 1.0;

  float camZ = 1.0 / tan(0.5 * uFovRad);
  vec3 camPos = vec3(0.0, 0.0, camZ);
  vec3 rayDir = normalize(vec3(ndc.x * aspect, ndc.y, -camZ));
  vec3 pivot = vec3(uPivotX * aspect, 0.0, 0.0);

  float cy = cos(uYaw);
  float sy = sin(uYaw);
  float cp = cos(uPitch);
  float sp = sin(uPitch);

  // Orthonormal 3D LookAt plane basis: Ry(yaw) * Rx(-pitch)
  vec3 axisU = vec3(cy, 0.0, -sy);
  vec3 axisV = vec3(-sp * sy, cp, -sp * cy);
  vec3 axisN = vec3(cp * sy, sp, cp * cy);

  float denom = dot(rayDir, axisN);
  if (denom >= -0.0001) {
    outColor = vec4(0.0);
    outCoc = vec4(0.0);
    return;
  }

  float t = dot(pivot - camPos, axisN) / denom;
  if (t <= 0.0) {
    outColor = vec4(0.0);
    outCoc = vec4(0.0);
    return;
  }

  vec3 hit = camPos + rayDir * t;
  vec3 rel = hit - pivot;
  float u = dot(rel, axisU);
  float v = dot(rel, axisV);

  vec2 planeUV = vec2((u / aspect + uPivotX) * 0.5 + 0.5, v * 0.5 + 0.5);

  float distZ = abs(hit.z) / max(1.0, aspect * 0.55);
  float cocNorm = smoothstep(
    uFocusBand,
    uFocusBand + max(0.02, uFocusFalloff),
    distZ
  );

  // Sample texture unconditionally in uniform control flow to prevent Metal/ANGLE mipmap LOD spikes at UV borders
  vec2 clampedPlaneUV = clamp(planeUV, vec2(0.015), vec2(0.985));
  float sampledAlpha = texture(uTextTex, clampedPlaneUV).a;
  float inBounds =
    step(0.015, planeUV.x) *
    step(planeUV.x, 0.985) *
    step(0.015, planeUV.y) *
    step(planeUV.y, 0.985);
  float alpha = sampledAlpha * inBounds;

  if (alpha <= 0.001) {
    outColor = vec4(0.0);
    outCoc = vec4(cocNorm, 0.0, 0.0, 1.0);
    return;
  }

  // Subtle 3D-surface-anchored base pigment tooth before DoF gather
  vec2 planeCssPx = clampedPlaneUV * (uResolution / max(1.0, uDpr));
  float nMid = valueNoise(planeCssPx * 0.65) - 0.5;
  vec3 surfaceColor = clamp(
    uBaseColor * (1.0 + nMid * 0.22 * uGrain),
    vec3(0.0),
    vec3(1.0)
  );

  outColor = vec4(surfaceColor * alpha, alpha);
  outCoc = vec4(cocNorm, 0.0, 0.0, 1.0);
}
`;

const PASS2_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uColorTex;
uniform sampler2D uCocTex;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uBokehMaxPx;
uniform float uGrain;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec2 texel = 1.0 / max(vec2(1.0), uResolution);
  float maxUvRadius = uBokehMaxPx * uDpr;

  // Dilate CoC slightly so transparent pixels adjacent to tilted letters gather full bokeh halo
  float dilatedCoc = texture(uCocTex, vUv).r;
  vec2 d1 = vec2(maxUvRadius * 0.65, 0.0) * texel;
  vec2 d2 = vec2(0.0, maxUvRadius * 0.65) * texel;
  vec2 d3 = vec2(maxUvRadius * 0.46, maxUvRadius * 0.46) * texel;
  vec2 d4 = vec2(-maxUvRadius * 0.46, maxUvRadius * 0.46) * texel;

  dilatedCoc = max(dilatedCoc, texture(uCocTex, clamp(vUv + d1, 0.001, 0.999)).r);
  dilatedCoc = max(dilatedCoc, texture(uCocTex, clamp(vUv - d1, 0.001, 0.999)).r);
  dilatedCoc = max(dilatedCoc, texture(uCocTex, clamp(vUv + d2, 0.001, 0.999)).r);
  dilatedCoc = max(dilatedCoc, texture(uCocTex, clamp(vUv - d2, 0.001, 0.999)).r);
  dilatedCoc = max(dilatedCoc, texture(uCocTex, clamp(vUv + d3, 0.001, 0.999)).r);
  dilatedCoc = max(dilatedCoc, texture(uCocTex, clamp(vUv - d3, 0.001, 0.999)).r);
  dilatedCoc = max(dilatedCoc, texture(uCocTex, clamp(vUv + d4, 0.001, 0.999)).r);
  dilatedCoc = max(dilatedCoc, texture(uCocTex, clamp(vUv - d4, 0.001, 0.999)).r);

  float ign = fract(
    52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))
  );
  float seed2 = hash12(gl_FragCoord.xy + vec2(19.37, 73.91));

  float radiusPx = dilatedCoc * maxUvRadius;
  vec4 blurred;

  if (radiusPx < 0.4) {
    blurred = texture(uColorTex, vUv);
  } else {
    float baseAngle = ign * 6.28318530718;
    vec4 acc = vec4(0.0);
    float wSum = 0.0;
    const int TAPS = 56;

    for (int i = 0; i < TAPS; i++) {
      float fi = float(i);
      float rNorm = sqrt((fi + 0.5) / float(TAPS));
      float tapNoise = fract(seed2 + fi * 0.61803398875);
      float rJitter = rNorm * mix(1.0, 0.68 + 0.6 * tapNoise, uGrain * 0.85);
      float theta = baseAngle + fi * 2.39996322973;

      vec2 offsetUv = vec2(cos(theta), sin(theta)) * (rJitter * radiusPx) * texel;
      vec2 sampleUv = clamp(vUv + offsetUv, vec2(0.001), vec2(0.999));

      vec4 sCol = texture(uColorTex, sampleUv);
      float sCoc = texture(uCocTex, sampleUv).r;
      float w = mix(
        0.32,
        1.0,
        smoothstep(0.0, max(0.04, dilatedCoc), max(sCoc, dilatedCoc * (1.0 - rNorm)))
      );

      acc += sCol * w;
      wSum += w;
    }

    blurred = acc / max(0.0001, wSum);
  }

  if (blurred.a <= 0.002) {
    fragColor = vec4(0.0);
    return;
  }

  vec3 inkRgb = clamp(blurred.rgb / max(0.001, blurred.a), vec3(0.0), vec3(1.0));
  float outAlpha = clamp(blurred.a, 0.0, 1.0);

  if (uGrain > 0.001) {
    // Crisp post-bokeh risograph mineral grain across both sharp and blurred letterforms
    vec2 cssPx = gl_FragCoord.xy / max(1.0, uDpr);
    float nFine = hash12(floor(cssPx * 1.45));
    float nPaper = valueNoise(cssPx * 0.82);
    float grainSignal = mix(nPaper, nFine, 0.74) - 0.5;

    float baseLuma = dot(inkRgb, vec3(0.299, 0.587, 0.114));
    vec3 lightSpeck = baseLuma > 0.82
      ? vec3(1.0)
      : mix(inkRgb, vec3(1.0, 0.95, 0.91), 0.62);
    vec3 darkSpeck = baseLuma > 0.82
      ? inkRgb * 0.72
      : inkRgb * 0.73;

    inkRgb = grainSignal > 0.0
      ? mix(inkRgb, lightSpeck, clamp(grainSignal * 2.35 * uGrain, 0.0, 0.92))
      : mix(inkRgb, darkSpeck, clamp(-grainSignal * 2.1 * uGrain, 0.0, 0.84));

    // Powdery stochastic stipple along out-of-focus bokeh fringe
    float fringe = outAlpha * (1.0 - outAlpha) * 4.0;
    float powder =
      1.0 + (seed2 - 0.5) * 0.52 * uGrain * dilatedCoc * clamp(0.25 + fringe, 0.0, 1.25);
    outAlpha = clamp(outAlpha * clamp(powder, 0.42, 1.38), 0.0, 1.0);
  }

  fragColor = vec4(inkRgb * outAlpha, outAlpha);
}
`;

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs);
    if (fs) gl.deleteShader(fs);
    return null;
  }
  const prog = gl.createProgram();
  if (!prog) {
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  }
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

function parseColorToRgb01(
  cssColor: string,
  scratchCtx: CanvasRenderingContext2D | null
): [number, number, number] {
  const trimmed = cssColor.trim();
  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(trimmed);
  if (hexMatch) {
    const raw = hexMatch[1];
    const hex =
      raw.length === 3
        ? `${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`
        : raw;
    const num = Number.parseInt(hex, 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255,
    ];
  }

  if (scratchCtx) {
    scratchCtx.fillStyle = "#ffffff";
    scratchCtx.fillStyle = trimmed;
    const normalized = scratchCtx.fillStyle;
    const normHex = /^#([0-9a-f]{6})$/i.exec(normalized);
    if (normHex) {
      const num = Number.parseInt(normHex[1], 16);
      return [
        ((num >> 16) & 255) / 255,
        ((num >> 8) & 255) / 255,
        (num & 255) / 255,
      ];
    }
    const rgbMatch = normalized.match(/\d+/g);
    if (rgbMatch && rgbMatch.length >= 3) {
      return [
        Number(rgbMatch[0]) / 255,
        Number(rgbMatch[1]) / 255,
        Number(rgbMatch[2]) / 255,
      ];
    }
  }

  return [1, 1, 1];
}

export function LanterneDofHeadline({
  lines,
  as: SemanticTag = "h2",
  headingId,
  align = "center",
  color = "#FFFFFF",
  maxTiltXDeg = 13,
  maxTiltYDeg = 22,
  damping = 0.08,
  bokehStrength = 18,
  focusWidth = 0.07,
  focusFalloff = 0.4,
  grainIntensity = 0.46,
  perspectiveFovDeg = 34,
  resetOnLeave = false,
  fontFamily,
  lineHeight = 0.94,
  uppercase = true,
  fontSizeMode = "fit-stage",
  typographyClassName = "font-heading",
  forceMotion = false,
  className = "",
}: LanterneDofHeadlineProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontProbeRef = useRef<HTMLSpanElement>(null);
  const wakeLoopRef = useRef<(() => void) | null>(null);
  const rasterizeTextRef = useRef<(() => void) | null>(null);

  const systemReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const reducedMotion = !forceMotion && systemReducedMotion;

  const paramsRef = useRef({
    lines,
    align,
    color,
    maxTiltXDeg,
    maxTiltYDeg,
    damping,
    bokehStrength,
    focusWidth,
    focusFalloff,
    grainIntensity,
    perspectiveFovDeg,
    resetOnLeave,
    fontFamily,
    lineHeight,
    uppercase,
    fontSizeMode,
    reducedMotion,
  });

  useEffect(() => {
    const prev = paramsRef.current;
    const textChanged =
      prev.lines.join("\n") !== lines.join("\n") ||
      prev.align !== align ||
      prev.fontFamily !== fontFamily ||
      prev.lineHeight !== lineHeight ||
      prev.uppercase !== uppercase ||
      prev.fontSizeMode !== fontSizeMode;

    paramsRef.current = {
      lines,
      align,
      color,
      maxTiltXDeg,
      maxTiltYDeg,
      damping,
      bokehStrength,
      focusWidth,
      focusFalloff,
      grainIntensity,
      perspectiveFovDeg,
      resetOnLeave,
      fontFamily,
      lineHeight,
      uppercase,
      fontSizeMode,
      reducedMotion,
    };

    if (textChanged) {
      rasterizeTextRef.current?.();
    }
    wakeLoopRef.current?.();
  }, [
    lines,
    align,
    color,
    maxTiltXDeg,
    maxTiltYDeg,
    damping,
    bokehStrength,
    focusWidth,
    focusFalloff,
    grainIntensity,
    perspectiveFovDeg,
    resetOnLeave,
    fontFamily,
    lineHeight,
    uppercase,
    fontSizeMode,
    reducedMotion,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const pass1Prog = createProgram(gl, FULLSCREEN_VERT, PASS1_FRAG);
    const pass2Prog = createProgram(gl, FULLSCREEN_VERT, PASS2_FRAG);
    if (!pass1Prog || !pass2Prog) {
      if (pass1Prog) gl.deleteProgram(pass1Prog);
      if (pass2Prog) gl.deleteProgram(pass2Prog);
      return;
    }

    const vao = gl.createVertexArray();
    const textTex = gl.createTexture();
    const fboColorTex = gl.createTexture();
    const fboCocTex = gl.createTexture();
    const fbo = gl.createFramebuffer();

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");

    const p1Loc = {
      uTextTex: gl.getUniformLocation(pass1Prog, "uTextTex"),
      uResolution: gl.getUniformLocation(pass1Prog, "uResolution"),
      uDpr: gl.getUniformLocation(pass1Prog, "uDpr"),
      uYaw: gl.getUniformLocation(pass1Prog, "uYaw"),
      uPitch: gl.getUniformLocation(pass1Prog, "uPitch"),
      uFovRad: gl.getUniformLocation(pass1Prog, "uFovRad"),
      uPivotX: gl.getUniformLocation(pass1Prog, "uPivotX"),
      uBaseColor: gl.getUniformLocation(pass1Prog, "uBaseColor"),
      uFocusBand: gl.getUniformLocation(pass1Prog, "uFocusBand"),
      uFocusFalloff: gl.getUniformLocation(pass1Prog, "uFocusFalloff"),
      uGrain: gl.getUniformLocation(pass1Prog, "uGrain"),
    };

    const p2Loc = {
      uColorTex: gl.getUniformLocation(pass2Prog, "uColorTex"),
      uCocTex: gl.getUniformLocation(pass2Prog, "uCocTex"),
      uResolution: gl.getUniformLocation(pass2Prog, "uResolution"),
      uDpr: gl.getUniformLocation(pass2Prog, "uDpr"),
      uBokehMaxPx: gl.getUniformLocation(pass2Prog, "uBokehMaxPx"),
      uGrain: gl.getUniformLocation(pass2Prog, "uGrain"),
    };

    let allocatedW = 0;
    let allocatedH = 0;
    let activeDpr = Math.min(window.devicePixelRatio || 1, 2);

    const allocateFboTargets = (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      if (allocatedW === w && allocatedH === h) return;
      allocatedW = w;
      allocatedH = h;

      gl.bindTexture(gl.TEXTURE_2D, fboColorTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        w,
        h,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.bindTexture(gl.TEXTURE_2D, fboCocTex);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        w,
        h,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        fboColorTex,
        0
      );
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT1,
        gl.TEXTURE_2D,
        fboCocTex,
        0
      );
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const rasterizeText = () => {
      if (!textCtx) return;
      const p = paramsRef.current;

      if (p.fontSizeMode === "computed") {
        const rawDpr = window.devicePixelRatio || 1;
        activeDpr = Math.min(rawDpr, 2);
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const syncW = Math.max(1, Math.round(rect.width * activeDpr));
          const syncH = Math.max(1, Math.round(rect.height * activeDpr));
          if (canvas.width !== syncW || canvas.height !== syncH) {
            canvas.width = syncW;
            canvas.height = syncH;
            allocateFboTargets(syncW, syncH);
          }
        }
      }

      if (canvas.width <= 0 || canvas.height <= 0) return;
      const w = canvas.width;
      const h = canvas.height;
      textCanvas.width = w;
      textCanvas.height = h;
      textCtx.clearRect(0, 0, w, h);

      const rawLines = p.lines.filter((line) => line.trim().length > 0);
      const displayLines = (rawLines.length > 0 ? rawLines : ["7TH HEAVEN"]).map(
        (line) => (p.uppercase ? line.toUpperCase() : line)
      );

      const probeStyle = fontProbeRef.current
        ? getComputedStyle(fontProbeRef.current)
        : null;
      const computedProbeFont = probeStyle ? probeStyle.fontFamily.trim() : "";
      const resolvedFont =
        p.fontFamily || computedProbeFont || "Impact, system-ui, sans-serif";

      if (p.fontSizeMode === "computed") {
        const cssFontPx = probeStyle
          ? Number.parseFloat(probeStyle.fontSize) || 64
          : 64;
        const bleedXDevPx = COMPUTED_BLEED_X_CSS_PX * activeDpr;
        let fontSize = Math.max(20, Math.round(cssFontPx * activeDpr));

        textCtx.font = `400 ${fontSize}px ${resolvedFont}`;
        let maxLineW = 1;
        for (const line of displayLines) {
          const mw = textCtx.measureText(line).width;
          if (mw > maxLineW) maxLineW = mw;
        }
        const availW = Math.max(32, w - bleedXDevPx * 2);
        if (maxLineW > availW * 1.04) {
          fontSize = Math.max(20, Math.floor((availW / maxLineW) * fontSize));
          textCtx.font = `400 ${fontSize}px ${resolvedFont}`;
        }

        textCtx.fillStyle = "#ffffff";
        textCtx.textBaseline = "middle";
        textCtx.textAlign = p.align === "left" ? "left" : "center";

        const stepY = fontSize * p.lineHeight;
        const totalBlockHeight = stepY * (displayLines.length - 1);
        const startY = h * 0.5 - totalBlockHeight * 0.5;
        const anchorX = p.align === "left" ? bleedXDevPx : w * 0.5;

        for (let i = 0; i < displayLines.length; i++) {
          textCtx.fillText(displayLines[i], anchorX, startY + i * stepY);
        }
      } else {
        const refSize = 240;
        textCtx.font = `400 ${refSize}px ${resolvedFont}`;
        let maxMeasuredWidth = 1;
        for (const line of displayLines) {
          const measured = textCtx.measureText(line).width;
          if (measured > maxMeasuredWidth) maxMeasuredWidth = measured;
        }

        const safeHorizontalRatio = p.align === "left" ? 0.84 : 0.82;
        const safeVerticalRatio = 0.7;
        const fitByWidth =
          ((w * safeHorizontalRatio) / maxMeasuredWidth) * refSize;
        const fitByHeight =
          (h * safeVerticalRatio) /
          Math.max(1, displayLines.length * p.lineHeight);
        const fontSize = Math.max(
          24,
          Math.floor(Math.min(fitByWidth, fitByHeight))
        );

        textCtx.font = `400 ${fontSize}px ${resolvedFont}`;
        textCtx.fillStyle = "#ffffff";
        textCtx.textBaseline = "middle";
        textCtx.textAlign = p.align === "left" ? "left" : "center";

        const stepY = fontSize * p.lineHeight;
        const totalBlockHeight = stepY * (displayLines.length - 1);
        const startY = h * 0.5 - totalBlockHeight * 0.5;
        const anchorX = p.align === "left" ? w * 0.08 : w * 0.5;

        for (let i = 0; i < displayLines.length; i++) {
          textCtx.fillText(displayLines[i], anchorX, startY + i * stepY);
        }
      }

      gl.bindTexture(gl.TEXTURE_2D, textTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        textCanvas
      );
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    rasterizeTextRef.current = rasterizeText;

    let targetNormX = 0;
    let targetNormY = 0;
    let currentYaw = 0;
    let currentPitch = 0;
    let rafId: number | null = null;
    let isDisposed = false;

    const renderFrame = () => {
      rafId = null;
      if (isDisposed || canvas.width <= 0 || canvas.height <= 0) return;

      const p = paramsRef.current;
      const degToRad = Math.PI / 180;
      const goalYaw = p.reducedMotion
        ? 0
        : targetNormX * p.maxTiltYDeg * degToRad;
      const goalPitch = p.reducedMotion
        ? 0
        : targetNormY * p.maxTiltXDeg * degToRad;

      const alphaLerp = Math.min(1, Math.max(0.015, p.damping));
      currentYaw += (goalYaw - currentYaw) * alphaLerp;
      currentPitch += (goalPitch - currentPitch) * alphaLerp;

      const w = canvas.width;
      const h = canvas.height;
      allocateFboTargets(w, h);

      const [r, g, b] = parseColorToRgb01(p.color, textCtx);
      const fovRad = Math.max(12, Math.min(75, p.perspectiveFovDeg)) * degToRad;
      const pivotX =
        p.fontSizeMode === "computed"
          ? 0.0
          : p.align === "left"
            ? -0.22
            : 0.0;

      gl.bindVertexArray(vao);

      // PASS 1: 3D LookAt Ray-Plane + Tactile Risograph Pigment Grain + CoC
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, w, h);
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(pass1Prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textTex);
      gl.uniform1i(p1Loc.uTextTex, 0);
      gl.uniform2f(p1Loc.uResolution, w, h);
      gl.uniform1f(p1Loc.uDpr, activeDpr);
      gl.uniform1f(p1Loc.uYaw, currentYaw);
      gl.uniform1f(p1Loc.uPitch, currentPitch);
      gl.uniform1f(p1Loc.uFovRad, fovRad);
      gl.uniform1f(p1Loc.uPivotX, pivotX);
      gl.uniform3f(p1Loc.uBaseColor, r, g, b);
      gl.uniform1f(p1Loc.uFocusBand, p.focusWidth);
      gl.uniform1f(p1Loc.uFocusFalloff, p.focusFalloff);
      gl.uniform1f(p1Loc.uGrain, p.grainIntensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // PASS 2: 56-Tap Stochastic Golden-Angle Vogel Disc Bokeh -> Screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(pass2Prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboColorTex);
      gl.uniform1i(p2Loc.uColorTex, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, fboCocTex);
      gl.uniform1i(p2Loc.uCocTex, 1);

      gl.uniform2f(p2Loc.uResolution, w, h);
      gl.uniform1f(p2Loc.uDpr, activeDpr);
      gl.uniform1f(p2Loc.uBokehMaxPx, p.bokehStrength);
      gl.uniform1f(p2Loc.uGrain, p.grainIntensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindVertexArray(null);

      const remaining =
        Math.abs(goalYaw - currentYaw) + Math.abs(goalPitch - currentPitch);
      if (remaining > 0.00025) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const wakeLoop = () => {
      if (isDisposed) return;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };
    wakeLoopRef.current = wakeLoop;

    // Device-pixel-accurate ResizeObserver (capped at 2x DPR for sustained 60/120fps bokeh fillrate)
    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry || isDisposed) return;
      const rawDpr = window.devicePixelRatio || 1;
      activeDpr = Math.min(rawDpr, 2);
      const dpc = entry.devicePixelContentBoxSize;
      const scaleDown = rawDpr > 2 ? 2 / rawDpr : 1;

      const nextW = Math.max(
        1,
        dpc
          ? Math.round(dpc[0].inlineSize * scaleDown)
          : Math.round(entry.contentRect.width * activeDpr)
      );
      const nextH = Math.max(
        1,
        dpc
          ? Math.round(dpc[0].blockSize * scaleDown)
          : Math.round(entry.contentRect.height * activeDpr)
      );

      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
        allocateFboTargets(nextW, nextH);
        rasterizeText();
        wakeLoop();
      }
    });

    const supportsDpc =
      typeof ResizeObserverEntry !== "undefined" &&
      "devicePixelContentBoxSize" in ResizeObserverEntry.prototype;
    try {
      resizeObserver.observe(
        canvas,
        supportsDpc ? { box: "device-pixel-content-box" } : undefined
      );
    } catch {
      resizeObserver.observe(canvas);
    }

    if (document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (!isDisposed) {
            rasterizeText();
            wakeLoop();
          }
        })
        .catch(() => {});
    }

    const handlePointerMove = (e: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const halfSpanX = Math.max(rect.width * 0.5, window.innerWidth * 0.42);
      const halfSpanY = Math.max(rect.height * 0.5, window.innerHeight * 0.42);

      const nx = Math.max(-1, Math.min(1, (e.clientX - centerX) / halfSpanX));
      // Invert Y so cursor above center tilts plane upward (+pitch)
      const ny = Math.max(-1, Math.min(1, (centerY - e.clientY) / halfSpanY));

      targetNormX = nx;
      targetNormY = ny;
      wakeLoop();
    };

    const handlePointerLeaveWindow = () => {
      if (paramsRef.current.resetOnLeave) {
        targetNormX = 0;
        targetNormY = 0;
        wakeLoop();
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener(
      "mouseleave",
      handlePointerLeaveWindow
    );
    window.addEventListener("blur", handlePointerLeaveWindow);

    return () => {
      isDisposed = true;
      wakeLoopRef.current = null;
      rasterizeTextRef.current = null;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        handlePointerLeaveWindow
      );
      window.removeEventListener("blur", handlePointerLeaveWindow);

      gl.deleteFramebuffer(fbo);
      gl.deleteTexture(textTex);
      gl.deleteTexture(fboColorTex);
      gl.deleteTexture(fboCocTex);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(pass1Prog);
      gl.deleteProgram(pass2Prog);
    };
  }, []);

  const rawDisplayLines = lines.filter((line) => line.trim().length > 0);
  const effectiveLines = (
    rawDisplayLines.length > 0 ? rawDisplayLines : ["7TH HEAVEN"]
  ).map((line) => (uppercase ? line.toUpperCase() : line));
  const isComputedMode = fontSizeMode === "computed";

  return (
    <div
      ref={wrapperRef}
      className={`relative bg-transparent select-none ${
        isComputedMode
          ? align === "left"
            ? "inline-flex w-fit max-w-full items-start justify-start overflow-visible"
            : "inline-flex w-fit max-w-full items-center justify-center overflow-visible"
          : "flex w-full items-center justify-center"
      } ${className}`}
    >
      <SemanticTag id={headingId} className="sr-only">
        {effectiveLines.join(" ")}
      </SemanticTag>
      <span
        ref={fontProbeRef}
        aria-hidden="true"
        className={`sr-only ${typographyClassName}`}
      />
      {isComputedMode && (
        <div
          aria-hidden="true"
          className={`invisible pointer-events-none select-none ${
            align === "left" ? "pr-2 text-left" : "px-2 text-center"
          } ${typographyClassName}`}
        >
          {effectiveLines.map((line, idx) => (
            <span key={`${idx}-${line}`} className="block">
              {line}
            </span>
          ))}
        </div>
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={
          isComputedMode
            ? "pointer-events-none absolute -inset-x-40 -inset-y-20 block h-[calc(100%+10rem)] w-[calc(100%+20rem)] bg-transparent"
            : "pointer-events-none block size-full bg-transparent"
        }
      />
    </div>
  );
}

export default LanterneDofHeadline;
