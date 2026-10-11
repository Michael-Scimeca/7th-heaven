import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crew Dashboard — Tony | 7th Heaven",
  description: "Internal crew operations dashboard.",
  robots: { index: false, follow: false },
};

export default function CrewTonyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
