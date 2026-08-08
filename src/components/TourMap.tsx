/* eslint-disable react-doctor/no-giant-component */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
// IMPORT LEAFLET CSS - CRITICAL for correct tile rendering
import "leaflet/dist/leaflet.css";

import { VENUE_COORDS, typeConfig, getShowType, getShowDateTime, isShowOver } from "@/lib/tour-helpers";

// Haversine distance in miles
function distanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type { ShowData };
interface ShowData {
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

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0, 0, 0, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
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
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [markerCount, setMarkerCount] = useState(0);
  const [legendOpen, setLegendOpen] = useState(false);
  const [L, setL] = useState<any>(null);
  const [map, setMap] = useState<any>(null);

  // ── Directional Map Gradient Customizer states ──
  const [mapGradTop, setMapGradTop] = useState(false);
  const [mapGradBottom, setMapGradBottom] = useState(true);
  const [mapGradLeft, setMapGradLeft] = useState(false);
  const [mapGradRight, setMapGradRight] = useState(false);

  const [mapGradSize, setMapGradSize] = useState(23); // %
  const [mapGradOpacity, setMapGradOpacity] = useState(0.691); // 0..1 → *0.75 = 0.518
  const [mapGradMidstop, setMapGradMidstop] = useState(35); // %
  const [mapGradColor, setMapGradColor] = useState("#000000");
  const [isMapGradUiOpen, setIsMapGradUiOpen] = useState(false);
  const [mapGradCopied, setMapGradCopied] = useState(false);

  useEffect(() => {
    const savedTop = localStorage.getItem("7h_map_grad_top");
    const savedBottom = localStorage.getItem("7h_map_grad_bottom");
    const savedLeft = localStorage.getItem("7h_map_grad_left");
    const savedRight = localStorage.getItem("7h_map_grad_right");
    const savedSize = localStorage.getItem("7h_map_grad_size");
    const savedOpacity = localStorage.getItem("7h_map_grad_opacity");
    const savedMidstop = localStorage.getItem("7h_map_grad_midstop");
    const savedColor = localStorage.getItem("7h_map_grad_color");

    if (savedTop !== null) setMapGradTop(savedTop === "true");
    if (savedBottom !== null) setMapGradBottom(savedBottom === "true");
    if (savedLeft !== null) setMapGradLeft(savedLeft === "true");
    if (savedRight !== null) setMapGradRight(savedRight === "true");
    if (savedSize) setMapGradSize(parseFloat(savedSize));
    if (savedOpacity) setMapGradOpacity(parseFloat(savedOpacity));
    if (savedMidstop) setMapGradMidstop(parseFloat(savedMidstop));
    if (savedColor) setMapGradColor(savedColor);
  }, []);

  const toggleTop = (v: boolean) => { setMapGradTop(v); localStorage.setItem("7h_map_grad_top", v.toString()); };
  const toggleBottom = (v: boolean) => { setMapGradBottom(v); localStorage.setItem("7h_map_grad_bottom", v.toString()); };
  const toggleLeft = (v: boolean) => { setMapGradLeft(v); localStorage.setItem("7h_map_grad_left", v.toString()); };
  const toggleRight = (v: boolean) => { setMapGradRight(v); localStorage.setItem("7h_map_grad_right", v.toString()); };

  const updateSize = (s: number) => { setMapGradSize(s); localStorage.setItem("7h_map_grad_size", s.toString()); };
  const updateOpacity = (o: number) => { setMapGradOpacity(o); localStorage.setItem("7h_map_grad_opacity", o.toString()); };
  const updateMidstop = (m: number) => { setMapGradMidstop(m); localStorage.setItem("7h_map_grad_midstop", m.toString()); };
  const updateColor = (c: string) => { setMapGradColor(c); localStorage.setItem("7h_map_grad_color", c); };

