import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { getAqiInfo } from '@both/aqi-utils';
import {
  Heart, Shield, Factory, Leaf, Lightbulb, Users,
  TreePine, Droplets, Zap, Car, Wind, AlertTriangle,
  Sun, Bike, Recycle, Home, Eye, Thermometer
} from 'lucide-react';

const aqi = [
  { level: 'Good', range: '0–50', color: '#10b981', bg: 'from-emerald-500/10 to-emerald-500/5', icon: Heart, advice: 'Air quality is satisfactory. Ideal for outdoor activities.' },
  { level: 'Moderate', range: '51–100', color: '#eab308', bg: 'from-yellow-500/10 to-yellow-500/5', icon: Eye, advice: 'Acceptable quality. Unusually sensitive individuals should reduce outdoor exertion.' },
  { level: 'Unhealthy (Sensitive)', range: '101–150', color: '#f97316', bg: 'from-orange-500/10 to-orange-500/5', icon: AlertTriangle, advice: 'Members of sensitive groups may experience effects. Limit prolonged outdoor exertion.' },
  { level: 'Unhealthy', range: '151–200', color: '#ef4444', bg: 'from-red-500/10 to-red-500/5', icon: Shield, advice: 'Everyone may begin to experience health effects. Reduce outdoor activities.' },
  { level: 'Very Unhealthy', range: '201–300', color: '#8b5cf6', bg: 'from-purple-500/10 to-purple-500/5', icon: AlertTriangle, advice: 'Health alert — everyone may face serious health effects. Avoid outdoor exertion.' },
  { level: 'Hazardous', range: '301–500', color: '#be123c', bg: 'from-rose-800/10 to-rose-800/5', icon: AlertTriangle, advice: 'Emergency conditions. Entire population is likely to be affected. Stay indoors.' },
];

const pollutionSources = [
  { name: 'Vehicle Emissions', desc: 'Cars, trucks, and buses release nitrogen oxides, carbon monoxide, and particulate matter.', icon: Car, color: 'text-red-400' },
  { name: 'Industrial Activity', desc: 'Factories and power plants emit sulfur dioxide, heavy metals, and volatile organic compounds.', icon: Factory, color: 'text-orange-400' },
  { name: 'Construction Dust', desc: 'Building sites generate large amounts of PM10 and PM2.5 particles.', icon: Home, color: 'text-yellow-400' },
  { name: 'Agricultural Burning', desc: 'Crop residue burning releases carbon monoxide, ozone precursors, and black carbon.', icon: Zap, color: 'text-amber-400' },
  { name: 'Household Fuels', desc: 'Burning wood, coal, or kerosene indoors creates hazardous indoor air pollution.', icon: Lightbulb, color: 'text-purple-400' },
  { name: 'Natural Events', desc: 'Wildfires, dust storms, and volcanic eruptions contribute to temporary spikes in AQI.', icon: Wind, color: 'text-cyan-400' },
];

const sustainablePractices = [
  { title: 'Use public transport', desc: 'Reduces per-capita emissions by up to 45% compared to driving alone.', icon: Car },
  { title: 'Cycle or walk', desc: 'Zero-emission travel that also improves cardiovascular health.', icon: Bike },
  { title: 'Plant trees', desc: 'A single mature tree absorbs ~22 kg of CO₂ per year and filters particulates.', icon: TreePine },
  { title: 'Conserve energy', desc: 'Use energy-efficient appliances and turn off lights to reduce power plant emissions.', icon: Zap },
  { title: 'Reduce, reuse, recycle', desc: 'Proper waste management prevents open burning and landfill methane.', icon: Recycle },
  { title: 'Support clean energy', desc: 'Advocate for solar, wind, and hydroelectric power in your community.', icon: Sun },
];

const quickTips = [
  'Check AQI before morning exercise — air is often cleanest after rain.',
  'Indoor plants like snake plant and peace lily can help filter common pollutants.',
  'Use N95 masks on high-pollution days, not cloth masks.',
  'Keep windows closed when AQI exceeds 100. Use air purifiers indoors.',
  'Avoid exercising near heavy traffic — pollutant levels spike within 50 m of roads.',
  'Cook with exhaust fans on — indoor cooking can raise PM2.5 significantly.',
  'Wet-mop floors instead of sweeping to prevent resuspending dust.',
  'Humidity between 30–50% reduces particle suspension and mold growth.',
];

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5 },
};

export default function CommunityPage() {
  return (
    <>
      <Head><title>Community — AIR</title></Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24 space-y-20">
        {/* Hero */}
        <motion.section {...fadeIn} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
            <Users className="w-4 h-4" /> Community Knowledge
          </div>
          <h1 className="text-4xl md:text-5xl font-black gradient-text mb-4">
            Breathe Better, Live Better
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Learn about air quality, understand pollution sources, and discover what you can do to protect yourself and your community.
          </p>
        </motion.section>

        {/* Understanding AQI */}
        <motion.section {...fadeIn}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 rounded-xl flex items-center justify-center">
              <Wind className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Understanding AQI</h2>
          </div>
          <p className="text-gray-400 mb-8 max-w-3xl">
            The <span className="text-white font-medium">Air Quality Index (AQI)</span> is a standardised scale (0–500) used worldwide to communicate how polluted the air is.
            It factors in ground-level ozone (O₃), particulate matter (PM2.5 & PM10), carbon monoxide (CO), sulfur dioxide (SO₂), and nitrogen dioxide (NO₂).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aqi.map((a) => (
              <div key={a.level} className={`glass-card p-5 bg-gradient-to-br ${a.bg} border-l-4`} style={{ borderLeftColor: a.color }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{a.level}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5" style={{ color: a.color }}>
                    {a.range}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{a.advice}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Common Pollution Sources */}
        <motion.section {...fadeIn}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-white/10 rounded-xl flex items-center justify-center">
              <Factory className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Common Pollution Sources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pollutionSources.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="glass-card-hover p-5 group">
                  <Icon className={`w-6 h-6 ${s.color} mb-3 group-hover:scale-110 transition-transform`} />
                  <h3 className="text-white font-semibold mb-1">{s.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Protect Your Health */}
        <motion.section {...fadeIn}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Protect Your Health</h2>
          </div>
          <p className="text-gray-400 mb-6 max-w-3xl">
            Recommended actions for each AQI level — helping you stay safe no matter the conditions.
          </p>
          <div className="space-y-3">
            {aqi.map((a) => (
              <div key={a.level} className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-52">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                  <span className="text-white font-medium text-sm">{a.level}</span>
                </div>
                <p className="text-gray-400 text-sm">{a.advice}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Sustainable Practices */}
        <motion.section {...fadeIn}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Sustainable Practices</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sustainablePractices.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="glass-card-hover p-5 group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Quick Climate Tips */}
        <motion.section {...fadeIn}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Quick Climate Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickTips.map((tip, i) => (
              <div key={i} className="glass-card p-4 flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-sm mt-0.5 shrink-0">0{i + 1}</span>
                <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </>
  );
}
