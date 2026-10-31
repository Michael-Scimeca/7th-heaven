"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTransition } from "@/context/TransitionContext";
import { splitInto, type SplitMode } from "./splitText";
import { isFedMotion } from "@/lib/motionMode";

/* ------------------------------------------------------------------ *
 * Site-wide heading and text animation.
 *
 * Page and section titles (h1 through h6) reveal character by character
 * with a blur sweep; paragraphs and subtitles under titles rise word by word.
 * On page navigation, text blurs and drifts out in sync with the transition.
 * Mounted once in the root layout — individual pages need no changes.
 *
 * Opt a heading out with data-no-text-anim on it or any ancestor.
 * ------------------------------------------------------------------ */

const HEADINGS = "h1, h2, h3, h4, h5, h6";
const DONE = "data-tt";

/** Everything else that should blur up into place as it arrives. */
const BLOCKS = "p, li, article, address, figure, blockquote, picture, img, [data-reveal]";
const BLOCK_DONE = "data-tt-block";

/** Containers whose text must never be rewrapped. */
const BLOCKED = [
  "[data-no-text-anim]",
  "video",
  "#global-bleed-backdrop",
  "#media-vault-bleed-backdrop",
  "[id*='backdrop']",
  ".hoy-ticker",
  ".hoy-ticker-logo",
  ".hoy-ticker-track",
  "table",
  "form",
  "input",
  "textarea",
  "select",
  "button",
  "[role='button']",
  ".btn",
  ".btn-pill-glass",
  ".badge",
  ".mfd-panel",
  ".preloader-overlay",
  ".disc-stage",
  ".sr-only",
  "[aria-hidden='true']",
  "nav",
  "header",
  "footer",
].join(",");

/* fed motion: page titles live in <header class="page-hero">, so only the site header is skipped */
const BLOCKED_FED = BLOCKED.replace(/(^|,)header(,|$)/, "$1header:not(.page-hero)$2");
const blockedSel = () => (isFedMotion() ? BLOCKED_FED : BLOCKED);

const CHAR_STAGGER = 0; // no stagger: every character animates together
const CHAR_DURATION = 400;
const WORD_STAGGER = 0; // no stagger
const WORD_DURATION = 620;
const MAX_CHARS = 90; // very long titles fall back to a word reveal
const FED_CHAR_STAGGER = 0; // fed motion: no stagger, all characters rise together
const FED_CHAR_DURATION = 1050;

function prepare(el: HTMLElement) {
  if (el.hasAttribute(DONE)) return null;
  if (el.closest(blockedSel())) return null;
  const text = (el.textContent ?? "").trim();
  if (!text) return null;

  el.setAttribute(DONE, "");
  // the split spans are decorative; keep one clean string for screen readers
  if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", text);

  const mode: SplitMode = text.length > MAX_CHARS ? "words" : "chars";
  const pieces = splitInto(el, mode);
  if (!pieces.length) return null;

  const stagger = WORD_STAGGER;
  const duration = WORD_DURATION;
  if (mode === "chars" && isFedMotion()) {
    // fed motion: characters rise in random order, like federicopian.com
    const order = pieces.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const each = Math.min(FED_CHAR_STAGGER, 900 / Math.max(1, pieces.length));
    pieces.forEach((p, i) => {
      p.style.animationDelay = `${order[i] * each}ms`;
      p.style.animationDuration = `${FED_CHAR_DURATION}ms`;
    });
  } else {
    pieces.forEach((p, i) => {
      p.style.animationDelay = `${i * stagger}ms`;
      p.style.animationDuration = `${duration}ms`;
    });
  }
  el.classList.add("tt-pending");
  return el;
}

