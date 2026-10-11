import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aurora Gradient Text Demo | 7th Heaven",
  description: "Internal preview of dynamic animated text shaders.",
  robots: { index: false, follow: false },
};

export default function TextColorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
