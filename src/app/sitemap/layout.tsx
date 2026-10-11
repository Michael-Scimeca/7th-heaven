import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Directory & Architecture | 7th Heaven",
  description: "Internal sitemap navigation and architecture overview.",
  robots: { index: false, follow: false },
};

export default function SitemapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
