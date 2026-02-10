import React, { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { useFetch } from '@frontend/hooks/useFetch';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Thermometer, Wind, TrendingUp, TrendingDown, Droplets, Clock, ChevronDown, X } from 'lucide-react';
import AqiGauge from '@frontend/components/AqiGauge';
import AqiChart from '@frontend/components/AqiChart';
import TemperatureChart from '@frontend/components/TemperatureChart';
import PollutantBreakdown from '@frontend/components/PollutantBreakdown';
import HealthRecommendations from '@frontend/components/HealthRecommendations';
import AlertsBanner from '@frontend/components/AlertsBanner';
import PeriodSelector from '@frontend/components/PeriodSelector';
import AqiScaleLegend from '@frontend/components/AqiScaleLegend';
import { getAqiInfo } from '@both/aqi-utils';
import { relativeTime } from '@both/utils';

interface SearchResult {
  id: string;
  name: string;
  state: string | null;
  country: string;
  isLive?: boolean;
  uid?: number;
  lat?: number;
  lng?: number;
}

const POPULAR_CITIES = ['London', 'New York', 'Delhi', 'Tokyo', 'Sydney', 'Paris', 'Beijing', 'São Paulo'];

export default function DashboardPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCityName, setSelectedCityName] = useState('');
  const [period, setPeriod] = useState('24h');
  const [discovering, setDiscovering] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [discoveredData, setDiscoveredData] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search debounce
  useEffect(() => {
    if (!query || query.length < 1) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
        setShowResults(true);
      } catch { setResults([]); }
      setSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectCity = async (city: SearchResult) => {
    setQuery('');
    setShowResults(false);
    setSelectedCityName(`${city.name}, ${city.country}`);
    setDiscoveredData(null);

    // If this is a WAQI-discovered city (not yet in our DB), create it first
    if (city.isLive && city.id.startsWith('waqi-')) {
      setDiscovering(true);
      try {
        const res = await axios.post('/api/cities/discover', {
          name: city.name,
          country: city.country,
          state: city.state,
          lat: city.lat,
          lng: city.lng,
          waqiUid: city.uid,
        });
        // The discover endpoint returns the city with live data
        setSelectedCity(res.data.id);
        setDiscoveredData(res.data);
      } catch (e) {
        console.error('Failed to discover city:', e);
      }
      setDiscovering(false);
    } else {
      setSelectedCity(city.id);
    }
  };

  const searchByName = async (name: string) => {
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(name)}`);
      if (res.data && res.data.length > 0) {
        selectCity(res.data[0]);
      }
    } catch {}
  };

  const clearCity = () => {
    setSelectedCity(null);
    setSelectedCityName('');
    setDiscoveredData(null);
  };

  // Fetch city detail data (skip if we already have discoveredData)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: fetchedCityData } = useFetch<any>(
    selectedCity && !discoveredData ? `/api/cities/${selectedCity}` : '',
    { enabled: !!selectedCity && !discoveredData }
  );

  // Use discovered data if available, otherwise use fetched data
  const cityData = discoveredData || fetchedCityData;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: aqiData } = useFetch<any>(
    selectedCity ? `/api/aqi?cityId=${selectedCity}&period=${period}` : '',
    { enabled: !!selectedCity }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tempData } = useFetch<any>(
    selectedCity ? `/api/temperature?cityId=${selectedCity}&period=${period}` : '',
    { enabled: !!selectedCity }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: alerts } = useFetch<any[]>(
    selectedCity ? `/api/alerts?cityId=${selectedCity}` : '',
    { enabled: !!selectedCity }
  );

  const currentAqi = cityData?.currentAqi?.aqi ?? 0;
  const aqiInfo = getAqiInfo(currentAqi);
  const temp = cityData?.currentTemp?.temperature;
  const humidity = cityData?.currentTemp?.humidity;

  return (
    <>
      <Head>
        <title>Dashboard — AIR</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">AIR Dashboard</h1>
        </div>

        {/* Search Bar */}
        <div ref={searchRef} className="relative max-w-2xl mt-8 mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder="Search for a city... (e.g. London, Delhi, Tokyo)"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white
                         placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10
                         transition-all text-lg"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {showResults && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl overflow-hidden z-50 shadow-2xl"
              >
                {results.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => selectCity(city)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition-colors text-left"
                  >
                    <MapPin className={`w-4 h-4 shrink-0 ${city.isLive ? 'text-cyan-400' : 'text-emerald-400'}`} />
                    <span className="text-white font-medium">{city.name}</span>
                    <span className="text-gray-500 text-sm">
                      {city.state ? `${city.state}, ` : ''}{city.country}
                    </span>
                    {city.isLive && (
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        🌐 Live
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Discovering spinner */}
        {discovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Discovering {selectedCityName}…</h2>
            <p className="text-gray-400 text-sm">Fetching live air quality data from monitoring station</p>
          </motion.div>
        )}

        {/* No city selected — welcome state */}
        {!selectedCity && !discovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Welcome to AIR Dashboard</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Search any city worldwide to view real-time air quality data from 12,000+ monitoring stations
            </p>
            <div>
              <p className="text-sm text-gray-500 mb-4">Try searching for popular cities:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_CITIES.map((name) => (
                  <button
                    key={name}
                    onClick={() => searchByName(name)}
                    className="px-4 py-2 glass-card-hover rounded-xl text-sm text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* City selected — full AQI dashboard */}
        {selectedCity && !discovering && cityData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* City header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={clearCity} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
                <MapPin className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCityName}</h2>
                  {cityData.currentAqi?.recordedAt && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated {relativeTime(cityData.currentAqi.recordedAt)}
                    </p>
                  )}
                </div>
              </div>
              <PeriodSelector value={period} onChange={setPeriod} />
            </div>

            {/* Alerts */}
            {alerts && alerts.length > 0 && (
              <AlertsBanner
                alerts={alerts.map((a: { id: string; type: string; severity: string; message: string; isActive: boolean; startedAt: string }) => ({
                  ...a, city: { name: cityData.name },
                }))}
              />
            )}

            {/* Main AQI overview — big gauge + stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Large AQI gauge card */}
              <div className="lg:col-span-4 glass-card p-8 flex flex-col items-center justify-center"
                   style={{ background: `linear-gradient(135deg, ${aqiInfo.color}08, rgba(255,255,255,0.02))` }}>
                <AqiGauge aqi={currentAqi} size="lg" />
                <p className="text-sm text-gray-400 mt-4 text-center max-w-[250px] leading-relaxed">
                  {aqiInfo.healthAdvice}
                </p>
              </div>

              {/* AQI detail stats */}
              <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Current AQI */}
                <div className="glass-card p-5">
                  <Wind className="w-5 h-5 mb-2" style={{ color: aqiInfo.color }} />
                  <p className="text-3xl font-black text-white">{currentAqi}</p>
                  <p className="text-xs text-gray-500 mt-1">Current AQI</p>
                  <p className="text-xs font-medium mt-1" style={{ color: aqiInfo.color }}>
                    {aqiInfo.emoji} {aqiInfo.label}
                  </p>
                </div>

                {/* Temperature — just a number */}
                <div className="glass-card p-5">
                  <Thermometer className="w-5 h-5 text-orange-400 mb-2" />
                  <p className="text-3xl font-black text-white">
                    {temp !== null && temp !== undefined ? `${temp.toFixed(1)}°` : '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Temperature</p>
                  {humidity !== null && humidity !== undefined && (
                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> {humidity.toFixed(0)}%
                    </p>
                  )}
                </div>

                {/* Period High */}
                <div className="glass-card p-5">
                  <TrendingUp className="w-5 h-5 text-red-400 mb-2" />
                  <p className="text-3xl font-black text-white">{aqiData?.stats?.max ?? '—'}</p>
                  <p className="text-xs text-gray-500 mt-1">Peak AQI</p>
                  <p className="text-xs text-red-400/70 mt-1">Highest in {period}</p>
                </div>

                {/* Period Low */}
                <div className="glass-card p-5">
                  <TrendingDown className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-3xl font-black text-white">{aqiData?.stats?.min ?? '—'}</p>
                  <p className="text-xs text-gray-500 mt-1">Low AQI</p>
                  <p className="text-xs text-emerald-400/70 mt-1">Lowest in {period}</p>
                </div>

                {/* PM2.5 */}
                <div className="glass-card p-5">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center mb-2">
                    <span className="text-[10px] font-bold text-orange-400">PM</span>
                  </div>
                  <p className="text-3xl font-black text-white">
                    {cityData.currentAqi?.pm25?.toFixed(0) ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PM2.5 µg/m³</p>
                  <p className="text-xs text-orange-400/70 mt-1">Fine particles</p>
                </div>

                {/* PM10 */}
                <div className="glass-card p-5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                    <span className="text-[10px] font-bold text-blue-400">10</span>
                  </div>
                  <p className="text-3xl font-black text-white">
                    {cityData.currentAqi?.pm10?.toFixed(0) ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PM10 µg/m³</p>
                  <p className="text-xs text-blue-400/70 mt-1">Coarse particles</p>
                </div>

                {/* O3 */}
                <div className="glass-card p-5">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                    <span className="text-[10px] font-bold text-green-400">O₃</span>
                  </div>
                  <p className="text-3xl font-black text-white">
                    {cityData.currentAqi?.o3?.toFixed(0) ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Ozone ppb</p>
                  <p className="text-xs text-green-400/70 mt-1">Ground-level</p>
                </div>

                {/* NO2 */}
                <div className="glass-card p-5">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                    <span className="text-[10px] font-bold text-purple-400">NO₂</span>
                  </div>
                  <p className="text-3xl font-black text-white">
                    {cityData.currentAqi?.no2?.toFixed(0) ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">NO₂ ppb</p>
                  <p className="text-xs text-purple-400/70 mt-1">Nitrogen dioxide</p>
                </div>
              </div>
            </div>

            {/* AQI Trend Chart */}
            <AqiChart
              data={aqiData?.readings ?? []}
              title={`AQI Trend (${period})`}
              showPollutants={true}
              height={350}
            />

            {/* Pollutant Breakdown + Health Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cityData.currentAqi && (
                <PollutantBreakdown
                  data={{
                    pm25: cityData.currentAqi.pm25,
                    pm10: cityData.currentAqi.pm10,
                    o3: cityData.currentAqi.o3,
                    no2: cityData.currentAqi.no2,
                    so2: cityData.currentAqi.so2,
                    co: cityData.currentAqi.co,
                  }}
                />
              )}
              <HealthRecommendations aqi={currentAqi} />
            </div>

            {/* AQI Scale Reference */}
            <AqiScaleLegend />
          </motion.div>
        )}
      </div>
    </>
  );
}
