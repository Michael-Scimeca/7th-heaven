import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merch Store — 7th Heaven",
  description: "Shop official 7th Heaven merchandise — t-shirts, hats, CDs, vinyl records, and exclusive tour gear. Powered by Shopify.",
  openGraph: {
    title: "Merch Store — 7th Heaven",
    description: "Official 7th Heaven merchandise — shirts, hats, CDs, and tour exclusives.",
    type: "website",
    url: "https://7thheavenband.com/store",
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
