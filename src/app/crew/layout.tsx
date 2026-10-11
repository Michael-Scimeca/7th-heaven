import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crew Portal | 7th Heaven",
  description: "Internal crew operations and raffle pin verification portal.",
  robots: { index: false, follow: false },
};

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
