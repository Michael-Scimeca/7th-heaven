import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pixel Fireplace Canvas Demo | 7th Heaven",
  description: "Internal canvas experiment with procedural particle fire.",
  robots: { index: false, follow: false },
};

export default function FireCanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
