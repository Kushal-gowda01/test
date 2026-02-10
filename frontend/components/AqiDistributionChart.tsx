import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { AQI_SCALE } from '@both/aqi-utils';

interface CategoryData {
  category: string;
  count: number;
}

interface AqiDistributionChartProps {
  data: CategoryData[];
  height?: number;
}

const categoryLabels: Record<string, string> = {
  GOOD: 'Good',
  MODERATE: 'Moderate',
  UNHEALTHY_SENSITIVE: 'Sensitive',
  UNHEALTHY: 'Unhealthy',
  VERY_UNHEALTHY: 'Very Unhealthy',
  HAZARDOUS: 'Hazardous',
};

const categoryColors: Record<string, string> = {
  GOOD: '#00e400',
  MODERATE: '#ffff00',
  UNHEALTHY_SENSITIVE: '#ff7e00',
  UNHEALTHY: '#ff0000',
  VERY_UNHEALTHY: '#8f3f97',
  HAZARDOUS: '#7e0023',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1a1a2e] rounded-xl shadow-lg border border-white/10 p-3">
      <p className="font-medium text-sm" style={{ color: categoryColors[d.category] }}>
        {categoryLabels[d.category] || d.category}
      </p>
      <p className="text-xs text-gray-400 mt-1">{d.count} readings in 24h</p>
    </div>
  );
}

export default function AqiDistributionChart({ data, height = 250 }: AqiDistributionChartProps) {
  // Ensure all categories are represented
  const allCategories = AQI_SCALE.map((s) => s.category);
  const chartData = allCategories.map((cat) => ({
    category: cat,
    label: categoryLabels[cat] || cat,
    count: data.find((d) => d.category === cat)?.count || 0,
  }));

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">AQI Category Distribution (24h)</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {chartData.map((entry) => (
              <Cell key={entry.category} fill={categoryColors[entry.category] || '#ccc'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
