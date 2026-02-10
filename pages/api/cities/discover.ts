import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@backend/lib/db';
import { invalidateCache } from '@backend/lib/redis';

type AqiCat = 'GOOD' | 'MODERATE' | 'UNHEALTHY_SENSITIVE' | 'UNHEALTHY' | 'VERY_UNHEALTHY' | 'HAZARDOUS';

function classifyAqi(aqi: number): AqiCat {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'MODERATE';
  if (aqi <= 150) return 'UNHEALTHY_SENSITIVE';
  if (aqi <= 200) return 'UNHEALTHY';
  if (aqi <= 300) return 'VERY_UNHEALTHY';
  return 'HAZARDOUS';
}

/**
 * POST /api/cities/discover
 * Body: { name, country, state?, lat, lng, waqiUid }
 *
 * Creates the city in DB if it doesn't exist, fetches live AQI + temp,
 * and returns the city with current readings — just like /api/cities/[id].
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { name, country, state, lat, lng, waqiUid } = req.body;

  if (!name || !country || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, country, lat, lng' });
  }

  const waqiToken = process.env.WAQI_API_TOKEN;
  const owmKey = process.env.OWM_API_KEY;

  try {
    // 1) Upsert city into database
    let city = await prisma.city.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, country: { equals: country, mode: 'insensitive' } },
    });

    if (!city) {
      city = await prisma.city.create({
        data: {
          name,
          state: state || null,
          country,
          latitude: lat,
          longitude: lng,
        },
      });
      console.log(`🌍 Discovered new city: ${name}, ${country}`);
    }

    const now = new Date();

    // 2) Fetch live AQI from WAQI
    if (waqiToken) {
      try {
        const url = waqiUid
          ? `https://api.waqi.info/feed/@${waqiUid}/?token=${waqiToken}`
          : `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${waqiToken}`;

        const waqiRes = await fetch(url);
        const waqiJson = await waqiRes.json();

        if (waqiJson.status === 'ok' && waqiJson.data && typeof waqiJson.data.aqi === 'number') {
          const iaqi = waqiJson.data.iaqi || {};
          await prisma.aqiReading.create({
            data: {
              cityId: city.id,
              aqi: waqiJson.data.aqi,
              pm25: iaqi.pm25?.v ?? null,
              pm10: iaqi.pm10?.v ?? null,
              o3: iaqi.o3?.v ?? null,
              no2: iaqi.no2?.v ?? null,
              so2: iaqi.so2?.v ?? null,
              co: iaqi.co?.v ?? null,
              category: classifyAqi(waqiJson.data.aqi),
              recordedAt: now,
              source: 'waqi-live',
            },
          });
        }
      } catch (e) {
        console.warn(`WAQI fetch failed for ${name}:`, e);
      }
    }

    // 3) Fetch live temperature from OpenWeatherMap
    if (owmKey) {
      try {
        const owmRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${owmKey}&units=metric`
        );
        const owmJson = await owmRes.json();

        if (owmJson.main) {
          await prisma.temperatureReading.create({
            data: {
              cityId: city.id,
              temperature: owmJson.main.temp,
              humidity: owmJson.main.humidity,
              feelsLike: owmJson.main.feels_like,
              recordedAt: now,
              source: 'openweathermap-live',
            },
          });
        }
      } catch (e) {
        console.warn(`OWM fetch failed for ${name}:`, e);
      }
    }

    // 4) Return city with latest readings (same shape as /api/cities/[id])
    const fullCity = await prisma.city.findUnique({
      where: { id: city.id },
      include: {
        aqiReadings: { orderBy: { recordedAt: 'desc' }, take: 1 },
        tempReadings: { orderBy: { recordedAt: 'desc' }, take: 1 },
        alerts: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    const result = {
      ...fullCity,
      currentAqi: fullCity?.aqiReadings[0] || null,
      currentTemp: fullCity?.tempReadings[0] || null,
    };

    // Invalidate search cache so new city appears
    await invalidateCache('search:*');

    return res.status(200).json(result);
  } catch (error) {
    console.error('Discover city error:', error);
    return res.status(500).json({ error: 'Failed to discover city' });
  }
}
