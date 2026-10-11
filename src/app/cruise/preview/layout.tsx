import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cruise Booking Preview | 7th Heaven",
  description: "Internal preview of cruise booking step variants.",
  robots: { index: false, follow: false },
};

export default function CruisePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
