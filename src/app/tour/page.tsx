import type { Metadata } from "next";
import TourList from "@/components/TourList";
import ProximityNotify from "@/components/ProximityNotify";
import { isShowOver } from "@/lib/date-utils";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityTourDate } from "@/lib/sanity";
import { VENUE_LINKS } from "@/lib/venue-links";

export const metadata: Metadata = {
  title: "Tour Dates — 7th Heaven | Upcoming Shows & Concerts",
  description: "See all upcoming 7th Heaven live show dates, venues, and ticket info across Chicago, Illinois, and the Midwest. Find a show near you and never miss a performance.",
  keywords: ["7th heaven tour dates", "7th heaven concerts", "live music Chicago", "7th heaven tickets", "Chicago band schedule", "Illinois concerts"],
  openGraph: {
    title: "Tour Dates — 7th Heaven",
    description: "See all upcoming 7th Heaven live show dates across the Midwest.",
    type: "website",
    url: "https://7thheavenband.com/tour",
  },
};

export const revalidate = 60;

export default async function TourPage() {
  let sanityShows: any[] = [];
  try {
    const { data: showsData } = await sanityFetch({ query: queries.allTourDates });
    sanityShows = (showsData as SanityTourDate[]).map(s => {
      // Fallback to hardcoded venue links when Sanity fields are empty
      const fb = VENUE_LINKS[s.venue];
      return {
        _id: s._id,
        day: s.day || "",
        date: s.date ? new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : "TBD",
        venue: s.venue,
        city: s.city || "",
        state: s.state || "",
        time: s.time || "",
        info: s.notes || "",
        mapUrl: s.directionsLink || fb?.mapUrl || "",
        websiteUrl: s.ticketLink || fb?.websiteUrl || "",
        startDate: s.date, // Raw date for JSON-LD
        allAges: s.allAges ?? true,
        lat: s.lat,
        lng: s.lng,
        doorsTime: s.doorsTime || "",
        cover: s.cover || "",
        isSoldOut: s.isSoldOut || false,
        isFestival: s.isFestival || false,
        isPrivate: s.isPrivate || false,
        tags: s.tags || [],
        notes: s.notes || "",
        ticketLink: s.ticketLink || "",
        directionsLink: s.directionsLink || "",
      };
    });
  } catch (err) {
    console.error("Failed to fetch tour dates from Sanity, falling back to local list:", err);
  }

  // JSON-LD Structured Data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": sanityShows.map((show, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "MusicEvent",
        "name": `7th Heaven at ${show.venue}`,
        "startDate": show.startDate,
        "location": {
          "@type": "Place",
          "name": show.venue,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": show.city,
            "addressRegion": show.state,
            "addressCountry": "US"
          }
        },
        "performer": {
          "@type": "MusicGroup",
          "name": "7th Heaven",
          "url": "https://7thheavenband.com"
        },
        "url": show.websiteUrl || "https://7thheavenband.com/tour"
      }
    }))
  };

  const nextShow = sanityShows.find(s => s.city && !isShowOver(s)) || sanityShows.find(s => s.city) || sanityShows[0];

 return (
 <div className="pt-[72px]">
  <script
   type="application/ld+json"
   dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />

  <TourList initialShows={sanityShows} />
  
  <ProximityNotify nextShow={nextShow} />
 </div>
 );
}
