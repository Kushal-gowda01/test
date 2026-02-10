import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AQI_SCALE } from '@both/aqi-utils';

interface PollutantData {
  pm25?: number;
  pm10?: number;
  o3?: number;
  no2?: number;
  so2?: number;
  co?: number;
}

interface PollutantBreakdownProps {
  data: PollutantData;
}

const pollutantLabels: Record<string, { label: string; unit: string; color: string }> = {
  pm25: { label: 'PM2.5', unit: 'µg/m³', color: '#f97316' },
  pm10: { label: 'PM10', unit: 'µg/m³', color: '#3b82f6' },
  o3: { label: 'Ozone (O₃)', unit: 'ppb', color: '#22c55e' },
  no2: { label: 'NO₂', unit: 'ppb', color: '#8b5cf6' },
  so2: { label: 'SO₂', unit: 'ppb', color: '#ec4899' },
  co: { label: 'CO', unit: 'ppm', color: '#64748b' },
};

export default function PollutantBreakdown({ data }: PollutantBreakdownProps) {
  const chartData = Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      name: pollutantLabels[key]?.label || key,
      value: Number(value),
      color: pollutantLabels[key]?.color || '#ccc',
      unit: pollutantLabels[key]?.unit || '',
    }));

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Pollutant Breakdown</h3>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value.toFixed(1)}`, name]}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#1a1a2e',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  fontSize: '12px',
                  color: '#e5e7eb',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3 w-full">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div>
                <p className="text-xs text-gray-500">{item.name}</p>
                <p className="text-sm font-semibold text-white">
                  {item.value.toFixed(1)} <span className="text-xs text-gray-400 font-normal">{item.unit}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
