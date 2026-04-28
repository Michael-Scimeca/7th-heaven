"use client";

import { useEffect, useRef, useState, useCallback } from "react";
// IMPORT LEAFLET CSS - CRITICAL for correct tile rendering
import "leaflet/dist/leaflet.css";

// ── Geocoded venue coordinates ──
// Keyed by venue+city for deduplication
export const VENUE_COORDS: Record<string, [number, number]> = {
  "Station 34|Mt. Prospect": [42.0640, -87.9370],
  "Old Republic|Elgin": [42.0354, -88.2826],
  "Rookies|Hoffman Est.": [42.0744, -88.1912],
  "Rookie's Rockhouse|Hoffman Est.": [42.0744, -88.1912],
  "Sundance Saloon|Mundelein": [42.2766, -88.0418],
  "Durty Nellies|Palatine": [42.1150, -88.0340],
  "Stage 119|Elmhurst": [41.8994, -87.9403],
  "Jamos Live|Mokena": [41.5267, -87.8823],
  "Evenflow|Geneva": [41.8834, -88.3054],
  "Bannerman's|Bartlett": [41.9770, -88.1856],
  "Broken Oar|P. Barrington": [42.1600, -88.1370],
  "Tailgaters|Bolingbrook": [41.6956, -88.0689],
  "Midway Sports|Bartlett": [41.9830, -88.1880],
  "Joe's Live|Rosemont": [41.9947, -87.8643],
  "Rochaus|West Dundee": [42.0987, -88.2780],
  "Des Plaines Theater|Des Plaines": [42.0418, -87.8872],
  "Hard Rock Casino|Gary": [41.5921, -87.3445],
  "Hard Rock Casino|Rockford": [42.2666, -89.0469],
  "Corrigan's Pub|Shorewood": [41.5200, -88.2020],
  "Sideouts|Island Lake": [42.2770, -88.1930],
  "Bandito Barney's|East Dundee": [42.0990, -88.2700],
  "Deer Park Fest|Deer Park": [42.1600, -88.0810],
  "Chicago Auto Show First Look|Chicago": [41.8513, -87.6154],
  "WGN TV News Segment|Chicago": [41.8916, -87.6360],
  "Home Show|Chicago": [41.8513, -87.6154],
  "Youth Services Fundraiser|Wilmette": [42.0720, -87.7280],
  "Barb's Rescue Gala|Schaumburg": [42.0334, -88.0834],
  "Will County Beer & Bourbon Fest|Joliet": [41.5250, -88.0817],
  "Chicago Music Cruise|Miami": [25.7617, -80.1918],
};

const typeConfig: Record<string, { color: string; label: string }> = {
  full:       { color: "#a855f7", label: "Full Band" },
  unplugged:  { color: "#f59e0b", label: "Unplugged" },
  outdoor:    { color: "#22c55e", label: "Outdoor" },
  casino:     { color: "#eab308", label: "Casino" },
  tv:         { color: "#06b6d4", label: "TV" },
  fundraiser: { color: "#f43f5e", label: "Fundraiser" },
  special:    { color: "#ec4899", label: "Special" },
};

function getShowType(info: string): string {
  const lower = info.toLowerCase();
  if (lower.includes("unplugged")) return "unplugged";
  if (lower.includes("outdoor") || lower.includes("beer garden") || lower.includes("fest")) return "outdoor";
  if (lower.includes("casino")) return "casino";
  if (lower.includes("tv") || lower.includes("wgn") || lower.includes("news")) return "tv";
  if (lower.includes("fundraiser") || lower.includes("gala") || lower.includes("rescue")) return "fundraiser";
  if (lower.includes("cruise")) return "special";
  return "full";
}

// Haversine distance in miles
function distanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface ShowData {
  venue: string;
  city: string;
  state: string;
  date: string;
  time: string;
  info: string;
  mapUrl?: string;
  websiteUrl?: string;
}

interface TourMapProps {
  shows?: ShowData[];
  nextShowVenue?: string;
  nextShowCity?: string;
  onPinClick?: (venue: string, date: string) => void;
}

