import React from 'react';
import { getAqiInfo } from '@both/aqi-utils';
import { cn } from '@both/utils';
import { motion } from 'framer-motion';

interface AqiGaugeProps {
  aqi: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

export default function AqiGauge({ aqi, size = 'md', showLabel = true, animate = true }: AqiGaugeProps) {
  const info = getAqiInfo(aqi);

  const sizeMap = {
    sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-xs' },
    md: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-sm' },
    lg: { container: 'w-44 h-44', text: 'text-5xl', label: 'text-base' },
  };

  const s = sizeMap[size];

  // Calculate the gauge arc
  const percentage = Math.min(aqi / 500, 1);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - percentage);

  const Wrapper = animate ? motion.div : 'div';
  const wrapperProps = animate
    ? { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.5 } }
    : {};

  return (
    <Wrapper {...(wrapperProps as Record<string, unknown>)} className="flex flex-col items-center gap-2">
      <div className={cn('relative', s.container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/10"
          />
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={info.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', s.text)} style={{ color: info.color }}>
            {aqi}
          </span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">AQI</span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <span className={cn('font-semibold', s.label)} style={{ color: info.color }}>
            {info.emoji} {info.label}
          </span>
        </div>
      )}
    </Wrapper>
  );
}
