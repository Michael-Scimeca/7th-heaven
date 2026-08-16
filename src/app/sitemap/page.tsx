import React from "react";
import type { Metadata } from "next";
import VisualSitemapClient from "./VisualSitemapClient";

export const metadata: Metadata = {
  title: "Sitemap & Page Directory — 7th Heaven",
  description:
    "Complete interactive sitemap and page directory for 7th Heaven Official Website. Easily explore all public pages, fan portals, cruise dashboards, admin tools, and API endpoints.",
};

export default function SitemapPage() {
  return <VisualSitemapClient />;
}
