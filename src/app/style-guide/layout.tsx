import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Component Style Guide & Design System | 7th Heaven",
  description: "Internal design system and component showcase.",
  robots: { index: false, follow: false },
};

export default function StyleGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
