"use client";

import { useEffect, useRef, useState, useCallback, useId } from "react";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

interface VideoOption {
  id: string;
  name: string;
  category: string;
  src: string;
}

const VIDEO_OPTIONS: readonly VideoOption[] = [
  {
    id: "tbwa-bgv",
    name: "TBWA\\HAKUHODO Official BGV",
    category: "Agency BGV",
    src: "/movie/tbwa-hakuhodo-bgv.mp4",
  },
  {
    id: "tbwa-30s",
    name: "TBWA\\HAKUHODO Loop 30s",
    category: "Brand Loop",
    src: "/movie/loops/tbwa-hakuhodo-30s.mp4",
  },
  {
    id: "color-motion",
    name: "Color In Motion Live Cut",
    category: "Stage Visuals",
    src: "/movie/color-in-motion-clip.mp4",
  },
  {
    id: "summerfest",
    name: "Summerfest Live 30s",
    category: "Festival Arena",
    src: "/movie/loops/summerfest-live-30s.mp4",
  },
  {
    id: "fest1",
    name: "Fest 1 Concert Crowd",
    category: "Live Arena",
    src: "/movie/fest1-clip.mp4",
  },
  {
    id: "be-here",
    name: "Be Here Live Clip",
    category: "Arena Lighting",
    src: "/movie/be-here-clip.mp4",
  },
];

interface EffectParams {
  expansion: number; // 0.0 = Stadium Capsule Pill, 1.0 = Full Screen
  sliceCount: number;
  slashAngleDeg: number;
  chromaticAberration: number;
  lensBulge: number;
  gapThickness: number;
  waveAmp: number;
  waveSpeed: number;
  shapeMode: 0 | 1 | 2; // 0 = Capsule Pill Lens, 1 = Full Screen, 2 = Cinema Wide
  borderColorMode: 0 | 1 | 2 | 3; // 0 = White, 1 = Red (User circled), 2 = Lime (TBWA), 3 = Cyan
  showOverlayText: boolean;
  activePresetId: string;
}

const DEFAULT_PARAMS: EffectParams = {
  expansion: 0.0, // starts as canonical capsule pill
  sliceCount: 22,
  slashAngleDeg: -26,
  chromaticAberration: 0.05,
  lensBulge: 0.38,
  gapThickness: 0.018,
  waveAmp: 0.75,
  waveSpeed: 1.8,
  shapeMode: 0,
  borderColorMode: 1, // Red by default matching user request screenshot
  showOverlayText: true,
  activePresetId: "tbwa-default",
};

interface Preset {
  id: string;
  label: string;
  tag: string;
  params: Partial<EffectParams>;
}

