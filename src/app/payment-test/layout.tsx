import type { Metadata } from "next";
import { NorthCartProvider } from "@/context/NorthCartContext";

export const metadata: Metadata = {
  title: "Merchant & Payment Portal — 7th Heaven",
  description: "Secure payment processing and inventory verification portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NorthCartProvider>{children}</NorthCartProvider>;
}
