import { AqiCategory } from '@prisma/client';

export interface AqiInfo {
  category: AqiCategory;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  healthAdvice: string;
  emoji: string;
  range: [number, number];
}

export const AQI_SCALE: AqiInfo[] = [
  {
    category: 'GOOD',
    label: 'Good',
    color: '#00e400',
    bgColor: 'bg-green-500',
    textColor: 'text-green-700',
    healthAdvice: 'Air quality is satisfactory. Enjoy outdoor activities!',
    emoji: '😊',
    range: [0, 50],
  },
  {
    category: 'MODERATE',
    label: 'Moderate',
    color: '#ffff00',
    bgColor: 'bg-yellow-400',
    textColor: 'text-yellow-700',
    healthAdvice: 'Air quality is acceptable. Unusually sensitive people should limit prolonged outdoor exertion.',
    emoji: '😐',
    range: [51, 100],
  },
  {
    category: 'UNHEALTHY_SENSITIVE',
    label: 'Unhealthy for Sensitive Groups',
    color: '#ff7e00',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-700',
    healthAdvice: 'Members of sensitive groups may experience health effects. General public is less likely to be affected.',
    emoji: '😷',
    range: [101, 150],
  },
  {
    category: 'UNHEALTHY',
    label: 'Unhealthy',
    color: '#ff0000',
    bgColor: 'bg-red-500',
    textColor: 'text-red-700',
    healthAdvice: 'Everyone may begin to experience health effects. Sensitive groups may experience more serious effects.',
    emoji: '🤢',
    range: [151, 200],
  },
  {
    category: 'VERY_UNHEALTHY',
    label: 'Very Unhealthy',
    color: '#8f3f97',
    bgColor: 'bg-purple-600',
    textColor: 'text-purple-700',
    healthAdvice: 'Health alert: everyone may experience more serious health effects. Avoid outdoor activities.',
    emoji: '😨',
    range: [201, 300],
  },
  {
    category: 'HAZARDOUS',
    label: 'Hazardous',
    color: '#7e0023',
    bgColor: 'bg-rose-900',
    textColor: 'text-rose-900',
    healthAdvice: 'Health warning of emergency conditions. The entire population is likely to be affected. Stay indoors!',
    emoji: '☠️',
    range: [301, 500],
  },
];

export function getAqiInfo(aqi: number): AqiInfo {
  return AQI_SCALE.find((s) => aqi >= s.range[0] && aqi <= s.range[1]) || AQI_SCALE[5];
}

export function getAqiInfoByCategory(category: AqiCategory): AqiInfo {
  return AQI_SCALE.find((s) => s.category === category) || AQI_SCALE[0];
}

export function formatAqi(aqi: number): string {
  return aqi.toString().padStart(3, '0');
}

export function getAqiGradient(aqi: number): string {
  const info = getAqiInfo(aqi);
  return `linear-gradient(135deg, ${info.color}33, ${info.color}11)`;
}
