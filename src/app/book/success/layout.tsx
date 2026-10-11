import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Request Received | 7th Heaven",
  description: "Booking request confirmation.",
  robots: { index: false, follow: false },
};

export default function BookSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
