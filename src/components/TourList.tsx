"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { SanityTourDate } from "@/lib/sanity";
import "leaflet/dist/leaflet.css";
import TourMap from "./TourMap";
import CountdownTimer from "./CountdownTimer";

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
];

// --- Helper functions ---
function getShowTags(info: string): string[] {
 const lower = info.toLowerCase();
 const tags: string[] = [];
 if (lower.includes("unplugged")) tags.push("Unplugged");
 if (lower.includes("outdoor") || lower.includes("beer garden")) tags.push("Outdoor");
 if (lower.includes("21 &") || lower.includes("21+")) tags.push("21+");
 if (lower.includes("all age") || lower.includes("all-age")) tags.push("All Ages");
 if (lower.includes("gala") || lower.includes("fundraiser") || lower.includes("festival") || lower.includes("casino") || lower.includes("cruise") || lower.includes("tv appearance")) tags.push("Special Event");
 return tags;
}

function getShowIcon(info: string): string {
 const lower = info.toLowerCase();
 if (lower.includes("unplugged")) return "🪕";
 if (lower.includes("outdoor") || lower.includes("beer garden")) return "🌿";
 if (lower.includes("casino")) return "🎰";
 if (lower.includes("festival") || lower.includes("fest")) return "🎪";
 if (lower.includes("tv") || lower.includes("wgn") || lower.includes("news")) return "📺";
 if (lower.includes("fundraiser") || lower.includes("gala") || lower.includes("rescue")) return "🎗️";
 if (lower.includes("cruise")) return "🚢";
 return "🎸";
}

const typeOptions = ["Unplugged", "Outdoor", "21+", "All Ages", "Special Event"];

// Shared dropdown styles
const selectClass = "appearance-none bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg pl-3 pr-7 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white/70 cursor-pointer transition-all duration-200 focus:outline-none focus:border-[var(--color-accent)] hover:border-[rgba(255,255,255,0.15)] hover:text-white/90";
const activeSelect = "!border-[var(--color-accent)] !text-[var(--color-accent)]";

interface TourListProps {
 initialShows?: any[];
}

