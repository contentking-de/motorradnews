"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface DealerPin {
  id: string;
  name: string;
  slug: string;
  brand: string;
  city: string;
  lat: number;
  lon: number;
}

interface AllDealersMapProps {
  dealers: DealerPin[];
}

const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];
const DEFAULT_ZOOM = 6;

function createPinIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#E31E24;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

export function AllDealersMap({ dealers }: AllDealersMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(el, { scrollWheelZoom: false }).setView(
      GERMANY_CENTER,
      DEFAULT_ZOOM,
    );
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    const icon = createPinIcon();
    const markers: L.Marker[] = [];

    for (const d of dealers) {
      const marker = L.marker([d.lat, d.lon], { icon })
        .addTo(map)
        .bindPopup(
          `<a href="/arider-haendler/${d.slug}" style="text-decoration:none">
            <strong style="font-size:14px;color:#111">${d.name}</strong>
          </a>
          <br/><span style="color:#666;font-size:12px">${d.brand} · ${d.city}</span>`,
        );
      markers.push(marker);
    }

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [dealers]);

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E5E5]">
      <div ref={containerRef} className="h-[350px] w-full sm:h-[420px]" />
    </div>
  );
}
