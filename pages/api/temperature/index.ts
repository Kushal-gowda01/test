import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@backend/lib/db';
import { getCache, setCache, CACHE_TTL } from '@backend/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cityId, period = '24h' } = req.query;

  try {
    const cacheKey = `temp:${cityId || 'all'}:${period}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '24h':
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }

    const where: Record<string, unknown> = {
      recordedAt: { gte: startDate },
    };

    if (cityId && typeof cityId === 'string') {
      where.cityId = cityId;
    }

    const readings = await prisma.temperatureReading.findMany({
      where,
      orderBy: { recordedAt: 'asc' },
      include: {
        city: {
          select: { name: true },
        },
      },
    });

    const temps = readings.map((r) => r.temperature);
    const stats = {
      count: readings.length,
      average: temps.length ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10 : 0,
      max: temps.length ? Math.max(...temps) : 0,
      min: temps.length ? Math.min(...temps) : 0,
      latest: readings[readings.length - 1] || null,
    };

    const result = { readings, stats };
    await setCache(cacheKey, result, CACHE_TTL.TEMPERATURE);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Temperature API error:', error);
    return res.status(500).json({ error: 'Failed to fetch temperature data' });
  }
}
