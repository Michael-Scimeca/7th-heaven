"use client";

import { useEffect, useRef, useState, useCallback } from "react";
// IMPORT LEAFLET CSS - CRITICAL for correct tile rendering
import "leaflet/dist/leaflet.css";

import { VENUE_COORDS } from "@/lib/venue-coords";
export { VENUE_COORDS };

export const typeConfig: Record<string, { color: string; label: string }> = {
  full:       { color: "#a855f7", label: "Full Band" },
  unplugged:  { color: "#f59e0b", label: "Unplugged" },
  outdoor:    { color: "#22c55e", label: "Outdoor" },
  casino:     { color: "#eab308", label: "Casino" },
  tv:         { color: "#06b6d4", label: "TV" },
  fundraiser: { color: "#f43f5e", label: "Fundraiser" },
  special:    { color: "#ec4899", label: "Special" },
};

export function getShowType(info: string): string {
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

export interface ShowData {
  venue: string;
  city: string;
  state: string;
  date: string;
  time: string;
  playTime?: string;
  info: string;
  mapUrl?: string;
  websiteUrl?: string;
  allAges?: boolean;
  lat?: number;
  lng?: number;
  startDate?: string;
}

export function getShowDateTime(startDateStr?: string, dateStr?: string, timeStr?: string): Date {
  let d: Date;
  if (startDateStr && /^\d{4}-\d{2}-\d{2}/.test(startDateStr)) {
    d = new Date(startDateStr + 'T00:00:00');
  } else if (dateStr) {
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      d = new Date(dateStr + 'T00:00:00');
    } else if (/\b\d{4}\b/.test(dateStr)) {
      d = new Date(dateStr);
    } else {
      const currentYear = new Date().getFullYear();
      d = new Date(`${dateStr}, ${currentYear}`);
    }
  } else {
    return new Date(0);
  }

  if (isNaN(d.getTime())) return new Date(0);

  if (timeStr) {
    const cleaned = timeStr.toLowerCase().replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (match) {
      let h = parseInt(match[1]);
      const m = parseInt(match[2] || '0');
      const ampm = match[3].toLowerCase();
      if (ampm === 'pm' && h !== 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      d.setHours(h, m, 0, 0);
      return d;
    }
  }
  // Default to end of day
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isShowOver(show: { startDate?: string; date: string; time: string }): boolean {
  const showDateTime = getShowDateTime(show.startDate, show.date, show.time);
  // Keep the show active on the map for 4 hours after its start time
  return showDateTime.getTime() + (4 * 60 * 60 * 1000) < Date.now();
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
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [markerCount, setMarkerCount] = useState(0);
  const [L, setL] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  // Preconnect to tile CDN for faster loading
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://a.basemaps.cartocdn.com";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // Load Leaflet library once on mount
  useEffect(() => {
    import("leaflet").then((module) => {
      setL(module);
    });
  }, []);

  // Initialize Leaflet Map once L is loaded
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    // Fix Next.js default icon issues
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    // Center on Chicagoland — most shows are in the IL suburbs
    const mapInstance = L.map(mapRef.current, {
      center: [42.0, -88.0],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true,
    });

    const baseLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 18, subdomains: "abcd" }
    ).addTo(mapInstance);

    baseLayer.once("load", () => setIsLoaded(true));

    L.control.zoom({ position: "bottomright" }).addTo(mapInstance);

    // Close tooltips when clicked
    mapInstance.on('tooltipopen', (e: any) => {
      const tooltip = e.tooltip;
      const container = tooltip.getElement();
      if (container) {
        container.style.pointerEvents = 'auto';
        container.style.cursor = 'pointer';
        
        const closeTooltip = () => {
          mapInstance.closeTooltip(tooltip);
        };
        
        container.addEventListener('click', closeTooltip);
      }
    });

    // Close popups when clicked (unless clicking a link)
    mapInstance.on('popupopen', (e: any) => {
      const popup = e.popup;
      const container = popup.getElement();
      if (container) {
        container.style.cursor = 'pointer';
        
        const handlePopupClick = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (target.closest('a')) return; // Allow clicking links
          mapInstance.closePopup(popup);
        };
        
        container.addEventListener('click', handlePopupClick);
      }
    });

    setMap(mapInstance);
    mapInstanceRef.current = mapInstance;

    // Force a resize check to fix broken tiles on initial load
    setTimeout(() => mapInstance.invalidateSize(), 500);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMap(null);
      }
    };
  }, [L]);

  // Draw and Update Markers
  useEffect(() => {
    if (!L || !map) return;

    console.log("TourMap drawing markers. nextShowVenue:", nextShowVenue, "nextShowCity:", nextShowCity);
    console.log("Shows list count:", shows?.length);

    // Clear old markers
    markersRef.current.forEach(m => m.marker.remove());
    markersRef.current = [];

    // Group shows by venue+city to support multiple shows at the same location
    interface GroupedVenue {
      venue: string;
      city: string;
      state: string;
      lat: number;
      lng: number;
      type: string;
      shows: {
        date: string;
        time: string;
        playTime?: string;
        info: string;
        allAges?: boolean;
        mapUrl?: string;
        websiteUrl?: string;
      }[];
    }

    const showGroups: Record<string, GroupedVenue> = {};

    (shows || [])
      .filter(s => s.city) // skip private events
      .filter(s => !isShowOver(s)) // skip past shows!
      .forEach(s => {
        const key = `${s.venue}|${s.city}`;
        const coords = VENUE_COORDS[key] || (s.lat && s.lng ? [s.lat, s.lng] : null);
        if (coords) {
          if (!showGroups[key]) {
            showGroups[key] = {
              venue: s.venue,
              city: s.city,
              state: s.state || "",
              lat: coords[0],
              lng: coords[1],
              type: getShowType(s.info || ''),
              shows: []
            };
          }
          showGroups[key].shows.push({
             date: s.date,
             time: s.time || "",
             playTime: s.playTime || "",
             info: s.info || "",
             allAges: s.allAges,
             mapUrl: s.mapUrl,
             websiteUrl: s.websiteUrl
          });
        }
      });

    const uniqueVenues = Object.values(showGroups);

    const filteredVenues = uniqueVenues.filter(v => {
      if (selectedTypes.size === 0) return true;
      return selectedTypes.has(v.type);
    });

    setMarkerCount(filteredVenues.length);

    filteredVenues.forEach((v) => {
      const cfg = typeConfig[v.type] || typeConfig.full;

      // Determine if a show is currently happening right now (started, but not ended)
      const isHappening = v.shows.some(s => {
        const start = getShowDateTime(undefined, s.date, s.time);
        const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
        const now = new Date();
        return now >= start && now < end;
      });

      const isNext = nextShowVenue && v.venue === nextShowVenue && v.city === nextShowCity;
      const isBouncing = isHappening || isNext;
      const w = isBouncing ? 26 : 20;
      const h = isBouncing ? 34 : 26;

      const firstShow = v.shows[0];
      const directionsUrl = firstShow.mapUrl?.includes('maps.apple.com')
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.venue} ${v.city} ${v.state}`)}`
        : firstShow.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.venue} ${v.city} ${v.state}`)}`;

      const isAllAges = firstShow.allAges === true || firstShow.info?.toLowerCase().includes("all age") || firstShow.info?.toLowerCase().includes("all-age");
      const is21Plus = firstShow.allAges === false || firstShow.info?.toLowerCase().includes("21 &") || firstShow.info?.toLowerCase().includes("21+");
      
      const ageBadge = isAllAges 
        ? `<span style="font-size:10px; font-weight:800; background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.3); padding:2px 6px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:2px; height:18px;">👶 All Ages</span>`
        : is21Plus 
          ? `<span style="font-size:10px; font-weight:800; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); padding:2px 6px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:2px; height:18px;">🔞 21+</span>`
          : '';

      const tooltipShowText = v.shows.length > 1 
        ? `<span style="font-size:12px; font-weight:800; color:${cfg.color};">${firstShow.date} + ${v.shows.length - 1} more show${v.shows.length > 2 ? 's' : ''}</span>`
        : `<span style="font-size:12px; font-weight:800; color:${cfg.color};">${firstShow.date} ${firstShow.time || ""}</span>`;

      const isLightColor = cfg.color === '#f59e0b' || cfg.color === '#eab308' || cfg.color === '#22c55e' || cfg.color === '#06b6d4';
      const textColor = isLightColor ? '#000000' : '#ffffff';
      const showLetter = v.type === 'unplugged' ? 'U' : v.type === 'outdoor' ? 'O' : v.type === 'casino' ? 'C' : v.type === 'tv' ? 'T' : v.type === 'fundraiser' ? 'G' : v.type === 'special' ? 'S' : 'F';

      const icon = L.divIcon({
        className: `custom-venue-marker ${isBouncing ? "next-show-parent" : ""}`,
        html: `<div style="--glow-color: ${cfg.color}" class="${isBouncing ? "next-show-bounce" : ""} relative">
          <svg width="${w}" height="${h}" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 130C50 130 20 95 12 70C4 45 0 30 5 18C10 6 28 0 50 0C72 0 90 6 95 18C100 30 96 45 88 70C80 95 50 130 50 130Z" fill="${cfg.color}" stroke="${isBouncing ? '#fff' : 'rgba(255,255,255,0.3)'}" stroke-width="${isBouncing ? '4' : '2'}"/>
            <text x="50" y="45" dy="0.35em" fill="${textColor}" font-size="40" font-weight="900" text-anchor="middle" font-family="system-ui,sans-serif">${showLetter}</text>
          </svg>
          ${isBouncing ? `<div class="next-show-ring" style="--ring-color: ${cfg.color}"></div>` : ""}
          <div class="marker-label">${v.venue}</div>
          
          <!-- Custom HTML Tooltip (Pure CSS Managed) -->
          <div class="custom-tooltip-card">
            <div style="background:rgba(8, 8, 18, 0.7); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); color:white; padding:12px 16px; width:max-content; min-width:200px; border:1px solid ${cfg.color}aa; font-family:system-ui,sans-serif; border-radius:8px; box-shadow:0 6px 24px rgba(0,0,0,0.6); position:relative; text-align:left;">
              <div style="font-weight:800; font-size:15px; margin-bottom:4px; color:white; line-height:1.2;">${v.venue}</div>
              <div style="font-size:12px; color:rgba(255,255,255,0.6); margin-bottom:8px;">📍 ${v.city}, ${v.state}</div>
              <div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                ${tooltipShowText}
                ${ageBadge}
              </div>
              ${isHappening 
                ? '<div style="font-size:10px; margin-top:6px; margin-bottom:6px; color:#ef4444; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; display:inline-flex; align-items:center; gap:4px;"><span style="width:6px; height:6px; background-color:#ef4444; border-radius:50%; display:inline-block;"></span>🔴 Happening Now</div>'
                : isNext 
                  ? '<div style="font-size:10px; margin-top:6px; margin-bottom:6px; color:#a855f7; font-weight:800; text-transform:uppercase; letter-spacing:1.5px;">⚡ Up Next</div>' 
                  : ""}
              
              <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.12); padding-top:8px; display:flex; flex-direction:column; gap:6px;">
                <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" style="display:inline-flex; align-items:center; justify-content:center; gap:6px; background:${cfg.color}; color:#000000 !important; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; text-decoration:none; padding:7px 12px; border-radius:6px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); transition:opacity 0.2s;">
                  📍 Google Location
                </a>
                <div style="font-size:10px; color:rgba(255,255,255,0.45); margin-top:2px; text-align:center; font-weight:500;">👉 Click pin for details</div>
              </div>
              
              <!-- Arrow border -->
              <div style="position:absolute; top:100%; left:50%; transform:translateX(-50%); width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid ${cfg.color}aa; z-index:1; pointer-events:none;"></div>
              <!-- Arrow fill -->
              <div style="position:absolute; top:100%; left:50%; transform:translateX(-50%) translateY(-1px); width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid rgba(8, 8, 18, 0.7); z-index:2; pointer-events:none;"></div>
            </div>
          </div>
        </div>`,
        iconSize: [w, h],
        iconAnchor: [w / 2, h],
      });

      const marker = L.marker([v.lat, v.lng], { icon, zIndexOffset: isBouncing ? 1000 : 0 }).addTo(map);

      // Store marker reference for Near Me feature
      markersRef.current.push({ marker, venue: v.venue, date: firstShow.date, city: v.city, lat: v.lat, lng: v.lng });

      // Build listing of shows for popup
      const showsListHtml = v.shows.map((s, idx) => {
        const sIsAllAges = s.allAges === true || s.info?.toLowerCase().includes("all age") || s.info?.toLowerCase().includes("all-age");
        const sIs21Plus = s.allAges === false || s.info?.toLowerCase().includes("21 &") || s.info?.toLowerCase().includes("21+");
        const sAgeBadge = sIsAllAges 
          ? `<span style="font-size:9px; font-weight:800; background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.2); padding:1px 4px; border-radius:3px; text-transform:uppercase; margin-left:6px; display:inline-block; vertical-align:middle; line-height:1;">All Ages</span>`
          : sIs21Plus 
            ? `<span style="font-size:9px; font-weight:800; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.2); padding:1px 4px; border-radius:3px; text-transform:uppercase; margin-left:6px; display:inline-block; vertical-align:middle; line-height:1;">21+</span>`
            : '';
        const timeText = s.playTime
          ? `Plays: ${s.playTime}${s.time ? ` (Event: ${s.time})` : ""}`
          : (s.time ? s.time : "");
        return `
          <div style="margin-bottom:8px; padding-bottom:8px; border-bottom: ${idx === v.shows.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.08)'};">
            <div style="font-size:11px; font-weight:700; color:${cfg.color}; text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
              <span>${s.date} ${timeText ? `· ${timeText}` : ""}</span>
              ${sAgeBadge}
            </div>
            ${s.info ? `<div style="font-size:10px; color:rgba(255,255,255,0.7); margin-top:2px;">${s.info}</div>` : ""}
            ${s.websiteUrl ? `
              <div style="margin-top:4px;">
                <a href="${s.websiteUrl}" target="_blank" rel="noopener noreferrer" style="font-size:10px; color:${cfg.color}; text-decoration:underline; font-weight:bold;">
                  Ticket/Event Info →
                </a>
              </div>
            ` : ""}
          </div>
        `;
      }).join('');

      marker.bindPopup(`
        <div style="background:#080812; color:white; padding:14px 16px; min-width:200px; max-height:280px; overflow-y:auto; border:1px solid ${cfg.color}44; font-family:system-ui,sans-serif; border-radius:8px;">
          <div style="font-weight:800; font-size:15px; margin-bottom:3px;">${v.venue}</div>
          <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-bottom:12px;">${v.city}, ${v.state}</div>
          
          <div style="margin-bottom:12px;">
            ${showsListHtml}
          </div>
          
          ${isNext ? '<div style="font-size:9px; margin-bottom:10px; color:#a855f7; font-weight:700; text-transform:uppercase; letter-spacing:2px;">⚡ Up Next</div>' : ""}
          <div style="display:flex; flex-direction:column; gap:8px;">
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; justify-content:center; gap:6px; background:${cfg.color}; color:#000000; font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:1px; text-decoration:none; padding:8px 12px; border-radius:6px; text-align:center; transition:all 0.2s ease; box-shadow:0 2px 8px rgba(0,0,0,0.4);">
              📍 Google Location
            </a>
          </div>
        </div>
      `, { className: "venue-popup", offset: [0, -6], maxWidth: 280, minWidth: 200 });

      // Click-to-scroll: when popup opens, scroll to the show row in the table
      marker.on('popupopen', () => {
        if (onPinClick) onPinClick(v.venue, firstShow.date);
      });

      // Pan map if the hover tooltip card goes outside the map container boundaries
      marker.on('mouseover', () => {
        setTimeout(() => {
          const el = marker.getElement();
          if (!el) return;
          const tooltip = el.querySelector('.custom-tooltip-card') as HTMLElement;
          if (!tooltip) return;
          
          const mapContainer = map.getContainer();
          const mapRect = mapContainer.getBoundingClientRect();
          const tooltipRect = tooltip.getBoundingClientRect();
          
          const padding = 20;
          let panX = 0;
          let panY = 0;
          
          if (tooltipRect.top < mapRect.top) {
            panY = tooltipRect.top - mapRect.top - padding;
          } else if (tooltipRect.bottom > mapRect.bottom) {
            panY = tooltipRect.bottom - mapRect.bottom + padding;
          }
          
          if (tooltipRect.left < mapRect.left) {
            panX = tooltipRect.left - mapRect.left - padding;
          } else if (tooltipRect.right > mapRect.right) {
            panX = tooltipRect.right - mapRect.right + padding;
          }
          
          if (panX !== 0 || panY !== 0) {
            map.panBy([panX, panY], { animate: true, duration: 0.25 });
          }
        }, 80);
      });
    });

    return () => {
      markersRef.current.forEach(m => m.marker.remove());
      markersRef.current = [];
    };
  }, [L, map, shows, nextShowVenue, nextShowCity, onPinClick, selectedTypes]);

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
        className="absolute top-4 right-4 z-[4] flex items-center gap-2 px-4 py-2.5 bg-[rgba(8,8,18,0.92)] backdrop-blur-md border border-white/10 rounded-lg text-sm font-bold uppercase tracking-wider text-white/80 hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/40 transition-all cursor-pointer disabled:opacity-50"
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
        <div className="absolute top-16 right-4 z-[4] px-4 py-2.5 bg-[rgba(8,8,18,0.95)] backdrop-blur-md border border-[var(--color-accent)]/30 rounded-lg text-sm font-semibold text-white animate-[fadeIn_0.3s_ease]">
          📍 {nearMeResult}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[4] px-5 py-4 bg-[rgba(8,8,18,0.92)] backdrop-blur-md border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-3 gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">Show Types</p>
          {selectedTypes.size > 0 && (
            <button
              onClick={() => setSelectedTypes(new Set())}
              className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
          {Object.entries(typeConfig).map(([key, cfg]) => {
            const isSelected = selectedTypes.has(key);
            const isAnySelected = selectedTypes.size > 0;
            const isActive = !isAnySelected || isSelected;

            const isLightColor = cfg.color === '#f59e0b' || cfg.color === '#eab308' || cfg.color === '#22c55e' || cfg.color === '#06b6d4';
            const textColor = isLightColor ? '#000000' : '#ffffff';
            const showLetter = key === 'unplugged' ? 'U' : key === 'outdoor' ? 'O' : key === 'casino' ? 'C' : key === 'tv' ? 'T' : key === 'fundraiser' ? 'G' : key === 'special' ? 'S' : 'F';

            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedTypes(prev => {
                    const next = new Set(prev);
                    if (next.has(key)) {
                      next.delete(key);
                    } else {
                      next.add(key);
                    }
                    return next;
                  });
                }}
                className={`flex items-center gap-2.5 transition-all duration-200 hover:scale-[1.02] cursor-pointer text-left ${
                  isActive ? "opacity-100" : "opacity-35 hover:opacity-60"
                }`}
              >
                <div className="w-5 h-5 rounded-full shrink-0 shadow-[0_0_6px_var(--dot-glow)] flex items-center justify-center font-extrabold text-[10px]" style={{ backgroundColor: cfg.color, color: textColor, '--dot-glow': cfg.color } as any}>
                  {showLetter}
                </div>
                <span className="text-sm font-semibold text-white">{cfg.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Active Markers</span>
          <span className="text-xs font-extrabold text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-2 py-0.5 rounded border border-[var(--color-accent)]/20">
            {markerCount}
          </span>
        </div>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-[#0a0a14]">
          <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <style jsx global>{`
        .custom-venue-marker {
          background: transparent !important;
          border: none !important;
          overflow: visible !important;
        }
        /* Expanded hover area to prevent drop-off and flickering */
        .custom-venue-marker::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 54px; /* Extends from bottom of pin to 20px+ above it, overlapping the tooltip card */
          background: transparent;
          pointer-events: auto;
          z-index: 1;
        }
        /* High z-index on hover to bring the marker and its tooltip to the front */
        .custom-venue-marker:hover {
          z-index: 99999 !important;
        }
        .venue-popup .leaflet-popup-content-wrapper { background: transparent !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; }
        .venue-popup .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .venue-popup .leaflet-popup-tip { background: #080812 !important; }
        .leaflet-container { width: 100%; height: 100%; }
        .leaflet-container a { color: white !important; }
        
        /* Premium Dark-Themed Leaflet Zoom Controls */
        .leaflet-container .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6) !important;
        }
        .leaflet-container a.leaflet-control-zoom-in,
        .leaflet-container a.leaflet-control-zoom-out {
          background-color: rgba(8, 8, 18, 0.9) !important;
          color: rgba(255, 255, 255, 0.8) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          transition: all 0.2s ease !important;
          font-weight: 700 !important;
          width: 30px !important;
          height: 30px !important;
          line-height: 30px !important;
          font-size: 16px !important;
        }
        .leaflet-container a.leaflet-control-zoom-in:hover,
        .leaflet-container a.leaflet-control-zoom-out:hover {
          background-color: var(--color-accent, #851ded) !important;
          color: #ffffff !important;
        }
        .leaflet-container a.leaflet-control-zoom-out {
          border-bottom: none !important;
        }
        
        /* Custom CSS Tooltip Card Styling */
        .custom-tooltip-card {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
          pointer-events: none;
          z-index: 99999;
        }
        .custom-venue-marker:hover .custom-tooltip-card {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(-12px);
          pointer-events: auto;
        }
        /* Invisible bridge to prevent mouseout when moving cursor from pin to tooltip card */
        .custom-tooltip-card::after {
          content: "";
          position: absolute;
          top: 100%;
          left: -40px;
          right: -40px;
          height: 25px; /* Bridges the gap and overlaps the marker pin */
          background: transparent;
          pointer-events: auto;
        }
        
        .marker-label {
          position: absolute;
          top: 102%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(8, 8, 18, 0.82);
          color: rgba(255, 255, 255, 0.85);
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2.5px 6px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          z-index: 10;
          opacity: 1;
          visibility: visible;
          transition: all 0.2s ease;
        }
        .custom-venue-marker:hover .marker-label,
        .next-show-bounce .marker-label {
          opacity: 1;
          visibility: visible;
          background: #080812;
          border-color: var(--glow-color, rgba(255, 255, 255, 0.3));
          color: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
          transform: translateX(-50%) scale(1.05);
          z-index: 20;
        }
        
        /* Blinking pulse ring and bounce for next show */
        .next-show-bounce {
          position: relative;
          animation: nextShowBounce 1.2s ease-in-out infinite;
        }
        @keyframes nextShowBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
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
        .next-show-bounce > svg {
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
