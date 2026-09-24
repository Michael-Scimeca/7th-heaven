/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  X,
  MessageSquare,
  Edit,
  Mic,
  MapPin,
  CalendarDays,
  Bell,
  Mail,
  ParkingCircle,
  ParkingSquare,
  Search,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CarIcon from "./CarIcon";
import LocationPinIcon from "./LocationPinIcon";
import { SanityTourDate } from "@/lib/sanity";
import Script from "next/script";
import dynamic from "next/dynamic";
const TourMap = dynamic(() => import("./TourMap"), { ssr: false });
import {
  isShowOver,
  typeConfig,
  getShowType,
  getShowDateTime,
  ensureUpcomingTourDates,
  generateTourEventSchema,
} from "@/lib/tour-helpers";
import CountdownTimer from "./CountdownTimer";
import { useMember } from "@/context/MemberContext";
const GooeyMessagesDropdown = dynamic(
  () => import("@/components/GooeyMessagesDropdown"),
  { ssr: false },
);
import { SquishyToggle } from "@/components/SquishyToggle";
import LazySection from "@/components/LazySection";
import SeventhButton from "@/components/SeventhButton";
import { SectionBadge } from "@/components/SectionBadge";
import AddCmsButton from "./AddCmsButton";
import { VENUE_LINKS } from "@/lib/venue-links";

// ─── Wavy canvas divider ─────────────────────────────────────────────────────
function WavyRowDivider({ active }: { seed?: number; active?: boolean }) {
  return (
    <div
      className={`h-[1px] w-full transition-colors duration-300 ${active ? "bg-gradient-to-r from-transparent via-purple-500 to-transparent" : "bg-white/10"}`}
      aria-hidden="true"
    />
  );
}

function getEffectiveMapUrl(show: any): string | null {
  if (show?.isPrivate) return null;
  if (show?.mapUrl && typeof show.mapUrl === "string" && show.mapUrl.trim())
    return show.mapUrl;
  if (
    show?.directionsLink &&
    typeof show.directionsLink === "string" &&
    show.directionsLink.trim()
  )
    return show.directionsLink;
  if (show?.venue && VENUE_LINKS[show.venue]?.mapUrl)
    return VENUE_LINKS[show.venue].mapUrl;
  if (show?.venue && show?.city) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city} ${show.state || ""}`)}`;
  }
  return null;
}
// ─────────────────────────────────────────────────────────────────────────────

const shows = [
  {
    day: "Fri",
    date: "January 2",
    venue: "Station 34",
    city: "Mt. Prospect",
    state: "IL",
    time: "8:30pm",
    info: "F.A.N. Show - Unplugged",
    mapUrl:
      "https://maps.apple.com/place?address=34%20S%20Main%20St,%20Mount%20Prospect,%20IL%2060056,%20United%20States&coordinate=42.064738,-87.936988&name=34%20S%20Main%20St&map=explore",
    websiteUrl: "https://stationthirtyfour.com/events/",
  },
  {
    day: "Sat",
    date: "January 3",
    venue: "Old Republic",
    city: "Elgin",
    state: "IL",
    time: "8:00pm",
    info: "All Age Outdoor",
    mapUrl:
      "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd",
    websiteUrl: "https://www.oldrepublicbar.com",
  },
  {
    day: "Fri",
    date: "January 9",
    venue: "Rookies",
    city: "Hoffman Est.",
    state: "IL",
    time: "8:00pm",
    info: "F.A.N. Show - Unplugged",
    mapUrl:
      "https://maps.apple.com/place?address=4607%20W%20Higgins%20Rd,%20Hoffman%20Estates,%20IL%2060192,%20United%20States&coordinate=42.074379,-88.191220&name=4607%20W%20Higgins%20Rd",
    websiteUrl: "https://www.rookiespub.com/hoffmanestates.html",
  },
  {
    day: "Sat",
    date: "January 10",
    venue: "Private Event",
    city: "",
    state: "",
    time: "",
    info: "",
    mapUrl: "",
    websiteUrl: "",
  },
  {
    day: "Sun",
    date: "January 11",
    venue: "Sundance Saloon",
    city: "Mundelein",
    state: "IL",
    time: "2:00pm",
    info: "F.A.N. Show - Unplugged",
    mapUrl:
      "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803",
    websiteUrl: "https://www.theoriginalsundancesaloon.com",
  },
  {
    day: "Sat",
    date: "January 17",
    venue: "Chicago Music Cruise",
    city: "Miami",
    state: "FL",
    time: "",
    info: "MSC World America",
    mapUrl: "",
    websiteUrl: "http://www.chicagomusiccruise.com",
  },
  {
    day: "Wed",
    date: "January 28",
    venue: "WGN TV News Segment",
    city: "Chicago",
    state: "IL",
    time: "10:00am",
    info: "TV Appearance",
    mapUrl: "",
    websiteUrl: "https://wgntv.com",
  },
  {
    day: "Fri",
    date: "January 30",
    venue: "Youth Services Fundraiser",
    city: "Wilmette",
    state: "IL",
    time: "7:00pm",
    info: "Fundraiser - Join Us!",
    mapUrl:
      "https://maps.apple.com/?address=1100%20Laramie%20Ave,%20Wilmette,%20IL%2060091",
    websiteUrl: "https://e.givesmart.com/events/Lk3/",
  },
  {
    day: "Sat",
    date: "January 31",
    venue: "Des Plaines Theater",
    city: "Des Plaines",
    state: "IL",
    time: "9:00pm",
    info: "",
    mapUrl:
      "https://maps.apple.com/place?address=1476%20Miner%20St,%20Des%20Plaines,%20IL%2060161,%20United%20States&coordinate=42.041800,-87.887154&name=1476%20Miner%20St",
    websiteUrl: "https://desplainestheatre.com",
  },
  {
    day: "Fri",
    date: "February 6",
    venue: "Chicago Auto Show First Look",
    city: "Chicago",
    state: "IL",
    time: "7:30pm",
    info: "Ticketed Gala",
    mapUrl:
      "https://maps.apple.com/?address=2301%20S%20Dr%20Martin%20Luther%20King%20Jr,%20Chicago,%20IL%2060616&q=McCormick%20Place",
    websiteUrl: "https://www.chicagoautoshow.com/first-look-for-charity/",
  },
  {
    day: "Sat",
    date: "February 7",
    venue: "Hard Rock Casino",
    city: "Gary",
    state: "IN",
    time: "9:00pm",
    info: "Casino Show",
    mapUrl:
      "https://maps.apple.com/?address=5400%20W%2029th%20Ave,%20Gary,%20IN%2046406",
    websiteUrl: "https://www.hardrockcasinonorthernindiana.com",
  },
  {
    day: "Fri",
    date: "February 13",
    venue: "Durty Nellies",
    city: "Palatine",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=180%20N%20Smith%20St,%20Palatine,%20IL%2060067",
    websiteUrl: "https://durtynellies.com",
  },
  {
    day: "Sat",
    date: "February 14",
    venue: "Stage 119",
    city: "Elmhurst",
    state: "IL",
    time: "8:30pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=119%20N%20York%20St,%20Elmhurst,%20IL%2060126",
    websiteUrl: "https://www.stage-events-elmhurst.com",
  },
  {
    day: "Fri",
    date: "February 20",
    venue: "Jamos Live",
    city: "Mokena",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=10160%20191st%20St,%20Mokena,%20IL%2060448",
    websiteUrl: "https://www.jamoslive.com",
  },
  {
    day: "Sat",
    date: "February 21",
    venue: "Barb's Rescue Gala",
    city: "Schaumburg",
    state: "IL",
    time: "8:30pm",
    info: "Ticketed Gala",
    mapUrl:
      "https://maps.apple.com/?address=401%20N%20Roselle%20Rd,%20Schaumburg,%20IL%2060194",
    websiteUrl: "https://www.barbsrescue.org",
  },
  {
    day: "Fri",
    date: "February 27",
    venue: "Evenflow",
    city: "Geneva",
    state: "IL",
    time: "9:30pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=302%20W%20State%20St,%20Geneva,%20IL%2060134",
    websiteUrl: "https://evenflowmusic.com",
  },
  {
    day: "Sat",
    date: "February 28",
    venue: "Sundance Saloon",
    city: "Mundelein",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803",
    websiteUrl: "https://www.theoriginalsundancesaloon.com",
  },
  {
    day: "Fri",
    date: "March 6",
    venue: "Bannerman's",
    city: "Bartlett",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=858%20S%20Illinois%20Rte%2059,%20Bartlett,%20IL%2060103",
    websiteUrl: "https://bannermanssportsgrill.com",
  },
  {
    day: "Sat",
    date: "March 7",
    venue: "Broken Oar",
    city: "P. Barrington",
    state: "IL",
    time: "9:00pm",
    info: "",
    mapUrl:
      "https://maps.apple.com/?address=614%20Rawson%20Bridge%20Rd,%20Barrington,%20IL",
    websiteUrl: "https://www.brokenoar.com",
  },
  {
    day: "Tue",
    date: "March 11",
    venue: "Home Show",
    city: "Chicago",
    state: "IL",
    time: "",
    info: "McCormick Place",
    mapUrl:
      "https://maps.apple.com/place?address=2301%20S%20Indiana%20Ave,%20Chicago,%20IL%2060616&name=McCormick%20Place%20West",
    websiteUrl: "https://www.theinspiredhomeshow.com/events/",
  },
  {
    day: "Sat",
    date: "March 22",
    venue: "Sundance Saloon",
    city: "Mundelein",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803",
    websiteUrl: "https://www.theoriginalsundancesaloon.com",
  },
  {
    day: "Fri",
    date: "March 27",
    venue: "Tailgaters",
    city: "Bolingbrook",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444",
    websiteUrl: "http://www.tailgatersgrill.com",
  },
  {
    day: "Sat",
    date: "March 28",
    venue: "Old Republic",
    city: "Elgin",
    state: "IL",
    time: "8:00pm",
    info: "All Age Outdoor",
    mapUrl:
      "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd",
    websiteUrl: "https://www.oldrepublicbar.com",
  },
  {
    day: "Fri",
    date: "April 3",
    venue: "Rookie's Rockhouse",
    city: "Hoffman Est.",
    state: "IL",
    time: "8:00pm",
    info: "F.A.N. Show - Unplugged",
    mapUrl:
      "https://maps.apple.com/place?address=4607%20W%20Higgins%20Rd,%20Hoffman%20Estates,%20IL%2060192,%20United%20States&coordinate=42.074379,-88.191220&name=4607%20W%20Higgins%20Rd",
    websiteUrl: "https://www.rookiespub.com/hoffmanestates.html",
  },
  {
    day: "Sat",
    date: "April 4",
    venue: "Sundance Saloon",
    city: "Mundelein",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803",
    websiteUrl: "https://www.theoriginalsundancesaloon.com",
  },
  {
    day: "Fri",
    date: "April 10",
    venue: "Corrigan's Pub",
    city: "Shorewood",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=700%20W%20Jefferson%20St,%20Shorewood,%20IL%2060404",
    websiteUrl: "https://corriganspub52.com",
  },
  {
    day: "Sat",
    date: "April 11",
    venue: "Midway Sports",
    city: "Bartlett",
    state: "IL",
    time: "8:30pm",
    info: "All-Age till 10pm",
    mapUrl: "https://maps.apple.com/?q=Midway+Sports+Bartlett+IL",
    websiteUrl: "https://midwaybartlett.com",
  },
  {
    day: "Thu",
    date: "April 17",
    venue: "Joe's Live",
    city: "Rosemont",
    state: "IL",
    time: "8:00pm",
    info: "",
    mapUrl:
      "https://maps.apple.com/?address=5441%20Park%20Pl,%20Des%20Plaines,%20IL%2060118",
    websiteUrl: "https://www.joesliverosemont.com",
  },
  {
    day: "Fri",
    date: "April 18",
    venue: "Stage 119",
    city: "Elmhurst",
    state: "IL",
    time: "8:30pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=119%20N%20York%20St,%20Elmhurst,%20IL%2060126",
    websiteUrl: "https://www.stage-events-elmhurst.com",
  },
  {
    day: "Thu",
    date: "April 24",
    venue: "Evenflow",
    city: "Geneva",
    state: "IL",
    time: "9:30pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=302%20W%20State%20St,%20Geneva,%20IL%2060134",
    websiteUrl: "https://evenflowmusic.com",
  },
  {
    day: "Fri",
    date: "April 25",
    venue: "Rochaus",
    city: "West Dundee",
    state: "IL",
    time: "9:00pm",
    info: "",
    mapUrl:
      "https://maps.apple.com/?address=96%20W%20Main%20St,%20West%20Dundee,%20IL%2060118",
    websiteUrl: "https://rochaus.com",
  },
  {
    day: "Fri",
    date: "May 1",
    venue: "Station 34",
    city: "Mt. Prospect",
    state: "IL",
    time: "8:30pm",
    info: "F.A.N. Show - Unplugged",
    mapUrl:
      "https://maps.apple.com/place?address=34%20S%20Main%20St,%20Mount%20Prospect,%20IL%2060056,%20United%20States&coordinate=42.064738,-87.936988&name=34%20S%20Main%20St&map=explore",
    websiteUrl: "https://stationthirtyfour.com/events/",
  },
  {
    day: "Sat",
    date: "May 2",
    venue: "Deer Park Fest",
    city: "Deer Park",
    state: "IL",
    time: "6:00pm",
    info: "Outdoor All-Age Festival",
    mapUrl: "",
    websiteUrl: "",
  },
  {
    day: "Fri",
    date: "May 8",
    venue: "Bannerman's",
    city: "Bartlett",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=858%20S%20Illinois%20Rte%2059,%20Bartlett,%20IL%2060103",
    websiteUrl: "https://bannermanssportsgrill.com",
  },
  {
    day: "Sat",
    date: "May 9",
    venue: "Sideouts",
    city: "Island Lake",
    state: "IL",
    time: "9:00pm",
    info: "Outdoor Beer Garden",
    mapUrl:
      "https://maps.apple.com/?address=4018%20Roberts%20Rd,%20Island%20Lake,%20IL%2060042",
    websiteUrl: "https://www.3dsideouts.com/events/7th-heaven/",
  },
  {
    day: "Thu",
    date: "May 15",
    venue: "Durty Nellies",
    city: "Palatine",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=180%20N%20Smith%20St,%20Palatine,%20IL%2060067",
    websiteUrl: "https://durtynellies.com",
  },
  {
    day: "Fri",
    date: "May 16",
    venue: "Tailgaters",
    city: "Bolingbrook",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444",
    websiteUrl: "http://www.tailgatersgrill.com",
  },
  {
    day: "Sat",
    date: "May 22",
    venue: "Sundance Saloon",
    city: "Mundelein",
    state: "IL",
    time: "9:00pm",
    info: "21 & Over",
    mapUrl:
      "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803",
    websiteUrl: "https://www.theoriginalsundancesaloon.com",
  },
  {
    day: "Fri",
    date: "May 23",
    venue: "Hard Rock Casino",
    city: "Rockford",
    state: "IL",
    time: "9:00pm",
    info: "Casino Show",
    mapUrl:
      "https://maps.apple.com/?address=7801%20E%20State%20St,%20Rockford,%20IL%2061108",
    websiteUrl:
      "https://casino.hardrock.com/rockford/entertainment/upcoming-events/7th-heaven",
  },
  {
    day: "Sat",
    date: "May 24",
    venue: "Bandito Barney's",
    city: "East Dundee",
    state: "IL",
    time: "9:00pm",
    info: "Outdoor",
    mapUrl:
      "https://maps.apple.com/?address=10%20N%20River%20St,%20East%20Dundee,%20IL%2060118",
    websiteUrl: "https://www.banditobarneysbeachclub.com",
  },
  {
    day: "Thu",
    date: "May 29",
    venue: "Will County Beer & Bourbon Fest",
    city: "Joliet",
    state: "IL",
    time: "6:00pm",
    info: "Festival",
    mapUrl: "",
    websiteUrl:
      "https://habitatwill.org/events/mix-of-26-beyond-beer-bourbon-fest/friday-event-details/",
  },
  {
    day: "Fri",
    date: "May 30",
    venue: "Old Republic",
    city: "Elgin",
    state: "IL",
    time: "8:00pm",
    info: "All Age Outdoor",
    mapUrl:
      "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd",
    websiteUrl: "https://www.oldrepublicbar.com",
  },
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
  },
];

