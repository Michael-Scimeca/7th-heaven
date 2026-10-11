import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Hub | 7th Heaven",
  description: "Internal QR code generator and utility tools.",
  robots: { index: false, follow: false },
};

export default function QRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
