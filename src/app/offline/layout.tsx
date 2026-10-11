import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline | 7th Heaven",
  description: "Offline fallback screen.",
  robots: { index: false, follow: false },
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
