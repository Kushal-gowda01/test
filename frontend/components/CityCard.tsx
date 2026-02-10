import React from 'react';
import { getAqiInfo } from '@both/aqi-utils';
import { cn } from '@both/utils';
import { motion } from 'framer-motion';
import { Wind, Thermometer, AlertTriangle, MapPin } from 'lucide-react';
import Link from 'next/link';

interface CityCardProps {
  city: {
    id: string;
    name: string;
    state?: string | null;
    currentAqi?: { aqi: number; category: string } | null;
    currentTemp?: { temperature: number; humidity?: number } | null;
    activeAlerts?: number;
  };
  index?: number;
}

export default function CityCard({ city, index = 0 }: CityCardProps) {
  const aqi = city.currentAqi?.aqi ?? 0;
  const info = getAqiInfo(aqi);
  const temp = city.currentTemp?.temperature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/city/${city.id}`}>
        <div
          className={cn(
            'group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5',
            'hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer',
            'hover:-translate-y-1'
          )}
        >
          {/* AQI color accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
            style={{ backgroundColor: info.color }}
          />

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-800 text-lg">{city.name}</h3>
              </div>
              {city.state && (
                <p className="text-sm text-gray-500 ml-5.5">{city.state}</p>
              )}
            </div>

            {city.activeAlerts && city.activeAlerts > 0 ? (
              <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{city.activeAlerts}</span>
              </div>
            ) : null}
          </div>

          {/* AQI Display */}
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-16 h-16 rounded-xl flex flex-col items-center justify-center"
              style={{ backgroundColor: `${info.color}15`, border: `2px solid ${info.color}40` }}
            >
              <span className="text-xl font-bold" style={{ color: info.color }}>
                {aqi}
              </span>
              <span className="text-[10px] text-gray-500 uppercase">AQI</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4" style={{ color: info.color }} />
                <span className="font-medium text-sm" style={{ color: info.color }}>
                  {info.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{info.healthAdvice}</p>
            </div>
          </div>

          {/* Temperature */}
          {temp !== undefined && temp !== null && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
              <Thermometer className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                {temp.toFixed(1)}°C
              </span>
              {city.currentTemp?.humidity && (
                <span className="text-xs text-gray-400 ml-auto">
                  💧 {city.currentTemp.humidity.toFixed(0)}%
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
