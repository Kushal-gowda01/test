import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchLiveData, FetchResult } from '@backend/lib/live-data';
import { invalidateCache } from '@backend/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  // Optional: protect with a secret key
  const secret = req.headers['x-api-secret'] || req.query.secret;
  const envSecret = process.env.FETCH_SECRET;
  if (envSecret && secret !== envSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🌍 Starting live data fetch...');
    const result: FetchResult = await fetchLiveData();

    // Invalidate Redis cache so dashboard shows fresh data
    await invalidateCache('cities:*');
    await invalidateCache('aqi:*');
    await invalidateCache('dashboard:*');
    await invalidateCache('temperature:*');
    await invalidateCache('alerts:*');
    await invalidateCache('search:*');

    console.log(`✅ Done: ${result.success}/${result.total} cities updated, ${result.alerts} alerts`);
    return res.status(200).json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('❌ Live fetch error:', msg);
    return res.status(500).json({ error: msg });
  }
}
