"use client";
/* eslint-disable react-doctor/no-initialize-state */

import React, {
  useEffect,
  useState,
  useRef,
  useSyncExternalStore,
} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";

// Fix Leaflet default icon paths (prevents missing marker issues)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Map rendering error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[400px] w-full flex-col items-center justify-center gap-3 border border-white/10 bg-[var(--color-bg-card)]/60">
          <p>Map reloading...</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="cursor-pointer rounded border-none bg-purple-600 px-3 py-1.5 hover:bg-purple-500"
          >
            Reset Map
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MapResizeTrigger({ isVisible }: { isVisible: boolean }) {
  const map = useMap();
  useEffect(() => {
    const triggerResize = () => {
      map.invalidateSize();
    };
    triggerResize();
    const t1 = setTimeout(triggerResize, 100);
    const t2 = setTimeout(triggerResize, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isVisible, map]);
  return null;
}

// Map locations to coordinates
const getCoordinates = (city: string): [number, number] => {
  const coords: Record<string, [number, number]> = {
    "Chicago, IL": [41.8781, -87.6298],
    "Nashville, TN": [36.1627, -86.7816],
    "Los Angeles, CA": [34.0522, -118.2437],
    "Dallas, TX": [32.7767, -96.797],
  };
  return coords[city] || [39.8283, -98.5795]; // Default to US center
};

const getColor = (city: string) => {
  const colors: Record<string, string> = {
    "Chicago, IL": "#059669", // Emerald
    "Nashville, TN": "#7c3aed", // Amber
    "Los Angeles, CA": "#7c3aed", // Purple
    "Dallas, TX": "#2563eb", // Blue
  };
  return colors[city] || "#ec4899"; // Pink default
};

export default function AdminMap({
  locations,
  isVisible = true,
}: {
  locations: any[];
  isVisible?: boolean;
}) {
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [mapKey] = useState("admin-map-instance");
  const containerRef = useRef<HTMLDivElement>(null);

  if (!ready)
    return (
      <div className="h-full min-h-[180px] w-full animate-pulse bg-slate-100" />
    );

  return (
    <MapErrorBoundary>
      <div
        ref={containerRef}
        className="relative h-full min-h-[180px] w-full overflow-hidden"
      >
        <MapContainer
          key={mapKey}
          center={[39.8283, -98.5795]}
          zoom={3}
          style={{
            height: "100%",
            width: "100%",
            minHeight: "180px",
            background: "#f8fafc",
          }}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={true}
          doubleClickZoom={false}
        >
          <MapResizeTrigger isVisible={isVisible} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {locations &&
            locations.map((loc) => {
              const coords = getCoordinates(loc.city);
              const color = getColor(loc.city);
              const radius = Math.max(8, loc.percentage / 1.5);

              return (
                <CircleMarker
                  key={loc.city}
                  center={coords}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    opacity={1}
                    className="custom-tooltip"
                  >
                    <div>
                      <p className="m-0">{loc.city}</p>
                      <p className="m-0 text-black/70">
                        {loc.percentage}% of Traffic
                      </p>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>
    </MapErrorBoundary>
  );
}
