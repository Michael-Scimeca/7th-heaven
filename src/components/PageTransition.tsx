"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [opacity, setOpacity] = useState(1);
  const [displayChildren, setDisplayChildren] = useState<ReactNode>(children);
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      // 1. Fade out current page content smoothly (opacity: 0)
      setOpacity(0);

      const timeout = setTimeout(() => {
        // 2. Swap to new page content & scroll to top
        setDisplayChildren(children);
        window.scrollTo({ top: 0, behavior: "instant" });

        // 3. Fade in new page content smoothly (opacity: 1)
        setOpacity(1);
        prevPathnameRef.current = pathname;
      }, 150);

      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      className="transition-opacity duration-300 ease-in-out w-full flex-grow flex flex-col min-h-[70vh]"
      style={{ opacity }}
    >
      {displayChildren}
    </div>
  );
}
