import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useFetch } from '@frontend/hooks/useFetch';
import AqiGauge from '@frontend/components/AqiGauge';
import AqiChart from '@frontend/components/AqiChart';
import TemperatureChart from '@frontend/components/TemperatureChart';
import PollutantBreakdown from '@frontend/components/PollutantBreakdown';
import HealthRecommendations from '@frontend/components/HealthRecommendations';
import AlertsBanner from '@frontend/components/AlertsBanner';
import PeriodSelector from '@frontend/components/PeriodSelector';
import StatCard from '@frontend/components/StatCard';
import LoadingSkeleton from '@frontend/components/LoadingSkeleton';
import { getAqiInfo } from '@both/aqi-utils';
import { ArrowLeft, Wind, Thermometer, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function CityDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [period, setPeriod] = useState('24h');

  const { data: city, loading: cityLoading } = useFetch<any>(`/api/cities/${id}`, {
    enabled: !!id,
  });

  const { data: aqiData } = useFetch<any>(`/api/aqi?cityId=${id}&period=${period}`, {
    enabled: !!id,
  });

  const { data: tempData } = useFetch<any>(`/api/temperature?cityId=${id}&period=${period}`, {
    enabled: !!id,
  });

  if (cityLoading || !city) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="circle" />
        <LoadingSkeleton variant="chart" />
      </div>
    );
  }

  const currentAqi = city.currentAqi?.aqi ?? 0;
  const aqiInfo = getAqiInfo(currentAqi);
  const latestReading = city.currentAqi;

  return (
    <>
      <Head>
        <title>{city.name} — ClimateIQ</title>
      </Head>

      <div className="space-y-6">
        {/* Back + header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/cities" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800">{city.name}</h2>
              </div>
              <p className="text-sm text-gray-500 ml-6">
                {city.state && `${city.state}, `}{city.country}
              </p>
            </div>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Active alerts for this city */}
        {city.alerts && city.alerts.length > 0 && (
          <AlertsBanner
            alerts={city.alerts.map((a: { id: string; type: string; severity: string; message: string; isActive: boolean; startedAt: string }) => ({
              ...a,
              city: { name: city.name },
            }))}
          />
        )}

        {/* AQI overview row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big gauge */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center"
               style={{ background: `linear-gradient(135deg, ${aqiInfo.color}08, white)` }}>
            <AqiGauge aqi={currentAqi} size="lg" />
            <p className="text-sm text-gray-500 mt-4 text-center max-w-xs">
              {aqiInfo.healthAdvice}
            </p>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <StatCard
              title="Current AQI"
              value={currentAqi}
              subtitle={`${aqiInfo.emoji} ${aqiInfo.label}`}
              icon={<Wind className="w-5 h-5" />}
              color={aqiInfo.color}
            />
            <StatCard
              title="Temperature"
              value={city.currentTemp ? `${city.currentTemp.temperature.toFixed(1)}°C` : 'N/A'}
              subtitle={city.currentTemp?.humidity ? `Humidity: ${city.currentTemp.humidity.toFixed(0)}%` : ''}
              icon={<Thermometer className="w-5 h-5" />}
              color="#f97316"
            />
            <StatCard
              title="Period High"
              value={aqiData?.stats?.max ?? '—'}
              subtitle="Highest AQI recorded"
              icon={<TrendingUp className="w-5 h-5" />}
              color="#ef4444"
            />
            <StatCard
              title="Period Low"
              value={aqiData?.stats?.min ?? '—'}
              subtitle="Lowest AQI recorded"
              icon={<TrendingDown className="w-5 h-5" />}
              color="#22c55e"
            />
          </div>
        </div>

        {/* AQI trend chart */}
        <AqiChart
          data={aqiData?.readings ?? []}
          title={`AQI Trend — ${city.name} (${period})`}
          showPollutants={true}
          height={350}
        />

        {/* Pollutants + Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {latestReading && (
            <PollutantBreakdown
              data={{
                pm25: latestReading.pm25,
                pm10: latestReading.pm10,
                o3: latestReading.o3,
                no2: latestReading.no2,
                so2: latestReading.so2,
                co: latestReading.co,
              }}
            />
          )}
          <HealthRecommendations aqi={currentAqi} />
        </div>

        {/* Temperature chart */}
        <TemperatureChart
          data={tempData?.readings ?? []}
          title={`Temperature — ${city.name} (${period})`}
          height={280}
        />
      </div>
    </>
  );
}
