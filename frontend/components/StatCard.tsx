import React from 'react';
import { cn } from '@both/utils';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string };
}

export default function StatCard({ title, value, subtitle, icon, color = '#3b82f6', trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend.value >= 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
            )}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
