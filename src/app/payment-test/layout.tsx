import { NorthCartProvider } from "@/context/NorthCartContext";

export default function PaymentTestLayout({ children }: { children: React.ReactNode }) {
  return <NorthCartProvider>{children}</NorthCartProvider>;
}
