import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Test | 7th Heaven",
  description: "Internal test payment portal.",
  robots: { index: false, follow: false },
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
