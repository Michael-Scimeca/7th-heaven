import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual Connection Map — 7th Heaven",
  description: "A comprehensive visual map showing every page, dashboard, module, and email template in the 7th Heaven platform and how they all connect together.",
  openGraph: {
    title: "Visual Connection Map — 7th Heaven",
    description: "Full visual architecture map of the 7th Heaven platform.",
    type: "website",
    url: "https://7thheavenband.com/sitemap/visual",
    siteName: "7th Heaven",
    images: [{ url: "/images/7thheavenlogo.jpg", width: 1200, height: 630, alt: "7th Heaven" }],
  },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