// --- Helper functions ---
function getShowTags(show: any): string[] {
  const info = show.info || "";
  const lower = info.toLowerCase();
  const rawTags = show.tags || [];
  const hasTag = (t: string) =>
    rawTags.map((x: string) => x.toLowerCase()).includes(t.toLowerCase());

  const tags: string[] = [];
  if (lower.includes("unplugged") || hasTag("unplugged"))
    tags.push("Unplugged");
  if (
    lower.includes("outdoor") ||
    lower.includes("beer garden") ||
    hasTag("outdoor")
  )
    tags.push("Outdoor");
  if (
    lower.includes("21 &") ||
    lower.includes("21+") ||
    show.allAges === false ||
    hasTag("21+")
  )
    tags.push("21+");
  if (
    lower.includes("all age") ||
    lower.includes("all-age") ||
    show.allAges === true ||
    hasTag("all ages") ||
    hasTag("all-ages")
  )
    tags.push("All Ages");
  if (
    lower.includes("gala") ||
    lower.includes("fundraiser") ||
    lower.includes("festival") ||
    lower.includes("casino") ||
    lower.includes("cruise") ||
    lower.includes("tv appearance") ||
    hasTag("festival") ||
    hasTag("special") ||
    hasTag("gala") ||
    hasTag("fundraiser") ||
    hasTag("casino") ||
    hasTag("cruise") ||
    hasTag("tv appearance")
  ) {
    tags.push("Special Event");
  }
  return tags;
}

function getShowIcon(show: any): string {
  return "";
}

function getShowDisplayTimes(show: any) {
  const doorsTime =
    typeof show?.doorsTime === "string" ? show.doorsTime.trim() : "";
  const playTime =
    typeof show?.playTime === "string" ? show.playTime.trim() : "";
  let time = typeof show?.time === "string" ? show.time.trim() : "";

  if (!doorsTime && !playTime && !time) {
    const text = `${show?.info || ""} ${show?.notes || ""}`;
    const match = text.match(
      /\b\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.))?/i,
    );
    if (match) {
      time = match[0];
    }
  }

  return { doorsTime, playTime, time };
}

const typeOptions = [
  "Unplugged",
  "Outdoor",
  "21+",
  "All Ages",
  "Special Event",
];

// Shared dropdown styles
const selectClass =
  "appearance-none    border-0 rounded-lg pl-4 pr-8 py-2.5 text-[0.5rem]        cursor-pointer transition-all duration-200 focus:outline-none";
const activeSelect =
  "!border-[var(--color-accent)] ! text-[var(--color-accent)]";

function getGoogleCalendarUrl(show: any) {
  const start = getShowDateTime(show.startDate, show.date, show.time);
  if (start.getHours() === 23 && start.getMinutes() === 59) {
    start.setHours(20, 0, 0, 0); // Default to 8:00 PM if no time set
  }
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const title = `7th Heaven at ${show.venue}`;
  const details = `Catch 7th Heaven live!\nShow Info: ${show.info || ""}\nMore details: ${show.websiteUrl || "https://www.7thheavenband.com/tour"}`;
  const location = show.city
    ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}`
    : show.venue;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCalDate(start)}/${formatGCalDate(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

function getICSFileUrl(show: any) {
  const start = getShowDateTime(show.startDate, show.date, show.time);
  if (start.getHours() === 23 && start.getMinutes() === 59) {
    start.setHours(20, 0, 0, 0); // Default to 8:00 PM if no time set
  }
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const title = `7th Heaven at ${show.venue}`;
  const details = `Catch 7th Heaven live!\\nShow Info: ${show.info || ""}\\nMore details: ${show.websiteUrl || "https://www.7thheavenband.com/tour"}`;
  const location = show.city
    ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}`
    : show.venue;

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//7th Heaven//Tour Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}-${encodeURIComponent(show.venue)}@7thheavenband.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsLines.join("\r\n"))}`;
}

interface TourListProps {
  initialShows?: any[];
  hideMap?: boolean;
  maxShows?: number;
}

