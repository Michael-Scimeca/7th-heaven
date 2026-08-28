"use client";

import { ReactNode, useState, useEffect } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      style={{
        opacity: ready ? 1 : 0,
        transition: "opacity 0.15s ease-out",
        willChange: ready ? "auto" : "opacity",
      }}
    >
      {children}
    </div>
  );
}
