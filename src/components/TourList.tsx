"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { SanityTourDate } from "@/lib/sanity";
import "leaflet/dist/leaflet.css";
import TourMap, { isShowOver, typeConfig, getShowType, getShowDateTime } from "./TourMap";
import CountdownTimer from "./CountdownTimer";
import { useMember } from "@/context/MemberContext";

export const shows = [
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
 const info = show.info || '';
 const lower = info.toLowerCase();
 const rawTags = show.tags || [];
 const hasTag = (t: string) => rawTags.map((x: string) => x.toLowerCase()).includes(t.toLowerCase());

 if (lower.includes("unplugged") || hasTag("unplugged")) return "🪕";
 if (lower.includes("outdoor") || lower.includes("beer garden") || hasTag("outdoor")) return "🌿";
 if (lower.includes("casino") || hasTag("casino")) return "🎰";
 if (lower.includes("festival") || lower.includes("fest") || hasTag("festival")) return "🎪";
 if (lower.includes("tv") || lower.includes("wgn") || lower.includes("news") || hasTag("tv appearance")) return "📺";
 if (lower.includes("fundraiser") || lower.includes("gala") || lower.includes("rescue") || hasTag("fundraiser") || hasTag("gala")) return "🎗️";
 if (lower.includes("cruise") || hasTag("cruise")) return "🚢";
 return "🎸";
}

const typeOptions = ["Unplugged", "Outdoor", "21+", "All Ages", "Special Event"];

