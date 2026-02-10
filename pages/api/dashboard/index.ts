import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@backend/lib/db';
import { getCache, setCache, CACHE_TTL } from '@backend/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cacheKey = 'dashboard:summary';
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Get all cities with latest readings
    const cities = await prisma.city.findMany({
      include: {
        aqiReadings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        tempReadings: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Active alerts count
    const activeAlerts = await prisma.alert.count({
      where: { isActive: true },
    });

    // Category distribution
    const categoryDistribution = await prisma.aqiReading.groupBy({
      by: ['category'],
      where: {
        recordedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      _count: { category: true },
    });

    // Worst and best cities
    const citySummaries = cities.map((city) => ({
      id: city.id,
      name: city.name,
      state: city.state,
      latitude: city.latitude,
      longitude: city.longitude,
      currentAqi: city.aqiReadings[0]?.aqi ?? null,
      category: city.aqiReadings[0]?.category ?? null,
      temperature: city.tempReadings[0]?.temperature ?? null,
      humidity: city.tempReadings[0]?.humidity ?? null,
      lastUpdated: city.aqiReadings[0]?.recordedAt ?? null,
    }));

    const sortedByAqi = [...citySummaries]
      .filter((c) => c.currentAqi !== null)
      .sort((a, b) => (b.currentAqi ?? 0) - (a.currentAqi ?? 0));

    const result = {
      totalCities: cities.length,
      activeAlerts,
      averageAqi: Math.round(
        sortedByAqi.reduce((sum, c) => sum + (c.currentAqi ?? 0), 0) / (sortedByAqi.length || 1)
      ),
      worstCity: sortedByAqi[0] || null,
      bestCity: sortedByAqi[sortedByAqi.length - 1] || null,
      cities: citySummaries,
      categoryDistribution: categoryDistribution.map((d) => ({
        category: d.category,
        count: d._count.category,
      })),
    };

    await setCache(cacheKey, result, CACHE_TTL.DASHBOARD_SUMMARY);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
