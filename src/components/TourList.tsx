/* eslint-disable react-doctor/no-giant-component */
"use client";
/* eslint-disable react-doctor/prefer-useReducer */
/* eslint-disable react-doctor/no-async-event-handler-without-reentry-guard */

import { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from "react";
import { Plus, X, MessageSquare, Printer, Edit, Mic, MapPin, CalendarDays, Bell, Mail, Car, ParkingCircle, ParkingSquare, Search } from "lucide-react";
import { SanityTourDate } from "@/lib/sanity";
import dynamic from "next/dynamic";
const TourMap = dynamic(() => import("./TourMap"), { ssr: false });
import { isShowOver, typeConfig, getShowType, getShowDateTime } from "@/lib/tour-helpers";
import CountdownTimer from "./CountdownTimer";
import { useMember } from "@/context/MemberContext";
const GooeyMessagesDropdown = dynamic(() => import("@/components/GooeyMessagesDropdown"), { ssr: false });
import { SquishyToggle } from "@/components/SquishyToggle";
import LazySection from "@/components/LazySection";
import CosmicRadialButton from "@/components/CosmicRadialButton";

// ─── Wavy canvas divider ─────────────────────────────────────────────────────
function WavyRowDivider({ active }: { seed?: number; active?: boolean }) {
  return (
    <div
      className={`w-full h-[1px] transition-colors duration-300 ${active ?"bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.5)]"
        : "bg-white/10 group-hover:bg-purple-400/30"
        }`}
      aria-hidden="true"
    />
  );
}
// ─────────────────────────────────────────────────────────────────────────────


const shows = [
  { day: "Fri", date: "January 2", venue: "Station 34", city: "Mt. Prospect", state: "IL", time: "8:30pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/place?address=34%20S%20Main%20St,%20Mount%20Prospect,%20IL%2060056,%20United%20States&coordinate=42.064738,-87.936988&name=34%20S%20Main%20St&map=explore", websiteUrl: "https://stationthirtyfour.com/events/" },
  { day: "Sat", date: "January 3", venue: "Old Republic", city: "Elgin", state: "IL", time: "8:00pm", info: "All Age Outdoor", mapUrl: "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd", websiteUrl: "https://www.oldrepublicbar.com" },
  { day: "Fri", date: "January 9", venue: "Rookies", city: "Hoffman Est.", state: "IL", time: "8:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/place?address=4607%20W%20Higgins%20Rd,%20Hoffman%20Estates,%20IL%2060192,%20United%20States&coordinate=42.074379,-88.191220&name=4607%20W%20Higgins%20Rd", websiteUrl: "https://www.rookiespub.com/hoffmanestates.html" },
  { day: "Sat", date: "January 10", venue: "Private Event", city: "", state: "", time: "", info: "", mapUrl: "", websiteUrl: "" },
  { day: "Sun", date: "January 11", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "2:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com" },
  { day: "Sat", date: "January 17", venue: "Chicago Music Cruise", city: "Miami", state: "FL", time: "", info: "MSC World America", mapUrl: "", websiteUrl: "http://www.chicagomusiccruise.com" },
  { day: "Wed", date: "January 28", venue: "WGN TV News Segment", city: "Chicago", state: "IL", time: "10:00am", info: "TV Appearance", mapUrl: "", websiteUrl: "https://wgntv.com" },
  { day: "Fri", date: "January 30", venue: "Youth Services Fundraiser", city: "Wilmette", state: "IL", time: "7:00pm", info: "Fundraiser - Join Us!", mapUrl: "https://maps.apple.com/?address=1100%20Laramie%20Ave,%20Wilmette,%20IL%2060091", websiteUrl: "https://e.givesmart.com/events/Lk3/" },
  { day: "Sat", date: "January 31", venue: "Des Plaines Theater", city: "Des Plaines", state: "IL", time: "9:00pm", info: "", mapUrl: "https://maps.apple.com/place?address=1476%20Miner%20St,%20Des%20Plaines,%20IL%2060161,%20United%20States&coordinate=42.041800,-87.887154&name=1476%20Miner%20St", websiteUrl: "https://desplainestheatre.com" },
  { day: "Fri", date: "February 6", venue: "Chicago Auto Show First Look", city: "Chicago", state: "IL", time: "7:30pm", info: "Ticketed Gala", mapUrl: "https://maps.apple.com/?address=2301%20S%20Dr%20Martin%20Luther%20King%20Jr,%20Chicago,%20IL%2060616&q=McCormick%20Place", websiteUrl: "https://www.chicagoautoshow.com/first-look-for-charity/" },
  { day: "Sat", date: "February 7", venue: "Hard Rock Casino", city: "Gary", state: "IN", time: "9:00pm", info: "Casino Show", mapUrl: "https://maps.apple.com/?address=5400%20W%2029th%20Ave,%20Gary,%20IN%2046406", websiteUrl: "https://www.hardrockcasinonorthernindiana.com" },
  { day: "Fri", date: "February 13", venue: "Durty Nellies", city: "Palatine", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=180%20N%20Smith%20St,%20Palatine,%20IL%2060067", websiteUrl: "https://durtynellies.com" },
  { day: "Sat", date: "February 14", venue: "Stage 119", city: "Elmhurst", state: "IL", time: "8:30pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=119%20N%20York%20St,%20Elmhurst,%20IL%2060126", websiteUrl: "https://www.stage-events-elmhurst.com" },
  { day: "Fri", date: "February 20", venue: "Jamos Live", city: "Mokena", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=10160%20191st%20St,%20Mokena,%20IL%2060448", websiteUrl: "https://www.jamoslive.com" },
  { day: "Sat", date: "February 21", venue: "Barb's Rescue Gala", city: "Schaumburg", state: "IL", time: "8:30pm", info: "Ticketed Gala", mapUrl: "https://maps.apple.com/?address=401%20N%20Roselle%20Rd,%20Schaumburg,%20IL%2060194", websiteUrl: "https://www.barbsrescue.org" },
  { day: "Fri", date: "February 27", venue: "Evenflow", city: "Geneva", state: "IL", time: "9:30pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=302%20W%20State%20St,%20Geneva,%20IL%2060134", websiteUrl: "https://evenflowmusic.com" },
  { day: "Sat", date: "February 28", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com" },
  { day: "Fri", date: "March 6", venue: "Bannerman's", city: "Bartlett", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=858%20S%20Illinois%20Rte%2059,%20Bartlett,%20IL%2060103", websiteUrl: "https://bannermanssportsgrill.com" },
  { day: "Sat", date: "March 7", venue: "Broken Oar", city: "P. Barrington", state: "IL", time: "9:00pm", info: "", mapUrl: "https://maps.apple.com/?address=614%20Rawson%20Bridge%20Rd,%20Barrington,%20IL", websiteUrl: "https://www.brokenoar.com" },
  { day: "Tue", date: "March 11", venue: "Home Show", city: "Chicago", state: "IL", time: "", info: "McCormick Place", mapUrl: "https://maps.apple.com/place?address=2301%20S%20Indiana%20Ave,%20Chicago,%20IL%2060616&name=McCormick%20Place%20West", websiteUrl: "https://www.theinspiredhomeshow.com/events/" },
  { day: "Sat", date: "March 22", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com" },
  { day: "Fri", date: "March 27", venue: "Tailgaters", city: "Bolingbrook", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444", websiteUrl: "http://www.tailgatersgrill.com" },
  { day: "Sat", date: "March 28", venue: "Old Republic", city: "Elgin", state: "IL", time: "8:00pm", info: "All Age Outdoor", mapUrl: "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd", websiteUrl: "https://www.oldrepublicbar.com" },
  { day: "Fri", date: "April 3", venue: "Rookie's Rockhouse", city: "Hoffman Est.", state: "IL", time: "8:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/place?address=4607%20W%20Higgins%20Rd,%20Hoffman%20Estates,%20IL%2060192,%20United%20States&coordinate=42.074379,-88.191220&name=4607%20W%20Higgins%20Rd", websiteUrl: "https://www.rookiespub.com/hoffmanestates.html" },
  { day: "Sat", date: "April 4", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com" },
  { day: "Fri", date: "April 10", venue: "Corrigan's Pub", city: "Shorewood", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=700%20W%20Jefferson%20St,%20Shorewood,%20IL%2060404", websiteUrl: "https://corriganspub52.com" },
  { day: "Sat", date: "April 11", venue: "Midway Sports", city: "Bartlett", state: "IL", time: "8:30pm", info: "All-Age till 10pm", mapUrl: "https://maps.apple.com/?q=Midway+Sports+Bartlett+IL", websiteUrl: "https://midwaybartlett.com" },
  { day: "Thu", date: "April 17", venue: "Joe's Live", city: "Rosemont", state: "IL", time: "8:00pm", info: "", mapUrl: "https://maps.apple.com/?address=5441%20Park%20Pl,%20Des%20Plaines,%20IL%2060118", websiteUrl: "https://www.joesliverosemont.com" },
  { day: "Fri", date: "April 18", venue: "Stage 119", city: "Elmhurst", state: "IL", time: "8:30pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=119%20N%20York%20St,%20Elmhurst,%20IL%2060126", websiteUrl: "https://www.stage-events-elmhurst.com" },
  { day: "Thu", date: "April 24", venue: "Evenflow", city: "Geneva", state: "IL", time: "9:30pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=302%20W%20State%20St,%20Geneva,%20IL%2060134", websiteUrl: "https://evenflowmusic.com" },
  { day: "Fri", date: "April 25", venue: "Rochaus", city: "West Dundee", state: "IL", time: "9:00pm", info: "", mapUrl: "https://maps.apple.com/?address=96%20W%20Main%20St,%20West%20Dundee,%20IL%2060118", websiteUrl: "https://rochaus.com" },
  { day: "Fri", date: "May 1", venue: "Station 34", city: "Mt. Prospect", state: "IL", time: "8:30pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://maps.apple.com/place?address=34%20S%20Main%20St,%20Mount%20Prospect,%20IL%2060056,%20United%20States&coordinate=42.064738,-87.936988&name=34%20S%20Main%20St&map=explore", websiteUrl: "https://stationthirtyfour.com/events/" },
  { day: "Sat", date: "May 2", venue: "Deer Park Fest", city: "Deer Park", state: "IL", time: "6:00pm", info: "Outdoor All-Age Festival", mapUrl: "", websiteUrl: "" },
  { day: "Fri", date: "May 8", venue: "Bannerman's", city: "Bartlett", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=858%20S%20Illinois%20Rte%2059,%20Bartlett,%20IL%2060103", websiteUrl: "https://bannermanssportsgrill.com" },
  { day: "Sat", date: "May 9", venue: "Sideouts", city: "Island Lake", state: "IL", time: "9:00pm", info: "Outdoor Beer Garden", mapUrl: "https://maps.apple.com/?address=4018%20Roberts%20Rd,%20Island%20Lake,%20IL%2060042", websiteUrl: "https://www.3dsideouts.com/events/7th-heaven/" },
  { day: "Thu", date: "May 15", venue: "Durty Nellies", city: "Palatine", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=180%20N%20Smith%20St,%20Palatine,%20IL%2060067", websiteUrl: "https://durtynellies.com" },
  { day: "Fri", date: "May 16", venue: "Tailgaters", city: "Bolingbrook", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=431%20W%20Boughton%20Rd,%20Bolingbrook,%20IL%2060444", websiteUrl: "http://www.tailgatersgrill.com" },
  { day: "Sat", date: "May 22", venue: "Sundance Saloon", city: "Mundelein", state: "IL", time: "9:00pm", info: "21 & Over", mapUrl: "https://maps.apple.com/?address=2061%20W%20Maple%20Ave,%20Mundelein,%20IL%2060060,%20United%20States&ll=42.276570,-88.041803", websiteUrl: "https://www.theoriginalsundancesaloon.com" },
  { day: "Fri", date: "May 23", venue: "Hard Rock Casino", city: "Rockford", state: "IL", time: "9:00pm", info: "Casino Show", mapUrl: "https://maps.apple.com/?address=7801%20E%20State%20St,%20Rockford,%20IL%2061108", websiteUrl: "https://casino.hardrock.com/rockford/entertainment/upcoming-events/7th-heaven" },
  { day: "Sat", date: "May 24", venue: "Bandito Barney's", city: "East Dundee", state: "IL", time: "9:00pm", info: "Outdoor", mapUrl: "https://maps.apple.com/?address=10%20N%20River%20St,%20East%20Dundee,%20IL%2060118", websiteUrl: "https://www.banditobarneysbeachclub.com" },
  { day: "Thu", date: "May 29", venue: "Will County Beer & Bourbon Fest", city: "Joliet", state: "IL", time: "6:00pm", info: "Festival", mapUrl: "", websiteUrl: "https://habitatwill.org/events/mix-of-26-beyond-beer-bourbon-fest/friday-event-details/" },
  { day: "Fri", date: "May 30", venue: "Old Republic", city: "Elgin", state: "IL", time: "8:00pm", info: "All Age Outdoor", mapUrl: "https://maps.apple.com/?address=155%20S%20Randall%20Rd,%20Elgin,%20IL%2060123,%20United%20States&ll=42.028251,-88.336949&q=155%20S%20Randall%20Rd", websiteUrl: "https://www.oldrepublicbar.com" },
  { day: "Wed", date: "July 1", venue: "Arlington Hts Frontier Days", city: "Arlington Hts", state: "IL", time: "8:00pm", info: "Outdoor All-Age Festival", mapUrl: "https://maps.apple.com/?address=Arlington+Heights,+IL", websiteUrl: "" },
];

// --- Helper functions ---
function getShowTags(show: any): string[] {
  const info = show.info || '';
  const lower = info.toLowerCase();
  const rawTags = show.tags || [];
  const hasTag = (t: string) => rawTags.map((x: string) => x.toLowerCase()).includes(t.toLowerCase());

  const tags: string[] = [];
  if (lower.includes("unplugged") || hasTag("unplugged")) tags.push("Unplugged");
  if (lower.includes("outdoor") || lower.includes("beer garden") || hasTag("outdoor")) tags.push("Outdoor");
  if (lower.includes("21 &") || lower.includes("21+") || show.allAges === false || hasTag("21+")) tags.push("21+");
  if (lower.includes("all age") || lower.includes("all-age") || show.allAges === true || hasTag("all ages") || hasTag("all-ages")) tags.push("All Ages");
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

const typeOptions = ["Unplugged", "Outdoor", "21+", "All Ages", "Special Event"];

// Shared dropdown styles
const selectClass = "appearance-none bg-transparent border-0 rounded-lg pl-4 pr-8 py-2.5 text-[0.5rem] font-bold uppercase tracking-wider text-white cursor-pointer transition-all duration-200 focus:outline-none";
const activeSelect = "!border-[var(--color-accent)] ! text-[var(--color-accent)]";

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
  const details = `Catch 7th Heaven live!\nShow Info: ${show.info || ""}\nMore details: ${show.websiteUrl || 'https://www.7thheavenband.com/tour'}`;
  const location = show.city ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}` : show.venue;

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
  const details = `Catch 7th Heaven live!\\nShow Info: ${show.info || ""}\\nMore details: ${show.websiteUrl || 'https://www.7thheavenband.com/tour'}`;
  const location = show.city ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}` : show.venue;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//7th Heaven//Tour Calendar//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${encodeURIComponent(show.venue)}@7thheavenband.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsLines.join('\r\n'))}`;
}

interface TourListProps {
  initialShows?: any[];
  hideMap?: boolean;
  maxShows?: number;
}

export default function TourList({ initialShows, hideMap, maxShows }: TourListProps) {
  const { member, isLoggedIn, openModal } = useMember();
  const todayStartTimestamp = useSyncExternalStore(
    () => () => { },
    () => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); },
    () => 0
  );
  const isFan = !member || member.role === "fan";
  const [showPastShows, setShowPastShows] = useState(false);
  const [activeMonth, setActiveMonth] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [activeCity, setActiveCity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState<number | null>(maxShows || 20);

  // Set initial display limit to 15 on mobile (<1024px) after mount
  useEffect(() => {
    if (!maxShows && window.innerWidth < 1024) {
      setDisplayLimit(15);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [activeCalDropdownId, setActiveCalDropdownId] = useState<string | null>(null);
  const [isSortBarStuck, setIsSortBarStuck] = useState(false);
  const [sortBarOpacity, setSortBarOpacity] = useState(1);

  // Subscribed show IDs for custom specific notifications
  const [subscribedShowIds, setSubscribedShowIds] = useState<string[]>([]);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  // Notification popup state
  const [notifyPopupShow, setNotifyPopupShow] = useState<any>(null);

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
    const savedWebsiteSize = localStorage.getItem("7h_tour_website_btn_font_size");
    if (savedWebsiteSize) setWebsiteBtnFontSize(savedWebsiteSize);

    const savedMaskEnabled = localStorage.getItem("7h_tour_map_mask_enabled");
    const savedMaskTop = localStorage.getItem("7h_tour_map_mask_top");
    const savedMaskBottom = localStorage.getItem("7h_tour_map_mask_bottom");
    const savedMaskLeft = localStorage.getItem("7h_tour_map_mask_left");
    const savedMaskRight = localStorage.getItem("7h_tour_map_mask_right");
    if (savedMaskEnabled !== null) setMapMaskEnabled(savedMaskEnabled === "true");
    if (savedMaskTop) setMapMaskTop(parseInt(savedMaskTop, 10) || 50);
    if (savedMaskBottom) setMapMaskBottom(parseInt(savedMaskBottom, 10) || 50);
    if (savedMaskLeft) setMapMaskLeft(parseInt(savedMaskLeft, 10) || 50);
    if (savedMaskRight) setMapMaskRight(parseInt(savedMaskRight, 10) || 50);
  }, []);

  // Dynamically load Google Fonts when selected
  useEffect(() => {
  }, [tourFontFamily]);
  const [notifyPrefs, setNotifyPrefs] = useState({ proximity: true, thisShow: true, newsletter: false });

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
      const lowerNotes = ((show.notes || "") + " " + (show.info || "")).toLowerCase();
      setFormIsUnplugged(currentTags.includes("unplugged") || lowerNotes.includes("unplugged"));
      setFormIsOutdoor(currentTags.includes("outdoor") || lowerNotes.includes("outdoor") || lowerNotes.includes("beer garden"));
      setFormIsCasino(currentTags.includes("casino") || lowerNotes.includes("casino"));
      setFormIsSpecialEvent(
        currentTags.includes("special") ||
        currentTags.includes("gala") ||
        currentTags.includes("fundraiser") ||
        currentTags.includes("cruise") ||
        currentTags.includes("tv") ||
        lowerNotes.includes("gala") ||
        lowerNotes.includes("fundraiser") ||
        lowerNotes.includes("cruise") ||
        lowerNotes.includes("tv")
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

  const handleEditClick = (show: any) => {
    setEditingShow(show);
    populateForm(show);
    setIsModalOpen(true);
  };

  const handleSaveShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVenue.trim() || !formCity.trim() || !formState.trim() || !formDate) {
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
      _id: editingShow?._id
    };

    try {
      const url = "/api/admin/shows";
      const method = editingShow ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
    if (!confirm("Are you sure you want to delete this show date from Sanity?")) return;
    try {
      const res = await fetch(`/api/admin/shows?id=${id}`, {
        method: "DELETE"
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
      if (!target.closest('.calendar-dropdown-container')) {
        setActiveCalDropdownId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const loadSubscriptions = useCallback(async () => {
    if (!member?.email) return;
    try {
      const res = await fetch(`/api/shows/notify-me?email=${encodeURIComponent(member.email)}`);
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
    // Not logged in → open sign-up modal
    if (!isLoggedIn || !member?.email) {
      openModal?.('signup');
      return;
    }

    const showId = show._id;
    if (!showId) return;

    // Already subscribed → unsubscribe immediately
    if (subscribedShowIds.includes(showId)) {
      handleUnsubscribe(showId);
      return;
    }

    // Show the notification preferences popup
    setNotifyPopupShow(show);
    setNotifyPrefs({ proximity: true, thisShow: true, newsletter: false });
  };

  const handleUnsubscribe = async (showId: string) => {
    const email = member?.email;
    if (!email) return;
    setSubscribingId(showId);
    try {
      const res = await fetch(`/api/shows/notify-me?email=${encodeURIComponent(email)}&showId=${encodeURIComponent(showId)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSubscribedShowIds(prev => prev.filter(id => id !== showId));
      }
    } catch { } finally {
      setSubscribingId(null);
    }
  };

  const handleNotifyConfirm = async () => {
    if (!notifyPopupShow || !member?.email) return;
    const showId = notifyPopupShow._id;
    setSubscribingId(showId);
    try {
      const res = await fetch("/api/shows/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showId,
          email: member.email.trim(),
          venueName: notifyPopupShow.venue,
          showDate: notifyPopupShow.date,
          city: notifyPopupShow.city,
          state: notifyPopupShow.state,
          preferences: notifyPrefs
        })
      });
      if (res.ok) {
        setSubscribedShowIds(prev => [...prev, showId]);
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
  const parseShowDate = useCallback((dateStr: string, startDateStr?: string): Date => {
    if (startDateStr && /^\d{4}-\d{2}-\d{2}/.test(startDateStr)) {
      return new Date(startDateStr + 'T00:00:00');
    }
    const currentYear = new Date().getFullYear();
    const d = new Date(`${dateStr}, ${currentYear}`);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }, []);

  // Parse both date and time into a precise Date object for comparison
  const parseShowDateTime = useCallback((dateStr: string, timeStr?: string, startDateStr?: string): Date => {
    return getShowDateTime(startDateStr, dateStr, timeStr);
  }, []);

  const isShowToday = useCallback((show: any): boolean => {
    const showDate = parseShowDate(show.date, show.startDate);
    const today = new Date();
    return showDate.getFullYear() === today.getFullYear() &&
      showDate.getMonth() === today.getMonth() &&
      showDate.getDate() === today.getDate();
  }, [parseShowDate]);

  const getCountdownString = useCallback((show: any): string => {
    const showDateTime = parseShowDateTime(show.date, show.time, show.startDate);
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
  }, [parseShowDateTime, currentTime]);

  const displayShows = useMemo(() => {
    const rawList = (initialShows && initialShows.length > 0) ? initialShows : shows;
    // Sort chronologically by date and time to support same-day multi-time setups
    const list = [...rawList];
    list.sort((a, b) => {
      const timeA = parseShowDateTime(a.date, a.time, a.startDate).getTime();
      const timeB = parseShowDateTime(b.date, b.time, b.startDate).getTime();
      return timeA - timeB;
    });
    return list;
  }, [initialShows, parseShowDateTime]);

  // Filter shows by time (exclude past shows by default unless showPastShows is true)
  const activeShowsByTime = useMemo(() => {
    const upcoming = displayShows.filter(s => showPastShows || !isShowOver(s));
    return upcoming.length > 0 ? upcoming : displayShows;
  }, [displayShows, showPastShows]);

  // Derive filter options from current upcoming tour dates list
  const upcomingShowsList = useMemo(() => {
    return displayShows.filter(s => !isShowOver(s));
  }, [displayShows]);

  const months = useMemo(() => {
    const list = showPastShows ? activeShowsByTime : upcomingShowsList;
    return [...new Set(list.map((s: any) => s.date.split(' ')[0]))];
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

  // Rebuilt date sort bar scroll-driven fade from scratch using plain vanilla JS
  useEffect(() => {
    let rafId: number | null = null;

    const updateScrollFade = () => {
      rafId = null;
      const sortBar = sortBarRef.current;
      if (!sortBar) return;

      // 1. READ ALL LAYOUT GEOMETRY FIRST (prevents forced reflow)
      const sentinel = sentinelRef.current;
      const headerEl = typeof document !== "undefined" ? document.querySelector("header") : null;
      const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 80;
      const sentinelTop = sentinel ? sentinel.getBoundingClientRect().top : 999;
      const isAboveSentinel = sentinelTop <= (headerBottom + 0.5);

      // 2. WRITE DOM STYLES AND CLASSES LAST (clean render cycle)
      sortBar.style.opacity = "1";
      sortBar.style.pointerEvents = "auto";

      if (isStuckRef.current !== isAboveSentinel) {
        isStuckRef.current = isAboveSentinel;
        sortBar.classList.toggle("is-stuck", isAboveSentinel);
        if (isAboveSentinel) {
          document.documentElement.classList.add("tour-sort-stuck");
        } else {
          document.documentElement.classList.remove("tour-sort-stuck");
        }
      }
    };

    const handleScrollOrResize = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateScrollFade);
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    // Also bind to Lenis smooth scroll instance if active
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.on("scroll", handleScrollOrResize);
    }

    updateScrollFade();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      const l = (window as any).__lenis;
      if (l) {
        try {
          l.off("scroll", handleScrollOrResize);
        } catch { }
      }
      document.documentElement.classList.remove("tour-sort-stuck");
    };
  }, []);

  const scrollToShow = useCallback((venue: string, date: string) => {
    // Clear any filters first so the row is visible
    setActiveMonth("All");
    setActiveType("All");
    setActiveCity("All");
    setSearchQuery("");
    const prefix = `tour-${venue}-${date}`.replace(/\s+/g, '-').toLowerCase();
    // Delay to let filters clear and DOM update
    setTimeout(() => {
      const el = document.querySelector(`[id^="${prefix}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      if (activeMonth !== "All" && !s.date.startsWith(activeMonth)) return false;
      if (activeType !== "All" && !new Set(getShowTags(s)).has(activeType)) return false;
      if (activeCity !== "All" && s.city !== activeCity) return false;
      if (q && !s.venue.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q) && !s.info.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeShowsByTime, activeMonth, activeType, activeCity, searchQuery]);

  const subscribedShowIdsSet = useMemo(() => new Set(subscribedShowIds), [subscribedShowIds]);

  const hasActiveFilters = activeMonth !== "All" || activeType !== "All" || activeCity !== "All" || searchQuery !== "";

  const clearAll = () => {
    setActiveMonth("All");
    setActiveType("All");
    setActiveCity("All");
    setSearchQuery("");
  };

  // ── Print Tour List ──────────────────────────────────────────────────────────
  const handlePrintTourList = useCallback(() => {
    const showsToPrint = filtered;
    if (showsToPrint.length === 0) return;

    // Build filter summary line
    const filterParts: string[] = [];
    if (activeMonth !== "All") filterParts.push(activeMonth);
    if (activeCity !== "All") filterParts.push(activeCity);
    if (searchQuery) filterParts.push(`"${searchQuery}"`);
    const filterLine = filterParts.length > 0
      ? `<p style="font-size:11px;color:#888;margin:0 0 16px;font-style:  ">Filtered by: ${filterParts.join(' · ')}</p>`
      : '';

    const rows = showsToPrint.map((show: any) => {
      const location = show.city ? `${show.city}${show.state ? `, ${show.state}` : ''}` : '';
      const isPast = isShowOver(show);
      return `
        <tr style="${isPast ? 'opacity:0.45;' : ''}border-bottom:1px solid #eee">
          <td style="padding:7px 10px;font-weight:700;color:#7c3aed;text-transform:uppercase;font-size:11px;white-space:nowrap">${show.day || ''}</td>
          <td style="padding:7px 10px;white-space:nowrap">${show.date || ''}</td>
          <td style="padding:7px 10px;font-weight:700">${show.venue || ''}</td>
          <td style="padding:7px 10px;color:#555">${location}</td>
          <td style="padding:7px 10px;white-space:nowrap">${show.time || ''}</td>
          <td style="padding:7px 10px;font-size:11px;color:#888">${show.info || show.notes || ''}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html><head>
<title>7th Heaven — Tour Dates</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Switzer', system-ui, sans-serif; color: #1a1a1a; padding: 40px; max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 4px; }
  .subtitle { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead th { text-align: left; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #999; border-bottom: 2px solid #222; }
  tbody tr:last-child { border-bottom: none; }
  .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #ddd; font-size: 10px; color: #aaa; display: flex; justify-content: space-between; }
  @media print {
    body { padding: 20px; }
    @page { margin: 0.5in; }
  }
</style>
</head><body>
<h1>7th Heaven — Tour Dates</h1>
<p class="subtitle">${showsToPrint.length} show${showsToPrint.length !== 1 ? 's' : ''} · Printed ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
${filterLine}
<table>
  <thead><tr>
    <th>Day</th><th>Date</th><th>Venue</th><th>City</th><th>Time</th><th>Info</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">
  <span>7thheaven.band</span>
  <span>Generated from 7thheaven.band/shows</span>
</div>
</body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      // Give fonts a moment to load before triggering print
      setTimeout(() => printWindow.print(), 400);
    }
  }, [filtered, activeMonth, activeCity, searchQuery]);

  const showCount = filtered.length;

  const upcomingCount = useMemo(() => {
    return displayShows.filter(s => !isShowOver(s)).length;
  }, [displayShows]);

  const filteredUpcomingCount = useMemo(() => {
    return filtered.filter(s => !isShowOver(s)).length;
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
      const showDateTime = parseShowDateTime(show.date, show.time, show.startDate);
      const showEndTime = new Date(showDateTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours duration
      if (now >= showDateTime && now < showEndTime) {
        return show;
      }
    }
    // 2. Otherwise return the first upcoming show in the future
    for (const show of displayShows) {
      if (!show.city) continue; // skip private events
      const showDateTime = parseShowDateTime(show.date, show.time, show.startDate);
      if (showDateTime >= now) return show;
    }
    return null; // no upcoming shows
  };

  const upNext = getUpcomingShow();

  // Calculate days until show
  const getDaysUntil = () => {
    if (!upNext) return "";
    const now = new Date();

    // Check if the show is happening right now
    const showDateTime = parseShowDateTime(upNext.date, upNext.time, upNext.startDate);
    const showEndTime = new Date(showDateTime.getTime() + 4 * 60 * 60 * 1000);
    if (now >= showDateTime && now < showEndTime) {
      return "Happening Now";
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const showDate = parseShowDate(upNext.date, upNext.startDate);
    const diff = Math.round((showDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Tonight";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return "";
    return `${diff} days away`;
  };

  const daysLabel = getDaysUntil();

  const gridClass = "grid-cols-1 lg:grid-cols-[60px_165px_2.5fr_1.4fr_1fr_130px_minmax(120px,1fr)]";

  return (
    <>
      {/* Table */}
      <section
        className="py-0 relative"
        ref={tableRef}
        id="tour-table-container"
        style={{
          '--tour-font-family': tourFontFamily,
          '--tour-row-padding': tourRowPadding,
          '--tour-row-height': tourRowHeight,
          '--tour-row-gap': tourRowGap,
        } as React.CSSProperties}
      >
        <div className="w-full relative site-container">

          {!hideMap && (
            <div
              className="mt-0 mb-4 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden isolate"
              style={{
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              <LazySection fallbackHeight="350px">
                <TourMap shows={hasActiveFilters ? filtered : activeShowsByTime} nextShowVenue={upNext?.venue} nextShowCity={upNext?.city} onPinClick={handleMapPinClick} />
              </LazySection>
            </div>
          )}

          {/* Up Next — Neon Glow / Festival */}
          {upNext && (
            <div className="my-6 relative z-10">
              <div className="relative">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  {/* Left Column: Info */}
                  <div className="relative flex flex-col justify-between min-h-[140px]">
                    {/* UP NEXT label */}
                    <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] mb-5">
                      <span className={`w-1.5 h-1.5 rounded-lg ${daysLabel ==="Happening Now" ? "bg-red-500 animate-ping" : "bg-[var(--color-accent)] animate-pulse"}`} />
                      <span className={daysLabel === "Happening Now" ? "text-red-600 font-extrabold" : " text-[var(--color-accent)] font-extrabold"}>
                        {daysLabel === "Happening Now" ? "Happening Now" : "Up Next"}
                      </span>
                    </div>

                    {/* Venue name */}
                    <h2 className="font-[var(--font-heading)] font-bold text-white leading-[1] mb-4 uppercase">
                      {upNext.venue}
                    </h2>

                    {/* Date + Location + Time */}
                    <div className="flex items-center gap-2 text-[clamp(0.75rem,1.2vw,0.85rem)] text-white/90 font-bold whitespace-nowrap">
                      <span>
                        {upNext.day === "Mon" ? "Monday" : upNext.day === "Tue" ? "Tuesday" : upNext.day === "Wed" ? "Wednesday" : upNext.day === "Thu" ? "Thursday" : upNext.day === "Fri" ? "Friday" : upNext.day === "Sat" ? "Saturday" : "Sunday"}, {upNext.date.split(" ")[0]} {upNext.date.split(" ")[1]}
                      </span>
                      {upNext.city && (
                        <>
                          <span className="text-white/40">·</span>
                          <span>{upNext.city}{upNext.state ? `, ${upNext.state}` : ""}</span>
                        </>
                      )}
                      {upNext.playTime ? (
                        <>
                          <span className="text-white/40">·</span>
                          <span className="text-rose-400 font-extrabold">Plays: {upNext.playTime}</span>
                          {upNext.time && (
                            <>
                              <span className="text-white/40">·</span>
                              <span className="text-white/70">Event: {upNext.time}</span>
                            </>
                          )}
                        </>
                      ) : (
                        upNext.time && (
                          <>
                            <span className="text-white/40">·</span>
                            <span className="text-white/80">{upNext.time}</span>
                          </>
                        )
                      )}
                    </div>
                    {upNext.info && (
                      <p className="mt-3 font-bold uppercase tracking-[0.15em]">
                        {upNext.info}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-end gap-5 shrink-0 max-w-full">
                    <CountdownTimer
                      targetDate={upNext.startDate || upNext.date}
                      targetTime={upNext.playTime || upNext.time}
                      className="justify-start md:justify-end gap-4 md:gap-5"
                    />
                    <div className="flex gap-3 sm:gap-5 md:gap-6 items-center flex-wrap max-w-full">
                      {upNext.mapUrl && (
                        <a href={upNext.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] md:text-[13px] font-bold uppercase tracking-wider text-[var(--color-accent)] underline underline-offset-4 decoration-[var(--color-accent)]/50 hover:decoration-[var(--color-accent)] hover:opacity-80 transition-colors p-0 bg-transparent border-none cursor-pointer" id="upnext-map">
                          <span>Directions</span>
                        </a>
                      )}
                      {upNext.websiteUrl && (
                        <a href={upNext.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] md:text-[13px] font-bold uppercase tracking-wider text-[var(--color-accent)] underline underline-offset-4 decoration-[var(--color-accent)]/50 hover:decoration-[var(--color-accent)] hover:opacity-80 transition-colors p-0 bg-transparent border-none cursor-pointer" id="upnext-website">
                          Website
                        </a>
                      )}
                      <div className="relative calendar-dropdown-container">
                        <button aria-label="Next"
                          onClick={() => setActiveCalDropdownId(activeCalDropdownId === 'upnext' ? null : 'upnext')}
                          className="flex items-center gap-1 text-[11px] md:text-[13px] font-bold uppercase tracking-wider text-[var(--color-accent)] underline underline-offset-4 decoration-[var(--color-accent)]/50 hover:decoration-[var(--color-accent)] hover:opacity-80 transition-colors p-0 bg-transparent border-none cursor-pointer"
                          id="upnext-calendar-btn"
                        >
                          Add to Calendar
                        </button>
                        {activeCalDropdownId === 'upnext' && (
                          <div className="absolute left-0 bottom-full mb-2 bg-[var(--card-bg)] border border-[var(--border-color)] py-2 z-50 min-w-[170px] text-[var(--text-color)]">
                            <a href={getGoogleCalendarUrl(upNext)} target="_blank" rel="noopener noreferrer" onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2.5 px-4 py-2.5 font-bold uppercase tracking-wider text-[var(--muted-text)] hover:text-[var(--text-color)] hover: transition-colors text-left w-full">Google Calendar</a>
                            <a href={getICSFileUrl(upNext)} download={`${upNext.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2.5 px-4 py-2.5 font-bold uppercase tracking-wider text-[var(--muted-text)] hover:text-[var(--text-color)] hover: transition-colors text-left w-full">Apple / iCal</a>
                            <a href={getICSFileUrl(upNext)} download={`${upNext.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2.5 px-4 py-2.5 font-bold uppercase tracking-wider text-[var(--muted-text)] hover:text-[var(--text-color)] hover: transition-colors text-left w-full">Outlook</a>
                            <button aria-label="Action button"
                              onClick={() => { setActiveCalDropdownId(null); document.getElementById("proximity-notify")?.scrollIntoView({ behavior: "smooth" }); }}
                              className="flex items-center gap-2.5 px-4 py-2.5 font-bold uppercase tracking-wider text-[var(--muted-text)] hover:text-[var(--text-color)] hover: transition-colors text-left w-full border-t border-[var(--border-color)] mt-1 pt-2.5 cursor-pointer"
                            >SMS / Text Alerts</button>
                          </div>
                        )}
                      </div>
                      <button aria-label="Next"
                        onClick={handlePrintTourList}
                        className="flex items-center gap-1 text-[11px] md:text-[13px] font-bold uppercase tracking-wider text-[var(--color-accent)] underline underline-offset-4 decoration-[var(--color-accent)]/50 hover:decoration-[var(--color-accent)] hover:opacity-80 transition-colors p-0 bg-transparent border-none cursor-pointer"
                      >
                        Print Tour List
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              {member?.role === 'admin' && (
                <button aria-label="Action button"
                  onClick={() => { setEditingShow(null); setIsModalOpen(true); }}
                  className="text-[0.7rem] font-bold uppercase tracking-[0.12em] rounded-lg px-5 py-2.5 bg-[var(--color-accent)] hover:bg-emerald-500 text-white transition-colors duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 border border-emerald-500/35 shadow-emerald-600/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Show
                </button>
              )}

              {hasActiveFilters && (
                <button aria-label="Action button"
                  onClick={clearAll}
                  className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--color-accent)] hover:text-white border border-[var(--color-accent)re] hover:border-[rgba(255,10,61,0.6)] rounded-lg px-2.5 py-1 transition-colors duration-200 cursor-pointer whitespace-nowrap]"
                >Clear</button>
              )}
            </div>
          </div>

          {/* Sentinel — detection only; no longer a spacer (sort bar stays in normal flow always) */}
          <div ref={sentinelRef} className="h-0" aria-hidden="true" />
          <div id="tour-sort-bar" ref={sortBarRef} style={{ opacity: sortBarOpacityRef.current, pointerEvents: sortBarOpacityRef.current > 0.05 ? "auto" : "none" }} className="relative sticky top-[80px] z-[90] flex flex-col gap-3.5 w-full bg-transparent border-0 text-white transition-opacity duration-300 ease-out [&.is-stuck_.sort-bar-bg]:opacity-100">
            <div
              className="sort-bar-bg absolute -top-10 -bottom-10 left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen backdrop-blur-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-none -z-10 opacity-0 transition-opacity duration-300 ease-out"
              style={{
                maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
              }}
            />

            {/* Search Bar ON TOP (Sticks cleanly above table header on scroll for desktop & mobile) */}
            <div className="input-glow-border rounded-lg w-full max-w-[300px] shrink-0">
              <div className="relative flex items-center w-full">
                <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input aria-label="Search" type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-0 rounded-lg no-bg-icon pr-5 py-2 text-white placeholder:text-white/50 focus:outline-none transition-all font-semibold" id="tour-search" />
                {searchQuery && (<button aria-label="Clear search" onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-text)] hover:text-white text-[1.08rem] cursor-pointer z-10"><X className="w-3.5 h-3.5" /></button>)}
              </div>
            </div>

            {/* 7-Column Header Grid (Aligned 1:1 with tour data rows) */}
            <div className={`flex flex-wrap lg:grid ${gridClass} gap-3 sm:gap-4 lg:gap-8 w-full items-center`}>
              {/* Column 1: DAY */}
              <span className="hidden lg:inline-block text-[clamp(16px,1.4vw,21px)] font-bold uppercase tracking-widest text-[var(--text-color)]">Day</span>

              {/* Column 2: MONTH Filter */}
              <div className="relative flex items-center shrink-0">
                <GooeyMessagesDropdown
                  placeholder="MONTH"
                  defaultSelectedId={activeMonth !== "All" ? activeMonth : undefined}
                  customers={months.map((m) => ({ id: m, name: m }))}
                  onSelect={(opt) => setActiveMonth(opt.id)}
                />
              </div>

              {/* Column 3: PLACE / VENUE */}
              <span className="hidden lg:inline-block text-[clamp(16px,1.4vw,21px)] font-bold uppercase tracking-widest text-[var(--text-color)]">Place</span>

              {/* Column 4: CITY Filter */}
              <div className="relative flex items-center shrink-0">
                <GooeyMessagesDropdown
                  placeholder="CITY"
                  defaultSelectedId={activeCity !== "All" ? activeCity : undefined}
                  customers={locationOptions.map(({ city, count }) => ({ id: city, name: `${city} (${count})` }))}
                  onSelect={(opt) => setActiveCity(opt.id)}
                />
              </div>

              {/* Column 5: TIME */}
              <span className="hidden lg:inline-block text-[clamp(16px,1.4vw,22px)] font-bold uppercase tracking-widest text-[var(--text-color)]">Time</span>

              {/* Column 6: MAP/CAL */}
              <span className="hidden lg:inline-block text-[clamp(16px,1.4vw,22px)] font-bold uppercase tracking-widest text-[var(--text-color)] text-center">Map/Cal</span>

              {/* Column 7: WEBSITE */}
              <span className="hidden lg:inline-block text-[clamp(16px,1.4vw,22px)] font-bold uppercase tracking-widest text-[var(--text-color)] text-right">Website</span>
            </div>
          </div>

          <div className="flex flex-col gap-0 overflow-visible pt-0" id="tour-rows-container">
            {Array.from((() => {
              let rows = filtered;
              const effectiveLimit = maxShows || displayLimit;
              if (effectiveLimit && upNext) {
                const startIdx = filtered.findIndex(s => s.date === upNext.date && s.venue === upNext.venue && s.time === upNext.time);
                rows = filtered.slice(startIdx >= 0 ? startIdx : 0, (startIdx >= 0 ? startIdx : 0) + effectiveLimit);
              } else if (effectiveLimit) {
                rows = filtered.slice(0, effectiveLimit);
              }
              return rows;
            })(), (show, i) => ({ show, i })).map(({ show, i }) => {
              const isUpNext = upNext ? (show.date === upNext.date && show.venue === upNext.venue && show.time === upNext.time) : false;
              const rowId = `tour-${show.venue}-${show.date}-${show.time || ''}`.replace(/\s+/g, '-').toLowerCase();
              const isHighlighted = highlightedId === rowId;
              const isPast = todayStartTimestamp > 0 && parseShowDate(show.date, show.startDate).getTime() < todayStartTimestamp;
              const isPrivate = show.isPrivate || show.venue?.toLowerCase() === "private event" || (show.tags && show.tags.includes("private")) || (show.info && show.info.toLowerCase().includes("private")) || false;
              return (
                // eslint-disable-next-line react-doctor/no-array-index-as-key
                <div key={`tour_row_${i}_${show.id || rowId}`} className="group overflow-visible">
                  {/* Desktop Row Layout */}
                  <div
                    className={`tour-row-item relative hidden lg:grid ${gridClass} gap-8 py-3.5 items-center text-[22px] text-white ${isHighlighted ?"" : "bg-transparent"} ${!show.city ? "opacity-50" : ""} ${isPast && !isHighlighted ? "opacity-65" : ""}`}
                    id={rowId}
                  >
                    <span className="font-[var(--font-heading)] font-bold text-[clamp(14px,1.3vw,21px)] uppercase text-[var(--color-accent)] whitespace-nowrap">{show.day}</span>
                    <span className="text-white font-bold text-[clamp(15px,1.5vw,23px)] whitespace-nowrap">{show.date}</span>
                    <span className="font-bold text-white text-[clamp(15px,1.5vw,23px)]">{show.venue}</span>
                    <span className="text-white/80 font-medium text-[clamp(13px,1.2vw,19px)]">{show.city ? `${show.city}${show.state ? `, ${show.state}` : ""}` : ""}</span>
                    <span className="flex items-center gap-2 flex-wrap text-left text-[clamp(14px,1.3vw,21px)]">
                      {(show.doorsTime || show.time || show.playTime) ? (
                        <div className="flex flex-col gap-0.5">
                          {show.doorsTime && <span className="text-white font-medium whitespace-nowrap">Doors: {show.doorsTime}</span>}
                          {show.playTime && <span className="text-rose-400 font-bold text-[0.92rem] whitespace-nowrap">Show: {show.playTime}</span>}
                          {show.time && (show.doorsTime || show.playTime) && <span className="text-white/70 font-medium whitespace-nowrap">Event: {show.time}</span>}
                          {!show.doorsTime && !show.playTime && show.time && <span className="text-white font-bold text-[clamp(14px,1.3vw,21px)] whitespace-nowrap">{show.time}</span>}
                        </div>
                      ) : null}
                      {isShowToday(show) && (
                        <span className="font-bold uppercase tracking-wider text-rose-600 ml-1.5 whitespace-nowrap animate-pulse">
                          {getCountdownString(show)}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center justify-center gap-2">
                      {!isPrivate && (
                        <>
                          {show._id && isFan && (
                            <button aria-label="Action button"
                              onClick={() => handleToggleNotification(show)}
                              disabled={subscribingId === show._id}
                              title={subscribedShowIdsSet.has(show._id) ? "Mute notifications for this show" : "Notify me about this show"}
                              className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors duration-300 shadow-xs cursor-pointer border shrink-0 ${subscribedShowIdsSet.has(show._id) ?"bg-[var(--color-accent)] border-[var(--color-accent)]  text-[var(--color-accent)] hover:bg-[var(--color-accent)]"
                                : "bg-gray-100 border-black/15 text-black hover:bg-gray-200"
                                }`}
                            >
                              {subscribingId === show._id ? (
                                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-lg animate-spin" />
                              ) : subscribedShowIdsSet.has(show._id) ? (
                                <Bell className="w-3.5 h-3.5" />
                              ) : (
                                <Bell className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <div className="w-7 h-7 flex items-center justify-center shrink-0">
                            {(() => {
                              const hasExplicitMap = Boolean(show.mapUrl || show.directionsLink);
                              const rawMapUrl = show.mapUrl || show.directionsLink;
                              const showType = getShowType(show.info || '');
                              const cfg = typeConfig[showType] || typeConfig.full;
                              if (!hasExplicitMap) {
                                return (
                                  <span
                                    title="No Directions Link"
                                    className="flex items-center justify-center p-1 text-white/20 opacity-20 cursor-not-allowed pointer-events-none select-none"
                                  >
                                    <MapPin className="w-5.5 h-5.5" />
                                  </span>
                                );
                              }
                              const gUrl = rawMapUrl!.includes('maps.apple.com')
                                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city || ''} ${show.state || ''}`)}`
                                : rawMapUrl!;
                              return (
                                <a
                                  href={gUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Get Directions"
                                  style={{ color: cfg.color }}
                                  className="flex items-center justify-center p-1 opacity-100 hover:opacity-75 transition-opacity"
                                >
                                  <MapPin className="w-5.5 h-5.5" />
                                </a>
                              );
                            })()}
                          </div>
                          <div className="w-7 h-7 flex items-center justify-center shrink-0">
                            {(() => {
                              const hasExplicitParking = Boolean(show.parkingUrl || show.parkingInfo);
                              const showType = getShowType(show.info || '');
                              const cfg = typeConfig[showType] || typeConfig.full;
                              if (!hasExplicitParking) {
                                return (
                                  <span
                                    title="No Parking Link"
                                    className="flex items-center justify-center p-1 text-white/20 opacity-20 cursor-not-allowed pointer-events-none select-none"
                                  >
                                    <Car className="w-5.5 h-5.5" />
                                  </span>
                                );
                              }
                              const pUrl = show.parkingUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parking near ${show.venue} ${show.city || ''} ${show.state || ''}`)}`;
                              return (
                                <a
                                  href={pUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={show.parkingInfo ? `Parking: ${show.parkingInfo}` : "Parking Directions"}
                                  style={{ color: cfg.color }}
                                  className="flex items-center justify-center p-1 opacity-100 hover:opacity-75 transition-opacity"
                                >
                                  <Car className="w-5.5 h-5.5" />
                                </a>
                              );
                            })()}
                          </div>
                          <div className="w-7 h-7 flex items-center justify-center relative calendar-dropdown-container shrink-0">
                            <button aria-label="Action button" onClick={() => setActiveCalDropdownId(activeCalDropdownId === rowId ? null : rowId)} title="Add to Calendar" className="flex items-center justify-center p-1 text-white/80 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
                              <CalendarDays className="w-5.5 h-5.5" />
                            </button>
                            {activeCalDropdownId === rowId && (
                              <div className="absolute right-0 mt-2 bg-white border border-black/15 py-1.5 z-50 min-w-[150px] text-black">
                                <a href={getGoogleCalendarUrl(show)} target="_blank" rel="noopener noreferrer" onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-black/80 hover:text-black hover:bg-gray-100 transition-colors text-left w-full font-sans">Google Cal</a>
                                <a href={getICSFileUrl(show)} download={`${show.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-black/80 hover:text-black hover:bg-gray-100 transition-colors text-left w-full font-sans">iCal / Apple</a>
                                <a href={getICSFileUrl(show)} download={`${show.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-black/80 hover:text-black hover:bg-gray-100 transition-colors text-left w-full font-sans">Outlook</a>
                                <button aria-label="Action button"
                                  onClick={() => {
                                    setActiveCalDropdownId(null);
                                    document.getElementById("proximity-notify")?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-black/80 hover:text-black hover:bg-gray-100 transition-colors text-left w-full border-t border-black/10 mt-1 pt-2 cursor-pointer font-sans"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" /> SMS / Text Alerts
                                </button>
                                <button aria-label="Action button"
                                  onClick={() => { setActiveCalDropdownId(null); handlePrintTourList(); }}
                                  className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-black/80 hover:text-black hover:bg-gray-100 transition-colors text-left w-full border-t border-black/10 mt-1 pt-2 cursor-pointer font-sans"
                                >
                                  <Printer className="w-3.5 h-3.5 text-purple-600" /> Print Tour List
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
                          href={show.websiteUrl || `https://www.google.com/search?q=${encodeURIComponent(`${show.venue} ${show.city || ''} ${show.state || ''}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={show.websiteUrl ? "Official Venue Website" : "Search Venue Info"}
                          className="inline-flex items-center justify-center whitespace-nowrap font-bold uppercase tracking-widest text-[var(--color-accent)] underline underline-offset-4 decoration-[var(--color-accent)]/50 hover:decoration-[var(--color-accent)] hover:opacity-80 transition-all cursor-pointer"
                          style={{ fontSize: websiteBtnFontSize }}
                        >
                          Website
                        </a>
                      )}
                      {member?.role === 'admin' && show._id && (
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <button aria-label="Action button"
                            onClick={() => handleEditClick(show)}
                            className="px-2 py-1 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-[0.65rem] font-bold uppercase tracking-widest rounded transition-colors cursor-pointer font-sans"
                          >
                            Edit
                          </button>
                          <button aria-label="Action button"
                            onClick={() => handleDeleteShow(show._id)}
                            className="px-2 py-1 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-[0.65rem] font-bold uppercase tracking-widest rounded transition-colors cursor-pointer font-sans"
                          >
                            Del
                          </button>
                        </div>
                      )}
                    </span>
                  </div>

                  {/* Mobile/Tablet Card Layout */}
                  <div
                    className={`tour-row-item relative lg:hidden flex flex-col gap-3.5 pt-4 pb-4 my-2 text-[var(--color-text-secondary)] ${isHighlighted ?" animate-pulse" : isUpNext ? "" : ""} ${!show.city ? "opacity-50" : ""} ${isPast && !isHighlighted ? "opacity-65" : ""}`}
                    id={`${rowId}-mobile`}
                  >

                    {/* Header Row: Date Badge & Time */}
                    <div className="flex items-center justify-between gap-2 ">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-[#00000029] border border-white/10 backdrop-blur-[16px] text-white font-bold tracking-wider uppercase whitespace-nowrap">
                          {show.day} • {show.date}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {(show.doorsTime || show.time || show.playTime) && (
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {show.doorsTime && (
                              <span className="text-white text-[11px] font-medium px-2 py-0.5 bg-[#00000029] border border-white/10 rounded0lg whitespace-nowrap">
                                Doors: {show.doorsTime}
                              </span>
                            )}
                            {show.playTime && (
                              <span className="text-purple-300 text-[11px] font-bold px-2 py-0.5 bg-purple-500/15 border border-purple-500/25 rounded-lg whitespace-nowrap">
                                Show: {show.playTime}
                              </span>
                            )}
                            {show.time && !show.playTime && (
                              <span className="text-white/90 font-bold px-2 py-0.5 bg-white/10 border border-white/10 rounded-lg whitespace-nowrap">
                                {show.time}
                              </span>
                            )}
                          </div>
                        )}
                        {isShowToday(show) && (
                          <span className="font-bold uppercase tracking-wider text-rose-500 animate-pulse">
                            {getCountdownString(show)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details: Venue & Location */}
                    <div className="pt-0.5">
                      <h4 className="font-bold text-white leading-tight uppercase tracking-tight" style={{ fontFamily: "'Switzer', var(--font-barlow-condensed)" }}>{show.venue}</h4>
                      {(show.city || show.state) && (
                        <p className="flex items-center gap-1.5 mt-1 font-semibold">
                          <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                          {show.city ? `${show.city}${show.state ? `, ${show.state}` : ""}` : show.state}
                        </p>
                      )}
                    </div>

                    {/* Tags Row */}
                    {!isPrivate && (
                      <div className="flex items-center gap-2 flex-wrap sm:text-base font-bold">
                        <span className="">{getShowIcon(show)}</span>
                        {show.info && <span className="sm:text-base text-white/70 font-medium">{show.info}</span>}
                        {(show.allAges === true || (show.info && (show.info.toLowerCase().includes("all age") || show.info.toLowerCase().includes("all-age"))) || (show.tags && (show.tags.includes("all ages") || show.tags.includes("all-ages")))) && (
                          <span className="font-bold text-purple-300 uppercase">All Ages</span>
                        )}
                        {(show.allAges === false || (show.info && (show.info.toLowerCase().includes("21 &") || show.info.toLowerCase().includes("21+"))) || (show.tags && show.tags.includes("21+"))) && (
                          <span className="font-bold text-red-400 uppercase">21+</span>
                        )}
                        {getShowTags(show).map(tag => {
                          if (tag === "All Ages" || tag === "21+") return null;
                          let tagColors = "text-[var(--color-accent)]";
                          return (
                            <span key={tag} className={`font-bold uppercase ${tagColors}`}>{tag}</span>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Buttons Row */}
                    {!isPrivate && (
                      <div className="flex items-center gap-2">
                        {/* Map Directions */}
                        {(() => {
                          const hasExplicitMap = Boolean(show.mapUrl || show.directionsLink);
                          const rawMapUrl = show.mapUrl || show.directionsLink;
                          if (!hasExplicitMap) {
                            return (
                              <span
                                title="No Directions Link"
                                className="flex-1 py-2 px-3 flex items-center justify-center gap-1.5 rounded-lg bg-white/5 border border-white/5 text-white/20 font-bold opacity-25 cursor-not-allowed pointer-events-none select-none"
                              >
                                <MapPin className="w-3.5 h-3.5 text-white/20" />
                                <span>Map</span>
                              </span>
                            );
                          }
                          const gUrl = rawMapUrl!.includes('maps.apple.com')
                            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city || ''} ${show.state || ''}`)}`
                            : rawMapUrl!;
                          return (
                            <CosmicRadialButton
                              onClick={() => window.open(gUrl, '_blank', 'noopener,noreferrer')}
                              icon={<MapPin className="w-3.5 h-3.5 text-white" />}
                              className="flex-1 !py-2 !px-3 !text-xs !font-bold"
                              title="Get Directions"
                            >
                              Map
                            </CosmicRadialButton>
                          );
                        })()}

                        {/* Parking Directions */}
                        {(() => {
                          const hasExplicitParking = Boolean(show.parkingUrl || show.parkingInfo);
                          if (!hasExplicitParking) {
                            return (
                              <span
                                title="No Parking Link"
                                className="flex-1 py-2 px-3 flex items-center justify-center gap-1.5 rounded-lg bg-white/5 border border-white/5 text-white/20 font-bold opacity-25 cursor-not-allowed pointer-events-none select-none"
                              >
                                <Car className="w-3.5 h-3.5 text-white/20" />
                                <span>Ride / Park</span>
                              </span>
                            );
                          }
                          const pUrl = show.parkingUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parking near ${show.venue} ${show.city || ''} ${show.state || ''}`)}`;
                          return (
                            <a
                              href={pUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={show.parkingInfo ? `Parking: ${show.parkingInfo}` : "Parking Directions"}
                              className="flex-1 py-2 px-3 flex items-center justify-center gap-1.5 rounded-lg bg-purple-600/30 border border-purple-400/30 text-white font-bold transition-all hover:bg-purple-600/60 active:scale-95"
                            >
                              <Car className="w-3.5 h-3.5 text-purple-300" />
                              <span>Ride / Park</span>
                            </a>
                          );
                        })()}

                        {show._id && isFan && !isPrivate && (
                          <button aria-label="Action button"
                            onClick={() => handleToggleNotification(show)}
                            disabled={subscribingId === show._id}
                            title={subscribedShowIdsSet.has(show._id) ? "Mute notifications for this show" : "Notify me about this show"}
                            className="p-2 w-9 h-9 flex items-center justify-center rounded-lg border shrink-0 bg-purple-600/30 border-purple-400/30 text-white hover:bg-purple-600/60 transition-all active:scale-95"
                          >
                            {subscribingId === show._id ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-lg animate-spin" />
                            ) : (
                              <Bell className="w-4 h-4 text-white" />
                            )}
                          </button>
                        )}

                        {/* Calendar Add */}
                        {!isPrivate && (
                          <div className="relative calendar-dropdown-container shrink-0">
                            <button aria-label="Action button" onClick={() => setActiveCalDropdownId(activeCalDropdownId === `${rowId}-mobile` ? null : `${rowId}-mobile`)} title="Add to Calendar" className="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-600/40 border border-purple-400/40 text-white hover:bg-purple-600/80 transition-all duration-300 cursor-pointer">
                              <CalendarDays className="w-4 h-4 text-white" />
                            </button>
                            {activeCalDropdownId === `${rowId}-mobile` && (
                              <div className="absolute left-0 mt-2 border border-white/10 rounded-lg py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.9)] z-50 min-w-[150px] backdrop-blur-[45px] font-sans">
                                <a href={getGoogleCalendarUrl(show)} target="_blank" rel="noopener noreferrer" onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-colors text-left w-full">Google Cal</a>
                                <a href={getICSFileUrl(show)} download={`${show.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-colors text-left w-full">iCal / Apple</a>
                                <a href={getICSFileUrl(show)} download={`${show.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-colors text-left w-full">Outlook</a>
                                <button aria-label="Action button"
                                  onClick={() => {
                                    setActiveCalDropdownId(null);
                                    document.getElementById("proximity-notify")?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-colors text-left w-full border-t border-white/5 mt-1 pt-2 cursor-pointer font-sans"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> SMS / Text Alerts
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Directions & Parking — shown only when the show has a directionsLink or parking/directions notes */}
                        {!isPrivate && (show.directionsLink || show.notes) && (() => {
                          const href = show.directionsLink || (show.mapUrl
                            ? (show.mapUrl.includes('maps.apple.com')
                              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city} ${show.state}`)}`
                              : show.mapUrl)
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city} ${show.state}`)}`);
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={show.notes ? `Parking & Directions:\n${show.notes}` : 'Get Directions & Parking'}
                              className="flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap font-bold uppercase tracking-wider h-9 bg-[rgba(255,255,255,0.06)] border border-white/10 text-white/80 hover:text-white hover:bg-[rgba(255,255,255,0.12)] hover: border-white/10 transition-colors rounded-lg text-center"
                            >
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              Directions{show.notes ? ' & Parking' : ''}
                            </a>
                          );
                        })()}
                      </div>
                    )}

                    {/* Admin Actions */}
                    {member?.role === 'admin' && show._id && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button aria-label="Action button" onClick={() => handleEditClick(show)} className="px-2 h-9 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"><Edit className="w-3.5 h-3.5 inline mr-1" /> Edit</button>
                        <button aria-label="Action button" onClick={() => handleDeleteShow(show._id)} className="px-2 h-9 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"><X className="w-3.5 h-3.5 inline mr-1" /> Del</button>
                      </div>
                    )}
                  </div>
                  <WavyRowDivider seed={i} active={isUpNext} />
                </div>
              );
            })}
          </div>

          {displayLimit && !maxShows && filtered.length > displayLimit && (
            <div className="flex justify-center pt-8 pb-16 relative z-20">
              <CosmicRadialButton
                onClick={() => setDisplayLimit(null)}
                className="!px-8 !py-3.5 !text-xs sm:!text-sm !font-extrabold"
              >
                Load The Rest ({filtered.length - displayLimit} More Shows)
              </CosmicRadialButton>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-[var(--color-text-muted)]">
              <p className="">No shows match your filters.</p>
              <button aria-label="Action button" onClick={clearAll} className="mt-4 text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Show Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-[var(--color-bg-surface)] border border-white/10 rounded-lg w-full max-w-2xl relative my-8 overflow-hidden animate-[fade-in-up_0.2s_ease-out]">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-[var(--color-accent)] to-emerald-500" />
            <div className="p-6 md:p-8 text-left">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span className="flex items-center gap-1.5">{editingShow ? <><Edit className="w-5 h-5" /> Edit Show Date</> : <><Plus className="w-5 h-5" /> Add New Show Date</>}</span>
                </h3>
                <button aria-label="Action button"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕ Close
                </button>
              </div>

              {modalError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveShow} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tour-form-venue" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Venue Name *</label>
                    <input aria-label="Input field" id="tour-form-venue" type="text" required value={formVenue} onChange={e => setFormVenue(e.target.value)}
                      placeholder="e.g. Station 34" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="tour-form-date" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Event Date *</label>
                    <input aria-label="Input field" id="tour-form-date" type="date" required value={formDate} onChange={e => setFormDate(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="tour-form-city" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">City *</label>
                    <input aria-label="Input field" id="tour-form-city" type="text" required value={formCity} onChange={e => setFormCity(e.target.value)}
                      placeholder="e.g. Mt. Prospect" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="tour-form-state" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">State *</label>
                    <input aria-label="Input field" id="tour-form-state" type="text" required value={formState} onChange={e => setFormState(e.target.value)}
                      placeholder="e.g. IL" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="tour-form-time" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Show Time</label>
                    <input aria-label="Input field" id="tour-form-time" type="text" value={formTime} onChange={e => setFormTime(e.target.value)}
                      placeholder="e.g. 8:00pm" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="tour-form-doors-time" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Doors Open</label>
                    <input aria-label="Input field" id="tour-form-doors-time" type="text" value={formDoorsTime} onChange={e => setFormDoorsTime(e.target.value)}
                      placeholder="e.g. 7:00pm" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="tour-form-play-time" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Band Plays</label>
                    <input aria-label="Input field" id="tour-form-play-time" type="text" value={formPlayTime} onChange={e => setFormPlayTime(e.target.value)}
                      placeholder="e.g. 8:30pm" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="tour-form-cover" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Cover / Admission</label>
                    <input aria-label="Input field" id="tour-form-cover" type="text" value={formCover} onChange={e => setFormCover(e.target.value)}
                      placeholder="e.g. Free, $10" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tour-form-ticket-link" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Ticket Link (URL)</label>
                    <input aria-label="Input field" id="tour-form-ticket-link" type="url" value={formTicketLink} onChange={e => setFormTicketLink(e.target.value)}
                      placeholder="https://..." className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="tour-form-directions-link" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Directions / Google Maps (URL)</label>
                    <input aria-label="Input field" id="tour-form-directions-link" type="url" value={formDirectionsLink} onChange={e => { setFormDirectionsLink(e.target.value); setFormMapUrl(e.target.value); }}
                      placeholder="https://maps.google.com/..." className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tour-form-parking-url" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Parking Directions Link (URL)</label>
                    <input aria-label="Input field" id="tour-form-parking-url" type="url" value={formParkingUrl} onChange={e => setFormParkingUrl(e.target.value)}
                      placeholder="https://maps.google.com/..." className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="tour-form-parking-info" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Parking Info / Notes</label>
                    <input aria-label="Input field" id="tour-form-parking-info" type="text" value={formParkingInfo} onChange={e => setFormParkingInfo(e.target.value)}
                      placeholder="e.g. Free lot behind building" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors" />
                  </div>
                </div>

                <div>
                  <label htmlFor="tour-form-notes" className="uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Notes / Description</label>
                  <textarea aria-label="Text input" id="tour-form-notes" rows={2} value={formNotes} onChange={e => setFormNotes(e.target.value)}
                    placeholder="e.g. Unplugged Acoustic Show" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-colors resize-none" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-t border-b border-white/5 my-2">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                    <SquishyToggle
                      id="tour-all-ages-toggle"
                      label="All Ages Show"
                      checked={formAllAges}
                      onChange={setFormAllAges}
                    />
                    <span>All Ages Show</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                    <SquishyToggle
                      id="tour-is-festival-toggle"
                      label="Is Festival"
                      checked={formIsFestival}
                      onChange={setFormIsFestival}
                    />
                    <span>Is Festival</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                    <SquishyToggle
                      id="tour-is-private-toggle"
                      label="Private Event"
                      checked={formIsPrivate}
                      onChange={setFormIsPrivate}
                    />
                    <span>Private Event</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                    <SquishyToggle
                      id="tour-is-unplugged-toggle"
                      label="Unplugged Show"
                      checked={formIsUnplugged}
                      onChange={setFormIsUnplugged}
                    />
                    <span>Unplugged Show</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                    <SquishyToggle
                      id="tour-is-outdoor-toggle"
                      label="Outdoor Show"
                      checked={formIsOutdoor}
                      onChange={setFormIsOutdoor}
                    />
                    <span>Outdoor Show</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                    <SquishyToggle
                      id="tour-is-casino-toggle"
                      label="Casino Show"
                      checked={formIsCasino}
                      onChange={setFormIsCasino}
                    />
                    <span>Casino Show</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                    <SquishyToggle
                      id="tour-is-special-event-toggle"
                      label="Special Event"
                      checked={formIsSpecialEvent}
                      onChange={setFormIsSpecialEvent}
                    />
                    <span>Special Event</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button aria-label="Action button" type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-[#00000029] hover:bg-white/10 text-white font-bold uppercase tracking-wider transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button aria-label="Action button" type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-[var(--color-accent)] hover:bg-emerald-500 text-white font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer">
                    {submitting ? "Saving..." : "Save Show"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {notifyPopupShow && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-default" onClick={() => setNotifyPopupShow(null)}>
          <div className="bg-[var(--color-bg-surface)] border border-white/10 w-full max-w-sm mx-4 shadow-[0_20px_60px_-15px_rgba(255,10,61,0.3)] animate-[fadeIn_0.2s_ease] text-left cursor-auto" onClick={(e) => e.stopPropagation()}>
            {/* Accent bar */}
            <div className="h-1 bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)] rounded-t-2xl" />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-accent)]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Set Up Alerts</h3>
                    <p className="uppercase tracking-wider">{notifyPopupShow.venue}</p>
                  </div>
                </div>
                <button aria-label="Action button" onClick={() => setNotifyPopupShow(null)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#00000029] hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Show info */}
              <div className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5 mb-4">
                <p className="font-semibold">{notifyPopupShow.venue} — {notifyPopupShow.city}, {notifyPopupShow.state}</p>
                <p className="mt-0.5">{notifyPopupShow.date} · {notifyPopupShow.time}</p>
              </div>

              {/* What would you like? */}
              <p className="uppercase tracking-[0.15em] mb-2 font-bold">What would you like to be notified about?</p>

              <div className="flex flex-col gap-2">
                {/* This show */}
                <button aria-label="Action button"
                  type="button"
                  onClick={() => setNotifyPrefs(p => ({ ...p, thisShow: !p.thisShow }))}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${notifyPrefs.thisShow ?'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
                    : 'bg-white/[0.02] border-white/10 hover: border-white/10 '
                    }`}
                >
                  <span className={`w-8 h-4 rounded-lg relative transition-colors flex-shrink-0 ${notifyPrefs.thisShow ?'bg-[var(--color-accent)]' : 'bg-white/10'
                    }`}>
                    <span className={`absolute top-0.5 w-3 h-3 rounded-lg bg-white transition-colors ${notifyPrefs.thisShow ?'left-[14px]' : 'left-0.5'
                      }`} />
                  </span>
                  <div className="text-left">
                    <p className="font-bold flex items-center gap-1.5"><Mic className="w-3.5 h-3.5 text-cyan-400" /> This specific show</p>
                    <p className="">Reminders & updates for {notifyPopupShow.venue}</p>
                  </div>
                </button>

                {/* Proximity shows */}
                <button aria-label="Action button"
                  type="button"
                  onClick={() => setNotifyPrefs(p => ({ ...p, proximity: !p.proximity }))}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${notifyPrefs.proximity ?'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
                    : 'bg-white/[0.02] border-white/10 hover: border-white/10 '
                    }`}
                >
                  <span className={`w-8 h-4 rounded-lg relative transition-colors flex-shrink-0 ${notifyPrefs.proximity ?'bg-[var(--color-accent)]' : 'bg-white/10'
                    }`}>
                    <span className={`absolute top-0.5 w-3 h-3 rounded-lg bg-white transition-colors ${notifyPrefs.proximity ?'left-[14px]' : 'left-0.5'
                      }`} />
                  </span>
                  <div className="text-left">
                    <p className="font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> Shows near me</p>
                    <p className="">Get emailed when we book near your area</p>
                  </div>
                </button>

                {/* Newsletter */}
                <button aria-label="Action button"
                  type="button"
                  onClick={() => setNotifyPrefs(p => ({ ...p, newsletter: !p.newsletter }))}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${notifyPrefs.newsletter ?'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
                    : 'bg-white/[0.02] border-white/10 hover: border-white/10 '
                    }`}
                >
                  <span className={`w-8 h-4 rounded-lg relative transition-colors flex-shrink-0 ${notifyPrefs.newsletter ?'bg-[var(--color-accent)]' : 'bg-white/10'
                    }`}>
                    <span className={`absolute top-0.5 w-3 h-3 rounded-lg bg-white transition-colors ${notifyPrefs.newsletter ?'left-[14px]' : 'left-0.5'
                      }`} />
                  </span>
                  <div className="text-left">
                    <p className="font-bold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-cyan-400" /> Newsletter & exclusives</p>
                    <p className="">News, drops & merch updates</p>
                  </div>
                </button>
              </div>

              {/* Sending to email */}
              <p className="mt-3 text-center">
                Notifications will be sent to <span className="text-white/40 font-semibold">{member?.email}</span>
              </p>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button aria-label="Action button"
                  onClick={() => setNotifyPopupShow(null)}
                  className="flex-1 py-2.5 bg-[#00000029] hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button aria-label="Action button"
                  onClick={handleNotifyConfirm}
                  disabled={!notifyPrefs.thisShow && !notifyPrefs.proximity && !notifyPrefs.newsletter}
                  className="flex-1 py-2.5 bg-[var(--color-accent)] hover:brightness-110 text-white font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-40 shadow-[0_0_15px_rgba(255,10,61,0.3)] flex items-center justify-center gap-1.5"
                >
                  {subscribingId ? 'Saving...' : <><Bell className="w-3.5 h-3.5" /> Enable Alerts</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Font Customizer Modal/Panel ── */}
      {isFontCustomizerOpen && (
        <div className="fixed right-6 bottom-6 z-50 p-0 pointer-events-none">
          <div className="w-full max-w-sm bg-[var(--color-bg-surface)]/95 border border-white/10 p-6 md:p-8 relative flex flex-col font-sans select-none pointer-events-auto animate-[fadeIn_0.2s_ease]" style={{ animation: "scaleIn 0.2s ease" }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
              <h3 className="text-white font-bold uppercase tracking-wider">Font Tester</h3>
              <button aria-label="Action button"
                onClick={() => setIsFontCustomizerOpen(false)}
                className="text-white/40 hover:text-white cursor-pointer bg-[#00000029] hover:bg-white/10 rounded-lg w-6 h-6 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Font Family */}
            <div className="mb-5">
              <label htmlFor="tour-font-style" className="block text-white/50 uppercase font-bold tracking-wider mb-2">Font Style</label>
              <select aria-label="Select option"
                id="tour-font-style"
                value={tourFontFamily}
                onChange={(e) => setTourFontFamily(e.target.value)}
                className="w-full bg-[#00000029] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
              >
                <option value="var(--font-body)" className="bg-[var(--color-bg-surface)] text-white">Switzer (Default)</option>
                <option value="var(--font-heading)" className="bg-[var(--color-bg-surface)] text-white">Rockstar (Heading)</option>
                <option value="Inter" className="bg-[var(--color-bg-surface)] text-white">Inter</option>
                <option value="Montserrat" className="bg-[var(--color-bg-surface)] text-white">Montserrat</option>
                <option value="Outfit" className="bg-[var(--color-bg-surface)] text-white">Outfit</option>
                <option value="Syne" className="bg-[var(--color-bg-surface)] text-white">Syne</option>
                <option value="Playfair Display" className="bg-[var(--color-bg-surface)] text-white">Playfair Display</option>
                <option value="Courier New" className="bg-[var(--color-bg-surface)] text-white">Monospace</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="tour-font-size-slider" className="text-white/50 uppercase font-bold tracking-wider">Font Size</label>
                <span className="text-[var(--color-accent)] font-bold font-mono">{tourFontSize}</span>
              </div>
              <input aria-label="Input field"
                id="tour-font-size-slider"
                type="range"
                min="10"
                max="24"
                value={parseInt(tourFontSize) || 13}
                onChange={(e) => setTourFontSize(`${e.target.value}px`)}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-[var(--font-size-4xs)] text-white/30 font-mono mt-0.5">
                <span>10px</span>
                <span>17px</span>
                <span>24px</span>
              </div>
            </div>

            {/* Website Button Font Size */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="tour-website-btn-size-slider" className="text-white/50 uppercase font-bold tracking-wider">Website Button Size</label>
                <span className="text-[var(--color-accent)] font-bold font-mono">{websiteBtnFontSize}</span>
              </div>
              <input aria-label="Input field"
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
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-[var(--font-size-4xs)] text-white/30 font-mono mt-0.5">
                <span>8px</span>
                <span>15px</span>
                <span>22px</span>
              </div>
            </div>

            {/* Row Padding */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="tour-row-padding-slider" className="text-white/50 uppercase font-bold tracking-wider">Row Padding</label>
                <span className="text-[var(--color-accent)] font-bold font-mono">{tourRowPadding}</span>
              </div>
              <input aria-label="Input field"
                id="tour-row-padding-slider"
                type="range"
                min="0"
                max="40"
                value={parseInt(tourRowPadding) || 0}
                onChange={(e) => setTourRowPadding(`${e.target.value}px`)}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-[var(--font-size-4xs)] text-white/30 font-mono mt-0.5">
                <span>0px</span>
                <span>20px</span>
                <span>40px</span>
              </div>
            </div>

            {/* Row Spacing */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="tour-row-spacing-slider" className="text-white/50 uppercase font-bold tracking-wider">Row Spacing (Margin)</label>
                <span className="text-[var(--color-accent)] font-bold font-mono">{tourRowGap}</span>
              </div>
              <input aria-label="Input field"
                id="tour-row-spacing-slider"
                type="range"
                min="0"
                max="30"
                value={parseInt(tourRowGap) || 0}
                onChange={(e) => setTourRowGap(`${e.target.value}px`)}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-[var(--font-size-4xs)] text-white/30 font-mono mt-0.5">
                <span>0px</span>
                <span>15px</span>
                <span>30px</span>
              </div>
            </div>

            {/* Row Height */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="tour-row-height-slider" className="text-white/50 uppercase font-bold tracking-wider">Row Height</label>
                <span className="text-[var(--color-accent)] font-bold font-mono">{tourRowHeight}</span>
              </div>
              <input aria-label="Input field"
                id="tour-row-height-slider"
                type="range"
                min="30"
                max="100"
                value={parseInt(tourRowHeight) || 40}
                onChange={(e) => setTourRowHeight(`${e.target.value}px`)}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-[var(--font-size-4xs)] text-white/30 font-mono mt-0.5">
                <span>30px</span>
                <span>65px</span>
                <span>100px</span>
              </div>
            </div>

            {/* Map Fade Mask Controls */}
            <div className="mb-5 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white uppercase font-bold tracking-wider">Map Fade Mask</label>
                <SquishyToggle
                  id="map-fade-mask-toggle"
                  label="Map Fade Mask"
                  checked={mapMaskEnabled}
                  onChange={(checked) => {
                    setMapMaskEnabled(checked);
                    localStorage.setItem("7h_tour_map_mask_enabled", String(checked));
                  }}
                />
              </div>

              {mapMaskEnabled && (
                <>
                  {/* Map Top Fade Distance */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="map-mask-top-slider" className="text-white/50 uppercase font-bold tracking-wider">Top Fade Clip</label>
                      <span className="text-[var(--color-accent)] font-bold font-mono">{mapMaskTop}px</span>
                    </div>
                    <input aria-label="Input field"
                      id="map-mask-top-slider"
                      type="range"
                      min="0"
                      max="150"
                      value={mapMaskTop}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMapMaskTop(val);
                        localStorage.setItem("7h_tour_map_mask_top", String(val));
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                    />
                    <div className="flex justify-between text-[var(--font-size-4xs)] text-white/30 font-mono mt-0.5">
                      <span>0px</span>
                      <span>75px</span>
                      <span>150px</span>
                    </div>
                  </div>

                  {/* Map Bottom Fade Distance */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="map-mask-bottom-slider" className="text-white/50 uppercase font-bold tracking-wider">Bottom Fade Clip</label>
                      <span className="text-[var(--color-accent)] font-bold font-mono">{mapMaskBottom}px</span>
                    </div>
                    <input aria-label="Input field"
                      id="map-mask-bottom-slider"
                      type="range"
                      min="0"
                      max="150"
                      value={mapMaskBottom}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMapMaskBottom(val);
                        localStorage.setItem("7h_tour_map_mask_bottom", String(val));
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                    />
                    <div className="flex justify-between text-[var(--font-size-4xs)] text-white/30 font-mono mt-0.5">
                      <span>0px</span>
                      <span>75px</span>
                      <span>150px</span>
                    </div>
                  </div>

                  {/* Map Left Fade Distance */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="map-mask-left-slider" className="text-white/50 uppercase font-bold tracking-wider">Left Fade Clip</label>
                      <span className="text-[var(--color-accent)] font-bold font-mono">{mapMaskLeft}px</span>
                    </div>
                    <input aria-label="Input field"
                      id="map-mask-left-slider"
                      type="range"
                      min="0"
                      max="150"
                      value={mapMaskLeft}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMapMaskLeft(val);
                        localStorage.setItem("7h_tour_map_mask_left", String(val));
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                    />
                    <div className="flex justify-between text-[var(--font-size-4xs)] text-white/30 font-mono mt-0.5">
                      <span>0px</span>
                      <span>75px</span>
                      <span>150px</span>
                    </div>
                  </div>

                  {/* Map Right Fade Distance */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="map-mask-right-slider" className="text-white/50 uppercase font-bold tracking-wider">Right Fade Clip</label>
                      <span className="text-[var(--color-accent)] font-bold font-mono">{mapMaskRight}px</span>
                    </div>
                    <input aria-label="Input field"
                      id="map-mask-right-slider"
                      type="range"
                      min="0"
                      max="150"
                      value={mapMaskRight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setMapMaskRight(val);
                        localStorage.setItem("7h_tour_map_mask_right", String(val));
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                    />
                    <div className="flex justify-between text-[var(--font-size-4xs)] text-white/30 font-mono mt-0.5">
                      <span>0px</span>
                      <span>75px</span>
                      <span>150px</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Code telemetry */}
            <div className="bg-black/40 border border-white/5 rounded-lg p-3.5 mb-5 font-mono text-[var(--font-size-4xs)] text-white select-all leading-relaxed whitespace-pre-wrap">
              {`font-size: ${tourFontSize};\nfont-family: ${tourFontFamily === 'var(--font-body)' ? 'Barlow' : tourFontFamily === 'var(--font-heading)' ? 'Rockstar' : tourFontFamily};\npadding: ${tourRowPadding} 0;\nmargin-bottom: ${tourRowGap};\nmin-height: ${tourRowHeight};`}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button aria-label="Action button"
                onClick={() => {
                  navigator.clipboard.writeText(`font-size: ${tourFontSize};\nfont-family: ${tourFontFamily === 'var(--font-body)' ? 'Barlow' : tourFontFamily === 'var(--font-heading)' ? 'Rockstar' : tourFontFamily};\npadding: ${tourRowPadding} 0;\nmargin-bottom: ${tourRowGap};\nmin-height: ${tourRowHeight};`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="py-2.5 bg-[#00000029] border border-white/10 hover:bg-white/10 rounded-lg text-white font-bold uppercase tracking-wider cursor-pointer transition-colors animate-all"
              >
                {copied ? "Copied! ✓" : "Copy CSS"}
              </button>
              <button aria-label="Action button"
                onClick={() => {
                  localStorage.setItem("7h_tour_font_size", tourFontSize);
                  localStorage.setItem("7h_tour_font_family", tourFontFamily);
                  localStorage.setItem("7h_tour_row_padding", tourRowPadding);
                  localStorage.setItem("7h_tour_row_gap", tourRowGap);
                  localStorage.setItem("7h_tour_row_height", tourRowHeight);
                  setIsFontCustomizerOpen(false);
                }}
                className="py-2.5 bg-[var(--color-accent)] hover:bg-[rgba(255,10,61,0.9)] rounded-lg text-white font-bold uppercase tracking-wider cursor-pointer transition-colors"
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
