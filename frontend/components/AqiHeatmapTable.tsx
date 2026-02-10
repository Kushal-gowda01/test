import React from 'react';
import { getAqiInfo } from '@both/aqi-utils';

interface CityAqiData {
  id: string;
  name: string;
  state?: string | null;
  currentAqi: number | null;
  category?: string | null;
  latitude: number;
  longitude: number;
}

interface AqiHeatmapTableProps {
  cities: CityAqiData[];
}

export default function AqiHeatmapTable({ cities }: AqiHeatmapTableProps) {
  const sorted = [...cities]
    .filter((c) => c.currentAqi !== null)
    .sort((a, b) => (b.currentAqi ?? 0) - (a.currentAqi ?? 0));

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">City AQI Rankings</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Rank</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium">City</th>
              <th className="text-center py-3 px-2 text-gray-500 font-medium">AQI</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium hidden sm:table-cell">
                Level
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((city, idx) => {
              const aqi = city.currentAqi ?? 0;
              const info = getAqiInfo(aqi);
              const barWidth = Math.min((aqi / 500) * 100, 100);

              return (
                <tr
                  key={city.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-2 text-gray-500 font-mono">#{idx + 1}</td>
                  <td className="py-3 px-2">
                    <div>
                      <span className="font-medium text-white">{city.name}</span>
                      {city.state && (
                        <span className="text-gray-500 text-xs ml-1">({city.state})</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className="inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold text-sm text-white"
                      style={{ backgroundColor: info.color }}
                    >
                      {aqi}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-sm" style={{ color: info.color }}>
                      {info.emoji} {info.label}
                    </span>
                  </td>
                  <td className="py-3 px-2 hidden sm:table-cell">
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%`, backgroundColor: info.color }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
