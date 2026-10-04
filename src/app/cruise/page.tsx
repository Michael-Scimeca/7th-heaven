import type { Metadata } from "next";
import ReactDOM from "react-dom";
import { fetchPageContent } from "@/lib/sanity";
import CruiseClient from "./CruiseClient";

export async function generateMetadata(): Promise<Metadata> {
  const sanityContent = await fetchPageContent("cruise");
  const title =
    sanityContent?.seo?.metaTitle ||
    "7th Heaven Cruise 2026 | Caribbean Concert Cruise & Fan Trip";
  const description =
    sanityContent?.seo?.metaDescription ||
    "Join 7th Heaven on our annual 7-night Caribbean concert cruise with live shipboard concerts, island beach parties, VIP fan dinners, and exclusive setlists.";
  const canonicalUrl = "https://7thheavenband.com/cruise";

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
          url: "https://7thheavenband.com/images/cruise/hero-video-poster.jpg",
          width: 1200,
          height: 630,
          alt: "7th Heaven Caribbean Concert Cruise",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@7thheavenband",
      title,
      description,
      images: [
        "https://7thheavenband.com/images/cruise/hero-video-poster.jpg",
      ],
    },
  };
}

export const revalidate = 60;

export default async function CruisePage() {
  const sanityContent = await fetchPageContent("cruise");
  const posterUrl =
    sanityContent?.heroPosterUrl || "/images/cruise/hero-video-poster.jpg";

  // Preload LCP hero poster immediately in SSR HTML for zero request discovery delay
  ReactDOM.preload(posterUrl, {
    as: "image",
    fetchPriority: "high",
  });

  const cruiseEventLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "7th Heaven Caribbean Concert Cruise 2026",
    description:
      "Join 7th Heaven on our annual 7-night Caribbean concert cruise featuring onboard live shows, VIP fan events, and beach excursions.",
    startDate: "2026-01-25T12:00:00-05:00",
    endDate: "2026-02-01T12:00:00-05:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Caribbean Cruise Ship",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Miami",
        addressRegion: "FL",
        addressCountry: "US",
      },
    },
    performer: {
      "@type": "MusicGroup",
      name: "7th Heaven",
      url: "https://7thheavenband.com",
    },
    url: "https://7thheavenband.com/cruise",
  };

  return (
    <>
      <script
        id="cruise-event-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(cruiseEventLd)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />
      <CruiseClient sanityContent={sanityContent} />
    </>
  );
}
