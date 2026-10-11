import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim Prize | 7th Heaven",
  description: "Claim your raffle prize from a 7th Heaven concert.",
  robots: { index: false, follow: false },
};

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
