import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preloader Transitions Demo | 7th Heaven",
  description: "Internal preview of site preloader transition effects.",
  robots: { index: false, follow: false },
};

export default function PreloadersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
