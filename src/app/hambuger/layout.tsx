import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessible Navigation Demo | 7th Heaven",
  description: "Internal accessibility testing for navigation overlay.",
  robots: { index: false, follow: false },
};

export default function HamburgerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
