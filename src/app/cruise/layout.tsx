import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "7th Heaven Caribbean Cruise — Set Sail With The Band",
  description:
    "Join 7th Heaven on an exclusive fan cruise in the Caribbean. Limited spots available — live performances, meet & greets, and an unforgettable at-sea experience.",
  openGraph: {
    title: "7th Heaven Caribbean Cruise — Set Sail With The Band",
    description:
      "Join 7th Heaven on an exclusive fan cruise. Limited spots — live shows, meet & greets, and Caribbean paradise.",
    type: "website",
    url: "https://7thheavenband.com/cruise",
    siteName: "7th Heaven",
    images: [{ url: "/images/7thheavenlogo.jpg", width: 1200, height: 630, alt: "7th Heaven Cruise" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
