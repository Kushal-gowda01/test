import prisma from './db';

// ─── AQI helpers ───────────────────────────────
type AqiCat = 'GOOD' | 'MODERATE' | 'UNHEALTHY_SENSITIVE' | 'UNHEALTHY' | 'VERY_UNHEALTHY' | 'HAZARDOUS';

function classifyAqi(aqi: number): AqiCat {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'MODERATE';
  if (aqi <= 150) return 'UNHEALTHY_SENSITIVE';
  if (aqi <= 200) return 'UNHEALTHY';
  if (aqi <= 300) return 'VERY_UNHEALTHY';
  return 'HAZARDOUS';
}

// ─── WAQI (aqicn.org) — AQI Data ───────────────
interface WaqiFeed {
  status: string;
  data: {
    aqi: number;
    iaqi?: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
    };
    time?: { iso: string };
  };
}

async function fetchAqiFromWaqi(lat: number, lng: number, token: string): Promise<WaqiFeed | null> {
  try {
    const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`;
    const res = await fetch(url);
    const json = (await res.json()) as WaqiFeed;
    if (json.status === 'ok' && json.data && typeof json.data.aqi === 'number') {
      return json;
    }
    return null;
  } catch (e) {
    console.error(`WAQI fetch failed for (${lat},${lng}):`, e);
    return null;
  }
}

// ─── OpenWeatherMap — Temperature Data ─────────
interface OwmResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
}

async function fetchTempFromOwm(lat: number, lng: number, apiKey: string): Promise<OwmResponse | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    const json = (await res.json()) as OwmResponse;
    if (json.main) return json;
    return null;
  } catch (e) {
    console.error(`OWM fetch failed for (${lat},${lng}):`, e);
    return null;
  }
}

// ─── Alert generation ──────────────────────────
function generateAlerts(aqi: number, temp: number | null, cityId: string) {
  const alerts: {
    cityId: string;
    type: 'AQI_SPIKE' | 'AQI_SUSTAINED_HIGH' | 'TEMPERATURE_EXTREME' | 'HEALTH_ADVISORY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
  }[] = [];

  if (aqi > 300) {
    alerts.push({
      cityId,
      type: 'AQI_SPIKE',
      severity: 'CRITICAL',
      message: `Hazardous AQI of ${aqi} detected. Stay indoors and avoid all outdoor activity.`,
    });
  } else if (aqi > 200) {
    alerts.push({
      cityId,
      type: 'AQI_SPIKE',
      severity: 'HIGH',
      message: `Very unhealthy AQI of ${aqi}. Sensitive groups should stay indoors.`,
    });
  } else if (aqi > 150) {
    alerts.push({
      cityId,
      type: 'HEALTH_ADVISORY',
      severity: 'MEDIUM',
      message: `Unhealthy AQI of ${aqi}. Reduce prolonged outdoor exertion.`,
    });
  }

  if (temp !== null) {
    if (temp > 45) {
      alerts.push({ cityId, type: 'TEMPERATURE_EXTREME', severity: 'CRITICAL', message: `Extreme heat: ${temp.toFixed(1)}°C. Heat stroke risk is very high.` });
    } else if (temp < -15) {
      alerts.push({ cityId, type: 'TEMPERATURE_EXTREME', severity: 'HIGH', message: `Extreme cold: ${temp.toFixed(1)}°C. Risk of frostbite and hypothermia.` });
    }
  }

  return alerts;
}

// ─── Main fetch function ───────────────────────
export interface FetchResult {
  total: number;
  success: number;
  failed: number;
  alerts: number;
  details: { city: string; aqi: number | null; temp: number | null; error?: string }[];
}

export async function fetchLiveData(): Promise<FetchResult> {
  const waqiToken = process.env.WAQI_API_TOKEN;
  const owmKey = process.env.OWM_API_KEY;

  if (!waqiToken) throw new Error('Missing WAQI_API_TOKEN in .env');
  if (!owmKey) throw new Error('Missing OWM_API_KEY in .env');

  const cities = await prisma.city.findMany();
  const result: FetchResult = { total: cities.length, success: 0, failed: 0, alerts: 0, details: [] };

  // Deactivate old alerts before fetching fresh ones
  await prisma.alert.updateMany({ where: { isActive: true }, data: { isActive: false, endedAt: new Date() } });

  for (const city of cities) {
    const now = new Date();

    try {
      // Fetch AQI
      const waqi = await fetchAqiFromWaqi(city.latitude, city.longitude, waqiToken);
      // Fetch temperature
      const owm = await fetchTempFromOwm(city.latitude, city.longitude, owmKey);

      if (!waqi) {
        result.failed++;
        result.details.push({ city: city.name, aqi: null, temp: null, error: 'WAQI returned no data' });
        continue;
      }

      const aqi = waqi.data.aqi;
      const iaqi = waqi.data.iaqi ?? {};
      const category = classifyAqi(aqi);

      // Store AQI reading
      await prisma.aqiReading.create({
        data: {
          cityId: city.id,
          aqi,
          pm25: iaqi.pm25?.v ?? null,
          pm10: iaqi.pm10?.v ?? null,
          o3: iaqi.o3?.v ?? null,
          no2: iaqi.no2?.v ?? null,
          so2: iaqi.so2?.v ?? null,
          co: iaqi.co?.v ?? null,
          category,
          recordedAt: now,
          source: 'waqi-live',
        },
      });

      // Store temperature reading
      let temp: number | null = null;
      if (owm) {
        temp = owm.main.temp;
        await prisma.temperatureReading.create({
          data: {
            cityId: city.id,
            temperature: owm.main.temp,
            humidity: owm.main.humidity,
            feelsLike: owm.main.feels_like,
            recordedAt: now,
            source: 'openweathermap-live',
          },
        });
      }

      // Generate alerts
      const alerts = generateAlerts(aqi, temp, city.id);
      if (alerts.length > 0) {
        await prisma.alert.createMany({ data: alerts });
        result.alerts += alerts.length;
      }

      result.success++;
      result.details.push({ city: city.name, aqi, temp });

      // Small delay to respect rate limits (WAQI free: ~1000/min, OWM free: 60/min)
      await new Promise((r) => setTimeout(r, 1100));
    } catch (e: unknown) {
      result.failed++;
      const msg = e instanceof Error ? e.message : String(e);
      result.details.push({ city: city.name, aqi: null, temp: null, error: msg });
    }
  }

  return result;
}
