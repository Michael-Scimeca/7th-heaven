"use client";

// ─── Page-ready check (Fonts + DOM Text + Images + Double RAF) ─────────────
// Moved out of PageTransition.tsx so TransitionContext can also use it: the
// View Transition wrapper in TransitionContext.requestTransition needs to
// resolve its update callback only once the destination is genuinely ready
// to be screenshotted by the browser (same reasoning PageTransition already
// used this for) — sharing one implementation instead of two keeps that
// definition of "ready" from drifting apart between the two call sites.
const MAX_WAIT_MS = 2500;

// Deliberately setTimeout, not requestAnimationFrame, everywhere in this
// file. This function runs inside document.startViewTransition()'s update
// callback (see TransitionContext.tsx), and rAF callbacks are tied to the
// paint pipeline — a tab that isn't the visible/foreground tab (backgrounded,
// minimized, or — as discovered while debugging this — driven by some
// automation harnesses that report document.visibilityState === "hidden"
// even while still delivering input) gets its rAF queue throttled or paused
// entirely by the browser. When that happened here, this function's
// rAF-based polling never advanced, so the poll in TransitionContext never
// saw "ready," fell through to its own 6s hard timeout, and by then Chrome
// had already unilaterally aborted the view transition itself
// (`ready` rejected with "InvalidStateError: Transition was aborted because
// of invalid state") — so the browser silently fell back to an instant DOM
// swap with no animation at all, no error surfaced anywhere. setTimeout
// fires regardless of paint/visibility state, so this now resolves in one
// or two ticks the moment the destination is actually ready, independent of
// whether the tab is currently being painted.
const poll = (fn: () => void, delayMs = 16) => setTimeout(fn, delayMs);

export async function waitForPageReady(): Promise<void> {
  // 1. Wait for custom web fonts (Barlow, Rockstar, Inter, etc.) to fully load
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
      if (document.fonts.status === "loading") {
        await new Promise<void>((resolve) => {
          const onDone = () => {
            document.fonts.removeEventListener("loadingdone", onDone);
            resolve();
          };
          document.fonts.addEventListener("loadingdone", onDone);
          setTimeout(resolve, 600);
        });
      }
    } catch {}
  }

  // 2. If a map component is present on the page, wait for map tiles & markers to finish loading
  if (typeof window !== "undefined" && document.querySelector(".snazzy-map-227862, #tour, .leaflet-container")) {
    if (!(window as any).__7hMapLoaded) {
      await new Promise<void>((resolve) => {
        const onMapReady = () => {
          window.removeEventListener("7h-map-ready", onMapReady);
          resolve();
        };
        window.addEventListener("7h-map-ready", onMapReady);
        setTimeout(resolve, 1800); // Safety fallback so visitor is never stranded
      });
    }
  }

  // 3. Ensure text content is rendered in DOM and images/paint passes complete
  return new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(deadline);
      // Two ticks gives Next.js layout & browser font paint a moment to
      // settle before we tell the caller "ready" — see the poll() comment
      // above for why this is setTimeout and not a double rAF.
      poll(() => poll(() => resolve()));
    };

    const deadline = setTimeout(finish, MAX_WAIT_MS);

    const check = () => {
      if (resolved) return;

      // Verify DOM has rendered text
      const target = document.querySelector("main") || document.body;
      const textLength = (target.innerText || target.textContent || "").trim()
        .length;

      // Find visible images that haven't finished loading
      const pendingImages = Array.from(
        document.querySelectorAll<HTMLImageElement>("img")
      ).filter((img) => {
        if (img.complete) return false;
        const r = img.getBoundingClientRect();
        return r.top < window.innerHeight && r.bottom > 0;
      });

      if (textLength > 30 && pendingImages.length === 0) {
        finish();
      } else if (pendingImages.length > 0) {
        let remaining = pendingImages.length;
        const imgDone = () => {
          if (--remaining <= 0) finish();
        };
        pendingImages.forEach((img) => {
          img.addEventListener("load", imgDone, { once: true });
          img.addEventListener("error", imgDone, { once: true });
        });
      } else {
        // Re-check shortly if React DOM is still mounting text
        poll(check);
      }
    };

    poll(check);
  });
}
