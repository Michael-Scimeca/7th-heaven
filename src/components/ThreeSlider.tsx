"use client";

/**
 * ThreeSlider — WebGL "magazine" page slider (recreation of the huyml.co home effect).
 *
 * How it works:
 * - One InstancedMesh of thin BoxGeometry "pages" (≥30 instances, projects repeat to fill),
 *   all sampling a single texture atlas.
 * - The vertex shader lays every page out along the mesh's local Z axis, wraps that axis
 *   into an infinite loop around `uScrollY`, pushes neighbours away from the focused page
 *   (`uCenterSpacing`), tilts the focused page toward the camera (`uFocusRotation*`) and
 *   bends pages with a sine wave proportional to scroll velocity (`uSpeedY * uScrollCurve`).
 * - JS only owns a smoothed scroll value (target → current lerp), a decaying velocity,
 *   snapping to the nearest page, GPU picking for hover/click, and the intro spin.
 */

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as THREE from "three";
import gsap from "gsap";
import { X, Maximize2 } from "lucide-react";
import { DotChevronLeft, DotChevronRight } from "@/components/ui/DotArrow";

export type ThreeSliderItem = {
  image: string;
  category: string;
  title: string;
  description: string;
  href?: string;
};

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

attribute float aIndex;
attribute vec4 aTextureCoords;
attribute float aImageAspect;

uniform float uPageThickness;
uniform float uPageWidth;
uniform float uPageHeight;
uniform float uMeshCount;
uniform float uProgress;
uniform float uSplitProgress;
uniform float uPageSpacing;
uniform float uCenterSpacing;
uniform float uFocusRotationX;
uniform float uFocusRotationY;
uniform float uFocusRotationZ;
uniform float uScrollY;
uniform float uSpeedY;
uniform float uScrollCurve;
uniform float uHoverIndex;
uniform float uHoverLift;
uniform float uHoverIndexOut;
uniform float uHoverLiftOut;

varying vec4 vTextureCoords;
varying float vIndex;
varying float vRotationProgress;
varying float vImageAspect;
varying float vFocusFactor;

mat3 getXrotationMatrix(float angle) {
  return mat3(1.0, 0.0, 0.0, 0.0, cos(angle), -sin(angle), 0.0, sin(angle), cos(angle));
}
mat3 getYrotationMatrix(float angle) {
  return mat3(cos(angle), 0.0, sin(angle), 0.0, 1.0, 0.0, -sin(angle), 0.0, cos(angle));
}
mat3 getZrotationMatrix(float angle) {
  return mat3(cos(angle), sin(angle), 0.0, -sin(angle), cos(angle), 0.0, 0.0, 0.0, 1.0);
}

