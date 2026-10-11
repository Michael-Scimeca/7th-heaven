import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Planner Portal | 7th Heaven",
  description: "Internal booking and event scheduling management portal.",
  robots: { index: false, follow: false },
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
