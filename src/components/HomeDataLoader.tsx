"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ensureUpcomingTourDates, isShowOver } from "@/lib/tour-helpers";
import { VENUE_LINKS } from "@/lib/venue-links";

import TourList from "@/components/TourList";
import BioParallaxSlider from "@/components/BioParallaxSlider";
import { fetchTourDatesCached } from "@/lib/tour-fetcher";
import { findShowId } from "@/lib/show-lookup";

interface Show {
  id?: string;
  day: string;
  date: string;
  venue: string;
  city: string;
  state: string;
  time: string;
  info?: string;
  mapUrl?: string;
  websiteUrl?: string;
  startDate: string;
  allAges?: boolean;
  isPrivate?: boolean;
  lat?: number;
  lng?: number;
  _id?: string;
  [key: string]: unknown;
}

interface Announcement {
  isActive: boolean;
  text: string;
  link?: string;
  linkText?: string;
  expiresAt?: string;
}

const FALLBACK_SHOWS: Show[] = [
  {
    "id": "e4b6d9ef-de1f-43e9-ad88-60c9f4f7b628",
    "day": "Fri",
    "date": "October 16",
    "venue": "Sideouts",
    "city": "Island Lake",
    "state": "IL",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=4018%20Roberts%20Rd,%20Island%20Lake,%20IL%2060042",
    "websiteUrl": "https://www.3dsideouts.com/events/7th-heaven/",
    "startDate": "2026-10-16"
  },
  {
    "id": "761ba868-8f3b-457d-ba93-e1118e4b6090",
    "day": "Sat",
    "date": "October 17",
    "venue": "Hollywood Casino",
    "city": "Joliet",
    "state": "IL",
    "time": "",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "",
    "startDate": "2026-10-17"
  },
  {
    "id": "79b3a496-95aa-4ce4-8bc7-1baf3dee12f8",
    "day": "Fri",
    "date": "October 23",
    "venue": "Big Brother - Big Sister",
    "city": "Chicago",
    "state": "IL",
    "time": "8:00pm",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "",
    "startDate": "2026-10-23"
  },
  {
    "id": "41335d4d-98e4-4fa9-9213-abc56a75b365",
    "day": "Sat",
    "date": "October 24",
    "venue": "Tailgaters",
    "city": "Bolingbrook",
    "state": "IL",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444",
    "websiteUrl": "http://www.tailgatersgrill.com",
    "startDate": "2026-10-24"
  },
  {
    "id": "b6276148-d3db-4884-8248-04562b4a8017",
    "day": "Fri",
    "date": "October 30",
    "venue": "Home Bar",
    "city": "Arlington Hts",
    "state": "IL",
    "time": "8:30pm",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "",
    "startDate": "2026-10-30"
  },
  {
    "id": "d4085aa5-72d7-4c75-92f1-3bfda1b675eb",
    "day": "Sat",
    "date": "October 31",
    "venue": "Hard Rock Casino",
    "city": "Gary",
    "state": "IN",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=5400%20W%2029th%20Ave,%20Gary,%20IN%2046406",
    "websiteUrl": "https://www.hardrockcasinonorthernindiana.com",
    "startDate": "2026-10-31"
  },
  {
    "id": "d5775d83-8b88-4406-a313-cf3b695d9380",
    "day": "Fri",
    "date": "November 6",
    "venue": "Stage 119",
    "city": "Elmurst",
    "state": "IL",
    "time": "8:30pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=119%20N%20York%20St,%20Elmhurst,%20IL%2060126",
    "websiteUrl": "https://www.stage-events-elmhurst.com",
    "startDate": "2026-11-06"
  },
  {
    "id": "d9bde537-621e-45ba-ae76-44f2e169af61",
    "day": "Sat",
    "date": "November 7",
    "venue": "Turkey for Tots Christmas Benefit",
    "city": "Bournbonnais",
    "state": "IL",
    "time": "8:00pm",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "",
    "startDate": "2026-11-07"
  },
  {
    "id": "89123874-0070-48aa-a6ec-8128f645a2bf",
    "day": "Sat",
    "date": "November 14",
    "venue": "Old Republic",
    "city": "Elgin",
    "state": "IL",
    "time": "8:30pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd",
    "websiteUrl": "https://www.oldrepublicbar.com",
    "startDate": "2026-11-14"
  },
  {
    "id": "2136a061-9887-4df7-8c8b-f4f8815477e7",
    "day": "Sun",
    "date": "November 15",
    "venue": "Rockin's For Heroes @ Joe's Live",
    "city": "Rosemont",
    "state": "IL",
    "time": "8:30pm",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "",
    "startDate": "2026-11-15"
  },
  {
    "id": "8c984304-c637-4ab9-89e7-2ae6179fefaa",
    "day": "Fri",
    "date": "November 20",
    "venue": "Bannerman's",
    "city": "Bartlett",
    "state": "IL",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=858%20S%20Illinois%20Rte%2059,%20Bartlett,%20IL%2060103",
    "websiteUrl": "https://bannermanssportsgrill.com",
    "startDate": "2026-11-20"
  },
  {
    "id": "b0105114-39cc-4ac1-a70b-76d921c6c700",
    "day": "Sat",
    "date": "November 21",
    "venue": "Jamo's Live",
    "city": "Mokena",
    "state": "IL",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=10160%20191st%20St,%20Mokena,%20IL%2060448",
    "websiteUrl": "https://www.jamoslive.com",
    "startDate": "2026-11-21"
  },
  {
    "id": "8de0a5e0-2e7c-4e3b-8d78-b73fb5775dc0",
    "day": "Sun",
    "date": "November 22",
    "venue": "Broken Oar",
    "city": "P. Barrington",
    "state": "IL",
    "time": "4:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=614%20Rawson%20Bridge%20Rd,%20Barrington,%20IL",
    "websiteUrl": "https://www.brokenoar.com",
    "startDate": "2026-11-22"
  },
  {
    "id": "730415a5-a881-4353-a246-3f25692a526e",
    "day": "Wed",
    "date": "November 25",
    "venue": "Turkey Testicle Festival",
    "city": "Huntley",
    "state": "IL",
    "time": "2:00pm",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "",
    "startDate": "2026-11-25"
  },
  {
    "id": "0caf3390-c662-449a-9f72-bda7968b869d",
    "day": "Sat",
    "date": "November 28",
    "venue": "Basecamp",
    "city": "Lisle",
    "state": "IL",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "",
    "startDate": "2026-11-28"
  },
  {
    "id": "74ba6205-f6d6-4850-89eb-240aa491fc11",
    "day": "Fri",
    "date": "December 4",
    "venue": "Hollywood Casino",
    "city": "Joliet",
    "state": "IL",
    "time": "",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "",
    "startDate": "2026-12-04"
  },
  {
    "id": "4e3544c2-b6a7-4258-bb5e-41668a6d27e0",
    "day": "Sat",
    "date": "December 5",
    "venue": "Private Corporate Event",
    "city": "",
    "state": "IL",
    "time": "",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "",
    "startDate": "2026-12-05"
  },
  {
    "id": "ce4bfe18-a977-4dd1-9871-7517bb7eb864",
    "day": "Sat",
    "date": "December 12",
    "venue": "Sundance Saloon",
    "city": "Mundelein",
    "state": "IL",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803",
    "websiteUrl": "https://www.theoriginalsundancesaloon.com",
    "startDate": "2026-12-12"
  },
  {
    "id": "2404b2bf-b17c-4796-8f1e-30fe7332b8f0",
    "day": "Fri",
    "date": "December 18",
    "venue": "Durty Nellies",
    "city": "Palatine",
    "state": "IL",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=180%20N%20Smith%20St,%20Palatine,%20IL%2060067",
    "websiteUrl": "https://durtynellies.com",
    "startDate": "2026-12-18"
  },
  {
    "id": "4c67979c-627e-45d0-a33d-40b8298af66a",
    "day": "Sat",
    "date": "December 19",
    "venue": "Tailgaters",
    "city": "Bolingbrook",
    "state": "IL",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444",
    "websiteUrl": "http://www.tailgatersgrill.com",
    "startDate": "2026-12-19"
  },
  {
    "id": "178bfbcd-6404-4c08-9aa4-d7000c1f5802",
    "day": "Sat",
    "date": "December 26",
    "venue": "Joe's Live",
    "city": "Rosemont",
    "state": "IL",
    "time": "8:30pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=5441%20Park%20Pl,%20Des%20Plaines,%20IL%2060118",
    "websiteUrl": "https://www.joesliverosemont.com",
    "startDate": "2026-12-26"
  },
  {
    "id": "ddf89a01-9e81-4e7b-90d2-867ef3ce9839",
    "day": "Thu",
    "date": "December 31",
    "venue": "Hard Rock Casino",
    "city": "Rockford",
    "state": "IL",
    "time": "9:00pm",
    "info": "",
    "mapUrl": "https://maps.apple.com/?address=5400%20W%2029th%20Ave,%20Gary,%20IN%2046406",
    "websiteUrl": "https://www.hardrockcasinonorthernindiana.com",
    "startDate": "2026-12-31"
  },
  {
    "id": "6b404202-a48b-4ee0-b901-48c306a56a8b",
    "day": "Sun",
    "date": "January 10",
    "venue": "Chicago Music Cruise",
    "city": "Caribbean",
    "state": "IL",
    "time": "",
    "info": "",
    "mapUrl": "",
    "websiteUrl": "http://www.chicagomusiccruise.com",
    "startDate": "2027-01-10"
  }
];

