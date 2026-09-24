/**
 * Utility function for combining CSS class names dynamically.
 */
export function cn(
  ...classes: (string | number | boolean | undefined | null | unknown)[]
): string {
  return classes.filter(Boolean).map(String).join(" ");
}
