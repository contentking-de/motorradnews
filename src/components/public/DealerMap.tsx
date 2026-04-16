"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DealerMapProps {
  lat: number;
  lon: number;
  name: string;
  address: string;
}

export function DealerMap({ lat, lon, name, address }: DealerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(el, { scrollWheelZoom: false }).setView([lat, lon], 15);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: "",
      html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:#E31E24;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22],
    });

    L.marker([lat, lon], { icon })
      .addTo(map)
      .bindPopup(
        `<strong style="font-size:14px">${name}</strong><br/><span style="color:#666;font-size:12px">${address}</span>`,
      )
      .openPopup();

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lon, name, address]);

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E5E5]">
      <div ref={containerRef} className="h-72 w-full sm:h-80" />
    </div>
  );
}
