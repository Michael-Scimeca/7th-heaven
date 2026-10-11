import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slideup Section Animation Demo | 7th Heaven",
  description: "Internal scroll animation prototype.",
  robots: { index: false, follow: false },
};

export default function SlideupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