void main() {
  float PI = 3.14159265359;
  vec3 pos = position;

  // Infinite vertical scroll: wrap each page's slot around the scroll position
  float boxCenter = uPageSpacing * (-(aIndex - (uMeshCount - 1.0) * 0.5));
  float maxZ = uMeshCount * (uPageSpacing + uPageThickness) * 0.5;
  float centerProgress = boxCenter - uScrollY;
  float flatWrapped = mod(centerProgress + maxZ, 2.0 * maxZ) - maxZ;

  // Push neighbours vertically away from the focused page
  float distanceToCenter = abs(flatWrapped);
  float pushAmount = uCenterSpacing * uPageSpacing;
  float shiftMagnitude = smoothstep(0.1, uPageSpacing * 0.95, distanceToCenter) * pushAmount;
  float direction = sign(flatWrapped);
  if (direction == 0.0) direction = 1.0;
  float shiftedProgress = flatWrapped + direction * shiftMagnitude;

  // Vertical placement along Y:
  // positive shiftedProgress is in the top stack, negative in the bottom stack
  pos.y += shiftedProgress * 0.95;

  // Depth placement along Z:
  // The focused card is in front; non-focused cards recede back into Z
  float depthOffset = -abs(shiftedProgress) * 0.35;
  
  // Velocity wave: bend along Y when scrolling
  float wave = sin((position.y + uPageHeight * 0.5) / uPageHeight * PI) * clamp(uSpeedY * 1.0, -1.0, 1.0) * uScrollCurve;
  pos.z += depthOffset + wave;

  // Focus factor: 1.0 when perfectly centered, 0.0 when 1+ slot away
  float focusFactor = 1.0 - smoothstep(0.0, uPageSpacing * 0.85, distanceToCenter);
  float smoothedFocusFactor = smoothstep(0.0, 1.0, focusFactor);

  // Tilt around X: cards above tilt back slightly, cards below tilt forward slightly
  float tiltX = clamp(shiftedProgress * 0.05, -0.22, 0.22);
  tiltX *= (1.0 - smoothedFocusFactor); // focused card is perfectly flat (0 tilt)
  pos = getXrotationMatrix(tiltX + uFocusRotationX * smoothedFocusFactor) * pos;
  pos = getYrotationMatrix(uFocusRotationY * smoothedFocusFactor) * pos;
  pos = getZrotationMatrix(uFocusRotationZ * smoothedFocusFactor) * pos;

  // Hover lift for non-focused pages
  float liftAmount = 0.0;
  if (abs(aIndex - uHoverIndex) < 0.5) liftAmount = uHoverLift;
  if (abs(aIndex - uHoverIndexOut) < 0.5) liftAmount = max(liftAmount, uHoverLiftOut);
  float nonFocusFactor = smoothstep(0.05, 0.4, 1.0 - smoothedFocusFactor);
  pos.z += liftAmount * nonFocusFactor * 0.4;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(pos, 1.0);

  vUv = uv;
  vTextureCoords = aTextureCoords;
  vIndex = aIndex;
  vRotationProgress = 1.0;
  vImageAspect = aImageAspect;
  vFocusFactor = smoothedFocusFactor;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
varying vec2 vUv;
varying vec4 vTextureCoords;
varying float vIndex;
varying float vRotationProgress;
varying float vImageAspect;
varying float vFocusFactor;

uniform sampler2D uAtlas;
uniform float uPageWidth;
uniform float uPageHeight;
uniform float uPicking;
uniform float uHoverIndex;
uniform float uHoverLift;
uniform float uHoverIndexOut;
uniform float uHoverLiftOut;

void main() {
  float planeAspect = uPageWidth / uPageHeight;
  vec2 coverUv = vUv;
  if (planeAspect < vImageAspect) {
    coverUv.x = (coverUv.x - 0.5) * (planeAspect / vImageAspect) + 0.5;
  } else {
    coverUv.y = (coverUv.y - 0.5) * (vImageAspect / planeAspect) + 0.5;
  }

  // Focused page zooms its image slightly on hover
  float textureHoverAmount = 0.0;
  if (abs(vIndex - uHoverIndex) < 0.5) textureHoverAmount = uHoverLift;
  if (abs(vIndex - uHoverIndexOut) < 0.5) textureHoverAmount = max(textureHoverAmount, uHoverLiftOut);
  textureHoverAmount *= smoothstep(0.65, 0.95, vFocusFactor);
  coverUv = (coverUv - 0.5) * (1.0 - textureHoverAmount * 0.156) + 0.5;

  vec2 atlasUV = vec2(
    mix(vTextureCoords.x, vTextureCoords.y, coverUv.x),
    mix(vTextureCoords.z, vTextureCoords.w, 1.0 - coverUv.y)
  );

  if (vRotationProgress == 0. && vIndex != 0.) discard;

  // GPU picking pass: encode instance index in the red channel
  if (uPicking > 0.5) {
    gl_FragColor = vec4((vIndex + 1.0) / 255.0, 0.0, 0.0, 1.0);
    return;
  }

  vec4 texColor = texture2D(uAtlas, atlasUV);
  float dim = mix(0.42, 1.0, vFocusFactor);
  gl_FragColor = vec4(texColor.rgb * dim, texColor.a);
}
`;

// Layout and motion constants for vertical magazine slider
const PAGE_WIDTH = 3.744;
const PAGE_HEIGHT = 2.808;
const PAGE_THICKNESS = 0.01;
const FRUSTUM_HEIGHT = 10.4;
const CENTER_SPACING = 4.2;
const FOCUS_ROTATION = { x: 0, y: 0, z: 0 };
const MIN_PAGES = 30;
const SCROLL_LERP = 0.047;
const SPEED_DECAY = 0.829;
const WHEEL_EASE = 0.075;
const TRACKPAD_SENSITIVITY = 0.42;
const SNAP_EPSILON = 0.01;
// Input → scroll direction: wheel/drag down advances to the next project
const INPUT_DIRECTION = -1;
const INTRO_SECONDS = 1.8;
const CELL_WIDTH = 1024;
// Inset (px) sampled away from each cell edge so mipmaps don't bleed neighbouring images in
const CELL_INSET = 6;
const CELL_HEIGHT = Math.round((CELL_WIDTH * PAGE_HEIGHT) / PAGE_WIDTH);

type AtlasCell = { xStart: number; xEnd: number; yStart: number; yEnd: number };

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Cover-crops every image into a fixed-size cell of a grid atlas (keeps the texture ≤ ~4k). */
async function buildAtlas(sources: string[]) {
  const images = await Promise.all(sources.map(loadImage));
  const columns = Math.ceil(Math.sqrt(sources.length));
  const rows = Math.ceil(sources.length / columns);
  const canvas = document.createElement("canvas");
  canvas.width = columns * CELL_WIDTH;
  canvas.height = rows * CELL_HEIGHT;
  const ctx = canvas.getContext("2d");
  const cells: AtlasCell[] = [];

  images.forEach((img, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = col * CELL_WIDTH;
    const y = row * CELL_HEIGHT;
    if (ctx) {
      ctx.fillStyle = "#0f0f13";
      ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
      if (img) {
        const scale = Math.max(CELL_WIDTH / img.naturalWidth, CELL_HEIGHT / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        // Clip to the cell so cover-cropped overflow can't bleed into neighbouring cells
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, CELL_WIDTH, CELL_HEIGHT);
        ctx.clip();
        ctx.drawImage(img, x + (CELL_WIDTH - w) / 2, y + (CELL_HEIGHT - h) / 2, w, h);
        ctx.restore();
      }
    }
    cells.push({
      xStart: (x + CELL_INSET) / canvas.width,
      xEnd: (x + CELL_WIDTH - CELL_INSET) / canvas.width,
      yStart: 1 - (y + CELL_INSET) / canvas.height,
      yEnd: 1 - (y + CELL_HEIGHT - CELL_INSET) / canvas.height,
    });
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  // Mipmaps stop the shimmer/static when pages are drawn smaller than their source pixels
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  return { texture, cells };
}

export default function ThreeSlider({ items }: { items: ThreeSliderItem[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef(items);
  const router = useRouter();
  const routerRef = useRef(router);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const openEnlargedRef = useRef<(index: number) => void>(() => {});
  const navigateToRef = useRef<(index: number) => void>(() => {});

  const handleOpenEnlarged = useCallback((index: number) => {
    setIsZoomed(false);
    setEnlargedIndex(index);
  }, []);

  const handleCloseEnlarged = useCallback(() => {
    setEnlargedIndex(null);
    setIsZoomed(false);
  }, []);

  useEffect(() => {
    openEnlargedRef.current = handleOpenEnlarged;
  }, [handleOpenEnlarged]);

  useEffect(() => {
    itemsRef.current = items;
    routerRef.current = router;
  }, [items, router]);

  useEffect(() => {
    if (enlargedIndex === null) return;
    const itemCount = items.length;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseEnlarged();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const step = e.key === "ArrowLeft" ? -1 : 1;
        const nextIdx = (enlargedIndex + step + itemCount) % itemCount;
        navigateToRef.current(nextIdx);
        setIsZoomed(false);
        setEnlargedIndex(nextIdx);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enlargedIndex, items.length, handleCloseEnlarged]);

  useEffect(() => {
    if (enlargedIndex !== null) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [enlargedIndex]);

  useEffect(() => {
    const mount = mountRef.current;
    const count = items.length;
    if (!mount || count === 0) return () => {};

    let disposed = false;
    const clock = new THREE.Clock();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarse = () => window.innerWidth <= 767 || window.matchMedia("(pointer: coarse)").matches;

    // ---------- Instance / scroll math (Z slots wrap around an infinite loop) ----------
    const meshCount = count * Math.ceil(MIN_PAGES / count);
    const half = meshCount * (1 + PAGE_THICKNESS) * 0.5; // matches maxZ in the shader
    const wrap = (x: number) => ((((x + half) % (2 * half)) + 2 * half) % (2 * half)) - half;
    const slotOf = (i: number) => -(i - (meshCount - 1) * 0.5);
    const offsetOf = (i: number, scroll: number) => wrap(slotOf(i) - scroll);
    const nearestInstance = (scroll: number) => {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < meshCount; i++) {
        const d = Math.abs(offsetOf(i, scroll));
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return best;
    };
    const snap = (value: number) => value + offsetOf(nearestInstance(value), value);
    const projectPosition = (project: number, near: number) => {
      let best = near;
      let bestDist = Infinity;
      for (let i = project; i < meshCount; i += count) {
        const pos = near + offsetOf(i, near);
        const d = Math.abs(pos - near);
        if (d < bestDist) {
          bestDist = d;
          best = pos;
        }
      }
      return best;
    };
    // Scale input so the feel matches the 1512×982 reference viewport
    const viewportScale = () => Math.min(1, 1512 / Math.max(1, window.innerWidth), 982 / Math.max(1, window.innerHeight));

    // ---------- Three.js setup ----------
    const size = () => ({ width: Math.max(1, mount.clientWidth), height: Math.max(1, mount.clientHeight) });
    let { width, height } = size();
    const aspect = () => width / height;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      (-FRUSTUM_HEIGHT * aspect()) / 2,
      (FRUSTUM_HEIGHT * aspect()) / 2,
      FRUSTUM_HEIGHT / 2,
      -FRUSTUM_HEIGHT / 2,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 20);
    const lookTarget = new THREE.Vector3(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const pickTarget = new THREE.WebGLRenderTarget(1, 1);
    const pickPixel = new Uint8Array(4);

    const parallaxGroup = new THREE.Group();
    scene.add(parallaxGroup);

    const placeholder = new THREE.DataTexture(new Uint8Array([15, 15, 19, 255]), 1, 1);
    placeholder.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      uniforms: {
        uProgress: { value: 1 },
        uSplitProgress: { value: 1 },
        uPageThickness: { value: PAGE_THICKNESS },
        uPageWidth: { value: PAGE_WIDTH },
        uPageHeight: { value: PAGE_HEIGHT },
        uMeshCount: { value: meshCount },
        uAtlas: { value: placeholder as THREE.Texture },
        uScrollY: { value: 0 },
        uSpeedY: { value: 0 },
        uScrollCurve: { value: 1 },
        uPageSpacing: { value: 1 },
        uCenterSpacing: { value: 0 },
        uFocusRotationX: { value: 0 },
        uFocusRotationY: { value: 0 },
        uFocusRotationZ: { value: 0 },
        uPicking: { value: 0 },
        uHoverIndex: { value: -1 },
        uHoverLift: { value: 0 },
        uHoverIndexOut: { value: -1 },
        uHoverLiftOut: { value: 0 },
      },
    });
    const u = material.uniforms;

    const geometry = new THREE.BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_THICKNESS, 50, 50, 1);
    const indices = new Float32Array(meshCount);
    for (let i = 0; i < meshCount; i++) indices[i] = i;
    geometry.setAttribute("aIndex", new THREE.InstancedBufferAttribute(indices, 1));
    geometry.setAttribute("aTextureCoords", new THREE.InstancedBufferAttribute(new Float32Array(meshCount * 4).fill(0), 4));
    geometry.setAttribute("aImageAspect", new THREE.InstancedBufferAttribute(new Float32Array(meshCount).fill(PAGE_WIDTH / PAGE_HEIGHT), 1));

    const mesh = new THREE.InstancedMesh(geometry, material, meshCount);
    mesh.frustumCulled = false;
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
    mesh.position.set(isDesktop ? -1.4 : 0, isDesktop ? 0 : 0.75, 0);
    mesh.rotation.set(0, 0, 0);
    parallaxGroup.add(mesh);

    let atlasTexture: THREE.Texture | null = null;
    let introPending = false;

    // ---------- Scroll state ----------
    const startPosition = projectPosition(0, 0);
    const scroll = { target: startPosition, current: startPosition };
    let introPlaying = false;
    let introStart = 0;
    let introDistance = 0;
    let introEased = 0;
    let focused = false;
    let wheeling = false;
    let pendingWheel = 0;
    let smoothingWheel = false;
    let snapTimer = 0;
    let lastProject = -1;

    const focus = () => {
      if (focused) return;
      focused = true;
      gsap.to(u.uCenterSpacing, { value: CENTER_SPACING, duration: 1.5, ease: "power2.out" });
    };

    const endGesture = () => {
      wheeling = false;
      scroll.target = snap(scroll.target);
    };

    const scheduleSnap = (ms: number) => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(endGesture, ms);
    };

    const goToInstance = (i: number) => {
      focus();
      scroll.target += offsetOf(i, scroll.target);
    };

    navigateToRef.current = (projectIndex: number) => {
      focus();
      scroll.target = snap(projectPosition(projectIndex, scroll.target));
    };

    const startIntro = () => {
      if (reduceMotion) {
        focused = true;
        u.uCenterSpacing.value = CENTER_SPACING;
        return;
      }
      // Vertical rolling intro: spins into project 01, then center spacing opens
      introPlaying = true;
      introStart = performance.now();
      introEased = 0;
      introDistance = projectPosition(0, scroll.target + 16) - scroll.target;
      focused = true;
      const opts = { duration: 1.1, delay: 0.8, ease: "power2.out" };
      gsap.to(u.uCenterSpacing, { value: CENTER_SPACING, ...opts });
    };

    buildAtlas(items.map((item) => item.image)).then(({ texture, cells }) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      atlasTexture = texture;
      const coords = geometry.getAttribute("aTextureCoords") as THREE.InstancedBufferAttribute;
      for (let i = 0; i < meshCount; i++) {
        const cell = cells[i % count];
        coords.setXYZW(i, cell.xStart, cell.xEnd, cell.yStart, cell.yEnd);
      }
      coords.needsUpdate = true;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      u.uAtlas.value = texture;
      introPending = true;
    });

    // ---------- Hover + picking ----------
    const pointer = { x: 0, y: 0, inside: false, moved: false };
    const parallaxTarget = new THREE.Vector2();
    const parallaxCurrent = new THREE.Vector2();
    let hovered = -1;
    let hoveredOut = -1;

    let pickingBusy = false;
    const pickAt = async (clientX: number, clientY: number): Promise<number> => {
      if (pickingBusy) return -1;
      const rect = renderer.domElement.getBoundingClientRect();
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return -1;
      const buffer = renderer.getDrawingBufferSize(new THREE.Vector2());
      const px = Math.min(buffer.x - 1, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * buffer.x)));
      const py = Math.min(buffer.y - 1, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * buffer.y)));
      const clearColor = new THREE.Color();
      renderer.getClearColor(clearColor);
      const clearAlpha = renderer.getClearAlpha();
      pickingBusy = true;
      u.uPicking.value = 1;
      material.side = THREE.DoubleSide;
      camera.setViewOffset(buffer.x, buffer.y, px, py, 1, 1);
      renderer.setRenderTarget(pickTarget);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene, camera);
      camera.clearViewOffset();
      renderer.setRenderTarget(null);
      renderer.setClearColor(clearColor, clearAlpha);
      u.uPicking.value = 0;
      material.side = THREE.FrontSide;
      try {
        await renderer.readRenderTargetPixelsAsync(pickTarget, 0, 0, 1, 1, pickPixel);
        return pickPixel[3] > 0 ? pickPixel[0] - 1 : -1;
      } catch {
        return -1;
      } finally {
        pickingBusy = false;
      }
    };

    const setHover = (index: number) => {
      if (index === hovered) return;
      gsap.killTweensOf(u.uHoverLift);
      gsap.killTweensOf(u.uHoverLiftOut);
      if (hovered >= 0) {
        hoveredOut = hovered;
        const leaving = hovered;
        u.uHoverIndexOut.value = hovered;
        u.uHoverLiftOut.value = u.uHoverLift.value;
        gsap.to(u.uHoverLiftOut, {
          value: 0,
          duration: 1,
          ease: "power4.out",
          onComplete: () => {
            if (hoveredOut === leaving) {
              hoveredOut = -1;
              u.uHoverIndexOut.value = -1;
            }
          },
        });
      }
      hovered = index;
      u.uHoverIndex.value = index;
      u.uHoverLift.value = 0;
      if (index >= 0) gsap.to(u.uHoverLift, { value: 1, duration: 1, ease: "power4.out" });
      mount.style.cursor = index >= 0 ? "pointer" : "";
    };

    // ---------- Input ----------
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (introPlaying) return;
      let pixelY = e.deltaY;
      if (e.deltaMode === 1) pixelY *= 40;
      else if (e.deltaMode === 2) pixelY *= 800;
      const isTrackpad = e.deltaMode === 0 && (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) < 24);
      const delta = ((pixelY * FRUSTUM_HEIGHT) / Math.max(1, window.innerHeight)) * viewportScale() * INPUT_DIRECTION;
      focus();
      wheeling = true;
      window.clearTimeout(snapTimer);

      if (isTrackpad) {
        // Trackpad: continuous, clamped per event
        const step = gsap.utils.clamp(-0.14, 0.14, delta * TRACKPAD_SENSITIVITY);
        scroll.target += step;
        u.uSpeedY.value += step;
        scheduleSnap(240);
        return;
      }
      // Mouse wheel: whole pages per notch, eased in over the next frames
      const steps = gsap.utils.clamp(1, 4, Math.round(Math.abs(delta)));
      pendingWheel += Math.sign(delta) * steps;
      smoothingWheel = true;
    };

    const drag = { id: -1, startX: 0, startY: 0, lastX: 0, lastY: 0, locked: false, axis: "y" as "x" | "y", moved: false };

    const onPointerDown = (e: PointerEvent) => {
      if (introPlaying || e.button !== 0) return;
      drag.id = e.pointerId;
      drag.startX = drag.lastX = e.clientX;
      drag.startY = drag.lastY = e.clientY;
      drag.locked = false;
      drag.moved = false;
      mount.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      pointer.moved = true;
      parallaxTarget.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);

      if (drag.id !== e.pointerId) return;
      const threshold = isCoarse() ? 18 : 6;
      if (!drag.locked) {
        const dx = Math.abs(e.clientX - drag.startX);
        const dy = Math.abs(e.clientY - drag.startY);
        if (dx < threshold && dy < threshold) return;
        drag.axis = dy > dx ? "y" : "x";
        drag.locked = true;
        drag.moved = true;
      }
      const dx = drag.lastX - e.clientX;
      const dy = drag.lastY - e.clientY;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      const coarse = isCoarse();
      const multiplier = coarse ? 1.15 : 2.6;
      let step =
        (((drag.axis === "y" ? dy : dx) * FRUSTUM_HEIGHT) / Math.max(1, window.innerHeight)) * multiplier * viewportScale() * INPUT_DIRECTION;
      if (coarse) step = gsap.utils.clamp(-0.2, 0.2, step);
      focus();
      scroll.target += step;
      u.uSpeedY.value += step;
    };

    const onPointerUp = async (e: PointerEvent) => {
      if (drag.id !== e.pointerId) return;
      drag.id = -1;
      if (drag.moved) {
        endGesture();
        return;
      }
      // Tap / click: focused page opens up bigger, any other page scrolls into focus
      const picked = await pickAt(e.clientX, e.clientY);
      if (disposed || picked < 0) return;
      const centerInstance = nearestInstance(scroll.current);
      if (picked % count === centerInstance % count || picked % count === lastProject) {
        openEnlargedRef.current(picked % count);
        return;
      }
      goToInstance(picked);
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      parallaxTarget.set(0, 0);
      setHover(-1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (introPlaying) return;
      const forward = ["ArrowDown", "ArrowRight", "PageDown"].includes(e.key);
      const back = ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key);
      if (!forward && !back) return;
      e.preventDefault();
      focus();
      scroll.target = snap(scroll.target) + (forward ? 1 : -1) * INPUT_DIRECTION;
    };

    mount.addEventListener("wheel", onWheel, { passive: false });
    mount.addEventListener("pointerdown", onPointerDown);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerup", onPointerUp);
    mount.addEventListener("pointercancel", onPointerUp);
    mount.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("keydown", onKeyDown);

    const resize = () => {
      ({ width, height } = size());
      camera.left = (-FRUSTUM_HEIGHT * aspect()) / 2;
      camera.right = (FRUSTUM_HEIGHT * aspect()) / 2;
      camera.top = FRUSTUM_HEIGHT / 2;
      camera.bottom = -FRUSTUM_HEIGHT / 2;
      camera.updateProjectionMatrix();
      const desk = window.innerWidth >= 1024;
      mesh.position.set(desk ? -1.4 : 0, desk ? 0 : 0.75, 0);
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    // Hold the intro until the site preloader has lifted so the spin is actually seen
    const startWhenReady = () => {
      if (!introPending) return;
      introPending = false;
      setReady(true);
      startIntro();
    };

    const onPreloaderDone = () => {
      startWhenReady();
    };

    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    if (typeof document !== "undefined") {
      if (!document.documentElement.classList.contains("is-preloading")) {
        startWhenReady();
      } else {
        window.addEventListener("7h-preloader-done", onPreloaderDone);
        fallbackTimer = setTimeout(startWhenReady, 1200);
      }
    }

    // ---------- Frame loop ----------
    let frame = 0;
    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);

      if (introPlaying) {
        const p = Math.min((performance.now() - introStart) / 1000 / INTRO_SECONDS, 1);
        const eased = 1 - (1 - p) ** 4;
        const deltaIntro = (eased - introEased) * introDistance;
        introEased = eased;
        scroll.target += deltaIntro;
        u.uSpeedY.value += deltaIntro;
        if (p >= 1) {
          introPlaying = false;
          u.uSpeedY.value = 0;
        }
      }

      if (smoothingWheel) {
        let step = pendingWheel * WHEEL_EASE;
        pendingWheel -= step;
        if (Math.abs(pendingWheel) < 0.001) {
          step += pendingWheel;
          pendingWheel = 0;
          smoothingWheel = false;
          scheduleSnap(150);
        }
        scroll.target += step;
        u.uSpeedY.value += step;
      }

      const parallaxDamping = 1 - Math.exp(-3 * delta);
      parallaxCurrent.lerp(parallaxTarget, parallaxDamping);
      parallaxGroup.rotation.y = parallaxCurrent.x * 0.03;
      parallaxGroup.rotation.x = -parallaxCurrent.y * 0.03;
      parallaxGroup.rotation.z = 0;

      scroll.current += (scroll.target - scroll.current) * SCROLL_LERP;
      const idle = !wheeling && !smoothingWheel && drag.id === -1 && !introPlaying;
      if (idle && Math.abs(scroll.target - scroll.current) < SNAP_EPSILON) scroll.current = scroll.target;
      u.uScrollY.value = scroll.current;
      u.uSpeedY.value *= SPEED_DECAY;

      const project = nearestInstance(scroll.current) % count;
      if (project !== lastProject) {
        lastProject = project;
        setActive(project);
      }

      camera.lookAt(lookTarget);
      renderer.render(scene, camera);

      // Hover picking: only when the pointer moved or pages are still moving
      frame++;
      const moving = Math.abs(scroll.target - scroll.current) > SNAP_EPSILON;
      if (pointer.inside && drag.id === -1 && !introPlaying && !isCoarse() && (pointer.moved || (moving && frame % 3 === 0))) {
        pointer.moved = false;
        pickAt(pointer.x, pointer.y).then((picked) => {
          if (!disposed && pointer.inside && picked !== -1) {
            setHover(picked);
          }
        });
      }
    };
    renderer.setAnimationLoop(tick);

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      clock.stop();
      window.removeEventListener("7h-preloader-done", onPreloaderDone);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.clearTimeout(snapTimer);
      resizeObserver.disconnect();
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("pointerdown", onPointerDown);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerup", onPointerUp);
      mount.removeEventListener("pointercancel", onPointerUp);
      mount.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKeyDown);
      gsap.killTweensOf([u.uCenterSpacing, u.uFocusRotationX, u.uFocusRotationY, u.uFocusRotationZ, u.uHoverLift, u.uHoverLiftOut]);
      geometry.dispose();
      material.dispose();
      placeholder.dispose();
      atlasTexture?.dispose();
      pickTarget.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [items]);

  const count = items.length;
  const current = items[active];
  const enlargedItem = enlargedIndex !== null ? items[enlargedIndex] : null;

  return (
    <section data-lenis-prevent className="relative h-[100dvh] w-full overflow-hidden bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <h1 className="sr-only">Three Slider</h1>

      {/* WebGL stage */}
      <div
        ref={mountRef}
        className={`absolute inset-0 touch-none select-none transition-opacity duration-500 ${
          enlargedIndex !== null ? "pointer-events-none opacity-30" : ""
        }`}
        aria-hidden="true"
      />

      {/* Project list — the focused title is centered, neighbours fade out above/below */}
      <div
        className={`pointer-events-none absolute inset-x-4 bottom-20 h-0 transition-opacity duration-700 md:inset-x-auto md:bottom-auto md:right-[5vw] md:top-1/2 md:h-0 md:w-[22rem] ${
          ready && enlargedIndex === null ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-live="polite"
      >
        {items.map((item, i) => {
          let offset = (((i - active) % count) + count) % count;
          if (offset > count / 2) offset -= count;
          const distance = Math.abs(offset);
          const clamped = Math.max(-3, Math.min(3, offset));
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.28 : distance === 2 ? 0.1 : 0;
          return (
            <article
              key={item.title}
              data-active={distance === 0}
              aria-hidden={distance !== 0}
              className="slider-card-item absolute inset-x-0 top-0 flex flex-col items-center gap-2 text-center transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:data-[active=false]:!opacity-0 max-md:data-[active=true]:bg-black/60 max-md:data-[active=true]:backdrop-blur-md max-md:data-[active=true]:border max-md:data-[active=true]:border-white/10 max-md:data-[active=true]:rounded-[var(--radius-box)] max-md:data-[active=true]:px-4 max-md:data-[active=true]:py-3 max-md:data-[active=true]:shadow-2xl md:gap-3"
              style={{
                "--translate-y": `calc(${clamped * 13.5}rem - 50%)`,
                "--opacity": opacity,
              } as React.CSSProperties}
            >
              <p className="text-xs uppercase text-[var(--color-text-muted)]">{item.category}</p>
              <h2 className="uppercase text-white">{item.title}</h2>
              <span className="h-px w-4 bg-white/40" aria-hidden="true" />
              <p className="max-w-[20rem] text-sm text-[var(--color-text-secondary)]">{item.description}</p>
              {distance === 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenEnlarged(active)}
                  className="mt-1 pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs text-white backdrop-blur-sm transition-[transform,background-color] duration-150 hover:scale-105 hover:bg-white/20 active:scale-95"
                  aria-label={`Open enlarged view of ${item.title}`}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Enlarge</span>
                </button>
              )}
            </article>
          );
        })}
      </div>

      {/* Counter */}
      <div
        className={`pointer-events-none absolute left-4 top-24 flex items-start gap-2 transition-opacity duration-700 md:bottom-8 md:left-8 md:top-auto ${
          ready && enlargedIndex === null ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="font-[family-name:var(--font-display)] text-[clamp(4rem,10vw,9rem)] leading-[0.8] tabular-nums">
          {String(active + 1).padStart(2, "0")}
        </span>
        <span className="pt-1 text-sm text-[var(--color-text-muted)]">/{String(count).padStart(2, "0")}</span>
      </div>

      {/* Hint */}
      <p
        className={`pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-xs uppercase text-[var(--color-text-muted)] transition-opacity duration-700 ${
          ready && enlargedIndex === null ? "opacity-100" : "opacity-0"
        }`}
      >
        Scroll or drag · Click image to enlarge
      </p>

      {/* Enlarged Modal View */}
      {mounted && enlargedIndex !== null && enlargedItem && createPortal(
        <dialog
          open
          aria-label={`${enlargedItem.title} enlarged view`}
          className="fixed inset-0 z-[99999] m-0 p-4 sm:p-6 md:p-8 max-w-none max-h-none w-screen h-screen flex items-center justify-center bg-transparent border-none"
          onCancel={handleCloseEnlarged}
        >
          {/* Backdrop button */}
          <button
            type="button"
            aria-label="Close enlarged view backdrop"
            onClick={handleCloseEnlarged}
            className="fixed inset-0 bg-black/92 backdrop-blur-2xl transition-opacity duration-300 border-none cursor-default"
          />
          {/* Close button */}
          <button
            type="button"
            onClick={handleCloseEnlarged}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[110] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-[background-color,transform,box-shadow] duration-150 hover:bg-white/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Close enlarged view"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Previous button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const prev = (enlargedIndex - 1 + count) % count;
              setEnlargedIndex(prev);
              navigateToRef.current(prev);
              setIsZoomed(false);
            }}
            className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[110] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-[background-color,transform,box-shadow] duration-150 hover:bg-white/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Previous image"
          >
            <DotChevronLeft className="h-6 w-6" />
          </button>

          {/* Next button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = (enlargedIndex + 1) % count;
              setEnlargedIndex(next);
              navigateToRef.current(next);
              setIsZoomed(false);
            }}
            className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[110] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition-[background-color,transform,box-shadow] duration-150 hover:bg-white/20 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Next image"
          >
            <DotChevronRight className="h-6 w-6" />
          </button>

          {/* Modal card */}
          <div
            className="relative flex flex-col items-center max-w-5xl w-full max-h-[92vh] overflow-y-auto no-scrollbar gap-4 md:gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Clickable image container: click toggles between fit and zoomed */}
            <div
              onClick={() => setIsZoomed((prev) => !prev)}
              className="relative overflow-hidden rounded-[var(--radius-box)] border border-white/15 bg-black/60 shadow-2xl flex items-center justify-center cursor-pointer transition-transform duration-300"
              title={isZoomed ? "Click to fit" : "Click to zoom"}
            >
              <img
                src={enlargedItem.image}
                alt={enlargedItem.title}
                className={`w-auto max-w-full object-contain select-none transition-transform duration-300 ${
                  isZoomed ? "max-h-none scale-110" : "max-h-[66vh] sm:max-h-[70vh] scale-100"
                }`}
              />
            </div>

            {/* Details bar */}
            <div className="flex flex-col items-center text-center gap-2 max-w-2xl px-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-medium tracking-wider text-[var(--color-accent)] bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  {enlargedItem.category}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                  {String(enlargedIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
              </div>

              <h2 className="font-bold uppercase text-white tracking-wide">
                {enlargedItem.title}
              </h2>

              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {enlargedItem.description}
              </p>

              {enlargedItem.href && (
                <div className="pt-1">
                  <Link
                    href={enlargedItem.href}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-accent)] text-black font-semibold text-sm hover:opacity-90 transition-[opacity,transform] duration-150 hover:scale-105 active:scale-95"
                  >
                    <span>Explore {enlargedItem.category}</span>
                    <DotChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </dialog>,
        document.body
      )}
    </section>
  );
}