export default function HomeDataLoader() {
  const [shows, setShows] = useState<Show[]>(() =>
    ensureUpcomingTourDates(FALLBACK_SHOWS),
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchTourDatesCached().then((data) => {
      // /api/tour returns a plain array
      const raw: Record<string, unknown>[] = Array.isArray(data) ? data : [];
        if (raw.length > 0) {
          const mapped: Show[] = raw.map((s) => {
            const venue = s.venue as string;
            const city = (s.city as string) || "";
            const state = (s.state as string) || "";
            const isPrivate = (s.isPrivate as boolean) || false;
            const explicitMap =
              (s.directionsLink as string) || (s.mapUrl as string) || "";
            const fallbackMap =
              VENUE_LINKS[venue]?.mapUrl ||
              (venue && city && !isPrivate
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue} ${city} ${state}`)}`
                : "");
            const mapUrl = explicitMap || fallbackMap;

            const resolvedId =
              (s.id as string | undefined) ||
              findShowId({
                date: s.date as string,
                startDate: (s.startDate || s.date) as string,
                venue,
              });

            return {
              id: resolvedId,
              _id: s._id as string | undefined,
              day: (s.day as string) || "TBD",
              date: s.date as string,
              venue,
              city,
              state,
              time: (s.time as string) || "",
              playTime: (s.playTime as string) || "",
              doorsTime: (s.doorsTime as string) || "",
              info: (s.notes as string) || "",
              mapUrl,
              directionsLink: mapUrl,
              websiteUrl:
                (s.ticketLink as string) || (s.websiteUrl as string) || "",
              parkingInfo: (s.parkingInfo as string) || "",
              parkingUrl: (s.parkingUrl as string) || "",
              startDate: (s.startDate as string) || (s.date as string),
              allAges: s.allAges as boolean | undefined,
              isPrivate,
              lat: s.lat as number | undefined,
              lng: s.lng as number | undefined,
              tags: (s.tags as string[]) || [],
            };
          });
          const ensured = ensureUpcomingTourDates(mapped);
          const upcoming = ensured.filter((s) => !isShowOver(s));
          setShows(upcoming.length > 0 ? upcoming : ensured);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const nextShow = shows.find((s) => s.city && !isShowOver(s)) || shows[0];

  return (
    <>

      {/* ====== TOUR LIST ====== */}

      <TourList initialShows={shows} />

      {/* ====== BAND BIO PARALLAX SLIDER (UNDER TOUR DATES) ====== */}
      <BioParallaxSlider />
    </>
  );
}
