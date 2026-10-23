"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * The tilted CD shown in the Music Vault banner.
 *
 * It's drawn by the vault's own three.js scene (see disc-test/bannerDisc.ts),
 * so it is literally the same disc — angle, label, lighting and shadow — that
 * flies out when the vault opens. A CSS look-alike shows until the 3D render
 * is ready (three.js loads when the browser is idle).
 *
 * Must be placed inside a `relative` box sized to the disc.
 */
export default function BannerDisc({ image }: { image: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let api: { dispose: () => void } | undefined;
    const start = () => {
      import("@/app/disc-test/bannerDisc")
        .then(({ mountBannerDisc }) => {
          const host = hostRef.current;
          if (cancelled || !host) return;
          // host is 2× the disc (room for the shadow), so the disc is half of it
          api = mountBannerDisc(host, () => host.offsetWidth / 2, () => setReady(true));
        })
        .catch(() => {}); // keep the CSS disc if three.js can't load
    };
    const timer = window.setTimeout(start, 10);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      api?.dispose();
    };
  }, []);

  return (
    <>
      {/* CSS stand-in until the real render is ready: same tilt (three.js Euler
          -0.62, 0.38, 0.28 → CSS flips X and Z) at the vault camera's focal length */}
      <div
        aria-hidden="true"
        className={`relative h-full w-full rounded-full transition-opacity duration-300 [transform:perspective(174vh)_rotateX(0.62rad)_rotateY(0.38rad)_rotateZ(-0.28rad)] ${
          ready ? "opacity-0" : ""
        }`}
      >
        <div className="absolute inset-0 overflow-hidden rounded-full ring-1 ring-inset ring-white/45 [mask-image:radial-gradient(circle_closest-side,transparent_14.6%,#000_15.2%)]">
          <Image src={image} alt="" width={144} height={144} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* the real 3D disc + its shadow (canvas is 2× the disc, centered on it) */}
      <div
        ref={hostRef}
        aria-hidden="true"
        className={`pointer-events-none absolute -inset-1/2 transition-opacity duration-300 [&>canvas]:h-full [&>canvas]:w-full ${
          ready ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}
