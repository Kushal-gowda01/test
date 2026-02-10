import React from 'react';
import { AQI_SCALE } from '@both/aqi-utils';

export default function AqiScaleLegend() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">AQI Scale Reference</h3>
      <div className="space-y-3">
        {AQI_SCALE.map((level) => (
          <div key={level.category} className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: `${level.color}22`, border: `2px solid ${level.color}` }}
            >
              {level.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-white">{level.label}</span>
                <span className="text-xs text-gray-400">
                  ({level.range[0]}-{level.range[1]})
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{level.healthAdvice}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
