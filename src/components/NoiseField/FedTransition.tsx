"use client";

/**
 * Federico Pian–style page transition (motion mode "fed", see lib/motionMode.ts).
 *
 *  1. the page content dissolves: opacity -> 0, blur 14px, scale .985 (0.55s, ease-in)
 *     while the background tweens to the destination's colors
 *  2. the route changes underneath, scroll resets
 *  3. content comes back at rest; <TextTransitions /> reveals headings character by
 *     character in random order out of line masks (styles in noise-field.css)
 *
 * TransitionContext.requestTransition asks handles(href) and hands navigations over,
 * the same way the Halftone transition plugs in. The header stays put, as on the reference.
 */

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FED_ROUTE_EVENT, isFedMotion } from "@/lib/motionMode";

type FedTransitionValue = {
  handles: (href: string) => boolean;
  navigate: (href: string) => Promise<void>;
};

const FedContext = createContext<FedTransitionValue | null>(null);
export const useOptionalFedTransition = () => useContext(FedContext);

const EXIT_MS = 550;
const ROUTE_TIMEOUT_MS = 6000;

const cleanPath = (href: string) => {
  let p = href;
  try {
    if (/^https?:\/\//.test(href)) p = new URL(href).pathname;
  } catch {}
  return p.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
};

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

export function FedTransitionProvider({ children, contentId = "page-content-wrapper" }: { children: ReactNode; contentId?: string }) {
  const router = useRouter();
  const busy = useRef(false);

  const handles = useCallback((href: string) => {
    if (typeof window === "undefined" || !isFedMotion()) return false;
    if (!href.startsWith("/") && !href.startsWith(window.location.origin)) return false;
    const to = cleanPath(href);
    const from = cleanPath(window.location.pathname);
    if (to === from) return false;
    if (to.startsWith("/studio") || from.startsWith("/studio")) return false;
    return true;
  }, []);

  const navigate = useCallback(
    async (href: string) => {
      const target = cleanPath(href);
      const el = document.getElementById(contentId);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.dispatchEvent(new CustomEvent(FED_ROUTE_EVENT, { detail: { path: target } }));
      if (busy.current) return;
      if (!el || reduced) {
        router.push(href);
        return;
      }
      busy.current = true;
      const lenis = (window as unknown as { __lenis?: { scrollTo: (v: number, o?: object) => void } }).__lenis;
      let exit: Animation | null = null;
      let enter: Animation | null = null;
      try {
        try {
          router.prefetch(href);
        } catch {}
        document.documentElement.classList.add("fed-exiting");
        exit = el.animate(
          [
            { opacity: 1, filter: "blur(0px)", transform: "scale(1)" },
            { opacity: 0, filter: "blur(14px)", transform: "scale(0.985)" },
          ],
          { duration: EXIT_MS, easing: "cubic-bezier(0.55, 0.055, 0.675, 0.19)", fill: "forwards" },
        );
        await exit.finished;

        router.push(href, { scroll: false });
        const t0 = performance.now();
        while (cleanPath(window.location.pathname) !== target && performance.now() - t0 < ROUTE_TIMEOUT_MS) {
          await new Promise((r) => setTimeout(r, 30));
        }
        lenis?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo(0, 0);
        // let TextTransitions split the new headings before the content is shown again
        await nextFrame();
        await nextFrame();
        await new Promise((r) => setTimeout(r, 40));

        // Release exit animation and remove fed-exiting class
        exit?.cancel();
        exit = null;
        document.documentElement.classList.remove("fed-exiting");

        // Animate new page blur in
        enter = el.animate(
          [
            { opacity: 0, filter: "blur(16px)", transform: "scale(0.99) translate3d(0, 4px, 0)" },
            { opacity: 1, filter: "blur(0px)", transform: "scale(1) translate3d(0, 0, 0)" },
          ],
          {
            duration: 520,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "forwards",
          },
        );
        await enter.finished;
        enter.cancel();
        enter = null;
      } catch (err) {
        console.error("[FedTransition]", err);
        if (cleanPath(window.location.pathname) !== target) router.push(href);
      } finally {
        exit?.cancel();
        enter?.cancel();
        document.documentElement.classList.remove("fed-exiting");
        busy.current = false;
      }
    },
    [contentId, router],
  );

  const value = useMemo(() => ({ handles, navigate }), [handles, navigate]);
  return <FedContext.Provider value={value}>{children}</FedContext.Provider>;
}
