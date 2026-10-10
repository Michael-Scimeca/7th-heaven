import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import { getBookingAvailability } from "@/lib/booking-availability";
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
  const [sanityContent, availability] = await Promise.all([
    fetchPageContent("book"),
    getBookingAvailability(),
  ]);

  return (
    <BookClient
      sanityContent={sanityContent}
      initialBlockedDates={availability.blockedDates}
      initialDateDetails={availability.dateDetails}
    />
  );
}
