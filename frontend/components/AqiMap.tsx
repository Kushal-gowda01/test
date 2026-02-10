import React from 'react';
import dynamic from 'next/dynamic';

// Leaflet must be loaded client-side only
const MapWithNoSSR = dynamic(() => import('./AqiMapInner'), {
  ssr: false,
  loading: () => (
    <div className="glass-card p-6 h-[400px] flex items-center justify-center">
      <div className="text-gray-500 animate-pulse">Loading map...</div>
    </div>
  ),
});

interface CityMapData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  currentAqi: number | null;
  category?: string | null;
  temperature?: number | null;
}

interface AqiMapProps {
  cities: CityMapData[];
  height?: number;
}

export default function AqiMap({ cities, height = 400 }: AqiMapProps) {
  return <MapWithNoSSR cities={cities} height={height} />;
}
