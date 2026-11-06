/* eslint-disable react-doctor/effect-needs-cleanup, react-doctor/effect-raf-loop-needs-cancel, react-doctor/no-noninteractive-element-interactions */
"use client";

/**
 * Media reel — jesperlandberg.com-style curved WebGL carousel over a perspective
 * grid floor, using the Media page's videos. Native page scroll drives the reel (so
 * the footer stays reachable); the text and hit areas are real HTML buttons tracked
 * to the cards. Falls back to a plain grid if WebGL isn't available.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DELTA_SMOOOTHY_CARDS } from "@/components/media/deltaSmooothySlides";
import "./media-reel.css";

interface ReelItem {
  id: string;
  youtubeId: string;
  title: string;
  subtitle: string;
  image: string;
  year?: string | number;
  duration?: string;
  caption?: string;
}

const FEATURED: ReelItem[] = DELTA_SMOOOTHY_CARDS.map((c) => ({
  id: c.id,
  youtubeId: c.track.youtubeId ?? "",
  title: c.track.name,
  subtitle: c.originSubtitle,
  image: c.coverSrc,
  year: c.track.year,
  duration: c.track.duration,
  caption: c.track.subtitle,
})).filter((i) => i.youtubeId);

const CARD_W = 4.4;
const CARD_H = 2.7;
const SPACING = 5.2;
const CURVE = 0.045;
const SCROLL_PER_CARD = 420;

const focusScale = (off: number) => 1 + 0.22 * Math.exp(-(off * off) / 9);

const VERT = /* glsl */ `
  uniform float uOffset;
  uniform float uBend;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float s = 1.0 + 0.22 * exp(-(uOffset * uOffset) / 9.0);
    vec3 p = position * s;
    float x = p.x + uOffset;
    p.x = x;
    p.z = -(${CURVE.toFixed(3)} + uBend) * x * x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uVideo;
  uniform float uMix;
  uniform float uImageAspect;
  uniform float uVideoAspect;
  uniform float uDim;
  uniform float uLoaded;
  varying vec2 vUv;
  vec2 cover(vec2 uv, float imageAspect) {
    float cardAspect = ${(CARD_W / CARD_H).toFixed(4)};
    vec2 s = cardAspect > imageAspect ? vec2(1.0, imageAspect / cardAspect) : vec2(cardAspect / imageAspect, 1.0);
    return (uv - 0.5) * s + 0.5;
  }
  void main() {
    vec2 size = vec2(${CARD_W.toFixed(2)}, ${CARD_H.toFixed(2)});
    vec2 q = abs(vUv - 0.5) * size - (size * 0.5 - 0.22);
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.22;
    float alpha = 1.0 - smoothstep(-0.008, 0.008, d);
    vec3 col = vec3(0.05);
    if (uLoaded > 0.5) col = texture2D(uMap, cover(vUv, uImageAspect)).rgb;
    if (uMix > 0.001) col = mix(col, texture2D(uVideo, cover(vUv, uVideoAspect)).rgb, uMix);
    col *= mix(0.42, 1.0, smoothstep(0.0, 0.42, vUv.y));
    col *= uDim;
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

const FLOOR_VERT = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FLOOR_FRAG = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec2 c = vWorld.xz / 0.9;
    vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float fade = smoothstep(26.0, 3.0, length(vWorld.xz));
    gl_FragColor = vec4(vec3(1.0), line * fade * 0.16);
  }
`;

