/**
 * Shared three.js disc building blocks.
 *
 * Used by the full-screen vault (DiscTestClient) AND the small banner disc on
 * the page (BannerDisc), so both are rendered by exactly the same scene code —
 * same geometry, materials, lighting, label and shadow — and the hand-off
 * between them is pixel-identical.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { DiscItem } from "./data";

/* ------------------------------------------------------------------ */
/*  Tunables shared by every disc                                      */
/* ------------------------------------------------------------------ */
export const RADIUS = 1.15;
export const HOLE = 0.17;
export const TILT = new THREE.Euler(-0.62, 0.38, 0.28);
export const CAMERA_FOV = 32;
/** camera distance for a viewport aspect (pulled back on portrait screens) */
export const cameraZ = (aspect: number) => (aspect < 1 ? 7.2 / aspect ** 0.55 : 7.2);

/* ------------------------------------------------------------------ */
/*  Disc label texture (drawn on a canvas from the item's image)       */
/* ------------------------------------------------------------------ */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  size: number,
  item: DiscItem,
  img: HTMLImageElement | null,
) {
  const c = size / 2;
  ctx.clearRect(0, 0, size, size);

  // silver base
  const g = ctx.createRadialGradient(c, c, size * 0.08, c, c, c);
  g.addColorStop(0, "#d9dde2");
  g.addColorStop(1, "#b9bec6");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, c * 0.99, 0, Math.PI * 2);
  ctx.clip();

  if (img && img.naturalWidth) {
    // Fill the entire CD disc edge-to-edge with the cover artwork
    const cover = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const cw = img.naturalWidth * cover;
    const ch = img.naturalHeight * cover;
    ctx.drawImage(img, c - cw / 2, c - ch / 2, cw, ch);
  } else {
    ctx.fillStyle = "#9aa0a8";
    ctx.fillRect(0, 0, size, size);
  }

  // Subtle outer edge vignette to soften the disc perimeter
  const v = ctx.createRadialGradient(c, c, c * 0.7, c, c, c);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(0.85, "rgba(0,0,0,0.15)");
  v.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  // Outer mirror rim accent line
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, c * 0.985, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = size * 0.003;
  ctx.stroke();
  ctx.restore();

  // Subtle center transparent hub cutout ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, size * (HOLE / (RADIUS * 2)), 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = size * 0.0025;
  ctx.stroke();
  ctx.restore();

  // rim text with soft drop shadow so it reads clearly over any artwork
  const text = `7TH HEAVEN  ·  ${item.title.toUpperCase()}  ·  ${item.category.toUpperCase()}  ·  `;
  ctx.save();
  ctx.translate(c, c);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 6;
  ctx.font = `600 ${Math.round(size * 0.022)}px Inter, Helvetica, Arial, sans-serif`;
  ctx.textBaseline = "middle";
  const r = c * 0.91;
  const step = (size * 0.026) / r;
  let a = -Math.PI * 0.65;
  for (const ch of text.repeat(2)) {
    if (a > Math.PI * 1.1) break;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -r);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    a += step * (ch === " " ? 0.55 : 1);
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/*  Renderer / scene setup                                             */
/* ------------------------------------------------------------------ */
export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.domElement.style.display = "block";
  return renderer;
}

