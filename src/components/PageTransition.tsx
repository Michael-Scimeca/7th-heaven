"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useTransition } from "@/context/TransitionContext";

/**
 * PageTransition
 * ─────────────────────────────────────────────────────────────────────────
 * Drives the actual route-to-route transition (thibaultguignand.com-style):
 * a black curtain covers the current page, the real Next.js navigation
 * happens while hidden behind it, then the curtain wipes away via
 * `clip-path` — top edge fixed, bottom edge rising — revealing the new
 * page. No scale/zoom on any content; only the curtain's own clip region
 * moves.
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
 *   covered    → waiting for the new page's fonts/images/DOM to actually
 *                be ready (waitForPageReady) before revealing it.
 *   uncovering → curtain wipes away bottom-up, revealing the new page.
 *                Back to "idle" once the wipe finishes.
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
    } catch {}
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
export default function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { mode, setMode, pendingHref, clearPendingHref } = useTransition();
  const contentRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);

  // covering → dim current content, curtain snaps opaque + holds, then the
  // real navigation fires while fully hidden behind it.
  useEffect(() => {
    if (mode !== "covering") return;
    const content = contentRef.current;
    const curtain = curtainRef.current;
    if (!content || !curtain) return;

    const tl = gsap.timeline({
      onComplete: () => {
        if (pendingHref) router.push(pendingHref);
        setMode("covered");
      },
    });

    tl.set(curtain, {
      autoAlpha: 0,
      clipPath: "inset(0% 0% 0% 0%)",
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

  // covered → new page has mounted underneath the (still opaque) curtain;
  // wait until it's actually ready to look at before revealing it.
  useEffect(() => {
    if (mode !== "covered") return;
    let cancelled = false;
    waitForPageReady().then(() => {
      if (!cancelled) setMode("uncovering");
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // uncovering → wipe the curtain away, bottom edge rising, revealing the
  // new page. No scale/zoom on `content` — only the curtain's clip moves.
  useEffect(() => {
    if (mode !== "uncovering") return;
    const content = contentRef.current;
    const curtain = curtainRef.current;
    if (!content || !curtain) return;

    gsap.set(content, { autoAlpha: 1 });
    const tween = gsap.to(curtain, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 1,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(curtain, {
          autoAlpha: 0,
          clipPath: "inset(0% 0% 0% 0%)",
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
      <div ref={contentRef} className="flex-1 flex flex-col">
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
          clipPath: "inset(0% 0% 0% 0%)",
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
