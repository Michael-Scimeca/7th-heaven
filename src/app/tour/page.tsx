import type { Metadata } from "next";
import TourList from "@/components/TourList";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityTourDate } from "@/lib/sanity";

export const metadata: Metadata = {
  title: "Tour Dates — 7th Heaven",
  description: "See all upcoming 7th Heaven live show dates, venues, and times.",
};

export default async function TourPage() {
  const { data: showsData } = await sanityFetch({ query: queries.allTourDates });

  const sanityShows = (showsData as SanityTourDate[]).map(s => ({
    day: s.day || "",
    date: s.date ? new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : "TBD",
    venue: s.venue,
    city: s.city || "",
    state: s.state || "",
    time: s.time || "",
    info: s.notes || "",
    mapUrl: s.directionsLink || "",
    websiteUrl: s.ticketLink || "",
    startDate: s.date // Raw date for JSON-LD
  }));

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

 return (
 <div className="pt-[72px]">
  <script
   type="application/ld+json"
   dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
  />
 <section className="pt-28 pb-16 text-center bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]">
 <div className="site-container">
 <span className="inline-block text-[0.75rem] font-semibold tracking-[0.15em] uppercase text-[var(--color-accent)] mb-4 px-6 py-1 border border-[rgba(133,29,239,0.3)] ">On Tour</span>
 <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-tight tracking-tight">
 Tour <span className="gradient-text">Dates</span>
 </h1>
 <p className="text-lg text-[var(--color-text-secondary)] max-w-[600px] mx-auto mt-4">Live in Concert — Check back often for new shows and updates.</p>
 </div>
 </section>

 <TourList initialShows={sanityShows} />




 </div>
 );
}
