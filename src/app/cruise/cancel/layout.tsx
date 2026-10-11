import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancel Cruise Registration | 7th Heaven",
  description: "Cancel your cruise pre-registration.",
  robots: { index: false, follow: false },
};

export default function CruiseCancelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
