import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flowchart Sitemap | 7th Heaven",
  description: "Professional hierarchical UX sitemap and flow mapping of the 7th Heaven platform.",
};

export default function FlowchartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
