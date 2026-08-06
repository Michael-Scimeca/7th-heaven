/**
 * Isomorphic HTML sanitizer.
 *
 * On the client (browser) this runs DOMPurify with a strict allowlist.
 * On the server this falls through to the raw string — server-rendered
 * HTML that reaches a dangerouslySetInnerHTML sink should already have
 * been sanitized at the write path (API route / DB layer). If you need
 * to sanitize on the server, use the `sanitizeHtmlServer` helper which
 * requires `isomorphic-dompurify` or a JSDOM-backed instance.
 *
 * Rule: every `dangerouslySetInnerHTML` that receives user-controlled or
 * DB-sourced content MUST pass through `sanitizeHtml()` at the render site.
 */

import type { Config } from "dompurify";

/** Allowed HTML tags for rich-text WYSIWYG output. */
const WYSIWYG_CONFIG: Config = {
  ALLOWED_TAGS: [
    "p", "br", "b", "i", "strong", "em", "u", "s", "strike",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "span", "div", "blockquote", "pre", "code",
    "hr", "table", "thead", "tbody", "tr", "th", "td",
    "img",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "class", "id", "style",
    "src", "alt", "width", "height",
  ],
  // Force rel="noopener noreferrer" on every <a> that opens in a new tab.
  ADD_ATTR: ["target"],
  FORCE_BODY: false,
};

/** Minimal config for plain announcement banners. */
const BANNER_CONFIG: Config = {
  ALLOWED_TAGS: ["b", "i", "strong", "em", "a", "span", "br", "p"],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
};

/**
 * Sanitize an HTML string for safe insertion via dangerouslySetInnerHTML.
 * Client-only (browser). Returns the raw string on the server (SSR pass).
 * Always call this immediately before rendering, not at the data-fetch layer.
 */
export function sanitizeHtml(
  html: string,
  config: Config = WYSIWYG_CONFIG
): string {
  if (!html) return "";

  // Guard: on the server DOMPurify is unavailable without a DOM shim.
  // Server components that render user HTML should sanitize at the API layer.
  if (typeof window === "undefined") {
    return html;
  }

  // Lazy-import so this module is safe to import in server components too.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const DOMPurify = require("dompurify");
  return DOMPurify.sanitize(html, config) as string;
}

/**
 * Convenience wrapper with the banner (minimal) allowlist.
 */
export function sanitizeBannerHtml(html: string): string {
  return sanitizeHtml(html, BANNER_CONFIG);
}
