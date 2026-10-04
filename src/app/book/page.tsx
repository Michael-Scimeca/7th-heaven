import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import BookClient from "./BookClient";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("book");
  const title =
    sanityContent?.seo?.metaTitle ||
    "Book 7th Heaven | Live Rock Band for Festivals, Venues & Private Events";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Book 7th Heaven live for festivals, concerts, corporate events, private parties, and acoustic shows. View availability, technical specs, and instant quote requests.";
  const canonicalUrl = "https://7thheavenband.com/book";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "7th Heaven",
      type: "website",
      images: [
        {
          url: "https://7thheavenband.com/images/logos/7thheavenlogo.jpg",
          width: 1200,
          height: 630,
          alt: "Book 7th Heaven Live Rock Band",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@7thheavenband",
      title,
      description,
      images: ["https://7thheavenband.com/images/logos/7thheavenlogo.jpg"],
    },
  };
}

export const revalidate = 60;

export default async function BookPage() {
  const sanityContent = await fetchPageContent("book");

  const bookingServiceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "7th Heaven Live Band Booking",
    serviceType: "Musical Performance / Live Entertainment",
    provider: {
      "@type": "MusicGroup",
      name: "7th Heaven",
      url: "https://7thheavenband.com",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    description:
      "Hire 7th Heaven for festivals, concert venues, corporate celebrations, private events, and weddings.",
    url: "https://7thheavenband.com/book",
  };

  return (
    <>
      <script
        id="booking-service-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bookingServiceLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
      <BookClient sanityContent={sanityContent} />
    </>
  );
}
