/**
 * Renders the page's banner CD with the vault's own scene code (discScene),
 * through a camera cropped to the banner's spot on screen. The result is the
 * exact pixels the vault draws for its first disc at that position — same
 * tilt, perspective, label, lighting and shadow — so the hand-off is seamless.
 *
 * Loaded lazily (it pulls in three.js).
 */
import * as THREE from "three";
import { ITEMS } from "./data";
import {
  TILT,
  aimCamera,
  createDisc,
  createDiscKit,
  createRenderer,
  disposeDisc,
  placeShadow,
  screenDiscToWorld,
} from "./discScene";

/** Same viewport the full-screen vault measures (it's `fixed inset-x-0 h-[100dvh]`). */
const viewport = () => ({
  w: document.documentElement.clientWidth || window.innerWidth,
  h: window.innerHeight,
});

/**
 * @param host  element the canvas fills. It should be centered on the disc and
 *              2× its size, so the soft shadow has room around the disc.
 * @param discSize  disc diameter in CSS px (unscaled layout size)
 */
export function mountBannerDisc(host: HTMLElement, discSize: () => number, onReady: () => void) {
  const renderer = createRenderer();
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const kit = createDiscKit(renderer, scene);

  let ready = false;
  let disposed = false;
  const disc = createDisc(kit, ITEMS[0], 0, () => {
    if (disposed) return;
    ready = true;
    render();
    onReady();
  });
  disc.spin.rotation.z = 0; // upright, like the vault's launched disc

  function render() {
    if (!ready || disposed) return;
    const { w: vw, h: vh } = viewport();
    const box = host.offsetWidth; // layout size, ignores the button's hover scale
    if (!box) return;
    const r = host.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return; // off screen, nothing to update
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    // the vault's camera, cropped to just this box of the viewport
    aimCamera(camera, vw, vh);
    camera.setViewOffset(vw, vh, cx - box / 2, cy - box / 2, box, box);
    camera.updateProjectionMatrix();
    renderer.setSize(box, box, false);

    const p = screenDiscToWorld(camera, vw, vh, { x: cx, y: cy, size: discSize() });
    disc.group.position.set(p.x, p.y, 0);
    disc.group.scale.setScalar(p.s);
    disc.group.rotation.copy(TILT);
    disc.group.visible = true;
    disc.shadow.visible = true;
    placeShadow(disc, p.x, p.y, 0, p.s, 0.78);
    renderer.render(scene, camera);
  }

  // perspective depends on where the disc sits in the viewport, so re-render as it moves
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      render();
    });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  const ro = new ResizeObserver(schedule);
  ro.observe(host);

  return {
    render: schedule,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      disposeDisc(disc);
      kit.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
