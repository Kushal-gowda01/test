import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { AQI_SCALE } from '@both/aqi-utils';

interface AqiReading {
  aqi: number;
  recordedAt: string;
  pm25?: number;
  pm10?: number;
}

interface AqiChartProps {
  data: AqiReading[];
  height?: number;
  showPollutants?: boolean;
  title?: string;
}

function formatTimeLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getAqiColor(aqi: number): string {
  const scale = AQI_SCALE.find((s) => aqi >= s.range[0] && aqi <= s.range[1]);
  return scale?.color || '#7e0023';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const aqi = payload[0]?.value;
  const color = getAqiColor(aqi);

  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg border border-white/10 p-3 min-w-[180px]">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-bold text-lg" style={{ color }}>
          AQI {aqi}
        </span>
      </div>
      {payload[1] && (
        <p className="text-xs text-gray-400 mt-1">
          PM2.5: {payload[1]?.value?.toFixed(1)} µg/m³
        </p>
      )}
      {payload[2] && (
        <p className="text-xs text-gray-400">
          PM10: {payload[2]?.value?.toFixed(1)} µg/m³
        </p>
      )}
    </div>
  );
}

export default function AqiChart({ data, height = 300, showPollutants = false, title }: AqiChartProps) {
  const isLongRange = data.length > 50;

  const chartData = data.map((d) => ({
    ...d,
    time: isLongRange ? formatDateLabel(d.recordedAt) : formatTimeLabel(d.recordedAt),
  }));

  return (
    <div className="glass-card p-6">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            domain={[0, 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* AQI threshold reference lines */}
          <ReferenceLine y={50} stroke="#00e400" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={100} stroke="#ffff00" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={150} stroke="#ff7e00" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={200} stroke="#ff0000" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={300} stroke="#8f3f97" strokeDasharray="4 4" strokeOpacity={0.5} />

          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#aqiGradient)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />

          {showPollutants && (
            <>
              <Line type="monotone" dataKey="pm25" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="pm10" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
