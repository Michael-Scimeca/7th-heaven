import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Cruise Booking | 7th Heaven",
  description: "Verify your email to manage your 7th Heaven cruise reservation.",
  robots: { index: false, follow: false },
};

export default function CruiseVerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="verify-page-standalone">{children}</div>;
}
