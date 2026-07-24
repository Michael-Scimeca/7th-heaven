/**
 * GrainOverlay — fixed film-grain texture that covers the entire site.
 * Pure CSS pseudo-element, pointer-events disabled so it never blocks clicks.
 */
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