/** The paragraph or subtitle immediately after a heading, if it's short enough to suit. */
function subtextFor(heading: HTMLElement): HTMLElement | null {
  const next = heading.nextElementSibling as HTMLElement | null;
  if (!next) return null;
  // If next element contains complex children (cards, forms, badges, multiple child blocks), it is not a subtext paragraph.
  if (
    next.querySelector(
      "button, a, input, textarea, select, [role='button'], .btn-pill-glass, .badge"
    ) ||
    next.children.length > 1
  ) {
    return null;
  }
  const isTextElement =
    next.tagName === "P" ||
    next.classList.contains("subtext") ||
    (next.tagName === "DIV" && !next.children.length);
  if (!isTextElement) return null;
  const text = (next.textContent ?? "").trim();
  // Only split concise single-line subtext into words; longer paragraphs animate cleanly as whole blocks
  if (!text || text.length > 90) return null;
  if (next.hasAttribute(DONE) || next.closest(blockedSel())) return null;

  next.setAttribute(DONE, "");
  if (!next.getAttribute("aria-label")) next.setAttribute("aria-label", text);
  const pieces = splitInto(next, "words");
  if (!pieces.length) return null;
  pieces.forEach((p) => {
    p.style.animationDelay = "0ms"; // no stagger
    p.style.animationDuration = `${WORD_DURATION}ms`;
  });
  next.classList.add("tt-pending");
  return next;
}

/** Block-level blur-up: no splitting, the whole element eases in. */
function prepareBlock(el: HTMLElement) {
  if (el.hasAttribute(BLOCK_DONE) || el.hasAttribute(DONE)) return null;
  if (el.closest(blockedSel())) return null;
  // skip anything already handled as heading subtext, and tiny/empty nodes
  if (el.tagName === "P" && el.hasAttribute(DONE)) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 24 && r.height < 24) return null;
  // don't animate a child when its parent is already animating
  if (el.parentElement?.closest(`[${BLOCK_DONE}]`)) return null;

  el.setAttribute(BLOCK_DONE, "");
  el.classList.add("tt-block", "tt-pending");
  return el;
}

export default function TextTransitions() {
  const pathname = usePathname();
  const { mode } = useTransition();

  // Sync page exit blur-out with global TransitionContext
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mode === "covering" || mode === "covered") {
      document.body.classList.add("tt-page-exiting");
    } else {
      document.body.classList.remove("tt-page-exiting");
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const reveal = (el: Element) => {
      el.classList.remove("tt-pending");
      el.classList.add("tt-run");
      io.unobserve(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) reveal(e.target);
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );

    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    const track = (el: HTMLElement) => {
      // already on screen: show it straight away, no hidden flash
      if (inView(el)) {
        el.classList.remove("tt-pending");
        el.classList.add("tt-run");
        return;
      }
      io.observe(el);
    };

    let scanning = false;
    const root = () => document.getElementById("page-content-wrapper") ?? document.body;

    const scan = () => {
      if (scanning) return;
      scanning = true;
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(HEADINGS))) {
        const ready = prepare(el);
        if (!ready) continue;
        const sub = subtextFor(ready);
        track(ready);
        if (sub) track(sub);
      }
      for (const el of Array.from(root().querySelectorAll<HTMLElement>(BLOCKS))) {
        const ready = prepareBlock(el);
        if (ready) track(ready);
      }
      scanning = false;
    };

    // first pass after paint, then watch for anything streamed in later
    const raf = requestAnimationFrame(scan);

    let moTimer = 0;
    const mo = new MutationObserver(() => {
      // our own splitting mutates the DOM, so coalesce and never recurse
      if (scanning) return;
      window.clearTimeout(moTimer);
      moTimer = window.setTimeout(scan, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    /* Failsafe: .tt-pending hides text, so nothing may stay pending forever.
       If an observer never fires — an odd scroll container, a hidden parent,
       a browser quirk — show everything rather than leave a blank page. */
    const failsafe = window.setInterval(() => {
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(".tt-pending"))) {
        if (inView(el)) reveal(el);
      }
    }, 1000);
    const hardStop = window.setTimeout(() => {
      for (const el of Array.from(document.querySelectorAll(".tt-pending"))) reveal(el);
    }, 8000);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(moTimer);
      window.clearInterval(failsafe);
      window.clearTimeout(hardStop);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
