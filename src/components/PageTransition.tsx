"use client";

import { useEffect, useRef, useTransition as useReactTransition, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { useTransition } from "@/context/TransitionContext";
import { buildStagedCurtainClipPath } from "@/lib/curtainClipPath";

// -0.9 (left edge leads) to 0.9 (right edge leads), 0 = flat — matches what
// thibaultguignand.com's own code actually does. Positive = the RIGHT end
// of the edge rises first (edge tilts up toward the right as it moves);
// negative = the LEFT end rises first (tilts up toward the left). Kept
// small on purpose — "slide up normally, then slant a little at the end,"
// not a dramatic diagonal. Dial in a value on the /pagetransition sandbox
// (it has sliders for this, plus a live "which side leads" label), then
// set it here.
const CURTAIN_SLANT = -0.15;
// The edge stays flat for the first 75% of the wipe and only grows into
// the slant over the final stretch, finishing fully cleared right at the
// end regardless of CURTAIN_SLANT.
const CURTAIN_SLANT_START = 0.75;

/**
 * PageTransition
 * ─────────────────────────────────────────────────────────────────────────
 * Drives the actual route-to-route transition (thibaultguignand.com-style):
 * a black curtain covers the current page, the real Next.js navigation
 * happens while hidden behind it, then the curtain wipes away via
 * `clip-path` — top edge fixed, bottom edge rising, flat until it's mostly
 * done and only then curving into a slight diagonal for the final
 * stretch — revealing the new page. Solid black throughout, no accent
 * color on the edge. No scale/zoom on any content; only the curtain's own
 * clip region moves.
 *
 * This component is driven entirely by TransitionContext's `mode` state
 * machine (see src/context/TransitionContext.tsx). It doesn't decide when
 * to navigate — TransitionLink calls `requestTransition(href)` on click,
 * which flips mode to "covering"; everything below reacts to that.
 *
 *   idle       → no overlay, normal page.
 *   covering   → current page dims, curtain snaps to fully opaque and
 *                holds briefly with a wordmark, THEN router.push() fires
 *                (navigation happens while fully hidden) → mode: "covered".
 *   covered    → waiting for the ACTUAL new route to be ready before
 *                revealing it — see "Two-stage ready check" below.
 *   uncovering → curtain wipes away bottom-up, revealing the new page.
 *                Back to "idle" once the wipe finishes.
 *
 * ─── Two-stage ready check (the standard App Router pattern for this) ─────
 * router.push() is fire-and-forget: it returns immediately, before Next.js
 * has fetched/rendered the destination route. The naive version of this
 * component called router.push() then started polling the DOM right away —
 * which mostly just found the OLD page still sitting there (already fully
 * loaded), so it "finished" almost instantly and the curtain could start
 * uncovering before the new route had actually swapped in.
 *
 * The fix (the same pattern Next.js's own docs use for coordinating
 * navigation with UI state — see "Understanding the pending state" for
 * `useTransition`): wrap the router.push() call in React's `startTransition`
 * and track its `isPending` flag. React only clears `isPending` once the
 * new route's tree has actually rendered and committed to the DOM, so:
 *
 *   1. Wait for `isPending` to go false AND `pathname` to actually equal
 *      the href we navigated to (belt-and-suspenders — confirms the swap
 *      really landed, not just that some unrelated transition finished).
 *   2. Only THEN run waitForPageReady() — the fonts/images/double-RAF
 *      check — since step 1 only guarantees the new React tree is mounted,
 *      not that its images have decoded or its web fonts have painted.
 */

// ─── Page-ready check (Fonts + DOM Text + Images + Double RAF) ─────────────
const MAX_WAIT_MS = 1200;
async function waitForPageReady(): Promise<void> {
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
    } catch { }
  }

  // 2. Ensure text content is rendered in DOM and images/paint passes complete
  return new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(deadline);
      // Double RAF ensures Next.js layout & browser font paint frames have finished
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
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
        // Re-check next frame if React DOM is still mounting text
        requestAnimationFrame(check);
      }
    };

    requestAnimationFrame(check);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
// Safety net: if isPending somehow never clears (e.g. router.push targets
// an external/invalid URL, or a slow/broken data fetch on the destination
// route), don't leave the curtain — and the site — stuck forever.
const MAX_PENDING_WAIT_MS = 6000;

