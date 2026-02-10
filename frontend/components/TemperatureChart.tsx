import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TempReading {
  temperature: number;
  humidity?: number;
  recordedAt: string;
}

interface TemperatureChartProps {
  data: TempReading[];
  height?: number;
  title?: string;
}

function formatTimeLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg border border-white/10 p-3 min-w-[160px]">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-orange-500">🌡️</span>
        <span className="font-bold text-lg text-white">{payload[0]?.value?.toFixed(1)}°C</span>
      </div>
      {payload[1] && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-blue-400">💧</span>
          <span className="text-sm text-gray-400">{payload[1]?.value?.toFixed(0)}% humidity</span>
        </div>
      )}
    </div>
  );
}

export default function TemperatureChart({ data, height = 250, title }: TemperatureChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    time: formatTimeLabel(d.recordedAt),
  }));

  return (
    <div className="glass-card p-6">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke="#3b82f6"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
