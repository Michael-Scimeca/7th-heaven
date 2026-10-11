import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies | 7th Heaven",
  description: "Internal project archive and case studies.",
  robots: { index: false, follow: false },
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