export default function TourList({ initialShows }: TourListProps) {
 const [activeMonth, setActiveMonth] = useState("All");
 const [activeType, setActiveType] = useState("All");
 const [activeCity, setActiveCity] = useState("All");
 const [searchQuery, setSearchQuery] = useState("");
 const [highlightedId, setHighlightedId] = useState<string | null>(null);

 const displayShows = useMemo(() => {
  if (initialShows && initialShows.length > 0) return initialShows;
  return shows;
 }, [initialShows]);

 // Derive filter options from current data source
 const months = useMemo(() => [...new Set(displayShows.map((s: any) => s.date.split(' ')[0]))], [displayShows]);
 const locationOptions = useMemo(() => {
  const counts: Record<string, number> = {};
  displayShows.forEach((s: any) => { if (s.city) counts[s.city] = (counts[s.city] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([city]) => city);
 }, [displayShows]);

 const tableRef = useRef<HTMLDivElement>(null);

 const scrollToShow = useCallback((venue: string, date: string) => {
  // Clear any filters first so the row is visible
  setActiveMonth("All");
  setActiveType("All");
  setActiveCity("All");
  setSearchQuery("");
  const id = `tour-${venue}-${date}`.replace(/\s+/g, '-').toLowerCase();
  // Delay to let filters clear and DOM update
  setTimeout(() => {
   const el = document.getElementById(id);
   if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 3000);
   }
  }, 100);
 }, []);

 const filtered = useMemo(() => {
  const q = searchQuery.toLowerCase().trim();
  return displayShows.filter((s) => {
   if (activeMonth !== "All" && !s.date.startsWith(activeMonth)) return false;
   if (activeType !== "All" && !getShowTags(s.info).includes(activeType)) return false;
   if (activeCity !== "All" && s.city !== activeCity) return false;
   if (q && !s.venue.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q) && !s.info.toLowerCase().includes(q)) return false;
   return true;
  });
 }, [displayShows, activeMonth, activeType, activeCity, searchQuery]);

 const showCount = filtered.length;
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
    const currentYear = now.getFullYear();
    for (const show of displayShows) {
      const showDate = new Date(`${show.date}, ${currentYear}`);
      if (showDate >= now && show.city) return show;
    }
    return displayShows.find((s: any) => s.city) || displayShows[0]; // fallback to first show with a city
  };

  const upNext = getUpcomingShow();

  // Calculate days until show
  const getDaysUntil = () => {
    const now = new Date();
    const showDate = new Date(`${upNext.date}, ${now.getFullYear()}`);
    const diff = Math.ceil((showDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Tonight";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return "";
    return `${diff} days away`;
  };

  const daysLabel = getDaysUntil();

 return (
  <>
   {/* Table */}
   <section className="py-12 bg-[var(--color-bg-primary)]" ref={tableRef}>
    <div className="site-container">

     {/* Section Heading */}
     <div className="mb-6">
      <h2 className="text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tight">
       Upcoming <span className="gradient-text">Shows</span>
      </h2>
      <p className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-white/30 mt-1">Tour Dates — Live in Concert</p>
     </div>

     {/* Full-Width Map */}
     <div className="mb-0">
      <TourMap />
     </div>

      {/* Up Next — Neon Glow / Festival (below map) */}
      <div className="mb-12">
       <div className="relative border border-white/10 border-t-0 bg-[rgba(20,15,30,0.8)] overflow-hidden">
         {/* Subtle purple gradient from right */}
         <div className="absolute inset-0 bg-gradient-to-l from-[rgba(133,29,239,0.15)] via-transparent to-transparent pointer-events-none" />

         <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between gap-6">
           {/* Left Column: Info */}
           <div className="relative flex flex-col justify-between min-h-[140px]">
             {/* Background gradient glow */}
             <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_center,rgba(133,29,239,0.2)_0%,transparent_70%)] pointer-events-none" />
             {/* UP NEXT label */}
             <div className="flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] mb-5">
               <span className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full animate-pulse" />
               <span className="text-[var(--color-accent)]">Up Next</span>
               {daysLabel && (
                 <>
                   <span className="text-white/20">·</span>
                   <span className="text-[var(--color-accent)]">{daysLabel}</span>
                 </>
               )}
             </div>

             {/* Venue name — stacked words */}
             <h3 className="font-[var(--font-heading)] text-[2.8rem] md:text-[3.8rem] font-extrabold text-white leading-[0.92] mb-4 uppercase">
               {upNext.venue.split(' ').map((word: string, i: number) => (
                 <span key={i} className="block">{word}</span>
               ))}
             </h3>

             {/* Location + time */}
             <div className="flex items-center gap-2">
               <span className="text-[0.85rem] text-white/70 font-medium">
                 📍 {upNext.city}{upNext.state ? `, ${upNext.state}` : ""}
               </span>
               {upNext.time && (
                 <>
                   <span className="text-white/20">·</span>
                   <span className="text-[0.85rem] text-white/50">{upNext.time}</span>
                 </>
               )}
             </div>
           </div>

           {/* Right Column: Date + Timer + Buttons */}
           <div className="flex flex-col items-start md:items-end justify-between gap-4 shrink-0">
             {/* Date */}
             <span className="text-[0.7rem] text-white/40 font-medium italic">
               {upNext.day === "Mon" ? "Monday" : upNext.day === "Tue" ? "Tuesday" : upNext.day === "Wed" ? "Wednesday" : upNext.day === "Thu" ? "Thursday" : upNext.day === "Fri" ? "Friday" : upNext.day === "Sat" ? "Saturday" : "Sunday"}, {upNext.date.split(" ")[0]} {upNext.date.split(" ")[1]}
             </span>

             {/* Countdown Timer */}
             <CountdownTimer targetDate={`${upNext.date}, ${new Date().getFullYear()}`} targetTime={upNext.time} />

             {/* Buttons */}
             <div className="flex gap-3">
               {upNext.mapUrl && (
                  <a href={upNext.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-outline-hover text-[0.75rem] py-3 px-6 border-[var(--color-accent)]/30" id="upnext-map">
                    📍 Directions
                  </a>

               )}
               {upNext.websiteUrl && (
                  <a href={upNext.websiteUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-primary-hover text-[0.75rem] py-3 px-8 scale-105" id="upnext-website">
                    Website
                  </a>
               )}
             </div>
           </div>
         </div>
       </div>
      </div>


     {/* Show count + Clear */}
     <div className="flex items-center justify-between mb-3">
      <p className="text-[0.7rem] text-[var(--color-text-muted)] tracking-wide">
       Showing <span className="text-[var(--color-accent)] font-bold">{showCount}</span> {showCount === 1 ? "show" : "shows"}
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
      {hasActiveFilters && (
       <button
        onClick={clearAll}
        className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--color-accent)] hover:text-white border border-[rgba(133,29,239,0.3)] hover:border-[rgba(133,29,239,0.6)] rounded-md px-2.5 py-1 transition-all duration-200 cursor-pointer whitespace-nowrap bg-[rgba(133,29,239,0.08)]"
       >Clear</button>
      )}
     </div>

     {/* Header Row with Inline Filters */}
     <div className="sticky top-[72px] z-30 hidden md:grid grid-cols-[50px_100px_1fr_130px_70px_160px_36px_120px] gap-3 px-6 py-3 bg-[rgba(17,17,24,0.95)] backdrop-blur-md border-y border-[var(--color-border)] mb-1 items-center">
      {/* DAY label */}
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Day</span>

      {/* MONTH dropdown */}
      <div className="relative">
       <select
        value={activeMonth}
        onChange={(e) => setActiveMonth(e.target.value)}
        className={`${selectClass} w-full ${activeMonth !== "All" ? activeSelect : ""}`}
        id="tour-filter-month"
       >
        <option value="All">Month</option>
        {months.map((m) => <option key={m} value={m}>{m}</option>)}
       </select>
       <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
       </svg>
      </div>

      {/* SEARCH in Venue column */}
      <div className="relative">
       <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
       </svg>
       <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-[200px] bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] rounded-lg pl-8 pr-7 py-1.5 text-[0.65rem] text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-accent)] transition-colors"
        id="tour-search"
       />
       {searchQuery && (
        <button
         onClick={() => setSearchQuery("")}
         className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-[0.6rem] cursor-pointer"
        >✕</button>
       )}
      </div>

      {/* CITY dropdown */}
      <div className="relative">
       <select
        value={activeCity}
        onChange={(e) => setActiveCity(e.target.value)}
        className={`${selectClass} w-full ${activeCity !== "All" ? activeSelect : ""}`}
        id="tour-filter-city"
       >
        <option value="All">City</option>
        {locationOptions.map((c) => <option key={c} value={c}>{c}</option>)}
       </select>
       <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
       </svg>
      </div>

      {/* TIME label */}
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Time</span>

      {/* TYPE dropdown */}
      <div className="relative">
       <select
        value={activeType}
        onChange={(e) => setActiveType(e.target.value)}
        className={`${selectClass} w-full ${activeType !== "All" ? activeSelect : ""}`}
        id="tour-filter-type"
       >
        <option value="All">Type</option>
        {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
       </select>
       <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
       </svg>
      </div>

      {/* MAP label */}
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-text-muted)] text-center">Map</span>

      {/* TICKETS label */}
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Website</span>
     </div>

     {/* Rows */}
     <div className="flex flex-col gap-1.5">
      {filtered.map((show, i) => {
       const isUpNext = show.date === upNext.date && show.venue === upNext.venue;
       const rowId = `tour-${show.venue}-${show.date}`.replace(/\s+/g, '-').toLowerCase();
       const isHighlighted = highlightedId === rowId;
       return (
        <div
         key={`${show.date}-${show.venue}-${i}`}
         className={`relative grid grid-cols-1 md:grid-cols-[50px_100px_1fr_130px_70px_160px_36px_120px] gap-2 md:gap-3 px-6 py-5 border items-center text-sm text-[var(--color-text-secondary)] transition-all duration-300 ${isHighlighted ? "border-[var(--color-accent)] bg-[rgba(133,29,239,0.15)] shadow-[inset_4px_0_0_var(--color-accent),0_0_20px_rgba(133,29,239,0.2)] animate-pulse" : isUpNext ? "border-[var(--color-accent)] bg-[rgba(133,29,239,0.08)] shadow-[inset_4px_0_0_var(--color-accent)]" : `border-[var(--color-border)] ${i % 2 === 0 ? "bg-[var(--color-bg-card)]" : "bg-[rgba(255,255,255,0.07)]"}`} ${!show.city ? "opacity-50" : ""}`}
         id={rowId}
        >
         {isUpNext && (
          <span className="absolute -top-3 left-6 text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white bg-[var(--color-accent)] px-3 py-0.5">
           Up Next
          </span>
         )}
         <span className="font-[var(--font-heading)] font-bold text-xs uppercase text-[var(--color-accent)]">{show.day}</span>
         <span>{show.date}</span>
         <span className="font-bold text-[var(--color-text-primary)]">{show.venue}</span>
         <span>{show.city}{show.state ? `, ${show.state}` : ""}</span>
         <span>{show.time}</span>
         <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
          <span className="text-sm">{getShowIcon(show.info)}</span>
          {show.info}
         </span>
         <span className="flex items-center justify-center">
          {show.mapUrl && (() => {
           const gUrl = show.mapUrl.includes('maps.apple.com')
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${show.venue} ${show.city} ${show.state}`)}`
            : show.mapUrl;
           return (
            <a 
              href={gUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              title="Get Directions" 
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--color-border-hover)] text-[var(--color-accent)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-all duration-300"
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
             </svg>
            </a>
           );
          })()}
         </span>
         <span>
          {show.websiteUrl ? (
           <a 
             href={show.websiteUrl} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.75rem] font-bold uppercase tracking-wider px-5 py-2.5 bg-[var(--color-accent)] text-white hover:bg-[rgba(133,29,239,0.9)] transition-all duration-300 rounded-sm"
           >
            Website
           </a>
          ) : (
           <span className="inline-flex items-center gap-1 whitespace-nowrap text-[0.7rem] font-bold uppercase tracking-wider px-5 py-2.5 border border-white/5 text-white/10 rounded-sm cursor-default">
            Website
           </span>
          )}
         </span>

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
  </>
 );
}
