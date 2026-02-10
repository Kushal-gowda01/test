import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { AQI_SCALE } from '@both/aqi-utils';
import { motion } from 'framer-motion';
import { Activity, Heart, Leaf, Search, ArrowRight, Globe, Shield, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Multi-Factor Monitoring',
    desc: 'Track AQI, temperature, pollution levels across 12,000+ stations worldwide in real-time',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Heart,
    title: 'Health Impact',
    desc: 'Understand how environmental conditions affect your health with personalized recommendations',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Leaf,
    title: 'Community Awareness',
    desc: 'Learn sustainable practices and join a community making informed environmental decisions',
    color: 'from-emerald-500 to-green-500',
  },
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>AIR — Understand Your Air. Protect Your Health.</title>
      </Head>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm text-emerald-400 mb-8">
              <Globe className="w-4 h-4" />
              <span>12,000+ monitoring stations worldwide</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="gradient-text">Understand Your Air.</span>
              <br />
              <span className="text-white">Protect Your Health.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transform complex climate and environmental data into clear, visual, and
              actionable insights. Make informed decisions about your health and environment.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-lg">
                <Search className="w-5 h-5" />
                Check AQI
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/community" className="btn-ghost flex items-center gap-2">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card p-8 text-center group hover:bg-white/10 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <feat.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AQI Scale Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Understanding AQI Levels</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            The Air Quality Index tells you how clean or polluted your air is and what health effects might concern you.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {AQI_SCALE.map((level, i) => (
            <motion.div
              key={level.category}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 text-center hover:scale-105 transition-transform duration-300"
              style={{ borderColor: `${level.color}30` }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl"
                style={{ backgroundColor: `${level.color}15`, border: `2px solid ${level.color}40` }}
              >
                {level.emoji}
              </div>
              <p className="text-xs font-bold mb-1" style={{ color: level.color }}>
                AQI {level.range[0]}-{level.range[1]}
              </p>
              <p className="text-xs text-gray-400">{level.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass-card p-8 rounded-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '12K+', label: 'Stations Worldwide', icon: Globe },
              { value: '6', label: 'Continents', icon: BarChart3 },
              { value: '24/7', label: 'Real-time Data', icon: Activity },
              { value: '100%', label: 'Free & Open', icon: Shield },
            ].map((stat) => (
              <div key={stat.label}>
                <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-3xl font-black gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
