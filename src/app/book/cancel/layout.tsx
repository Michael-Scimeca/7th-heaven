import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancel Booking | 7th Heaven",
  description: "Cancel booking request.",
  robots: { index: false, follow: false },
};

export default function BookCancelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
