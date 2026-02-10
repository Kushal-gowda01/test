import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@backend/lib/db';
import { getCache, setCache, CACHE_TTL } from '@backend/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cacheKey = 'cities:list';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' },
      include: {
        aqiReadings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
          select: {
            aqi: true,
            category: true,
            recordedAt: true,
          },
        },
        tempReadings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
          select: {
            temperature: true,
            humidity: true,
            recordedAt: true,
          },
        },
        _count: {
          select: {
            alerts: { where: { isActive: true } },
          },
        },
      },
    });

    const result = cities.map((city) => ({
      id: city.id,
      name: city.name,
      state: city.state,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      currentAqi: city.aqiReadings[0] || null,
      currentTemp: city.tempReadings[0] || null,
      activeAlerts: city._count.alerts,
    }));

    await setCache(cacheKey, result, CACHE_TTL.CITY_LIST);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Cities API error:', error);
    return res.status(500).json({ error: 'Failed to fetch cities' });
  }
}
