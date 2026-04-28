import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merch — 7th Heaven Official Store",
  description: "Shop official 7th Heaven band merchandise — tees, hoodies, vinyl, and more. Ships worldwide.",
  openGraph: {
    title: "Merch — 7th Heaven Official Store",
    description: "Shop official 7th Heaven band merchandise — tees, hoodies, vinyl, and more.",
    type: "website",
    url: "https://7thheavenband.com/merch",
    siteName: "7th Heaven",
    images: [{ url: "/images/7thheavenlogo.jpg", width: 1200, height: 630, alt: "7th Heaven" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
