"use client";

import {
  useLayoutEffect,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "@/context/TransitionContext";

// ─── Easing ──────────────────────────────────────────────────────────────────
const cubicInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 0.5 * Math.pow(2 * t - 2, 3) + 1;

// ─── Constants ───────────────────────────────────────────────────────────────
const NUM_POINTS     = 10;
const DURATION       = 600;
const DELAY_MAX      = 200;
const DELAY_PER_PATH = 180;
const NUM_PATHS      = 2;
const ANIM_TOTAL     = DURATION + DELAY_PER_PATH * (NUM_PATHS - 1) + DELAY_MAX;

// ─── Path builder ─────────────────────────────────────────────────────────────
function buildPath(points: number[]): string {
  let str = `M 0 ${points[0]}`;
  for (let i = 0; i < NUM_POINTS - 1; i++) {
    const p  = ((i + 1) / (NUM_POINTS - 1)) * 100;
    const cp = p - (100 / (NUM_POINTS - 1)) / 2;
    str += ` C ${cp} ${points[i]} ${cp} ${points[i + 1]} ${p} ${points[i + 1]}`;
  }
  str += ` V 0 H 0`;
  return str;
}

// ─── Page-ready check (Fonts + DOM Text + Images + Double RAF) ─────────────
const MAX_WAIT_MS = 1200;
async function waitForPageReady(): Promise<void> {
  // 1. Wait for custom web fonts (Barlow, Rockstar, Inter, etc.) to fully load
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
      if (document.fonts.status === "loading") {
        await new Promise<void>(resolve => {
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
  return new Promise<void>(resolve => {
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
      const textLength = (target.innerText || target.textContent || "").trim().length;

      // Find visible images that haven't finished loading
      const pendingImages = Array.from(
        document.querySelectorAll<HTMLImageElement>("img")
      ).filter(img => {
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
        pendingImages.forEach(img => {
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
  return <div className="flex-1 flex flex-col">{children}</div>;
}
