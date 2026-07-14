import type { Metadata } from "next";
import { sanityClient, queries, SanityTourDate } from "@/lib/sanity";
import { getShowDateTime } from "@/lib/date-utils";
import TourList from "@/components/TourList";
import { VENUE_LINKS } from "@/lib/venue-links";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tour Dates & Live Shows | 7th Heaven",
  description: "Check out 7th Heaven's upcoming tour dates, outdoor festivals, and unplugged shows. See where we are playing next and RSVP!",
};

const FALLBACK_SHOWS = [
  { 
    day: "Wed", 
    date: "July 1", 
    venue: "Arlington Hts Frontier Days", 
    city: "Arlington Hts", 
    state: "IL", 
    time: "8:00pm", 
    info: "Outdoor All-Age Festival",
    mapUrl: "https://maps.apple.com/?address=Arlington+Heights,+IL",
    websiteUrl: "",
    startDate: "2026-07-01",
    allAges: true
  },
];

export default async function ShowsPage() {
  const showsData = await sanityClient
    .fetch<SanityTourDate[]>(queries.allTourDates, {}, { next: { revalidate: 60, tags: ['sanity:shows'] } })
    .catch(err => {
      console.error("Error fetching shows:", err);
      return [] as SanityTourDate[];
    });

  const formatShowDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate + 'T12:00:00');
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    } catch { return isoDate; }
  };

  const allMappedShows = showsData.map(s => {
    const fb = VENUE_LINKS[s.venue];
    return {
      day: s.day || "TBD",
      date: formatShowDate(s.date),
      venue: s.venue,
      city: s.city || "",
      state: s.state || "",
      time: s.time || "",
      info: s.notes || "",
      mapUrl: s.directionsLink || fb?.mapUrl || "",
      websiteUrl: s.ticketLink || fb?.websiteUrl || "",
      startDate: s.date,
      allAges: s.allAges,
      lat: s.lat,
      lng: s.lng
    };
  });

  const hardcodedUpcoming = FALLBACK_SHOWS.map(f => ({
    ...f,
    websiteUrl: f.websiteUrl || "",
    mapUrl: f.mapUrl || "",
    startDate: f.startDate || "2026-07-01",
    allAges: f.allAges ?? true,
    lat: undefined,
    lng: undefined
  }));

  const combinedShows = [...allMappedShows];
  for (const hc of hardcodedUpcoming) {
    const exists = combinedShows.some(s => s.venue.toLowerCase() === hc.venue.toLowerCase() && s.startDate === hc.startDate);
    if (!exists) {
      combinedShows.push(hc);
    }
  }

  combinedShows.sort((a, b) => {
    const timeA = getShowDateTime(a.startDate, a.date, a.time).getTime();
    const timeB = getShowDateTime(b.startDate, b.date, b.time).getTime();
    return timeA - timeB;
  });

  return (
    <div className="min-h-screen bg-[#08080d] pt-24 pb-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs text-pink-500 font-black uppercase tracking-[0.3em] mb-2">7th Heaven</p>
          <h1 className="text-white font-black text-4xl sm:text-5xl uppercase tracking-widest italic">
            Tour Dates
          </h1>
          <p className="text-white/40 text-sm mt-3 max-w-xl mx-auto">
            Catch 7th Heaven live! See upcoming show locations, venue directions, and RSVP.
          </p>
        </div>
        <TourList initialShows={combinedShows} hideMap={true} />
      </div>
    </div>
  );
}
