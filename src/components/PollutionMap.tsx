"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { StationReading, Location } from "@/lib/types";
import { aqiColor, aqiCategory } from "@/lib/demoData";

interface Props {
  locations: Location[];
  readings: StationReading[];
  onSelect?: (locationId: string) => void;
}

export default function PollutionMap({ locations, readings, onSelect }: Props) {
  const readingFor = (locId: string) => readings.find((r) => r.locationId === locId);

  return (
    <MapContainer center={[28.61, 77.21]} zoom={9.3} scrollWheelZoom style={{ height: "100%", width: "100%", borderRadius: "1rem" }}>
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {locations.map((loc) => {
        const r = readingFor(loc.id);
        if (!r) return null;
        const color = aqiColor(r.aqi);
        return (
          <CircleMarker
            key={loc.id}
            center={[loc.lat, loc.lng]}
            radius={10 + Math.min(14, r.aqi / 30)}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.55, weight: 1.5 }}
            eventHandlers={{ click: () => onSelect?.(loc.id) }}
          >
            <Popup>
              <div className="text-xs text-void-950">
                <p className="font-bold">{loc.name}</p>
                <p>AQI: {r.aqi} ({aqiCategory(r.aqi)})</p>
                <p>PM2.5: {r.pm25} µg/m³</p>
                <p>PM10: {r.pm10} µg/m³</p>
                <p>NO₂: {r.no2} µg/m³</p>
                <p>Temp: {r.temperature}°C · Wind: {r.windSpeed} km/h</p>
                <p className="mt-1 text-[10px] text-void-600">Updated {new Date(r.timestamp).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
