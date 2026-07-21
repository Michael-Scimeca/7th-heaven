"use client";

import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths (prevents missing marker issues)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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
        <div className="w-full h-[400px] bg-[#14141c]/60 border border-white/5 rounded-xl flex flex-col items-center justify-center gap-3">
          <p className="text-xs text-white/50">Map reloading...</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold uppercase rounded cursor-pointer border-none"
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
    if (isVisible) {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible, map]);
  return null;
}

export default function AdminMap({ locations, isVisible = true }: { locations: any[]; isVisible?: boolean }) {
  const [ready, setReady] = useState(false);
  const [mapKey, setMapKey] = useState("map-initial");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Delay rendering until next frame to ensure DOM is ready
    const raf = requestAnimationFrame(() => {
      setReady(true);
      setMapKey("map-" + Math.random().toString());
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!ready) return <div className="w-full h-[400px] bg-black/40 rounded-xl animate-pulse" />;

  // Map locations to coordinates
  const getCoordinates = (city: string): [number, number] => {
    const coords: Record<string, [number, number]> = {
      'Chicago, IL': [41.8781, -87.6298],
      'Nashville, TN': [36.1627, -86.7816],
      'Los Angeles, CA': [34.0522, -118.2437],
      'Dallas, TX': [32.7767, -96.7970],
    };
    return coords[city] || [39.8283, -98.5795]; // Default to US center
  };

  const getColor = (city: string) => {
    const colors: Record<string, string> = {
      'Chicago, IL': '#10b981', // Emerald
      'Nashville, TN': '#f59e0b', // Amber
      'Los Angeles, CA': '#a855f7', // Purple
      'Dallas, TX': '#4285F4', // Blue
    };
    return colors[city] || '#ec4899'; // Pink default
  };

  return (
    <MapErrorBoundary>
      <div ref={containerRef} className="w-full h-[400px] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <MapContainer 
          key={mapKey}
          center={[39.8283, -98.5795]} 
          zoom={4} 
          style={{ height: '100%', width: '100%', background: '#0f0f13' }}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
        >
          <MapResizeTrigger isVisible={isVisible} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {locations.map((loc) => {
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
                  fillOpacity: 0.6,
                  weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                  <div className="font-sans">
                    <p className="font-bold text-sm uppercase tracking-wider text-black m-0">{loc.city}</p>
                    <p className="text-black/70 text-xs m-0">{loc.percentage}% of Traffic</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
        
        <style jsx global>{`
          /* Overriding Leaflet styles to fit dark mode */
          .leaflet-container {
            background-color: #0f0f13 !important;
            font-family: inherit;
          }
          .leaflet-tooltip.custom-tooltip {
            background: rgba(255, 255, 255, 0.95);
            border: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            border-radius: 8px;
            padding: 8px 12px;
          }
          .leaflet-tooltip-top.custom-tooltip:before {
            border-top-color: rgba(255, 255, 255, 0.95);
          }
        `}</style>
      </div>
    </MapErrorBoundary>
  );
}
