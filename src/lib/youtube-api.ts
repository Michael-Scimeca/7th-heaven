/**
 * youtube-api.ts
 * Loads the YouTube IFrame API script exactly once and queues callbacks
 * so multiple components on the same page can all initialize safely.
 */

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    __ytApiCallbacks: Array<() => void>;
    __ytApiLoading: boolean;
  }
}

export function loadYouTubeAPI(onReady: () => void): void {
  if (typeof window === "undefined") return;

  // Already loaded — fire immediately
  if (window.YT && window.YT.Player) {
    onReady();
    return;
  }

  // Queue this callback
  if (!window.__ytApiCallbacks) {
    window.__ytApiCallbacks = [];
  }
  window.__ytApiCallbacks.push(onReady);

  // Script already loading — just wait in the queue
  if (window.__ytApiLoading) return;

  // First caller — set up the global callback and inject the script
  window.__ytApiLoading = true;
  window.onYouTubeIframeAPIReady = () => {
    window.__ytApiLoading = false;
    const callbacks = window.__ytApiCallbacks || [];
    window.__ytApiCallbacks = [];
    callbacks.forEach((cb) => cb());
  };

  // Deduplicate preconnect link tags to eliminate "Unused preconnect" warnings
  const existingPreconnects = Array.from(document.querySelectorAll('link[rel="preconnect"][href*="ytimg.com"]'));
  if (existingPreconnects.length > 1) {
    existingPreconnects.slice(1).forEach((el) => el.remove());
  }

  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.async = true;
  document.head.appendChild(tag);
}
