/**
 * Splits the text inside an element for animation.
 *
 * Only TEXT nodes are touched — element children (images, spans, links that
 * some headings contain) are left exactly where they are, so markup like the
 * home hero, which mixes words and portraits, survives intact.
 */

export type SplitMode = "chars" | "words";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "SVG", "IMG", "VIDEO", "CANVAS"]);
const SKIP_SELECTORS = [
  "[data-no-text-anim]",
  "button",
  "[role='button']",
  ".btn-pill-glass",
  ".badge",
  "input",
  "textarea",
  "select",
].join(",");

export function splitInto(el: HTMLElement, mode: SplitMode): HTMLElement[] {
  const pieces: HTMLElement[] = [];
  const texts: Text[] = [];

  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        if ((child.textContent ?? "").trim()) texts.push(child as Text);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as HTMLElement;
        const tag = childEl.tagName;
        if (SKIP_TAGS.has(tag)) continue;
        if (childEl.matches?.(SKIP_SELECTORS) || childEl.closest?.(SKIP_SELECTORS)) continue;
        if (childEl.matches?.(".accent-gradient-text, [class*='gradient-text']")) {
          childEl.classList.add(mode === "chars" ? "tt-char" : "tt-word");
          pieces.push(childEl);
          continue;
        }
        walk(child);
      }
    }
  };
  walk(el);

  for (const text of texts) {
    const parent = text.parentNode;
    if (!parent) continue;
    const frag = document.createDocumentFragment();
    const raw = text.textContent ?? "";

    if (mode === "chars") {
      const parts = raw.split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          const space = document.createElement("span");
          space.className = "tt-space";
          space.textContent = part;
          frag.appendChild(space);
          continue;
        }
        const wordWrap = document.createElement("span");
        wordWrap.className = "tt-char-wrap";
        for (const ch of part) {
          const span = document.createElement("span");
          span.className = "tt-char";
          span.textContent = ch;
          wordWrap.appendChild(span);
          pieces.push(span);
        }
        frag.appendChild(wordWrap);
      }
    } else {
      // keep leading/trailing spacing so words don't jam together
      const parts = raw.split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          const space = document.createElement("span");
          space.className = "tt-space";
          space.textContent = part;
          frag.appendChild(space);
          continue;
        }
        const wrap = document.createElement("span");
        wrap.className = "tt-word-wrap";
        const span = document.createElement("span");
        span.className = "tt-word";
        span.textContent = part;
        wrap.appendChild(span);
        frag.appendChild(wrap);
        pieces.push(span);
      }
    }
    parent.replaceChild(frag, text);
  }

  return pieces;
}
