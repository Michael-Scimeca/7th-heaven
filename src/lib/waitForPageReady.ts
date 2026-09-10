"use client";

// ─── Page-ready check (Fonts + DOM Text + Images + Double RAF) ─────────────
// Moved out of PageTransition.tsx so TransitionContext can also use it: the
// View Transition wrapper in TransitionContext.requestTransition needs to
// resolve its update callback only once the destination is genuinely ready
// to be screenshotted by the browser (same reasoning PageTransition already
// used this for) — sharing one implementation instead of two keeps that
// definition of "ready" from drifting apart between the two call sites.
const MAX_WAIT_MS = 300;

const poll = (fn: () => void, delayMs = 16) => setTimeout(fn, delayMs);

export async function waitForPageReady(): Promise<void> {
  // 1. Quick web font check with tight timeout
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      if (document.fonts.status === "loading") {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, 100);
          const onDone = () => {
            clearTimeout(timer);
            document.fonts.removeEventListener("loadingdone", onDone);
            resolve();
          };
          document.fonts.addEventListener("loadingdone", onDone);
        });
      }
    } catch {}
  }

  // 2. Fast paint readiness check via double requestAnimationFrame (no synchronous .innerText reflow)
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