export default function TourMap({ shows, nextShowVenue, nextShowCity, onPinClick }: TourMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [nearMeResult, setNearMeResult] = useState<string | null>(null);

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
    if (!mapRef.current) return;

    // Cleanup existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    markersRef.current = [];

    // Build venue list from shows prop
    const mapVenues = (shows || [])
      .filter(s => s.city) // skip private events
      .map(s => {
        const key = `${s.venue}|${s.city}`;
        const coords = VENUE_COORDS[key];
        return coords ? { ...s, lat: coords[0], lng: coords[1], type: getShowType(s.info) } : null;
      })
      .filter(Boolean) as (ShowData & { lat: number; lng: number; type: string })[];

    // Deduplicate by venue+city (show the earliest date for each venue)
    const seen = new Set<string>();
    const uniqueVenues = mapVenues.filter(v => {
      const key = `${v.venue}|${v.city}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (uniqueVenues.length === 0) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      // Fix for leaflet icons in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      // Center on Chicagoland — most shows are in the IL suburbs
      const map = L.map(mapRef.current, {
        center: [42.0, -88.0],
        zoom: 9,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
      });

      const baseLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        { maxZoom: 18, subdomains: "abcd" }
      ).addTo(map);

      baseLayer.once("load", () => setIsLoaded(true));

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
        { maxZoom: 18, subdomains: "abcd", opacity: 1.0 }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      uniqueVenues.forEach((v) => {
        const cfg = typeConfig[v.type] || typeConfig.full;
        const isNext = nextShowVenue && v.venue === nextShowVenue && v.city === nextShowCity;
        const w = isNext ? 26 : 20;
        const h = isNext ? 34 : 26;
        const pulseClass = isNext ? "next-show-pulse" : "";

        const icon = L.divIcon({
          className: `custom-venue-marker ${pulseClass}`,
          html: `<div style="--glow-color: ${cfg.color}" class="${pulseClass}">
            <svg width="${w}" height="${h}" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 130C50 130 20 95 12 70C4 45 0 30 5 18C10 6 28 0 50 0C72 0 90 6 95 18C100 30 96 45 88 70C80 95 50 130 50 130Z" fill="${cfg.color}" stroke="${isNext ? '#fff' : 'rgba(255,255,255,0.3)'}" stroke-width="${isNext ? '4' : '2'}"/>
            </svg>
            ${isNext ? `<div class="next-show-ring" style="--ring-color: ${cfg.color}"></div>` : ""}
          </div>`,
          iconSize: [w, h],
          iconAnchor: [w / 2, h],
        });

        // Build Google Maps directions URL from Apple Maps or venue name
        const directionsUrl = v.mapUrl?.includes('maps.apple.com')
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.venue} ${v.city} ${v.state}`)}`
          : v.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.venue} ${v.city} ${v.state}`)}`;

        const marker = L.marker([v.lat, v.lng], { icon, zIndexOffset: isNext ? 1000 : 0 }).addTo(map);

        // Store marker reference for Near Me feature
        markersRef.current.push({ marker, venue: v.venue, date: v.date, city: v.city, lat: v.lat, lng: v.lng });

        marker.bindPopup(`
          <div style="background:#080812; color:white; padding:14px 16px; min-width:200px; border:1px solid ${cfg.color}44; font-family:system-ui,sans-serif;">
            <div style="font-weight:800; font-size:15px; margin-bottom:3px;">${v.venue}</div>
            <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-bottom:8px;">${v.city}, ${v.state}</div>
            <div style="font-size:11px; font-weight:700; color:${cfg.color}; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">${v.date} ${v.time || ""}</div>
            ${isNext ? '<div style="font-size:9px; margin-bottom:8px; color:#a855f7; font-weight:700; text-transform:uppercase; letter-spacing:2px;">⚡ Up Next</div>' : ""}
            <div style="display:flex; gap:12px; font-size:11px;">
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="color:${cfg.color}; text-decoration:underline; text-underline-offset:3px;">Directions</a>
              ${v.websiteUrl ? `<a href="${v.websiteUrl}" target="_blank" rel="noopener noreferrer" style="color:${cfg.color}; text-decoration:underline; text-underline-offset:3px;">Website</a>` : ""}
            </div>
          </div>
        `, { className: "venue-popup", offset: [0, -6], maxWidth: 280, minWidth: 200 });

        // Click-to-scroll: when popup opens, scroll to the show row in the table
        marker.on('popupopen', () => {
          if (onPinClick) onPinClick(v.venue, v.date);
        });
      });

      mapInstanceRef.current = map;
      
      // Force a resize check to fix broken tiles on initial load
      setTimeout(() => map.invalidateSize(), 500);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [shows, nextShowVenue, nextShowCity, onPinClick]);

  // Near Me handler
  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setNearMeResult("Geolocation not supported");
      setTimeout(() => setNearMeResult(null), 3000);
      return;
    }

    setLocating(true);
    setNearMeResult(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Find closest venue from current markers
        let closest: any = null;
        let minDist = Infinity;

        markersRef.current.forEach((m) => {
          const d = distanceMiles(userLat, userLng, m.lat, m.lng);
          if (d < minDist) {
            minDist = d;
            closest = m;
          }
        });

        if (closest && mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([closest.lat, closest.lng], 12, { duration: 1.2 });
          setTimeout(() => {
            closest.marker.openPopup();
            if (onPinClick) onPinClick(closest.venue, closest.date);
          }, 1300);
          setNearMeResult(`${closest.venue} — ${Math.round(minDist)} mi away`);
          setTimeout(() => setNearMeResult(null), 5000);
        }

        setLocating(false);
      },
      () => {
        setLocating(false);
        setNearMeResult("Location access denied");
        setTimeout(() => setNearMeResult(null), 3000);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, [onPinClick]);

  return (
    <div className="relative w-full aspect-[21/12] overflow-hidden border border-white/10 bg-[#0a0a14]">
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-[1]" />
      
      {/* Near Me Button */}
      <button
        onClick={handleNearMe}
        disabled={locating}
        className="absolute top-4 right-4 z-[4] flex items-center gap-2 px-4 py-2.5 bg-[rgba(8,8,18,0.92)] backdrop-blur-md border border-white/10 rounded-lg text-[0.7rem] font-bold uppercase tracking-wider text-white/80 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/40 transition-all cursor-pointer disabled:opacity-50"
      >
        {locating ? (
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        )}
        Near Me
      </button>

      {/* Near Me Result Toast */}
      {nearMeResult && (
        <div className="absolute top-16 right-4 z-[4] px-4 py-2.5 bg-[rgba(8,8,18,0.95)] backdrop-blur-md border border-[var(--color-accent)]/30 rounded-lg text-[0.7rem] font-semibold text-white animate-[fadeIn_0.3s_ease]">
          📍 {nearMeResult}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[4] px-5 py-4 bg-[rgba(8,8,18,0.92)] backdrop-blur-md border border-white/10 rounded-lg">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/50 mb-3">Show Types</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_6px_var(--dot-glow)]" style={{ backgroundColor: cfg.color, '--dot-glow': cfg.color } as any} />
              <span className="text-[0.7rem] font-semibold text-white">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[#0a0a14]">
          <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <style jsx global>{`
        .custom-venue-marker { background: transparent !important; border: none !important; }
        .venue-popup .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; }
        .venue-popup .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .venue-popup .leaflet-popup-tip { background: #080812 !important; }
        .leaflet-container { width: 100%; height: 100%; }
        .leaflet-container a { color: white !important; }
        
        /* Blinking pulse ring for next show */
        .next-show-pulse { position: relative; }
        .next-show-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -70%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--ring-color, #a855f7);
          animation: nextShowPulse 1.5s ease-out infinite;
          pointer-events: none;
        }
        @keyframes nextShowPulse {
          0% { transform: translate(-50%, -70%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -70%) scale(2.5); opacity: 0; }
        }
        .next-show-pulse > svg {
          animation: nextShowBlink 1.5s ease-in-out infinite;
        }
        @keyframes nextShowBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
