import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official 7th Heaven Merch | T-Shirts, Hoodies & Albums",
  description:
    "Shop official 7th Heaven band merchandise: t-shirts, concert hoodies, signed memorabilia, CDs, and concert pickup orders.",
  alternates: {
    canonical: "https://7thheavenband.com/merch",
  },
  openGraph: {
    title: "Official 7th Heaven Merch Store",
    description:
      "Shop official 7th Heaven t-shirts, tour hoodies, drumsticks, and albums with home delivery or concert table pickup.",
    url: "https://7thheavenband.com/merch",
    siteName: "7th Heaven",
    type: "website",
    images: [
      {
        url: "https://7thheavenband.com/images/logos/7thheavenlogo.jpg",
        width: 1200,
        height: 630,
        alt: "7th Heaven Merch Table",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@7thheavenband",
    title: "Official 7th Heaven Merch Store",
    description:
      "Shop official 7th Heaven t-shirts, tour hoodies, drumsticks, and albums.",
    images: ["https://7thheavenband.com/images/logos/7thheavenlogo.jpg"],
  },
};

const MERCH_STORE_LD = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "7th Heaven Merch Store",
  description: "Official online store and concert merch table for 7th Heaven rock band.",
  url: "https://7thheavenband.com/merch",
  parentOrganization: {
    "@type": "MusicGroup",
    name: "7th Heaven",
    url: "https://7thheavenband.com",
  },
};

export default function MerchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        id="merch-store-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(MERCH_STORE_LD)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
      {children}
    </>
  );
}
