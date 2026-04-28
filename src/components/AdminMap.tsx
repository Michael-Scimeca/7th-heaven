"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function AdminMap({ locations }: { locations: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-[400px] bg-black/40 rounded-xl animate-pulse" />;

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
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <MapContainer 
        center={[39.8283, -98.5795]} 
        zoom={4} 
        style={{ height: '100%', width: '100%', background: '#0f0f13' }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
      >
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
                  <p className="font-bold text-[0.7rem] uppercase tracking-wider text-black m-0">{loc.city}</p>
                  <p className="text-black/70 text-[0.6rem] m-0">{loc.percentage}% of Traffic</p>
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
  );
}
