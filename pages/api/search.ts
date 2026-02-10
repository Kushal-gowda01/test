import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@backend/lib/db';
import { getCache, setCache } from '@backend/lib/redis';

interface WaqiSearchStation {
  uid: number;
  aqi: string;
  station: { name: string; geo: [number, number]; url: string; country: string };
}

interface WaqiSearchResponse {
  status: string;
  data: WaqiSearchStation[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { q } = req.query;
  if (!q || typeof q !== 'string' || q.length < 1) {
    return res.status(400).json({ error: 'Query required' });
  }

  try {
    const cacheKey = `search:${q.toLowerCase()}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    // 1) Search local database first
    const localCities = await prisma.city.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
          { state: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, state: true, country: true },
    });

    // 2) Also search WAQI API for global stations
    const waqiToken = process.env.WAQI_API_TOKEN;
    let waqiResults: { id: string; name: string; state: string | null; country: string; isLive: boolean; uid: number; lat: number; lng: number }[] = [];

    if (waqiToken && q.length >= 2) {
      try {
        const waqiRes = await fetch(`https://api.waqi.info/search/?keyword=${encodeURIComponent(q)}&token=${waqiToken}`);
        const waqiJson = (await waqiRes.json()) as WaqiSearchResponse;

        if (waqiJson.status === 'ok' && waqiJson.data) {
          // Deduplicate against local results by name
          const localNames = new Set(localCities.map(c => c.name.toLowerCase()));

          waqiResults = waqiJson.data
            .filter(s => s.station.geo && s.station.geo[0] && s.station.geo[1])
            .filter(s => {
              const stationName = extractCityName(s.station.name);
              return !localNames.has(stationName.toLowerCase());
            })
            .slice(0, 15)
            .map(s => ({
              id: `waqi-${s.uid}`,
              name: extractCityName(s.station.name),
              state: extractRegion(s.station.name),
              country: s.station.country || extractCountry(s.station.name),
              isLive: true,
              uid: s.uid,
              lat: s.station.geo[0],
              lng: s.station.geo[1],
            }));

          // Deduplicate waqi results by name
          const seen = new Set<string>();
          waqiResults = waqiResults.filter(r => {
            const key = r.name.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }
      } catch (e) {
        console.warn('WAQI search failed:', e);
      }
    }

    // 3) Merge: local first, then WAQI discoveries
    const combined = [
      ...localCities.map(c => ({ ...c, isLive: false })),
      ...waqiResults.slice(0, Math.max(0, 15 - localCities.length)),
    ];

    await setCache(cacheKey, combined, 30);
    return res.status(200).json(combined);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Search failed' });
  }
}

/** Extract city name from WAQI station string like "Delhi, India" or "US Embassy, Beijing" */
function extractCityName(stationName: string): string {
  // WAQI format: "City Name, Region, Country" or "Station Name, City"
  const parts = stationName.split(',').map(s => s.trim());
  // Remove common prefixes like "US Embassy" / "Consulate"
  let name = parts[0];
  if (parts.length > 1 && /embassy|consulate|monitor|station/i.test(name)) {
    name = parts[1];
  }
  return name;
}

function extractRegion(stationName: string): string | null {
  const parts = stationName.split(',').map(s => s.trim());
  return parts.length >= 3 ? parts[1] : null;
}

function extractCountry(stationName: string): string {
  const parts = stationName.split(',').map(s => s.trim());
  return parts[parts.length - 1] || 'Unknown';
}
