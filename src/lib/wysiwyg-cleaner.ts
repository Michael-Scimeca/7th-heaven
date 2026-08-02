/**
 * Standardized WYSIWYG HTML Sanitizer & Cleaner Pass
 * Always run before saving/posting HTML output from WYSIWYGs.
 */
export function cleanWysiwygHtml(html: string): string {
  if (!html) return '';

  let cleaned = html;

  // 1. Replace all &nbsp; and \u00A0 with standard spaces
  cleaned = cleaned.replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ');

  // 2. Collapse repeated empty <p> chains into nothing
  cleaned = cleaned.replace(/(?:<p>(?:\s|<br\s*\/?>)*<\/p>\s*){2,}/gi, '');

  // 3. Remove single empty <p> tags
  cleaned = cleaned.replace(/<p>(?:\s|<br\s*\/?>)*<\/p>/gi, '');

  // 4. Strip inline color declarations that force black/dark text (e.g. color: black, color: rgb(0, 0, 0), color: #000)
  cleaned = cleaned.replace(/color:\s*(?:black|rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0[^)]*\)|#000000|#000|#111111|#111|#222222|#222|#333333|#333);?/gi, '');
  cleaned = cleaned.replace(/style="\s*"/gi, '');

  // 5. Collapse multiple consecutive spaces into single spaces
  cleaned = cleaned.replace(/  +/g, ' ').trim();

  return cleaned;
}
