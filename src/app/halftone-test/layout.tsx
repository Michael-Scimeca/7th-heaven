import type { Metadata } from "next";
import { HalftoneTransitionProvider } from "@/components/HalftoneTransition/HalftoneTransition";

export const metadata: Metadata = {
  title: "Halftone Transition Test | 7th Heaven",
  description: "Test pages for the Buttermax-style halftone page transition.",
  robots: { index: false, follow: false },
};

export default function HalftoneTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <HalftoneTransitionProvider contentId="halftone-content">
      {/* Content only: no background, so the site's background canvas always shows.
          data-no-text-anim keeps the site-wide text reveal from hiding text mid-capture. */}
      <div id="halftone-content" data-no-text-anim className="relative min-h-[100svh] w-full bg-transparent text-white">
        {children}
      </div>
    </HalftoneTransitionProvider>
  );
}
