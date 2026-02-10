import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@backend/lib/db';
import { getCache, setCache, CACHE_TTL } from '@backend/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cityId } = req.query;

  try {
    const cacheKey = `alerts:${cityId || 'all'}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const where: Record<string, unknown> = { isActive: true };
    if (cityId && typeof cityId === 'string') {
      where.cityId = cityId;
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        city: {
          select: { name: true, state: true },
        },
      },
    });

    await setCache(cacheKey, alerts, CACHE_TTL.AQI_CURRENT);
    return res.status(200).json(alerts);
  } catch (error) {
    console.error('Alerts API error:', error);
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}
