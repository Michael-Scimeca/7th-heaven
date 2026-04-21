"use client";

import { useEffect, useRef, useState } from "react";

// Full venue data with show info, dates, and links
const venues = [
 { name: "Station 34", city: "Mt. Prospect", state: "IL", lat: 42.0640, lng: -87.9370, type: "unplugged", date: "January 2", time: "8:30pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://www.google.com/maps/search/?api=1&query=Station+34+Mt+Prospect+IL", websiteUrl: "https://stationthirtyfour.com/events/" },
 { name: "Old Republic", city: "Elgin", state: "IL", lat: 42.0354, lng: -88.2826, type: "full", date: "January 3", time: "8:30pm", info: "All Age Sunset", mapUrl: "https://www.google.com/maps/search/?api=1&query=Old+Republic+Elgin+IL", websiteUrl: "" },
 { name: "Rookies", city: "Hoffman Est.", state: "IL", lat: 42.0680, lng: -88.1200, type: "unplugged", date: "January 9", time: "8:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://www.google.com/maps/search/?api=1&query=Rookies+Hoffman+Estates+IL", websiteUrl: "" },
 { name: "Sundance Saloon", city: "Mundelein", state: "IL", lat: 42.2631, lng: -88.0037, type: "unplugged", date: "January 11", time: "2:00pm", info: "F.A.N. Show - Unplugged", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sundance+Saloon+Mundelein+IL", websiteUrl: "" },
 { name: "WGN TV News", city: "Chicago", state: "IL", lat: 41.8905, lng: -87.6358, type: "tv", date: "January 28", time: "10:00am", info: "TV Appearance", mapUrl: "https://www.google.com/maps/search/?api=1&query=WGN+TV+Chicago+IL", websiteUrl: "https://wgntv.com" },
 { name: "Youth Services", city: "Wilmette", state: "IL", lat: 42.0753, lng: -87.7256, type: "fundraiser", date: "January 30", time: "7:00pm", info: "Fundraiser - Join Us!", mapUrl: "https://www.google.com/maps/search/?api=1&query=Wilmette+IL", websiteUrl: "" },
 { name: "Des Plaines Theater", city: "Des Plaines", state: "IL", lat: 42.0334, lng: -87.8834, type: "full", date: "January 31", time: "9:00pm", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Des+Plaines+Theater+IL", websiteUrl: "https://desplainestheatre.com" },
 { name: "Hard Rock Casino", city: "Rockford", state: "IL", lat: 42.2711, lng: -89.0940, type: "casino", date: "February 7", time: "8:00pm", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hard+Rock+Casino+Rockford+IL", websiteUrl: "https://hardrockcasinoil.com" },
 { name: "Durty Nellies", city: "Palatine", state: "IL", lat: 42.1103, lng: -88.0340, type: "full", date: "February 14", time: "9:30pm", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Durty+Nellies+Palatine+IL", websiteUrl: "https://www.durtynellies.com" },
 { name: "Stage 119", city: "Mt. Prospect", state: "IL", lat: 42.0663, lng: -87.9375, type: "full", date: "February 15", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Stage+119+Mt+Prospect+IL", websiteUrl: "" },
 { name: "Jamo's Live", city: "Rosemont", state: "IL", lat: 41.9786, lng: -87.8706, type: "full", date: "February 21", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Jamos+Live+Rosemont+IL", websiteUrl: "https://www.jamoslive.com" },
 { name: "Barb's Rescue Gala", city: "Hoffman Est.", state: "IL", lat: 42.0610, lng: -88.1290, type: "fundraiser", date: "February 22", time: "", info: "Fundraiser", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hoffman+Estates+IL", websiteUrl: "" },
 { name: "Evenflow", city: "Geneva", state: "IL", lat: 41.8842, lng: -88.3059, type: "full", date: "April 24", time: "8:00pm", info: "Next Up!", mapUrl: "https://www.google.com/maps/search/?api=1&query=Evenflow+Geneva+IL", websiteUrl: "https://evenflowbar.com" },
 { name: "Sundance Saloon", city: "Mundelein", state: "IL", lat: 42.2636, lng: -88.0040, type: "full", date: "March 22", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sundance+Saloon+Mundelein+IL", websiteUrl: "" },
 { name: "Bannerman's", city: "Chicago", state: "IL", lat: 41.9466, lng: -87.6756, type: "full", date: "March 8", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Bannermans+Chicago+IL", websiteUrl: "" },
 { name: "Broken Oar", city: "Mokena", state: "IL", lat: 41.5267, lng: -87.8829, type: "full", date: "March 7", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Broken+Oar+Mokena+IL", websiteUrl: "" },
 { name: "Tailgaters", city: "Bolingbrook", state: "IL", lat: 41.6986, lng: -88.0684, type: "full", date: "March 27", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tailgaters+Bolingbrook+IL", websiteUrl: "" },
 { name: "Old Republic", city: "Elgin", state: "IL", lat: 42.0359, lng: -88.2830, type: "unplugged", date: "March 28", time: "", info: "Unplugged", mapUrl: "https://www.google.com/maps/search/?api=1&query=Old+Republic+Elgin+IL", websiteUrl: "" },
 { name: "Rookie's Rockhouse", city: "Bartlett", state: "IL", lat: 41.9950, lng: -88.1856, type: "full", date: "March 29", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Rookies+Rockhouse+Bartlett+IL", websiteUrl: "" },
 { name: "Corrigan's Pub", city: "Island Lake", state: "IL", lat: 42.2753, lng: -88.1920, type: "full", date: "April 5", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Corrigans+Pub+Island+Lake+IL", websiteUrl: "" },
 { name: "Midway Sports", city: "Shorewood", state: "IL", lat: 41.5230, lng: -88.2020, type: "full", date: "April 5", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Midway+Sports+Shorewood+IL", websiteUrl: "" },
 { name: "Joe's Live", city: "Rosemont", state: "IL", lat: 41.9795, lng: -87.8695, type: "full", date: "April 11", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Joes+Live+Rosemont+IL", websiteUrl: "https://joeslive.com" },
 { name: "Rochaus", city: "W. Dundee", state: "IL", lat: 42.0989, lng: -88.2768, type: "full", date: "April 26", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Rochaus+West+Dundee+IL", websiteUrl: "https://rochaus.com" },
 { name: "Station 34", city: "Mt. Prospect", state: "IL", lat: 42.0645, lng: -87.9375, type: "full", date: "May 1", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Station+34+Mt+Prospect+IL", websiteUrl: "https://stationthirtyfour.com/events/" },
 { name: "Deer Park Fest", city: "Deer Park", state: "IL", lat: 42.1600, lng: -88.0810, type: "outdoor", date: "May 2", time: "", info: "Outdoor Festival", mapUrl: "https://www.google.com/maps/search/?api=1&query=Deer+Park+IL", websiteUrl: "" },
 { name: "Sideouts", city: "Island Lake", state: "IL", lat: 42.2780, lng: -88.1930, type: "full", date: "May 9", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sideouts+Island+Lake+IL", websiteUrl: "" },
 { name: "Durty Nellies", city: "Palatine", state: "IL", lat: 42.1108, lng: -88.0345, type: "full", date: "May 16", time: "", info: "", mapUrl: "https://www.google.com/maps/search/?api=1&query=Durty+Nellies+Palatine+IL", websiteUrl: "https://www.durtynellies.com" },
 { name: "Will County BBF", city: "Joliet", state: "IL", lat: 41.5281, lng: -88.0834, type: "outdoor", date: "May 23", time: "", info: "Beer & Bourbon Fest", mapUrl: "https://www.google.com/maps/search/?api=1&query=Joliet+IL", websiteUrl: "" },
];

const typeConfig: Record<string, { color: string; label: string }> = {
 full:       { color: "#a855f7", label: "Full Band" },
 unplugged:  { color: "#f59e0b", label: "Unplugged" },
 outdoor:    { color: "#22c55e", label: "Outdoor" },
 casino:     { color: "#eab308", label: "Casino" },
 tv:         { color: "#06b6d4", label: "TV" },
 fundraiser: { color: "#f43f5e", label: "Fundraiser" },
 special:    { color: "#ec4899", label: "Special" },
};

export default function TourMap() {
 const mapRef = useRef<HTMLDivElement>(null);
 const mapInstanceRef = useRef<L.Map | null>(null);
 const [isLoaded, setIsLoaded] = useState(false);

 // Preconnect to tile CDN for faster loading
 useEffect(() => {
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = "https://a.basemaps.cartocdn.com";
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
  return () => { document.head.removeChild(link); };
 }, []);

 useEffect(() => {
  if (!mapRef.current || mapInstanceRef.current) return;

  import("leaflet").then((L) => {
   delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;

   const map = L.map(mapRef.current!, {
    center: [41.95, -87.95],
    zoom: 9,
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false,
    dragging: true,
    doubleClickZoom: false,
   });

   // Dark tile layer — CartoDB Dark Matter
   const baseLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    { maxZoom: 18, subdomains: "abcd" }
   ).addTo(map);

   // Reveal map once first batch of tiles loads
   baseLayer.once("load", () => setIsLoaded(true));

   // Subtle labels layer on top
   L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
    { maxZoom: 18, subdomains: "abcd", opacity: 1.0 }
   ).addTo(map);

   // Zoom control bottom-right
   L.control.zoom({ position: "bottomright" }).addTo(map);

    // Hard-linking the precise upcoming show (Evenflow - Feb 27)
    const nextIndex = 12;

    // Add custom markers with click popups
    venues.forEach((v, index) => {
     const isNextShow = index === nextIndex; // Identify the chronological next show computationally
     const cfg = typeConfig[v.type] || typeConfig.full;
     const w = 20;
     const h = 26;

     const icon = L.divIcon({
      className: "custom-venue-marker",
      html: `<div style="${isNextShow ? `z-index: 9999; --glow-color: ${cfg.color}; animation: pulseNextShow 2s infinite ease-in-out;` : ''}">
       <svg width="${w}" height="${h}" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer; position: relative;">
        <path d="M50 130C50 130 20 95 12 70C4 45 0 30 5 18C10 6 28 0 50 0C72 0 90 6 95 18C100 30 96 45 88 70C80 95 50 130 50 130Z" fill="${cfg.color}" stroke="${isNextShow ? '#fff' : 'rgba(255,255,255,0.3)'}" stroke-width="${isNextShow ? '4' : '2'}"/>
       </svg>
       ${isNextShow ? `<div style="position: absolute; top: -26px; left: 50%; transform: translateX(-50%); background: white; color: black; font-size: 8px; font-weight: 900; line-height: 1; padding: 4px 6px; border-radius: 4px; border: 2px solid ${cfg.color}; white-space: nowrap; pointer-events: none; text-transform: uppercase; z-index: 10000; box-shadow: 0 4px 15px rgba(0,0,0,0.8);">NEXT SHOW</div>` : ''}
      </div>`,
      iconSize: [w, h],
      iconAnchor: [w / 2, h],
     });

    const marker = L.marker([v.lat, v.lng], { icon }).addTo(map);

    // Build popup links
    const mapLink = v.mapUrl ? `<a href="${v.mapUrl}" target="_blank" rel="noopener noreferrer" style="color:${cfg.color}; text-decoration:none; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; display:inline-flex; align-items:center; gap:4px;">📍 Directions</a>` : "";
    const webLink = v.websiteUrl ? `<a href="${v.websiteUrl}" target="_blank" rel="noopener noreferrer" style="color:${cfg.color}; text-decoration:none; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; display:inline-flex; align-items:center; gap:4px;">🌐 Website</a>` : "";
    const infoTag = v.info ? `<div style="color:${cfg.color}; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; margin-top:6px; padding:3px 6px; background:rgba(255,255,255,0.04); display:inline-block;">${cfg.label}${v.info ? ' — ' + v.info : ''}</div>` : `<div style="color:${cfg.color}; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; margin-top:6px;">${cfg.label}</div>`;

    // Click popup with full info
    marker.bindPopup(
     `<div style="
      background: rgba(8,8,18,0.97);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(168,85,247,0.25);
      padding: 14px 16px;
      font-family: 'Barlow', sans-serif;
      color: white;
      border-radius: 0;
      min-width: 200px;
      max-width: 260px;
     ">
      <div style="font-weight:800; font-size:14px; letter-spacing:-0.01em; margin-bottom:2px;">${v.name}</div>
      <div style="color: rgba(255,255,255,0.45); font-size:11px;">${v.city}, ${v.state}</div>

      <div style="margin-top:10px; display:flex; align-items:center; gap:8px; padding:8px 0; border-top:1px solid rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.06);">
       <div style="font-size:22px; font-weight:800; color:white; line-height:1;">${v.date.split(' ')[1]}</div>
       <div>
        <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:rgba(255,255,255,0.6); letter-spacing:0.1em;">${v.date.split(' ')[0]}</div>
        ${v.time ? `<div style="font-size:11px; color:white; font-weight:600;">${v.time}</div>` : ''}
       </div>
      </div>

      ${infoTag}

      <div style="margin-top:10px; display:flex; gap:12px;">
       ${mapLink}
       ${webLink}
      </div>
     </div>`,
     {
      className: "venue-popup",
      closeButton: true,
      maxWidth: 280,
      offset: [0, -6],
     }
    );

    // Hover tooltip (just name)
    marker.bindTooltip(
     `<div style="
      background: rgba(10,10,20,0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(168,85,247,0.3);
      padding: 6px 10px;
      font-family: 'Barlow', sans-serif;
      color: white;
      border-radius: 0;
      font-size: 11px;
      white-space: nowrap;
     ">
      <span style="font-weight:700;">${v.name}</span>
      <span style="color:rgba(255,255,255,0.4); margin-left:6px; font-size:10px;">${v.date}</span>
     </div>`,
     {
      direction: "top",
      offset: [0, -8],
      className: "venue-tooltip",
      permanent: false,
     }
    );
   });


   mapInstanceRef.current = map;
  });

  return () => {
   mapInstanceRef.current?.remove();
   mapInstanceRef.current = null;
  };
 }, []);

 return (
  <div className="relative w-full aspect-[21/9] overflow-hidden border border-white/10 bg-[#0a0a14]">
   <div ref={mapRef} className="absolute inset-0 w-full h-full z-[1]" />

    {/* Legend overlay — bottom left */}
    <div className="absolute bottom-4 left-4 z-[4] px-4 py-3 bg-[rgba(8,8,18,0.85)] backdrop-blur-md border border-white/10">
     <p className="text-[0.5rem] font-bold uppercase tracking-[0.2em] text-white/60 mb-2">Show Types</p>
     <div className="flex flex-col gap-1.5">
      {Object.entries(typeConfig).map(([key, cfg]) => (
        <div key={key} className="flex items-center gap-2">
         <svg width="10" height="13" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
          <path d="M50 130C50 130 20 95 12 70C4 45 0 30 5 18C10 6 28 0 50 0C72 0 90 6 95 18C100 30 96 45 88 70C80 95 50 130 50 130Z" fill={cfg.color}/>
         </svg>
         <span className="text-[0.6rem] font-semibold text-white/90">{cfg.label}</span>
        </div>
      ))}
     </div>

    </div>

   {/* Loading state */}
   {!isLoaded && (
    <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[#0a0a14]">
     <div className="flex flex-col items-center gap-3">
      <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/30">Loading Map</span>
     </div>
    </div>
   )}

   {/* Edge gradients */}
   <div className="absolute inset-0 pointer-events-none z-[3]" style={{
    background: `
     linear-gradient(to right, rgba(10,10,20,0.9) 0%, transparent 10%, transparent 90%, rgba(10,10,20,0.9) 100%),
     linear-gradient(to bottom, rgba(10,10,20,0.7) 0%, transparent 12%, transparent 88%, rgba(10,10,20,0.9) 100%)
    `
   }} />



   <style jsx global>{`
    @keyframes pulseNextShow {
     0% { filter: drop-shadow(0 0 8px var(--glow-color)) drop-shadow(0 0 15px var(--glow-color)); transform: scale(1); }
     50% { filter: drop-shadow(0 0 20px var(--glow-color)) drop-shadow(0 0 35px var(--glow-color)); transform: scale(1.15); }
     100% { filter: drop-shadow(0 0 8px var(--glow-color)) drop-shadow(0 0 15px var(--glow-color)); transform: scale(1); }
    }
    .custom-venue-marker {
     background: transparent !important;
     border: none !important;
    }
    .venue-tooltip {
     background: transparent !important;
     border: none !important;
     box-shadow: none !important;
     padding: 0 !important;
    }
    .venue-tooltip::before {
     display: none !important;
    }
    .venue-popup .leaflet-popup-content-wrapper {
     background: transparent !important;
     border-radius: 0 !important;
     box-shadow: none !important;
     padding: 0 !important;
    }
    .venue-popup .leaflet-popup-content {
     margin: 0 !important;
    }
    .venue-popup .leaflet-popup-tip {
     background: rgba(8,8,18,0.97) !important;
     border: 1px solid rgba(168,85,247,0.25) !important;
     box-shadow: none !important;
    }
    .venue-popup .leaflet-popup-close-button {
     color: rgba(255,255,255,0.7) !important;
     font-size: 18px !important;
     padding: 6px 8px !important;
     top: 2px !important;
     right: 2px !important;
    }
    .venue-popup .leaflet-popup-close-button:hover {
     color: white !important;
    }
    .venue-popup a:hover {
     opacity: 0.8;
    }
    .leaflet-control-zoom {
     border: 1px solid rgba(255,255,255,0.1) !important;
     border-radius: 0 !important;
     overflow: hidden;
    }
    .leaflet-control-zoom a {
     background: rgba(10,10,20,0.9) !important;
     color: rgba(255,255,255,0.8) !important;
     border-color: rgba(255,255,255,0.1) !important;
     width: 28px !important;
     height: 28px !important;
     line-height: 28px !important;
     font-size: 14px !important;
    }
    .leaflet-control-zoom a:hover {
     background: rgba(133,29,239,0.3) !important;
     color: white !important;
    }
   `}</style>
  </div>
 );
}