export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startReactTransition] = useReactTransition();
  const { mode, setMode, pendingHref, clearPendingHref } = useTransition();
  const contentRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  // covering → dim current content, curtain snaps opaque + holds, then the
  // real navigation fires (wrapped in startTransition, see the two-stage
  // ready check above) while fully hidden behind it.
  useEffect(() => {
    if (mode !== "covering") return;
    const content = contentRef.current;
    const curtain = curtainRef.current;
    if (!content || !curtain) return;

    const tl = gsap.timeline({
      onComplete: () => {
        if (pendingHref) {
          startReactTransition(() => {
            router.push(pendingHref);
          });
        }
        setMode("covered");
      },
    });

    tl.set(curtain, {
      autoAlpha: 0,
      clipPath: buildStagedCurtainClipPath(0, CURTAIN_SLANT, CURTAIN_SLANT_START),
      pointerEvents: "auto",
    })
      .to(content, { autoAlpha: 0, duration: 0.35, ease: "power2.out" })
      .to(curtain, { autoAlpha: 1, duration: 0.001 }, "<0.2")
      .to({}, { duration: 0.3 }); // hold beat, wordmark visible

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // covered → wait for the new route to actually land (React's isPending
  // clears + pathname matches what we navigated to), THEN wait for its
  // fonts/images/DOM to actually be paintable, before revealing it.
  useEffect(() => {
    if (mode !== "covered") return;
    if (isPending) return; // React hasn't finished rendering the new route yet
    if (pendingHref && pathname !== pendingHref) return; // swap hasn't landed yet

    let cancelled = false;
    waitForPageReady().then(() => {
      if (!cancelled) setMode("uncovering");
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPending, pathname, pendingHref]);

  // Safety net for `isPending` above: if the route swap never completes
  // (broken destination, hung fetch, etc.), stop waiting after a few
  // seconds and reveal whatever's there rather than hiding the site behind
  // a black curtain indefinitely.
  useEffect(() => {
    if (mode !== "covered" || !isPending) return;
    const t = setTimeout(() => {
      waitForPageReady().then(() => setMode("uncovering"));
    }, MAX_PENDING_WAIT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isPending]);

  // uncovering → wipe the curtain away, bottom edge rising, revealing the
  // new page. No scale/zoom on `content` — only the curtain's clip moves.
  useEffect(() => {
    if (mode !== "uncovering") return;
    const content = contentRef.current;
    const curtain = curtainRef.current;
    if (!content || !curtain) return;

    gsap.set(content, { autoAlpha: 1 });
    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      duration: 1,
      ease: "power3.inOut",
      onUpdate: () => {
        curtain.style.clipPath = buildStagedCurtainClipPath(
          proxy.p,
          CURTAIN_SLANT,
          CURTAIN_SLANT_START
        );
      },
      onComplete: () => {
        gsap.set(curtain, {
          autoAlpha: 0,
          clipPath: buildStagedCurtainClipPath(0, CURTAIN_SLANT, CURTAIN_SLANT_START),
          pointerEvents: "none",
        });
        clearPendingHref();
        setMode("idle");
      },
    });

    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <>
      <div ref={contentRef}>
        {children}
      </div>

      <div
        ref={curtainRef}
        aria-hidden
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          // NOT `bg-black`: globals.css has a global "unboxed theme" rule
          // (`body, main, .site-container, section, .bg-black, .bg-[#000]...`)
          // that force-strips background-color to transparent with
          // `!important` on that exact class, site-wide, on purpose (so
          // "boxed" sections don't cover the animated gradient background).
          // It was silently nuking this curtain's fill too — the whole
          // state machine ran correctly, but the "solid panel" had zero
          // opacity paint, so covering the screen was invisible. Setting
          // the color inline (not via a class in that stripped list) keeps
          // this element outside that rule entirely.
          backgroundColor: "#000",
          opacity: 0,
          visibility: "hidden",
          pointerEvents: "none",
          clipPath: buildStagedCurtainClipPath(0, CURTAIN_SLANT, CURTAIN_SLANT_START),
        }}
      >
        <span
          className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-white"
          style={{ fontFamily: "var(--font-barlow-condensed)" }}
        >
          7th heaven
        </span>
      </div>
    </>
  );
}
