import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Sitemap — 7th Heaven",
  description: "A complete architectural map of the 7th Heaven platform — all pages, APIs, database migrations, and system infrastructure.",
  openGraph: {
    title: "Platform Sitemap — 7th Heaven",
    description: "Complete architectural map of the 7th Heaven platform.",
    type: "website",
    url: "https://7thheavenband.com/sitemap",
    siteName: "7th Heaven",
    images: [{ url: "/images/7thheavenlogo.jpg", width: 1200, height: 630, alt: "7th Heaven" }],
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