const PRESETS: readonly Preset[] = [
  {
    id: "tbwa-default",
    label: "TBWA\\HAKUHODO Original (Pill)",
    tag: "Canonical",
    params: {
      expansion: 0.0,
      sliceCount: 22,
      slashAngleDeg: -26,
      chromaticAberration: 0.05,
      lensBulge: 0.38,
      gapThickness: 0.018,
      waveAmp: 0.75,
      waveSpeed: 1.8,
      shapeMode: 0,
      borderColorMode: 1,
    },
  },
  {
    id: "tbwa-fullscreen",
    label: "Full Screen Unlocked",
    tag: "Expanded",
    params: {
      expansion: 1.0,
      sliceCount: 22,
      slashAngleDeg: -26,
      chromaticAberration: 0.04,
      lensBulge: 0.22,
      gapThickness: 0.014,
      waveAmp: 0.5,
      waveSpeed: 1.4,
      shapeMode: 0,
      borderColorMode: 1,
    },
  },
  {
    id: "hyper-prism",
    label: "Hyper-Prism Dispersion",
    tag: "Iridescent",
    params: {
      expansion: 0.0,
      sliceCount: 28,
      slashAngleDeg: -34,
      chromaticAberration: 0.095,
      lensBulge: 0.6,
      gapThickness: 0.03,
      waveAmp: 1.2,
      waveSpeed: 2.4,
      shapeMode: 0,
      borderColorMode: 2,
    },
  },
  {
    id: "cinema-scope",
    label: "2.39:1 Cinema Lens",
    tag: "Widescreen",
    params: {
      expansion: 0.0,
      sliceCount: 16,
      slashAngleDeg: -18,
      chromaticAberration: 0.035,
      lensBulge: 0.22,
      gapThickness: 0.014,
      waveAmp: 0.45,
      waveSpeed: 1.2,
      shapeMode: 2,
      borderColorMode: 0,
    },
  },
  {
    id: "dense-crystal",
    label: "Dense Crystal Ribbons",
    tag: "Precision",
    params: {
      expansion: 0.0,
      sliceCount: 36,
      slashAngleDeg: -30,
      chromaticAberration: 0.06,
      lensBulge: 0.45,
      gapThickness: 0.022,
      waveAmp: 0.9,
      waveSpeed: 2.2,
      shapeMode: 0,
      borderColorMode: 3,
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                               GLSL SHADERS                                 */
/* -------------------------------------------------------------------------- */

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  uniform vec2 uMouse;
  uniform float uLensBulge;
  uniform float uExpansion;
  uniform float uTime;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Center normalized distance
    vec2 p = uv - 0.5;
    float r2 = dot(p, p);

    // Subtle 3D plane tilt from mouse (reduces when fully expanded for stability)
    float tiltFactor = 1.0 - uExpansion * 0.4;
    pos.x += uMouse.x * 0.05 * tiltFactor;
    pos.y += uMouse.y * 0.05 * tiltFactor;

    // Barrel bulge along Z towards viewer
    float effectiveBulge = mix(uLensBulge, uLensBulge * 0.35, uExpansion);
    pos.z += (1.0 - r2 * 2.0) * effectiveBulge * 0.25;

    vWorldPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uMediaAspect;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uSliceCount;
  uniform float uSlashAngle;
  uniform float uChromaticAberration;
  uniform float uLensBulge;
  uniform float uGapThickness;
  uniform float uWaveAmp;
  uniform float uWaveSpeed;
  uniform float uExpansion; // 0.0 = Stadium Pill, 1.0 = Full Screen
  uniform int uShapeMode; // 0 = Capsule Pill, 1 = Full Screen, 2 = Cinema Wide
  uniform int uBorderColorMode; // 0 = White, 1 = Red, 2 = Lime, 3 = Cyan
  varying vec2 vUv;

  // Signed distance field for rounded box / capsule
  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  // Cover UV helper so video preserves aspect ratio without stretching
  vec2 getCoverUv(vec2 uv, float screenAspect, float mediaAspect) {
    if (screenAspect > mediaAspect) {
      float scale = screenAspect / mediaAspect;
      return vec2(uv.x, (uv.y - 0.5) * scale + 0.5);
    } else {
      float scale = mediaAspect / screenAspect;
      return vec2((uv.x - 0.5) * scale + 0.5, uv.y);
    }
  }

  void main() {
    vec2 uv = vUv;
    float screenAspect = uResolution.x / max(1.0, uResolution.y);

    // 1. Lens barrel distortion
    vec2 centered = uv - 0.5;
    float r2 = dot(centered, centered);
    float effectiveBulge = mix(uLensBulge, uLensBulge * 0.35, uExpansion);
    vec2 lensUv = uv + centered * (r2 * effectiveBulge * 0.45);

    // 2. Diagonal slice coordinates
    // Skew coordinate by slash angle
    float m = tan(uSlashAngle) / screenAspect;
    float u = lensUv.x + (lensUv.y - 0.5) * m;

    // Slice calculation
    float count = max(2.0, uSliceCount);
    float sliceCoord = u * count;
    float sliceIdx = floor(sliceCoord);
    float sliceFrac = fract(sliceCoord);

    // Hash per slice for pseudo-random variation
    float hash = fract(sin(sliceIdx * 127.1 + 31.7) * 43758.5453);

    // Cursor proximity & interactive wave
    vec2 mouseNorm = uMouse * 0.5 + 0.5;
    float mouseDist = length(lensUv - mouseNorm);
    float mouseInfluence = 1.0 - smoothstep(0.0, 0.55, mouseDist);

    // Staggered sine oscillation
    float wave = sin(uTime * uWaveSpeed + sliceIdx * 0.42 + hash * 2.0) * uWaveAmp * 0.022;
    float mouseDisp = (hash - 0.5) * mouseInfluence * 0.045 * (1.0 + uHover * 1.5);
    float totalSliceShift = wave + mouseDisp;

    // Displace UV along diagonal slice orientation
    vec2 dir = normalize(vec2(cos(uSlashAngle), sin(uSlashAngle)));
    vec2 displacedUv = lensUv + dir * totalSliceShift;

    // 3. Chromatic Aberration & Prismatic Dispersion
    vec2 caDir = vec2(-sin(uSlashAngle), cos(uSlashAngle));
    float caStrength = uChromaticAberration * (0.016 + abs(totalSliceShift) * 1.8 + mouseInfluence * 0.024);
    vec2 caOffset = caDir * caStrength;

    vec2 uvR = getCoverUv(displacedUv + caOffset, screenAspect, uMediaAspect);
    vec2 uvG = getCoverUv(displacedUv, screenAspect, uMediaAspect);
    vec2 uvB = getCoverUv(displacedUv - caOffset, screenAspect, uMediaAspect);

    // Clamp UVs to avoid edge bleed artifacts
    uvR = clamp(uvR, vec2(0.001), vec2(0.999));
    uvG = clamp(uvG, vec2(0.001), vec2(0.999));
    uvB = clamp(uvB, vec2(0.001), vec2(0.999));

    vec4 colR = texture2D(uTexture, uvR);
    vec4 colG = texture2D(uTexture, uvG);
    vec4 colB = texture2D(uTexture, uvB);

    vec3 col = vec3(colR.r, colG.g, colB.b);

    // 4. Spectral Iridescent Rainbow Prism Highlight along slice boundaries
    float edgeDist = abs(sliceFrac - 0.5) * 2.0;
    float edgeGlaze = pow(edgeDist, 4.5);

    vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (sliceIdx / count + vec3(0.0, 0.33, 0.67)) + uTime * 0.6);
    col += rainbow * edgeGlaze * 0.32 * clamp(uChromaticAberration * 22.0, 0.0, 1.2);

    // 5. Slice Gap / Slit
    float gap = clamp(uGapThickness, 0.0001, 0.45);
    float slit = smoothstep(0.0, gap, sliceFrac) * (1.0 - smoothstep(1.0 - gap, 1.0, sliceFrac));
    col *= (0.35 + 0.65 * slit);

    // Subtle hairline edge sheen
    float slitLine = (1.0 - smoothstep(0.0, 0.012, abs(sliceFrac - 0.5 * gap))) +
                     (1.0 - smoothstep(0.0, 0.012, abs(sliceFrac - (1.0 - 0.5 * gap))));
    col += vec3(0.25, 0.30, 0.38) * slitLine;

    // 6. Morphing Lens Contour: Capsule Pill -> Smoothly Opens to Full Screen
    float alpha = 1.0;
    float borderLine = 0.0;
    vec2 p = (uv - 0.5) * vec2(screenAspect, 1.0);

    if (uShapeMode != 1) {
      // Natural non-linear easing for expansion
      float ease = smoothstep(0.0, 1.0, uExpansion);

      // Base dimensions for the compact shape
      float baseHalfW = (uShapeMode == 2 ? 0.46 : 0.44) * screenAspect;
      float baseHalfH = (uShapeMode == 2 ? 0.28 : 0.36);
      float baseRad = baseHalfH; // In capsule, radius equals half-height

      // Expanded dimensions to overshoot viewport bounds cleanly
      float fullHalfW = screenAspect * 0.56;
      float fullHalfH = 0.56;
      float fullRad = 0.0;

      // Morphing dimensions
      float curHalfW = mix(baseHalfW, fullHalfW, ease);
      float curHalfH = mix(baseHalfH, fullHalfH, ease);
      float curRad = mix(baseRad, fullRad, pow(ease, 1.6));

      float d = sdRoundedBox(p, vec2(curHalfW, curHalfH), curRad);

      alpha = 1.0 - smoothstep(-0.002, 0.003, d);

      // Border glow traces contour and dissolves as it expands past screen edges
      float borderDissolve = 1.0 - smoothstep(0.85, 1.0, ease);
      borderLine = (1.0 - smoothstep(0.001, 0.008, abs(d))) * borderDissolve;
    }

    // Outer vignette (relaxes when full screen)
    float vig = 1.0 - r2 * mix(0.35, 0.15, uExpansion);
    col *= vig;

    // Border line color choice
    vec3 borderColor = vec3(1.0, 1.0, 1.0); // White
    if (uBorderColorMode == 1) {
      borderColor = vec3(1.0, 0.15, 0.15); // Vivid Crimson Red (user screenshot circle)
    } else if (uBorderColorMode == 2) {
      borderColor = vec3(0.92, 1.0, 0.0); // Lime Yellow (TBWA brand)
    } else if (uBorderColorMode == 3) {
      borderColor = vec3(0.2, 0.85, 1.0); // Neon Cyan
    }

    // Vector line accent with slight glow
    col += borderColor * borderLine * 1.5;

    gl_FragColor = vec4(col, alpha);
  }
`;

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function TbwaVideoLensClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // State
  const [params, setParams] = useState<EffectParams>(DEFAULT_PARAMS);
  const [selectedVideo, setSelectedVideo] = useState<VideoOption>(VIDEO_OPTIONS[0]);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isHudOpen, setIsHudOpen] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Smooth expansion interpolation refs
  const currentExpansionRef = useRef<number>(DEFAULT_PARAMS.expansion);
  const targetExpansionRef = useRef<number>(DEFAULT_PARAMS.expansion);

  // IDs for accessibility
  const expansionId = useId();
  const sliceCountId = useId();
  const slashAngleId = useId();
  const chromaId = useId();
  const bulgeId = useId();
  const gapId = useId();
  const waveAmpId = useId();
  const waveSpeedId = useId();
  const videoSelectId = useId();

  // Mouse interpolation references
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Uniforms reference
  const uniformsRef = useRef<{ [uniform: string]: THREE.IUniform }>({
    uTexture: { value: null },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uMediaAspect: { value: 16 / 9 },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uHover: { value: 0 },
    uExpansion: { value: DEFAULT_PARAMS.expansion },
    uSliceCount: { value: DEFAULT_PARAMS.sliceCount },
    uSlashAngle: { value: (DEFAULT_PARAMS.slashAngleDeg * Math.PI) / 180 },
    uChromaticAberration: { value: DEFAULT_PARAMS.chromaticAberration },
    uLensBulge: { value: DEFAULT_PARAMS.lensBulge },
    uGapThickness: { value: DEFAULT_PARAMS.gapThickness },
    uWaveAmp: { value: DEFAULT_PARAMS.waveAmp },
    uWaveSpeed: { value: DEFAULT_PARAMS.waveSpeed },
    uShapeMode: { value: DEFAULT_PARAMS.shapeMode },
    uBorderColorMode: { value: DEFAULT_PARAMS.borderColorMode },
  });

  // Keep uniforms and target expansion updated when params change
  useEffect(() => {
    targetExpansionRef.current = params.expansion;
    const u = uniformsRef.current;
    u.uSliceCount.value = params.sliceCount;
    u.uSlashAngle.value = (params.slashAngleDeg * Math.PI) / 180;
    u.uChromaticAberration.value = params.chromaticAberration;
    u.uLensBulge.value = params.lensBulge;
    u.uGapThickness.value = params.gapThickness;
    u.uWaveAmp.value = params.waveAmp;
    u.uWaveSpeed.value = params.waveSpeed;
    u.uShapeMode.value = params.shapeMode;
    u.uBorderColorMode.value = params.borderColorMode;
  }, [params]);

  // Three.js Lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const video = videoRef.current;
    if (!canvas || !container || !video) return;

    // Ensure video is muted and plays immediately
    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 2.0;

    // Video Texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    videoTexture.generateMipmaps = false;

    uniformsRef.current.uTexture.value = videoTexture;

    // Calculate plane dimensions to perfectly fill the camera view
    const vFov = (camera.fov * Math.PI) / 180;
    let planeH = 2 * Math.tan(vFov / 2) * camera.position.z;
    let planeW = planeH * camera.aspect;

    let geometry = new THREE.PlaneGeometry(planeW, planeH, 64, 48);

    // Material
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: uniformsRef.current,
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Handle aspect ratio on video load
    const onLoadedMetadata = () => {
      if (video.videoWidth && video.videoHeight) {
        uniformsRef.current.uMediaAspect.value = video.videoWidth / video.videoHeight;
      }
    };
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Rebuild geometry to match exact frustum size
      planeH = 2 * Math.tan(vFov / 2) * camera.position.z;
      planeW = planeH * camera.aspect;
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(planeW, planeH, 64, 48);

      uniformsRef.current.uResolution.value.set(width, height);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // Initial resize call
    onResize();

    // Render Loop
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const render = (time: number) => {
      lastTime = time;

      // Force video texture update on every frame if playing
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        videoTexture.needsUpdate = true;
      }

      // Smooth expansion spring lerp
      currentExpansionRef.current +=
        (targetExpansionRef.current - currentExpansionRef.current) * 0.08;
      uniformsRef.current.uExpansion.value = currentExpansionRef.current;

      // FPS tracking
      frameCount++;
      if (time - fpsTimer >= 500) {
        setFps(Math.round((frameCount * 1000) / (time - fpsTimer)));
        frameCount = 0;
        fpsTimer = time;
      }

      // Smooth mouse lerp
      const target = mouseTargetRef.current;
      const current = mouseCurrentRef.current;
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;

      const u = uniformsRef.current;
      u.uTime.value = time * 0.001;
      u.uMouse.value.set(current.x, current.y);
      u.uHover.value = THREE.MathUtils.lerp(u.uHover.value, isHovered ? 1.0 : 0.0, 0.1);

      // Subtle mesh rotation
      mesh.rotation.y = current.x * 0.08 * (1.0 - currentExpansionRef.current * 0.5);
      mesh.rotation.x = -current.y * 0.08 * (1.0 - currentExpansionRef.current * 0.5);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      mesh.geometry.dispose();
      material.dispose();
      videoTexture.dispose();
      renderer.dispose();
    };
  }, [isHovered]);

  // Pointer Movement Handlers
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseTargetRef.current = { x, y };
  }, []);

  const handlePointerLeave = useCallback(() => {
    mouseTargetRef.current = { x: 0, y: 0 };
    setIsHovered(false);
  }, []);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const scrollTrackRef = useRef<HTMLDivElement>(null);

  // Native Scroll-Driven Expansion: as user scrolls down the hero track, pill opens up to 100% full bleed
  useEffect(() => {
    const handleScroll = () => {
      const el = scrollTrackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollDistance = el.offsetHeight - window.innerHeight;
      if (scrollDistance <= 0) return;
      // Progress from 0 (top of hero) to 1 (when scrolled through hero)
      const progress = Math.max(0, Math.min(1, -rect.top / scrollDistance));
      targetExpansionRef.current = progress;
      setParams((prev) => ({ ...prev, expansion: progress }));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Video Controls
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Expansion Morph Toggle: Pill <-> Full Screen
  const toggleExpansion = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      expansion: prev.expansion > 0.5 ? 0.0 : 1.0,
      activePresetId: prev.expansion > 0.5 ? "tbwa-default" : "tbwa-fullscreen",
    }));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setParams((prev) => ({
      ...prev,
      ...preset.params,
      activePresetId: preset.id,
    }));
  }, []);

  const handleVideoSelect = useCallback((video: VideoOption) => {
    setSelectedVideo(video);
    const v = videoRef.current;
    if (!v) return;
    v.src = video.src;
    v.load();
    v.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);

  const handleCustomUrlSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!customVideoUrl.trim()) return;
      const customOpt: VideoOption = {
        id: "custom",
        name: "Custom URL Stream",
        category: "User Video",
        src: customVideoUrl.trim(),
      };
      setSelectedVideo(customOpt);
      const v = videoRef.current;
      if (!v) return;
      v.src = customOpt.src;
      v.load();
      v.play().then(() => setIsPlaying(true)).catch(() => {});
    },
    [customVideoUrl]
  );

  const isExpanded = params.expansion > 0.5;

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-black text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Hidden Video Feed for WebGL Texture */}
      <video
        ref={videoRef}
        src={selectedVideo.src}
        autoPlay
        playsInline
        muted={isMuted}
        loop
        crossOrigin="anonymous"
        className="fixed -top-full -left-full pointer-events-none opacity-0 size-2 -z-50"
      />

      {/* Top Technical Header */}
      <header className="pointer-events-auto fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">TBWA \ HAKUHODO</span>
            <span className="text-white/40">/</span>
            <span className="text-purple-300">SCROLL APERTURE LENS</span>
          </div>
          <span className="hidden sm:inline-block rounded-full border border-white/15 px-2.5 py-0.5 font-mono text-[10px] text-white/60">
            SCROLL TO EXPAND
          </span>
        </div>

        {/* Global Live Readout */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono text-[11px] text-white/60">
          {/* Scroll progress readout badge */}
          <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 font-mono text-xs text-purple-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
            <span>EXPANSION: {(params.expansion * 100).toFixed(0)}%</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <span>TOKYO 23:45</span>
            <span className="text-emerald-400 font-bold">{fps} FPS</span>
          </div>

          {/* Quick HUD Toggle */}
          <button
            type="button"
            onClick={() => setIsHudOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs text-white transition-colors hover:border-purple-400 hover:bg-purple-500/20"
          >
            <span>{isHudOpen ? "HIDE TUNER" : "OPEN TUNER"}</span>
            <span className="text-purple-400">{isHudOpen ? "✕" : "⚙"}</span>
          </button>
        </div>
      </header>

      {/* ── 250vh SCROLL RUNWAY (Hero Aperture opens as user scrolls down) ── */}
      <div ref={scrollTrackRef} className="relative w-full h-[250vh]">
        {/* Sticky Fullscreen WebGL Viewport */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center cursor-crosshair bg-black"
        >
          <canvas ref={canvasRef} className="block size-full" />

        {/* Floating Architectural Typography Over Lens (TBWA Disruption Style) */}
        {params.showOverlayText && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-8 sm:p-14">
            {/* Top Row Technical Markers */}
            <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-white/50 uppercase">
              <div className="flex items-center gap-3">
                <span className="text-white">PROJECT // 07</span>
                <span>SPECTRAL DISPERSION</span>
                <span>STATE: {isExpanded ? "FULL SCREEN" : "STADIUM PILL"}</span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <span>EXPANSION: {(params.expansion * 100).toFixed(0)}%</span>
                <span>SLICES: {params.sliceCount}</span>
                <span>ANGLE: {params.slashAngleDeg}°</span>
              </div>
            </div>

            {/* Giant Center Hero Watermark */}
            <div className="my-auto text-center">
              <div className="font-mono text-xs tracking-[0.4em] text-white/60 uppercase mb-2 drop-shadow">
                A SELECTION OF OUR WORKS WITH
              </div>
              <h1 className="font-black tracking-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] text-4xl sm:text-7xl lg:text-8xl xl:text-9xl uppercase leading-none">
                DISRUPTION<span className="text-purple-400">®</span>
              </h1>
              <div className="mt-3 flex items-center justify-center gap-3 font-mono text-xs tracking-widest text-white/80 uppercase drop-shadow">
                <span>7TH HEAVEN ARCHIVE</span>
                <span className="text-white/30">•</span>
                <span>40 YEARS LIVE MEDIA</span>
                <span className="text-white/30">•</span>
                <span className="text-purple-300">{selectedVideo.name}</span>
              </div>
            </div>

            {/* Bottom Quick Bar */}
            <div className="flex items-center justify-between font-mono text-[10px] tracking-wider text-white/50 uppercase">
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>SCROLL OR CLICK TO EXPAND FULL SCREEN</span>
                <span className="text-white/30">|</span>
                <span>HOVER TO DISTORT</span>
              </div>
              <div className="flex items-center gap-2">
                <span>TBWA\HAKUHODO SYSTEM</span>
                <span className="text-white/30">/</span>
                <span>TOKYO CREATIVE LAB</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Quick Play/Pause, Sound Bar & Expand Action */}
        <div className="pointer-events-auto absolute bottom-6 left-6 z-30 flex items-center gap-2 rounded-full border border-white/15 bg-black/80 p-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause Video" : "Play Video"}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-purple-600"
          >
            {isPlaying ? (
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="size-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-purple-600"
          >
            {isMuted ? (
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>

          {/* Expand to Full Screen Pill Button */}
          <button
            type="button"
            onClick={toggleExpansion}
            className="flex items-center gap-1.5 rounded-full bg-purple-600/30 hover:bg-purple-600 px-3 py-1.5 font-mono text-xs text-purple-200 hover:text-white transition-colors border border-purple-500/40"
          >
            <span>{isExpanded ? "COLLAPSE" : "EXPAND"}</span>
            <span>{isExpanded ? "↙" : "↗"}</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-purple-600"
          >
            {isFullscreen ? (
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5h2z" />
              </svg>
            ) : (
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            )}
          </button>

        </div>
      </div>
    </div>

      {/* ── EDITORIAL PAGE CONTENT (Revealed as user scrolls past the full-bleed video) ── */}
      <section className="relative z-20 bg-neutral-950 px-6 sm:px-12 py-24 border-t border-white/10">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 font-mono text-xs text-purple-400 tracking-widest uppercase mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>STAGE 02 // FULL BLEED TRANSITION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-6">
            THE APERTURE HAS EXPANDED TO FULL BLEED
          </h2>
          <p className="max-w-3xl text-base sm:text-lg text-white/70 leading-relaxed font-sans mb-12">
            As you scrolled down, the WebGL shader morphed the geometry from the compact stadium capsule pill, flattening its rounded ends and dissolving the red laser boundary trace until it engulfed 100% of the viewport. Scrolling back up contracts the shape back into the pill.
          </p>

          {/* Feature showcase cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <span className="text-purple-400 font-bold block mb-2">01 / STADIUM CAPSULE</span>
              <p className="text-white/60 leading-relaxed font-sans text-sm">
                SDF rounded box matching TBWA\HAKUHODO’s canonical capsule contour with vivid red vector highlight.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <span className="text-purple-400 font-bold block mb-2">02 / CONTINUOUS SCROLL MORPH</span>
              <p className="text-white/60 leading-relaxed font-sans text-sm">
                Tied to native page scroll position with high-inertia lerping and zero layout thrashing.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <span className="text-purple-400 font-bold block mb-2">03 / FULL BLEED CINEMA</span>
              <p className="text-white/60 leading-relaxed font-sans text-sm">
                Past 100% expansion, boundaries smoothly dissolve for an uncompromised full-bleed cinematic stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tuner HUD / Drawer (Right Side) */}
      <aside
        className={`pointer-events-auto fixed top-16 right-0 bottom-0 z-40 w-full sm:w-[380px] border-l border-white/10 bg-black/85 backdrop-blur-2xl p-6 overflow-y-auto transition-transform duration-300 ${
          isHudOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <h2 className="font-mono text-sm font-bold tracking-widest text-white uppercase">
              SHADER TUNER
            </h2>
            <p className="font-mono text-[11px] text-white/50">
              Interactive WebGL Parameters
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsHudOpen(false)}
            aria-label="Close Tuner Panel"
            className="size-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Primary Morph Control: Pill -> Full Screen */}
        <div className="mb-6 rounded-xl border border-purple-500/40 bg-purple-950/20 p-3.5">
          <div className="flex items-center justify-between font-mono text-xs mb-2">
            <label htmlFor={expansionId} className="font-bold text-purple-200 uppercase">
              MORPH: PILL → FULL SCREEN
            </label>
            <span className="text-purple-400 font-bold">
              {(params.expansion * 100).toFixed(0)}%
            </span>
          </div>
          <input
            id={expansionId}
            type="range"
            min={0.0}
            max={1.0}
            step={0.01}
            value={params.expansion}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                expansion: Number(e.target.value),
                activePresetId: "",
              }))
            }
            className="w-full accent-purple-500"
          />
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, expansion: 0.0 }))}
              className={`flex-1 rounded-lg border py-1 font-mono text-[11px] font-semibold transition-colors ${
                params.expansion === 0
                  ? "border-purple-400 bg-purple-500/30 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              PILL (0%)
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, expansion: 0.5 }))}
              className={`flex-1 rounded-lg border py-1 font-mono text-[11px] font-semibold transition-colors ${
                params.expansion === 0.5
                  ? "border-purple-400 bg-purple-500/30 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              MID (50%)
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, expansion: 1.0 }))}
              className={`flex-1 rounded-lg border py-1 font-mono text-[11px] font-semibold transition-colors ${
                params.expansion === 1.0
                  ? "border-purple-400 bg-purple-500/30 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              FULL (100%)
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="mb-6">
          <label className="block font-mono text-xs font-semibold text-purple-300 uppercase mb-2">
            Shader Presets
          </label>
          <div className="grid grid-cols-1 gap-2">
            {PRESETS.map((p) => {
              const active = params.activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                    active
                      ? "border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-500/10"
                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span className="font-medium text-xs">{p.label}</span>
                  <span className="font-mono text-[10px] uppercase text-purple-400">
                    {p.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Source Switcher */}
        <div className="mb-6 border-t border-white/10 pt-4">
          <label
            htmlFor={videoSelectId}
            className="block font-mono text-xs font-semibold text-purple-300 uppercase mb-2"
          >
            Video Stream
          </label>
          <select
            id={videoSelectId}
            value={selectedVideo.id}
            onChange={(e) => {
              const found = VIDEO_OPTIONS.find((v) => v.id === e.target.value);
              if (found) handleVideoSelect(found);
            }}
            className="w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs font-mono text-white outline-none focus:border-purple-400"
          >
            {VIDEO_OPTIONS.map((v) => (
              <option key={v.id} value={v.id} className="bg-neutral-900 text-white">
                {v.category}: {v.name}
              </option>
            ))}
          </select>

          {/* Custom Video URL Form */}
          <form onSubmit={handleCustomUrlSubmit} className="mt-2 flex gap-1.5">
            <input
              type="url"
              placeholder="Paste custom MP4 stream URL..."
              value={customVideoUrl}
              onChange={(e) => setCustomVideoUrl(e.target.value)}
              className="flex-1 rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 font-mono text-[11px] text-white placeholder:text-white/30 outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="rounded-lg border border-purple-500/50 bg-purple-600/30 px-3 py-1.5 font-mono text-[11px] text-purple-200 hover:bg-purple-600 hover:text-white"
            >
              LOAD
            </button>
          </form>
        </div>

        {/* Lens Contour Shape Mode */}
        <div className="mb-6 border-t border-white/10 pt-4">
          <label className="block font-mono text-xs font-semibold text-purple-300 uppercase mb-2">
            Lens Contour Geometry
          </label>
          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, shapeMode: 0, activePresetId: "" }))}
              className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                params.shapeMode === 0
                  ? "border-purple-400 bg-purple-500/20 text-white font-bold"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              STADIUM PILL
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, shapeMode: 2, activePresetId: "" }))}
              className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                params.shapeMode === 2
                  ? "border-purple-400 bg-purple-500/20 text-white font-bold"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              CINEMA LENS
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, shapeMode: 1, activePresetId: "" }))}
              className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                params.shapeMode === 1
                  ? "border-purple-400 bg-purple-500/20 text-white font-bold"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              FULL BLEED
            </button>
          </div>
        </div>

        {/* Border Contour Color Mode */}
        <div className="mb-6 border-t border-white/10 pt-4">
          <label className="block font-mono text-xs font-semibold text-purple-300 uppercase mb-2">
            Contour Border Tracing
          </label>
          <div className="grid grid-cols-4 gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, borderColorMode: 1 }))}
              className={`rounded-lg border px-2 py-1.5 text-center transition-colors ${
                params.borderColorMode === 1
                  ? "border-red-500 bg-red-500/20 text-white font-bold"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              RED (REF)
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, borderColorMode: 2 }))}
              className={`rounded-lg border px-2 py-1.5 text-center transition-colors ${
                params.borderColorMode === 2
                  ? "border-yellow-400 bg-yellow-400/20 text-white font-bold"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              TBWA LIME
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, borderColorMode: 0 }))}
              className={`rounded-lg border px-2 py-1.5 text-center transition-colors ${
                params.borderColorMode === 0
                  ? "border-white bg-white/20 text-white font-bold"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              WHITE
            </button>
            <button
              type="button"
              onClick={() => setParams((p) => ({ ...p, borderColorMode: 3 }))}
              className={`rounded-lg border px-2 py-1.5 text-center transition-colors ${
                params.borderColorMode === 3
                  ? "border-cyan-400 bg-cyan-400/20 text-white font-bold"
                  : "border-white/10 bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              CYAN
            </button>
          </div>
        </div>

        {/* Sliders Section */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          {/* Slice Count */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs mb-1">
              <label htmlFor={sliceCountId} className="text-white/80">
                SLICES COUNT
              </label>
              <span className="text-purple-400 font-bold">{params.sliceCount}</span>
            </div>
            <input
              id={sliceCountId}
              type="range"
              min={4}
              max={44}
              step={1}
              value={params.sliceCount}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  sliceCount: Number(e.target.value),
                  activePresetId: "",
                }))
              }
              className="w-full accent-purple-500"
            />
          </div>

          {/* Slash Angle */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs mb-1">
              <label htmlFor={slashAngleId} className="text-white/80">
                SLASH ANGLE
              </label>
              <span className="text-purple-400 font-bold">{params.slashAngleDeg}°</span>
            </div>
            <input
              id={slashAngleId}
              type="range"
              min={-55}
              max={55}
              step={1}
              value={params.slashAngleDeg}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  slashAngleDeg: Number(e.target.value),
                  activePresetId: "",
                }))
              }
              className="w-full accent-purple-500"
            />
          </div>

          {/* Chromatic Aberration */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs mb-1">
              <label htmlFor={chromaId} className="text-white/80">
                CHROMATIC ABERRATION
              </label>
              <span className="text-purple-400 font-bold">
                {(params.chromaticAberration * 100).toFixed(1)}%
              </span>
            </div>
            <input
              id={chromaId}
              type="range"
              min={0.0}
              max={0.14}
              step={0.002}
              value={params.chromaticAberration}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  chromaticAberration: Number(e.target.value),
                  activePresetId: "",
                }))
              }
              className="w-full accent-purple-500"
            />
          </div>

          {/* Lens Barrel Bulge */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs mb-1">
              <label htmlFor={bulgeId} className="text-white/80">
                LENS BARREL BULGE
              </label>
              <span className="text-purple-400 font-bold">
                {(params.lensBulge * 100).toFixed(0)}%
              </span>
            </div>
            <input
              id={bulgeId}
              type="range"
              min={0.0}
              max={1.0}
              step={0.02}
              value={params.lensBulge}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  lensBulge: Number(e.target.value),
                  activePresetId: "",
                }))
              }
              className="w-full accent-purple-500"
            />
          </div>

          {/* Gap / Slit Thickness */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs mb-1">
              <label htmlFor={gapId} className="text-white/80">
                SLIT GAP WIDTH
              </label>
              <span className="text-purple-400 font-bold">
                {(params.gapThickness * 100).toFixed(1)}%
              </span>
            </div>
            <input
              id={gapId}
              type="range"
              min={0.0}
              max={0.08}
              step={0.002}
              value={params.gapThickness}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  gapThickness: Number(e.target.value),
                  activePresetId: "",
                }))
              }
              className="w-full accent-purple-500"
            />
          </div>

          {/* Wave Ripple Amplitude */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs mb-1">
              <label htmlFor={waveAmpId} className="text-white/80">
                WAVE AMPLITUDE
              </label>
              <span className="text-purple-400 font-bold">{params.waveAmp.toFixed(2)}x</span>
            </div>
            <input
              id={waveAmpId}
              type="range"
              min={0.0}
              max={2.0}
              step={0.05}
              value={params.waveAmp}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  waveAmp: Number(e.target.value),
                  activePresetId: "",
                }))
              }
              className="w-full accent-purple-500"
            />
          </div>

          {/* Wave Ripple Speed */}
          <div>
            <div className="flex items-center justify-between font-mono text-xs mb-1">
              <label htmlFor={waveSpeedId} className="text-white/80">
                WAVE SPEED
              </label>
              <span className="text-purple-400 font-bold">{params.waveSpeed.toFixed(1)}x</span>
            </div>
            <input
              id={waveSpeedId}
              type="range"
              min={0.2}
              max={4.0}
              step={0.1}
              value={params.waveSpeed}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  waveSpeed: Number(e.target.value),
                  activePresetId: "",
                }))
              }
              className="w-full accent-purple-500"
            />
          </div>
        </div>

        {/* Overlay Toggle & Reset */}
        <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 font-mono text-xs text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={params.showOverlayText}
              onChange={(e) =>
                setParams((p) => ({ ...p, showOverlayText: e.target.checked }))
              }
              className="accent-purple-500 size-4"
            />
            <span>SHOW TYPOGRAPHY</span>
          </label>

          <button
            type="button"
            onClick={() => setParams(DEFAULT_PARAMS)}
            className="font-mono text-xs text-purple-400 hover:text-purple-300 underline"
          >
            RESET DEFAULTS
          </button>
        </div>
      </aside>
    </main>
  );
}
