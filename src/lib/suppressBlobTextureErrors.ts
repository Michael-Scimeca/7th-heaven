/**
 * suppressBlobTextureErrors
 *
 * THREE.js GLTFLoader logs texture load failures via a direct console.error()
 * call inside its own .catch() handler — it does NOT go through
 * THREE.DefaultLoadingManager.onError, so overriding that has no effect.
 *
 * The actual error is:
 *   console.error("THREE.GLTFLoader: Couldn't load texture", blobUrl);
 *
 * These failures happen when a page transition unmounts the Three.js component
 * while GLTFLoader is still asynchronously extracting embedded texture blobs
 * from the .glb file. The load still succeeds from the useGLTF cache on the
 * next render — the error is completely harmless.
 *
 * This utility monkey-patches console.error once to silently swallow only
 * these specific GLTFLoader blob-URL messages. All other errors pass through.
 */

import * as THREE from "three";

let installed = false;

export function suppressBlobTextureErrors() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // ── Approach 1: LoadingManager (covers generic THREE loader errors) ──────
  const mgr = THREE.DefaultLoadingManager;
  const originalOnError = mgr.onError;
  mgr.onError = (url: string) => {
    if (url.startsWith("blob:")) return;
    if (originalOnError) originalOnError(url);
  };

  // ── Approach 2: console.error patch (covers the GLTFLoader direct call) ──
  // GLTFLoader source: console.error("THREE.GLTFLoader: Couldn't load texture", sourceURI)
  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    // Only suppress the exact GLTFLoader blob-URL pattern
    if (
      typeof args[0] === "string" &&
      args[0].includes("THREE.GLTFLoader") &&
      args[0].includes("load texture") &&
      typeof args[1] === "string" &&
      (args[1] as string).startsWith("blob:")
    ) {
      return; // harmless — swallow silently
    }
    originalConsoleError(...args);
  };
}
