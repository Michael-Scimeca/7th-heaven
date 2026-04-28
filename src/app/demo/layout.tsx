import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feature Demo Hub — 7th Heaven",
  description: "Interactive demos of the 7th Heaven fan engagement platform, including proximity show discovery, live streaming, and more.",
  openGraph: {
    title: "Feature Demo Hub — 7th Heaven",
    description: "Interactive demos of 7th Heaven's fan engagement platform.",
    type: "website",
    url: "https://7thheavenband.com/demo",
    siteName: "7th Heaven",
    images: [{ url: "/images/7thheavenlogo.jpg", width: 1200, height: 630, alt: "7th Heaven" }],
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
