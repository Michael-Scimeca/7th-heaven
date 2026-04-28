import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/live";
import { queries, SanityTourDate } from "@/lib/sanity";
import TourMapClient from "./TourMapClient";

export const metadata: Metadata = {
  title: "Tour Map — 7th Heaven | Find a Show Near You",
  description: "Interactive map of all 7th Heaven concert locations — past and upcoming shows across Illinois, the Midwest, and beyond. Find a show near you.",
  keywords: ["7th heaven concerts near me", "7th heaven tour map", "live music map", "Chicago concerts", "Illinois live bands"],
  openGraph: {
    title: "Tour Map — 7th Heaven",
    description: "Find a 7th Heaven show near you on our interactive tour map.",
    type: "website",
    url: "https://7thheavenband.com/tour/map",
  },
};

export default async function TourMapPage() {
  const { data: showsData } = await sanityFetch({ query: queries.allTourDates });
  const shows = (showsData as SanityTourDate[]).map(s => ({
    id: s._id,
    venue: s.venue,
    city: s.city || "",
    state: s.state || "",
    date: s.date || "",
    time: s.time || "",
    ticketLink: s.ticketLink || "",
    directionsLink: s.directionsLink || "",
    isSoldOut: s.isSoldOut || false,
    isFestival: s.isFestival || false,
    notes: s.notes || "",
    lat: s.lat || null,
    lng: s.lng || null,
  }));

  return <TourMapClient shows={shows} />;
}
