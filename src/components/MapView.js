"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import destinations from "@/data/destinations.json";

// Fix Leaflet's default icon paths in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const accentIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 11 16 28 16 28s16-17 16-28C32 7.16 24.84 0 16 0z" fill="#c8102e"/>
        <circle cx="16" cy="16" r="6" fill="#fcd116"/>
      </svg>`
    ),
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -40],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 9);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, points]);
  return null;
}

export default function MapView({ destinationIds = [] }) {
  const points = destinationIds
    .map((id) => destinations.find((d) => d.id === id))
    .filter(Boolean)
    .map((d) => ({
      id: d.id,
      name: d.name,
      region: d.region,
      lat: d.coordinates.lat,
      lng: d.coordinates.lng,
    }));

  const defaultCenter = [7.95, -1.03]; // roughly central Ghana
  const center = points[0] ? [points[0].lat, points[0].lng] : defaultCenter;

  return (
    <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        touchZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => {
          const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
          const gmapsView = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            p.name + ", Ghana"
          )}`;
          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={accentIcon}>
              <Popup>
                <strong>{p.name}</strong>
                <br />
                <span style={{ fontSize: "12px", color: "#6b6b6b" }}>
                  {p.region} Region
                </span>
                <br />
                <a
                  href={gmaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    marginRight: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#c8102e",
                    textDecoration: "underline",
                  }}
                >
                  🧭 Directions
                </a>
                <a
                  href={gmapsView}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#006b3f",
                    textDecoration: "underline",
                  }}
                >
                  📍 View on Google Maps
                </a>
              </Popup>
            </Marker>
          );
        })}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}
