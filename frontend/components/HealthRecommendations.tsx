import React from 'react';
import { getAqiInfo } from '@both/aqi-utils';
import { cn } from '@both/utils';
import { Shield, Heart, Baby, PersonStanding, Bike, Home } from 'lucide-react';

interface HealthRecommendationsProps {
  aqi: number;
}

interface Recommendation {
  icon: React.ElementType;
  group: string;
  advice: string;
  urgency: 'safe' | 'caution' | 'warning' | 'danger';
}

function getRecommendations(aqi: number): Recommendation[] {
  if (aqi <= 50) {
    return [
      { icon: Bike, group: 'Everyone', advice: 'Great day for outdoor activities!', urgency: 'safe' },
      { icon: Baby, group: 'Children', advice: 'Safe to play outdoors freely.', urgency: 'safe' },
      { icon: Heart, group: 'Sensitive Groups', advice: 'No precautions needed.', urgency: 'safe' },
    ];
  }
  if (aqi <= 100) {
    return [
      { icon: Bike, group: 'Active Adults', advice: 'Outdoor activities are fine for most people.', urgency: 'safe' },
      { icon: Baby, group: 'Children & Elderly', advice: 'Limit prolonged heavy exertion outdoors.', urgency: 'caution' },
      { icon: Heart, group: 'Respiratory Issues', advice: 'Watch for symptoms like coughing or shortness of breath.', urgency: 'caution' },
    ];
  }
  if (aqi <= 200) {
    return [
      { icon: PersonStanding, group: 'General Public', advice: 'Reduce prolonged outdoor exertion.', urgency: 'caution' },
      { icon: Baby, group: 'Children & Elderly', advice: 'Avoid heavy outdoor activities. Keep windows closed.', urgency: 'warning' },
      { icon: Heart, group: 'Heart/Lung Patients', advice: 'Stay indoors. Use air purifiers if available.', urgency: 'warning' },
      { icon: Shield, group: 'Protection', advice: 'Wear N95 masks if going outdoors.', urgency: 'warning' },
    ];
  }
  return [
    { icon: Home, group: 'Everyone', advice: 'Stay indoors! Avoid all outdoor physical activity.', urgency: 'danger' },
    { icon: Shield, group: 'Protection', advice: 'Wear N95 mask if you must go outside. Seal windows and doors.', urgency: 'danger' },
    { icon: Heart, group: 'Vulnerable Groups', advice: 'Seek medical attention if experiencing breathing difficulty.', urgency: 'danger' },
    { icon: Baby, group: 'Children', advice: 'Keep children indoors. Schools should cancel outdoor activities.', urgency: 'danger' },
  ];
}

const urgencyStyles = {
  safe: 'bg-green-500/10 border-green-500/20 text-green-400',
  caution: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  warning: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  danger: 'bg-red-500/10 border-red-500/20 text-red-400',
};

export default function HealthRecommendations({ aqi }: HealthRecommendationsProps) {
  const info = getAqiInfo(aqi);
  const recommendations = getRecommendations(aqi);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${info.color}15` }}
        >
          <Shield className="w-5 h-5" style={{ color: info.color }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Health Recommendations</h3>
          <p className="text-xs text-gray-400">Based on current AQI of {aqi}</p>
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const Icon = rec.icon;
          return (
            <div
              key={idx}
              className={cn('flex items-start gap-3 p-3 rounded-xl border', urgencyStyles[rec.urgency])}
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{rec.group}</p>
                <p className="text-xs opacity-80 mt-0.5">{rec.advice}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
