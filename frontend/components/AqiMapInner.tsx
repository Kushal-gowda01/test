import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { getAqiInfo } from '@both/aqi-utils';
import 'leaflet/dist/leaflet.css';

interface CityMapData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  currentAqi: number | null;
  category?: string | null;
  temperature?: number | null;
}

interface AqiMapInnerProps {
  cities: CityMapData[];
  height?: number;
}

export default function AqiMapInner({ cities, height = 400 }: AqiMapInnerProps) {
  // Center on world
  const center: [number, number] = [20, 0];

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 pb-2">
        <h3 className="text-lg font-semibold text-white">AQI Map — World</h3>
        <p className="text-xs text-gray-500">Circle size and color indicate AQI level</p>
      </div>
      <MapContainer
        center={center}
        zoom={2}
        style={{ height: `${height}px`, width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {cities.map((city) => {
          const aqi = city.currentAqi ?? 0;
          const info = getAqiInfo(aqi);
          const radius = Math.max(8, Math.min(aqi / 10, 30));

          return (
            <CircleMarker
              key={city.id}
              center={[city.latitude, city.longitude]}
              radius={radius}
              pathOptions={{
                color: info.color,
                fillColor: info.color,
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-center min-w-[140px]">
                  <p className="font-bold text-base">{city.name}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: info.color }}>
                    {aqi}
                  </p>
                  <p className="text-xs" style={{ color: info.color }}>
                    {info.emoji} {info.label}
                  </p>
                  {city.temperature !== null && city.temperature !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">🌡️ {city.temperature.toFixed(1)}°C</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