/** Environment map, lights, and the geometry/materials every disc shares. */
export function createDiscKit(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-3, 5, 6);
  scene.add(key, new THREE.AmbientLight(0xffffff, 0.35));

  const faceGeo = new THREE.RingGeometry(HOLE, RADIUS, 128, 1);
  const hitGeo = new THREE.CircleGeometry(RADIUS * 1.04, 32);
  const edgeGeo = new THREE.CylinderGeometry(RADIUS, RADIUS, 0.028, 160, 1, true);
  edgeGeo.rotateX(Math.PI / 2);
  const holeEdgeGeo = new THREE.CylinderGeometry(HOLE, HOLE, 0.028, 64, 1, true);
  holeEdgeGeo.rotateX(Math.PI / 2);

  const silver = new THREE.MeshPhysicalMaterial({
    color: 0xc9ced6,
    metalness: 0.9,
    roughness: 0.22,
    side: THREE.DoubleSide,
  });
  const back = new THREE.MeshPhysicalMaterial({
    color: 0xd4d8de,
    metalness: 1,
    roughness: 0.12,
    iridescence: 1,
    iridescenceIOR: 1.6,
    side: THREE.DoubleSide,
  });

  // soft elliptical shadow cast onto the page behind each disc
  const shadowTex = (() => {
    const size = 512;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(0,0,0,0.68)");
    grad.addColorStop(0.2, "rgba(0,0,0,0.52)");
    grad.addColorStop(0.45, "rgba(0,0,0,0.26)");
    grad.addColorStop(0.72, "rgba(0,0,0,0.08)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const shadowGeo = new THREE.PlaneGeometry(RADIUS * 2.8, RADIUS * 2.8);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });

  return {
    renderer,
    scene,
    faceGeo,
    hitGeo,
    edgeGeo,
    holeEdgeGeo,
    silver,
    back,
    shadowGeo,
    shadowMat,
    dispose() {
      shadowGeo.dispose();
      shadowTex.dispose();
      shadowMat.dispose();
      [faceGeo, hitGeo, edgeGeo, holeEdgeGeo].forEach((geo) => geo.dispose());
      [silver, back].forEach((m) => m.dispose());
      envTex.dispose();
      pmrem.dispose();
    },
  };
}
export type DiscKit = ReturnType<typeof createDiscKit>;

export type Disc = {
  group: THREE.Group;
  spin: THREE.Group;
  tex: THREE.CanvasTexture;
  mat: THREE.MeshPhysicalMaterial;
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  hitMesh: THREE.Mesh;
};

/**
 * Build one disc (group → spin → face/back/edges/hit-area) plus its page
 * shadow, and add both to the kit's scene. `onLabel` fires once the cover art
 * has been drawn into the label (or failed to load).
 */
export function createDisc(kit: DiscKit, item: DiscItem, index: number, onLabel?: () => void): Disc {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  drawLabel(ctx, size, item, null);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = kit.renderer.capabilities.getMaxAnisotropy();

  const img = new Image();
  img.decoding = "async";
  const onLoad = () => {
    drawLabel(ctx, size, item, img);
    tex.needsUpdate = true;
    onLabel?.();
  };
  img.onload = onLoad;
  img.onerror = () => onLabel?.();
  img.src = item.image;
  if (img.complete && img.naturalWidth) {
    onLoad();
  }

  const mat = new THREE.MeshPhysicalMaterial({
    map: tex,
    roughness: 0.38,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
  });

  const group = new THREE.Group();
  const spin = new THREE.Group();
  group.rotation.copy(TILT);
  group.add(spin);

  const face = new THREE.Mesh(kit.faceGeo, mat);
  face.position.z = 0.0141;
  face.userData.index = index;
  const backFace = new THREE.Mesh(kit.faceGeo, kit.back);
  backFace.position.z = -0.0141;
  backFace.rotation.y = Math.PI;
  const edge = new THREE.Mesh(kit.edgeGeo, kit.silver);
  const holeEdge = new THREE.Mesh(kit.holeEdgeGeo, kit.silver);

  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(kit.hitGeo, hitMat);
  hitMesh.position.z = 0.02;
  hitMesh.userData.index = index;

  spin.add(face, backFace, edge, holeEdge, hitMesh);

  // screen-aligned shadow, squashed to match the disc's tilted silhouette
  const shadow = new THREE.Mesh(kit.shadowGeo, kit.shadowMat.clone());
  shadow.rotation.z = TILT.z;
  shadow.scale.set(1, Math.cos(TILT.x) * 0.95, 1);
  shadow.renderOrder = -1;
  kit.scene.add(shadow);
  kit.scene.add(group);

  return { group, spin, tex, mat, shadow, hitMesh };
}

export function disposeDisc(d: Disc) {
  d.tex.dispose();
  d.mat.dispose();
  d.shadow.material.dispose();
  (d.hitMesh.material as THREE.Material).dispose();
}

/** Place a disc's shadow for a disc at (x, y, z) with uniform scale s. */
export function placeShadow(d: Disc, x: number, y: number, z: number, s: number, opacity: number) {
  d.shadow.position.set(x + 0.05 * s, y - 0.08 * s, z - 0.15);
  d.shadow.scale.set(s * 1.15, Math.cos(TILT.x) * 1.05 * s, 1);
  d.shadow.material.opacity = opacity;
}

/** Point the camera like the full-screen vault does for a viewport of w × h. */
export function aimCamera(camera: THREE.PerspectiveCamera, w: number, h: number) {
  camera.fov = CAMERA_FOV;
  camera.aspect = w / h;
  camera.position.set(0, 0, cameraZ(w / h));
}

/**
 * Viewport px (center x/y + diameter) of an on-page disc → world position and
 * disc scale on the z = 0 plane, for a camera aimed with `aimCamera(w, h)`.
 */
export function screenDiscToWorld(
  camera: THREE.PerspectiveCamera,
  w: number,
  h: number,
  o: { x: number; y: number; size: number },
) {
  const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const visW = visH * (w / h);
  return {
    x: (o.x / w - 0.5) * visW,
    y: -(o.y / h - 0.5) * visH,
    s: ((o.size / h) * visH) / (2 * RADIUS),
  };
}
