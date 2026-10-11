import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cruise Passenger Dashboard | 7th Heaven",
  description: "Manage your 7th Heaven rock cruise cabin reservation.",
  robots: { index: false, follow: false },
};

export default function CruiseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
