import type { Metadata } from "next";
import { fetchPageContent } from "@/lib/sanity";
import FaqClient from "./FaqClient";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("faq");
  const title =
    sanityContent?.seo?.metaTitle ||
    "Frequently Asked Questions | 7th Heaven Live Band & Shows";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Get answers to common questions about 7th Heaven concert arrival times, booking, merch shipping/pickups, cruise details, and fan membership perks.";
  const canonicalUrl = "https://7thheavenband.com/faq";

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
          alt: "7th Heaven FAQ",
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

const FAQ_SCHEMA_ITEMS = [
  {
    question: "How do I book tickets or hire the band for an event?",
    answer: "Navigate to our Book Us page, fill out the booking request form with your event details (date, venue, and time), and submit it. Our system will immediately trigger an admin alert, and you will receive a status confirmation email once our team reviews the event details.",
  },
  {
    question: "What delivery options are available for merchandise?",
    answer: "We support standard home delivery via our online store and Merch Table Pickup directly at our next live concert.",
  },
  {
    question: "How do I join the 7th Heaven Cruise community?",
    answer: "Visit our Cruise page, select guest count, enter guest contact information, and sign up for cruise email updates.",
  },
  {
    question: "What perks do Fan Members get?",
    answer: "Fan members enjoy exclusive perks including a custom Fan Dashboard, VIP rewards, early access to cruise announcements, proximity notifications for nearby concerts, and raffle entries.",
  },
];

export default async function FAQPage() {
  const sanityContent = await fetchPageContent("faq");

  const faqPageLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SCHEMA_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        id="faq-page-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
      <FaqClient sanityContent={sanityContent} />
    </>
  );
}
