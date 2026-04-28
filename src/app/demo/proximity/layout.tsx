import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proximity Show Discovery Demo — 7th Heaven",
  description:
    "Experience 7th Heaven's proximity-aware fan engagement system. Get GPS-triggered show alerts, RSVP, see who's going, and unlock invite challenges — all from your phone.",
  openGraph: {
    title: "Proximity Show Discovery Demo — 7th Heaven",
    description:
      "GPS-triggered show alerts, RSVP, attendee lists, and invite challenges. See 7th Heaven's fan platform in action.",
    type: "website",
    url: "https://7thheavenband.com/demo/proximity",
    siteName: "7th Heaven",
    images: [{ url: "/images/7thheavenlogo.jpg", width: 1200, height: 630, alt: "7th Heaven" }],
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
