"use client";

import { useEffect, useState } from "react";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { useSettings } from "@/lib/useSettings";
import dynamic from "next/dynamic";
import LazySection from "@/components/LazySection";

const TourList = dynamic(() => import("@/components/TourList"));
const BioParallaxSlider = dynamic(() => import("@/components/BioParallaxSlider"));
const ProximityNotify = dynamic(() => import("@/components/ProximityNotify"));

interface Show {
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
  { day: "Fri", date: "January 2", venue: "Station 34", city: "Mt. Prospect", state: "IL", time: "8:30pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/place?address=34%20S%20Main%20St,%20Mount%20Prospect,%20IL%2060056,%20United%20States&coordinate=42.064738,-87.936988&name=34%20S%20Main%20St&map=explore", websiteUrl: "https://stationthirtyfour.com/events/", startDate: "2026-01-02" },
  { day: "Sat", date: "January 3", venue: "Old Republic", city: "Elgin", state: "IL", time: "8:00pm", info: "All Age Outdoor", mapUrl: "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd", websiteUrl: "https://www.oldrepublicbar.com", startDate: "2026-01-03" },
  { day: "Fri", date: "January 9", venue: "Rookies", city: "Hoffman Est.", state: "IL", time: "8:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/place?address=4607%20W%20Higgins%20Rd,%20Hoffman%20Estates,%20IL%2060192,%20United%20States&coordinate=42.074379,-88.191220&name=4607%20W%20Higgins%20Rd", websiteUrl: "https://www.rookiespub.com/hoffmanestates.html", startDate: "2026-01-09" },
  { day: "Sun", date: "January 11", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "2:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com", startDate: "2026-01-11" },
  { day: "Sat", date: "January 17", venue: "Chicago Music Cruise", city: "Miami", state: "FL", time: "", info: "MSC World America", mapUrl: "", websiteUrl: "http://www.chicagomusiccruise.com", startDate: "2026-01-17" },
  { day: "Wed", date: "January 28", venue: "WGN TV News Segment", city: "Chicago", state: "IL", time: "10:00am", info: "TV Appearance", mapUrl: "", websiteUrl: "https://wgntv.com", startDate: "2026-01-28" },
  { day: "Fri", date: "January 30", venue: "Youth Services Fundraiser", city: "Wilmette", state: "IL", time: "7:00pm", info: "Fundraiser - Join Us!", mapUrl: "https://maps.apple.com/?address=1100%20Laramie%20Ave,%20Wilmette,%20IL%2060091", websiteUrl: "https://e.givesmart.com/events/Lk3/", startDate: "2026-01-30" },
  { day: "Sat", date: "January 31", venue: "Des Plaines Theater", city: "Des Plaines", state: "IL", time: "9:00pm", info: "", mapUrl: "https://maps.apple.com/place?address=1476%20Miner%20St,%20Des%20Plaines,%20IL%2060161,%20United%20States&coordinate=42.041800,-87.887154&name=1476%20Miner%20St", websiteUrl: "https://desplainestheatre.com", startDate: "2026-01-31" },
  { day: "Fri", date: "February 6", venue: "Chicago Auto Show First Look", city: "Chicago", state: "IL", time: "7:30pm", info: "Ticketed Gala", mapUrl: "https://maps.apple.com/?address=2301%20S%20Dr%20Martin%20Luther%20King%20Jr,%20Chicago,%20IL%2060616&q=McCormick%20Place", websiteUrl: "https://www.chicagoautoshow.com/first-look-for-charity/", startDate: "2026-02-06" },
  { day: "Sat", date: "February 7", venue: "Hard Rock Casino", city: "Gary", state: "IN", time: "9:00pm", info: "Casino Show", mapUrl: "https://maps.apple.com/?address=5400%20W%2029th%20Ave,%20Gary,%20IN%2046406", websiteUrl: "https://www.hardrockcasinonorthernindiana.com", startDate: "2026-02-07" },
  { day: "Fri", date: "February 13", venue: "Durty Nellies", city: "Palatine", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=180%20N%20Smith%20St,%20Palatine,%20IL%2060067", websiteUrl: "https://durtynellies.com", startDate: "2026-02-13" },
  { day: "Sat", date: "February 14", venue: "Stage 119", city: "Elmhurst", state: "IL", time: "8:30pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=119%20N%20York%20St,%20Elmhurst,%20IL%2060126", websiteUrl: "https://www.stage-events-elmhurst.com", startDate: "2026-02-14" },
  { day: "Fri", date: "February 20", venue: "Jamos Live", city: "Mokena", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=10160%20191st%20St,%20Mokena,%20IL%2060448", websiteUrl: "https://www.jamoslive.com", startDate: "2026-02-20" },
  { day: "Sat", date: "February 21", venue: "Barb's Rescue Gala", city: "Schaumburg", state: "IL", time: "8:30pm", info: "Ticketed Gala", mapUrl: "https://maps.apple.com/?address=401%20N%20Roselle%20Rd,%20Schaumburg,%20IL%2060194", websiteUrl: "https://www.barbsrescue.org", startDate: "2026-02-21" },
  { day: "Fri", date: "February 27", venue: "Evenflow", city: "Geneva", state: "IL", time: "9:30pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=302%20W%20State%20St,%20Geneva,%20IL%2060134", websiteUrl: "https://evenflowmusic.com", startDate: "2026-02-27" },
  { day: "Sat", date: "February 28", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com", startDate: "2026-02-28" },
  { day: "Fri", date: "March 6", venue: "Bannerman's", city: "Bartlett", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=858%20S%20Illinois%20Rte%2059,%20Bartlett,%20IL%2060103", websiteUrl: "https://bannermanssportsgrill.com", startDate: "2026-03-06" },
  { day: "Sat", date: "March 7", venue: "Broken Oar", city: "P. Barrington", state: "IL", time: "9:00pm", info: "", mapUrl: "https://maps.apple.com/?address=614%20Rawson%20Bridge%20Rd,%20Barrington,%20IL", websiteUrl: "https://www.brokenoar.com", startDate: "2026-03-07" },
  { day: "Tue", date: "March 11", venue: "Home Show", city: "Chicago", state: "IL", time: "", info: "McCormick Place", mapUrl: "https://maps.apple.com/place?address=2301%20S%20Indiana%20Ave,%20Chicago,%20IL%2060616&name=McCormick%20Place%20West", websiteUrl: "https://www.theinspiredhomeshow.com/events/", startDate: "2026-03-11" },
  { day: "Sat", date: "March 22", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com", startDate: "2026-03-22" },
  { day: "Fri", date: "March 27", venue: "Tailgaters", city: "Bolingbrook", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444", websiteUrl: "http://www.tailgatersgrill.com", startDate: "2026-03-27" },
  { day: "Sat", date: "March 28", venue: "Old Republic", city: "Elgin", state: "IL", time: "8:00pm", info: "All Age Outdoor", mapUrl: "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd", websiteUrl: "https://www.oldrepublicbar.com", startDate: "2026-03-28" },
  { day: "Fri", date: "April 3", venue: "Rookie's Rockhouse", city: "Hoffman Est.", state: "IL", time: "8:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/place?address=4607%20W%20Higgins%20Rd,%20Hoffman%20Estates,%20IL%2060192,%20United%20States&coordinate=42.074379,-88.191220&name=4607%20W%20Higgins%20Rd", websiteUrl: "https://www.rookiespub.com/hoffmanestates.html", startDate: "2026-04-03" },
  { day: "Sat", date: "April 4", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com", startDate: "2026-04-04" },
  { day: "Fri", date: "April 10", venue: "Corrigan's Pub", city: "Shorewood", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=700%20W%20Jefferson%20St,%20Shorewood,%20IL%2060404", websiteUrl: "https://corriganspub52.com", startDate: "2026-04-10" },
  { day: "Sat", date: "April 11", venue: "Midway Sports", city: "Bartlett", state: "IL", time: "8:30pm", info: "All-Age till 10pm", mapUrl: "https://maps.apple.com/?q=Midway+Sports+Bartlett+IL", websiteUrl: "https://midwaybartlett.com", startDate: "2026-04-11" },
  { day: "Thu", date: "April 17", venue: "Joe's Live", city: "Rosemont", state: "IL", time: "8:00pm", info: "", mapUrl: "https://maps.apple.com/?address=5441%20Park%20Pl,%20Des%20Plaines,%20IL%2060118", websiteUrl: "https://www.joesliverosemont.com", startDate: "2026-04-17" },
  { day: "Fri", date: "April 18", venue: "Stage 119", city: "Elmhurst", state: "IL", time: "8:30pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=119%20N%20York%20St,%20Elmhurst,%20IL%2060126", websiteUrl: "https://www.stage-events-elmhurst.com", startDate: "2026-04-18" },
  { day: "Thu", date: "April 24", venue: "Evenflow", city: "Geneva", state: "IL", time: "9:30pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=302%20W%20State%20St,%20Geneva,%20IL%2060134", websiteUrl: "https://evenflowmusic.com", startDate: "2026-04-24" },
  { day: "Fri", date: "April 25", venue: "Rochaus", city: "West Dundee", state: "IL", time: "9:00pm", info: "", mapUrl: "https://maps.apple.com/?address=96%20W%20Main%20St,%20West%20Dundee,%20IL%2060118", websiteUrl: "https://rochaus.com", startDate: "2026-04-25" },
  { day: "Fri", date: "May 1", venue: "Station 34", city: "Mt. Prospect", state: "IL", time: "8:30pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/place?address=34%20S%20Main%20St,%20Mount%20Prospect,%20IL%2060056,%20United%20States&coordinate=42.064738,-87.936988&name=34%20S%20Main%20St&map=explore", websiteUrl: "https://stationthirtyfour.com/events/", startDate: "2026-05-01" },
  { day: "Sat", date: "May 2", venue: "Deer Park Fest", city: "Deer Park", state: "IL", time: "6:00pm", info: "Outdoor All-Age Festival", mapUrl: "", websiteUrl: "", startDate: "2026-05-02" },
  { day: "Fri", date: "May 8", venue: "Bannerman's", city: "Bartlett", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=858%20S%20Illinois%20Rte%2059,%20Bartlett,%20IL%2060103", websiteUrl: "https://bannermanssportsgrill.com", startDate: "2026-05-08" },
  { day: "Sat", date: "May 9", venue: "Sideouts", city: "Island Lake", state: "IL", time: "9:00pm", info: "Outdoor Beer Garden", mapUrl: "https://maps.apple.com/?address=4018%20Roberts%20Rd,%20Island%20Lake,%20IL%2060042", websiteUrl: "https://www.3dsideouts.com/events/7th-heaven/", startDate: "2026-05-09" },
  { day: "Thu", date: "May 15", venue: "Durty Nellies", city: "Palatine", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=180%20N%20Smith%20St,%20Palatine,%20IL%2060067", websiteUrl: "https://durtynellies.com", startDate: "2026-05-15" },
  { day: "Fri", date: "May 16", venue: "Tailgaters", city: "Bolingbrook", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444", websiteUrl: "http://www.tailgatersgrill.com", startDate: "2026-05-16" },
  { day: "Sat", date: "May 22", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com", startDate: "2026-05-22" },
  { day: "Fri", date: "May 23", venue: "Hard Rock Casino", city: "Rockford", state: "IL", time: "9:00pm", info: "Casino Show", mapUrl: "https://maps.apple.com/?address=7801%20E%20State%20St,%20Rockford,%20IL%2061108", websiteUrl: "https://casino.hardrock.com/rockford/entertainment/upcoming-events/7th-heaven", startDate: "2026-05-23" },
  { day: "Sat", date: "May 24", venue: "Bandito Barney's", city: "East Dundee", state: "IL", time: "9:00pm", info: "Outdoor", mapUrl: "https://maps.apple.com/?address=10%20N%20River%20St,%20East%20Dundee,%20IL%2060118", websiteUrl: "https://www.banditobarneysbeachclub.com", startDate: "2026-05-24" },
  { day: "Thu", date: "May 29", venue: "Will County Beer & Bourbon Fest", city: "Joliet", state: "IL", time: "6:00pm", info: "Festival", mapUrl: "", websiteUrl: "https://habitatwill.org/events/mix-of-26-beyond-beer-bourbon-fest/friday-event-details/", startDate: "2026-05-29" },
  { day: "Fri", date: "May 30", venue: "Old Republic", city: "Elgin", state: "IL", time: "8:00pm", info: "All Age Outdoor", mapUrl: "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd", websiteUrl: "https://www.oldrepublicbar.com", startDate: "2026-05-30" },
  { day: "Wed", date: "July 1", venue: "Arlington Hts Frontier Days", city: "Arlington Hts", state: "IL", time: "8:00pm", info: "Outdoor All-Age Festival", mapUrl: "https://maps.apple.com/?address=Arlington+Heights,+IL", websiteUrl: "", startDate: "2026-07-01" },
];

export default function HomeDataLoader() {
  const [shows, setShows] = useState<Show[]>(FALLBACK_SHOWS);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Shared with Footer (and any other consumer) via useSettings -- one
  // deduplicated /api/settings fetch instead of each component running
  // its own. See src/lib/useSettings.ts for why this exists.
  const { settings } = useSettings();

  useEffect(() => {
    const data = settings as { announcement?: Announcement } | null;
    if (data?.announcement?.isActive && data.announcement.text) {
      const exp = data.announcement.expiresAt;
      if (!exp || new Date(exp)> new Date()) {
        setAnnouncement(data.announcement);
      }
    }
  }, [settings]);

  useEffect(() => {
    // eslint-disable-next-line react-doctor/no-fetch-in-effect
    // Intentional: page is fully static, this effect hydrates data client-side after first paint
    fetch("/api/tour")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        // /api/tour returns a plain array
        const raw: Record<string, unknown>[] = Array.isArray(data) ? data : [];
        if (raw.length> 0) {
          const now = new Date();
          const mapped: Show[] = raw.map(s => ({
            day: (s.day as string) || "TBD",
            date: s.date as string,
            venue: s.venue as string,
            city: (s.city as string) || "",
            state: (s.state as string) || "",
            time: (s.time as string) || "",
            info: (s.notes as string) || "",
            mapUrl: (s.directionsLink as string) || "",
            websiteUrl: (s.ticketLink as string) || "",
            startDate: s.date as string,
            allAges: s.allAges as boolean | undefined,
            isPrivate: (s.isPrivate as boolean) || false,
            lat: s.lat as number | undefined,
            lng: s.lng as number | undefined,
          }));
          // Filter to upcoming shows
          const upcoming = mapped.filter(s => {
            try {
              const d = new Date((s.startDate || s.date) + "T23:59:59");
              return d>= now;
            } catch { return true; }
          });
          setShows(upcoming.length> 0 ? upcoming : mapped);
        }
      })
      .catch(() => { })
      .finally(() => setLoaded(true));
  }, []);

  const nextShow = shows.find(s => s.city) || shows[0];

  return (
    <>
      {announcement && (
        <AnnouncementBanner
          text={announcement.text}
          link={announcement.link}
          linkText={announcement.linkText}
          inline={true}
        />
      )}

      {/* ====== TOUR LIST ====== */}
      <section id="tour" className="bg-transparent pb-section-fluid relative z-10">
        <TourList initialShows={shows} />
      </section>

      {/* ====== BAND BIO PARALLAX SLIDER (UNDER TOUR DATES, ABOVE NOTIFICATIONS) ====== */}
      <section id="band" className="relative w-full bg-transparent overflow-hidden sm:mb-16">
        <BioParallaxSlider />
      </section>

      {/* ====== PROXIMITY NOTIFY ====== */}

      <ProximityNotify nextShow={nextShow} />

    </>
  );
}