// Shared dropdown styles
const selectClass = "appearance-none bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg pl-3 pr-7 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white/70 cursor-pointer transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] hover:border-[rgba(255,255,255,0.15)] hover:text-white/90";
const activeSelect = "!border-[var(--color-accent)] !text-[var(--color-accent)]";

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
  const isFan = isLoggedIn && member?.email && (member?.role === 'fan' || member?.role === 'admin');
  const devBypass = typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && localStorage.getItem('7h_dev_bypass') === 'true';
  const [showPastShows, setShowPastShows] = useState(false);
  const [activeMonth, setActiveMonth] = useState("All");
  const [activeType, setActiveType] = useState("All");
  const [activeCity, setActiveCity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [activeCalDropdownId, setActiveCalDropdownId] = useState<string | null>(null);

  // Subscribed show IDs for custom specific notifications
  const [subscribedShowIds, setSubscribedShowIds] = useState<string[]>([]);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  // Notification popup state
  const [notifyPopupShow, setNotifyPopupShow] = useState<any>(null);

  // ── Tour List Font & Layout Customizer states ──
  const [tourFontSize, setTourFontSize] = useState("13px");
  const [tourFontFamily, setTourFontFamily] = useState("var(--font-body)");
  const [tourRowPadding, setTourRowPadding] = useState("4px");
  const [tourRowGap, setTourRowGap] = useState("0px");
  const [tourRowHeight, setTourRowHeight] = useState("40px");
  const [isFontCustomizerOpen, setIsFontCustomizerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load font & layout settings from localStorage on mount
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
  }, []);

  // Dynamically load Google Fonts when selected
  useEffect(() => {
    if (tourFontFamily && !tourFontFamily.startsWith("var")) {
      const fontId = `google-font-${tourFontFamily.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(tourFontFamily)}:wght@400;500;700;800;900&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [tourFontFamily]);
  const [notifyPrefs, setNotifyPrefs] = useState({ proximity: true, thisShow: true, newsletter: false });

  // Live ticking time for countdowns
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
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
  const [formIsSoldOut, setFormIsSoldOut] = useState(false);
  const [formIsFestival, setFormIsFestival] = useState(false);
  const [formIsPrivate, setFormIsPrivate] = useState(false);
  const [formNotes, setFormNotes] = useState("");
  const [formIsUnplugged, setFormIsUnplugged] = useState(false);
  const [formIsOutdoor, setFormIsOutdoor] = useState(false);
  const [formIsCasino, setFormIsCasino] = useState(false);
  const [formIsSpecialEvent, setFormIsSpecialEvent] = useState(false);

  useEffect(() => {
    if (editingShow) {
      setFormVenue(editingShow.venue || "");
      setFormCity(editingShow.city || "");
      setFormState(editingShow.state || "IL");
      setFormDate(editingShow.startDate || "");
      setFormTime(editingShow.time || "");
      setFormDoorsTime(editingShow.doorsTime || "");
      setFormPlayTime(editingShow.playTime || "");
      setFormAllAges(editingShow.allAges ?? true);
      setFormCover(editingShow.cover || "");
      setFormTicketLink(editingShow.ticketLink || "");
      setFormDirectionsLink(editingShow.directionsLink || "");
      setFormIsSoldOut(editingShow.isSoldOut || false);
      setFormIsFestival(editingShow.isFestival || false);
      setFormIsPrivate(editingShow.isPrivate || false);
      setFormNotes(editingShow.notes || "");

      const currentTags = editingShow.tags || [];
      const lowerNotes = ((editingShow.notes || "") + " " + (editingShow.info || "")).toLowerCase();
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
      setFormIsSoldOut(false);
      setFormIsFestival(false);
      setFormIsPrivate(false);
      setFormNotes("");
      setFormIsUnplugged(false);
      setFormIsOutdoor(false);
      setFormIsCasino(false);
      setFormIsSpecialEvent(false);
    }
    setModalError(null);
  }, [editingShow, isModalOpen]);

  const handleEditClick = (show: any) => {
    setEditingShow(show);
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
      directionsLink: formDirectionsLink.trim(),
      isSoldOut: formIsSoldOut,
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
      const result = await res.json();
      if (res.ok && result.success) {
        setIsModalOpen(false);
        window.location.reload();
      } else {
        setModalError(result.error || "Failed to save show date.");
      }
    } catch (err) {
      setModalError("Network error. Please check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShow = async (id: string) => {
    if (!confirm("Are you sure you want to delete this show date from Sanity?")) return;
    try {
      const res = await fetch(`/api/admin/shows?id=${id}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        window.location.reload();
      } else {
        alert("Failed to delete show: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      alert("Network error deleting show.");
    }
  };

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

  // Load user notification subscriptions
  useEffect(() => {
    if (!member?.email) return;
    fetch(`/api/shows/notify-me?email=${encodeURIComponent(member.email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.subscriptions) {
          const ids = data.subscriptions.map((s: any) => s.showId);
          setSubscribedShowIds(ids);
        }
      })
      .catch(err => console.error("Error loading notification subscriptions:", err));
  }, [member?.email]);

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
    } catch {} finally {
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
      return "🎸 Live Now";
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
    return displayShows.filter(s => showPastShows || !isShowOver(s));
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
    // Only show cities that are currently on the upcoming tour list
    const upcomingCities = new Set<string>();
    upcomingShowsList.forEach((s: any) => {
      if (s.city && s.city.trim()) {
        upcomingCities.add(s.city.trim());
      }
    });
    return Array.from(upcomingCities).sort((a, b) => a.localeCompare(b));
  }, [upcomingShowsList]);

 const tableRef = useRef<HTMLDivElement>(null);

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

  // Map pin click — scroll WITHOUT clearing filters (row is already visible since map is filter-synced)
  const handleMapPinClick = useCallback((venue: string, date: string) => {
   const prefix = `tour-${venue}-${date}`.replace(/\s+/g, '-').toLowerCase();
   setTimeout(() => {
    const el = document.querySelector(`[id^="${prefix}"]`);
    if (el) {
     el.scrollIntoView({ behavior: 'smooth', block: 'center' });
     setHighlightedId(el.id);
     setTimeout(() => setHighlightedId(null), 3000);
    }
   }, 100);
  }, []);

  const filtered = useMemo(() => {
   const q = searchQuery.toLowerCase().trim();
   return activeShowsByTime.filter((s) => {
    if (activeMonth !== "All" && !s.date.startsWith(activeMonth)) return false;
    if (activeType !== "All" && !getShowTags(s).includes(activeType)) return false;
    if (activeCity !== "All" && s.city !== activeCity) return false;
    if (q && !s.venue.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q) && !s.info.toLowerCase().includes(q)) return false;
    return true;
   });
  }, [activeShowsByTime, activeMonth, activeType, activeCity, searchQuery]);

 const showCount = filtered.length;

 const upcomingCount = useMemo(() => {
  return displayShows.filter(s => !isShowOver(s)).length;
 }, [displayShows]);

 const filteredUpcomingCount = useMemo(() => {
  return filtered.filter(s => !isShowOver(s)).length;
 }, [filtered]);

 const hasActiveFilters = activeMonth !== "All" || activeType !== "All" || activeCity !== "All" || searchQuery !== "";

 const clearAll = () => {
  setActiveMonth("All");
  setActiveType("All");
  setActiveCity("All");
  setSearchQuery("");
 };

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

  const gridClass = member?.role === 'admin'
    ? "grid-cols-1 lg:grid-cols-[60px_120px_2.5fr_1.8fr_90px_2.2fr_150px_120px_140px]"
    : "grid-cols-1 lg:grid-cols-[60px_120px_2.5fr_1.8fr_90px_2.2fr_150px_120px]";

  return (
   <>
    {/* Style override tag for font & layout customizer */}
    <style dangerouslySetInnerHTML={{ __html: `
      #tour-table-container,
      #tour-table-container span,
      #tour-table-container a,
      #tour-table-container button,
      #tour-table-container select,
      #tour-table-container input {
        font-size: ${tourFontSize} !important;
        font-family: ${tourFontFamily} !important;
      }
      #tour-table-container .tour-row-item {
        padding-top: ${tourRowPadding} !important;
        padding-bottom: ${tourRowPadding} !important;
        min-height: ${tourRowHeight} !important;
      }
      #tour-rows-container {
        gap: ${tourRowGap} !important;
      }
    `}} />

    {/* Table */}
    <section className="py-12 relative" ref={tableRef} id="tour-table-container">
      {/* Gold-to-black gradient pinned to the top of this section */}
      <div className="absolute inset-x-0 bottom-0 h-[600px] pointer-events-none z-0" style={{ background: "linear-gradient(to top, rgba(230,150,0,0.65) 0%, rgba(180,100,0,0.4) 25%, rgba(80,40,0,0.15) 55%, transparent 100%)" }} />
      <div className="site-container relative z-10">

      {/* Section Heading */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
       <h2 className="text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight">
        Upcoming <span className="gradient-text">Shows</span>
       </h2>
       <button
         onClick={() => setIsFontCustomizerOpen(true)}
         className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] rounded-lg px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 cursor-pointer text-white/80 hover:text-white w-fit"
       >
         ⚙️ Font Settings
       </button>
      </div>

     {/* Up Next — Neon Glow / Festival */}
     {upNext && (
      <div className="mb-0">
       <div className="relative overflow-hidden">

         <div className="relative z-10 py-6 md:py-8 flex flex-col md:flex-row justify-between gap-6">
           {/* Left Column: Info */}
           <div className="relative flex flex-col justify-between min-h-[140px]">
             {/* UP NEXT label */}
             <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] mb-5">
               <span className={`w-1.5 h-1.5 rounded-full ${daysLabel === "Happening Now" ? "bg-red-500 animate-ping" : "bg-[var(--color-accent)] animate-pulse"}`} />
               <span className={daysLabel === "Happening Now" ? "text-red-500 font-extrabold" : "text-[var(--color-accent)]"}>
                 {daysLabel === "Happening Now" ? "Happening Now" : "Up Next"}
               </span>
               {daysLabel && daysLabel !== "Happening Now" && (
                 <>
                   <span className="text-white/20">·</span>
                   <span className="text-[var(--color-accent)]">{daysLabel}</span>
                 </>
               )}
             </div>

             {/* Venue name */}
             <h3 className="font-[var(--font-heading)] text-[2.2rem] md:text-[3rem] font-extrabold text-white leading-[1] mb-4 uppercase whitespace-nowrap">
               {upNext.venue}
             </h3>

             {/* Date + Location + Time */}
              <div className="flex items-center gap-2 text-[0.85rem] text-white/70 font-medium">
                <span>
                  {upNext.day === "Mon" ? "Monday" : upNext.day === "Tue" ? "Tuesday" : upNext.day === "Wed" ? "Wednesday" : upNext.day === "Thu" ? "Thursday" : upNext.day === "Fri" ? "Friday" : upNext.day === "Sat" ? "Saturday" : "Sunday"}, {upNext.date.split(" ")[0]} {upNext.date.split(" ")[1]}
                </span>
                 {upNext.city && (
                   <>
                     <span className="text-white/20">·</span>
                     <span>📍 {upNext.city}{upNext.state ? `, ${upNext.state}` : ""}</span>
                   </>
                 )}
                 {upNext.playTime ? (
                   <>
                     <span className="text-white/20">·</span>
                     <span className="text-rose-400 font-extrabold">Plays: {upNext.playTime}</span>
                     {upNext.time && (
                       <>
                         <span className="text-white/20">·</span>
                         <span className="text-white/40">Event: {upNext.time}</span>
                       </>
                     )}
                   </>
                 ) : (
                   upNext.time && (
                     <>
                       <span className="text-white/20">·</span>
                       <span className="text-white/50">{upNext.time}</span>
                     </>
                   )
                 )}
              </div>
              {upNext.info && (
                <p className="mt-3 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--color-accent)]/70">
                  {getShowIcon(upNext)} {upNext.info}
                </p>
              )}
           </div>

           <div className="flex flex-col items-stretch md:items-end justify-between gap-5 shrink-0 w-full md:w-[460px]">
             <CountdownTimer 
               targetDate={`${upNext.date}, ${new Date().getFullYear()}`} 
               targetTime={upNext.playTime || upNext.time} 
               className="justify-start md:justify-end gap-4 md:gap-5"
             />
             <div className="flex gap-3 items-center w-full">
               {upNext.mapUrl && (
                  <a href={upNext.mapUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center btn-outline btn-outline-hover text-[0.75rem] py-3 px-2 border-[var(--color-accent)]/30" id="upnext-map">
                    📍 Directions
                  </a>
               )}
               {upNext.websiteUrl && (
                  <a href={upNext.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center btn-primary btn-primary-hover text-[0.75rem] py-3 px-2" id="upnext-website">
                    Website
                  </a>
               )}
               <div className="flex-1 relative calendar-dropdown-container">
                 <button
                   onClick={() => setActiveCalDropdownId(activeCalDropdownId === 'upnext' ? null : 'upnext')}
                   className="w-full text-center btn-outline btn-outline-hover text-[0.75rem] py-3 px-2 border-[var(--color-accent)]/30 flex items-center justify-center gap-2 cursor-pointer"
                   id="upnext-calendar-btn"
                 >
                   📅 Add to Calendar
                 </button>
                 {activeCalDropdownId === 'upnext' && (
                   <div className="absolute right-0 bottom-full mb-2 bg-[#080812] border border-[var(--color-accent)]/30 rounded-lg py-2 shadow-[0_6px_24px_rgba(0,0,0,0.8)] z-50 min-w-[170px] backdrop-blur-md">
                     <a href={getGoogleCalendarUrl(upNext)} target="_blank" rel="noopener noreferrer" onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full">Google Calendar</a>
                     <a href={getICSFileUrl(upNext)} download={`${upNext.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full">Apple / iCal</a>
                     <a href={getICSFileUrl(upNext)} download={`${upNext.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full">Outlook</a>
                     <button 
                        onClick={() => {
                          setActiveCalDropdownId(null);
                          document.getElementById("proximity-notify")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full border-t border-white/5 mt-1 pt-2.5 cursor-pointer"
                      >
                        💬 SMS / Text Alerts
                      </button>
                   </div>
                 )}
               </div>
             </div>
           </div>
         </div>
       </div>
      </div>
     )}

     {!hideMap && (
      <div className="mb-12">
       <TourMap shows={hasActiveFilters ? filtered : activeShowsByTime} nextShowVenue={upNext?.venue} nextShowCity={upNext?.city} onPinClick={handleMapPinClick} />
      </div>
     )}

     <div className="flex items-center justify-between mb-3">
      <p className="text-[0.7rem] text-[var(--color-text-muted)] tracking-wide">
       Showing <span className="text-[var(--color-accent)] font-bold">{showCount}</span> {showCount === 1 ? "show" : "shows"} <span className="text-white/40">({hasActiveFilters ? filteredUpcomingCount : upcomingCount} upcoming)</span>
       {activeLabels.length > 0 && (
        <span className="ml-1">
         — {activeLabels.map((label, i) => (
          <span key={i}>
           {i > 0 && " · "}
           <span className="text-white font-semibold">{label}</span>
          </span>
         ))}
        </span>
       )}
      </p>
      <div className="flex items-center gap-3">
        {member?.role === 'admin' && (
          <button
            onClick={() => { setEditingShow(null); setIsModalOpen(true); }}
            className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] rounded-lg px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2 border border-emerald-500/35 shadow-lg shadow-emerald-600/20"
          >
            ➕ Add Show
          </button>
        )}
        {hasActiveFilters && (
         <button
          onClick={clearAll}
          className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--color-accent)] hover:text-white border border-[rgba(133,29,239,0.3)] hover:border-[rgba(133,29,239,0.6)] rounded-md px-2.5 py-1 transition-all duration-200 cursor-pointer whitespace-nowrap bg-[rgba(133,29,239,0.08)]"
         >Clear</button>
        )}

       {/* Sticky Font Settings Gear Trigger */}
       <button
         onClick={() => setIsFontCustomizerOpen(true)}
         className="absolute right-0 top-1/2 -translate-y-1/2 text-[0.7rem] p-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-md transition-all cursor-pointer text-white/80 hover:text-white flex items-center justify-center z-40"
         title="Font Settings"
       >
         ⚙️
       </button>
       </div>
     </div>

     <div className={`sticky top-0 z-30 hidden lg:grid ${gridClass} gap-6 px-8 py-4 bg-[rgba(17,17,24,0.95)] backdrop-blur-md items-center relative`}>
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Day</span>
      <div className="relative">
       <select value={activeMonth} onChange={(e) => setActiveMonth(e.target.value)} className={`${selectClass} w-full ${activeMonth !== "All" ? activeSelect : ""}`} id="tour-filter-month">
        <option value="All">Month</option>
        {months.map((m) => <option key={m} value={m}>{m}</option>)}
       </select>
       <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
      <div className="relative">
       <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
       <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full max-w-[200px] bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg pl-8 pr-7 py-1.5 text-[0.65rem] text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors" id="tour-search" />
       {searchQuery && (<button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[0.6rem] cursor-pointer">✕</button>)}
      </div>
      <div className="relative">
       <select value={activeCity} onChange={(e) => setActiveCity(e.target.value)} className={`${selectClass} w-full ${activeCity !== "All" ? activeSelect : ""}`} id="tour-filter-city">
        <option value="All">City</option>
        {locationOptions.map((c) => <option key={c} value={c}>{c}</option>)}
       </select>
       <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Time</span>
      <div className="relative">
       <select value={activeType} onChange={(e) => setActiveType(e.target.value)} className={`${selectClass} w-full ${activeType !== "All" ? activeSelect : ""}`} id="tour-filter-type">
        <option value="All">Type</option>
        {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
       </select>
       <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-text-muted)] text-center">Map/Cal</span>
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-text-muted)] text-right">Website</span>
      {member?.role === 'admin' && (
         <div className="flex items-center justify-end gap-2 text-right">
           <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Actions</span>
           <button
             onClick={() => { setEditingShow(null); setIsModalOpen(true); }}
             className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[0.55rem] font-extrabold uppercase rounded transition-colors cursor-pointer border border-emerald-500/20 shadow-sm"
             title="Add New Show"
           >
             + Add
           </button>
           <button
             onClick={() => setIsFontCustomizerOpen(true)}
             className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.7rem] p-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-md transition-all cursor-pointer text-white/80 hover:text-white flex items-center justify-center z-40"
             title="Font Settings"
           >
             ⚙️
           </button>
         </div>
       )}
     </div>

     <div className="flex flex-col gap-0 overflow-visible pt-0" id="tour-rows-container">
      {(() => {
        let rows = filtered;
        if (maxShows && upNext) {
          const startIdx = filtered.findIndex(s => s.date === upNext.date && s.venue === upNext.venue && s.time === upNext.time);
rows = filtered.slice(startIdx >= 0 ? startIdx : 0, (startIdx >= 0 ? startIdx : 0) + maxShows);
        } else if (maxShows) {
          rows = filtered.slice(0, maxShows);
        }
        return rows;
       })().map((show, i) => {
        const isUpNext = upNext ? (show.date === upNext.date && show.venue === upNext.venue && show.time === upNext.time) : false;
        const rowId = `tour-${show.venue}-${show.date}-${show.time || ''}`.replace(/\s+/g, '-').toLowerCase();
       const isHighlighted = highlightedId === rowId;
       const isPast = parseShowDate(show.date, show.startDate).getTime() < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
       return (
         <div key={`${show.date}-${show.venue}-${i}`} className="overflow-visible">
           {/* Desktop Row Layout */}
           <div
            className={`tour-row-item relative hidden lg:grid ${gridClass} gap-6 px-8 py-1 items-center text-sm text-[var(--color-text-secondary)] transition-all duration-300 ${isHighlighted ? "bg-[rgba(133,29,239,0.15)] shadow-[inset_4px_0_0_var(--color-accent),0_0_20px_rgba(133,29,239,0.2)] animate-pulse" : `${i % 2 === 0 ? "bg-[var(--color-bg-card)]" : "bg-[rgba(255,255,255,0.07)]"}`} ${!show.city ? "opacity-50" : ""} ${isPast && !isHighlighted ? "opacity-65" : ""}`}
            id={rowId}
           >
             <span className="font-[var(--font-heading)] font-bold text-xs uppercase text-[var(--color-accent)]">{show.day}</span>
             <span className="text-white/95 font-medium">{show.date}</span>
             <span className="font-bold text-white">{show.venue}</span>
             <span className="text-white/90">{show.city ? `${show.city}${show.state ? `, ${show.state}` : ""}` : ""}</span>
             <span className="flex flex-col text-left">
                {show.playTime ? (
                  <>
                    <span className="text-rose-400 font-extrabold text-[11px] uppercase tracking-wide">Plays: {show.playTime}</span>
                    {show.time && (
                      <span className="text-white/40 text-[9px] mt-0.5 leading-none">Event: {show.time}</span>
                    )}
                  </>
                ) : (
                  <span className="text-white/95 font-medium">{show.time}</span>
                )}
                {isShowToday(show) && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 mt-1 whitespace-nowrap animate-pulse">
                    {getCountdownString(show)}
                  </span>
                )}
             </span>
             <div className="text-[0.7rem] text-white/70 flex items-center gap-1.5 whitespace-nowrap overflow-hidden max-w-full leading-none">
                 <span className="text-sm shrink-0">{getShowIcon(show)}</span>
                 {show.info ? (
                   <div className="overflow-hidden relative flex-1 min-w-[50px]">
                     <div className="inline-flex gap-4 animate-ticker hover:[animation-play-state:paused] whitespace-nowrap">
                       <span className="font-medium text-white/90">{show.info}</span>
                       <span className="text-white/30 shrink-0">•</span>
                       <span className="font-medium text-white/90">{show.info}</span>
                       <span className="text-white/30 shrink-0">•</span>
                     </div>
                   </div>
                 ) : (
                   <span className="flex-1" />
                 )}
                 {(show.allAges === true || (show.info && (show.info.toLowerCase().includes("all age") || show.info.toLowerCase().includes("all-age"))) || (show.tags && (show.tags.includes("all ages") || show.tags.includes("all-ages")))) && (
                   <span className="px-1 py-0 text-[0.55rem] font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded animate-[fadeIn_0.3s_ease-out] shrink-0">All Ages</span>
                 )}
                 {(show.allAges === false || (show.info && (show.info.toLowerCase().includes("21 &") || show.info.toLowerCase().includes("21+"))) || (show.tags && show.tags.includes("21+"))) && (
                   <span className="px-1 py-0 text-[0.55rem] font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded animate-[fadeIn_0.3s_ease-out] shrink-0">21+</span>
                 )}
                 {getShowTags(show).map(tag => {
                   if (tag === "All Ages" || tag === "21+") return null;
                   
                   let tagColors = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                   if (tag === "Unplugged") {
                     tagColors = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                   } else if (tag === "Outdoor") {
                     tagColors = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                   } else if (tag === "Special Event") {
                     tagColors = "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";
                   } else if (tag === "Casino") {
                     tagColors = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                   }
                   
                   return (
                     <span key={tag} className={`px-1 py-0 text-[0.55rem] font-bold border rounded animate-[fadeIn_0.3s_ease-out] shrink-0 ${tagColors}`}>
                       {tag}
                     </span>
                   );
                 })}
              </div>
             <span className="flex items-center justify-center gap-2">
               {show._id && isFan && (
                 <button
                   onClick={() => handleToggleNotification(show)}
                   disabled={subscribingId === show._id}
                   title={subscribedShowIds.includes(show._id) ? "Mute notifications for this show" : "Notify me about this show"}
                   className={`w-6 h-6 flex items-center justify-center rounded-md transition-all duration-300 shadow-[0_2px_6px_rgba(0,0,0,0.2)] cursor-pointer border shrink-0 ${
                     subscribedShowIds.includes(show._id)
                       ? "bg-purple-600/20 border-purple-500/40 text-purple-400 hover:bg-purple-600/30"
                       : "bg-[rgba(255,255,255,0.08)] border-white/10 text-white/60 hover:text-white hover:bg-[rgba(255,255,255,0.15)] hover:border-white/20"
                   }`}
                 >
                   {subscribingId === show._id ? (
                     <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   ) : subscribedShowIds.includes(show._id) ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                     </svg>
                   ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                     </svg>
                   )}
                 </button>
               )}
               {show.mapUrl && (() => {
                const gUrl = show.mapUrl.includes('maps.apple.com') ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city} ${show.state}`)}` : show.mapUrl;
                const showType = getShowType(show.info || '');
                const cfg = typeConfig[showType] || typeConfig.full;
                return (
                 <a href={gUrl} target="_blank" rel="noopener noreferrer" title="Get Directions" style={{ backgroundColor: cfg.color }} className="w-6 h-6 flex items-center justify-center rounded-md text-black hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                 </a>
                );
               })()}
               <div className="relative calendar-dropdown-container">
                 <button onClick={() => setActiveCalDropdownId(activeCalDropdownId === rowId ? null : rowId)} title="Add to Calendar" className="w-6 h-6 flex items-center justify-center rounded-md bg-[rgba(255,255,255,0.08)] border border-white/10 text-white/80 hover:text-white hover:bg-[rgba(255,255,255,0.15)] hover:border-white/20 transition-all duration-300 shadow-[0_2px_6px_rgba(0,0,0,0.2)] cursor-pointer">
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 </button>
                 {activeCalDropdownId === rowId && (
                   <div className="absolute right-0 mt-2 bg-[#080812] border border-white/15 rounded-lg py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.9)] z-50 min-w-[150px] backdrop-blur-md">
                     <a href={getGoogleCalendarUrl(show)} target="_blank" rel="noopener noreferrer" onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full font-sans">Google Cal</a>
                     <a href={getICSFileUrl(show)} download={`${show.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full font-sans">iCal / Apple</a>
                     <a href={getICSFileUrl(show)} download={`${show.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full font-sans">Outlook</a>
                     <button
                       onClick={() => {
                         setActiveCalDropdownId(null);
                         document.getElementById("proximity-notify")?.scrollIntoView({ behavior: "smooth" });
                       }}
                       className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full border-t border-white/5 mt-1 pt-2 cursor-pointer font-sans"
                     >
                       💬 SMS / Text Alerts
                     </button>
                   </div>
                 )}
               </div>
              </span>
              <span className="flex justify-end">
               {show.websiteUrl ? (
                 <a 
                  href={show.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center whitespace-nowrap text-[0.65rem] font-black uppercase tracking-widest px-3 py-1 bg-[var(--color-accent)] text-white hover:bg-[rgba(133,29,239,0.9)] transition-all duration-300 rounded-sm h-6 min-w-[76px]"
                 >
                  Website
                 </a>
               ) : (
                <span className="inline-flex items-center justify-center whitespace-nowrap text-[0.6rem] font-black uppercase tracking-widest px-3 py-1 border border-white/5 text-white/10 rounded-sm cursor-default h-6 min-w-[76px]">
                 Website
                </span>
               )}
              </span>

             {/* Admin Row Actions */}
             {member?.role === 'admin' && (
               <div className="flex items-center gap-1.5 justify-end w-full md:w-auto">
                 {show._id ? (
                   <>
                     <button
                       onClick={() => handleEditClick(show)}
                       className="px-2 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-[0.65rem] font-bold uppercase tracking-widest rounded transition-all cursor-pointer font-sans"
                     >
                       Edit
                     </button>
                     <button
                       onClick={() => handleDeleteShow(show._id)}
                       className="px-2 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-[0.65rem] font-bold uppercase tracking-widest rounded transition-all cursor-pointer font-sans"
                     >
                       Del
                     </button>
                   </>
                 ) : (
                   <span className="text-[0.6rem] text-white/20 uppercase font-mono" title="Fallback shows cannot be edited directly">Fallback</span>
                 )}
               </div>
             )}
           </div>

           {/* Mobile/Tablet Card Layout */}
           <div
            className={`tour-row-item relative lg:hidden flex flex-col gap-3 py-3 px-4 text-sm text-[var(--color-text-secondary)] transition-all duration-300 rounded-xl ${isHighlighted ? "bg-[rgba(133,29,239,0.15)] shadow-[inset_4px_0_0_var(--color-accent),0_0_20px_rgba(133,29,239,0.2)] animate-pulse" : isUpNext ? "bg-[rgba(133,29,239,0.08)] shadow-[inset_4px_0_0_var(--color-accent)]" : `${i % 2 === 0 ? "bg-[var(--color-bg-card)]" : "bg-[rgba(255,255,255,0.07)]"}`} ${!show.city ? "opacity-50" : ""} ${isPast && !isHighlighted ? "opacity-65" : ""}`}
            id={`${rowId}-mobile`}
           >
             
             {/* Header Row: Date & Time */}
             <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
               <div className="flex items-baseline gap-2">
                 <span className="font-[var(--font-heading)] font-bold text-xs uppercase text-[var(--color-accent)]">{show.day}</span>
                 <span className="text-white font-bold text-base">{show.date}</span>
               </div>
               <div className="flex flex-col items-end gap-1">
                 {show.playTime ? (
                   <>
                     <span className="text-white text-xs font-black px-2 py-0.5 bg-rose-600/10 border border-rose-500/20 rounded-md shadow-[0_0_8px_rgba(239,68,68,0.1)]">Plays: {show.playTime}</span>
                     {show.time && (
                       <span className="text-white/50 text-[10px] font-bold px-2 py-0.5 bg-white/5 border border-white/10 rounded">Event: {show.time}</span>
                     )}
                   </>
                 ) : (
                   show.time && (
                     <span className="text-white/85 text-xs font-semibold px-2 py-0.5 bg-white/5 border border-white/10 rounded">{show.time}</span>
                   )
                 )}
                 {isShowToday(show) && (
                   <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 animate-pulse">
                     {getCountdownString(show)}
                   </span>
                 )}
               </div>
             </div>

             {/* Details: Venue & Location */}
             <div>
               <h4 className="text-lg font-black text-white leading-tight uppercase tracking-tight italic" style={{ fontFamily: "var(--font-barlow-condensed)" }}>{show.venue}</h4>
               {show.city && (
                 <p className="text-xs text-white/50 flex items-center gap-1 mt-1">
                   📍 {show.city}{show.state ? `, ${show.state}` : ""}
                 </p>
               )}
             </div>

             {/* Tags Row */}
             <div className="flex items-center gap-1.5 flex-wrap">
               <span className="text-xs">{getShowIcon(show)}</span>
               {show.info && <span className="text-2xs text-white/40 italic">{show.info}</span>}
               {(show.allAges === true || (show.info && (show.info.toLowerCase().includes("all age") || show.info.toLowerCase().includes("all-age"))) || (show.tags && (show.tags.includes("all ages") || show.tags.includes("all-ages")))) && (
                 <span className="px-1.5 py-0.5 text-[0.6rem] font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded">All Ages</span>
               )}
               {(show.allAges === false || (show.info && (show.info.toLowerCase().includes("21 &") || show.info.toLowerCase().includes("21+"))) || (show.tags && show.tags.includes("21+"))) && (
                 <span className="px-1.5 py-0.5 text-[0.6rem] font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded">21+</span>
               )}
               {getShowTags(show).map(tag => {
                 if (tag === "All Ages" || tag === "21+") return null;
                 let tagColors = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                 if (tag === "Unplugged") tagColors = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                 else if (tag === "Outdoor") tagColors = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                 else if (tag === "Special Event") tagColors = "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20";
                 else if (tag === "Casino") tagColors = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                 return (
                   <span key={tag} className={`px-1.5 py-0.5 text-[0.6rem] font-bold border rounded ${tagColors}`}>{tag}</span>
                 );
               })}
             </div>

             {/* Action Buttons Row */}
             <div className="flex items-center gap-3 mt-1.5">
               {/* Maps Directions */}
               {show.mapUrl && (() => {
                 const gUrl = show.mapUrl.includes('maps.apple.com') ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city} ${show.state}`)}` : show.mapUrl;
                 const showType = getShowType(show.info || '');
                 const cfg = typeConfig[showType] || typeConfig.full;
                 return (
                   <a href={gUrl} target="_blank" rel="noopener noreferrer" title="Get Directions" style={{ backgroundColor: cfg.color }} className="w-9 h-9 flex items-center justify-center rounded-md text-black hover:opacity-90 transition-all duration-300 shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                   </a>
                 );
               })()}

               {show._id && isFan && (
                 <button
                   onClick={() => handleToggleNotification(show)}
                   disabled={subscribingId === show._id}
                   title={subscribedShowIds.includes(show._id) ? "Mute notifications for this show" : "Notify me about this show"}
                   className={`w-9 h-9 flex items-center justify-center rounded-md transition-all duration-300 cursor-pointer border shrink-0 ${
                     subscribedShowIds.includes(show._id)
                       ? "bg-purple-600/20 border-purple-500/40 text-purple-400 hover:bg-purple-600/30"
                       : "bg-[rgba(255,255,255,0.08)] border-white/10 text-white/60 hover:text-white hover:bg-[rgba(255,255,255,0.15)] hover:border-white/20"
                   }`}
                 >
                   {subscribingId === show._id ? (
                     <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   ) : subscribedShowIds.includes(show._id) ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                     </svg>
                   ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                     </svg>
                   )}
                 </button>
               )}

               {/* Calendar Add */}
               <div className="relative calendar-dropdown-container shrink-0">
                 <button onClick={() => setActiveCalDropdownId(activeCalDropdownId === `${rowId}-mobile` ? null : `${rowId}-mobile`)} title="Add to Calendar" className="w-9 h-9 flex items-center justify-center rounded-md bg-[rgba(255,255,255,0.08)] border border-white/10 text-white/80 hover:text-white hover:bg-[rgba(255,255,255,0.15)] transition-all duration-300 cursor-pointer">
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                 </button>
                 {activeCalDropdownId === `${rowId}-mobile` && (
                   <div className="absolute left-0 mt-2 bg-[#080812] border border-white/15 rounded-lg py-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.9)] z-50 min-w-[150px] backdrop-blur-md font-sans">
                     <a href={getGoogleCalendarUrl(show)} target="_blank" rel="noopener noreferrer" onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full">Google Cal</a>
                     <a href={getICSFileUrl(show)} download={`${show.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full">iCal / Apple</a>
                     <a href={getICSFileUrl(show)} download={`${show.venue.replace(/\s+/g, '_')}_show.ics`} onClick={() => setActiveCalDropdownId(null)} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full">Outlook</a>
                     <button
                       onClick={() => {
                         setActiveCalDropdownId(null);
                         document.getElementById("proximity-notify")?.scrollIntoView({ behavior: "smooth" });
                       }}
                       className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-[var(--color-accent)]/20 transition-all text-left w-full border-t border-white/5 mt-1 pt-2 cursor-pointer font-sans"
                     >
                       💬 SMS / Text Alerts
                     </button>
                   </div>
                 )}
               </div>

               {/* Tickets / Website Link */}
               {show.websiteUrl ? (
                 <a href={show.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-wider h-9 bg-[var(--color-accent)] text-white hover:bg-[rgba(133,29,239,0.9)] transition-all rounded-md text-center">
                   Website
                 </a>
               ) : (
                 <span className="flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-wider h-9 border border-white/5 text-white/10 rounded-md text-center">
                   Website
                 </span>
               )}

               {/* Admin Actions */}
               {member?.role === 'admin' && show._id && (
                 <div className="flex items-center gap-1.5 shrink-0">
                   <button onClick={() => handleEditClick(show)} className="px-2 h-9 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer">Edit</button>
                   <button onClick={() => handleDeleteShow(show._id)} className="px-2 h-9 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer">Del</button>
                 </div>
               )}
             </div>
           </div>
         </div>
       );
      })}
     </div>

     {filtered.length === 0 && (
      <div className="text-center py-16 text-[var(--color-text-muted)]">
       <p className="text-lg">No shows match your filters.</p>
       <button onClick={clearAll} className="mt-4 text-sm text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer">
        Clear all filters
       </button>
      </div>
     )}
     </div>
    </section>

    {/* Show Edit/Add Modal */}
    {isModalOpen && (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
        <div className="bg-[#0b0b12] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl relative my-8 overflow-hidden animate-[fade-in-up_0.2s_ease-out]">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-[var(--color-accent)] to-emerald-500" />
          <div className="p-6 md:p-8 text-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{editingShow ? "✏️ Edit Show Date" : "➕ Add New Show Date"}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer text-sm"
              >
                ✕ Close
              </button>
            </div>

            {modalError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mb-6">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveShow} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Venue Name *</label>
                  <input type="text" required value={formVenue} onChange={e => setFormVenue(e.target.value)}
                    placeholder="e.g. Station 34" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Event Date *</label>
                  <input type="date" required value={formDate} onChange={e => setFormDate(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">City *</label>
                  <input type="text" required value={formCity} onChange={e => setFormCity(e.target.value)}
                    placeholder="e.g. Mt. Prospect" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">State *</label>
                  <input type="text" required value={formState} onChange={e => setFormState(e.target.value)}
                    placeholder="e.g. IL" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Show Time</label>
                  <input type="text" value={formTime} onChange={e => setFormTime(e.target.value)}
                    placeholder="e.g. 8:00pm" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Doors Open</label>
                  <input type="text" value={formDoorsTime} onChange={e => setFormDoorsTime(e.target.value)}
                    placeholder="e.g. 7:00pm" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Band Plays</label>
                  <input type="text" value={formPlayTime} onChange={e => setFormPlayTime(e.target.value)}
                    placeholder="e.g. 8:30pm" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Cover / Admission</label>
                  <input type="text" value={formCover} onChange={e => setFormCover(e.target.value)}
                    placeholder="e.g. Free, $10" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Ticket Link (URL)</label>
                  <input type="url" value={formTicketLink} onChange={e => setFormTicketLink(e.target.value)}
                    placeholder="https://..." className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Directions Link (URL)</label>
                  <input type="url" value={formDirectionsLink} onChange={e => setFormDirectionsLink(e.target.value)}
                    placeholder="https://maps.apple.com/..." className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all" />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-white/30 block mb-1.5 font-bold">Notes / Description</label>
                <textarea rows={2} value={formNotes} onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Unplugged Acoustic Show" className="w-full bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--color-accent)] transition-all resize-none" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-t border-b border-white/5 my-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                  <input type="checkbox" checked={formAllAges} onChange={e => setFormAllAges(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4" />
                  All Ages Show
                </label>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                  <input type="checkbox" checked={formIsFestival} onChange={e => setFormIsFestival(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4" />
                  Is Festival
                </label>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                  <input type="checkbox" checked={formIsPrivate} onChange={e => setFormIsPrivate(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4" />
                  Private Event
                </label>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                  <input type="checkbox" checked={formIsUnplugged} onChange={e => setFormIsUnplugged(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4" />
                  Unplugged Show
                </label>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                  <input type="checkbox" checked={formIsOutdoor} onChange={e => setFormIsOutdoor(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4" />
                  Outdoor Show
                </label>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                  <input type="checkbox" checked={formIsCasino} onChange={e => setFormIsCasino(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4" />
                  Casino Show
                </label>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 cursor-pointer select-none">
                  <input type="checkbox" checked={formIsSpecialEvent} onChange={e => setFormIsSpecialEvent(e.target.checked)}
                    className="accent-[var(--color-accent)] w-4 h-4" />
                  Special Event
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer">
                  {submitting ? "Saving..." : "Save Show"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    {/* ═══ Notification Preferences Popup ═══ */}
    {notifyPopupShow && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setNotifyPopupShow(null)}>
        <div className="bg-[#0c0c18] border border-white/10 rounded-2xl w-full max-w-sm mx-4 shadow-[0_20px_60px_-15px_rgba(133,29,239,0.3)] animate-[fadeIn_0.2s_ease]" onClick={(e) => e.stopPropagation()}>
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-[var(--color-accent)] via-[#c026d3] to-[var(--color-accent)] rounded-t-2xl" />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Set Up Alerts</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider">{notifyPopupShow.venue}</p>
                </div>
              </div>
              <button onClick={() => setNotifyPopupShow(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Show info */}
            <div className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5 mb-4">
              <p className="text-xs text-white/60 font-semibold">{notifyPopupShow.venue} — {notifyPopupShow.city}, {notifyPopupShow.state}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{notifyPopupShow.date} · {notifyPopupShow.time}</p>
            </div>

            {/* What would you like? */}
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2 font-bold">What would you like to be notified about?</p>

            <div className="flex flex-col gap-2">
              {/* This show */}
              <button
                type="button"
                onClick={() => setNotifyPrefs(p => ({ ...p, thisShow: !p.thisShow }))}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                  notifyPrefs.thisShow
                    ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <span className={`w-8 h-4 rounded-full relative transition-all flex-shrink-0 ${
                  notifyPrefs.thisShow ? 'bg-[var(--color-accent)]' : 'bg-white/10'
                }`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                    notifyPrefs.thisShow ? 'left-[14px]' : 'left-0.5'
                  }`} />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white/80">🎤 This specific show</p>
                  <p className="text-[10px] text-white/30">Reminders & updates for {notifyPopupShow.venue}</p>
                </div>
              </button>

              {/* Proximity shows */}
              <button
                type="button"
                onClick={() => setNotifyPrefs(p => ({ ...p, proximity: !p.proximity }))}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                  notifyPrefs.proximity
                    ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <span className={`w-8 h-4 rounded-full relative transition-all flex-shrink-0 ${
                  notifyPrefs.proximity ? 'bg-[var(--color-accent)]' : 'bg-white/10'
                }`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                    notifyPrefs.proximity ? 'left-[14px]' : 'left-0.5'
                  }`} />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white/80">📍 Shows near me</p>
                  <p className="text-[10px] text-white/30">Get emailed when we book near your area</p>
                </div>
              </button>

              {/* Newsletter */}
              <button
                type="button"
                onClick={() => setNotifyPrefs(p => ({ ...p, newsletter: !p.newsletter }))}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                  notifyPrefs.newsletter
                    ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/40'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                }`}
              >
                <span className={`w-8 h-4 rounded-full relative transition-all flex-shrink-0 ${
                  notifyPrefs.newsletter ? 'bg-[var(--color-accent)]' : 'bg-white/10'
                }`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                    notifyPrefs.newsletter ? 'left-[14px]' : 'left-0.5'
                  }`} />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white/80">📧 Newsletter & exclusives</p>
                  <p className="text-[10px] text-white/30">News, drops & merch updates</p>
                </div>
              </button>
            </div>

            {/* Sending to email */}
            <p className="text-[10px] text-white/20 mt-3 text-center">
              Notifications will be sent to <span className="text-white/40 font-semibold">{member?.email}</span>
            </p>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setNotifyPopupShow(null)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleNotifyConfirm}
                disabled={!notifyPrefs.thisShow && !notifyPrefs.proximity && !notifyPrefs.newsletter}
                className="flex-1 py-2.5 bg-[var(--color-accent)] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-40 shadow-[0_0_15px_rgba(133,29,239,0.3)]"
              >
                {subscribingId ? 'Saving...' : 'Enable Alerts 🔔'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Font Customizer Modal/Panel ── */}
    {isFontCustomizerOpen && (
      <div className="fixed right-6 bottom-6 z-50 p-0 pointer-events-none">
        <div className="w-full max-w-sm bg-[#0d0914]/95 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative flex flex-col font-sans select-none pointer-events-auto animate-[fadeIn_0.2s_ease]" style={{ animation: "scaleIn 0.2s ease" }}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
            <h3 className="text-white font-extrabold text-sm uppercase tracking-wider">Font Tester</h3>
            <button 
              onClick={() => setIsFontCustomizerOpen(false)}
              className="text-white/40 hover:text-white text-xs cursor-pointer bg-white/5 hover:bg-white/10 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Font Family */}
          <div className="mb-5">
            <label className="block text-white/50 text-[10px] uppercase font-bold tracking-wider mb-2">Font Style</label>
            <select 
              value={tourFontFamily} 
              onChange={(e) => setTourFontFamily(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors cursor-pointer"
            >
              <option value="var(--font-body)" className="bg-[#0d0914] text-white">Barlow (Default)</option>
              <option value="var(--font-heading)" className="bg-[#0d0914] text-white">Rockstar (Heading)</option>
              <option value="Inter" className="bg-[#0d0914] text-white">Inter</option>
              <option value="Montserrat" className="bg-[#0d0914] text-white">Montserrat</option>
              <option value="Outfit" className="bg-[#0d0914] text-white">Outfit</option>
              <option value="Syne" className="bg-[#0d0914] text-white">Syne</option>
              <option value="Playfair Display" className="bg-[#0d0914] text-white">Playfair Display</option>
              <option value="Courier New" className="bg-[#0d0914] text-white">Monospace</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="mb-4">
             <div className="flex justify-between items-center mb-1.5">
               <label className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Font Size</label>
               <span className="text-[var(--color-accent)] text-xs font-bold font-mono">{tourFontSize}</span>
             </div>
             <input 
               type="range" 
               min="10" 
               max="24" 
               value={parseInt(tourFontSize) || 13}
               onChange={(e) => setTourFontSize(`${e.target.value}px`)}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
             />
             <div className="flex justify-between text-[8px] text-white/30 font-mono mt-0.5">
               <span>10px</span>
               <span>17px</span>
               <span>24px</span>
             </div>
           </div>

           {/* Row Padding */}
           <div className="mb-4">
             <div className="flex justify-between items-center mb-1.5">
               <label className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Row Padding</label>
               <span className="text-[var(--color-accent)] text-xs font-bold font-mono">{tourRowPadding}</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="40" 
               value={parseInt(tourRowPadding) || 0}
               onChange={(e) => setTourRowPadding(`${e.target.value}px`)}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
             />
             <div className="flex justify-between text-[8px] text-white/30 font-mono mt-0.5">
               <span>0px</span>
               <span>20px</span>
               <span>40px</span>
             </div>
           </div>

           {/* Row Spacing */}
           <div className="mb-4">
             <div className="flex justify-between items-center mb-1.5">
               <label className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Row Spacing (Margin)</label>
               <span className="text-[var(--color-accent)] text-xs font-bold font-mono">{tourRowGap}</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="30" 
               value={parseInt(tourRowGap) || 0}
               onChange={(e) => setTourRowGap(`${e.target.value}px`)}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
             />
             <div className="flex justify-between text-[8px] text-white/30 font-mono mt-0.5">
               <span>0px</span>
               <span>15px</span>
               <span>30px</span>
             </div>
           </div>

           {/* Row Height */}
           <div className="mb-5">
             <div className="flex justify-between items-center mb-1.5">
               <label className="text-white/50 text-[10px] uppercase font-bold tracking-wider">Row Height</label>
               <span className="text-[var(--color-accent)] text-xs font-bold font-mono">{tourRowHeight}</span>
             </div>
             <input 
               type="range" 
               min="30" 
               max="100" 
               value={parseInt(tourRowHeight) || 40}
               onChange={(e) => setTourRowHeight(`${e.target.value}px`)}
               className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
             />
             <div className="flex justify-between text-[8px] text-white/30 font-mono mt-0.5">
               <span>30px</span>
               <span>65px</span>
               <span>100px</span>
             </div>
           </div>

          {/* Code telemetry */}
          <div className="bg-black/40 border border-white/5 rounded-lg p-3.5 mb-5 font-mono text-[9px] text-white/60 select-all leading-relaxed whitespace-pre-wrap">
            {`font-size: ${tourFontSize};\nfont-family: ${tourFontFamily === 'var(--font-body)' ? 'Barlow' : tourFontFamily === 'var(--font-heading)' ? 'Rockstar' : tourFontFamily};\npadding: ${tourRowPadding} 0;\nmargin-bottom: ${tourRowGap};\nmin-height: ${tourRowHeight};`}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`font-size: ${tourFontSize};\nfont-family: ${tourFontFamily === 'var(--font-body)' ? 'Barlow' : tourFontFamily === 'var(--font-heading)' ? 'Rockstar' : tourFontFamily};\npadding: ${tourRowPadding} 0;\nmargin-bottom: ${tourRowGap};\nmin-height: ${tourRowHeight};`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors animate-all"
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
              className="py-2.5 bg-[var(--color-accent)] hover:bg-[rgba(133,29,239,0.9)] rounded-lg text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
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
