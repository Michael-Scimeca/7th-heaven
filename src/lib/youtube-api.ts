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

  window.__ytApiLoading = true;
  window.onYouTubeIframeAPIReady = () => {
    window.__ytApiLoading = false;
    const callbacks = window.__ytApiCallbacks || [];
    window.__ytApiCallbacks = [];
    callbacks.forEach((cb) => cb());
  };

  const injectScript = () => {
    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.head.appendChild(tag);
    }
  };

  // Defer script injection so YouTube's www-player.css is removed from the critical request chain
  if (document.readyState === "complete") {
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(injectScript);
    } else {
      setTimeout(injectScript, 600);
    }
  } else {
    window.addEventListener(
      "load",
      () => {
        if ("requestIdleCallback" in window) {
          (window as any).requestIdleCallback(injectScript);
        } else {
          setTimeout(injectScript, 600);
        }
      },
      { once: true }
    );
  }
}
