/**
 * Splits the text inside an element for animation.
 *
 * Only TEXT nodes are touched — element children (images, spans, links that
 * some headings contain) are left exactly where they are, so markup like the
 * home hero, which mixes words and portraits, survives intact.
 */

export type SplitMode = "chars" | "words";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "SVG", "IMG", "VIDEO", "CANVAS"]);

export function splitInto(el: HTMLElement, mode: SplitMode): HTMLElement[] {
  const pieces: HTMLElement[] = [];
  const texts: Text[] = [];

  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        if ((child.textContent ?? "").trim()) texts.push(child as Text);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = (child as HTMLElement).tagName;
        if (!SKIP_TAGS.has(tag)) walk(child);
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
      for (const ch of raw) {
        if (ch === " ") {
          frag.appendChild(document.createTextNode(" "));
          continue;
        }
        const span = document.createElement("span");
        span.className = "tt-char";
        span.textContent = ch;
        frag.appendChild(span);
        pieces.push(span);
      }
    } else {
      // keep leading/trailing spacing so words don't jam together
      const parts = raw.split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
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
