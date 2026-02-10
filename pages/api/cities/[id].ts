import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@backend/lib/db';
import { getCache, setCache, CACHE_TTL } from '@backend/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'City ID required' });
  }

  try {
    const cacheKey = `city:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        aqiReadings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        tempReadings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        alerts: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    const result = {
      ...city,
      currentAqi: city.aqiReadings[0] || null,
      currentTemp: city.tempReadings[0] || null,
    };

    await setCache(cacheKey, result, CACHE_TTL.AQI_CURRENT);
    return res.status(200).json(result);
  } catch (error) {
    console.error('City API error:', error);
    return res.status(500).json({ error: 'Failed to fetch city' });
  }
}
