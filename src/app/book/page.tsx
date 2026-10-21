import type { Metadata } from "next";
import {
  fetchPageContent,
  sanityClient,
  queries,
  SanitySiteSettings,
} from "@/lib/sanity";
import { getBookingAvailability } from "@/lib/booking-availability";
import BookClient from "./BookClient";
import { FALLBACK_CONTACTS } from "@/components/ContactDirectorySection";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("book");
  const title =
    sanityContent?.seo?.metaTitle ||
    "Book & Contact 7th Heaven | Live Band Booking & Department Inquiries";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Book 7th Heaven live for festivals, concerts, corporate events, and private parties, or contact band management, technical advance, media, and cruise travel directly.";
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
          url: "https://7thheavenband.com/opengraph-image",
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
      images: ["https://7thheavenband.com/opengraph-image"],
    },
  };
}

export const revalidate = 60;

const MARY_CONTACT = {
  category: "Cruise • Excursions / Hotels & Air",
  company: "NTD Vacations",
  name: "Mary Grivas",
  email: "Mary@NTDVacations.com",
  phone: "877-683-9753 Ext 5",
  note: null,
};

export default async function BookPage() {
  const [sanityContent, availability, contactPageContent, settingsData] =
    await Promise.all([
      fetchPageContent("book"),
      getBookingAvailability(),
      fetchPageContent("contact"),
      sanityClient.fetch<SanitySiteSettings | null>(
        queries.siteSettings,
        {},
        { next: { revalidate: 60, tags: ["sanity:settings"] } },
      ),
    ]);

  const settings = settingsData as SanitySiteSettings | null;
  const baseContacts = contactPageContent?.contacts?.length
    ? contactPageContent.contacts
    : settings?.contacts?.length
      ? settings.contacts
      : FALLBACK_CONTACTS;

  const contacts = [...baseContacts];
  if (
    !contacts.some((c) =>
      c.email?.toLowerCase().includes("mary@ntdvacations.com"),
    )
  ) {
    contacts.push(MARY_CONTACT);
  }

  return (
    <BookClient
      sanityContent={sanityContent}
      initialBlockedDates={availability.blockedDates}
      initialDateDetails={availability.dateDetails}
      contacts={contacts}
    />
  );
}