export default function TourList({
  initialShows,
  hideMap,
  maxShows,
}: TourListProps) {
  const { member, isLoggedIn, openModal } = useMember();
  const isAdmin = Boolean(
    isLoggedIn &&
    (member?.role === "admin" ||
      member?.role === "crew" ||
      (member as any)?.isAdmin === true),
  );
  const todayStartTimestamp = useSyncExternalStore(
    () => () => {},
    () => {
      const now = new Date();
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
    },
    () => 0,
  );
  const isFan = !member || member.role === "fan";
  const [showPastShows, setShowPastShows] = useState(false);
  const [activeMonth, setActiveMonth] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [activeCity, setActiveCity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const [activeCalDropdownId, setActiveCalDropdownId] = useState<string | null>(
    null,
  );
  const [isSortBarStuck, setIsSortBarStuck] = useState(false);
  const [sortBarOpacity, setSortBarOpacity] = useState(1);

  // Subscribed show IDs for custom specific notifications
  const [subscribedShowIds, setSubscribedShowIds] = useState<string[]>([]);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  // Notification popup state
  const [notifyPopupShow, setNotifyPopupShow] = useState<any>(null);
  const [notifyEmail, setNotifyEmail] = useState("");

  // ── Tour List Font & Layout Customizer states ──
  const [tourFontSize, setTourFontSize] = useState("15px");
  const [tourFontFamily, setTourFontFamily] = useState("var(--font-body)");
  const [tourRowPadding, setTourRowPadding] = useState("4px");
  const [tourRowGap, setTourRowGap] = useState("0px");
  const [tourRowHeight, setTourRowHeight] = useState("40px");
  const [websiteBtnFontSize, setWebsiteBtnFontSize] = useState("12px");
  const [isFontCustomizerOpen, setIsFontCustomizerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Map Mask Fade Control States ──
  const [mapMaskEnabled, setMapMaskEnabled] = useState(true);
  const [mapMaskTop, setMapMaskTop] = useState(50); // px
  const [mapMaskBottom, setMapMaskBottom] = useState(50); // px
  const [mapMaskLeft, setMapMaskLeft] = useState(50); // px
  const [mapMaskRight, setMapMaskRight] = useState(50); // px

  // Load font, layout & map mask settings from localStorage on mount
  useEffect(() => {
    const savedSize = localStorage.getItem("7h_tour_font_size");
    const savedFamily = localStorage.getItem("7h_tour_font_family");
    const savedPadding = localStorage.getItem("7h_tour_row_padding");
    const savedGap = localStorage.getItem("7h_tour_row_gap");
    const savedHeight = localStorage.getItem("7h_tour_row_height");
    if (savedSize) setTourFontSize(savedSize);
    if (savedFamily) setTourFontFamily(savedFamily);
    if (savedPadding) setTourRowPadding(savedPadding);
    if (savedGap) setTourRowGap(savedGap);
    if (savedHeight) setTourRowHeight(savedHeight);
    const savedWebsiteSize = localStorage.getItem(
      "7h_tour_website_btn_font_size",
    );
    if (savedWebsiteSize) setWebsiteBtnFontSize(savedWebsiteSize);

    const savedMaskEnabled = localStorage.getItem("7h_tour_map_mask_enabled");
    const savedMaskTop = localStorage.getItem("7h_tour_map_mask_top");
    const savedMaskBottom = localStorage.getItem("7h_tour_map_mask_bottom");
    const savedMaskLeft = localStorage.getItem("7h_tour_map_mask_left");
    const savedMaskRight = localStorage.getItem("7h_tour_map_mask_right");
    if (savedMaskEnabled !== null)
      setMapMaskEnabled(savedMaskEnabled === "true");
    if (savedMaskTop) setMapMaskTop(parseInt(savedMaskTop, 10) || 50);
    if (savedMaskBottom) setMapMaskBottom(parseInt(savedMaskBottom, 10) || 50);
    if (savedMaskLeft) setMapMaskLeft(parseInt(savedMaskLeft, 10) || 50);
    if (savedMaskRight) setMapMaskRight(parseInt(savedMaskRight, 10) || 50);
  }, []);

  // Dynamically load Google Fonts when selected
  useEffect(() => {}, [tourFontFamily]);
  const [notifyPrefs, setNotifyPrefs] = useState({
    proximity: true,
    thisShow: true,
    newsletter: false,
  });

  // Live ticking time for countdowns (60s tick so parent table rows don't re-render every second)
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Show CRUD States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields State
  const [formVenue, setFormVenue] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("IL");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formDoorsTime, setFormDoorsTime] = useState("");
  const [formPlayTime, setFormPlayTime] = useState("");
  const [formAllAges, setFormAllAges] = useState(true);
  const [formCover, setFormCover] = useState("");
  const [formTicketLink, setFormTicketLink] = useState("");
  const [formDirectionsLink, setFormDirectionsLink] = useState("");
  const [formMapUrl, setFormMapUrl] = useState("");
  const [formParkingInfo, setFormParkingInfo] = useState("");
  const [formParkingUrl, setFormParkingUrl] = useState("");
  const formIsSoldOutRef = useRef(false);
  const [formIsFestival, setFormIsFestival] = useState(false);
  const [formIsPrivate, setFormIsPrivate] = useState(false);
  const [formNotes, setFormNotes] = useState("");
  const [formIsUnplugged, setFormIsUnplugged] = useState(false);
  const [formIsOutdoor, setFormIsOutdoor] = useState(false);
  const [formIsCasino, setFormIsCasino] = useState(false);
  const [formIsSpecialEvent, setFormIsSpecialEvent] = useState(false);

  const populateForm = useCallback((show: any | null) => {
    if (show) {
      setFormVenue(show.venue || "");
      setFormCity(show.city || "");
      setFormState(show.state || "IL");
      setFormDate(show.startDate || "");
      setFormTime(show.time || "");
      setFormDoorsTime(show.doorsTime || "");
      setFormPlayTime(show.playTime || "");
      setFormAllAges(show.allAges ?? true);
      setFormCover(show.cover || "");
      setFormTicketLink(show.ticketLink || "");
      setFormDirectionsLink(show.directionsLink || show.mapUrl || "");
      setFormMapUrl(show.mapUrl || show.directionsLink || "");
      setFormParkingInfo(show.parkingInfo || "");
      setFormParkingUrl(show.parkingUrl || "");
      formIsSoldOutRef.current = show.isSoldOut || false;
      setFormIsFestival(show.isFestival || false);
      setFormIsPrivate(show.isPrivate || false);
      setFormNotes(show.notes || "");

      const currentTags = show.tags || [];
      const lowerNotes = (
        (show.notes || "") +
        " " +
        (show.info || "")
      ).toLowerCase();
      setFormIsUnplugged(
        currentTags.includes("unplugged") || lowerNotes.includes("unplugged"),
      );
      setFormIsOutdoor(
        currentTags.includes("outdoor") ||
          lowerNotes.includes("outdoor") ||
          lowerNotes.includes("beer garden"),
      );
      setFormIsCasino(
        currentTags.includes("casino") || lowerNotes.includes("casino"),
      );
      setFormIsSpecialEvent(
        currentTags.includes("special") ||
          currentTags.includes("gala") ||
          currentTags.includes("fundraiser") ||
          currentTags.includes("cruise") ||
          currentTags.includes("tv") ||
          lowerNotes.includes("gala") ||
          lowerNotes.includes("fundraiser") ||
          lowerNotes.includes("cruise") ||
          lowerNotes.includes("tv"),
      );
    } else {
      setFormVenue("");
      setFormCity("");
      setFormState("IL");
      setFormDate("");
      setFormTime("");
      setFormDoorsTime("");
      setFormPlayTime("");
      setFormAllAges(true);
      setFormCover("");
      setFormTicketLink("");
      setFormDirectionsLink("");
      setFormMapUrl("");
      setFormParkingInfo("");
      setFormParkingUrl("");
      formIsSoldOutRef.current = false;
      setFormIsFestival(false);
      setFormIsPrivate(false);
      setFormNotes("");
      setFormIsUnplugged(false);
      setFormIsOutdoor(false);
      setFormIsCasino(false);
      setFormIsSpecialEvent(false);
    }
    setModalError(null);
  }, []);

  const handleAddShowClick = useCallback(() => {
    setEditingShow(null);
    populateForm(null);
    setModalError(null);
    setIsModalOpen(true);
  }, [populateForm]);

  const handleEditClick = (show: any) => {
    setEditingShow(show);
    populateForm(show);
    setIsModalOpen(true);
  };

  const handleSaveShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formVenue.trim() ||
      !formCity.trim() ||
      !formState.trim() ||
      !formDate
    ) {
      setModalError("Please fill out all required fields.");
      return;
    }
    setSubmitting(true);
    setModalError(null);

    const tags = [];
    if (formIsFestival) tags.push("festival");
    if (formIsPrivate) tags.push("private");
    if (formIsUnplugged) tags.push("unplugged");
    if (formIsOutdoor) tags.push("outdoor");
    if (formIsCasino) tags.push("casino");
    if (formIsSpecialEvent) tags.push("special");

    const payload = {
      venue: formVenue.trim(),
      city: formCity.trim(),
      state: formState.trim().toUpperCase(),
      date: formDate,
      time: formTime,
      doorsTime: formDoorsTime,
      playTime: formPlayTime,
      allAges: formAllAges,
      cover: formCover,
      ticketLink: formTicketLink.trim(),
      directionsLink: formDirectionsLink.trim() || formMapUrl.trim(),
      mapUrl: formMapUrl.trim() || formDirectionsLink.trim(),
      parkingInfo: formParkingInfo.trim(),
      parkingUrl: formParkingUrl.trim(),
      isSoldOut: formIsSoldOutRef.current,
      isFestival: formIsFestival,
      isPrivate: formIsPrivate,
      notes: formNotes.trim(),
      tags,
      _id: editingShow?._id,
    };

    try {
      const url = "/api/admin/shows";
      const method = editingShow ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setIsModalOpen(false);
          window.location.reload();
        } else {
          setModalError(result.error || "Failed to save show date.");
        }
      } else {
        const result = await res.json().catch(() => ({}));
        setModalError(result.error || "Failed to save show date.");
      }
    } catch (err) {
      setModalError("Network error. Please check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShow = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this show date from Sanity?"))
      return;
    try {
      const res = await fetch(`/api/admin/shows?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          window.location.reload();
        } else {
          alert("Failed to delete show: " + (result.error || "Unknown error"));
        }
      } else {
        const result = await res.json().catch(() => ({}));
        alert("Failed to delete show: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      alert("Network error deleting show.");
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".calendar-dropdown-container")) {
        setActiveCalDropdownId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const loadSubscriptions = useCallback(async () => {
    if (!member?.email) return;
    try {
      const res = await fetch(
        `/api/shows/notify-me?email=${encodeURIComponent(member.email)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.subscriptions) {
          const ids = data.subscriptions.map((s: any) => s.showId);
          setSubscribedShowIds(ids);
        }
      }
    } catch (err) {
      console.error("Error loading notification subscriptions:", err);
    }
  }, [member?.email]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleToggleNotification = (show: any) => {
    const showId = show._id || show.id || `${show.venue}-${show.date}`;
    if (!showId) return;

    // Already subscribed → unsubscribe immediately
    if (subscribedShowIds.includes(showId)) {
      handleUnsubscribe(showId);
      return;
    }

    // Show the notification preferences popup
    setNotifyEmail(member?.email || "");
    setNotifyPopupShow(show);
    setNotifyPrefs({ proximity: true, thisShow: true, newsletter: false });
  };

  const handleUnsubscribe = async (showId: string) => {
    const email = member?.email || notifyEmail;
    if (!email) return;
    setSubscribingId(showId);
    try {
      const res = await fetch(
        `/api/shows/notify-me?email=${encodeURIComponent(email)}&showId=${encodeURIComponent(showId)}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        setSubscribedShowIds((prev) => prev.filter((id) => id !== showId));
      }
    } catch {
    } finally {
      setSubscribingId(null);
    }
  };

  const handleNotifyConfirm = async () => {
    const emailToUse = (member?.email || notifyEmail).trim();
    if (!notifyPopupShow || !emailToUse) return;
    const showId =
      notifyPopupShow._id ||
      notifyPopupShow.id ||
      `${notifyPopupShow.venue}-${notifyPopupShow.date}`;
    setSubscribingId(showId);
    try {
      const res = await fetch("/api/shows/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId,
          email: emailToUse,
          venueName: notifyPopupShow.venue,
          showDate: notifyPopupShow.date,
          city: notifyPopupShow.city,
          state: notifyPopupShow.state,
          preferences: notifyPrefs,
        }),
      });
      if (res.ok) {
        setSubscribedShowIds((prev) => [...prev, showId]);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      alert("Network error. Please check connection.");
    } finally {
      setSubscribingId(null);
      setNotifyPopupShow(null);
    }
  };

  // Parse a show date like "January 2" or "May 30" into a proper Date object
  const parseShowDate = useCallback(
    (dateStr: string, startDateStr?: string): Date => {
      if (startDateStr && /^\d{4}-\d{2}-\d{2}/.test(startDateStr)) {
        return new Date(startDateStr + "T00:00:00");
      }
      const currentYear = new Date().getFullYear();
      const d = new Date(`${dateStr}, ${currentYear}`);
      return isNaN(d.getTime()) ? new Date(0) : d;
    },
    [],
  );

  // Parse both date and time into a precise Date object for comparison
  const parseShowDateTime = useCallback(
    (dateStr: string, timeStr?: string, startDateStr?: string): Date => {
      return getShowDateTime(startDateStr, dateStr, timeStr);
    },
    [],
  );

  const isShowToday = useCallback(
    (show: any): boolean => {
      const showDate = parseShowDate(show.date, show.startDate);
      const today = new Date();
      return (
        showDate.getFullYear() === today.getFullYear() &&
        showDate.getMonth() === today.getMonth() &&
        showDate.getDate() === today.getDate()
      );
    },
    [parseShowDate],
  );

  const getCountdownString = useCallback(
    (show: any): string => {
      const showDateTime = parseShowDateTime(
        show.date,
        show.time,
        show.startDate,
      );
      const nowTime = currentTime.getTime();
      const startTime = showDateTime.getTime();

      if (nowTime < startTime) {
        const diffMs = startTime - nowTime;
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);

        if (hours > 0) {
          return `In ${hours}h ${minutes}m`;
        } else {
          return `In ${minutes}m ${seconds}s`;
        }
      } else if (nowTime <= startTime + 4 * 60 * 60 * 1000) {
        return "Live Now";
      } else {
        return "Show Over";
      }
    },
    [parseShowDateTime, currentTime],
  );

  const displayShows = useMemo(() => {
    const rawList =
      initialShows && initialShows.length > 0 ? initialShows : shows;
    const ensuredList = ensureUpcomingTourDates(rawList);
    // Sort chronologically by date and time to support same-day multi-time setups
    const list = [...ensuredList];
    list.sort((a, b) => {
      const timeA = parseShowDateTime(a.date, a.time, a.startDate).getTime();
      const timeB = parseShowDateTime(b.date, b.time, b.startDate).getTime();
      return timeA - timeB;
    });
    return list;
  }, [initialShows, parseShowDateTime]);

  // Filter shows by time (exclude past shows by default unless showPastShows is true)
  const activeShowsByTime = useMemo(() => {
    return displayShows.filter((s) => showPastShows || !isShowOver(s));
  }, [displayShows, showPastShows]);

  // Derive filter options from current upcoming tour dates list
  const upcomingShowsList = useMemo(() => {
    return displayShows.filter((s) => !isShowOver(s));
  }, [displayShows]);

  const months = useMemo(() => {
    const list = showPastShows ? activeShowsByTime : upcomingShowsList;
    return [...new Set(list.map((s: any) => s.date.split(" ")[0]))];
  }, [showPastShows, activeShowsByTime, upcomingShowsList]);

  const locationOptions = useMemo(() => {
    // Count shows per city from upcoming shows
    const cityCount = new Map<string, number>();
    upcomingShowsList.forEach((s: any) => {
      if (s.city && s.city.trim()) {
        const city = s.city.trim();
        cityCount.set(city, (cityCount.get(city) ?? 0) + 1);
      }
    });
    return Array.from(cityCount.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => a.city.localeCompare(b.city));
  }, [upcomingShowsList]);

  const tableRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sortBarRef = useRef<HTMLDivElement>(null);

  const isStuckRef = useRef(false);
  const sortBarOpacityRef = useRef(1);

  const [mobileHeaderOffset, setMobileHeaderOffset] = useState<number>(64);

  useEffect(() => {
    const updateHeaderOffset = () => {
      const headerEl =
        typeof document !== "undefined"
          ? document.querySelector("header")
          : null;
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect();
        const height = Math.round(rect.height || 64);
        setMobileHeaderOffset(height > 0 ? height : 64);
      }
    };

    updateHeaderOffset();
    window.addEventListener("resize", updateHeaderOffset, { passive: true });
    return () => window.removeEventListener("resize", updateHeaderOffset);
  }, []);

  // Smooth date sort bar stuck state detection using IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const sortBar = sortBarRef.current;
    if (!sentinel || !sortBar) return;

    sortBar.style.opacity = "1";
    sortBar.style.pointerEvents = "auto";

    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          // If sentinel is above the root margin threshold (scrolled past header)
          const isStuck =
            !entry.isIntersecting &&
            entry.boundingClientRect.top <
              (entry.rootBounds?.top ?? mobileHeaderOffset);
          if (isStuckRef.current !== isStuck) {
            isStuckRef.current = isStuck;
            sortBar.classList.toggle("is-stuck", isStuck);
            if (isStuck) {
              document.documentElement.classList.add("tour-sort-stuck");
            } else {
              document.documentElement.classList.remove("tour-sort-stuck");
            }
          }
        },
        {
          threshold: 0,
          rootMargin: `-${mobileHeaderOffset}px 0px 0px 0px`,
        },
      );

      observer.observe(sentinel);
    }

    return () => {
      if (observer) observer.disconnect();
      document.documentElement.classList.remove("tour-sort-stuck");
    };
  }, [mobileHeaderOffset]);

  const scrollToShow = useCallback((venue: string, date: string) => {
    // Clear any filters first so the row is visible
    setActiveMonth("All");
    setActiveType("All");
    setActiveCity("All");
    setSearchQuery("");
    const prefix = `tour-${venue}-${date}`.replace(/\s+/g, "-").toLowerCase();
    // Delay to let filters clear and DOM update
    setTimeout(() => {
      const el = document.querySelector(`[id^="${prefix}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(el.id);
        setTimeout(() => setHighlightedId(null), 3000);
      }
    }, 100);
  }, []);

  // Map pin click — no-op (auto-scroll disabled per user request)
  const handleMapPinClick = useCallback(() => {
    // Scroll behavior removed per user request
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return activeShowsByTime.filter((s) => {
      if (activeMonth !== "All" && !s.date.startsWith(activeMonth))
        return false;
      if (activeType !== "All" && !new Set(getShowTags(s)).has(activeType))
        return false;
      if (activeCity !== "All" && s.city !== activeCity) return false;
      if (
        q &&
        !s.venue.toLowerCase().includes(q) &&
        !s.city.toLowerCase().includes(q) &&
        !s.info.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [activeShowsByTime, activeMonth, activeType, activeCity, searchQuery]);

  const subscribedShowIdsSet = useMemo(
    () => new Set(subscribedShowIds),
    [subscribedShowIds],
  );

  const hasActiveFilters =
    activeMonth !== "All" ||
    activeType !== "All" ||
    activeCity !== "All" ||
    searchQuery !== "";

  const clearAll = () => {
    setActiveMonth("All");
    setActiveType("All");
    setActiveCity("All");
    setSearchQuery("");
  };

  const showCount = filtered.length;

  const upcomingCount = useMemo(() => {
    return displayShows.filter((s) => !isShowOver(s)).length;
  }, [displayShows]);

  const filteredUpcomingCount = useMemo(() => {
    return filtered.filter((s) => !isShowOver(s)).length;
  }, [filtered]);

  // Build active filter labels
  const activeLabels: string[] = [];
  if (activeMonth !== "All") activeLabels.push(activeMonth);
  if (activeType !== "All") activeLabels.push(activeType);
  if (activeCity !== "All") activeLabels.push(activeCity);
  if (searchQuery) activeLabels.push(`"${searchQuery}"`);

  // Find the next upcoming show

  const getUpcomingShow = () => {
    const now = new Date();
    // 1. First check if a show is currently happening (started but not ended)
    for (const show of displayShows) {
      if (!show.city) continue; // skip private events
      const showDateTime = parseShowDateTime(
        show.date,
        show.time,
        show.startDate,
      );
      const showEndTime = new Date(showDateTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours duration
      if (now >= showDateTime && now < showEndTime) {
        return show;
      }
    }
    // 2. Otherwise return the first upcoming show in the future
    for (const show of displayShows) {
      if (!show.city) continue; // skip private events
      const showDateTime = parseShowDateTime(
        show.date,
        show.time,
        show.startDate,
      );
      if (showDateTime >= now) return show;
    }
    // 3. Fallback: if all shows in schedule are past, return the first public show so UP NEXT and Countdown Timer are always visible
    const publicShows = displayShows.filter((s) => s.city);
    return publicShows[0] || displayShows[0] || null;
  };

  const upNext = getUpcomingShow();

  // Calculate days until show
  const getDaysUntil = () => {
    if (!upNext) return "";
    const now = new Date();

    // Check if the show is happening right now
    const showDateTime = parseShowDateTime(
      upNext.date,
      upNext.time,
      upNext.startDate,
    );
    const showEndTime = new Date(showDateTime.getTime() + 4 * 60 * 60 * 1000);
    if (now >= showDateTime && now < showEndTime) {
      return "Happening Now";
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const showDate = parseShowDate(upNext.date, upNext.startDate);
    const diff = Math.round(
      (showDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return "Tonight";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return "";
    return `${diff} days away`;
  };

  const daysLabel = getDaysUntil();

  const eventSchema = generateTourEventSchema(displayShows);

  const gridClass =
    "grid-cols-1 lg:grid-cols-[60px_165px_2.5fr_1.4fr_1fr_130px_minmax(120px,1fr)]";

  const headerParallaxRef = useRef<HTMLDivElement | null>(null);
  const mapParallaxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Map Parallax: Smooth vertical drift as user scrolls down the page
      if (mapParallaxRef.current && tableRef.current) {
        gsap.fromTo(
          mapParallaxRef.current,
          { yPercent: -3, force3D: true },
          {
            yPercent: 3,
            force3D: true,
            ease: "none",
            scrollTrigger: {
              trigger: tableRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.2,
            },
          },
        );
      }

      // Section Headline Counter-Parallax synced exactly with Hero Section
      if (headerParallaxRef.current) {
        const heroEl = document.getElementById("hero") || tableRef.current;
        if (heroEl) {
          gsap.fromTo(
            headerParallaxRef.current,
            { yPercent: 7, force3D: true },
            {
              yPercent: -7,
              force3D: true,
              ease: "none",
              scrollTrigger: {
                trigger: heroEl,
                start: "top top",
                end: "bottom top",
                scrub: 0.25,
              },
            },
          );
        }
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      {eventSchema && (
        <Script
          id="tour-event-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
        />
      )}
      {/* Table */}
      <section
        className="relative"
        ref={tableRef}
        id="tour-table-container"
        style={
          {
            "--tour-font-family": tourFontFamily,
            "--tour-row-padding": tourRowPadding,
            "--tour-row-height": tourRowHeight,
            "--tour-row-gap": tourRowGap,
          } as React.CSSProperties
        }
      >
        {/* Section Headline & Paragraph */}
        <div className="site-container relative w-full">
          <div
            ref={headerParallaxRef}
            className="pointer-events-none z-30 mx-auto py-5 text-center"
          >
            <h2 className="mb-3">Upcoming Tour Dates</h2>
            <p className="text-sm leading-relaxed text-white/70 sm:text-base md:text-lg">
              Catch 7th Heaven live on stage! Explore all upcoming show dates,
              venues, directions, and sync concerts directly to your calendar.
            </p>
          </div>
        </div>
        <div className="site-container relative w-full">
          {!hideMap && (
            <div
              ref={mapParallaxRef}
              className="relative right-1/2 left-1/2 z-10 -mr-[50vw] -ml-[50vw] w-screen"
              style={{
                transform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <TourMap
                shows={hasActiveFilters ? filtered : displayShows}
                nextShowVenue={upNext?.venue}
                nextShowCity={upNext?.city}
                onPinClick={handleMapPinClick}
              />
            </div>
          )}

          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              {isAdmin && (
                <AddCmsButton label="ADD SHOW" onClick={handleAddShowClick} />
              )}

              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="whitespace-nowrap] cursor-pointer rounded-lg border border-[var(--color-accent)re] px-2.5 py-1 text-[0.9rem] transition-colors duration-200 hover:border-[rgba(255,10,61,0.6)] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sentinel — detection only; no longer a spacer (sort bar stays in normal flow always) */}
          <div ref={sentinelRef} className="h-0" aria-hidden="true" />
          <div
            id="tour-sort-bar"
            ref={sortBarRef}
            style={{
              opacity: sortBarOpacityRef.current,
              pointerEvents: sortBarOpacityRef.current > 0.05 ? "auto" : "none",
              top: `${mobileHeaderOffset}px`,
            }}
            className="relative sticky z-[40] flex w-full flex-col gap-6 border-0 transition-opacity duration-300 ease-out [&.is-stuck_.sort-bar-bg]:opacity-100"
          >
            <div
              className="sort-bar-bg pointer-events-none absolute -top-3 right-1/2 -bottom-3 left-1/2 -z-10 -mr-[50vw] -ml-[50vw] w-screen bg-black/20 opacity-0 backdrop-blur-[24px] transition-opacity duration-300 ease-out"
              style={{
                WebkitBackdropFilter: "blur(24px)",
                backdropFilter: "blur(24px)",
                maskImage:
                  "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
              }}
            />

            {/* Search Bar ON TOP (Sticks cleanly above table header on scroll for desktop & mobile) */}
            <div className="input-glow-border mb-3 w-full max-w-[300px] shrink-0">
              <div className="relative flex w-full items-center">
                <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  aria-label="Search"
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="no-bg-icon placeholder: w-full rounded-lg border-0 py-2 pr-5 text-white/50 transition-all focus:outline-none"
                  id="tour-search"
                />
                {searchQuery && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="absolute top-1/2 right-2.5 z-10 -translate-y-1/2 cursor-pointer text-[1.08rem] hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 7-Column Header Grid (Aligned 1:1 with tour data rows) */}
            <div
              className={`flex flex-wrap lg:grid ${gridClass} w-full items-center gap-3 sm:gap-4 lg:gap-8`}
            >
              {/* Column 1: DAY */}
              <span className="hidden text-[clamp(16px,1.4vw,21px)] lg:inline-block">
                Day
              </span>

              {/* Column 2: MONTH Filter */}
              <div className="relative flex shrink-0 items-center">
                <GooeyMessagesDropdown
                  placeholder="MONTH"
                  defaultSelectedId={
                    activeMonth !== "All" ? activeMonth : undefined
                  }
                  customers={months.map((m) => ({ id: m, name: m }))}
                  onSelect={(opt) => setActiveMonth(opt.id)}
                />
              </div>

              {/* Column 3: PLACE / VENUE */}
              <span className="hidden text-[clamp(16px,1.4vw,21px)] lg:inline-block">
                Place
              </span>

              {/* Column 4: CITY Filter */}
              <div className="relative flex shrink-0 items-center">
                <GooeyMessagesDropdown
                  placeholder="CITY"
                  defaultSelectedId={
                    activeCity !== "All" ? activeCity : undefined
                  }
                  customers={locationOptions.map(({ city, count }) => ({
                    id: city,
                    name: `${city} (${count})`,
                  }))}
                  onSelect={(opt) => setActiveCity(opt.id)}
                />
              </div>

              {/* Column 5: TIME */}
              <span className="hidden text-[clamp(16px,1.4vw,22px)] lg:inline-block">
                Time
              </span>

              {/* Column 6: MAP/CAL */}
              <span className="hidden text-center text-[clamp(16px,1.4vw,22px)] lg:inline-block">
                Map/Cal
              </span>

              {/* Column 7: WEBSITE */}
              <span className="hidden text-right text-[clamp(16px,1.4vw,22px)] lg:inline-block">
                Website
              </span>
            </div>
          </div>

          <div
            className="pb-section-fluid flex flex-col gap-0 overflow-visible"
            id="tour-rows-container"
          >
            {Array.from(
              (() => {
                let rows = filtered;
                const effectiveLimit = maxShows;
                if (effectiveLimit && upNext) {
                  const startIdx = filtered.findIndex(
                    (s) =>
                      s.date === upNext.date &&
                      s.venue === upNext.venue &&
                      s.time === upNext.time,
                  );
                  rows = filtered.slice(
                    startIdx >= 0 ? startIdx : 0,
                    (startIdx >= 0 ? startIdx : 0) + effectiveLimit,
                  );
                } else if (effectiveLimit) {
                  rows = filtered.slice(0, effectiveLimit);
                }
                return rows;
              })(),
              (show, i) => ({ show, i }),
            ).map(({ show, i }) => {
              const isUpNext = upNext
                ? show.date === upNext.date &&
                  show.venue === upNext.venue &&
                  show.time === upNext.time
                : false;
              const rowId = `tour-${show.venue}-${show.date}-${show.time || ""}`
                .replace(/\s+/g, "-")
                .toLowerCase();
              const isHighlighted = highlightedId === rowId;
              const isPast =
                todayStartTimestamp > 0 &&
                parseShowDate(show.date, show.startDate).getTime() <
                  todayStartTimestamp;
              const isPrivate =
                show.isPrivate ||
                show.venue?.toLowerCase() === "private event" ||
                (show.tags && show.tags.includes("private")) ||
                (show.info && show.info.toLowerCase().includes("private")) ||
                false;
              return (
                // eslint-disable-next-line react-doctor/no-array-index-as-key
                <div
                  key={`tour_row_${i}_${show.id || rowId}`}
                  className="group overflow-visible"
                >
                  {/* Desktop Row Layout */}
                  <div
                    className={`tour-row-item relative hidden lg:grid ${gridClass} items-center gap-8 py-3.5 text-[22px] ${isHighlighted ? "" : " "} ${!show.city ? "opacity-50" : ""} ${isPast && !isHighlighted ? "opacity-65" : ""}`}
                    id={rowId}
                  >
                    <span className="text-[clamp(14px,1.3vw,21px)] whitespace-nowrap">
                      {show.day}
                    </span>
                    <span className="text-[clamp(14px,1.3vw,21px)] whitespace-nowrap">
                      {show.date}
                    </span>
                    <span className="text-[clamp(14px,1.3vw,21px)] whitespace-nowrap">
                      {show.venue}
                    </span>
                    <span className="text-[clamp(14px,1.3vw,21px)] whitespace-nowrap">
                      {show.city
                        ? `${show.city}${show.state ? `, ${show.state}` : ""}`
                        : ""}
                    </span>
                    <span className="flex flex-wrap items-center gap-2 text-left text-[clamp(14px,1.3vw,21px)]">
                      {(() => {
                        const { doorsTime, playTime, time } =
                          getShowDisplayTimes(show);
                        if (doorsTime || playTime || time) {
                          return (
                            <div className="flex flex-col gap-0.5">
                              {doorsTime && (
                                <span className="whitespace-nowrap">
                                  Doors: {doorsTime}
                                </span>
                              )}
                              {playTime && (
                                <span className="text-[0.92rem] whitespace-nowrap text-rose-400">
                                  Show: {playTime}
                                </span>
                              )}
                              {time && (doorsTime || playTime) && (
                                <span className="whitespace-nowrap text-white/70">
                                  Event: {time}
                                </span>
                              )}
                              {!doorsTime && !playTime && time && (
                                <span className="text-[clamp(14px,1.3vw,21px)] whitespace-nowrap">
                                  {time}
                                </span>
                              )}
                            </div>
                          );
                        }
                        return (
                          <span className="text-[clamp(13px,1.1vw,18px)] whitespace-nowrap text-white/40 italic">
                            TBA
                          </span>
                        );
                      })()}
                      {isShowToday(show) && (
                        <span className="ml-1.5 animate-pulse whitespace-nowrap text-rose-600">
                          {getCountdownString(show)}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center justify-center gap-2">
                      {!isPrivate && (
                        <>
                          {show._id && isFan && (
                            <button
                              onClick={() => handleToggleNotification(show)}
                              disabled={subscribingId === show._id}
                              title={
                                subscribedShowIdsSet.has(show._id)
                                  ? "Mute notifications for this show"
                                  : "Notify me about this show"
                              }
                              className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors duration-300 ${subscribedShowIdsSet.has(show._id) ? "border-[var(--color-accent)] bg-[var(--color-accent)] hover:bg-[var(--color-accent)]" : "border-black/15 bg-gray-100 hover:bg-gray-200"}`}
                            >
                              {subscribingId === show._id ? (
                                <span className="h-3.5 w-3.5 animate-spin rounded-lg border-2 border-current border-t-transparent" />
                              ) : subscribedShowIdsSet.has(show._id) ? (
                                <Bell className="h-3.5 w-3.5" />
                              ) : (
                                <Bell className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                            {(() => {
                              const effectiveMapUrl = getEffectiveMapUrl(show);
                              const showType = getShowType(show.info || "");
                              const cfg =
                                typeConfig[showType] || typeConfig.full;
                              if (!effectiveMapUrl) {
                                return (
                                  <span
                                    title="No Directions Link"
                                    className="pointer-events-none flex cursor-not-allowed items-center justify-center p-1 text-white/20 opacity-20 select-none"
                                  >
                                    <LocationPinIcon className="h-5.5 w-5.5 shrink-0" />
                                  </span>
                                );
                              }
                              const gUrl = effectiveMapUrl.includes(
                                "maps.apple.com",
                              )
                                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city || ""} ${show.state || ""}`)}`
                                : effectiveMapUrl;
                              return (
                                <a
                                  href={gUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Get Directions"
                                  style={{ color: cfg.color }}
                                  className="flex items-center justify-center p-1 opacity-100 transition-opacity hover:opacity-75"
                                >
                                  <LocationPinIcon className="h-5.5 w-5.5 shrink-0" />
                                </a>
                              );
                            })()}
                          </div>
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                            {(() => {
                              const hasExplicitParking = Boolean(
                                show.parkingUrl || show.parkingInfo,
                              );
                              const showType = getShowType(show.info || "");
                              const cfg =
                                typeConfig[showType] || typeConfig.full;
                              if (!hasExplicitParking) {
                                return (
                                  <span
                                    title="No Parking Link"
                                    className="pointer-events-none flex cursor-not-allowed items-center justify-center p-1 text-white/20 opacity-20 select-none"
                                  >
                                    <CarIcon className="h-5.5 w-5.5 shrink-0 text-white/20" />
                                  </span>
                                );
                              }
                              const pUrl =
                                show.parkingUrl ||
                                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parking near ${show.venue} ${show.city || ""} ${show.state || ""}`)}`;
                              return (
                                <a
                                  href={pUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={
                                    show.parkingInfo
                                      ? `Parking: ${show.parkingInfo}`
                                      : "Parking Directions"
                                  }
                                  style={{ color: cfg.color }}
                                  className="seventh--btn flex items-center justify-center p-1 opacity-100 transition-opacity hover:opacity-75"
                                >
                                  <CarIcon className="h-5.5 w-5.5 shrink-0" />
                                </a>
                              );
                            })()}
                          </div>
                          <div className="calendar-dropdown-container relative flex h-7 w-7 shrink-0 items-center justify-center">
                            <button
                              onClick={() =>
                                setActiveCalDropdownId(
                                  activeCalDropdownId === rowId ? null : rowId,
                                )
                              }
                              title="Add to Calendar"
                              className="flex cursor-pointer items-center justify-center border-none p-1 transition-colors hover:text-white"
                            >
                              <CalendarDays className="h-5.5 w-5.5" />
                            </button>
                            {activeCalDropdownId === rowId && (
                              <div className="absolute right-0 z-50 mt-2 min-w-[165px] rounded-xl border border-purple-400/30 bg-[#0c0721]/95 py-1.5 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.95)] backdrop-blur-[45px]">
                                <a
                                  href={getGoogleCalendarUrl(show)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setActiveCalDropdownId(null)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition-colors hover:bg-[var(--color-accent)]/20 hover:text-white"
                                >
                                  Google Cal
                                </a>
                                <a
                                  href={getICSFileUrl(show)}
                                  download={`${show.venue.replace(/\s+/g, "_")}_show.ics`}
                                  onClick={() => setActiveCalDropdownId(null)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition-colors hover:bg-[var(--color-accent)]/20 hover:text-white"
                                >
                                  iCal / Apple
                                </a>
                                <a
                                  href={getICSFileUrl(show)}
                                  download={`${show.venue.replace(/\s+/g, "_")}_show.ics`}
                                  onClick={() => setActiveCalDropdownId(null)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition-colors hover:bg-[var(--color-accent)]/20 hover:text-white"
                                >
                                  Outlook
                                </a>
                                <button
                                  onClick={() => {
                                    setActiveCalDropdownId(null);
                                    document
                                      .getElementById("proximity-notify")
                                      ?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="flex w-full cursor-pointer items-center gap-2 border-t border-white/10 px-4 py-2 pt-2 text-left text-xs transition-colors hover:bg-[var(--color-accent)]/20 hover:text-white"
                                >
                                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-purple-400" />{" "}
                                  SMS / Text Alerts
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </span>
                    <span className="flex items-center justify-end gap-2 text-right">
                      {!isPrivate && (
                        <a
                          href={
                            show.websiteUrl ||
                            `https://www.google.com/search?q=${encodeURIComponent(`${show.venue} ${show.city || ""} ${show.state || ""}`)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          title={
                            show.websiteUrl
                              ? "Official Venue Website"
                              : "Search Venue Info"
                          }
                          className="a-btn inline-flex cursor-pointer items-center justify-center whitespace-nowrap transition-all hover:opacity-80"
                          style={{ fontSize: websiteBtnFontSize }}
                        >
                          Website
                        </a>
                      )}
                      {isAdmin && show._id && (
                        <div className="ml-1 flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => handleEditClick(show)}
                            className="cursor-pointer rounded border border-blue-500/20 bg-blue-600/10 px-2 py-1 text-[0.65rem] text-blue-400 transition-colors hover:bg-blue-600 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteShow(show._id)}
                            className="cursor-pointer rounded border border-rose-500/20 bg-rose-600/10 px-2 py-1 text-[0.65rem] text-rose-400 transition-colors hover:bg-rose-600 hover:text-white"
                          >
                            Del
                          </button>
                        </div>
                      )}
                    </span>
                  </div>

                  {/* Mobile/Tablet Card Layout — Stacked Venue-First */}
                  <div
                    className={`tour-row-item relative mb-3 flex flex-col gap-1 transition-all lg:hidden ${isHighlighted ? "animate-pulse ring-2 ring-purple-500/80" : isUpNext ? "border-purple-500/40" : ""} ${!show.city ? "opacity-50" : ""} ${isPast && !isHighlighted ? "opacity-65" : ""}`}
                    id={`${rowId}-mobile`}
                  >
                    {/* 1. Venue & City (FIRST) */}
                    <div className="space-y-1">
                      <h4 className="font-black">{show.venue}</h4>

                      {(show.city || show.state) && (
                        <p className="flex items-center gap-1.5 truncate text-white/70">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                          <span>
                            {show.city
                              ? `${show.city}${show.state ? `, ${show.state}` : ""}`
                              : show.state}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* 2. Date & Time Pill Strip (SECOND / BELOW VENUE) */}
                    <div className="flex flex-wrap items-center gap-2 text-purple-200">
                      <span className="font-mono font-black text-purple-300">
                        {show.day}
                      </span>
                      <span className="text-white/40">•</span>
                      <span className="font-black">{show.date}</span>
                      {(() => {
                        const { doorsTime, playTime, time } =
                          getShowDisplayTimes(show);
                        const displayTime =
                          playTime ||
                          time ||
                          (doorsTime ? `Doors ${doorsTime}` : "TBA");
                        return (
                          <>
                            <span className="text-white/40">•</span>
                            <span className="text-purple-200">
                              {displayTime}
                            </span>
                          </>
                        );
                      })()}
                    </div>

                    {/* 3. Tags Row */}
                    {!isPrivate && (
                      <div className="flex flex-wrap items-center gap-2 pb-2">
                        {show.info && (
                          <span className="text-white/70">{show.info}</span>
                        )}
                        {(show.allAges === true ||
                          (show.info &&
                            (show.info.toLowerCase().includes("all age") ||
                              show.info.toLowerCase().includes("all-age"))) ||
                          (show.tags &&
                            (show.tags.includes("all ages") ||
                              show.tags.includes("all-ages")))) && (
                          <span className="text-purple-300">All Ages</span>
                        )}
                        {getShowTags(show).map((tag) => {
                          if (tag === "All Ages" || tag === "21+") return null;
                          return (
                            <span
                              key={tag}
                              className="text-[var(--color-accent)]"
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    {!isPrivate && (
                      <div className="flex items-center gap-2">
                        {/* Map Directions */}
                        {(() => {
                          const effectiveMapUrl = getEffectiveMapUrl(show);
                          if (!effectiveMapUrl) {
                            return (
                              <span
                                title="No Directions Link"
                                className="pointer-events-none flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 border border-white/10 bg-white/5 text-white/20 opacity-25 select-none"
                              >
                                <LocationPinIcon className="h-3.5 w-3.5 shrink-0 text-white/20" />
                                <span>Map</span>
                              </span>
                            );
                          }
                          const gUrl = effectiveMapUrl.includes(
                            "maps.apple.com",
                          )
                            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city || ""} ${show.state || ""}`)}`
                            : effectiveMapUrl;
                          return (
                            <SeventhButton
                              onClick={() =>
                                window.open(
                                  gUrl,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                              icon={
                                <LocationPinIcon className="h-3.5 w-3.5 shrink-0" />
                              }
                              className=" "
                              title="Get Directions"
                            >
                              Map
                            </SeventhButton>
                          );
                        })()}

                        {/* Parking Directions */}
                        {(() => {
                          const hasExplicitParking = Boolean(
                            show.parkingUrl || show.parkingInfo,
                          );
                          if (!hasExplicitParking) {
                            return (
                              <div
                                title="No Parking Link"
                                className="seventh--btn pointer-events-none cursor-not-allowed text-white/20 opacity-25 select-none"
                              >
                                <span>
                                  {" "}
                                  <CarIcon className="h-3.5 w-3.5 shrink-0 text-white/20" />
                                  <span>Park</span>
                                </span>
                              </div>
                            );
                          }
                          const pUrl =
                            show.parkingUrl ||
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parking near ${show.venue} ${show.city || ""} ${show.state || ""}`)}`;
                          return (
                            <a
                              href={pUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={
                                show.parkingInfo
                                  ? `Parking: ${show.parkingInfo}`
                                  : "Parking Directions"
                              }
                              className="btn-action-purple flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2"
                            >
                              <CarIcon className="h-3.5 w-3.5 shrink-0 text-purple-300" />
                              <span>Park</span>
                            </a>
                          );
                        })()}

                        {show._id && isFan && !isPrivate && (
                          <button
                            onClick={() => handleToggleNotification(show)}
                            disabled={subscribingId === show._id}
                            title={
                              subscribedShowIdsSet.has(show._id)
                                ? "Mute notifications for this show"
                                : "Notify me about this show"
                            }
                            className="btn-action-purple btn-icon-square"
                          >
                            {subscribingId === show._id ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-lg border-2 border-white border-t-transparent" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Calendar Add */}
                        {!isPrivate && (
                          <div className="calendar-dropdown-container relative shrink-0">
                            <button
                              onClick={() =>
                                setActiveCalDropdownId(
                                  activeCalDropdownId === `${rowId}-mobile`
                                    ? null
                                    : `${rowId}-mobile`,
                                )
                              }
                              title="Add to Calendar"
                              className="btn-action-purple btn-icon-square cursor-pointer"
                            >
                              <CalendarDays className="h-4 w-4" />
                            </button>
                            {activeCalDropdownId === `${rowId}-mobile` && (
                              <div className="absolute right-0 z-50 mt-2 min-w-[165px] rounded-xl border border-purple-400/30 bg-[#0c0721]/95 py-1.5 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.95)] backdrop-blur-[45px]">
                                <a
                                  href={getGoogleCalendarUrl(show)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setActiveCalDropdownId(null)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition-colors hover:bg-[var(--color-accent)]/20 hover:text-white"
                                >
                                  Google Cal
                                </a>
                                <a
                                  href={getICSFileUrl(show)}
                                  download={`${show.venue.replace(/\s+/g, "_")}_show.ics`}
                                  onClick={() => setActiveCalDropdownId(null)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition-colors hover:bg-[var(--color-accent)]/20 hover:text-white"
                                >
                                  iCal / Apple
                                </a>
                                <a
                                  href={getICSFileUrl(show)}
                                  download={`${show.venue.replace(/\s+/g, "_")}_show.ics`}
                                  onClick={() => setActiveCalDropdownId(null)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition-colors hover:bg-[var(--color-accent)]/20 hover:text-white"
                                >
                                  Outlook
                                </a>
                                <button
                                  onClick={() => {
                                    setActiveCalDropdownId(null);
                                    document
                                      .getElementById("proximity-notify")
                                      ?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="flex w-full cursor-pointer items-center gap-2 border-t border-white/10 px-4 py-2 pt-2 text-left text-xs transition-colors hover:bg-[var(--color-accent)]/20 hover:text-white"
                                >
                                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-purple-400" />{" "}
                                  SMS / Text Alerts
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && show._id && (
                      <div className="mt-3 flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(show)}
                          className="h-9 cursor-pointer rounded border border-blue-500/20 bg-blue-600/10 px-2 text-blue-400 transition-colors hover:bg-blue-600 hover:text-white"
                        >
                          <Edit className="mr-1 inline h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteShow(show._id)}
                          className="h-9 cursor-pointer rounded border border-rose-500/20 bg-rose-600/10 px-2 text-rose-400 transition-colors hover:bg-rose-600 hover:text-white"
                        >
                          <X className="mr-1 inline h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <WavyRowDivider seed={i} active={isUpNext} />
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-[var(--color-text-muted)]">
              <p>No shows match your filters.</p>
              <button
                onClick={clearAll}
                className="mt-4 cursor-pointer transition-colors hover:text-white"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Show Edit/Add Modal */}
      {isModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
            <div className="relative my-8 w-full max-w-2xl animate-[fade-in-up_0.2s_ease-out] overflow-hidden rounded-lg border border-white/10 bg-[var(--color-bg-surface)]">
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-[var(--color-accent)] to-emerald-500" />
              <div className="p-6 text-left md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5">
                      {editingShow ? (
                        <>
                          <Edit className="h-5 w-5" /> Edit Show Date
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5" /> Add New Show Date
                        </>
                      )}
                    </span>
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="cursor-pointer p-2 text-white/50 transition-colors hover:text-white"
                  >
                    ✕ Close
                  </button>
                </div>

                {modalError && (
                  <div className="mb-6 border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400">
                    {modalError}
                  </div>
                )}

                <form onSubmit={handleSaveShow} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="tour-form-venue"
                        className="mb-1.5 block text-white/30"
                      >
                        Venue Name *
                      </label>
                      <input
                        id="tour-form-venue"
                        type="text"
                        required
                        value={formVenue}
                        onChange={(e) => setFormVenue(e.target.value)}
                        placeholder="e.g. Station 34"
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tour-form-date"
                        className="mb-1.5 block text-white/30"
                      >
                        Event Date *
                      </label>
                      <input
                        id="tour-form-date"
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="tour-form-city"
                        className="mb-1.5 block text-white/30"
                      >
                        City *
                      </label>
                      <input
                        id="tour-form-city"
                        type="text"
                        required
                        value={formCity}
                        onChange={(e) => setFormCity(e.target.value)}
                        placeholder="e.g. Mt. Prospect"
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tour-form-state"
                        className="mb-1.5 block text-white/30"
                      >
                        State *
                      </label>
                      <input
                        id="tour-form-state"
                        type="text"
                        required
                        value={formState}
                        onChange={(e) => setFormState(e.target.value)}
                        placeholder="e.g. IL"
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                      <label
                        htmlFor="tour-form-time"
                        className="mb-1.5 block text-white/30"
                      >
                        Show Time
                      </label>
                      <input
                        id="tour-form-time"
                        type="text"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        placeholder="e.g. 8:00pm"
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tour-form-doors-time"
                        className="mb-1.5 block text-white/30"
                      >
                        Doors Open
                      </label>
                      <input
                        id="tour-form-doors-time"
                        type="text"
                        value={formDoorsTime}
                        onChange={(e) => setFormDoorsTime(e.target.value)}
                        placeholder="e.g. 7:00pm"
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tour-form-play-time"
                        className="mb-1.5 block text-white/30"
                      >
                        Band Plays
                      </label>
                      <input
                        id="tour-form-play-time"
                        type="text"
                        value={formPlayTime}
                        onChange={(e) => setFormPlayTime(e.target.value)}
                        placeholder="e.g. 8:30pm"
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tour-form-cover"
                        className="mb-1.5 block text-white/30"
                      >
                        Cover / Admission
                      </label>
                      <input
                        id="tour-form-cover"
                        type="text"
                        value={formCover}
                        onChange={(e) => setFormCover(e.target.value)}
                        placeholder="e.g. Free, $10"
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="tour-form-ticket-link"
                        className="mb-1.5 block text-white/30"
                      >
                        Ticket Link (URL)
                      </label>
                      <input
                        id="tour-form-ticket-link"
                        type="url"
                        value={formTicketLink}
                        onChange={(e) => setFormTicketLink(e.target.value)}
                        placeholder="https://..."
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tour-form-directions-link"
                        className="mb-1.5 block text-white/30"
                      >
                        Directions / Google Maps (URL)
                      </label>
                      <input
                        id="tour-form-directions-link"
                        type="url"
                        value={formDirectionsLink}
                        onChange={(e) => {
                          setFormDirectionsLink(e.target.value);
                          setFormMapUrl(e.target.value);
                        }}
                        placeholder="https://maps.google.com/..."
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="tour-form-parking-url"
                        className="mb-1.5 block text-white/30"
                      >
                        Parking Directions Link (URL)
                      </label>
                      <input
                        id="tour-form-parking-url"
                        type="url"
                        value={formParkingUrl}
                        onChange={(e) => setFormParkingUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tour-form-parking-info"
                        className="mb-1.5 block text-white/30"
                      >
                        Parking Info / Notes
                      </label>
                      <input
                        id="tour-form-parking-info"
                        type="text"
                        value={formParkingInfo}
                        onChange={(e) => setFormParkingInfo(e.target.value)}
                        placeholder="e.g. Free lot behind building"
                        className="placeholder: w-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="tour-form-notes"
                      className="mb-1.5 block text-white/30"
                    >
                      Notes / Description
                    </label>
                    <textarea
                      aria-label="Text input"
                      id="tour-form-notes"
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="e.g. Unplugged Acoustic Show"
                      className="placeholder: w-full resize-none border border-white/10 bg-white/[0.03] px-4 py-2.5 text-white/20 transition-colors outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div className="my-2 grid grid-cols-2 gap-4 border-t border-b border-white/10 py-3 sm:grid-cols-4">
                    <div className="flex cursor-pointer items-center gap-2 select-none">
                      <SquishyToggle
                        id="tour-all-ages-toggle"
                        label="All Ages Show"
                        checked={formAllAges}
                        onChange={setFormAllAges}
                      />
                      <span>All Ages Show</span>
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 select-none">
                      <SquishyToggle
                        id="tour-is-festival-toggle"
                        label="Is Festival"
                        checked={formIsFestival}
                        onChange={setFormIsFestival}
                      />
                      <span>Is Festival</span>
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 select-none">
                      <SquishyToggle
                        id="tour-is-private-toggle"
                        label="Private Event"
                        checked={formIsPrivate}
                        onChange={setFormIsPrivate}
                      />
                      <span>Private Event</span>
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 select-none">
                      <SquishyToggle
                        id="tour-is-unplugged-toggle"
                        label="Unplugged Show"
                        checked={formIsUnplugged}
                        onChange={setFormIsUnplugged}
                      />
                      <span>Unplugged Show</span>
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 select-none">
                      <SquishyToggle
                        id="tour-is-outdoor-toggle"
                        label="Outdoor Show"
                        checked={formIsOutdoor}
                        onChange={setFormIsOutdoor}
                      />
                      <span>Outdoor Show</span>
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 select-none">
                      <SquishyToggle
                        id="tour-is-casino-toggle"
                        label="Casino Show"
                        checked={formIsCasino}
                        onChange={setFormIsCasino}
                      />
                      <span>Casino Show</span>
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 select-none">
                      <SquishyToggle
                        id="tour-is-special-event-toggle"
                        label="Special Event"
                        checked={formIsSpecialEvent}
                        onChange={setFormIsSpecialEvent}
                      />
                      <span>Special Event</span>
                    </div>
                  </div>

                  <div className="flex gap-3 border-t border-white/5 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 cursor-pointer bg-[#00000029] py-3 transition-colors hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 cursor-pointer bg-[var(--color-accent)] py-3 transition-colors hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Save Show"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {notifyPopupShow &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex cursor-default items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setNotifyPopupShow(null)}
          >
            <div
              className="relative mx-4 w-full max-w-sm animate-[fadeIn_0.2s_ease] cursor-auto border border-white/10 bg-[var(--color-bg-surface)] text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Accent bar */}
              <div className="h-1 rounded-t-2xl bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)]" />

              <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-[var(--color-accent)]"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3>Set Up Alerts</h3>
                      <p className="r">{notifyPopupShow.venue}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifyPopupShow(null)}
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-[#00000029] text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Show info */}
                <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <p className=" ">
                    {notifyPopupShow.venue} — {notifyPopupShow.city},{" "}
                    {notifyPopupShow.state}
                  </p>
                  <p className="mt-0.5">
                    {notifyPopupShow.date} · {notifyPopupShow.time}
                  </p>
                </div>

                {/* What would you like? */}
                <p className="mb-2">
                  What would you like to be notified about?
                </p>

                <div className="flex flex-col gap-2">
                  {/* This show */}
                  <button
                    type="button"
                    onClick={() =>
                      setNotifyPrefs((p) => ({ ...p, thisShow: !p.thisShow }))
                    }
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${notifyPrefs.thisShow ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10" : "border-white/10 bg-white/[0.02]"}`}
                  >
                    <span
                      className={`relative h-4 w-8 flex-shrink-0 rounded-lg transition-colors ${notifyPrefs.thisShow ? "bg-[var(--color-accent)]" : "bg-white/10"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-3 w-3 rounded-lg bg-white transition-colors ${notifyPrefs.thisShow ? "left-[14px]" : "left-0.5"}`}
                      />
                    </span>
                    <div className="text-left">
                      <p className="flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5" /> This specific show
                      </p>
                      <p className="mt-0">
                        Reminders & updates for {notifyPopupShow.venue}
                      </p>
                    </div>
                  </button>

                  {/* Proximity shows */}
                  <button
                    type="button"
                    onClick={() =>
                      setNotifyPrefs((p) => ({ ...p, proximity: !p.proximity }))
                    }
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${notifyPrefs.proximity ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10" : "border-white/10 bg-white/[0.02]"}`}
                  >
                    <span
                      className={`relative h-4 w-8 flex-shrink-0 rounded-lg transition-colors ${notifyPrefs.proximity ? "bg-[var(--color-accent)]" : "bg-white/10"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-3 w-3 rounded-lg bg-white transition-colors ${notifyPrefs.proximity ? "left-[14px]" : "left-0.5"}`}
                      />
                    </span>
                    <div className="text-left">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> Shows near me
                      </p>
                      <p className="mt-0">
                        Get emailed when we book near your area
                      </p>
                    </div>
                  </button>

                  {/* Newsletter */}
                  <button
                    type="button"
                    onClick={() =>
                      setNotifyPrefs((p) => ({
                        ...p,
                        newsletter: !p.newsletter,
                      }))
                    }
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${notifyPrefs.newsletter ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10" : "border-white/10 bg-white/[0.02]"}`}
                  >
                    <span
                      className={`relative h-4 w-8 flex-shrink-0 rounded-lg transition-colors ${notifyPrefs.newsletter ? "bg-[var(--color-accent)]" : "bg-white/10"}`}
                    >
                      <span
                        className={`absolute top-0.5 h-3 w-3 rounded-lg bg-white transition-colors ${notifyPrefs.newsletter ? "left-[14px]" : "left-0.5"}`}
                      />
                    </span>
                    <div className="text-left">
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Newsletter & exclusives
                      </p>
                      <p className="mt-0">News, drops & merch updates</p>
                    </div>
                  </button>
                </div>

                {/* Sending to email */}
                {member?.email ? (
                  <p className="mt-3 text-center text-xs text-white/60">
                    Notifications will be sent to{" "}
                    <span className=" ">{member.email}</span>
                  </p>
                ) : (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs text-white/70">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="fan@example.com"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setNotifyPopupShow(null)}
                    className="flex-1 cursor-pointer rounded-lg bg-[#00000029] py-2.5 transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNotifyConfirm}
                    disabled={
                      (!member?.email && !notifyEmail.trim()) ||
                      (!notifyPrefs.thisShow &&
                        !notifyPrefs.proximity &&
                        !notifyPrefs.newsletter)
                    }
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[var(--color-accent)] py-2.5 shadow-[0_0_15px_rgba(255,10,61,0.3)] transition-colors hover:brightness-110 disabled:opacity-40"
                  >
                    {subscribingId ? (
                      "Saving..."
                    ) : (
                      <>
                        <Bell className="h-3.5 w-3.5" /> Enable Alerts
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {/* ── Font Customizer Modal/Panel ── */}
      {isFontCustomizerOpen && (
        <div className="pointer-events-none fixed right-6 bottom-6 z-50 p-0">
          <div
            className="pointer-events-auto relative flex w-full max-w-sm animate-[fadeIn_0.2s_ease] flex-col border border-white/10 bg-[var(--color-bg-surface)]/95 p-6 select-none md:p-8"
            style={{ animation: "scaleIn 0.2s ease" }}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="r">Font Tester</h3>
              <button
                onClick={() => setIsFontCustomizerOpen(false)}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-[#00000029] text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Font Family */}
            <div className="mb-5">
              <label
                htmlFor="tour-font-style"
                className="mb-2 block text-white/50"
              >
                Font Style
              </label>
              <select
                id="tour-font-style"
                value={tourFontFamily}
                onChange={(e) => setTourFontFamily(e.target.value)}
                className="form-input cursor-pointer"
              >
                <option
                  value="var(--font-body)"
                  className="bg-[var(--color-bg-surface)]"
                >
                  Switzer (Default)
                </option>
                <option
                  value="var(--font-heading)"
                  className="bg-[var(--color-bg-surface)]"
                >
                  Rockstar (Heading)
                </option>
                <option value="Inter" className="bg-[var(--color-bg-surface)]">
                  Inter
                </option>
                <option
                  value="Montserrat"
                  className="bg-[var(--color-bg-surface)]"
                >
                  Montserrat
                </option>
                <option value="Outfit" className="bg-[var(--color-bg-surface)]">
                  Outfit
                </option>
                <option value="Syne" className="bg-[var(--color-bg-surface)]">
                  Syne
                </option>
                <option
                  value="Playfair Display"
                  className="bg-[var(--color-bg-surface)]"
                >
                  Playfair Display
                </option>
                <option
                  value="Courier New"
                  className="bg-[var(--color-bg-surface)]"
                >
                  Monospace
                </option>
              </select>
            </div>

            {/* Font Size */}
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="tour-font-size-slider"
                  className="r text-white/50"
                >
                  Font Size
                </label>
                <span className="text-[var(--color-accent)]">
                  {tourFontSize}
                </span>
              </div>
              <input
                id="tour-font-size-slider"
                type="range"
                min="10"
                max="24"
                value={parseInt(tourFontSize) || 13}
                onChange={(e) => setTourFontSize(`${e.target.value}px`)}
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--color-accent)]"
              />
              <div className="mt-0.5 flex justify-between text-white/30">
                <span>10px</span>
                <span>17px</span>
                <span>24px</span>
              </div>
            </div>

            {/* Website Button Font Size */}
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="tour-website-btn-size-slider"
                  className="r text-white/50"
                >
                  Website Button Size
                </label>
                <span className="text-[var(--color-accent)]">
                  {websiteBtnFontSize}
                </span>
              </div>
              <input
                id="tour-website-btn-size-slider"
                type="range"
                min="8"
                max="22"
                value={parseInt(websiteBtnFontSize) || 10}
                onChange={(e) => {
                  const v = `${e.target.value}px`;
                  setWebsiteBtnFontSize(v);
                  localStorage.setItem("7h_tour_website_btn_font_size", v);
                }}
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--color-accent)]"
              />
              <div className="mt-0.5 flex justify-between text-white/30">
                <span>8px</span>
                <span>15px</span>
                <span>22px</span>
              </div>
            </div>

            {/* Row Padding */}
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="tour-row-padding-slider"
                  className="r text-white/50"
                >
                  Row Padding
                </label>
                <span className="text-[var(--color-accent)]">
                  {tourRowPadding}
                </span>
              </div>
              <input
                id="tour-row-padding-slider"
                type="range"
                min="0"
                max="40"
                value={parseInt(tourRowPadding) || 0}
                onChange={(e) => setTourRowPadding(`${e.target.value}px`)}
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--color-accent)]"
              />
              <div className="mt-0.5 flex justify-between text-white/30">
                <span>0px</span>
                <span>20px</span>
                <span>40px</span>
              </div>
            </div>

            {/* Row Spacing */}
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="tour-row-spacing-slider"
                  className="r text-white/50"
                >
                  Row Spacing (Margin)
                </label>
                <span className="text-[var(--color-accent)]">{tourRowGap}</span>
              </div>
              <input
                id="tour-row-spacing-slider"
                type="range"
                min="0"
                max="30"
                value={parseInt(tourRowGap) || 0}
                onChange={(e) => setTourRowGap(`${e.target.value}px`)}
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--color-accent)]"
              />
              <div className="mt-0.5 flex justify-between text-white/30">
                <span>0px</span>
                <span>15px</span>
                <span>30px</span>
              </div>
            </div>

            {/* Row Height */}
            <div className="mb-5">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="tour-row-height-slider"
                  className="r text-white/50"
                >
                  Row Height
                </label>
                <span className="text-[var(--color-accent)]">
                  {tourRowHeight}
                </span>
              </div>
              <input
                id="tour-row-height-slider"
                type="range"
                min="30"
                max="100"
                value={parseInt(tourRowHeight) || 40}
                onChange={(e) => setTourRowHeight(`${e.target.value}px`)}
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--color-accent)]"
              />
              <div className="mt-0.5 flex justify-between text-white/30">
                <span>30px</span>
                <span>65px</span>
                <span>100px</span>
              </div>
            </div>

            {/* Map Fade Mask Controls */}
            <div className="mb-5 border-t border-white/10 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <label className="r">Map Fade Mask</label>
                <SquishyToggle
                  id="map-fade-mask-toggle"
                  label="Map Fade Mask"
                  checked={mapMaskEnabled}
                  onChange={(checked) => {
                    setMapMaskEnabled(checked);
                    localStorage.setItem(
                      "7h_tour_map_mask_enabled",
                      String(checked),
                    );
                  }}
                />
              </div>

              {mapMaskEnabled && (
                <>
                  {/* Map Top Fade Distance */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="map-mask-top-slider"
                        className="r text-white/50"
                      >
                        Top Fade Clip
                      </label>
                      <span className="text-[var(--color-accent)]">
                        {mapMaskTop}px
                      </span>
                    </div>
                    <input
                      id="map-mask-top-slider"
                      type="range"
                      min="0"
                      max="150"
                      value={mapMaskTop}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMapMaskTop(val);
                        localStorage.setItem(
                          "7h_tour_map_mask_top",
                          String(val),
                        );
                      }}
                      className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--color-accent)]"
                    />
                    <div className="mt-0.5 flex justify-between text-white/30">
                      <span>0px</span>
                      <span>75px</span>
                      <span>150px</span>
                    </div>
                  </div>

                  {/* Map Bottom Fade Distance */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="map-mask-bottom-slider"
                        className="r text-white/50"
                      >
                        Bottom Fade Clip
                      </label>
                      <span className="text-[var(--color-accent)]">
                        {mapMaskBottom}px
                      </span>
                    </div>
                    <input
                      id="map-mask-bottom-slider"
                      type="range"
                      min="0"
                      max="150"
                      value={mapMaskBottom}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMapMaskBottom(val);
                        localStorage.setItem(
                          "7h_tour_map_mask_bottom",
                          String(val),
                        );
                      }}
                      className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--color-accent)]"
                    />
                    <div className="mt-0.5 flex justify-between text-white/30">
                      <span>0px</span>
                      <span>75px</span>
                      <span>150px</span>
                    </div>
                  </div>

                  {/* Map Left Fade Distance */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="map-mask-left-slider"
                        className="r text-white/50"
                      >
                        Left Fade Clip
                      </label>
                      <span className="text-[var(--color-accent)]">
                        {mapMaskLeft}px
                      </span>
                    </div>
                    <input
                      id="map-mask-left-slider"
                      type="range"
                      min="0"
                      max="150"
                      value={mapMaskLeft}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMapMaskLeft(val);
                        localStorage.setItem(
                          "7h_tour_map_mask_left",
                          String(val),
                        );
                      }}
                      className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--color-accent)]"
                    />
                    <div className="mt-0.5 flex justify-between text-white/30">
                      <span>0px</span>
                      <span>75px</span>
                      <span>150px</span>
                    </div>
                  </div>

                  {/* Map Right Fade Distance */}
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="map-mask-right-slider"
                        className="r text-white/50"
                      >
                        Right Fade Clip
                      </label>
                      <span className="text-[var(--color-accent)]">
                        {mapMaskRight}px
                      </span>
                    </div>
                    <input
                      id="map-mask-right-slider"
                      type="range"
                      min="0"
                      max="150"
                      value={mapMaskRight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMapMaskRight(val);
                        localStorage.setItem(
                          "7h_tour_map_mask_right",
                          String(val),
                        );
                      }}
                      className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-[var(--color-accent)]"
                    />
                    <div className="mt-0.5 flex justify-between text-white/30">
                      <span>0px</span>
                      <span>75px</span>
                      <span>150px</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Code telemetry */}
            <div className="mb-5 rounded-lg border border-white/10 bg-black/40 p-3.5 whitespace-pre-wrap select-all">
              {`font-size: ${tourFontSize};\nfont-family: ${tourFontFamily === "var(--font-body)" ? "Barlow" : tourFontFamily === "var(--font-heading)" ? "Rockstar" : tourFontFamily};\npadding: ${tourRowPadding} 0;\nmargin-bottom: ${tourRowGap};\nmin-height: ${tourRowHeight};`}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `font-size: ${tourFontSize};\nfont-family: ${tourFontFamily === "var(--font-body)" ? "Barlow" : tourFontFamily === "var(--font-heading)" ? "Rockstar" : tourFontFamily};\npadding: ${tourRowPadding} 0;\nmargin-bottom: ${tourRowGap};\nmin-height: ${tourRowHeight};`,
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="animate-all cursor-pointer rounded-lg border border-white/10 bg-[#00000029] py-2.5 transition-colors hover:bg-white/10"
              >
                {copied ? "Copied! ✓" : "Copy CSS"}
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("7h_tour_font_size", tourFontSize);
                  localStorage.setItem("7h_tour_font_family", tourFontFamily);
                  localStorage.setItem("7h_tour_row_padding", tourRowPadding);
                  localStorage.setItem("7h_tour_row_gap", tourRowGap);
                  localStorage.setItem("7h_tour_row_height", tourRowHeight);
                  setIsFontCustomizerOpen(false);
                }}
                className="cursor-pointer rounded-lg bg-[var(--color-accent)] py-2.5 transition-colors hover:bg-[rgba(255,10,61,0.9)]"
              >
                Apply & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
