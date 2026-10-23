import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu Icon Test | 7th Heaven",
  description: "Internal test page for sound-wave hamburger icon styles.",
  robots: { index: false, follow: false },
};

export default function HamburgerWavesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
