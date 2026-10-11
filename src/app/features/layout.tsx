import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Features & Specs | 7th Heaven",
  description: "Internal architecture overview and engineering features.",
  robots: { index: false, follow: false },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
