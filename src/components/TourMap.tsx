/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/no-high-complexity-react-function */
/* eslint-disable react-doctor/effect-needs-cleanup */
"use client";

import { useEffect, useRef, useState, useCallback, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

// setOptions() may only be called once, before the first importLibrary() call.
let googleMapsOptionsSet = false;

import { VENUE_COORDS, getVenueCoords, typeConfig, getShowType, getShowDateTime, isShowOver } from "@/lib/tour-helpers";
import SeventhButton from "@/components/SeventhButton";

function formatDateLabel(timestamp: number) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateShort(timestamp: number) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildGCalUrl(show: { venue: string; city: string; state?: string; date: string; time?: string; info?: string }) {
  const start = getShowDateTime(undefined, show.date, show.time);
  if (start.getHours() === 23 && start.getMinutes() === 59) {
    start.setHours(20, 0, 0, 0); // Default to 8:00 PM if no time set
  }
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const formatGCalDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const title = `7th Heaven at ${show.venue}`;
  const details = `Catch 7th Heaven live!\nVenue: ${show.venue}\nDetails: ${show.info || ""}`;
  const location = show.city ? `${show.venue}, ${show.city}${show.state ? `, ${show.state}` : ""}` : show.venue;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCalDate(start)}/${formatGCalDate(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

// SnazzyMaps Style 227862 ("My Custom Map": Royal Purple #3d1b76 & Midnight Water #160533)
// NOTE: this only takes effect on a real Google Map with NO Map ID set — a Map ID
// forces Google's cloud-based styling and silently ignores this JSON style array.
export const SNAZZY_MAPS_227862_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "all", elementType: "all", stylers: [{ visibility: "simplified" }, { saturation: "0" }, { color: "#3d1b76" }] },
  { featureType: "administrative", elementType: "all", stylers: [{ visibility: "simplified" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ visibility: "simplified" }] },
  { featureType: "landscape", elementType: "all", stylers: [{ color: "#3d1b76" }, { visibility: "simplified" }] },
  { featureType: "landscape", elementType: "labels", stylers: [{ visibility: "off" }, { color: "#9479c2" }] },
  { featureType: "landscape.natural", elementType: "all", stylers: [{ visibility: "simplified" }, { color: "#2c1553" }] },
  { featureType: "landscape.natural", elementType: "labels.text", stylers: [{ color: "#a78fd1" }, { visibility: "off" }] },
  { featureType: "landscape.natural", elementType: "labels.text.fill", stylers: [{ color: "#ac94d6" }] },
  { featureType: "landscape.natural.landcover", elementType: "all", stylers: [{ visibility: "simplified" }, { color: "#2c1553" }] },
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "all", stylers: [{ saturation: -100 }, { lightness: 45 }] },
  { featureType: "road", elementType: "geometry", stylers: [{ visibility: "simplified" }, { color: "#3d1b76" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "simplified" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#967fbd" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ visibility: "simplified" }] },
  { featureType: "road.highway", elementType: "all", stylers: [{ visibility: "simplified" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ visibility: "simplified" }, { color: "#6037a5" }] },
  { featureType: "road.highway", elementType: "labels", stylers: [{ visibility: "off" }, { color: "#917bb6" }] },
  { featureType: "road.highway", elementType: "labels.text", stylers: [{ color: "#2c1c48" }, { visibility: "simplified" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#2e1b4e" }, { visibility: "simplified" }] },
  { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ visibility: "simplified" }, { hue: "#5f00ff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#4d317c" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#4f3280" }] },
  { featureType: "road.arterial", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "all", stylers: [{ color: "#3d1b76" }, { visibility: "on" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#160533" }] },
  { featureType: "water", elementType: "labels", stylers: [{ visibility: "simplified" }, { color: "#3d1b76" }] }
];

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
  parkingInfo?: string;
  parkingUrl?: string;
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

interface MarkerHandle {
  overlay: google.maps.OverlayView;
  infoWindow: google.maps.InfoWindow;
  venue: string;
  date: string;
  city: string;
  lat: number;
  lng: number;
}

interface TourMapProps {
  shows?: ShowData[];
  nextShowVenue?: string;
  nextShowCity?: string;
  onPinClick?: (venue: string, date: string) => void;
}

export interface DeviceZoomSettings {
  initial: number;
  active: number;
}

export interface MapZoomConfig {
  mobile: DeviceZoomSettings;
  tablet: DeviceZoomSettings;
  desktop: DeviceZoomSettings;
}

export const DEFAULT_ZOOM_CONFIG: MapZoomConfig = {
  mobile: { initial: 10, active: 10 },
  tablet: { initial: 9, active: 10 },
  desktop: { initial: 9, active: 10 },
};

export const ZOOM_CONFIG_STORAGE_KEY = "7h_map_zoom_config_v2";

function getInitialZoomConfig(): MapZoomConfig {
  if (typeof window === "undefined") return DEFAULT_ZOOM_CONFIG;
  try {
    const saved = localStorage.getItem(ZOOM_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.mobile?.initial && parsed?.tablet?.initial && parsed?.desktop?.initial) {
        return parsed;
      }
    }
  } catch {
    // fallback to default config
  }
  return DEFAULT_ZOOM_CONFIG;
}

export default function TourMap({ shows, nextShowVenue, nextShowCity, onPinClick }: TourMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<MarkerHandle[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [markerCount, setMarkerCount] = useState(0);
  const [legendOpen, setLegendOpen] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loadProgress, setLoadProgress] = useState(25);

  // ── Date Range Zoom & Filter state ──
  const [dateRange, setDateRange] = useState<[number, number] | null>(null);
  const [isDateUiOpen, setIsDateUiOpen] = useState(false);
  const [isShowTypesUiOpen, setIsShowTypesUiOpen] = useState(false);

  // ── Zoom Settings & Persistence State ──
  const [zoomConfig, setZoomConfig] = useState<MapZoomConfig>(getInitialZoomConfig);
  const [isZoomUiOpen, setIsZoomUiOpen] = useState(false);
  const [zoomSaveSuccess, setZoomSaveSuccess] = useState(false);
  const emptySubscribe = useCallback(() => () => { }, []);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const zoomConfigRef = useRef(zoomConfig);
  useEffect(() => {
    zoomConfigRef.current = zoomConfig;
  }, [zoomConfig]);

  const handleSaveZoomConfig = useCallback((newConfig: MapZoomConfig, liveZoomVal?: number) => {
    setZoomConfig(newConfig);
    try {
      localStorage.setItem(ZOOM_CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
      setZoomSaveSuccess(true);
      setTimeout(() => setZoomSaveSuccess(false), 2000);
    } catch {
      // ignore
    }

    if (mapInstanceRef.current && typeof window !== "undefined") {
      const w = window.innerWidth;
      const dev = w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
      mapInstanceRef.current.setZoom(liveZoomVal ?? newConfig[dev].initial);
    }
  }, []);

  const handleResetZoomConfig = useCallback(() => {
    handleSaveZoomConfig(DEFAULT_ZOOM_CONFIG);
  }, [handleSaveZoomConfig]);

  const { minShowTime, maxShowTime } = useMemo(() => {
    if (!shows || shows.length === 0) {
      const now = Date.now();
      return { minShowTime: now, maxShowTime: now + 180 * 24 * 60 * 60 * 1000 };
    }
    const timestamps = shows
      .reduce<number[]>((acc, s) => {
        const t = getShowDateTime(s.startDate, s.date, s.time).getTime();
        if (t > 0) acc.push(t);
        return acc;
      }, [])
      .sort((a, b) => a - b);

    if (timestamps.length === 0) {
      const now = Date.now();
      return { minShowTime: now, maxShowTime: now + 180 * 24 * 60 * 60 * 1000 };
    }

    return {
      minShowTime: timestamps[0],
      maxShowTime: timestamps[timestamps.length - 1],
    };
  }, [shows]);

  const activeStart = dateRange ? dateRange[0] : minShowTime;
  const activeEnd = dateRange ? dateRange[1] : maxShowTime;
  const isDateFiltered = dateRange !== null && (dateRange[0] > minShowTime || dateRange[1] < maxShowTime);

  // ── Directional Map Gradient Customizer states ──
  const [mapGradTop, setMapGradTop] = useState(true);
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

  // Load the Google Maps API once the browser is idle (or after a short fallback delay)
  // rather than the instant this component mounts. TourMap already mounts lazily via
  // <LazySection>, but that trigger fires as soon as the section is within 100px of the
  // viewport — on mobile that's essentially immediately below the hero, so the ~400KB / 9
  // sequential Maps SDK script requests were kicking off in the same window as the hero
  // video/poster and stealing bandwidth + fetch priority from it. Lighthouse's simulated
  // mobile run showed this clearly: observed (real) LCP was 4.1s, but the throttled lab
  // estimate ballooned to ~12s because of this contention. Deferring to idle keeps tiles
  // Defer loading Google Maps API until the tour map element approaches viewport threshold.
  // This prevents maps.googleapis.com (main.js + util.js ~153KB) from loading on initial page render,
  // Load the Google Maps API eagerly on component mount so the map is fully ready on page load.
  useEffect(() => {
    let active = true;

    if (typeof window !== "undefined" && typeof (window as any).google?.maps?.Map === "function") {
      setLoadProgress(70);
      setGoogleReady(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapLoadError("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
      console.warn("[TourMap] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set — the tour map can't load.");
      return;
    }

    if (!googleMapsOptionsSet && typeof window !== "undefined" && !(window as any).__googleMapsOptionsSet) {
      try {
        setOptions({ key: apiKey, v: "weekly" });
      } catch { }
      googleMapsOptionsSet = true;
      (window as any).__googleMapsOptionsSet = true;
    }

    setLoadProgress(45);
    importLibrary("maps")
      .then((mapsLib) => {
        if (!active) return;
        setLoadProgress(80);
        if (typeof (window as any).google?.maps?.Map === "function" || (mapsLib && (mapsLib as any).Map)) {
          setGoogleReady(true);
        } else {
          setTimeout(() => {
            if (active) setGoogleReady(true);
          }, 50);
        }
      })
      .catch((e: unknown) => {
        console.warn("[TourMap] Failed to load Google Maps:", e);
        if (active) setMapLoadError("Failed to load Google Maps");
      });

    return () => {
      active = false;
    };
  }, []);

  // Initialize the Google Map once the API script is ready using requestAnimationFrame to prevent forced reflows.
  useEffect(() => {
    if (!googleReady || !mapRef.current || mapInstanceRef.current) return;

    const container = mapRef.current;
    let rafId: number;
    let tilesListener: google.maps.MapsEventListener | null = null;

    rafId = requestAnimationFrame(() => {
      if (!container || mapInstanceRef.current) return;

      const MapClass = (window as any).google?.maps?.Map;
      if (!MapClass || typeof MapClass !== "function") {
        setGoogleReady(false);
        setTimeout(() => setGoogleReady(true), 50);
        return;
      }

      const screenW = typeof window !== "undefined" ? window.innerWidth : 1200;
      const deviceKey = screenW < 768 ? "mobile" : screenW < 1024 ? "tablet" : "desktop";
      const initialZoom = zoomConfigRef.current[deviceKey]?.initial ?? DEFAULT_ZOOM_CONFIG[deviceKey].initial;

      const mapInstance = new MapClass(container, {
        center: { lat: 42.0, lng: -88.0 },
        zoom: initialZoom,
        backgroundColor: "transparent",
        styles: SNAZZY_MAPS_227862_STYLE,
        disableDefaultUI: true,
        zoomControl: false,
        scrollwheel: false,
        gestureHandling: "greedy",
        clickableIcons: false,
        keyboardShortcuts: false,
      });

      setLoadProgress(90);

      const finishLoading = () => {
        setLoadProgress(100);
        setIsLoaded(true);
      };

      const fallbackTimer = setTimeout(finishLoading, 800);

      if ((window as any).google?.maps?.event) {
        tilesListener = (window as any).google.maps.event.addListenerOnce(mapInstance, "tilesloaded", () => {
          clearTimeout(fallbackTimer);
          finishLoading();
          if (typeof window !== "undefined") {
            (window as any).__7hMapLoaded = true;
            window.dispatchEvent(new CustomEvent("7h-map-ready"));
          }
        });
      }

      setMap(mapInstance);
      mapInstanceRef.current = mapInstance;
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (mapInstanceRef.current) {
        if (tilesListener && (window as any).google?.maps?.event) {
          (window as any).google.maps.event.removeListener(tilesListener);
        }
        if ((window as any).google?.maps?.event) {
          (window as any).google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        }
        mapInstanceRef.current = null;
        setMap(null);
      }
    };
  }, [googleReady]);

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
      parkingInfo?: string;
      parkingUrl?: string;
    }[];
  }

  // Draw and Update Markers
  useEffect(() => {
    if (!googleReady || !map) return () => { };

    for (const m of markersRef.current) {
      m.overlay.setMap(null);
      m.infoWindow.close();
    }
    markersRef.current = [];

    // Custom HTML marker overlay — Google's AdvancedMarkerElement requires a Map ID,
    // which would break the JSON `styles` array above, so we draw our own pin + hover
    // tooltip as a plain positioned <div> the same way the old Leaflet divIcon did.
    class VenueMarkerOverlay extends google.maps.OverlayView {
      private position: google.maps.LatLng;
      private html: string;
      private tooltipHtml: string;
      private onClickCb: () => void;
      div: HTMLDivElement | null = null;
      private initialZIndex: number;

      constructor(position: google.maps.LatLng, html: string, tooltipHtml: string, onClickCb: () => void, initialZIndex: number = 1) {
        super();
        this.position = position;
        this.html = html;
        this.tooltipHtml = tooltipHtml;
        this.onClickCb = onClickCb;
        this.initialZIndex = initialZIndex;
      }

      onAdd() {
        const div = document.createElement("div");
        div.className = "custom-venue-marker";
        div.style.position = "absolute";
        div.style.transform = "translate(-50%, -100%)";
        const baseZIndex = this.html.includes("next-show-bounce") ? 9999 : this.initialZIndex;
        div.style.zIndex = String(baseZIndex);

        const doc = new DOMParser().parseFromString(this.html, "text/html");
        Array.from(doc.body.childNodes).forEach((node) => {
          div.appendChild(document.importNode(node, true));
        });

        let demoteTimer: ReturnType<typeof setTimeout> | null = null;

        div.addEventListener("mouseenter", () => {
          if (demoteTimer) {
            clearTimeout(demoteTimer);
            demoteTimer = null;
          }
          div.style.zIndex = "9999999";
          if (this.tooltipHtml && !div.querySelector(".custom-tooltip-card")) {
            const tDoc = new DOMParser().parseFromString(this.tooltipHtml, "text/html");
            const relContainer = div.querySelector(".relative") || div;
            Array.from(tDoc.body.childNodes).forEach((node) => {
              relContainer.appendChild(document.importNode(node, true));
            });
          }
        });

        div.addEventListener("mouseleave", (e: MouseEvent) => {
          if (e.relatedTarget && div.contains(e.relatedTarget as Node)) {
            return;
          }

          if (demoteTimer) clearTimeout(demoteTimer);
          demoteTimer = setTimeout(() => {
            if (!div.matches(":hover") && !div.querySelector(".custom-tooltip-card:hover")) {
              div.style.zIndex = String(baseZIndex);
              const card = div.querySelector(".custom-tooltip-card");
              if (card && card.parentNode) {
                card.parentNode.removeChild(card);
              }
            }
          }, 180);
        });

        div.addEventListener("click", (e) => {
          const target = e.target as HTMLElement;
          if (target.closest("a")) return; // let "Google Location" link through
          e.stopPropagation();
          this.onClickCb();
        });
        google.maps.OverlayView.preventMapHitsAndGesturesFrom(div);
        this.div = div;
        this.getPanes()?.overlayMouseTarget.appendChild(div);
      }

      draw() {
        if (!this.div) {
          this.onAdd();
        }
        if (!this.div) return;
        const panes = this.getPanes();
        if (panes?.overlayMouseTarget && !this.div.parentNode) {
          panes.overlayMouseTarget.appendChild(this.div);
        }
        const projection = this.getProjection();
        if (!projection) return;
        const point = projection.fromLatLngToDivPixel(this.position);
        if (point) {
          this.div.style.left = `${point.x}px`;
          this.div.style.top = `${point.y}px`;
        }
      }

      onRemove() {
        if (this.div?.parentNode) this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }

    const showGroups: Record<string, GroupedVenue> = {};

    (shows || []).forEach(s => {
      if (!s.city) return;
      const key = `${s.venue}|${s.city}`;
      const coords = getVenueCoords(s.venue, s.city, s.lat, s.lng);
      if (coords) {
        if (!showGroups[key]) {
          showGroups[key] = {
            venue: s.venue,
            city: s.city,
            state: s.state || "",
            lat: coords[0],
            lng: coords[1],
            type: getShowType(s),
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
          websiteUrl: s.websiteUrl,
          parkingInfo: s.parkingInfo || "",
          parkingUrl: s.parkingUrl || ""
        });
      }
    });

    const uniqueVenues = Object.values(showGroups);

    const filteredVenues = uniqueVenues.reduce<typeof uniqueVenues>((acc, v) => {
      if (selectedTypes.size > 0 && !selectedTypes.has(v.type)) return acc;
      const matchingShows = v.shows.filter((s) => {
        if (!isDateFiltered) return true;
        const t = getShowDateTime(undefined, s.date, s.time).getTime();
        if (t === 0) return true;
        return t >= activeStart && t <= activeEnd;
      });
      if (matchingShows.length > 0) {
        acc.push({ ...v, shows: matchingShows });
      }
      return acc;
    }, []);

    const normStr = (str: string) => str.replace(/['’`\\]/g, '').toLowerCase().trim();
    const targetVenueName = nextShowVenue ? normStr(nextShowVenue) : undefined;
    const targetCityName = nextShowCity ? normStr(nextShowCity) : undefined;
    const now = new Date();
    const venueNextShowMap = new Map<string, number>();
    filteredVenues.forEach(v => {
      let minTime = Infinity;
      v.shows.forEach(s => {
        const t = getShowDateTime(undefined, s.date, s.time).getTime();
        if (t >= now.getTime() && t < minTime) minTime = t;
      });
      venueNextShowMap.set(`${normStr(v.venue)}|${normStr(v.city)}`, minTime);
    });

    const isMatch = (str: string, target: string) => str === target || str.startsWith(target) || target.startsWith(str);
    const activeVenue = filteredVenues.find(v => {
      const vName = normStr(v.venue);
      const vCity = normStr(v.city);
      if (targetVenueName && isMatch(vName, targetVenueName)) {
        if (!targetCityName || isMatch(vCity, targetCityName)) {
          return true;
        }
      }
      const key = `${vName}|${vCity}`;
      return (venueNextShowMap.get(key) ?? Infinity) !== Infinity;
    }) || filteredVenues[0];

    filteredVenues.forEach((v) => {
      const cfg = typeConfig[v.type] || typeConfig.full;

      // Determine if a show is currently happening right now (started, but not ended)
      const isHappening = v.shows.some(s => {
        const start = getShowDateTime(undefined, s.date, s.time);
        const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
        return now >= start && now < end;
      });

      const isNext = activeVenue
        ? normStr(v.venue) === normStr(activeVenue.venue) && normStr(v.city) === normStr(activeVenue.city)
        : false;

      const isBouncing = isHappening || isNext;
      const screenW = typeof window !== "undefined" ? window.innerWidth : 1200;
      const isMobilePin = screenW < 640;
      const isTabletPin = screenW >= 640 && screenW < 1024;
      const w = isMobilePin ? (isBouncing ? 22 : 16) : isTabletPin ? (isBouncing ? 28 : 20) : (isBouncing ? 42 : 30);
      const h = isMobilePin ? (isBouncing ? 29 : 21) : isTabletPin ? (isBouncing ? 36 : 26) : (isBouncing ? 54 : 39);

      const firstShow = v.shows[0];
      const hasExplicitMap = Boolean(firstShow?.mapUrl || (firstShow as Record<string, any>)?.directionsLink);
      const hasExplicitParking = Boolean(firstShow.parkingUrl || firstShow.parkingInfo);

      const rawDirectionsUrl = firstShow.mapUrl?.includes('maps.apple.com')
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.venue} ${v.city} ${v.state}`)}`
        : firstShow.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${v.venue} ${v.city} ${v.state}`)}`;

      const directionsHtml = hasExplicitMap
        ? `<a href="${rawDirectionsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; justify-content:center; gap:6px; background:${cfg.color}; color:#000000 !important; font-weight:800; font-size:11px; text-transform:; letter-spacing:0.5px; text-decoration:none; padding:7px 12px; border-radius:6px; text-align:center; box-shadow:0 3px 9px #00000033; transition:opacity 0.2s;">📍 Google Location</a>`
        : `<span style="display:inline-flex; align-items:center; justify-content:center; gap:6px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.2) !important; font-weight:800; font-size:11px; text-transform:; letter-spacing:0.5px; padding:7px 12px; border-radius:6px; text-align:center; opacity:0.25; pointer-events:none;">📍 No Map Link</span>`;

      const rawParkingUrl = firstShow.parkingUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`parking near ${v.venue} ${v.city} ${v.state}`)}`;

      const parkingHtml = hasExplicitParking
        ? `<a href="${rawParkingUrl}" target="_blank" rel="noopener noreferrer" style="flex:1; display:inline-flex; align-items:center; justify-content:center; gap:4px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18); color:#ffffff !important; font-weight:700; font-size:10px; text-transform:; letter-spacing:0.5px; text-decoration:none; padding:6px 6px; border-radius:6px; text-align:center; white-space:nowrap;">🅿️ Parking</a>`
        : `<span style="flex:1; display:inline-flex; align-items:center; justify-content:center; gap:4px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); color:rgba(255,255,255,0.2) !important; font-weight:700; font-size:10px; text-transform:; letter-spacing:0.5px; padding:6px 6px; border-radius:6px; text-align:center; white-space:nowrap; opacity:0.25; pointer-events:none;">🅿️ Parking</span>`;

      const gcalUrl = buildGCalUrl({ venue: v.venue, city: v.city, state: v.state, date: firstShow.date, time: firstShow.time, info: firstShow.info });

      const isAllAges = firstShow.allAges === true || firstShow.info?.toLowerCase().includes("all age") || firstShow.info?.toLowerCase().includes("all-age");
      const is21Plus = firstShow.allAges === false || firstShow.info?.toLowerCase().includes("21 &") || firstShow.info?.toLowerCase().includes("21+");

      const ageBadge = isAllAges
        ? `<span style="font-size:10px; font-weight:800; background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.3); padding:2px 6px; border-radius:4px; text-transform:; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:2px; height:18px;">👶 All Ages</span>`
        : is21Plus
          ? `<span style="font-size:10px; font-weight:800; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); padding:2px 6px; border-radius:4px; text-transform:; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:2px; height:18px;">🔞 21+</span>`
          : '';

      const tooltipShowText = v.shows.length > 1
        ? `<span style="font-size:12px; font-weight:800; color:${cfg.color};">${firstShow.date} + ${v.shows.length - 1} more show${v.shows.length > 2 ? 's' : ''}</span>`
        : `<span style="font-size:12px; font-weight:800; color:${cfg.color};">${firstShow.date} ${firstShow.time || ""}</span>`;

      const isLightColor = cfg.color === '#9333ea' || cfg.color === '#eab308' || cfg.color === '#22c55e' || cfg.color === '#06b6d4';
      const textColor = isLightColor ? '#000000' : '#ffffff';
      const showLetter = cfg.initial || 'F';

      const pinHtml = `<div class="custom-venue-marker-inner ${isBouncing ? "is-bouncing-marker" : ""}">
        <div class="${isBouncing ? "next-show-bounce" : ""} relative flex flex-col items-center">
          <svg class="${isBouncing ? "map-pin-jump" : ""}" width="${w}" height="${h}" viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: ${isBouncing ? `drop-shadow(0 4px 10px rgba(0,0,0,0.8)) drop-shadow(0 0 16px ${cfg.color})` : 'drop-shadow(0 3px 6px rgba(0,0,0,0.7))'};">
            <path d="M50 130C50 130 20 95 12 70C4 45 0 30 5 18C10 6 28 0 50 0C72 0 90 6 95 18C100 30 96 45 88 70C80 95 50 130 50 130Z" fill="${cfg.color}" style="fill: ${cfg.color} !important;" stroke="#ffffff" stroke-width="5"/>
            <text x="50" y="48" dy="0.35em" fill="#ffffff" style="fill: #ffffff !important;" font-size="44" font-weight="900" text-anchor="middle" font-family="system-ui, sans-serif">${showLetter}</text>
          </svg>
          <div class="marker-label ${isBouncing ? "active-show-label" : ""}">${isBouncing ? "⚡ UP NEXT: " : ""}${v.venue}</div>
        </div>
      </div>`;

      const tooltipCardHtml = `<div class="custom-tooltip-card">
        <div style="background:rgba(8, 8, 18, 0.96); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); color:white; padding:12px 16px; width:max-content; min-width:230px; border:1px solid ${cfg.color}aa; font-family:system-ui,sans-serif; border-radius:8px; box-shadow:0 3px 9px #00000033; position:relative; text-align:left;">
          <div style="font-weight:800; font-size:15px; margin-bottom:4px; color:white; line-height:1.2;">${v.venue}</div>
          <div style="font-size:12px; color:rgba(255,255,255,0.6); margin-bottom:8px;">📍 ${v.city}, ${v.state}</div>
          <div style="display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            ${tooltipShowText}
            ${ageBadge}
          </div>
          ${firstShow.parkingInfo ? `<div style="font-size:10px; color:#38bdf8; margin-bottom:6px; font-weight:700; display:flex; align-items:center; gap:4px;">🅿️ ${firstShow.parkingInfo}</div>` : ''}
          ${isHappening
          ? '<div style="font-size:10px; margin-top:6px; margin-bottom:6px; color:#ef4444; font-weight:800; text-transform:; letter-spacing:1.5px; display:inline-flex; align-items:center; gap:4px;"><span style="width:6px; height:6px; background-color:#ef4444; border-radius:50%; display:inline-block;"></span>🔴 Happening Now</div>'
          : isNext
            ? '<div style="font-size:10px; margin-top:6px; margin-bottom:6px; color:#a855f7; font-weight:800; text-transform:; letter-spacing:1.5px;">⚡ Up Next</div>'
            : ""}

          <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.12); padding-top:8px; display:flex; flex-direction:column; gap:6px;">
            ${directionsHtml}
            <div style="display:flex; gap:6px;">
              <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" style="flex:1; display:inline-flex; align-items:center; justify-content:center; gap:4px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18); color:#ffffff !important; font-weight:700; font-size:10px; text-transform:; letter-spacing:0.5px; text-decoration:none; padding:6px 6px; border-radius:6px; text-align:center; white-space:nowrap;">
                📅 Add to Cal
              </a>
              ${parkingHtml}
            </div>
            <div style="font-size:10px; color:rgba(255,255,255,0.45); margin-top:2px; text-align:center; font-weight:500;">👉 Click pin for details</div>
          </div>

          <!-- Arrow border -->
          <div style="position:absolute; top:100%; left:50%; transform:translateX(-50%); width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid ${cfg.color}aa; z-index:1; pointer-events:none;"></div>
          <!-- Arrow fill -->
          <div style="position:absolute; top:100%; left:50%; transform:translateX(-50%) translateY(-1px); width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid rgba(8, 8, 18, 0.96); z-index:2; pointer-events:none;"></div>
        </div>
      </div>`;

      // Build listing of shows for popup
      const showsListHtml = v.shows.map((s, idx) => {
        const sIsAllAges = s.allAges === true || s.info?.toLowerCase().includes("all age") || s.info?.toLowerCase().includes("all-age");
        const sIs21Plus = s.allAges === false || s.info?.toLowerCase().includes("21 &") || s.info?.toLowerCase().includes("21+");
        const sAgeBadge = sIsAllAges
          ? `<span style="font-size:9px; font-weight:800; background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.2); padding:1px 4px; border-radius:3px; text-transform:; margin-left:6px; display:inline-block; vertical-align:middle; line-height:1;">All Ages</span>`
          : sIs21Plus
            ? `<span style="font-size:9px; font-weight:800; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.2); padding:1px 4px; border-radius:3px; text-transform:; margin-left:6px; display:inline-block; vertical-align:middle; line-height:1;">21+</span>`
            : '';
        const timeText = s.playTime
          ? `Plays: ${s.playTime}${s.time ? ` (Event: ${s.time})` : ""}`
          : (s.time ? s.time : "");
        return `
          <div style="margin-bottom:8px; padding-bottom:8px; border-bottom: ${idx === v.shows.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.08)'};">
            <div style="font-size:11px; font-weight:700; color:${cfg.color}; text-transform:; letter-spacing:0.5px; display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
              <span>${s.date} ${timeText ? `· ${timeText}` : ""}</span>
              ${sAgeBadge}
            </div>
            ${s.info ? `<div style="font-size:10px; color:rgba(255,255,255,0.7); margin-top:2px;">${s.info}</div>` : ""}
            ${s.parkingInfo ? `<div style="font-size:10px; color:#38bdf8; margin-top:3px; font-weight:600;">🅿️ Parking: ${s.parkingInfo}</div>` : ""}
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

      const popupHtml = `
        <div style="background:#080812; color:white; padding:14px 16px; min-width:230px; max-width:290px; max-height:300px; overflow-y:auto; border:1px solid ${cfg.color}44; font-family:system-ui,sans-serif; border-radius:8px;">
          <div style="font-weight:800; font-size:15px; margin-bottom:3px;">${v.venue}</div>
          <div style="font-size:11px; color:rgba(255,255,255,0.5); margin-bottom:12px;">${v.city}, ${v.state}</div>

          <div style="margin-bottom:12px;">
            ${showsListHtml}
          </div>

          ${isNext ? '<div style="font-size:9px; margin-bottom:10px; color:#a855f7; font-weight:700; text-transform:; letter-spacing:2px;">⚡ Up Next</div>' : ""}
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${directionsHtml}
            <div style="display:flex; gap:6px;">
              <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" style="flex:1; display:inline-flex; align-items:center; justify-content:center; gap:4px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18); color:#ffffff; font-weight:700; font-size:10px; text-transform:; letter-spacing:0.5px; text-decoration:none; padding:7px 8px; border-radius:6px; text-align:center; white-space:nowrap;">
                📅 Add to Cal
              </a>
              ${parkingHtml}
            </div>
          </div>
        </div>
      `;

      const position = new google.maps.LatLng(v.lat, v.lng);

      const infoWindow = new google.maps.InfoWindow({
        disableAutoPan: false,
        headerDisabled: true,
      });

      const overlay = new VenueMarkerOverlay(position, pinHtml, tooltipCardHtml, () => {
        // Close any other open popups before opening this one
        markersRef.current.forEach(m => { if (m.infoWindow !== infoWindow) m.infoWindow.close(); });
        infoWindow.setContent(popupHtml);
        infoWindow.setPosition(position);
        infoWindow.open({ map });
        onPinClickRef.current?.(v.venue, firstShow.date);
      }, isBouncing ? 1000 : 1);
      overlay.setMap(map);
      overlay.setMap(map);

      markersRef.current.push({ overlay, infoWindow, venue: v.venue, date: firstShow.date, city: v.city, lat: v.lat, lng: v.lng });
    });

    const screenW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const isMobile = screenW < 768;
    const isTablet = screenW >= 768 && screenW < 1024;
    const deviceKey = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";
    const activeZoom = zoomConfig[deviceKey]?.active ?? DEFAULT_ZOOM_CONFIG[deviceKey].active;

    // Center directly on the current show location as the main center point of the map
    if (activeVenue && typeof activeVenue.lat === "number" && typeof activeVenue.lng === "number") {
      map.setCenter({ lat: activeVenue.lat, lng: activeVenue.lng });
      map.setZoom(activeZoom);
    } else if (filteredVenues.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredVenues.forEach(v => bounds.extend({ lat: v.lat, lng: v.lng }));
      map.fitBounds(bounds, isMobile ? { top: 40, right: 20, bottom: 40, left: 20 } : isTablet ? { top: 60, right: 40, bottom: 60, left: 40 } : { top: 80, right: 60, bottom: 80, left: 60 });
    }

    return () => {
      for (const m of markersRef.current) {
        m.overlay.setMap(null);
        m.infoWindow.close();
      }
      markersRef.current = [];
    };
  }, [googleReady, map, shows, nextShowVenue, nextShowCity, selectedTypes, activeStart, activeEnd, isDateFiltered, zoomConfig]);

  // Near Me handler
  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Find closest venue from current markers
        let closest: MarkerHandle | null = null;
        let minDist = Infinity;

        markersRef.current.forEach((m) => {
          const d = distanceMiles(userLat, userLng, m.lat, m.lng);
          if (d < minDist) {
            minDist = d;
            closest = m;
          }
        });

        if (closest && mapInstanceRef.current) {
          const c = closest as MarkerHandle;
          mapInstanceRef.current.panTo({ lat: c.lat, lng: c.lng });
          mapInstanceRef.current.setZoom(12);
          setTimeout(() => {
            markersRef.current.forEach(m => { if (m !== c) m.infoWindow.close(); });
            c.infoWindow.setPosition({ lat: c.lat, lng: c.lng });
            c.infoWindow.open({ map: mapInstanceRef.current! });
            onPinClick?.(c.venue, c.date);
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
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() ?? 12) + 1);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom((mapInstanceRef.current.getZoom() ?? 12) - 1);
    }
  }, []);

  return (
    <div className="relative z-10 w-full h-[400px] sm:h-[600px] lg:h-[900px] pb-px" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', border: 'none', outline: 'none' }}>
      <div
        ref={mapRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-out map-masked-tiles ${isLoaded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />

      {/* ── Google Maps Preloader Intro Animation Overlay ── */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center transition-all duration-300 ease-out ${!isLoaded ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-105 pointer-events-none"}`}
      >
        {/* Radial Purple Glow Background */}
        <div className="absolute inset-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-5 select-none">
          {/* Google Pin & Pulsing Radar Ring */}
          <div className="relative flex items-center justify-center w-20 h-20">
            {/* Outer expanding ping ring */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <div className="absolute -inset-2.5 rounded-full border border-purple-400/25 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />

            {/* Google 4-Color Glowing Orbiting Dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3.5s' }}>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#4285F4] shadow-[0_0_10px_#4285F4]" />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#EA4335] shadow-[0_0_10px_#EA4335]" />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#FBBC05] shadow-[0_0_10px_#FBBC05]" />
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#34A853] shadow-[0_0_10px_#34A853]" />
            </div>

            {/* Center Bouncing Google Maps Pin Icon */}
            <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-900 border border-purple-400/50 shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-bounce">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>

          {/* Intro Text */}
          <div className="flex flex-col items-center gap-1.5 text-center px-4">
            <span className="font-mono text-xs  st text-purple-300 font-bold animate-pulse">
              Initializing Google Maps
            </span>
            <span className="text-[11px] text-white/50 font-semibold">
              7th Heaven Live Tour Locations
            </span>
          </div>

          {/* Animated 4-Color Google Shimmer Progress Bar */}
          <div className="w-56 h-1.5 rounded-full bg-white/10 overflow-hidden relative p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(66,133,244,0.7)]"
              style={{ width: `${isLoaded ? 100 : loadProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Map Overlay Controls aligned precisely to .site-container ── */}
      <div className={`absolute inset-x-0 bottom-[16px] sm:bottom-[36px] z-[10] transition-opacity duration-300 ease-out ${isLoaded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="site-container flex items-end justify-between gap-2 sm:gap-4">
          {/* Left Map Controls: Show Types & Date Range Zoom */}
          <div className="pointer-events-auto flex items-end gap-2 sm:gap-3 flex-wrap max-w-[calc(100%-60px)] sm:max-w-[calc(100%-100px)] lg:max-w-none">
            {/* Legend / Show Types - Always Visible Box on Desktop, Hidden on Mobile/Tablet */}
            <div className="hidden lg:block bg-[#0c0621]/95 border border-purple-500/40 rounded-2xl p-3 sm:p-4.5 backdrop-blur-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-left select-none max-w-full">
              <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3.5 pb-1.5 sm:pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-base sm:text-lg shrink-0">
                    🎭
                  </div>
                  <div className="flex flex-col">
                    <span className="text-purple-300   text-[11px] sm:text-xs md:text-sm">
                      SHOW TYPES
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-white/50">Filter map markers by category</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {selectedTypes.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTypes(new Set())}
                      className="text-[10px] sm:text-[11px] font-bold text-purple-300 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30"
                    >
                      CLEAR
                    </button>
                  )}
                  <span className="text-[10px] sm:text-[11px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                    {markerCount}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:gap-x-3 sm:gap-y-2">
                {Object.entries(typeConfig).map(([key, cfg]) => {
                  const isSelected = selectedTypes.has(key);
                  const isAnySelected = selectedTypes.size > 0;
                  const isActive = !isAnySelected || isSelected;
                  const isLightColor = cfg.color === '#9333ea' || cfg.color === '#eab308' || cfg.color === '#22c55e' || cfg.color === '#06b6d4';
                  const textColor = isLightColor ? '#000000' : '#ffffff';
                  const showLetter = key === 'unplugged' ? 'U' : key === 'outdoor' ? 'O' : key === 'casino' ? 'C' : key === 'tv' ? 'T' : key === 'fundraiser' ? 'G' : key === 'special' ? 'S' : 'F';
                  return (
                    <button
                      type="button"
                      aria-label={`Filter ${cfg.label}`}
                      key={key}
                      onClick={() => {
                        setSelectedTypes(prev => {
                          const next = new Set(prev);
                          if (next.has(key)) { next.delete(key); } else { next.add(key); }
                          return next;
                        });
                      }}
                      className={`flex items-center gap-1.5 sm:gap-2 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer text-left ${isActive ? "bg-white/5 border-white/15 opacity-100 hover:border-purple-400/60 hover:bg-purple-900/20" : "bg-transparent border-transparent opacity-40 hover:opacity-80"}`}
                    >
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shrink-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold shadow-sm" style={{ backgroundColor: cfg.color, color: textColor }}>
                        {showLetter}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold /90   truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Responsive Control Buttons: Side-by-Side on Desktop/Tablet, Stacked on Mobile when needed */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end flex-wrap">
              {/* Mobile/Tablet Show Types Button */}
              <SeventhButton
                onClick={() => setIsShowTypesUiOpen(true)}
                title="Filter map markers by category"
                className="lg:hidden !text-[11px] sm:!text-xs md:!text-sm !font-bold flex">
                <span className='relative pr-1'>🎭</span><span> SHOW TYPES</span>
                {selectedTypes.size > 0 && (
                  <span className="ml-1 text-[10px] bg-purple-600 px-2 py-0.5 rounded-full border border-purple-400/50">
                    ({selectedTypes.size})
                  </span>
                )}
              </SeventhButton>

              <SeventhButton
                onClick={() => setIsDateUiOpen(true)}
                title="Zoom in on dates & filter show markers"
                className="!text-[11px] sm:!text-xs md:!text-sm !font-bold flex">
                <span className='relative pr-1'>📅</span>{isDateFiltered ? `${formatDateShort(activeStart)} – ${formatDateShort(activeEnd)}` : "DATE RANGE ZOOM"}
                {isDateFiltered && (
                  <span className="ml-1 text-[10px] bg-purple-600 px-2 py-0.5 rounded-full border border-purple-400/50">
                    ({markerCount})
                  </span>
                )}
              </SeventhButton>

              <SeventhButton
                onClick={() => setIsZoomUiOpen(true)}
                title="Configure & Save Map Zoom Levels per Device"
                className="!text-[11px] sm:!text-xs md:!text-sm !font-bold flex">
                <span className='relative pr-1'>⚙️</span><span> ZOOM SETTINGS</span>
              </SeventhButton>
            </div>
          </div>

          {/* Right Map Controls: Custom Big Zoom Controls (+ / -) */}
          <div className="pointer-events-auto flex flex-col gap-2 shrink-0">
            <button onClick={handleZoomIn}
              type="button"
              aria-label="Zoom In"
              title="Zoom In"
              className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center border border-white/10 hover:border-white/40 rounded-full /90 hover:text-white   transition-colors cursor-pointer active:scale-95 select-none bg-gradient-to-l from-[#581ed0] to-[#8b5cf6] bg-[position:100%] bg-[size:200%_100%]">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button onClick={handleZoomOut}
              type="button"
              aria-label="Zoom Out"
              title="Zoom Out"
              className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center border border-white/10 hover:border-white/40 rounded-full /90 hover:text-white   cursor-pointer active:scale-95 select-none bg-gradient-to-l from-[#581ed0] to-[#8b5cf6] bg-[position:100%] bg-[size:200%_100%]">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mapLoadError && (
        <div className="absolute inset-0 z-[2] flex items-center justify-center bg-purple-950/80 backdrop-blur-md">
          <div className="text-center px-6">
            <p className="font-semibold mb-1">Map couldn't load</p>
            <p>{mapLoadError === "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" ? "Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local" : "Check your Google Maps API key and quota."}</p>
          </div>
        </div>
      )}

      {/* ── Date Range Zoom Small Module Dialog ── */}
      {mounted && isDateUiOpen && createPortal(
        <div
          onClick={() => setIsDateUiOpen(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-end animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[360px] max-w-[90vw] max-h-[85vh] overflow-y-auto bg-[#0c0621]/95 backdrop-blur-[18px] border border-purple-500/40 p-4.5 sm:p-5 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col gap-4 select-none text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                  📅
                </div>
                <div className="flex flex-col">
                  <span className="text-purple-300   text-xs sm:text-sm">DATE RANGE ZOOM</span>
                  <span className="text-[10px] sm:text-xs text-white/50">Filter map markers by timeframe</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDateUiOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                ✕
              </button>
            </div>

            {/* Dual Date Sliders */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-white/70">
                  <span>START DATE (FROM)</span>
                  <span className="text-purple-300">{formatDateShort(activeStart)}</span>
                </div>
                <input
                  type="range"
                  min={minShowTime}
                  max={maxShowTime}
                  step={86400000}
                  value={activeStart}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDateRange([val, Math.max(val + 86400000, activeEnd)]);
                  }}
                  className="w-full accent-purple-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-white/70">
                  <span>END DATE (TO)</span>
                  <span className="text-purple-300">{formatDateShort(activeEnd)}</span>
                </div>
                <input
                  type="range"
                  min={minShowTime}
                  max={maxShowTime}
                  step={86400000}
                  value={activeEnd}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setDateRange([activeStart, Math.max(val, activeStart + 86400000)]);
                  }}
                  className="w-full accent-purple-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-white/50 block">QUICK PRESETS</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const now = Date.now();
                    const target = now + 30 * 24 * 60 * 60 * 1000;
                    setDateRange([now, Math.min(target, maxShowTime)]);
                  }}
                  className="px-2 py-2 text-[10px] sm:text-[11px] font-bold rounded-xl border border-white/15 bg-white/5 hover:bg-purple-600/20 hover:border-purple-400 transition-all text-center cursor-pointer">
                  NEXT 30 DAYS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = Date.now();
                    const target = now + 90 * 24 * 60 * 60 * 1000;
                    setDateRange([now, Math.min(target, maxShowTime)]);
                  }}
                  className="px-2 py-2 text-[10px] sm:text-[11px] font-bold rounded-xl border border-white/15 bg-white/5 hover:bg-purple-600/20 hover:border-purple-400 transition-all text-center cursor-pointer">
                  NEXT 90 DAYS
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange([minShowTime, maxShowTime])}
                  className="px-2 py-2 text-[10px] sm:text-[11px] font-bold rounded-xl border border-white/15 bg-white/5 hover:bg-purple-600/20 hover:border-purple-400 transition-all text-center cursor-pointer">
                  ALL DATES
                </button>
              </div>
            </div>

            {/* Remove / Reset Filter Button */}
            {isDateFiltered ? (
              <button
                type="button"
                onClick={() => setDateRange(null)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-[11px] font-bold transition-all rounded-xl shadow-lg shadow-purple-600/30 cursor-pointer flex items-center justify-center gap-1.5">
                <span>✕ REMOVE DATE FILTER</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsDateUiOpen(false)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-[11px] font-bold rounded-xl transition-colors cursor-pointer text-center">
                CLOSE CONTROLS
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ── Zoom Settings Small Module Dialog ── */}
      {mounted && isZoomUiOpen && createPortal(
        <div
          onClick={() => setIsZoomUiOpen(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-end animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[360px] max-w-[90vw] max-h-[85vh] overflow-y-auto bg-[#0c0621]/95 backdrop-blur-[18px] border border-purple-500/40 p-4.5 sm:p-5 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col gap-4 select-none text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                  ⚙️
                </div>
                <div className="flex flex-col">
                  <span className="text-purple-300   text-xs sm:text-sm">MAP ZOOM SETTINGS</span>
                  <span className="text-[10px] sm:text-xs text-white/50">Customize zoom levels per device</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomUiOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Settings Grid for Mobile, Tablet, Desktop */}
            <div className="space-y-3">
              {(["mobile", "tablet", "desktop"] as const).map((device) => {
                const isCurrentDevice = typeof window !== "undefined" && (
                  (device === "mobile" && window.innerWidth < 768) ||
                  (device === "tablet" && window.innerWidth >= 768 && window.innerWidth < 1024) ||
                  (device === "desktop" && window.innerWidth >= 1024)
                );

                const icon = device === "mobile" ? "📱" : device === "tablet" ? "📱" : "💻";
                const label = device === "mobile" ? "MOBILE (<768PX)" : device === "tablet" ? "TABLET (768PX–1023PX)" : "DESKTOP (≥1024PX)";
                const cfg = zoomConfig[device];

                return (
                  <div
                    key={device}
                    className={`p-3 rounded-xl border transition-all ${isCurrentDevice ? "bg-[#160a36] border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-[#130d2d]/80 border-white/10"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2   text-[11px] text-purple-300">
                        <span>{icon}</span>
                        <span className="">{label}</span>
                      </div>
                      {isCurrentDevice && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-600">
                          ACTIVE SCREEN
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                      {/* Initial Map Zoom Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center   font-semibold">
                          <span>Initial:</span>
                          <span className="font-mono font-bold text-purple-300 text-xs">{cfg.initial}</span>
                        </div>
                        <input
                          type="range"
                          min={4}
                          max={18}
                          step={0.5}
                          value={cfg.initial}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            handleSaveZoomConfig(
                              {
                                ...zoomConfig,
                                [device]: { ...cfg, initial: val },
                              },
                              val
                            );
                          }}
                          className="w-full accent-purple-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Venue Focus Zoom Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center   font-semibold">
                          <span>Focus:</span>
                          <span className="font-mono font-bold text-purple-300 text-xs">{cfg.active}</span>
                        </div>
                        <input
                          type="range"
                          min={4}
                          max={18}
                          step={0.5}
                          value={cfg.active}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            handleSaveZoomConfig(
                              {
                                ...zoomConfig,
                                [device]: { ...cfg, active: val },
                              },
                              val
                            );
                          }}
                          className="w-full accent-purple-500 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleResetZoomConfig}
                className="px-3 py-2 text-[11px] font-bold   hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors cursor-pointer"
              >
                RESET DEFAULTS
              </button>

              <div className="flex items-center gap-2">
                {zoomSaveSuccess && (
                  <span className="text-[11px] text-green-400 font-bold flex items-center gap-1">
                    ✓ Saved!
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsZoomUiOpen(false)}
                  className="px-4 py-2 text-[11px] font-black bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  DONE
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Show Types Category Filter Small Module Dialog ── */}
      {mounted && isShowTypesUiOpen && createPortal(
        <div
          onClick={() => setIsShowTypesUiOpen(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-end animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[360px] max-w-[90vw] max-h-[85vh] overflow-y-auto bg-[#0c0621]/95 backdrop-blur-[18px] border border-purple-500/40 p-4.5 sm:p-5 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col gap-4 select-none text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0">
                  🎭
                </div>
                <div className="flex flex-col">
                  <span className="text-purple-300   text-xs">
                    SHOW TYPES
                  </span>
                  <span className="text-[10px] text-white/50">Filter map markers by category</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedTypes.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTypes(new Set())}
                    className="text-[11px] font-bold text-purple-300 hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30"
                  >
                    CLEAR
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsShowTypesUiOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => {
                const isSelected = selectedTypes.has(key);
                const isAnySelected = selectedTypes.size > 0;
                const isActive = !isAnySelected || isSelected;
                const isLightColor = cfg.color === '#9333ea' || cfg.color === '#eab308' || cfg.color === '#22c55e' || cfg.color === '#06b6d4';
                const textColor = isLightColor ? '#000000' : '#ffffff';
                const showLetter = key === 'unplugged' ? 'U' : key === 'outdoor' ? 'O' : key === 'casino' ? 'C' : key === 'tv' ? 'T' : key === 'fundraiser' ? 'G' : key === 'special' ? 'S' : 'F';
                return (
                  <button
                    type="button"
                    aria-label={`Filter ${cfg.label}`}
                    key={key}
                    onClick={() => {
                      setSelectedTypes(prev => {
                        const next = new Set(prev);
                        if (next.has(key)) { next.delete(key); } else { next.add(key); }
                        return next;
                      });
                    }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all cursor-pointer text-left ${isActive ? "bg-white/5 border-white/15 opacity-100 hover:border-purple-400/60 hover:bg-purple-900/20" : "bg-transparent border-transparent opacity-40 hover:opacity-80"}`}
                  >
                    <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold shadow-sm" style={{ backgroundColor: cfg.color, color: textColor }}>
                      {showLetter}
                    </div>
                    <span className="text-xs font-bold /90   truncate">{cfg.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <SeventhButton
                onClick={() => setIsShowTypesUiOpen(false)}
                className="!text-xs !py-1.5 !px-4"
              >
                DONE
              </SeventhButton>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
