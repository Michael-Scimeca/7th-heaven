"use client";

import { useEffect } from "react";

interface PreloaderProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export default function Preloader({ forceShow = false, onComplete }: PreloaderProps = {}) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("preloading");
    }
    if (onComplete) onComplete();
  }, [onComplete]);

  return null;
}
