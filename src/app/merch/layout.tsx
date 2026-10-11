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
        url: "https://7thheavenband.com/opengraph-image",
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
    images: ["https://7thheavenband.com/opengraph-image"],
  },
};

const MERCH_STORE_LD = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "7th Heaven Merch Store",
  description:
    "Official online store and concert merch table for 7th Heaven rock band.",
  url: "https://7thheavenband.com/merch",
  image: "https://7thheavenband.com/opengraph-image",
  priceRange: "$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Cash, Credit Card, Apple Pay, Google Pay",
  parentOrganization: {
    "@type": "MusicGroup",
    name: "7th Heaven",
    url: "https://7thheavenband.com",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "7th Heaven Official Merch",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Official 7th Heaven Band Logo Tee",
          description:
            "Premium 100% cotton black concert t-shirt featuring the iconic 7th Heaven logo.",
          image: "https://7thheavenband.com/images/merch/logo-tee.png",
          category: "Apparel",
          offers: {
            "@type": "Offer",
            price: "25.00",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: "https://7thheavenband.com/merch",
          },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "7th Heaven Tour Hoodie",
          description:
            "Heavyweight fleece tour hoodie with Midwest tour stops and logo print.",
          image: "https://7thheavenband.com/images/merch/hoodie.png",
          category: "Apparel",
          offers: {
            "@type": "Offer",
            price: "55.00",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: "https://7thheavenband.com/merch",
          },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "7th Heaven Vinyl Record",
          description: "Limited edition 12-inch collector's vinyl record.",
          image: "https://7thheavenband.com/images/merch/vinyl.png",
          category: "Music",
          offers: {
            "@type": "Offer",
            price: "30.00",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: "https://7thheavenband.com/merch",
          },
        },
      },
    ],
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