export default function MediaReelClient() {
  const [mode, setMode] = useState<"featured" | "full">("featured");
  const [fullItems, setFullItems] = useState<ReelItem[] | null>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<ReelItem | null>(null);
  const [noWebGL, setNoWebGL] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeRef = useRef(0);
  const draggedRef = useRef(false);

  const items = useMemo(
    () => (mode === "full" && fullItems ? fullItems : FEATURED),
    [mode, fullItems],
  );

  // The full list lives with the Media page's vault, so only load it on request.
  const showFull = useCallback(async () => {
    setMode("full");
    if (fullItems) return;
    const { CATEGORIES_DATA } = await import("@/components/media/PartnershipsMediaVault");
    const seen = new Set<string>();
    const all: ReelItem[] = [];
    CATEGORIES_DATA.filter((row) => row.categoryType === "video").forEach((row) => {
      row.items.forEach((card) => {
        // Local frames only: WebGL can't read YouTube-hosted thumbnails cross-origin.
        if (!card.youtubeId || seen.has(card.youtubeId) || !card.src.startsWith("/")) return;
        seen.add(card.youtubeId);
        all.push({
          id: card.id,
          youtubeId: card.youtubeId,
          title: card.title,
          subtitle: row.title,
          image: card.src,
          year: card.year,
          duration: card.duration,
          caption: card.caption,
        });
      });
    });
    setFullItems(all);
  }, [fullItems]);

  const scrollToIndex = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(items.length - 1, i));
      const top = track.getBoundingClientRect().top + window.scrollY;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: top + clamped * SCROLL_PER_CARD, behavior: reduced ? "auto" : "smooth" });
    },
    [items.length],
  );

  // Back to the first card when the list changes
  useEffect(() => {
    const track = trackRef.current;
    if (track && track.getBoundingClientRect().top < 0) {
      window.scrollTo({ top: track.getBoundingClientRect().top + window.scrollY });
    }
  }, [items]);

  // Video dialog
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (playing && !d.open) d.showModal();
    if (!playing && d.open) d.close();
  }, [playing]);

  // WebGL reel
  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const host = canvasHostRef.current;
      const track = trackRef.current;
      if (cancelled || !host || !track) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        setNoWebGL(true);
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(90, 60),
        new THREE.ShaderMaterial({
          vertexShader: FLOOR_VERT,
          fragmentShader: FLOOR_FRAG,
          transparent: true,
          depthWrite: false,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -2.1;
      scene.add(floor);

      const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
      blank.needsUpdate = true;

      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "none";
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      let videoReady = false;
      let videoIndex = -1;
      const onPlaying = () => { videoReady = true; };
      const onVideoError = () => { videoReady = false; };
      video.addEventListener("playing", onPlaying);
      video.addEventListener("error", onVideoError);

      const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H, 48, 12);
      const loader = new THREE.TextureLoader();
      const textures: import("three").Texture[] = [];
      const cards = items.map((item) => {
        const material = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          uniforms: {
            uOffset: { value: 0 },
            uBend: { value: 0 },
            uMap: { value: blank },
            uVideo: { value: videoTexture },
            uMix: { value: 0 },
            uImageAspect: { value: 16 / 9 },
            uVideoAspect: { value: 16 / 9 },
            uDim: { value: 1 },
            uLoaded: { value: 0 },
          },
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        return { mesh, material, item, requested: false };
      });

      let width = 0;
      let height = 0;
      let cameraZ = 7.5;
      const resize = () => {
        width = host.clientWidth;
        height = host.clientHeight;
        renderer.setSize(width, height);
        const aspect = width / height;
        camera.aspect = aspect;
        cameraZ = Math.max(9.5, 6.6 / (0.63 * aspect));
        camera.position.set(0, 0.25, cameraZ);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      const v = new THREE.Vector3();
      const project = (x: number, y: number, z: number) => {
        v.set(x, y, z).project(camera);
        return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height };
      };

      let current = 0;
      let lastCurrent = 0;
      let bend = 0;
      let settledAt = 0;
      let raf = 0;

      const frame = (time: number) => {
        raf = requestAnimationFrame(frame);
        const rect = track.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;

        const range = Math.max(1, rect.height - window.innerHeight);
        const progress = Math.max(0, Math.min(1, -rect.top / range));
        const target = progress * (items.length - 1);
        current = reduced ? target : current + (target - current) * 0.09;
        const velocity = current - lastCurrent;
        lastCurrent = current;
        bend = reduced ? 0 : bend + (Math.min(Math.abs(velocity) * 0.1, 0.03) - bend) * 0.12;

        const nearest = Math.round(current);
        if (nearest !== activeRef.current) {
          activeRef.current = nearest;
          setActive(nearest);
        }

        cards.forEach((card, i) => {
          const off = (i - current) * SPACING;
          const u = card.material.uniforms;
          u.uOffset.value = off;
          u.uBend.value = bend;
          u.uDim.value = 0.55 + 0.45 * Math.exp(-(off * off) / 18);
          const onScreen = Math.abs(off) < SPACING * 4;
          card.mesh.visible = onScreen;

          if (!card.requested && Math.abs(i - current) < 6) {
            card.requested = true;
            loader.load(card.item.image, (tex) => {
              if (cancelled) { tex.dispose(); return; }
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.anisotropy = 4;
              textures.push(tex);
              const img = tex.image as HTMLImageElement;
              u.uMap.value = tex;
              u.uImageAspect.value = img.width / img.height;
              u.uLoaded.value = 1;
            });
          }

          const isVideo = i === videoIndex && videoReady;
          u.uMix.value += ((isVideo ? 1 : 0) - u.uMix.value) * 0.08;
          if (isVideo && video.videoWidth) u.uVideoAspect.value = video.videoWidth / video.videoHeight;

          const label = labelRefs.current[i];
          if (!label) return;
          if (!onScreen) {
            label.style.visibility = "hidden";
            return;
          }
          // Track the HTML hit area to the card's projected edges
          const s = focusScale(off);
          const edge = (xLocal: number) => {
            const x = xLocal * s + off;
            return { x, z: -(CURVE + bend) * x * x };
          };
          const l = edge(-CARD_W / 2);
          const r = edge(CARD_W / 2);
          const bl = project(l.x, (-CARD_H / 2) * s, l.z);
          const br = project(r.x, (-CARD_H / 2) * s, r.z);
          const tl = project(l.x, (CARD_H / 2) * s, l.z);
          const w = Math.hypot(br.x - bl.x, br.y - bl.y);
          const h = Math.hypot(tl.x - bl.x, tl.y - bl.y);
          const angle = Math.atan2(br.y - bl.y, br.x - bl.x);
          label.style.visibility = "visible";
          label.style.width = `${w}px`;
          label.style.height = `${h}px`;
          label.style.transform = `translate3d(${bl.x}px, ${bl.y - h}px, 0) rotate(${angle}rad)`;
          label.style.transformOrigin = "0 100%";
          label.style.setProperty("--reel-scale", String(Math.max(0.55, w / 620)));
          // Cards squeezed at the screen edge can't hold readable text
          label.style.setProperty("--reel-text", w < 240 ? "0" : "1");
        });

        // Play the preview clip on the centered card once the reel settles
        if (Math.abs(velocity) > 0.002) settledAt = time;
        if (!reduced && time - settledAt > 350 && nearest !== videoIndex && Math.abs(current - nearest) < 0.05) {
          videoIndex = nearest;
          videoReady = false;
          video.src = `/movie/previews/${items[nearest].youtubeId}.mp4`;
          video.play().catch(() => {});
        }

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("error", onVideoError);
        video.pause();
        video.removeAttribute("src");
        video.load();
        videoTexture.dispose();
        blank.dispose();
        textures.forEach((t) => t.dispose());
        cards.forEach((c) => c.material.dispose());
        geometry.dispose();
        floor.geometry.dispose();
        (floor.material as import("three").Material).dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [items]);

  // Drag to scrub
  const dragStart = useRef<{ x: number; scroll: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return; // touch already scrolls the page
    dragStart.current = { x: e.clientX, scroll: window.scrollY };
    draggedRef.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 6) draggedRef.current = true;
    if (draggedRef.current) window.scrollTo(0, dragStart.current.scroll - dx * 1.2);
  };
  const endDrag = () => {
    dragStart.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollToIndex(activeRef.current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollToIndex(activeRef.current - 1);
    }
  };

  const onCardClick = (i: number) => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    if (i === activeRef.current) setPlaying(items[i]);
    else scrollToIndex(i);
  };

  const count = (n: number) => String(n).padStart(2, "0");

  const toggle = (
    <div className="reel-toggle" role="group" aria-label="Which videos to show">
      <button type="button" aria-pressed={mode === "featured"} onClick={() => setMode("featured")}>
        Featured
      </button>
      <span aria-hidden="true">/</span>
      <button type="button" aria-pressed={mode === "full"} onClick={showFull}>
        Full
      </button>
    </div>
  );

  return (
    <div className="reel" data-no-text-anim>
      {noWebGL ? (
        <div className="reel-fallback">
          <h1 className="reel-title">Media reel</h1>
          {toggle}
          <div className="reel-fallback-grid">
            {items.map((item) => (
              <button key={item.id} type="button" className="reel-fallback-card" onClick={() => setPlaying(item)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" loading="lazy" />
                <span className="reel-card-title">{item.title}</span>
                <span className="reel-card-sub">{item.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={trackRef}
          className="reel-track"
          style={{ height: `calc(100svh + ${(items.length - 1) * SCROLL_PER_CARD}px)` }}
        >
          <div
            ref={stageRef}
            className="reel-stage"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onKeyDown={onKeyDown}
          >
            <div ref={canvasHostRef} className="reel-canvas" aria-hidden="true" />

            <ul className="reel-labels" aria-label="Videos">
              {items.map((item, i) => (
                <li key={item.id}>
                  <button
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                    type="button"
                    className="reel-label"
                    data-active={i === active}
                    aria-label={`Play ${item.title}, ${item.subtitle}`}
                    onClick={() => onCardClick(i)}
                    onFocus={() => {
                      if (i !== activeRef.current) scrollToIndex(i);
                    }}
                  >
                    <span className="reel-label-text">
                      <span className="reel-card-title">{item.title}</span>
                      <span className="reel-card-sub">{item.subtitle}</span>
                    </span>
                    <span className="reel-play" aria-hidden="true">
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="reel-foot">
              <h1 className="reel-title">Media reel</h1>
              <p className="reel-count" aria-live="polite">
                {count(active + 1)} / {count(items.length)}
              </p>
              {toggle}
              <Link href="/media" className="reel-link">
                Full media page
              </Link>
            </div>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="reel-dialog"
        aria-label={playing?.title}
        onClose={() => setPlaying(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) setPlaying(null);
        }}
      >
        {playing && (
          <>
            <div className="reel-dialog-video">
              <iframe
                src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="reel-dialog-info">
              <div>
                <h2 className="reel-card-title">{playing.title}</h2>
                <p className="reel-dialog-caption">
                  {[playing.caption || playing.subtitle, playing.year, playing.duration].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button type="button" className="reel-close" onClick={() => setPlaying(null)}>
                Close
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
