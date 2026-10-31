"use client";

// ─── Page-ready check (Fonts + DOM Text + Images + Double RAF) ─────────────
// Moved out of PageTransition.tsx so TransitionContext can also use it: the
// View Transition wrapper in TransitionContext.requestTransition needs to
// resolve its update callback only once the destination is genuinely ready
// to be screenshotted by the browser (same reasoning PageTransition already
// used this for) — sharing one implementation instead of two keeps that
// definition of "ready" from drifting apart between the two call sites.
const MAX_WAIT_MS = 300;

export async function waitForPageReady(): Promise<void> {
  // Fast paint readiness check via double requestAnimationFrame (no blocking on web fonts)
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    const deadline = setTimeout(resolve, MAX_WAIT_MS);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clearTimeout(deadline);
        resolve();
      });
    });
  });
}

export async function waitForCanvasReady(timeoutMs = 600): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if ((window as any).__7hCanvasReady) {
    return;
  }

  // If there is no canvas in the document, resolve immediately without stalling
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    (window as any).__7hCanvasReady = true;
    return;
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve();
      }
    }, timeoutMs);

    const onReady = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("7h-canvas-ready", onReady);
    };

    window.addEventListener("7h-canvas-ready", onReady, { once: true });
  });
}

export async function waitForHeroVideoReady(timeoutMs = 4000): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if ((window as any).__7hHeroVideoReady) {
    return;
  }

  // Attempt to immediately play or prime hero video element if present
  const heroVideo = document.querySelector(
    "#hero video, #global-bleed-backdrop video",
  ) as HTMLVideoElement | null;

  if (
    heroVideo &&
    (heroVideo.readyState >= 3 || (!heroVideo.paused && heroVideo.currentTime > 0))
  ) {
    (window as any).__7hHeroVideoReady = true;
    return;
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve();
      }
    }, timeoutMs);

    const onReady = () => {
      if (!settled) {
        settled = true;
        (window as any).__7hHeroVideoReady = true;
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("7h-hero-video-ready", onReady);
      if (heroVideo) {
        heroVideo.removeEventListener("canplay", onReady);
        heroVideo.removeEventListener("playing", onReady);
        heroVideo.removeEventListener("loadeddata", onReady);
      }
    };

    window.addEventListener("7h-hero-video-ready", onReady, { once: true });
    if (heroVideo) {
      heroVideo.addEventListener("canplay", onReady, { once: true });
      heroVideo.addEventListener("playing", onReady, { once: true });
      heroVideo.addEventListener("loadeddata", onReady, { once: true });
      // If paused or stalled, trigger play
      if (heroVideo.paused) {
        heroVideo.play().catch(() => {});
      }
    }
  });
}

export async function waitForMapReady(timeoutMs = 5000): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Signal the map to load eagerly during preloader if on homepage
  if (typeof window !== "undefined") {
    (window as any).__7hEagerLoadMap = true;
    window.dispatchEvent(new CustomEvent("7h-eager-load-map"));
  }

  if ((window as any).__7hMapLoaded) {
    return;
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve();
      }
    }, timeoutMs);

    const onReady = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("7h-map-ready", onReady);
    };

    window.addEventListener("7h-map-ready", onReady, { once: true });
  });
}

export async function waitForMediaVideosReady(timeoutMs = 300): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Only apply when the destination route is /media
  if (!window.location.pathname.startsWith("/media")) return;

  if ((window as any).__7hMediaVideosReady) {
    return;
  }

  // If a video element already exists and is primed, resolve immediately
  const video = document.querySelector("#full-site-backdrop-video video, video") as HTMLVideoElement | null;
  if (!video || video.readyState >= 2 || (!video.paused && video.currentTime > 0)) {
    (window as any).__7hMediaVideosReady = true;
    return;
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        (window as any).__7hMediaVideosReady = true;
        cleanup();
        resolve();
      }
    }, timeoutMs);

    const onReady = () => {
      if (!settled) {
        settled = true;
        (window as any).__7hMediaVideosReady = true;
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener("7h-media-videos-ready", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("playing", onReady);
    };

    window.addEventListener("7h-media-videos-ready", onReady, { once: true });
    video.addEventListener("canplay", onReady, { once: true });
    video.addEventListener("playing", onReady, { once: true });
  });
}