  const selectPresetMode = (mode: "all" | "tb" | "lr" | "top" | "bottom" | "left" | "right" | "none") => {
    switch (mode) {
      case "all":
        toggleTop(true); toggleBottom(true); toggleLeft(true); toggleRight(true);
        break;
      case "tb":
        toggleTop(true); toggleBottom(true); toggleLeft(false); toggleRight(false);
        break;
      case "lr":
        toggleTop(false); toggleBottom(false); toggleLeft(true); toggleRight(true);
        break;
      case "top":
        toggleTop(true); toggleBottom(false); toggleLeft(false); toggleRight(false);
        break;
      case "bottom":
        toggleTop(false); toggleBottom(true); toggleLeft(false); toggleRight(false);
        break;
      case "left":
        toggleTop(false); toggleBottom(false); toggleLeft(true); toggleRight(false);
        break;
      case "right":
        toggleTop(false); toggleBottom(false); toggleLeft(false); toggleRight(true);
        break;
      case "none":
        toggleTop(false); toggleBottom(false); toggleLeft(false); toggleRight(false);
        break;
    }
  };

  const copyMapGradCSS = () => {
    let cssLines = [];
    if (mapGradTop) cssLines.push(`/* Top */ background: linear-gradient(to bottom, ${mapGradColor} 0%, rgba(0,0,0,${mapGradOpacity * 0.7}) ${mapGradMidstop}%, transparent 100%); height: ${mapGradSize}%;`);
    if (mapGradBottom) cssLines.push(`/* Bottom */ background: linear-gradient(to top, ${mapGradColor} 0%, rgba(0,0,0,${mapGradOpacity * 0.7}) ${mapGradMidstop}%, transparent 100%); height: ${mapGradSize}%;`);
    if (mapGradLeft) cssLines.push(`/* Left */ background: linear-gradient(to right, ${mapGradColor} 0%, rgba(0,0,0,${mapGradOpacity * 0.7}) ${mapGradMidstop}%, transparent 100%); width: ${mapGradSize}%;`);
    if (mapGradRight) cssLines.push(`/* Right */ background: linear-gradient(to left, ${mapGradColor} 0%, rgba(0,0,0,${mapGradOpacity * 0.7}) ${mapGradMidstop}%, transparent 100%); width: ${mapGradSize}%;`);

    navigator.clipboard.writeText(cssLines.join("\n"));
    setMapGradCopied(true);
    setTimeout(() => setMapGradCopied(false), 2000);
  };

