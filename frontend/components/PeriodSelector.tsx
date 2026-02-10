import React from 'react';
import { cn } from '@both/utils';

interface PeriodSelectorProps {
  value: string;
  onChange: (period: string) => void;
  options?: { value: string; label: string }[];
}

const defaultOptions = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function PeriodSelector({ value, onChange, options = defaultOptions }: PeriodSelectorProps) {
  return (
    <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            value === opt.value
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
