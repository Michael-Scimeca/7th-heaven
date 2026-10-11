import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crew Dashboard — Michael | 7th Heaven",
  description: "Internal crew operations dashboard.",
  robots: { index: false, follow: false },
};

export default function CrewMichaelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