  // Preconnect to tile CDN for faster loading.
  // Guards against Strict Mode double-mount: existence check prevents duplicate <link>,
  // and link.remove() is a safe no-op on already-detached nodes (unlike removeChild which throws).
  useEffect(() => {
    const PRECONNECT_HREF = "https://a.basemaps.cartocdn.com";
    if (document.head.querySelector(`link[href="${PRECONNECT_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = PRECONNECT_HREF;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    return () => { link.remove(); }; // safe no-op if already detached
  }, []);

  useEffect(() => {
    let active = true;
    const loadLeaflet = async () => {
      try {
        const module = await import("leaflet");
        if (active) setL(module);
      } catch (e) {
        console.warn("Failed to load Leaflet:", e);
      }
    };
    loadLeaflet();
    return () => { active = false; };
  }, []);

  // Initialize Leaflet Map once L is loaded
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    // Fix Next.js default icon issues
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    // Center on Chicagoland — most shows are in the IL suburbs
    const mapInstance = L.map(mapRef.current, {
      center: [42.0, -88.0],
      zoom: 12,
      zoomSnap: 0.1,
      zoomDelta: 0.1,
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

    // Close tooltips when clicked
    mapInstance.on('tooltipopen', (e: any) => {
      const tooltip = e.tooltip;
      const container = tooltip.getElement();
      if (container) {
        container.style.pointerEvents = 'auto';
        container.style.cursor = 'pointer';
        container.onclick = () => {
          mapInstance.closeTooltip(tooltip);
        };
      }
    });

    // Close popups when clicked (unless clicking a link)
    mapInstance.on('popupopen', (e: any) => {
      const popup = e.popup;
      const source = popup?._source;
      if (onPinClickRef.current && source?.options?.venueName) {
        onPinClickRef.current(source.options.venueName, source.options.showDate);
      }

      const container = popup.getElement();
      if (container) {
        container.style.cursor = 'pointer';
        container.onclick = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (target.closest('a')) return; // Allow clicking links
          mapInstance.closePopup(popup);
        };
      }
    });

    setMap(mapInstance);
    mapInstanceRef.current = mapInstance;

    // Force a resize check to fix broken tiles on initial load
    const timerId = setTimeout(() => mapInstance.invalidateSize(), 500);

    return () => {
      clearTimeout(timerId);
      mapInstance.off();
      mapInstance.remove();
      mapInstanceRef.current = null;
      setMap(null);
    };
  }, [L]);

  const onPinClickRef = useRef(onPinClick);
  useEffect(() => {
    onPinClickRef.current = onPinClick;
  }, [onPinClick]);

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

  // Draw and Update Markers
  useEffect(() => {
    if (!L || !map) return () => { };

    for (const m of markersRef.current) {
      m.marker.off();
      m.marker.remove();
    }
    markersRef.current = [];

    const showGroups: Record<string, GroupedVenue> = {};

    (shows || []).forEach(s => {
      if (!s.city || isShowOver(s)) return;
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

      const isLightColor = cfg.color === '#9333ea' || cfg.color === '#eab308' || cfg.color === '#22c55e' || cfg.color === '#06b6d4';
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

      const marker = L.marker([v.lat, v.lng], { icon, zIndexOffset: isBouncing ? 1000 : 0, venueName: v.venue, showDate: firstShow.date } as any).addTo(map);

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

    });

    // Center map on active show and zoom in +1 level as default
    if (filteredVenues.length > 0 && map) {
      // Find active or up next venue (fallback to first venue)
      const activeVenue = filteredVenues.find(v =>
        (nextShowVenue && v.venue === nextShowVenue && v.city === nextShowCity) ||
        v.shows.some(s => {
          const start = getShowDateTime(undefined, s.date, s.time);
          const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
          const now = new Date();
          return now >= start && now < end;
        })
      ) || filteredVenues[0];

      const bounds = L.latLngBounds(filteredVenues.map(v => [v.lat, v.lng]));
      map.fitBounds(bounds, {
        paddingTopLeft: [60, 80],
        paddingBottomRight: [60, 80],
        maxZoom: 14,
        animate: false
      });

      if (activeVenue) {
        const defaultZoom = Math.min(15, map.getZoom() + 1);
        map.setView([activeVenue.lat, activeVenue.lng], defaultZoom, { animate: true });
      }
    }

    return () => {
      for (const m of markersRef.current) {
        m.marker.off();
        m.marker.remove();
      }
      markersRef.current = [];
    };
  }, [L, map, shows, nextShowVenue, nextShowCity, selectedTypes]);

  // Near Me handler
  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) return;

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
        }
      },
      () => { },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, [onPinClick]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn(1);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut(1);
    }
  }, []);

  return (
    <div className="relative w-full aspect-[3/1] overflow-hidden   pb-px" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', border: 'none', outline: 'none', minHeight: '350px' }}>
      <div ref={mapRef} className="absolute inset-0 w-full h-full z-[1] snazzy-map-227862" />

      {/* ── Directional Dark Edge Gradient Overlays ── */}
      {mapGradTop && (
        <div
          className="absolute top-0 left-0 right-0 z-[2] pointer-events-none"
          style={{
            height: `${mapGradSize}%`,
            background: `linear-gradient(to bottom, ${mapGradColor} 0%, ${hexToRgba(mapGradColor, mapGradOpacity * 0.75)} ${mapGradMidstop}%, transparent 100%)`,
          }}
        />
      )}
      {mapGradBottom && (
        <div
          className="absolute bottom-0 left-0 right-0 z-[2] pointer-events-none"
          style={{
            height: `${mapGradSize}%`,
            background: `linear-gradient(to top, ${mapGradColor} 0%, ${hexToRgba(mapGradColor, mapGradOpacity * 0.75)} ${mapGradMidstop}%, transparent 100%)`,
          }}
        />
      )}
      {mapGradLeft && (
        <div
          className="absolute top-0 bottom-0 left-0 z-[2] pointer-events-none"
          style={{
            width: `${mapGradSize}%`,
            background: `linear-gradient(to right, ${mapGradColor} 0%, ${hexToRgba(mapGradColor, mapGradOpacity * 0.75)} ${mapGradMidstop}%, transparent 100%)`,
          }}
        />
      )}
      {mapGradRight && (
        <div
          className="absolute top-0 bottom-0 right-0 z-[2] pointer-events-none"
          style={{
            width: `${mapGradSize}%`,
            background: `linear-gradient(to left, ${mapGradColor} 0%, ${hexToRgba(mapGradColor, mapGradOpacity * 0.75)} ${mapGradMidstop}%, transparent 100%)`,
          }}
        />
      )}

      {/* ── Map Gradient UI Control Button + Drawer ── */}
      <div className="absolute top-4 left-8 z-[5] flex flex-col items-start gap-2">
        {!isMapGradUiOpen ? (
          <button aria-label="Action button"
            onClick={() => setIsMapGradUiOpen(true)}
            className="flex items-center gap-2 px-7 md:px-8 py-2.5 bg-[rgba(8,8,18,0.92)] backdrop-blur-md border border-white/10 hover:border-[var(--color-accent)]/40 rounded-lg text-[16px] font-bold uppercase tracking-wider text-white/80 hover: text-[var(--color-accent)] transition-colors cursor-pointer"
            title="Configure Map Directional Black Gradient"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 animate-pulse" />
            <span>Map Gradient UI</span>
          </button>
        ) : (
          <div className="w-[310px] bg-[rgba(8,8,18,0.95)] backdrop-blur-2xl border border-white/15 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col gap-3.5 select-none text-left text-white z-50">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex flex-col">
                <span className="font-bold text-xs uppercase tracking-wider  text-[var(--color-accent)]">
                  Map Gradient Controls
                </span>
                <span className="text-[9px] text-white/50 uppercase font-semibold">
                  Custom Edge Darkening
                </span>
              </div>
              <button aria-label="Action button"
                onClick={() => setIsMapGradUiOpen(false)}
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Direction Presets */}
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-white/50 uppercase tracking-wider block">Direction Presets</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: "all", label: "All Sides" },
                  { id: "tb", label: "Top & Btm" },
                  { id: "lr", label: "Left & Rgt" },
                  { id: "none", label: "None" },
                ].map((p) => (
                  <button aria-label="Action button"
                    key={p.id}
                    onClick={() => selectPresetMode(p.id as any)}
                    className="px-1.5 py-1 text-[8.5px] font-extrabold uppercase tracking-wider rounded border border-white/10 bg-white/5 hover:bg-purple-600/30 hover:border-purple-400 text-white/80 transition-colors text-center truncate cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Direction Toggles */}
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-white/50 uppercase tracking-wider block">Active Sides</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "Top ⬆️", state: mapGradTop, setter: toggleTop },
                  { label: "Bottom ⬇️", state: mapGradBottom, setter: toggleBottom },
                  { label: "Left ⬅️", state: mapGradLeft, setter: toggleLeft },
                  { label: "Right ➡️", state: mapGradRight, setter: toggleRight },
                ].map((d) => (
                  <button aria-label="Action button"
                    key={d.label}
                    onClick={() => d.setter(!d.state)}
                    className={`px-1 py-1.5 text-[8.5px] font-black uppercase rounded-lg border transition-colors cursor-pointer ${d.state
                      ? "bg-purple-600/40 border-purple-400 text-white shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                      }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size / Depth Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider">
                <span>Gradient Depth / Size</span>
                <span className=" text-[var(--color-accent)] font-mono font-black">{mapGradSize}%</span>
              </div>
              <input aria-label="Input field"
                type="range"
                min="5"
                max="60"
                step="1"
                value={mapGradSize}
                onChange={(e) => updateSize(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider">
                <span>Edge Black Opacity</span>
                <span className=" text-[var(--color-accent)] font-mono font-black">{Math.round(mapGradOpacity * 100)}%</span>
              </div>
              <input aria-label="Input field"
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={mapGradOpacity}
                onChange={(e) => updateOpacity(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Midstop Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider">
                <span>Fade Midpoint Stop</span>
                <span className=" text-[var(--color-accent)] font-mono font-black">{mapGradMidstop}%</span>
              </div>
              <input aria-label="Input field"
                type="range"
                min="0"
                max="80"
                step="1"
                value={mapGradMidstop}
                onChange={(e) => updateMidstop(parseFloat(e.target.value))}
                className="w-full accent-purple-500 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Color Selector */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-white/60 uppercase tracking-wider">
                <span>Gradient Color</span>
                <span className=" text-[var(--color-accent)] font-mono font-bold text-[9px]">{mapGradColor}</span>
              </div>
              <div className="flex items-center gap-2">
                {["#000000", "#000000", "#090314", "#0f051d", "#020617"].map((c) => (
                  <button aria-label="Action button"
                    key={c}
                    onClick={() => updateColor(c)}
                    className="w-5 h-5 rounded-full border transition-transform cursor-pointer"
                    style={{
                      backgroundColor: c,
                      borderColor: mapGradColor === c ? '#a855f7' : 'rgba(255,255,255,0.2)',
                      transform: mapGradColor === c ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
                <div className="relative w-5 h-5 rounded-full border border-white/30 overflow-hidden cursor-pointer bg-purple-600/30 flex items-center justify-center">
                  <input aria-label="Input field"
                    type="color"
                    value={mapGradColor}
                    onChange={(e) => updateColor(e.target.value)}
                    className="absolute -inset-2 w-[200%] h-[200%] cursor-pointer opacity-0"
                  />
                  <span className="text-[10px] font-bold text-white">+</span>
                </div>
              </div>
            </div>

            {/* Copy CSS Button */}
            <button aria-label="Action button"
              onClick={copyMapGradCSS}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-[10px] uppercase tracking-widest transition-colors shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {mapGradCopied ? "✓ Copied Map Gradient CSS!" : "Copy Map Gradient CSS"}
            </button>
          </div>
        )}
      </div>


      {/* Legend */}
      <div className="group absolute bottom-4 left-8 z-[4] bg-[rgba(8,8,18,0.92)] backdrop-blur-md border border-white/10 hover:border-[var(--color-accent)]/40 rounded-lg overflow-hidden transition-colors duration-300">
        {/* Header - always visible, click to toggle */}
        <button aria-label="Action button"
          onClick={() => setLegendOpen(o => !o)}
          className="flex items-center justify-between gap-3 px-7 md:px-8 py-2.5 w-full cursor-pointer hover:bg-white/5 text-white/80 hover: text-[var(--color-accent)] transition-colors"
        >
          <span className="text-[16px] font-bold uppercase tracking-wider transition-colors">Show Types</span>
          <svg className={`w-3.5 h-3.5 transition-colors duration-300 ${legendOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {/* Expandable content */}
        {legendOpen && (
          <div className="px-3 pb-2.5">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-2">
              {Object.entries(typeConfig).map(([key, cfg]) => {
                const isSelected = selectedTypes.has(key);
                const isAnySelected = selectedTypes.size > 0;
                const isActive = !isAnySelected || isSelected;
                const isLightColor = cfg.color === '#9333ea' || cfg.color === '#eab308' || cfg.color === '#22c55e' || cfg.color === '#06b6d4';
                const textColor = isLightColor ? '#000000' : '#ffffff';
                const showLetter = key === 'unplugged' ? 'U' : key === 'outdoor' ? 'O' : key === 'casino' ? 'C' : key === 'tv' ? 'T' : key === 'fundraiser' ? 'G' : key === 'special' ? 'S' : 'F';
                return (
                  <button aria-label="Next"
                    key={key}
                    onClick={() => {
                      setSelectedTypes(prev => {
                        const next = new Set(prev);
                        if (next.has(key)) { next.delete(key); } else { next.add(key); }
                        return next;
                      });
                    }}
                    className={`flex items-center gap-1.5 transition-colors duration-200 cursor-pointer text-left ${isActive ? "opacity-100" : "opacity-35 hover:opacity-60"
                      }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center font-extrabold text-[var(--font-size-4xs)]" style={{ backgroundColor: cfg.color, color: textColor }}>
                      {showLetter}
                    </div>
                    <span className="text-[var(--font-size-3xs)] font-semibold text-white/80">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
              <span className="text-[var(--font-size-4xs)] font-bold uppercase tracking-wider text-white/40">Active</span>
              <div className="flex items-center gap-2">
                {selectedTypes.size > 0 && (
                  <button aria-label="Action button" onClick={() => setSelectedTypes(new Set())} className="text-[var(--font-size-4xs)] font-bold uppercase tracking-wider  text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer">Clear</button>
                )}
                <span className="text-[var(--font-size-4xs)] font-extrabold  text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1.5 py-0.5 rounded border border-[var(--color-accent)]/20">{markerCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Custom Big Zoom Controls (+ / -) ── */}
      <div className="absolute bottom-4 right-8 z-[4] flex flex-col gap-2">
        <button onClick={handleZoomIn}
          type="button"
          aria-label="Zoom In"
          title="Zoom In"
          className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-[rgba(8,8,18,0.92)] backdrop-blur-md border border-white/10 hover:border-[var(--color-accent)]/40 rounded-lg text-white/90 hover: text-[var(--color-accent)] transition-colors cursor-pointer active:scale-95 select-none"
        >
          <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button onClick={handleZoomOut}
          type="button"
          aria-label="Zoom Out"
          title="Zoom Out"
          className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-[rgba(8,8,18,0.92)] backdrop-blur-md border border-white/10 hover:border-[var(--color-accent)]/40 rounded-lg text-white/90 hover: text-[var(--color-accent)] transition-colors cursor-pointer active:scale-95 select-none"
        >
          <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-black">
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
        .leaflet-container { width: 100%; height: 100%; border: none !important; outline: none !important; }
        .leaflet-container a { color: white !important; }
        .leaflet-tile { border: none !important; outline: none !important; }
        .leaflet-tile-pane { border: none !important; outline: none !important; }
        
        /* Premium Dark-Themed Leaflet Zoom Controls */
        .leaflet-container .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 10px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(133,29,237,0.2) !important;
          margin: 14px !important;
          backdrop-filter: blur(12px) !important;
        }
        .leaflet-container a.leaflet-control-zoom-in,
        .leaflet-container a.leaflet-control-zoom-out {
          background-color: rgba(8, 8, 18, 0.92) !important;
          color: rgba(255, 255, 255, 0.9) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
          transition: all 0.18s ease !important;
          font-weight: 700 !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .leaflet-container a.leaflet-control-zoom-in:hover,
        .leaflet-container a.leaflet-control-zoom-out:hover {
          background-color: var(--color-accent, #851ded) !important;
          color: #ffffff !important;
          transform: scale(1.08) !important;
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
        /* ── SnazzyMaps Style 227862 (Deep Dark Theme without Grid Seams) ── */
        .snazzy-map-227862 .leaflet-tile-pane {
          filter: brightness(95%) contrast(105%);
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
        
        /* Pulse ring and subtle smooth glow for next show */
        .next-show-bounce {
          position: relative;
          animation: nextShowGlow 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        @keyframes nextShowGlow {
          0%, 100% { transform: translateY(0); filter: brightness(1); }
          50% { transform: translateY(-4px); filter: brightness(1.2); }
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
